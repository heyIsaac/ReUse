/**
 * Testes para useCarbon hook
 * Cálculo LOCAL de impacto de carbono (sem API externa)
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCarbonImpact,
  useTotalCarbonImpact,
  getCarbonMessage,
  getImpactLevel,
  getCarbonComparison,
} from '../../src/services/useCarbon';
import React from 'react';

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

describe('useCarbonImpact', () => {
  it('deve calcular CO₂ para categoria Eletrônicos', async () => {
    const { result } = renderHook(() => useCarbonImpact('Eletrônicos', 1), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      co2_kg: 50,
      trees_equivalent: 2, // 50 / 21 ≈ 2
      car_km_equivalent: 417, // 50 / 0.12 ≈ 417
    });
  });

  it('deve calcular CO₂ para categoria Roupas', async () => {
    const { result } = renderHook(() => useCarbonImpact('Roupas', 5), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.co2_kg).toBe(75); // 15 * 5
    expect(result.current.data?.trees_equivalent).toBe(4); // 75 / 21 ≈ 4
  });

  it('deve usar fator padrão para categoria desconhecida', async () => {
    const { result } = renderHook(() => useCarbonImpact('CategoriaInválida', 1), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.co2_kg).toBe(15); // Fator padrão
  });

  it('não deve executar se categoria for null', () => {
    const { result } = renderHook(() => useCarbonImpact(null, 1), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useTotalCarbonImpact', () => {
  it('deve calcular impacto total de múltiplas doações', async () => {
    const donations = [
      { category: 'Eletrônicos', quantity: 2 }, // 50 * 2 = 100
      { category: 'Roupas', quantity: 5 }, // 15 * 5 = 75
      { category: 'Livros', quantity: 10 }, // 2 * 10 = 20
    ];

    const { result } = renderHook(() => useTotalCarbonImpact(donations), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.co2_kg).toBe(195); // 100 + 75 + 20
    expect(result.current.data?.trees_equivalent).toBe(9); // 195 / 21 ≈ 9
  });

  it('não deve executar se array de doações estiver vazio', () => {
    const { result } = renderHook(() => useTotalCarbonImpact([]), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('getCarbonMessage', () => {
  it('deve retornar mensagem básica para impacto pequeno', () => {
    const data = { co2_kg: 5, trees_equivalent: 0, car_km_equivalent: 42 };
    const message = getCarbonMessage(data);

    expect(message).toContain('5kg de CO₂');
    expect(message).toContain('🌱');
  });

  it('deve retornar mensagem com árvores para impacto médio', () => {
    const data = { co2_kg: 30, trees_equivalent: 1, car_km_equivalent: 250 };
    const message = getCarbonMessage(data);

    expect(message).toContain('30kg de CO₂');
    expect(message).toContain('1 árvores');
    expect(message).toContain('🌳');
  });

  it('deve retornar mensagem com carro para impacto alto', () => {
    const data = { co2_kg: 100, trees_equivalent: 5, car_km_equivalent: 833 };
    const message = getCarbonMessage(data);

    expect(message).toContain('100kg de CO₂');
    expect(message).toContain('833km');
    expect(message).toContain('🚗💨');
  });
});

describe('getImpactLevel', () => {
  it('deve retornar bronze para impacto baixo', () => {
    const level = getImpactLevel(30);

    expect(level.level).toBe('bronze');
    expect(level.emoji).toBe('🥉');
    expect(level.message).toBe('Iniciante Sustentável');
  });

  it('deve retornar prata para impacto médio', () => {
    const level = getImpactLevel(100);

    expect(level.level).toBe('prata');
    expect(level.emoji).toBe('🥈');
  });

  it('deve retornar ouro para impacto alto', () => {
    const level = getImpactLevel(300);

    expect(level.level).toBe('ouro');
    expect(level.emoji).toBe('🥇');
  });

  it('deve retornar platina para impacto muito alto', () => {
    const level = getImpactLevel(600);

    expect(level.level).toBe('platina');
    expect(level.emoji).toBe('💎');
    expect(level.message).toBe('Herói da Sustentabilidade');
  });
});

describe('getCarbonComparison', () => {
  it('deve retornar comparações do dia a dia', () => {
    const comparisons = getCarbonComparison(50);

    expect(comparisons.length).toBeGreaterThan(0);
    expect(comparisons.some((c) => c.includes('refeições'))).toBe(true);
    expect(comparisons.some((c) => c.includes('roupa'))).toBe(true);
    expect(comparisons.some((c) => c.includes('TV'))).toBe(true);
  });

  it('deve calcular refeições corretamente', () => {
    const comparisons = getCarbonComparison(25); // 25 / 2.5 = 10 refeições

    const mealComparison = comparisons.find((c) => c.includes('refeições'));
    expect(mealComparison).toContain('10 refeições');
  });
});
