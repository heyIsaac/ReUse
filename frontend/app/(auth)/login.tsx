import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FacebookIcon } from "@/components/icons/facebook-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { ScreenLayout } from "@/components/layout/screen-layout";
import { Button } from "@/components/ui/button";
import { DividerWithText } from "@/components/ui/divider-with-text";
import { Input } from "@/components/ui/input";
import { SocialAuthButton } from "@/components/ui/social-auth-button";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { Mail } from "lucide-react-native";

import {
  useEmailAuth,
  useFacebookAuth,
  useGoogleAuth,
  useNetworkCheck,
  useToast,
} from "@/src/hooks";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");

  const { isVisible, message, type, showToast } = useToast();
  const { checkConnectionAsync } = useNetworkCheck(showToast);

  const { signInWithEmail, isLoading, hasError, setHasError } =
    useEmailAuth(showToast);

  const {
    signInWithGoogle,
    isLoading: isGoogleLoading,
    isReady: isGoogleReady,
  } = useGoogleAuth();

  const { signInWithFacebook, isLoading: isFacebookLoading } =
    useFacebookAuth();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGoogleLoginPress = async () => {
    const isConnected = await checkConnectionAsync();
    if (isConnected) {
      signInWithGoogle();
    }
  };

  const handleFacebookLoginPress = async () => {
    const isConnected = await checkConnectionAsync();
    if (isConnected) {
      signInWithFacebook();
    }
  };

  const handleLoginPress = async () => {
    const isConnected = await checkConnectionAsync();
    if (!isConnected) return;

    await signInWithEmail(email);
  };
  return (
    <ScreenLayout noPadding applyTopInset={false} className="bg-zinc-950">
      <Toast
        visible={isVisible}
        message={message}
        type={type}
        topOffset={insets.top + 16}
      />

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
            Login
          </Text>

          <View className="flex-row gap-4 w-full">
            <SocialAuthButton
              icon={<GoogleIcon />}
              label="Google"
              onPress={handleGoogleLoginPress}
              disabled={!isGoogleReady || isGoogleLoading}
              isLoading={isGoogleLoading}
            />
            <SocialAuthButton
              icon={<FacebookIcon />}
              label="Facebook"
              onPress={handleFacebookLoginPress}
              disabled={isFacebookLoading}
              isLoading={isFacebookLoading}
            />
          </View>

          <DividerWithText text="or" />

          <Input
            label="Endereço de E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (hasError) setHasError(false);
            }}
            error={hasError ? "E-mail inválido" : undefined}
            icon={<Mail size={24} color={hasError ? "#ef4444" : "#a1a1aa"} />}
          />

          <Button
            label="Enter"
            variant={isEmailValid ? "primary" : "muted"}
            rounded="full"
            disabled={!isEmailValid || isLoading}
            isLoading={isLoading}
            onPress={handleLoginPress}
            className="mt-8"
          />
        </View>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}
