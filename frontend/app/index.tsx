import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
// Importante para garantir que os elementos respeitem o Notch/Barra do home
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-emerald-500">
      <StatusBar style="light" />

      <Image
        source={require("../src/assets/images/background-onboarding.png")}
        className="absolute -left-10 bottom-0 w-full"
        resizeMode="contain"
        accessible={false}
        importantForAccessibility="no"
      />

      {/* Container Principal */}
      <View className="flex-1">
        <View
          className="absolute bg-white rounded-full items-center justify-center shadow-2xl"
          style={{
            width: 200,
            height: 200,

            bottom: -insets.bottom - 40,
            right: -30,
          }}
        >
          {/* O seu Botão Verde (Agora *dentro* da Ellipse Branca) */}
          {/* Centralizamos ele visivelmente dentro da View branca de 380x380 */}
          <View
            className="absolute"
            // Ajustamos a posição interna para alinhar perfeitamente com o design
            style={{
              bottom: 65 + insets.bottom, // Sobe baseado no safe area interno
              right: 70, // Empurra para a esquerda do centro do círculo gigante
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(auth)/login")}
              // Mantivemos o seu estilo original do botão verde
              className="w-20 h-20 rounded-full bg-emerald-600 items-center justify-center active:bg-emerald-700"
            >
              <ChevronRight color="white" size={32} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
