
import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const expenseClient = axios.create({
  baseURL: `${API_URL}/farming-expenses`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

expenseClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agrisense_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getExpenses = async () => {
  const response = await expenseClient.get("/");
  return response.data;
};

export const addExpense = async (expenseData) => {
  const response = await expenseClient.post("/", expenseData);
  return response.data;
};

export const updateExpense = async (expenseId, expenseData) => {
  const response = await expenseClient.put(
    `/${expenseId}`,
    expenseData
  );

  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await expenseClient.delete(`/${expenseId}`);
  return response.data;
};

export default expenseClient;
