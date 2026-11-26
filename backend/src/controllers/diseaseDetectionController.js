
const db = require("../config/db");

const ML_TIMEOUT_MS = 120000;
const ML_MAX_ATTEMPTS = 2;
const ML_RETRY_DELAY_MS = 1500;

const ALLOWED_CROPS = [
  "Rice",
  "Potato",
  "Tomato",
  "Maize",
];

class MLServiceError extends Error {
  constructor(message, status = 503, retryable = false) {
    super(message);
    this.name = "MLServiceError";
    this.status = status;
    this.retryable = retryable;
  }
}

function extractDiseaseName(result) {
  if (result.detection_status === "crop_mismatch") {
    return null;
  }

  return (
    result.disease_name ||
    result.predicted_disease ||
    result.predicted_class ||
    result.class_name ||
    result.condition ||
    result.disease ||
    result.label ||
    result.prediction?.disease_name ||
    result.prediction?.label ||
    null
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMLServiceUrl() {
  const configuredUrl = process.env.ML_SERVICE_URL;

  if (!configuredUrl) {
    throw new MLServiceError(
      "ML service URL is not configured.",
      503,
      false
    );
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new MLServiceError(
      "Invalid ML service URL configuration.",
      503,
      false
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new MLServiceError(
      "Unsupported ML service URL protocol.",
      503,
      false
    );
  }

  return configuredUrl.replace(/\/+$/, "");
}

function createPredictionForm(file) {
  const formData = new FormData();

  const imageBlob = new Blob(
    [file.buffer],
    { type: file.mimetype }
  );

  formData.append(
    "image",
    imageBlob,
    file.originalname || "plant-image.jpg"
  );

  return formData;
}

async function requestMLPrediction(mlUrl, file) {
  let lastError = null;

  for (
    let attempt = 1;
    attempt <= ML_MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      console.log(
        `ML prediction attempt ${attempt}/${ML_MAX_ATTEMPTS}`
      );

      const formData = createPredictionForm(file);

      const response = await fetch(mlUrl, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(ML_TIMEOUT_MS),
      });

      const contentType =
        response.headers.get("content-type") || "";

      const responseText = await response.text();

      const isJsonResponse =
        contentType.toLowerCase().includes("application/json") ||
        contentType.toLowerCase().includes("+json");

      let result = null;

      if (isJsonResponse) {
        try {
          result = JSON.parse(responseText);
        } catch {
          lastError = new MLServiceError(
            "ML service returned malformed JSON.",
            502,
            true
          );
        }
      } else {
        lastError = new MLServiceError(
          "ML service returned a non-JSON response.",
          502,
          true
        );
      }

      console.log("ML HTTP Status:", response.status);
      console.log("ML Content-Type:", contentType);

      if (!response.ok) {
        const errorMessage =
          result?.detail ||
          result?.message ||
          `ML service returned HTTP ${response.status}.`;

        const retryable =
          response.status === 408 ||
          response.status === 429 ||
          response.status >= 500;

        lastError = new MLServiceError(
          errorMessage,
          response.status,
          retryable
        );
      } else if (!isJsonResponse || result === null) {
        lastError =
          lastError ||
          new MLServiceError(
            "ML service returned an invalid response.",
            502,
            true
          );
      } else if (
        typeof result !== "object" ||
        Array.isArray(result)
      ) {
        lastError = new MLServiceError(
          "Unexpected ML response structure.",
          502,
          true
        );
      } else if (result.success !== true) {
        lastError = new MLServiceError(
          result.detail ||
          result.message ||
          "ML prediction was unsuccessful.",
          502,
          false
        );
      } else {
        return result;
      }

    } catch (error) {
      const isTimeout =
        error.name === "TimeoutError" ||
        error.name === "AbortError";

      lastError = new MLServiceError(
        isTimeout
          ? "ML prediction timed out."
          : "Unable to communicate with the ML service.",
        isTimeout ? 504 : 503,
        true
      );

      console.error(
        `ML attempt ${attempt} failed:`,
        error.message
      );
    }

    if (
      attempt < ML_MAX_ATTEMPTS &&
      lastError?.retryable
    ) {
      console.log("Retrying ML service request...");
      await sleep(ML_RETRY_DELAY_MS);
      continue;
    }

    break;
  }

  throw lastError || new MLServiceError(
    "ML prediction failed.",
    503,
    false
  );
}

exports.predictDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A leaf image is required.",
      });
    }

    const { crop } = req.body;

    if (!crop || !ALLOWED_CROPS.includes(crop)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid crop.",
      });
    }

    const mlServiceUrl = getMLServiceUrl();

    const mlUrl =
      `${mlServiceUrl}/predict?crop=${encodeURIComponent(crop)}`;

    console.log("ML Request URL:", mlUrl);
    console.log("Uploaded image:", req.file.originalname);
    console.log("Image MIME type:", req.file.mimetype);
    console.log("Image size:", req.file.size);

    const result = await requestMLPrediction(
      mlUrl,
      req.file
    );

    const diseaseName = extractDiseaseName(result);

    const confidence =
      result.confidence !== undefined &&
      result.confidence !== null &&
      Number.isFinite(Number(result.confidence))
        ? Number(result.confidence)
        : null;

    const detectionStatus =
      result.detection_status ||
      result.status ||
      "unknown";

    const diseaseDetected =
      typeof result.disease_detected === "boolean"
        ? result.disease_detected
          ? 1
          : 0
        : null;

    try {
      await db.query(
        `INSERT INTO disease_detection_history
        (
          farmer_id,
          crop_name,
          disease_name,
          confidence,
          detection_status,
          disease_detected,
          prediction_result
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          crop,
          diseaseName,
          confidence,
          detectionStatus,
          diseaseDetected,
          JSON.stringify(result),
        ]
      );

    } catch (databaseError) {
      console.error(
        "Disease History Save Error:",
        databaseError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Prediction completed, but history could not be saved.",
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error(
      "Disease Detection Error:",
      error.stack || error.message
    );

    if (error instanceof MLServiceError) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const isTimeout =
      error.name === "TimeoutError" ||
      error.name === "AbortError";

    return res.status(isTimeout ? 504 : 503).json({
      success: false,
      message: isTimeout
        ? "ML prediction timed out. Please try again."
        : "Unable to communicate with the ML service.",
    });
  }
};
