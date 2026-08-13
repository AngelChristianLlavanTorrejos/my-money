import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { ErrorText } from "../../components/ui/ErrorText";
import { Screen } from "../../components/ui/Screen";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/errors";

export function HomePlaceholderScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSignOut() {
    setError(undefined);
    setLoading(true);
    try {
      await signOut();
    } catch (signOutError) {
      setError(getErrorMessage(signOutError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand">
        <Text className="text-lg font-semibold text-canvas">M</Text>
      </View>
      <Text className="mt-8 text-3xl font-semibold text-ink">You are signed in</Text>
      <Text className="mt-3 text-base leading-6 text-ink">
        Your license is linked to this account. The main application will live here.
      </Text>
      {user?.email ? (
        <Text className="mt-6 text-base text-ink">{user.email}</Text>
      ) : null}

      <View className="mt-10">
        <ErrorText message={error} />
        <View className="mt-4">
          <Button
            label="Log out"
            onPress={() => {
              void onSignOut();
            }}
            loading={loading}
            disabled={loading}
          />
        </View>
      </View>
    </Screen>
  );
}
