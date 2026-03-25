import { Button } from "./button";

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
      label={label}
      leftIcon={icon}
      isLoading={isLoading}
      onPress={onPress}
      disabled={disabled}
      rounded="full"
      className="flex-1 bg-zinc-50 border-zinc-200"
      labelClasses="text-zinc-800"
    />
  );
}
