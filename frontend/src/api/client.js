import axios from "axios";

const apiHost = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
export const apiBaseUrl = apiHost ? `${apiHost}/api` : "/api";
export const assetBaseUrl = apiHost;

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

export const getAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return assetBaseUrl ? `${assetBaseUrl}${path}` : path;
};

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


