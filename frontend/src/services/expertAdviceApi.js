
import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const expertAdviceClient = axios.create({
  baseURL: `${API_URL}/experts`,
  timeout: 30000,
});

expertAdviceClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getExpertAdvice = async () => {
  const response = await expertAdviceClient.get("/advice");
  return response.data;
};

export const getExpertFarmers = async () => {
  const response = await expertAdviceClient.get("/farmers");
  return response.data;
};

export const createExpertAdvice = async (data) => {
  const response = await expertAdviceClient.post("/advice", data);
  return response.data;
};

export const updateExpertAdvice = async (id, data) => {
  const response = await expertAdviceClient.put(`/advice/${id}`, data);
  return response.data;
};

export const deleteExpertAdvice = async (id) => {
  const response = await expertAdviceClient.delete(`/advice/${id}`);
  return response.data;
};

export default expertAdviceClient;
