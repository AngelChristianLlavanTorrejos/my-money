import { AppError, mapError } from "../../utils/errors";
import { assertSupabaseConfig, supabase } from "./client";
import { completeOnboarding } from "./licenses";

export async function registerAccount(input: {
  email: string;
  password: string;
  firstName: string;
  middleName: string;
  lastName: string;
  licenseKey: string;
}): Promise<void> {
  assertSupabaseConfig();

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) {
    throw mapError(error);
  }

  if (!data.session) {
    throw new AppError(
      "EMAIL_CONFIRMATION_REQUIRED",
      "Check your email to confirm your account before continuing.",
    );
  }

  try {
    await completeOnboarding({
      licenseKey: input.licenseKey,
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
    });
  } catch (onboardingError) {
    await supabase.auth.signOut();
    throw mapError(onboardingError);
  }
}

export async function loginAccount(input: {
  email: string;
  password: string;
  licenseKey: string;
}): Promise<void> {
  assertSupabaseConfig();

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) {
    throw mapError(error);
  }

  try {
    await completeOnboarding({
      licenseKey: input.licenseKey,
    });
  } catch (onboardingError) {
    await supabase.auth.signOut();
    throw mapError(onboardingError);
  }
}

export async function signOutAccount(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw mapError(error);
  }
}
