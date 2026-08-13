const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeLicenseKey(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function validateLicenseInput(value: string): string | null {
  if (!normalizeLicenseKey(value)) {
    return "Enter your license key.";
  }
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) {
    return "Enter your email.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return "Enter a password.";
  }
  if (value.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) {
    return "Confirm your password.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export function validateRequiredName(value: string, label: string): string | null {
  if (!value.trim()) {
    return `Enter your ${label.toLowerCase()}.`;
  }
  return null;
}

export type RegisterFieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
};

export function validateRegisterForm(input: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}): RegisterFieldErrors {
  return {
    email: validateEmail(input.email) ?? undefined,
    password: validatePassword(input.password) ?? undefined,
    confirmPassword:
      validateConfirmPassword(input.password, input.confirmPassword) ?? undefined,
    firstName: validateRequiredName(input.firstName, "first name") ?? undefined,
    lastName: validateRequiredName(input.lastName, "last name") ?? undefined,
  };
}

export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export function validateLoginForm(input: {
  email: string;
  password: string;
}): LoginFieldErrors {
  return {
    email: validateEmail(input.email) ?? undefined,
    password: input.password ? undefined : "Enter a password.",
  };
}

export function hasFieldErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
