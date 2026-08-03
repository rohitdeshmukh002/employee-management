import axios from "axios";

/**
 * Axios instance for the FastAPI backend.
 * Set VITE_API_URL in a .env file, e.g. VITE_API_URL=http://localhost:8000/api
 * Falls back to "/api" so the Vite proxy can forward during local/docker dev.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "emp_portal_token";
const USER_KEY = "emp_portal_user";

export type Role = "admin" | "employee";

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role: Role;
  employee_id?: number | null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function clearAuthStorage() {
  setToken(null);
  setStoredUser(null);
}

export function goToDashboard() {
  if (typeof window === "undefined") return;
  window.location.assign("/dashboard");
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") return Promise.reject(error);
    if (error.response?.status !== 401) return Promise.reject(error);

    const url = String(error.config?.url ?? "");
    // Failed login/register must not wipe storage or force a reload loop.
    if (url.includes("/auth/login") || url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    clearAuthStorage();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
