import { supabase } from "@/src/services/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";

export function useEmailAuth(
  showToast?: (msg: string, type: "error" | "warning" | "success") => void
) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const signInWithEmail = async (email: string) => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmailValid) {
      setHasError(true);
      if (showToast)
        showToast("⚠️ Digite um e-mail válido para continuar.", "error");
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        console.error("Erro ao enviar OTP:", error.message);
        setHasError(true);
        if (showToast) showToast("Erro ao enviar código. Tente novamente.", "error");
        return false;
      }

      router.push(`/(auth)/otp?email=${email}`);
      return true;
    } catch (error) {
      console.error("Erro no fluxo de login:", error);
      setHasError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithEmail,
    isLoading,
    hasError,
    setHasError,
  };
}
