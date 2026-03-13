import { api } from '@/src/services/api';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export function useEmailAuth(showToast?: (msg: string, type: 'error' | 'warning' | 'success') => void) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const signInWithEmail = async (email: string) => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmailValid) {
      setHasError(true);
      if (showToast) showToast('⚠️ Digite um e-mail válido para continuar.', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      // 1. Pede pro C# gerar e salvar o código no banco
      const response = await api.post('/auth/send-otp', { email });

      // 2. Pega o código que o C# devolveu
      const generatedCode = response.data.code;

      // 3. Dispara o e-mail via EmailJS
      await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
        service_id: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID,
        user_id: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          code: generatedCode,
        },
      });

      router.push(`/(auth)/otp?email=${email}`);
      return true;
    } catch (error) {
      console.error('Erro no fluxo de login:', error);
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
