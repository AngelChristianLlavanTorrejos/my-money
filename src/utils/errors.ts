export class AppError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_MESSAGE =
  "Unable to connect. Please check your internet connection and try again.";

function isNetworkError(message: string, name?: string): boolean {
  const haystack = `${name ?? ""} ${message}`.toLowerCase();
  return (
    haystack.includes("network") ||
    haystack.includes("fetch") ||
    haystack.includes("failed to connect") ||
    haystack.includes("timeout")
  );
}

function extractCode(raw: string): string | null {
  const codes = [
    "LICENSE_ALREADY_CLAIMED",
    "INVALID_LICENSE",
    "LICENSE_REVOKED",
    "USER_HAS_LICENSE",
    "NOT_AUTHENTICATED",
    "INVALID_PROFILE",
    "EMAIL_CONFIRMATION_REQUIRED",
  ];

  return codes.find((code) => raw.includes(code)) ?? null;
}

export function mapError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const record = error as {
    message?: string;
    code?: string;
    name?: string;
    status?: number;
  };

  const message = record.message ?? "";
  const code = record.code ?? "";
  const exceptionCode = extractCode(message);

  if (isNetworkError(message, record.name)) {
    return new AppError("NETWORK", NETWORK_MESSAGE);
  }

  if (exceptionCode === "LICENSE_ALREADY_CLAIMED") {
    return new AppError(
      exceptionCode,
      "This license key has already been registered.",
    );
  }

  if (exceptionCode === "INVALID_LICENSE" || exceptionCode === "LICENSE_REVOKED") {
    return new AppError(exceptionCode, "This license key is invalid.");
  }

  if (exceptionCode === "USER_HAS_LICENSE") {
    return new AppError(
      exceptionCode,
      "This account is already linked to a different license.",
    );
  }

  if (exceptionCode === "EMAIL_CONFIRMATION_REQUIRED") {
    return new AppError(
      exceptionCode,
      "Check your email to confirm your account before continuing.",
    );
  }

  if (
    code === "invalid_credentials" ||
    message.toLowerCase().includes("invalid login credentials")
  ) {
    return new AppError("INVALID_CREDENTIALS", "Invalid email or password.");
  }

  if (
    code === "user_already_exists" ||
    message.toLowerCase().includes("user already registered")
  ) {
    return new AppError(
      "USER_EXISTS",
      "An account with this email already exists. Sign in instead.",
    );
  }

  if (code === "email_not_confirmed") {
    return new AppError(
      "EMAIL_CONFIRMATION_REQUIRED",
      "Check your email to confirm your account before continuing.",
    );
  }

  if (code === "weak_password" || message.toLowerCase().includes("password")) {
    if (message.toLowerCase().includes("weak") || code === "weak_password") {
      return new AppError(
        "WEAK_PASSWORD",
        "Password is too weak. Use at least 8 characters.",
      );
    }
  }

  if (__DEV__) {
    console.warn("[auth]", record.code ?? record.name, message);
  }

  return new AppError("UNKNOWN", GENERIC_MESSAGE);
}

export function getErrorMessage(error: unknown): string {
  return mapError(error).message;
}
