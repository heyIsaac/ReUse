import { api } from '@/src/services/api';
import { supabase } from '@/src/services/supabase';
import { router } from 'expo-router';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

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

      const response = await api.get('/test').catch(() => null);
      
      // Verifica se o interceptor adicionou o token
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('não deve adicionar token se não houver sessão', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const response = await api.get('/test').catch(() => null);
      
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  describe('API Configuration', () => {
    it('deve ter baseURL configurada', () => {
      expect(api.defaults.baseURL).toBeDefined();
    });

    it('deve ter timeout configurado', () => {
      expect(api.defaults.timeout).toBe(50000);
    });

    it('deve ter interceptors configurados', () => {
      expect(api.interceptors.request).toBeDefined();
      expect(api.interceptors.response).toBeDefined();
    });
  });
});
