
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Upload,
  Image as ImageIcon,
  Sprout,
  Search,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  ClipboardList,
  Leaf,
} from "lucide-react";

import { predictCropDisease } from "../services/farmerDiseaseApi";
import "./FarmerDiseaseDetection.css";

const CROPS = ["Rice", "Potato", "Tomato", "Maize"];

const cropTranslations = {
  Rice: "ধান",
  Potato: "আলু",
  Tomato: "টমেটো",
  Maize: "ভুট্টা",
};

const diseaseTranslations = {
  healthy: "সুস্থ",
  "healthy condition detected": "সুস্থ অবস্থা শনাক্ত হয়েছে",
  "disease name unavailable": "রোগের নাম পাওয়া যায়নি",
  "bacterial leaf blight": "ব্যাকটেরিয়াজনিত পাতার ঝলসানো রোগ",
  "early blight": "আর্লি ব্লাইট রোগ",
  "late blight": "লেট ব্লাইট রোগ",
  "leaf blast": "পাতার ব্লাস্ট রোগ",
  "rice blast": "ধানের ব্লাস্ট রোগ",
  "brown spot": "বাদামি দাগ রোগ",
  "bacterial spot": "ব্যাকটেরিয়াজনিত দাগ রোগ",
  "leaf mold": "পাতার ছত্রাকজনিত রোগ",
  "powdery mildew": "পাউডারি মিলডিউ রোগ",
  "downy mildew": "ডাউনি মিলডিউ রোগ",
  "leaf rust": "পাতার মরিচা রোগ",
  "common rust": "সাধারণ মরিচা রোগ",
  "southern rust": "সাউদার্ন রাস্ট রোগ",
  "yellow leaf curl virus": "হলুদ পাতা কুঁকড়ে যাওয়া ভাইরাস রোগ",
  "tomato yellow leaf curl virus": "টমেটোর হলুদ পাতা কুঁকড়ে যাওয়া ভাইরাস রোগ",
  "mosaic virus": "মোজাইক ভাইরাস রোগ",
  "bacterial wilt": "ব্যাকটেরিয়াজনিত ঢলে পড়া রোগ",
  "fusarium wilt": "ফিউজেরিয়ামজনিত ঢলে পড়া রোগ",
  "root rot": "শিকড় পচা রোগ",
  "common scab": "কমন স্ক্যাব রোগ",
  "black scurf": "ব্ল্যাক স্কার্ফ রোগ",
  "late blight": "লেট ব্লাইট রোগ",
  "northern leaf blight": "নর্দার্ন লিফ ব্লাইট রোগ",
  "gray leaf spot": "ধূসর পাতার দাগ রোগ",
  "common smut": "কমন স্মাট রোগ",
  "no disease": "কোনো রোগ শনাক্ত হয়নি",
  normal: "স্বাভাবিক",
};

function formatConfidence(value, isBangla = false) {
  if (value === null || value === undefined || value === "") {
    return isBangla ? "পাওয়া যায়নি" : "Not available";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return isBangla ? "পাওয়া যায়নি" : "Not available";
  }

  const formatted = (number <= 1 ? number * 100 : number).toFixed(2);

  return `${isBangla ? Number(formatted).toLocaleString("bn-BD") : formatted}%`;
}

function getPredictionPayload(response) {
  let data = response;

  if (data?.data?.data) {
    data = data.data.data;
  } else if (data?.data) {
    data = data.data;
  }

  if (data?.prediction && typeof data.prediction === "object") {
    data = { ...data, ...data.prediction };
  }

  return data || {};
}

function getDiseaseName(data) {
  const possibleNames = [
    data?.condition,
    data?.disease_name,
    data?.predicted_disease,
    data?.display_name,
    data?.predicted_class,
    data?.predicted_label,
    data?.class_name,
    data?.disease,
    data?.label,
    typeof data?.prediction === "string" ? data.prediction : null,
    typeof data?.result === "string" ? data.result : null,
  ];

  const name = possibleNames.find(
    (item) =>
      typeof item === "string" &&
      item.trim() !== "" &&
      item.toLowerCase() !== "prediction completed"
  );

  return name || "Disease name unavailable";
}

function translateDiseaseName(name, isBangla) {
  if (!isBangla) return name;

  const normalized = String(name || "").trim().toLowerCase();

  return diseaseTranslations[normalized] || name;
}

