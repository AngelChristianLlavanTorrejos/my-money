import { Platform } from "react-native";

import type { LicenseValidationResult } from "../../types/database";
import { AppError, mapError } from "../../utils/errors";
import { normalizeLicenseKey } from "../../utils/validation";
import { assertSupabaseConfig, supabase } from "./client";

export async function validateLicenseKey(
  licenseKey: string,
): Promise<LicenseValidationResult> {
  assertSupabaseConfig();

  const normalized = normalizeLicenseKey(licenseKey);
  const { data, error } = await supabase.rpc("validate_license", {
    p_key: normalized,
  });

  if (error) {
    throw mapError(error);
  }

  const result = data as LicenseValidationResult | null;

  if (result === "available" || result === "claimed") {
    return result;
  }

  if (result === "revoked" || result === "invalid" || !result) {
    throw new AppError("INVALID_LICENSE", "This license key is invalid.");
  }

  throw new AppError("INVALID_LICENSE", "This license key is invalid.");
}

export async function completeOnboarding(input: {
  licenseKey: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): Promise<void> {
  assertSupabaseConfig();

  const { error } = await supabase.rpc("complete_onboarding", {
    p_license_key: normalizeLicenseKey(input.licenseKey),
    p_first_name: input.firstName?.trim() || null,
    p_middle_name: input.middleName?.trim() || null,
    p_last_name: input.lastName?.trim() || null,
    p_platform: Platform.OS,
  });

  if (error) {
    throw mapError(error);
  }
}
