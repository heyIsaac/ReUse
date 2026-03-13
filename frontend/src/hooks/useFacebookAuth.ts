import { api } from "@/src/services/api";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";

export function useFacebookAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithFacebook = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // 1. Abre o modal nativo do Facebook pedindo permissão de perfil e email
      const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);

      if (result.isCancelled) {
        console.log("[Facebook Auth] Login cancelado pelo usuário.");
        setIsLoading(false);
        return;
      }

      // 2. Pega o Token de Acesso gerado pelo Facebook
      const data = await AccessToken.getCurrentAccessToken();

      if (!data || !data.accessToken) {
        setError("Não foi possível obter o token do Facebook.");
        setIsLoading(false);
        return;
      }

      console.log("[Facebook Auth] ✅ Token obtido com sucesso!");

      // 3. Envia o token para o seu backend C# validar e retornar o JWT do Paguru
      const res = await api.post<{ token: string }>("/auth/facebook-signin", {
        accessToken: data.accessToken.toString(),
      });

      // 4. Salva o JWT no SecureStore
      await SecureStore.setItemAsync("reuse_jwt_token", res.data.token);
      console.log("[Facebook Auth] ✅ Login bem-sucedido! JWT salvo.");


      router.replace("/(tabs)" as any);

    } catch (err: any) {
      console.error("[Facebook Auth] Erro:", err);
      setError("Falha ao autenticar com o Facebook.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithFacebook,
    isLoading,
    error
  };
}
