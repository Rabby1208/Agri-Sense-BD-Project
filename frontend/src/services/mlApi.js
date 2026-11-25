
import axios from "axios";

const ML_API_URL =
  import.meta.env.VITE_ML_API_URL || "http://127.0.0.1:8000";

const mlClient = axios.create({
  baseURL: ML_API_URL,
  timeout: 120000,
});

export const predictPlantDisease = async (crop, imageFile) => {
  if (!crop || !imageFile) {
    throw new Error("Please select a crop and upload an image.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await mlClient.post("/predict", formData, {
    params: { crop },
  });

  return response.data;
};
