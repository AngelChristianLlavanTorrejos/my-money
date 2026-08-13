import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";

import { colors } from "../../theme/colors";
import { ErrorText } from "./ErrorText";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  editable?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  editable = true,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const borderClass = error || focused ? "border-brand" : "border-line";

  return (
    <View className="w-full">
      <Text className="mb-2 text-sm font-medium text-ink">{label}</Text>
      <View
        className={`min-h-12 flex-row items-center rounded-lg border bg-canvas px-3 ${borderClass}`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.ink}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 py-3 text-base text-ink"
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setHidden((current) => !current)}
            className="pl-3"
          >
            <Text className="text-sm font-medium text-brand">
              {hidden ? "Show" : "Hide"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ErrorText message={error} />
    </View>
  );
}