function getDiseaseAdvice(diseaseName) {
  const disease = String(diseaseName).toLowerCase();

  if (
    disease.includes("healthy") ||
    disease.includes("no disease") ||
    disease.includes("normal")
  ) {
    return {
      title: "Your crop appears healthy",
      management: [
        "Continue regular field monitoring.",
        "Keep the field clean and remove weeds.",
        "Maintain proper irrigation and balanced crop nutrition.",
        "Check leaves regularly for any new spots or unusual changes.",
      ],
      prevention: [
        "Use healthy and disease-free seeds or planting materials.",
        "Maintain proper spacing and airflow between plants.",
        "Inspect crops regularly, especially after rainy or humid weather.",
      ],
    };
  }

  if (disease.includes("rust")) {
    return {
      title: "Rust Disease Management",
      management: [
        "Inspect the crop and identify how widely the symptoms have spread.",
        "Remove severely affected leaves where practical.",
        "Avoid unnecessary overhead watering that keeps leaves wet.",
        "Contact a local agriculture officer for a crop-specific treatment recommendation.",
      ],
      prevention: [
        "Use resistant varieties when available.",
        "Maintain proper spacing and field ventilation.",
        "Remove volunteer plants and crop residues that may carry disease.",
        "Monitor the crop regularly for new rust symptoms.",
      ],
    };
  }

  if (
    disease.includes("blight") ||
    disease.includes("leaf spot") ||
    disease.includes("spot") ||
    disease.includes("smut")
  ) {
    return {
      title: "Leaf Disease Management",
      management: [
        "Remove severely affected leaves when practical and dispose of them away from the field.",
        "Avoid working among wet plants because moisture can help diseases spread.",
        "Water near the soil rather than directly over the leaves.",
        "Ask an agriculture officer to confirm the disease and recommend suitable treatment for this crop.",
      ],
      prevention: [
        "Use healthy seeds and disease-free planting materials.",
        "Maintain suitable plant spacing for better airflow.",
        "Keep the field free from infected crop debris and weeds.",
        "Avoid excessive irrigation and prolonged leaf wetness.",
      ],
    };
  }

  if (
    disease.includes("mosaic") ||
    disease.includes("yellow leaf curl") ||
    disease.includes("virus") ||
    disease.includes("viral")
  ) {
    return {
      title: "Possible Viral Disease Management",
      management: [
        "Identify and remove severely infected plants when advised by an agriculture officer.",
        "Check nearby plants for similar symptoms.",
        "Monitor insect pests such as whiteflies or aphids, which can spread some plant viruses.",
        "Get expert advice before choosing any pest-control method.",
      ],
      prevention: [
        "Use healthy, disease-free seedlings.",
        "Control weeds that may host pests or plant viruses.",
        "Use resistant varieties when available.",
        "Inspect plants regularly for unusual leaf curling, yellowing, or mosaic patterns.",
      ],
    };
  }

  if (disease.includes("mold") || disease.includes("mildew")) {
    return {
      title: "Fungal Disease Management",
      management: [
        "Remove heavily affected leaves when practical.",
        "Improve airflow by maintaining suitable plant spacing.",
        "Avoid watering directly over leaves, especially late in the day.",
        "Consult an agriculture officer about suitable treatment for the identified crop disease.",
      ],
      prevention: [
        "Avoid overcrowding plants.",
        "Keep the field clean and remove infected plant debris.",
        "Use healthy seeds or seedlings.",
        "Monitor crops during humid and rainy conditions.",
      ],
    };
  }

  if (disease.includes("wilt") || disease.includes("root rot")) {
    return {
      title: "Root or Wilt Disease Management",
      management: [
        "Check soil moisture and make sure water is not accumulating around plant roots.",
        "Remove severely affected plants when recommended by an agriculture officer.",
        "Avoid moving contaminated soil or plant debris to healthy areas.",
        "Seek expert advice to confirm the cause before applying any treatment.",
      ],
      prevention: [
        "Ensure proper field drainage.",
        "Use healthy seeds and disease-free seedlings.",
        "Practice crop rotation where appropriate.",
        "Clean tools and equipment after working in affected areas.",
      ],
    };
  }

  return {
    title: "General Disease Management",
    management: [
      "Inspect the affected plant and nearby plants for similar symptoms.",
      "Remove severely affected leaves when practical.",
      "Keep the field clean and avoid unnecessary leaf wetness.",
      "Take the plant or a clear photo to a local agriculture officer for confirmation.",
      "Use only crop-specific treatment recommended by a qualified agriculture professional.",
    ],
    prevention: [
      "Use healthy seeds and disease-free planting materials.",
      "Maintain proper plant spacing and field ventilation.",
      "Remove infected crop debris and control weeds.",
      "Maintain balanced irrigation and crop nutrition.",
      "Monitor the crop regularly for new symptoms.",
    ],
  };
}

