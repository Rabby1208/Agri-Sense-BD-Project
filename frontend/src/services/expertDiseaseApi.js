
import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const diseaseClient = axios.create({
  baseURL: `${API_URL}/experts`,
  timeout: 30000,
});

diseaseClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getDiseaseDetectionHistory = async ({
  farmerId = null,
  limit = 50,
  offset = 0,
} = {}) => {
  const params = { limit, offset };

  if (farmerId) {
    params.farmerId = farmerId;
  }

  const response = await diseaseClient.get(
    "/disease-history",
    { params }
  );

  return response.data;
};

export default diseaseClient;
