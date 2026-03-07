import { useRouter } from "expo-router";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeft } from "lucide-react-native"; // Importe no topo

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Array falso para renderizar as caixinhas baseado no tamanho exigido
  const codeArray = new Array(CODE_LENGTH).fill(0);

  const handleVerify = () => {
    if (code.length !== CODE_LENGTH) return;

    setIsLoading(true);
    // Simula a verificação na API
    setTimeout(() => {
      setIsLoading(false);
      console.log("Código verificado com sucesso!");
      // router.replace("/(tabs)/home"); // Navega para o App real
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
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
          {/* Header com Botão de Voltar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-full border border-zinc-200 items-center justify-center mb-8 active:bg-zinc-50"
          >
            <ChevronLeft size={24} color="#18181b" strokeWidth={2} />
          </TouchableOpacity>

          {/* Textos de Instrução */}
          <Text variant="h2" className="text-zinc-900 border-none pb-0 mb-2">
            Enter the Code
          </Text>
          <Text className="text-base text-zinc-500 mb-2">
            A verification code has been sent to
          </Text>
          {/* Aqui trocamos o telefone chumbado por um e-mail.
    (Num cenário real, você resgata esse e-mail dos parâmetros da rota) */}
          <Text className="text-base font-bold text-zinc-900 mb-10">
            marina@reuse.com
          </Text>

          {/* O COMPONENTE OTP MÁGICO */}
          <View className="w-full relative h-16 mb-8">
            <View className="flex-row justify-between w-full h-full absolute">
              {codeArray.map((_, index) => {
                const digit = code[index] || "";
                // Lógica para descobrir qual caixa está "ativa" (foco verde)
                const isCurrent = index === code.length;
                const isLastFilled =
                  index === CODE_LENGTH - 1 && code.length === CODE_LENGTH;
                const isActive = isCurrent || isLastFilled;

                return (
                  <View
                    key={index}
                    className={`w-[14%] h-full rounded-2xl items-center justify-center border-2 ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50" // Foco Ativo (Verde)
                        : "border-zinc-200 bg-zinc-50" // Inativo (Cinza)
                    }`}
                  >
                    <Text className="text-2xl font-bold text-zinc-900">
                      {digit}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* O Input Invisível que o usuário realmente usa */}
            <TextInput
              value={code}
              onChangeText={(text) => {
                // Filtra para aceitar apenas números
                setCode(text.replace(/[^0-9]/g, ""));
              }}
              maxLength={CODE_LENGTH}
              keyboardType="number-pad"
              autoFocus={true} // Abre o teclado instantaneamente ao entrar na tela
              className="absolute w-full h-full opacity-0"
              style={{ color: "transparent" }} // Garante que o cursor nativo não apareça
            />
          </View>

          {/* Reenviar Código */}
          <View className="flex-row justify-center items-center mb-auto">
            <Text className="text-zinc-500 mr-1">
              Didn&apos;t receive code?
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log("Reenviando SMS...")}
            >
              <Text className="text-emerald-600 font-bold underline">
                Resend
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Verificar (Acompanha a lógica de disable + Tailwind) */}
          <Button
            disabled={code.length !== CODE_LENGTH || isLoading}
            className={`w-full h-14 rounded-full mt-8 ${
              code.length === CODE_LENGTH
                ? "bg-emerald-600 active:bg-emerald-700"
                : "bg-zinc-300"
            }`}
            onPress={handleVerify}
          >
            <Text className="text-lg font-bold text-white">
              {isLoading ? "Verifying..." : "Verify"}
            </Text>
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