const adviceTranslations = {
  "Your crop appears healthy": "আপনার ফসল সুস্থ বলে মনে হচ্ছে",
  "Rust Disease Management": "মরিচা রোগ ব্যবস্থাপনা",
  "Leaf Disease Management": "পাতার রোগ ব্যবস্থাপনা",
  "Possible Viral Disease Management": "সম্ভাব্য ভাইরাসজনিত রোগ ব্যবস্থাপনা",
  "Fungal Disease Management": "ছত্রাকজনিত রোগ ব্যবস্থাপনা",
  "Root or Wilt Disease Management": "শিকড় পচা বা ঢলে পড়া রোগ ব্যবস্থাপনা",
  "General Disease Management": "সাধারণ রোগ ব্যবস্থাপনা",
};

const adviceTextTranslations = {
  "Continue regular field monitoring.": "নিয়মিত জমি পর্যবেক্ষণ চালিয়ে যান।",
  "Keep the field clean and remove weeds.": "জমি পরিষ্কার রাখুন এবং আগাছা দূর করুন।",
  "Maintain proper irrigation and balanced crop nutrition.": "সঠিক সেচ ও সুষম ফসলের পুষ্টি নিশ্চিত করুন।",
  "Check leaves regularly for any new spots or unusual changes.": "পাতায় নতুন দাগ বা অস্বাভাবিক পরিবর্তন হচ্ছে কি না নিয়মিত পরীক্ষা করুন।",
  "Use healthy and disease-free seeds or planting materials.": "সুস্থ ও রোগমুক্ত বীজ বা চারা ব্যবহার করুন।",
  "Maintain proper spacing and airflow between plants.": "গাছের মধ্যে উপযুক্ত দূরত্ব ও বাতাস চলাচলের ব্যবস্থা রাখুন।",
  "Inspect crops regularly, especially after rainy or humid weather.": "বিশেষ করে বৃষ্টি বা আর্দ্র আবহাওয়ার পর নিয়মিত ফসল পরীক্ষা করুন।",
  "Inspect the crop and identify how widely the symptoms have spread.": "ফসল পরীক্ষা করে রোগের লক্ষণ কতটুকু ছড়িয়েছে তা নির্ণয় করুন।",
  "Remove severely affected leaves where practical.": "সম্ভব হলে বেশি আক্রান্ত পাতা সরিয়ে ফেলুন।",
  "Avoid unnecessary overhead watering that keeps leaves wet.": "পাতা ভিজে থাকে এমন অপ্রয়োজনীয় ওপর থেকে পানি দেওয়া এড়িয়ে চলুন।",
  "Contact a local agriculture officer for a crop-specific treatment recommendation.": "ফসল অনুযায়ী উপযুক্ত ব্যবস্থাপনার পরামর্শের জন্য স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।",
  "Use resistant varieties when available.": "পাওয়া গেলে রোগ প্রতিরোধী জাত ব্যবহার করুন।",
  "Maintain proper spacing and field ventilation.": "উপযুক্ত দূরত্ব ও জমিতে বাতাস চলাচল নিশ্চিত করুন।",
  "Remove volunteer plants and crop residues that may carry disease.": "রোগ ছড়াতে পারে এমন আগাছা ও ফসলের অবশিষ্টাংশ সরিয়ে ফেলুন।",
  "Monitor the crop regularly for new rust symptoms.": "মরিচা রোগের নতুন লক্ষণ দেখা যাচ্ছে কি না নিয়মিত পর্যবেক্ষণ করুন।",
  "Remove severely affected leaves when practical and dispose of them away from the field.": "সম্ভব হলে বেশি আক্রান্ত পাতা সরিয়ে জমি থেকে দূরে নিরাপদভাবে রাখুন।",
  "Avoid working among wet plants because moisture can help diseases spread.": "গাছ ভেজা থাকা অবস্থায় জমিতে কাজ করা এড়িয়ে চলুন, কারণ আর্দ্রতা রোগ ছড়াতে সাহায্য করতে পারে।",
  "Water near the soil rather than directly over the leaves.": "পাতার ওপর পানি না দিয়ে গাছের গোড়ার মাটিতে পানি দিন।",
  "Ask an agriculture officer to confirm the disease and recommend suitable treatment for this crop.": "রোগ নিশ্চিত করতে এবং উপযুক্ত ব্যবস্থাপনা জানতে কৃষি কর্মকর্তার পরামর্শ নিন।",
  "Use healthy seeds and disease-free planting materials.": "সুস্থ বীজ ও রোগমুক্ত চারা ব্যবহার করুন।",
  "Maintain suitable plant spacing for better airflow.": "বাতাস চলাচলের জন্য গাছের মধ্যে উপযুক্ত দূরত্ব রাখুন।",
  "Keep the field free from infected crop debris and weeds.": "জমি রোগাক্রান্ত ফসলের অবশিষ্টাংশ ও আগাছামুক্ত রাখুন।",
  "Avoid excessive irrigation and prolonged leaf wetness.": "অতিরিক্ত সেচ ও দীর্ঘ সময় পাতা ভেজা থাকা এড়িয়ে চলুন।",
  "Identify and remove severely infected plants when advised by an agriculture officer.": "কৃষি কর্মকর্তার পরামর্শ অনুযায়ী বেশি আক্রান্ত গাছ শনাক্ত করে সরিয়ে ফেলুন।",
  "Check nearby plants for similar symptoms.": "পাশের গাছগুলোতেও একই ধরনের লক্ষণ আছে কি না পরীক্ষা করুন।",
  "Monitor insect pests such as whiteflies or aphids, which can spread some plant viruses.": "ভাইরাস ছড়াতে পারে এমন সাদা মাছি ও জাব পোকার উপস্থিতি পর্যবেক্ষণ করুন।",
  "Get expert advice before choosing any pest-control method.": "পোকা দমনের পদ্ধতি বেছে নেওয়ার আগে বিশেষজ্ঞের পরামর্শ নিন।",
  "Use healthy, disease-free seedlings.": "সুস্থ ও রোগমুক্ত চারা ব্যবহার করুন।",
  "Control weeds that may host pests or plant viruses.": "পোকা বা ভাইরাসের আশ্রয় হতে পারে এমন আগাছা নিয়ন্ত্রণ করুন।",
  "Inspect plants regularly for unusual leaf curling, yellowing, or mosaic patterns.": "পাতা কুঁকড়ে যাওয়া, হলুদ হওয়া বা মোজাইক দাগ দেখা যাচ্ছে কি না নিয়মিত পরীক্ষা করুন।",
  "Remove heavily affected leaves when practical.": "সম্ভব হলে বেশি আক্রান্ত পাতা সরিয়ে ফেলুন।",
  "Improve airflow by maintaining suitable plant spacing.": "গাছের মধ্যে উপযুক্ত দূরত্ব রেখে বাতাস চলাচল বাড়ান।",
  "Avoid watering directly over leaves, especially late in the day.": "বিশেষ করে দিনের শেষভাগে পাতার ওপর সরাসরি পানি দেওয়া এড়িয়ে চলুন।",
  "Consult an agriculture officer about suitable treatment for the identified crop disease.": "শনাক্ত হওয়া রোগের উপযুক্ত ব্যবস্থাপনার জন্য কৃষি কর্মকর্তার পরামর্শ নিন।",
  "Avoid overcrowding plants.": "গাছ অতিরিক্ত ঘন করে লাগানো এড়িয়ে চলুন।",
  "Keep the field clean and remove infected plant debris.": "জমি পরিষ্কার রাখুন এবং আক্রান্ত গাছের অবশিষ্টাংশ সরিয়ে ফেলুন।",
  "Use healthy seeds or seedlings.": "সুস্থ বীজ বা চারা ব্যবহার করুন।",
  "Monitor crops during humid and rainy conditions.": "আর্দ্র ও বৃষ্টির সময় ফসল নিয়মিত পর্যবেক্ষণ করুন।",
  "Check soil moisture and make sure water is not accumulating around plant roots.": "মাটির আর্দ্রতা পরীক্ষা করুন এবং গাছের গোড়ায় পানি জমছে কি না নিশ্চিত করুন।",
  "Remove severely affected plants when recommended by an agriculture officer.": "কৃষি কর্মকর্তার পরামর্শে বেশি আক্রান্ত গাছ সরিয়ে ফেলুন।",
  "Avoid moving contaminated soil or plant debris to healthy areas.": "দূষিত মাটি বা গাছের অবশিষ্টাংশ সুস্থ জমিতে নেওয়া এড়িয়ে চলুন।",
  "Seek expert advice to confirm the cause before applying any treatment.": "কোনো ব্যবস্থা নেওয়ার আগে কারণ নিশ্চিত করতে বিশেষজ্ঞের পরামর্শ নিন।",
  "Ensure proper field drainage.": "জমিতে পর্যাপ্ত পানি নিষ্কাশনের ব্যবস্থা রাখুন।",
  "Practice crop rotation where appropriate.": "প্রয়োজন অনুযায়ী শস্য পর্যায়ক্রম অনুসরণ করুন।",
  "Clean tools and equipment after working in affected areas.": "আক্রান্ত জমিতে কাজের পর যন্ত্রপাতি পরিষ্কার করুন।",
  "Inspect the affected plant and nearby plants for similar symptoms.": "আক্রান্ত গাছ ও আশপাশের গাছগুলোতে একই লক্ষণ আছে কি না পরীক্ষা করুন।",
  "Keep the field clean and avoid unnecessary leaf wetness.": "জমি পরিষ্কার রাখুন এবং অপ্রয়োজনীয়ভাবে পাতা ভেজা রাখা এড়িয়ে চলুন।",
  "Take the plant or a clear photo to a local agriculture officer for confirmation.": "রোগ নিশ্চিত করতে গাছ বা পরিষ্কার ছবি স্থানীয় কৃষি কর্মকর্তাকে দেখান।",
  "Use only crop-specific treatment recommended by a qualified agriculture professional.": "যোগ্য কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী ফসলের জন্য নির্দিষ্ট ব্যবস্থাপনাই গ্রহণ করুন।",
  "Maintain proper plant spacing and field ventilation.": "গাছের মধ্যে উপযুক্ত দূরত্ব ও জমিতে বাতাস চলাচল নিশ্চিত করুন।",
  "Remove infected crop debris and control weeds.": "আক্রান্ত ফসলের অবশিষ্টাংশ সরিয়ে আগাছা নিয়ন্ত্রণ করুন।",
  "Maintain balanced irrigation and crop nutrition.": "সুষম সেচ ও ফসলের পুষ্টি নিশ্চিত করুন।",
  "Monitor the crop regularly for new symptoms.": "নতুন রোগের লক্ষণ দেখা যাচ্ছে কি না নিয়মিত পর্যবেক্ষণ করুন।",
};

