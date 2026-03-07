import { View } from "react-native";
import { Text } from "./text";

export function DividerWithText({ text }: { text: string }) {
  return (
    <View className="flex-row items-center my-6 gap-4 w-full">
      <View className="flex-1 h-[1px] bg-border" />

      <Text
        variant="small"
        className="text-muted-foreground font-bold uppercase tracking-wider"
      >
        {text}
      </Text>

      <View className="flex-1 h-[1px] bg-border" />
    </View>
  );
}
