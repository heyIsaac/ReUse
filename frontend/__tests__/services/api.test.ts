import { api } from '@/src/services/api';
import { supabase } from '@/src/services/supabase';
import { router } from 'expo-router';

jest.mock('@/src/services/supabase');
jest.mock('expo-router');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Interceptor', () => {
    it('deve adicionar token de autorização quando usuário está autenticado', async () => {
      const mockToken = 'mock-jwt-token';
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
          session: { access_token: mockToken },
        },
      });

      const mockRequest = {
        headers: {},
      };

      const config = await api.interceptors.request.handlers[0].fulfilled(mockRequest);

      expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('não deve adicionar token se não houver sessão', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const mockRequest = {
        headers: {},
      };

      const config = await api.interceptors.request.handlers[0].fulfilled(mockRequest);

      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('deve redirecionar para login em caso de 401', async () => {
      const mockError = {
        response: {
          status: 401,
        },
      };

      await expect(
        api.interceptors.response.handlers[0].rejected(mockError)
      ).rejects.toEqual(mockError);

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
    });

    it('deve passar erro adiante se não for 401', async () => {
      const mockError = {
        response: {
          status: 500,
        },
      };

      await expect(
        api.interceptors.response.handlers[0].rejected(mockError)
      ).rejects.toEqual(mockError);

      expect(supabase.auth.signOut).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('deve retornar response se não houver erro', () => {
      const mockResponse = { data: { test: 'data' } };

      const result = api.interceptors.response.handlers[0].fulfilled(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });
});
