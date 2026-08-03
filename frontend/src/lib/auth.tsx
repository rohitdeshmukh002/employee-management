import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import {
  api,
  clearAuthStorage,
  getApiErrorMessage,
  getStoredUser,
  getToken,
  goToDashboard,
  setStoredUser,
  setToken,
  type AuthUser,
  type Role,
} from "./api";

export type { Role };
export type User = AuthUser;

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthApiUser {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  employee_id: number | null;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthApiUser;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Share one in-flight /auth/me so Strict Mode remounts don't double-hit the API. */
let pendingMeRequest: Promise<AuthApiUser> | null = null;

function fetchCurrentUser(): Promise<AuthApiUser> {
  if (!pendingMeRequest) {
    pendingMeRequest = api
      .get<AuthApiUser>("/auth/me")
      .then((res) => res.data)
      .finally(() => {
        pendingMeRequest = null;
      });
  }
  return pendingMeRequest;
}

function mapUser(apiUser: AuthApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.full_name,
    email: apiUser.email,
    role: apiUser.role,
    employee_id: apiUser.employee_id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Start false so SSR does not paint a permanent "Checking your session..." state.
  const [isLoading, setIsLoading] = useState(false);
  const sessionEpoch = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const epoch = sessionEpoch.current;

    const bootstrap = async () => {
      const token = getToken();
      const stored = getStoredUser();

      if (!token) {
        clearAuthStorage();
        if (!cancelled && sessionEpoch.current === epoch) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled && sessionEpoch.current === epoch) {
        setIsLoading(true);
        if (stored) setUser(stored);
      }

      try {
        const data = await fetchCurrentUser();
        if (cancelled || sessionEpoch.current !== epoch) return;
        const mapped = mapUser(data);
        setUser(mapped);
        setStoredUser(mapped);
      } catch {
        if (cancelled || sessionEpoch.current !== epoch) return;
        clearAuthStorage();
        setUser(null);
      } finally {
        if (!cancelled && sessionEpoch.current === epoch) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = (payload: TokenResponse) => {
    sessionEpoch.current += 1;
    const mapped = mapUser(payload.user);
    setToken(payload.access_token);
    setStoredUser(mapped);
    setUser(mapped);
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
      persistSession(data);
      goToDashboard();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Invalid email or password"));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await api.post<TokenResponse>("/auth/register", {
        name,
        email,
        password,
      });
      persistSession(data);
      goToDashboard();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Unable to create account"));
    }
  };

  const logout = () => {
    sessionEpoch.current += 1;
    clearAuthStorage();
    setUser(null);
    window.location.assign("/login");
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
