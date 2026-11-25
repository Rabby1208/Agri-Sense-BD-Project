
"""
AgriSense BD - Multi-model plant classification
Version: 2.0.0

Rice:
    wambugu71/crop_leaf_diseases_vit

Potato, Tomato, Maize:
    neghani/plantvillage-mobilenetv2

Framework:
    PyTorch + Hugging Face Transformers
    CPU inference
"""

import re
import time
from io import BytesIO
from dataclasses import dataclass

import torch
from PIL import Image, ImageOps, UnidentifiedImageError

from transformers import (
    AutoImageProcessor,
    AutoModelForImageClassification,
)


# ==========================================
# CONFIGURATION
# ==========================================

RICE_MODEL_REPO = "wambugu71/crop_leaf_diseases_vit"

GENERAL_MODEL_REPO = "neghani/plantvillage-mobilenetv2"

SUPPORTED_CROPS = [
    "rice",
    "potato",
    "tomato",
    "maize"
]

CONFIDENCE_THRESHOLD = 0.70

DEVICE = torch.device("cpu")

MODEL_VERSION = "2.0.0"


# ==========================================
# CUSTOM EXCEPTION
# ==========================================

class InvalidImageError(Exception):
    pass


# ==========================================
# MODEL DATA STRUCTURE
# ==========================================

@dataclass
class LoadedModel:

    repo_id: str
    processor: object
    model: object
    id2label: dict
    crops: list
    version: str


class AgriSenseModels:

    def __init__(self, rice_model, general_model):

        self.rice_model = rice_model

        self.general_model = general_model

        self.version = MODEL_VERSION

        self.crops = SUPPORTED_CROPS

    def model_for_crop(self, crop):

        if crop == "rice":
            return self.rice_model

        if crop in ("potato", "tomato", "maize"):
            return self.general_model

        raise ValueError(
            f"Unsupported crop: {crop}"
        )


# ==========================================
# CROP NAME NORMALIZATION
# ==========================================

def normalize_crop_name(value):

    if value is None:
        return None

    value = str(value).strip().lower()

    value = value.replace("_", " ")
    value = value.replace("-", " ")

    if "potato" in value:
        return "potato"

    if "tomato" in value:
        return "tomato"

    if "rice" in value:
        return "rice"

    if "maize" in value or "corn" in value:
        return "maize"

    return None


# ==========================================
# LABEL PARSER
# ==========================================

def split_label(label):

    label = str(label).strip()

    separators = [
        "___",
        "|",
        "::",
        "/"
    ]

    for separator in separators:

        if separator in label:

            parts = label.split(separator, 1)

            return (
                parts[0].strip(),
                parts[1].strip()
            )

    lower_label = label.lower()

    crop_words = [
        "potato",
        "tomato",
        "rice",
        "maize",
        "corn"
    ]

    for crop_word in crop_words:

        if crop_word in lower_label:

            condition = re.sub(
                re.escape(crop_word),
                "",
                label,
                flags=re.IGNORECASE
            )

            condition = condition.strip(" _-()")

            return (
                crop_word,
                condition or label
            )

    return None, label


# ==========================================
# CONDITION FORMATTER
# ==========================================

def clean_condition(condition):

    condition = str(condition)

    condition = condition.replace("_", " ")

    condition = re.sub(
        r"\s+",
        " ",
        condition
    )

    return condition.strip().title()


# ==========================================
# HEALTHY CONDITION CHECK
# ==========================================

def is_healthy_condition(condition):

    if not condition:
        return False

    return (
        "healthy" in str(condition).lower()
    )


# ==========================================
# LOAD ONE MODEL
# ==========================================

