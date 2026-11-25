
import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const diseaseClient = axios.create({
  baseURL: `${API_URL}/disease-detection`,
  timeout: 120000,
});

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

export const predictCropDisease = async (imageFile, crop) => {
  const formData = new FormData();

  formData.append("image", imageFile);
  formData.append("crop", crop);

  const response = await diseaseClient.post("/predict", formData);

  return response.data;
};

export const getMyDiseaseHistory = async ({
  limit = 20,
  offset = 0,
} = {}) => {
  const response = await diseaseClient.get("/history", {
    params: { limit, offset },
  });

  return response.data;
};

export default diseaseClient;
