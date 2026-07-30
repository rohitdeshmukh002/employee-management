import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getToken, setToken } from "./api";

export type Role = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = "emp_portal_user";

/**
 * NOTE: This is a mock auth layer for frontend development.
 * Swap the bodies of login/register with real FastAPI calls, e.g.:
 *   const { data } = await api.post("/auth/login", { email, password });
 *   setToken(data.access_token);
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(USER_KEY);
    if (stored && getToken()) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (u: User) => {
    setUser(u);
    window.localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const login = async (email: string, _password: string) => {
    // TODO: replace with api.post("/auth/login", ...)
    await new Promise((r) => setTimeout(r, 500));
    const role: Role = email.toLowerCase().startsWith("admin") ? "admin" : "employee";
    setToken("mock-jwt-token");
    persist({
      id: "1",
      name: email.split("@")[0] || "User",
      email,
      role,
    });
  };

  const register = async (name: string, email: string, _password: string) => {
    // TODO: replace with api.post("/auth/register", ...)
    await new Promise((r) => setTimeout(r, 500));
    setToken("mock-jwt-token");
    persist({ id: "1", name, email, role: "employee" });
  };

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
