import { renderHook, waitFor } from '@testing-library/react-native';
import { useEmailAuth } from '@/src/hooks/useEmailAuth';
import { supabase } from '@/src/services/supabase';

jest.mock('@/src/services/supabase');
jest.mock('expo-router');

describe('useEmailAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('deve validar email inválido', async () => {
      const showToast = jest.fn();
      const { result } = renderHook(() => useEmailAuth(showToast));

      const success = await result.current.signInWithEmail('email-invalido');

      expect(success).toBe(false);
      expect(result.current.hasError).toBe(true);
      expect(showToast).toHaveBeenCalledWith(
        '⚠️ Digite um e-mail válido para continuar.',
        'error'
      );
    });

    it('deve enviar OTP para email válido', async () => {
      const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
      (supabase.auth.signInWithOtp as jest.Mock) = mockSignInWithOtp;

      const { result } = renderHook(() => useEmailAuth());

      await waitFor(async () => {
        const success = await result.current.signInWithEmail('teste@example.com');
        expect(success).toBe(true);
      });

      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'teste@example.com',
      });
    });

    it('deve lidar com erro ao enviar OTP', async () => {
      const mockError = { message: 'Erro de rede' };
      const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: mockError });
      (supabase.auth.signInWithOtp as jest.Mock) = mockSignInWithOtp;

      const showToast = jest.fn();
      const { result } = renderHook(() => useEmailAuth(showToast));

      const success = await result.current.signInWithEmail('teste@example.com');

      expect(success).toBe(false);
      expect(result.current.hasError).toBe(true);
      expect(showToast).toHaveBeenCalledWith(
        'Erro ao enviar código. Tente novamente.',
        'error'
      );
    });

    it('deve alterar estado de loading durante requisição', async () => {
      const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
      (supabase.auth.signInWithOtp as jest.Mock) = mockSignInWithOtp;

      const { result } = renderHook(() => useEmailAuth());

      expect(result.current.isLoading).toBe(false);

      const promise = result.current.signInWithEmail('teste@example.com');
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await promise;
    });
  });
});
