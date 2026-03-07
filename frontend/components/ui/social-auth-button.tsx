import { Button } from "./button";
import { Text } from "./text";

interface SocialAuthButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

export function SocialAuthButton({
  icon,
  label,
  onPress,
}: SocialAuthButtonProps) {
  return (
    <Button
      variant="outline"
      onPress={onPress}
      className="flex-1 flex-row rounded-full h-14 bg-zinc-50 border-zinc-200 active:bg-zinc-100"
    >
      {/* O ícone é renderizado dinamicamente aqui */}
      {icon}
      <Text className="ml-2 font-bold text-zinc-800">{label}</Text>
    </Button>
  );
}
