import axios from "axios";

/**
 * Axios instance for the FastAPI backend.
 * Set VITE_API_URL in a .env file, e.g. VITE_API_URL=http://localhost:8000
 * Falls back to "/api" so you can proxy during local dev.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "emp_portal_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

// Attach JWT to every request (FastAPI: Authorization: Bearer <token>)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
