import { supabase } from "@/src/services/supabase";
import { useRouter } from "expo-router";
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
      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      if (result.isCancelled) {
        setIsLoading(false);
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (!data || !data.accessToken) {
        setError("Não foi possível obter o token do Facebook.");
        setIsLoading(false);
        return;
      }

      const { error: supaError } = await supabase.auth.signInWithIdToken({
        provider: "facebook",
        token: data.accessToken.toString(),
      });

      if (supaError) {
        console.error("[Facebook Auth] Erro Supabase:", supaError.message);
        setError("Falha ao autenticar com o Facebook.");
        return;
      }

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
    error,
  };
}
