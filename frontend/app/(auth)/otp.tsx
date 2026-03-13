import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // Cofre nativo
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { api } from "@/src/services/api";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Resgata o email passado via URL pelo login.tsx
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const codeArray = new Array(CODE_LENGTH).fill(0);

  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) return;

    setIsLoading(true);
    setHasError(false);

    try {
      // 1. Envia o código e o e-mail para o C# validar
      const response = await api.post("/auth/verify-otp", {
        email: email,
        code: code,
      });

      // 2. Extrai o Token JWT da resposta
      const { token } = response.data;

      if (token) {
        // 3. Salva no cofre protegido do iOS/Android
        await SecureStore.setItemAsync("reuse_jwt_token", token);
        console.log("MÁGICA FEITA! Token salvo na biometria do sistema.");

        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Código inválido", error);
      setHasError(true);
      setCode(""); // Limpa o input se errar
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View
          className="flex-1 px-6"
          style={{
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 16, 24),
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-full border border-zinc-200 items-center justify-center mb-8 active:bg-zinc-50"
          >
            <ChevronLeft size={24} color="#18181b" strokeWidth={2} />
          </TouchableOpacity>

          <Text variant="h2" className="text-zinc-900 border-none pb-0 mb-2">
            Enter the Code
          </Text>
          <Text className="text-base text-zinc-500 mb-2">
            A verification code has been sent to
          </Text>
          {/* E-mail dinâmico */}
          <Text className="text-base font-bold text-zinc-900 mb-10">
            {email || "email@desconhecido.com"}
          </Text>

          <View className="w-full relative h-16 mb-8">
            <View className="flex-row justify-between w-full h-full absolute">
              {codeArray.map((_, index) => {
                const digit = code[index] || "";
                const isCurrent = index === code.length;
                const isLastFilled =
                  index === CODE_LENGTH - 1 && code.length === CODE_LENGTH;
                const isActive = isCurrent || isLastFilled;

                // Fica vermelho se a API retornar erro
                let borderColor = "border-zinc-200 bg-zinc-50";
                if (isActive) borderColor = "border-emerald-500 bg-emerald-50";
                if (hasError) borderColor = "border-red-500 bg-red-50";

                return (
                  <View
                    key={index}
                    className={`w-[14%] h-full rounded-2xl items-center justify-center border-2 ${borderColor}`}
                  >
                    <Text
                      className={`text-2xl font-bold ${hasError ? "text-red-500" : "text-zinc-900"}`}
                    >
                      {digit}
                    </Text>
                  </View>
                );
              })}
            </View>

            <TextInput
              value={code}
              onChangeText={(text) => {
                setCode(text.replace(/[^0-9]/g, ""));
                setHasError(false); // Remove o vermelho ao digitar de novo
              }}
              maxLength={CODE_LENGTH}
              keyboardType="number-pad"
              autoFocus={true}
              className="absolute w-full h-full opacity-0"
              style={{ color: "transparent" }}
            />
          </View>

          <View className="flex-row justify-center items-center mb-10 h-14">
            <Text className="text-zinc-500 mr-1">
              Didn&apos;t receive code?
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log("Reenviando OTP...")}
            >
              <Text className="text-emerald-600 font-bold underline">
                Resend
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View className="w-full items-center justify-center mt-2 h-14">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
