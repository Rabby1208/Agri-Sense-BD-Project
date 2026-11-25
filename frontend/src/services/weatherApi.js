
import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const weatherClient = axios.create({
  baseURL: `${API_URL}/weather`,
  timeout: 30000,
});

export const getWeatherForecast = async (latitude, longitude) => {
  const response = await weatherClient.get("/", {
    params: {
      latitude,
      longitude,
    },
  });

  return response.data;
};

export default weatherClient;