def load_one_model(repo_id):

    print("\nLoading model:", repo_id)

    processor = AutoImageProcessor.from_pretrained(
        repo_id
    )

    model = AutoModelForImageClassification.from_pretrained(
        repo_id
    )

    model.to(DEVICE)

    model.eval()

    raw_labels = model.config.id2label

    id2label = {
        int(index): str(label)
        for index, label in raw_labels.items()
    }

    recognized_crops = set()

    for label in id2label.values():

        crop_part, condition_part = split_label(
            label
        )

        crop_name = normalize_crop_name(
            crop_part
        )

        if crop_name:
            recognized_crops.add(crop_name)

    if not recognized_crops:

        raise RuntimeError(
            f"No supported crop labels found in {repo_id}. "
            f"Labels: {list(id2label.values())[:10]}"
        )

    print("Model loaded:", repo_id)

    print("Number of classes:", len(id2label))

    print(
        "Recognized crops:",
        sorted(recognized_crops)
    )

    return LoadedModel(
        repo_id=repo_id,
        processor=processor,
        model=model,
        id2label=id2label,
        crops=sorted(recognized_crops),
        version=repo_id
    )


# ==========================================
# LOAD BOTH MODELS
# ==========================================

def load_model(model_dir=None):

    print("\n================================")
    print("Loading AgriSense ML Models")
    print("================================")

    rice_model = load_one_model(
        RICE_MODEL_REPO
    )

    general_model = load_one_model(
        GENERAL_MODEL_REPO
    )

    # Validate Rice model

    if "rice" not in rice_model.crops:

        raise RuntimeError(
            "Rice model does not contain recognizable Rice classes."
        )

    # Validate general model

    required_crops = {
        "potato",
        "tomato",
        "maize"
    }

    missing_crops = (
        required_crops - set(general_model.crops)
    )

    if missing_crops:

        raise RuntimeError(
            "General model is missing required crops: "
            + ", ".join(sorted(missing_crops))
        )

    print("\nBoth models loaded successfully.")

    print("Supported crops:", SUPPORTED_CROPS)

    print("Device:", DEVICE)

    print("Version:", MODEL_VERSION)

    return AgriSenseModels(
        rice_model=rice_model,
        general_model=general_model
    )


# ==========================================
# IMAGE LOADER
# ==========================================

def load_image(source):

    try:

        if isinstance(source, bytes):

            image = Image.open(
                BytesIO(source)
            )

        else:

            image = Image.open(source)

        image = ImageOps.exif_transpose(
            image
        )

        image = image.convert("RGB")

        return image

    except (
        UnidentifiedImageError,
        OSError,
        ValueError
    ) as error:

        raise InvalidImageError(
            "The uploaded file is not a valid image."
        ) from error


# ==========================================
# IMAGE PREDICTION
# ==========================================

def predict_image(
    source,
    model_bundle,
    crop="rice"
):

    return predict_image_for_crop(
        source,
        model_bundle,
        crop
    )


# ==========================================
# CROP-AWARE PREDICTION
# ==========================================

