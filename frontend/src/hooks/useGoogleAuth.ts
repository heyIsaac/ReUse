import { env } from "@/src/config/env";
import { supabase } from "@/src/services/supabase";
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useState } from "react";

if (env.GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: env.GOOGLE_WEB_CLIENT_ID,
    iosClientId: env.GOOGLE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
  });
}

export function useGoogleAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    if (!env.GOOGLE_WEB_CLIENT_ID) {
      setError("Google Sign-In não configurado.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        setIsLoading(false);
        return;
      }

      const { idToken } = response.data;

      if (!idToken) {
        setError("Não foi possível obter o idToken do Google.");
        setIsLoading(false);
        return;
      }

      const { error: supaError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (supaError) {
        console.error("[Google Auth] Erro Supabase:", supaError.message);
        setError("Falha ao autenticar com o servidor.");
        return;
      }

      router.replace("/(tabs)" as any);
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            break;
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError("Google Play Services não está disponível neste dispositivo.");
            break;
          default:
            console.error("[Google Auth] Erro:", err.code, err.message);
            setError("Erro no login com Google. Tente novamente.");
        }
      } else {
        console.error("[Google Auth] Erro inesperado:", err);
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    isReady: true,
  };
}

export { GoogleSigninButton };
