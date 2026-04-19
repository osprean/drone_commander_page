import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "/";

export const api = axios.create({
  baseURL: import.meta.env.DEV ? "" : API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function getCsrfToken(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

api.interceptors.request.use((config) => {
  const csrf = getCsrfToken();
  const method = (config.method ?? "get").toLowerCase();
  if (csrf && !["get", "head", "options"].includes(method)) {
    config.headers.set("X-CSRF-TOKEN", csrf);
  }
  return config;
});

let on401: (() => void) | null = null;
export const setOn401 = (fn: () => void) => {
  on401 = fn;
};

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401 && on401) on401();
    return Promise.reject(err);
  },
);

export const apiBaseUrl = () => (import.meta.env.DEV ? window.location.origin : API_URL);