def predict_image_for_crop(
    source,
    model_bundle,
    selected_crop
):

    started = time.perf_counter()

    selected_crop = str(
        selected_crop
    ).strip().lower()

    if selected_crop not in SUPPORTED_CROPS:

        raise ValueError(
            f"Unsupported crop: {selected_crop}"
        )

    if model_bundle is None:

        raise RuntimeError(
            "Models have not been loaded."
        )

    image = load_image(source)

    selected_model = model_bundle.model_for_crop(
        selected_crop
    )

    # ======================================
    # PREPROCESS IMAGE
    # ======================================

    inputs = selected_model.processor(
        images=image,
        return_tensors="pt"
    )

    # ======================================
    # MODEL INFERENCE
    # ======================================

    with torch.inference_mode():

        outputs = selected_model.model(
            **inputs
        )

        probabilities = torch.softmax(
            outputs.logits[0],
            dim=-1
        )

    # ======================================
    # CLASS PROBABILITIES
    # ======================================

    ranked_indices = torch.argsort(
        probabilities,
        descending=True
    ).tolist()

    crop_probabilities = {}

    all_predictions = []

    for class_index, probability_tensor in enumerate(
        probabilities
    ):

        raw_label = selected_model.id2label.get(
            class_index,
            f"class_{class_index}"
        )

        crop_part, condition_part = split_label(
            raw_label
        )

        detected_crop = normalize_crop_name(
            crop_part
        )

        confidence = float(
            probability_tensor.item()
        )

        if detected_crop:

            crop_probabilities[detected_crop] = (
                crop_probabilities.get(
                    detected_crop,
                    0.0
                ) + confidence
            )

        if detected_crop:

            formatted_class = (
                f"{detected_crop}|{condition_part}"
            )

        else:

            formatted_class = str(raw_label)

        all_predictions.append({

            "class": formatted_class,

            "display_name": clean_condition(
                condition_part
            ),

            "crop": detected_crop,

            "confidence": round(
                confidence,
                6
            )

        })

    # ======================================
    # TOP PREDICTIONS
    # ======================================

    top_predictions = [

        all_predictions[index]

        for index in ranked_indices[:5]

    ]

    top_prediction = top_predictions[0]

    predicted_crop = top_prediction.get(
        "crop"
    )

    condition = top_prediction.get(
        "display_name"
    )

    confidence = top_prediction.get(
        "confidence",
        0.0
    )

    # ======================================
    # DOMINANT CROP
    # ======================================

    dominant_crop = None

    if crop_probabilities:

        dominant_crop = max(
            crop_probabilities,
            key=crop_probabilities.get
        )

    # ======================================
    # INFERENCE TIME
    # ======================================

    inference_ms = round(
        (
            time.perf_counter() - started
        ) * 1000,
        2
    )

    # ======================================
    # COMMON RESPONSE FIELDS
    # ======================================

    common = {

        "model_version": selected_model.version,

        "inference_ms": inference_ms,

        "crop_probabilities": {

            key: round(value, 6)

            for key, value in crop_probabilities.items()

        },

        "top_predictions": top_predictions,

        "predicted_class": top_prediction["class"],

        "confidence": round(
            confidence,
            6
        ),

        "organ": "leaf"

    }

    # ======================================
    # CROP MISMATCH
    # ======================================

    if (
        dominant_crop is not None
        and dominant_crop != selected_crop
        and crop_probabilities[dominant_crop]
        > crop_probabilities.get(selected_crop, 0.0)
    ):

        return {

            "status": "unknown",

            "message": (
                "The image may belong to a different crop."
            ),

            "crop": predicted_crop,

            "condition": condition,

            "is_healthy": False,

            **common

        }

    if predicted_crop != selected_crop:

        return {

            "status": "unknown",

            "message": (
                "The selected crop could not be reliably confirmed."
            ),

            "crop": predicted_crop,

            "condition": condition,

            "is_healthy": False,

            **common

        }

    # ======================================
    # LOW CONFIDENCE
    # ======================================

    if confidence < CONFIDENCE_THRESHOLD:

        return {

            "status": "uncertain",

            "message": (
                "Model confidence is below the configured threshold."
            ),

            "crop": selected_crop,

            "condition": condition,

            "is_healthy": is_healthy_condition(
                condition
            ),

            **common

        }

    # ======================================
    # HEALTHY / DISEASE CLASSIFICATION
    # ======================================

    healthy = is_healthy_condition(
        condition
    )

    return {

        "status": "success",

        "crop": selected_crop,

        "organ": "leaf",

        "condition": condition,

        "is_healthy": healthy,

        **common

    }


# ==========================================
# MULTI-IMAGE PLANT ASSESSMENT
# ==========================================

def assess_plant(
    sources,
    model_bundle,
    crop="rice"
):

    if not isinstance(
        sources,
        (list, tuple)
    ):

        sources = [sources]

    results = []

    for source in sources:

        result = predict_image(
            source,
            model_bundle,
            crop
        )

        results.append(result)

    return {

        "total_images": len(results),

        "results": results

    }


# ==========================================
# MODULE INFORMATION
# ==========================================

def get_model_information(model_bundle):

    if model_bundle is None:

        return {
            "loaded": False
        }

    return {

        "loaded": True,

        "version": model_bundle.version,

        "supported_crops": model_bundle.crops,

        "rice_model": RICE_MODEL_REPO,

        "general_model": GENERAL_MODEL_REPO,

        "device": str(DEVICE),

        "confidence_threshold": CONFIDENCE_THRESHOLD

    }
