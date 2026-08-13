import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { ErrorText } from "../../components/ui/ErrorText";
import { Screen } from "../../components/ui/Screen";
import { TextField } from "../../components/ui/TextField";
import { useAuth } from "../../hooks/useAuth";
import { validateLicenseKey } from "../../services/supabase/licenses";
import { getErrorMessage } from "../../utils/errors";
import { validateLicenseInput } from "../../utils/validation";

export function LicenseKeyScreen() {
  const { setPendingLicenseKey } = useAuth();
  const [licenseKey, setLicenseKey] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onContinue() {
    const nextFieldError = validateLicenseInput(licenseKey) ?? undefined;
    setFieldError(nextFieldError);
    setFormError(undefined);

    if (nextFieldError) {
      return;
    }

    setLoading(true);
    try {
      await validateLicenseKey(licenseKey);
      await setPendingLicenseKey(licenseKey);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="mb-10">
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand">
          <Text className="text-lg font-semibold text-canvas">M</Text>
        </View>
        <Text className="mt-5 text-sm font-medium text-ink">My Money</Text>
      </View>

      <Text className="text-3xl font-semibold text-ink">Enter your license key</Text>
      <Text className="mt-3 text-base leading-6 text-ink">
        Enter the license key provided to you to activate this application.
      </Text>

      <View className="mt-10">
        <TextField
          label="License Key"
          value={licenseKey}
          onChangeText={(value) => {
            setLicenseKey(value);
            if (fieldError) {
              setFieldError(undefined);
            }
            if (formError) {
              setFormError(undefined);
            }
          }}
          placeholder="LICENSE-XXXX-0000"
          autoCapitalize="characters"
          autoComplete="off"
          textContentType="none"
          returnKeyType="done"
          error={fieldError}
          editable={!loading}
          onSubmitEditing={() => {
            void onContinue();
          }}
        />
        <ErrorText message={formError} />
      </View>

      <View className="mt-8">
        <Button
          label="Continue"
          onPress={() => {
            void onContinue();
          }}
          loading={loading}
          disabled={loading}
        />
      </View>
    </Screen>
  );
}
