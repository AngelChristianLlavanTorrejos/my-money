import type { Session, User } from "@supabase/supabase-js";

export type AuthMode = "register" | "login";

export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  isReady: boolean;
  session: Session | null;
  user: User | null;
  pendingLicense: string | null;
  authBusy: boolean;
  setPendingLicenseKey: (key: string) => Promise<void>;
  clearPendingLicenseKey: () => Promise<void>;
  beginAuthOperation: () => void;
  endAuthOperation: () => void;
  signOut: () => Promise<void>;
};
