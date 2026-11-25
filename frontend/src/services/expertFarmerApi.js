
import axios from "axios";

const API_URL =
    import.meta.env.VITE_BACKEND_API_URL ||
    "http://127.0.0.1:5000/api";

const farmerClient = axios.create({
    baseURL: `${API_URL}/experts`,
    timeout: 30000
});

farmerClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("agrisense_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getExpertFarmers = async () => {
    const response = await farmerClient.get("/farmers");
    return response.data;
};

export const getExpertFarmerDetails = async (farmerId) => {
    const response = await farmerClient.get(`/farmers/${farmerId}`);
    return response.data;
};

export default farmerClient;
