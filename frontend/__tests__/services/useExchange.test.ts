/**
 * Testes para useExchange hook
 * API: ExchangeRate-API v4 (Endpoint público, sem autenticação)
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAllExchangeRates,
  useExchangeRate,
  useConvertCurrency,
  useMultiCurrencyConversion,
  formatCurrency,
  COMMON_CURRENCIES,
} from '../../src/services/useExchange';
import React from 'react';

// Mock do fetch global
global.fetch = jest.fn();

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAllExchangeRates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar todas as taxas de câmbio com base em BRL', async () => {
    const mockResponse = {
      base: 'BRL',
      date: '2026-05-09',
      time_last_updated: 1715270400,
      rates: {
        USD: 0.18,
        EUR: 0.17,
        GBP: 0.15,
        JPY: 27.5,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAllExchangeRates('BRL'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.exchangerate-api.com/v4/latest/BRL'
    );
  });

  it('deve usar BRL como padrão se não especificar moeda', async () => {
    const mockResponse = {
      base: 'BRL',
      date: '2026-05-09',
      rates: { USD: 0.18 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    renderHook(() => useAllExchangeRates(), { wrapper });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.exchangerate-api.com/v4/latest/BRL'
      );
    });
  });
});

describe('useExchangeRate', () => {
  it('deve buscar taxa específica entre duas moedas', async () => {
    const mockResponse = {
      base: 'BRL',
      date: '2026-05-09',
      rates: {
        USD: 0.18,
        EUR: 0.17,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useExchangeRate('BRL', 'USD'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(0.18);
  });

  it('deve retornar erro quando moeda de destino não existe', async () => {
    const mockResponse = {
      base: 'BRL',
      date: '2026-05-09',
      rates: {
        USD: 0.18,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useExchangeRate('BRL', 'INVALID'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
  });

  it('não deve fazer requisição se moedas não forem especificadas', () => {
    // Criar um novo QueryClient limpo para este teste
    const isolatedQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    
    const isolatedWrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: isolatedQueryClient }, children);

    const { result } = renderHook(() => useExchangeRate('', 'USD'), { wrapper: isolatedWrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useConvertCurrency', () => {
  it('deve converter valor entre duas moedas', async () => {
    const mockResponse = {
      base: 'BRL',
      date: '2026-05-09',
      rates: {
        USD: 0.18,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useConvertCurrency(1500, 'BRL', 'USD'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      from: 'BRL',
      to: 'USD',
      rate: 0.18,
      amount: 1500,
      converted: 270, // 1500 * 0.18 = 270
      date: '2026-05-09',
    });
  });

  it('não deve fazer requisição se amount for 0', () => {
    const { result } = renderHook(() => useConvertCurrency(0, 'BRL', 'USD'), {
      wrapper,
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useMultiCurrencyConversion', () => {
  it('deve converter para múltiplas moedas simultaneamente', async () => {
    const mockResponse = {
      base: 'BRL',
      date: '2026-05-09',
      rates: {
        USD: 0.18,
        EUR: 0.17,
        GBP: 0.15,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () => useMultiCurrencyConversion(1500, ['USD', 'EUR', 'GBP']),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      USD: 270, // 1500 * 0.18
      EUR: 255, // 1500 * 0.17
      GBP: 225, // 1500 * 0.15
    });
  });

  it('deve usar moedas padrão se não especificado', async () => {
    const mockResponse = {
      base: 'BRL',
      rates: {
        USD: 0.18,
        EUR: 0.17,
        GBP: 0.15,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useMultiCurrencyConversion(1000), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveProperty('USD');
    expect(result.current.data).toHaveProperty('EUR');
    expect(result.current.data).toHaveProperty('GBP');
  });
});

describe('formatCurrency', () => {
  it('deve formatar BRL corretamente', () => {
    const formatted = formatCurrency(1500, 'BRL');
    expect(formatted).toBe('R$ 1.500,00');
  });

  it('deve formatar USD corretamente', () => {
    const formatted = formatCurrency(270.5, 'USD');
    expect(formatted).toBe('US$ 270,50');
  });

  it('deve formatar EUR corretamente', () => {
    const formatted = formatCurrency(255, 'EUR');
    expect(formatted).toBe('€ 255,00');
  });

  it('deve usar código da moeda se símbolo não encontrado', () => {
    const formatted = formatCurrency(100, 'XYZ');
    expect(formatted).toContain('XYZ');
  });
});

describe('COMMON_CURRENCIES', () => {
  it('deve conter moedas principais', () => {
    const codes = COMMON_CURRENCIES.map((c) => c.code);

    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('JPY');
  });

  it('cada moeda deve ter propriedades obrigatórias', () => {
    COMMON_CURRENCIES.forEach((currency) => {
      expect(currency).toHaveProperty('code');
      expect(currency).toHaveProperty('name');
      expect(currency).toHaveProperty('symbol');
      expect(currency).toHaveProperty('flag');
    });
  });
});
