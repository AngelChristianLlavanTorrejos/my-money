import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../hooks/useAuth";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { HomePlaceholderScreen } from "../screens/app/HomePlaceholderScreen";
import { LicenseKeyScreen } from "../screens/license/LicenseKeyScreen";
import { colors } from "../theme/colors";

export type RootStackParamList = {
  License: undefined;
  Auth: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.canvas,
    card: colors.canvas,
    text: colors.ink,
    border: colors.line,
    primary: colors.brand,
    notification: colors.brand,
  },
};

export function RootNavigator() {
  const { isReady, session, pendingLicense } = useAuth();

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
        {session ? (
          <Stack.Screen name="Home" component={HomePlaceholderScreen} />
        ) : pendingLicense ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="License" component={LicenseKeyScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
