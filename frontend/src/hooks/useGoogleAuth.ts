import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { api } from "@/src/services/api";

// Configura o Google Sign-In uma única vez quando o módulo é carregado.
// webClientId é o ID do seu credential do tipo "Web Application" no Google Cloud Console.
// É necessário para que o Google retorne o idToken no login nativo Android.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ["profile", "email"],
});

export function useGoogleAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // 1. Verifica se o Google Play Services está disponível no dispositivo
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 2. Abre o seletor de conta nativo do Google (sem browser, sem redirect URI)
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        // Usuário cancelou
        console.log("[Google Auth] Login cancelado pelo usuário.");
        setIsLoading(false);
        return;
      }

      const { idToken } = response.data;
      console.log("[Google Auth] ✅ idToken obtido:", idToken ? "SIM" : "NÃO");

      if (!idToken) {
        setError("Não foi possível obter o idToken do Google.");
        setIsLoading(false);
        return;
      }

      // 3. Envia o idToken para o backend C# validar e gerar o JWT interno do app
      const res = await api.post<{ token: string }>("/auth/google-signin", {
        idToken,
      });

      // 4. Salva o JWT no SecureStore (mesmo mecanismo do login por e-mail/OTP)
      await SecureStore.setItemAsync("reuse_jwt_token", res.data.token);
      console.log("[Google Auth] ✅ Login bem-sucedido! JWT salvo.");

      // 5. Navega para a área autenticada
      router.replace("/(tabs)" as any);
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("[Google Auth] Cancelado.");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("[Google Auth] Login já em progresso.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError("Google Play Services não está disponível neste dispositivo.");
            break;
          default:
            console.error("[Google Auth] Erro Google:", err.code, err.message);
            setError("Erro no login com Google. Tente novamente.");
        }
      } else if (err?.response?.data) {
        // Erro do nosso backend
        console.error("[Google Auth] Erro backend:", err.response.data);
        setError("Falha ao autenticar com o servidor.");
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
    isReady: true, // GoogleSignin não precisa de promise para ficar "pronto"
  };
}

// Re-exporta o GoogleSigninButton para uso direto se necessário
export { GoogleSigninButton };
