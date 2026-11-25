
import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const requestClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

requestClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getExpertsDirectory = async () => {
  const response = await requestClient.get("/experts/");
  return response.data;
};

export const createExpertRequest = async (data) => {
  const response = await requestClient.post("/farmer/requests", data);
  return response.data;
};

export const getMyExpertRequests = async () => {
  const response = await requestClient.get("/farmer/requests");
  return response.data;
};

export const getIncomingExpertRequests = async () => {
  const response = await requestClient.get("/experts/requests");
  return response.data;
};

export const updateExpertRequest = async (id, data) => {
  const response = await requestClient.put(
    `/experts/requests/${id}`,
    data
  );
  return response.data;
};

export default requestClient;
