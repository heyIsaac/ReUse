import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { DividerWithText } from "@/components/ui/divider-with-text";
import { EmailInputField } from "@/components/ui/email-input-field";
import { SocialAuthButton } from "@/components/ui/social-auth-button";
import { Text } from "@/components/ui/text";

import { FacebookIcon } from "@/components/icons/facebook.icon";
import { GoogleIcon } from "@/components/icons/google-icon";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Consideramos válido se tiver exatamente 11 dígitos numéricos
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Gerencia o clique no botão "Enter"
  const handleLoginPress = () => {
    if (!isEmailValid) {
      setHasError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    router.push(`/(auth)/otp?email=${email}`);
  };

  return (
    <View className="flex-1 bg-zinc-950">
      {showToast && (
        <View
          className="absolute left-6 right-6 bg-red-500 rounded-2xl p-4 shadow-lg z-50 flex-row items-center"
          style={{ top: insets.top + 16 }} // Respeita o notch do iPhone
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
            className={`w-full rounded-full mt-8 ${
              isEmailValid
                ? "bg-emerald-600 active:bg-emerald-700"
                : "bg-zinc-300 active:bg-zinc-400"
            }`}
            onPress={handleLoginPress}
          >
            <Text className="text-lg font-bold text-white">Enter</Text>
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
