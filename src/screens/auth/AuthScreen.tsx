import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { ErrorText } from "../../components/ui/ErrorText";
import { Screen } from "../../components/ui/Screen";
import { TextField } from "../../components/ui/TextField";
import { useAuth } from "../../hooks/useAuth";
import { loginAccount, registerAccount } from "../../services/supabase/auth";
import type { AuthMode } from "../../types/auth";
import { getErrorMessage } from "../../utils/errors";
import {
  hasFieldErrors,
  validateLoginForm,
  validateRegisterForm,
  type LoginFieldErrors,
  type RegisterFieldErrors,
} from "../../utils/validation";

export function AuthScreen() {
  const {
    pendingLicense,
    clearPendingLicenseKey,
    beginAuthOperation,
    endAuthOperation,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerErrors, setRegisterErrors] = useState<RegisterFieldErrors>({});
  const [loginErrors, setLoginErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  function switchMode(next: AuthMode) {
    setMode(next);
    setFormError(undefined);
    setRegisterErrors({});
    setLoginErrors({});
  }

  async function onSubmit() {
    if (!pendingLicense) {
      setFormError("Enter a license key before continuing.");
      return;
    }

    setFormError(undefined);

    if (mode === "register") {
      const nextErrors = validateRegisterForm({
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
      });
      setRegisterErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) {
        return;
      }
    } else {
      const nextErrors = validateLoginForm({ email, password });
      setLoginErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) {
        return;
      }
    }

    setLoading(true);
    beginAuthOperation();

    try {
      if (mode === "register") {
        await registerAccount({
          email,
          password,
          firstName,
          middleName,
          lastName,
          licenseKey: pendingLicense,
        });
      } else {
        await loginAccount({
          email,
          password,
          licenseKey: pendingLicense,
        });
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      endAuthOperation();
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => {
          void clearPendingLicenseKey();
        }}
        className="self-start py-1"
      >
        <Text className="text-sm font-medium text-brand">Use a different license key</Text>
      </Pressable>

      <Text className="mt-8 text-3xl font-semibold text-ink">
        {mode === "register" ? "Create account" : "Sign in"}
      </Text>
      <Text className="mt-3 text-base leading-6 text-ink">
        {mode === "register"
          ? "Create your account to claim this license and start using the app."
          : "Sign in with the account linked to this license."}
      </Text>

      <View className="mt-10 gap-5">
        {mode === "register" ? (
          <>
            <TextField
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jane"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              error={registerErrors.firstName}
              editable={!loading}
            />
            <TextField
              label="Middle Name"
              value={middleName}
              onChangeText={setMiddleName}
              placeholder="Optional"
              autoCapitalize="words"
              autoComplete="additional-name"
              textContentType="middleName"
              editable={!loading}
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Doe"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              error={registerErrors.lastName}
              editable={!loading}
            />
          </>
        ) : null}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={mode === "register" ? registerErrors.email : loginErrors.email}
          editable={!loading}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === "register" ? "password-new" : "password"}
          textContentType={mode === "register" ? "newPassword" : "password"}
          error={mode === "register" ? registerErrors.password : loginErrors.password}
          editable={!loading}
        />
        {mode === "register" ? (
          <TextField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            error={registerErrors.confirmPassword}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={() => {
              void onSubmit();
            }}
          />
        ) : null}
      </View>

      <View className="mt-4">
        <ErrorText message={formError} />
      </View>

      <View className="mt-8">
        <Button
          label={mode === "register" ? "Create account" : "Sign in"}
          onPress={() => {
            void onSubmit();
          }}
          loading={loading}
          disabled={loading}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => switchMode(mode === "register" ? "login" : "register")}
        className="mt-6 items-center py-2"
      >
        <Text className="text-center text-sm text-ink">
          {mode === "register" ? "Already have an account? " : "Need an account? "}
          <Text className="font-semibold text-brand">
            {mode === "register" ? "Sign In" : "Create Account"}
          </Text>
        </Text>
      </Pressable>
    </Screen>
  );
}
