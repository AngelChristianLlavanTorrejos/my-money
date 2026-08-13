import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../services/supabase/client";
import { signOutAccount } from "../services/supabase/auth";
import type { AuthContextValue } from "../types/auth";
import { normalizeLicenseKey } from "../utils/validation";
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from "../utils/secureStorage";

const PENDING_LICENSE_KEY = "pending_license_key";

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [pendingLicense, setPendingLicense] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const [{ data }, storedLicense] = await Promise.all([
          supabase.auth.getSession(),
          getSecureItem(PENDING_LICENSE_KEY),
        ]);

        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setPendingLicense(storedLicense);
      } catch (error) {
        if (__DEV__) {
          console.warn("[auth] bootstrap failed", error);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const setPendingLicenseKey = useCallback(async (key: string) => {
    const normalized = normalizeLicenseKey(key);
    await setSecureItem(PENDING_LICENSE_KEY, normalized);
    setPendingLicense(normalized);
  }, []);

  const clearPendingLicenseKey = useCallback(async () => {
    await deleteSecureItem(PENDING_LICENSE_KEY);
    setPendingLicense(null);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAccount();
    await clearPendingLicenseKey();
  }, [clearPendingLicenseKey]);

  const beginAuthOperation = useCallback(() => {
    setAuthBusy(true);
  }, []);

  const endAuthOperation = useCallback(() => {
    setAuthBusy(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      session: authBusy ? null : session,
      user: authBusy ? null : session?.user ?? null,
      pendingLicense,
      authBusy,
      setPendingLicenseKey,
      clearPendingLicenseKey,
      beginAuthOperation,
      endAuthOperation,
      signOut,
    }),
    [
      authBusy,
      beginAuthOperation,
      clearPendingLicenseKey,
      endAuthOperation,
      isReady,
      pendingLicense,
      session,
      setPendingLicenseKey,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
