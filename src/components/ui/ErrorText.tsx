import { Text } from "react-native";

type ErrorTextProps = {
  message?: string;
};

export function ErrorText({ message }: ErrorTextProps) {
  if (!message) {
    return null;
  }

  return <Text className="mt-2 text-sm text-brand">{message}</Text>;
}
