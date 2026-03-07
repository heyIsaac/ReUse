import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { DividerWithText } from "@/components/ui/divider-with-text";
import { EmailInputField } from "@/components/ui/email-input-field";
import { SocialAuthButton } from "@/components/ui/social-auth-button";
import { Text } from "@/components/ui/text";

import { FacebookIcon } from "@/components/icons/facebook.icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { api } from "@/src/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLoginPress = async () => {
    if (!isEmailValid) {
      setHasError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      // Chama o nosso C# rodando no Arch Linux!
      await api.post("/auth/send-otp", { email });

      // Passa o e-mail via parâmetro para a tela de OTP
      router.push(`/(auth)/otp?email=${email}`);
    } catch (error) {
      console.error("Erro na API:", error);
      setHasError(true);
      //TODO: um toast de erro de servidor futuramente
    } finally {
      setIsLoading(false); // Libera o botão
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      {showToast && (
        <View
          className="absolute left-6 right-6 bg-red-500 rounded-2xl p-4 shadow-lg z-50 flex-row items-center"
          style={{ top: insets.top + 16 }}
        >
          <Text className="text-white font-bold text-base">
            ⚠️ Digite um e-mail válido para continuar.
          </Text>
        </View>
      )}

      <Image
        source={require("../../src/assets/images/background-login.png")}
        className="absolute w-full h-2/3 top-0"
        resizeMode="cover"
        accessible={false}
        importantForAccessibility="no"
      />

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 20 : 180}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View
          className="w-full bg-white rounded-t-[40px] shadow-lg px-6 pt-10"
          style={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}
        >
          <Text variant="h1" className="text-left mb-8 text-zinc-900">
            Login.
          </Text>

          <View className="flex-row gap-4 w-full">
            <SocialAuthButton
              icon={<GoogleIcon />}
              label="Google"
              onPress={() => console.log("Google")}
            />
            <SocialAuthButton
              icon={<FacebookIcon />}
              label="Facebook"
              onPress={() => console.log("Facebook")}
            />
          </View>

          <DividerWithText text="or" />

          <EmailInputField
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (hasError) setHasError(false);
            }}
            hasError={hasError}
          />

          <Button
            disabled={!isEmailValid || isLoading}
            className={`w-full rounded-full mt-8 ${
              isEmailValid
                ? "bg-emerald-600 active:bg-emerald-700"
                : "bg-zinc-300 active:bg-zinc-400"
            }`}
            onPress={handleLoginPress}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-bold text-white">Enter</Text>
            )}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
