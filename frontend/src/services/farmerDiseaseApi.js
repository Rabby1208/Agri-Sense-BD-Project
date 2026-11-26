
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api"
).replace(/\/+$/, "");

const PREDICTION_TIMEOUT = 260000;

const diseaseClient = axios.create({
  baseURL: `${API_URL}/disease-detection`,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Attach authentication token.
diseaseClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agrisense_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Safely handle JSON, text and HTML responses.
function normalizeResponseData(data) {
  if (data && typeof data === "object") {
    return data;
  }

  if (typeof data !== "string") {
    throw new Error("The server returned an empty or invalid response.");
  }

  const trimmed = data.trim();

  if (!trimmed) {
    throw new Error("The server returned an empty response.");
  }

  // HTML error pages must never be treated as prediction results.
  if (
    trimmed.startsWith("<!") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<HTML")
  ) {
    throw new Error(
      "The disease detection server is temporarily unavailable. Please try again shortly."
    );
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid response format.");
    }

    return parsed;
  } catch {
    throw new Error(
      "The server returned an invalid response. Please try again."
    );
  }
}

// Convert technical Axios errors into readable messages.
function getReadableError(error) {
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (data && typeof data === "object") {
      const message =
        data.message ||
        data.detail ||
        data.error;

      if (message && typeof message === "string") {
        return message;
      }
    }

    if (status === 413) {
      return "The uploaded image is too large. Please select an image under 5 MB.";
    }

    if (status === 401 || status === 403) {
      return "Your session may have expired. Please log in again.";
    }

    if (status === 408 || status === 504) {
      return "Image analysis took too long. Please try again.";
    }

    if (status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }

    if (status >= 500) {
      return "The disease detection service is temporarily unavailable. Please try again shortly.";
    }

    return `Request failed (HTTP ${status}). Please try again.`;
  }

  if (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT"
  ) {
    return "The image analysis request timed out. Please try again.";
  }

  if (!error?.response) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

// Disease prediction.
export const predictCropDisease = async (imageFile, crop) => {
  if (!imageFile) {
    throw new Error("Please select a crop image first.");
  }

  if (!crop) {
    throw new Error("Please select a crop type.");
  }

  const formData = new FormData();

  formData.append("image", imageFile);
  formData.append("crop", crop);

  try {
    const response = await diseaseClient.post(
      "/predict",
      formData,
      {
        timeout: PREDICTION_TIMEOUT,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = normalizeResponseData(response.data);

    if (data.success === false) {
      throw new Error(
        data.message ||
        data.detail ||
        "Disease prediction could not be completed."
      );
    }

    return data;
  } catch (error) {
    if (
      error?.message &&
      !error?.response &&
      !error?.request
    ) {
      throw error;
    }

    throw new Error(getReadableError(error));
  }
};

// Fetch farmer disease detection history.
export const getMyDiseaseHistory = async ({
  limit = 20,
  offset = 0,
} = {}) => {
  try {
    const response = await diseaseClient.get("/history", {
      params: { limit, offset },
    });

    return normalizeResponseData(response.data);
  } catch (error) {
    throw new Error(getReadableError(error));
  }
};

export default diseaseClient;
