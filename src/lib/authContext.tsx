import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentOfficer,
  loginOfficer,
} from "@/lib/crimeInsightApi";
import {
  clearStoredAuthSession,
  persistAuthSession,
  readStoredAuthToken,
  readStoredOfficer,
  type AuthOfficer,
  type OfficerRole,
} from "@/lib/authStorage";

interface AuthContextValue {
  officer: AuthOfficer | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: OfficerRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredAuthToken());
  const [officer, setOfficer] = useState<AuthOfficer | null>(() => readStoredOfficer());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = readStoredAuthToken();
      if (!storedToken) {
        if (!cancelled) {
          setToken(null);
          setOfficer(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetchCurrentOfficer();
        if (cancelled) {
          return;
        }

        setToken(storedToken);
        setOfficer(response.officer);
        persistAuthSession(storedToken, response.officer);
      } catch {
        if (cancelled) {
          return;
        }

        clearStoredAuthSession();
        setToken(null);
        setOfficer(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      officer,
      token,
      isLoading,
      isAuthenticated: Boolean(token && officer),
      login: async (username, password) => {
        const response = await loginOfficer({ username, password });
        persistAuthSession(response.token, response.officer);
        setToken(response.token);
        setOfficer(response.officer);
      },
      logout: () => {
        clearStoredAuthSession();
        setToken(null);
        setOfficer(null);
      },
      hasRole: (...roles) => Boolean(officer && roles.includes(officer.role)),
    }),
    [isLoading, officer, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