function FarmerDiseaseDetection() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const L = (english, bangla) => (isBangla ? bangla : english);

  const [crop, setCrop] = useState("Rice");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return undefined;
    }

    const imageUrl = URL.createObjectURL(imageFile);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [imageFile]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageFile(null);
      setError(
        L(
          "Please select a JPG, PNG, or WEBP image.",
          "JPG, PNG অথবা WEBP ছবি নির্বাচন করুন।"
        )
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageFile(null);
      setError(
        L(
          "Image size must be 5 MB or less.",
          "ছবির আকার সর্বোচ্চ ৫ MB হতে পারবে।"
        )
      );
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const handlePrediction = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!imageFile) {
      setError(
        L(
          "Please upload a crop leaf image first.",
          "প্রথমে ফসলের পাতার একটি ছবি আপলোড করুন।"
        )
      );
      return;
    }

    setLoading(true);

    try {
      const response = await predictCropDisease(imageFile, crop);

      if (!response || response.success === false) {
        throw new Error(
          response?.message ||
            L(
              "Prediction could not be completed.",
              "রোগ শনাক্ত করা সম্ভব হয়নি।"
            )
        );
      }

      const prediction = getPredictionPayload(response);

      if (prediction.success === false) {
        throw new Error(
          prediction.message ||
            L(
              "Prediction could not be completed.",
              "রোগ শনাক্ত করা সম্ভব হয়নি।"
            )
        );
      }

      setResult(prediction);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.detail ||
          requestError.message ||
          L(
            "Unable to connect to the disease detection service.",
            "রোগ শনাক্তকরণ সার্ভিসের সাথে সংযোগ করা যাচ্ছে না।"
          )
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setResult(null);
    setError("");

    const input = document.getElementById("farmer-disease-image");

    if (input) input.value = "";
  };

  const condition = result ? getDiseaseName(result) : "";

  const translatedCondition = translateDiseaseName(condition, isBangla);

  const status = String(
    result?.status || result?.detection_status || "unknown"
  ).toLowerCase();

  const isHealthy =
    result?.is_healthy === true ||
    condition.toLowerCase().includes("healthy") ||
    condition.toLowerCase().includes("no disease");

  const isUncertain =
    status === "uncertain" ||
    status === "unknown" ||
    status === "crop_mismatch" ||
    condition === "Disease name unavailable";

  const confidence = formatConfidence(
    result?.confidence ?? result?.confidence_score,
    isBangla
  );

  const topPredictions = Array.isArray(result?.top_predictions)
    ? result.top_predictions
    : [];

  const advice =
    result && !isHealthy && !isUncertain
      ? getDiseaseAdvice(condition, result.crop || crop)
      : null;

  const translateAdvice = (text) => {
    if (!isBangla) return text;

    return adviceTextTranslations[text] || text;
  };

  const translateAdviceTitle = (text) => {
    if (!isBangla) return text;

    return adviceTranslations[text] || text;
  };

  const translateCrop = (value) => {
    if (!isBangla) return value;

    return cropTranslations[value] || value;
  };

  return (
    <div className="farmer-detection-page">
      <section className="farmer-detection-hero">
        <div>
          <span className="farmer-detection-eyebrow">
            {L("AI-POWERED CROP CARE", "এআই-চালিত ফসলের যত্ন")}
          </span>

          <h2>{L("AI Crop Disease Detection", "এআই ফসলের রোগ শনাক্তকরণ")}</h2>

          <p>
            {L(
              "Upload a clear leaf image to identify possible crop diseases and get management recommendations.",
              "সম্ভাব্য ফসলের রোগ শনাক্ত করতে এবং ব্যবস্থাপনার পরামর্শ পেতে পাতার একটি পরিষ্কার ছবি আপলোড করুন।"
            )}
          </p>
        </div>

        <div className="farmer-detection-hero-icon">
          <Sprout size={48} />
        </div>
      </section>

      <div className="farmer-detection-grid">
        <section className="farmer-detection-card">
          <div className="farmer-detection-card-heading">
            <div className="farmer-detection-heading-icon">
              <ImageIcon size={21} />
            </div>

            <div>
              <h3>{L("Upload Crop Image", "ফসলের ছবি আপলোড করুন")}</h3>
              <p>
                {L(
                  "Select crop type and upload a leaf photo.",
                  "ফসলের ধরন নির্বাচন করে পাতার ছবি আপলোড করুন।"
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handlePrediction}>
            <div className="farmer-detection-field">
              <label htmlFor="farmer-detection-crop">
                {L("Select Crop", "ফসল নির্বাচন করুন")}
              </label>

              <select
                id="farmer-detection-crop"
                value={crop}
                onChange={(event) => {
                  setCrop(event.target.value);
                  setResult(null);
                  setError("");
                }}
                disabled={loading}
              >
                {CROPS.map((item) => (
                  <option key={item} value={item}>
                    {translateCrop(item)}
                  </option>
                ))}
              </select>
            </div>

            <label
              className="farmer-detection-upload"
              htmlFor="farmer-disease-image"
            >
              {preview ? (
                <img
                  src={preview}
                  alt={L(
                    "Selected crop leaf preview",
                    "নির্বাচিত ফসলের পাতার ছবির প্রিভিউ"
                  )}
                />
              ) : (
                <>
                  <span className="farmer-detection-upload-icon">
                    <Upload size={28} />
                  </span>

                  <strong>
                    {L(
                      "Click to upload leaf image",
                      "পাতার ছবি আপলোড করতে ক্লিক করুন"
                    )}
                  </strong>

                  <span>
                    {L(
                      "JPG, PNG or WEBP · Maximum 5 MB",
                      "JPG, PNG অথবা WEBP · সর্বোচ্চ ৫ MB"
                    )}
                  </span>
                </>
              )}
            </label>

            <input
              id="farmer-disease-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={loading}
              hidden
            />

            {imageFile && (
              <div className="farmer-detection-file-name">
                <ImageIcon size={16} />
                <span>{imageFile.name}</span>
              </div>
            )}

            {error && (
              <div className="farmer-detection-message error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="farmer-detection-actions">
              <button
                type="submit"
                className="farmer-detection-submit"
                disabled={loading || !imageFile}
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      className="farmer-detection-spinner"
                      size={18}
                    />
                    {L("Analyzing Image...", "ছবি বিশ্লেষণ হচ্ছে...")}
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    {L("Detect Disease", "রোগ শনাক্ত করুন")}
                  </>
                )}
              </button>

              <button
                type="button"
                className="farmer-detection-reset"
                onClick={resetForm}
                disabled={loading}
              >
                <RefreshCw size={17} />
                {L("Reset", "রিসেট")}
              </button>
            </div>
          </form>
        </section>

        <section className="farmer-detection-card farmer-detection-result-card">
          <div className="farmer-detection-card-heading">
            <div className="farmer-detection-heading-icon result">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h3>{L("AI Diagnosis & Solution", "এআই রোগ নির্ণয় ও সমাধান")}</h3>
              <p>
                {L(
                  "Disease identification and crop management advice.",
                  "রোগ শনাক্তকরণ ও ফসল ব্যবস্থাপনার পরামর্শ।"
                )}
              </p>
            </div>
          </div>

          {!result && !loading && (
            <div className="farmer-detection-empty">
              <div className="farmer-detection-empty-icon">
                <Search size={34} />
              </div>

              <h4>{L("Waiting for image", "ছবির জন্য অপেক্ষা করছে")}</h4>

              <p>
                {L(
                  "Upload a leaf image and select Detect Disease to identify the crop condition.",
                  "ফসলের অবস্থা শনাক্ত করতে পাতার ছবি আপলোড করে রোগ শনাক্ত করুন বাটনে ক্লিক করুন।"
                )}
              </p>
            </div>
          )}

          {loading && (
            <div className="farmer-detection-empty">
              <LoaderCircle
                size={38}
                className="farmer-detection-spinner"
              />

              <h4>{L("Analyzing your crop...", "আপনার ফসল বিশ্লেষণ হচ্ছে...")}</h4>

              <p>
                {L(
                  "Please wait while the AI model processes the image.",
                  "এআই মডেল ছবিটি বিশ্লেষণ করছে। অনুগ্রহ করে অপেক্ষা করুন।"
                )}
              </p>
            </div>
          )}

          {result && (
            <div className="farmer-detection-result">
              <div
                className={`farmer-detection-result-status ${
                  isHealthy
                    ? "healthy"
                    : isUncertain
                      ? "uncertain"
                      : "disease"
                }`}
              >
                {isHealthy ? (
                  <CheckCircle size={23} />
                ) : (
                  <AlertCircle size={23} />
                )}

                <span>
                  {isHealthy
                    ? L(
                        "Healthy condition detected",
                        "ফসলের সুস্থ অবস্থা শনাক্ত হয়েছে"
                      )
                    : isUncertain
                      ? L(
                          "Prediction needs confirmation",
                          "শনাক্তকরণের ফলাফল নিশ্চিত করা প্রয়োজন"
                        )
                      : L(
                          "Possible disease detected",
                          "সম্ভাব্য রোগ শনাক্ত হয়েছে"
                        )}
                </span>
              </div>

              <div className="farmer-detection-result-main">
                <span>{L("Detected Condition", "শনাক্ত হওয়া অবস্থা")}</span>

                <h2>{translatedCondition}</h2>

                <p>
                  {L("Crop:", "ফসল:")}{" "}
                  <strong>{translateCrop(result.crop || crop)}</strong>
                </p>
              </div>

              <div className="farmer-detection-confidence">
                <span>{L("AI Model Confidence", "এআই মডেলের নির্ভরযোগ্যতা")}</span>
                <strong>{confidence}</strong>
              </div>

              {result.message && (
                <p className="farmer-detection-result-note">
                  {result.message}
                </p>
              )}

              {isHealthy && (
                <div className="farmer-detection-top-predictions">
                  <h4>
                    <CheckCircle size={18} />
                    {L("Crop Care Recommendations", "ফসলের যত্নের পরামর্শ")}
                  </h4>

                  <p>
                    {L(
                      "The AI model did not identify a disease in this image. Continue regular crop monitoring and proper care.",
                      "এআই মডেল এই ছবিতে কোনো রোগ শনাক্ত করেনি। নিয়মিত ফসল পর্যবেক্ষণ ও সঠিক পরিচর্যা চালিয়ে যান।"
                    )}
                  </p>
                </div>
              )}

              {isUncertain && (
                <div className="farmer-detection-top-predictions">
                  <h4>{L("What should you do?", "আপনার কী করা উচিত?")}</h4>

                  <p>
                    {L(
                      "The AI could not confidently identify a disease. Upload a clear image showing the affected leaf area. If the symptoms continue, consult a local agriculture officer for confirmation.",
                      "এআই নিশ্চিতভাবে রোগ শনাক্ত করতে পারেনি। আক্রান্ত পাতার অংশ স্পষ্ট দেখা যায় এমন ছবি আপলোড করুন। লক্ষণ অব্যাহত থাকলে নিশ্চিত হওয়ার জন্য স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।"
                    )}
                  </p>
                </div>
              )}

              {advice && (
                <>
                  <div className="farmer-detection-top-predictions">
                    <h4>
                      <ClipboardList size={19} />
                      {translateAdviceTitle(advice.title)}
                    </h4>

                    <p>
                      {L(
                        "Follow these general steps to manage the identified condition:",
                        "শনাক্ত হওয়া অবস্থা ব্যবস্থাপনার জন্য নিচের সাধারণ পদক্ষেপগুলো অনুসরণ করুন:"
                      )}
                    </p>

                    {advice.management.map((item, index) => (
                      <div
                        className="farmer-detection-prediction-row"
                        key={`management-${index}`}
                      >
                        <span>
                          {isBangla
                            ? `${(index + 1).toLocaleString("bn-BD")}. `
                            : `${index + 1}. `}
                          {translateAdvice(item)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="farmer-detection-top-predictions">
                    <h4>
                      <Leaf size={19} />
                      {L("How to Prevent It", "কীভাবে প্রতিরোধ করবেন")}
                    </h4>

                    {advice.prevention.map((item, index) => (
                      <div
                        className="farmer-detection-prediction-row"
                        key={`prevention-${index}`}
                      >
                        <span>
                          {isBangla
                            ? `${(index + 1).toLocaleString("bn-BD")}. `
                            : `${index + 1}. `}
                          {translateAdvice(item)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {topPredictions.length > 0 && (
                <div className="farmer-detection-top-predictions">
                  <h4>{L("Other Model Predictions", "অন্যান্য সম্ভাব্য ফলাফল")}</h4>

                  {topPredictions.slice(0, 5).map((item, index) => (
                    <div
                      className="farmer-detection-prediction-row"
                      key={`prediction-${index}`}
                    >
                      <span>
                        {translateDiseaseName(
                          item.display_name ||
                            item.class ||
                            item.label ||
                            "Class",
                          isBangla
                        )}
                      </span>

                      <strong>
                        {formatConfidence(item.confidence, isBangla)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="farmer-detection-disclaimer">
                {L(
                  "AI results are preliminary predictions, not a confirmed agricultural diagnosis. Management recommendations are general guidance. Consult a local agriculture officer before applying any pesticide or other treatment.",
                  "এআই-এর ফলাফল প্রাথমিক অনুমান, নিশ্চিত কৃষি রোগ নির্ণয় নয়। ব্যবস্থাপনার পরামর্শগুলো সাধারণ নির্দেশনা। কোনো কীটনাশক বা চিকিৎসা প্রয়োগের আগে স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।"
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FarmerDiseaseDetection;
