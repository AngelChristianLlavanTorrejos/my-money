export type LicenseStatus = "available" | "claimed" | "revoked";

export type LicenseValidationResult = "invalid" | LicenseStatus;

export type License = {
  id: string;
  license_key: string;
  status: LicenseStatus;
  user_id: string | null;
  claimed_at: string | null;
  created_at: string;
};
