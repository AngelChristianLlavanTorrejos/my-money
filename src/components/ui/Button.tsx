import { ActivityIndicator, Pressable, Text } from "react-native";

import { colors } from "../../theme/colors";

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, loading = false, disabled = false }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      className={`h-12 items-center justify-center rounded-lg bg-brand px-4 ${
        isDisabled ? "opacity-50" : "active:opacity-90"
      }`}
    >
      {loading ? (
        <ActivityIndicator color={colors.canvas} />
      ) : (
        <Text className="text-base font-semibold text-canvas">{label}</Text>
      )}
    </Pressable>
  );
}
