import axios from "axios";
import { clearAuthSession, getAuthToken } from "../utils/authStorage";

const normalizeApiBase = (rawBaseUrl) => {
  if (!rawBaseUrl) return "/api";

  const trimmed = rawBaseUrl.trim();
  if (!trimmed) return "/api";

  if (trimmed === "/api") return "/api";

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
};

const resolvedBaseUrl = normalizeApiBase(process.env.REACT_APP_API_URL);

const API = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

let lastSessionExpiredDispatchAt = 0;

const isAuthEndpointRequest = (url = "") => {
  if (!url) return false;
  return /\/auth\/(login|register|social|demo)\b/i.test(url);
};

// Request interceptor
API.interceptors.request.use((req) => {
  const token = getAuthToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
API.interceptors.response.use(
  (res) => res,
  (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      if (isAuthEndpointRequest(requestUrl)) {
        return Promise.reject(error);
      }

      clearAuthSession();

      if (typeof window !== "undefined") {
        const now = Date.now();
        const currentPath = window.location?.pathname || "";
        const isAuthPage = /^\/(login|signup|register)$/.test(currentPath);
        const shouldDispatch = !isAuthPage && now - lastSessionExpiredDispatchAt > 1500;

        if (shouldDispatch) {
          lastSessionExpiredDispatchAt = now;
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;