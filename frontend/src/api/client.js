import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true
});

// Handle FormData requests properly
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Don't set Content-Type header, let browser set it with multipart boundary
    delete config.headers["Content-Type"];
  }
  return config;
});

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";
