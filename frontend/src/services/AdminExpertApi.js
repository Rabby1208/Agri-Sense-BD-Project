import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://127.0.0.1:5000/api";

const client = axios.create({
  baseURL: `${API_URL}/admin/experts`,
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAllExperts = async () => {
  const response = await client.get("/");
  return response.data;
};

export const updateExpertStatus = async (id, is_active) => {
  const response = await client.patch(`/${id}/status`, { is_active });
  return response.data;
};

export const deleteExpert = async (id) => {
  const response = await client.delete(`/${id}`);
  return response.data;
};

export default client;