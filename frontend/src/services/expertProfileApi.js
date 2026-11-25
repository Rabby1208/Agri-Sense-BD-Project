import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://127.0.0.1:5000/api";

const client = axios.create({
  baseURL: `${API_URL}/experts`,
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getExpertProfile = async () => {
  const response = await client.get("/profile");
  return response.data;
};

export const updateExpertProfile = async (data) => {
  const response = await client.put("/profile", data);
  return response.data;
};

export default client;