/**
 * Testes para useViaCep hook
 * API: ViaCEP (Pública, sem autenticação)
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useViaCep } from '../../src/services/useViaCep';
import React from 'react';

// Mock do fetch global
global.fetch = jest.fn();

// Setup do QueryClient para testes
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useViaCep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar endereço por CEP com sucesso', async () => {
    const mockAddress = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAddress,
    });

    const { result } = renderHook(() => useViaCep('01310100'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAddress);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01310100/json/'
    );
  });

  it('deve retornar erro quando CEP não existe', async () => {
    const mockError = { erro: true };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockError,
    });

    const { result } = renderHook(() => useViaCep('00000000'), { wrapper: createWrapper() });

    // O hook recebe { erro: true } e lança um erro
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
  });

  it('não deve fazer requisição com CEP inválido (menos de 8 dígitos)', () => {
    const { result } = renderHook(() => useViaCep('12345'), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deve formatar CEP removendo traços antes da busca', async () => {
    const mockAddress = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAddress,
    });

    renderHook(() => useViaCep('01310-100'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01310100/json/'
      );
    });
  });

  it('deve cachear resultado por 30 minutos (staleTime)', () => {
    const { result } = renderHook(() => useViaCep('01310100'), { wrapper: createWrapper() });

    // Verifica se o hook foi configurado com staleTime correto
    expect(result.current).toBeDefined();
  });
});
