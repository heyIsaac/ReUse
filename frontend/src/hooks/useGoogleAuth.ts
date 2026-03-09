import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { api } from "@/src/services/api";

// Fecha o browser de auth automaticamente após redirect
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // AndroidClientId deve ser de um credential do tipo "Android" no Google Cloud Console.
    // Ele usa o reverse-client-id scheme como redirect, que o Google aceita nativamente.
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    // webClientId é necessário para que o id_token seja incluído na resposta
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      console.log("✅ [Google Auth] Resposta do Google:", response.params);

      // O id_token pode vir direto nos params (implicit flow)
      // ou no authentication.idToken (code flow com troca automática)
      const idToken =
        response.params?.id_token ??
        (response as any).authentication?.idToken;

      if (idToken) {
        handleBackendSignIn(idToken);
      } else {
        console.error("[Google Auth] id_token não encontrado nos params:", response.params);
        setError("Não foi possível obter o token de autenticação do Google.");
      }
    } else if (response?.type === "error") {
      console.error("[Google Auth] Erro OAuth:", response.error);
      setError(response.error?.message ?? "Erro no login com Google.");
    } else if (response?.type === "dismiss" || response?.type === "cancel") {
      console.log("[Google Auth] Login cancelado pelo usuário.");
    }
  }, [response]);

  const handleBackendSignIn = async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<{ token: string }>("/auth/google-signin", {
        idToken,
      });

      const { token } = res.data;
      await SecureStore.setItemAsync("reuse_jwt_token", token);

      console.log("✅ Login com Google bem-sucedido! JWT salvo.");
      router.replace("/(tabs)" as any);
    } catch (err: any) {
      console.error("❌ Erro ao autenticar no backend:", err?.response?.data ?? err.message);
      setError("Falha ao autenticar com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = () => {
    setError(null);
    promptAsync();
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    isReady: !!request,
  };
}
