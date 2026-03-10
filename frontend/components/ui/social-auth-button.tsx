import { ActivityIndicator } from "react-native";
import { Button } from "./button";
import { Text } from "./text";

interface SocialAuthButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SocialAuthButton({
  icon,
  label,
  onPress,
  disabled = false,
  isLoading = false,
}: SocialAuthButtonProps) {
  return (
    <Button
      variant="outline"
      onPress={onPress}
      disabled={disabled}
      className="flex-1 flex-row rounded-full h-14 bg-zinc-50 border-zinc-200 active:bg-zinc-100"
    >
      {isLoading ? <ActivityIndicator size="small" color="#18181b" /> : icon}
      <Text className="ml-2 font-bold text-zinc-800">{label}</Text>
    </Button>
  );
}
