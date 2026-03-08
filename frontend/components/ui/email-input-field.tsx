import { Mail } from "lucide-react-native";
import { TextInput, View } from "react-native";
import { Text } from "./text";

interface EmailInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  hasError?: boolean;
}

export function EmailInputField({
  value,
  onChangeText,
  hasError,
}: EmailInputFieldProps) {
  return (
    <View className="w-full gap-2">
      <Text
        variant="small"
        className={`ml-1 font-semibold ${hasError ? "text-red-500" : "text-zinc-800"}`}
      >
        Endereço de E-mail
      </Text>

      <View
        className={`flex-row items-center rounded-2xl h-20 overflow-hidden border px-5 ${
          hasError
            ? "border-red-500 bg-red-50"
            : "border-zinc-200 bg-zinc-50 focus:border-primary"
        }`}
      >
        {/* Ícone de E-mail */}
        <Mail
          size={24}
          color={hasError ? "#ef4444" : "#a1a1aa"}
          strokeWidth={2}
          style={{ marginRight: 12 }}
        />

        <TextInput
          className={`flex-1 h-full text-xl ${hasError ? "text-red-900 bg-red-50" : "text-zinc-900 bg-zinc-50"}`}
          placeholder="seu@email.com"
          placeholderTextColor={hasError ? "#fca5a5" : "#a1a1aa"}
          // Configurações cruciais para e-mail no mobile:
          keyboardType="email-address"
          autoCapitalize="none" // Não começa com letra maiúscula
          autoCorrect={false} // Desativa o corretor ortográfico
          returnKeyType="done"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}
