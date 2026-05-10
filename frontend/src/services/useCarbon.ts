import { useQuery } from '@tanstack/react-query';

/**
 * API Externa: Carbon Interface (ou cálculo local simplificado)
 * Calcula pegada de carbono economizada com economia circular
 * 
 * Documentação: https://www.carboninterface.com/
 * Telas que usam: Profile (stats), Listing (badge)
 * 
 * ALTERNATIVA GRATUITA: Cálculo local baseado em médias do IPCC
 */

interface CarbonData {
  co2_kg: number; // CO₂ em kg
  trees_equivalent: number; // Árvores equivalentes
  car_km_equivalent: number; // Km de carro equivalentes
}

/**
 * Categorias e seus fatores de emissão médios (kg CO₂ por item)
 * Fonte: IPCC, EPA, estudos de ACV (Análise de Ciclo de Vida)
 */
const CARBON_FACTORS: Record<string, number> = {
  'Eletrônicos': 50, // Smartphone: ~50kg CO₂
  'Roupas': 15, // Camiseta: ~15kg CO₂
  'Móveis': 100, // Cadeira: ~100kg CO₂
  'Livros': 2, // Livro: ~2kg CO₂
  'Brinquedos': 10, // Brinquedo plástico: ~10kg CO₂
  'Decoração': 20, // Item decorativo: ~20kg CO₂
  'Esportes': 25, // Equipamento esportivo: ~25kg CO₂
  'Utensílios': 8, // Utensílio doméstico: ~8kg CO₂
  'default': 15, // Média geral
};

/**
 * Hook para calcular impacto de carbono de um item
 * 
 * @param category - Categoria do item
 * @param quantity - Quantidade de itens (padrão: 1)
 * @returns Dados de impacto ambiental
 * 
 * @example
 * const { data } = useCarbonImpact('Eletrônicos', 1);
 * console.log(`Economizou ${data.co2_kg}kg de CO₂`);
 */
export function useCarbonImpact(
  category: string | null,
  quantity: number = 1
) {
  return useQuery<CarbonData>({
    queryKey: ['carbon', category, quantity],
    queryFn: async () => {
      const factor = CARBON_FACTORS[category || 'default'] || CARBON_FACTORS.default;
      const co2_kg = factor * quantity;

      return {
        co2_kg: Math.round(co2_kg * 10) / 10, // 1 casa decimal
        trees_equivalent: Math.round(co2_kg / 21), // 1 árvore absorve ~21kg CO₂/ano
        car_km_equivalent: Math.round(co2_kg / 0.12), // Carro emite ~0.12kg CO₂/km
      };
    },
    enabled: !!category,
    staleTime: Infinity, // Cálculo não muda
  });
}

/**
 * Hook para calcular impacto total de múltiplas doações
 * Usado no perfil para mostrar impacto acumulado
 * 
 * @example
 * const donations = [
 *   { category: 'Eletrônicos', quantity: 2 },
 *   { category: 'Roupas', quantity: 5 },
 * ];
 * const { data } = useTotalCarbonImpact(donations);
 */
export function useTotalCarbonImpact(
  donations: Array<{ category: string; quantity: number }>
) {
  return useQuery<CarbonData>({
    queryKey: ['carbon-total', donations],
    queryFn: async () => {
      let totalCo2 = 0;

      for (const { category, quantity } of donations) {
        const factor = CARBON_FACTORS[category] || CARBON_FACTORS.default;
        totalCo2 += factor * quantity;
      }

      return {
        co2_kg: Math.round(totalCo2 * 10) / 10,
        trees_equivalent: Math.round(totalCo2 / 21),
        car_km_equivalent: Math.round(totalCo2 / 0.12),
      };
    },
    enabled: donations.length > 0,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
}

/**
 * Retorna mensagem amigável sobre o impacto
 */
export function getCarbonMessage(data: CarbonData): string {
  const { co2_kg, trees_equivalent, car_km_equivalent } = data;

  if (co2_kg < 10) {
    return `Você economizou ${co2_kg}kg de CO₂! 🌱`;
  }

  if (co2_kg < 50) {
    return `Você economizou ${co2_kg}kg de CO₂ - equivalente a ${trees_equivalent} árvores! 🌳`;
  }

  return `Você economizou ${co2_kg}kg de CO₂ - o mesmo que um carro rodando ${car_km_equivalent}km! 🚗💨`;
}

/** Mesmo texto de {@link getCarbonMessage}, sem emojis (para UI com ícones Lucide). */
export function getCarbonMessagePlain(data: CarbonData): string {
  const { co2_kg, trees_equivalent, car_km_equivalent } = data;

  if (co2_kg < 10) {
    return `Você economizou ${co2_kg}kg de CO₂!`;
  }

  if (co2_kg < 50) {
    return `Você economizou ${co2_kg}kg de CO₂ — equivalente a ${trees_equivalent} árvores!`;
  }

  return `Você economizou ${co2_kg}kg de CO₂ — o mesmo que um carro rodando ${car_km_equivalent} km!`;
}

/**
 * Retorna nível de impacto (bronze, prata, ouro, platina)
 */
export function getImpactLevel(co2_kg: number): {
  level: 'bronze' | 'prata' | 'ouro' | 'platina';
  emoji: string;
  message: string;
} {
  if (co2_kg >= 500) {
    return {
      level: 'platina',
      emoji: '💎',
      message: 'Herói da Sustentabilidade',
    };
  }

  if (co2_kg >= 200) {
    return {
      level: 'ouro',
      emoji: '🥇',
      message: 'Campeão da Economia Circular',
    };
  }

  if (co2_kg >= 50) {
    return {
      level: 'prata',
      emoji: '🥈',
      message: 'Guardião do Planeta',
    };
  }

  return {
    level: 'bronze',
    emoji: '🥉',
    message: 'Iniciante Sustentável',
  };
}

/**
 * Compara impacto com equivalentes do dia a dia
 */
export function getCarbonComparison(co2_kg: number): string[] {
  const comparisons: string[] = [];

  // Equivalência em refeições
  const meals = Math.round(co2_kg / 2.5); // 1 refeição = ~2.5kg CO₂
  if (meals > 0) {
    comparisons.push(`${meals} refeições 🍽️`);
  }

  // Equivalência em cargas de roupa lavadas
  const laundry = Math.round(co2_kg / 0.6); // 1 lavagem = ~0.6kg CO₂
  if (laundry > 0) {
    comparisons.push(`${laundry} cargas de roupa lavadas 👕`);
  }

  // Equivalência em horas de TV
  const tv_hours = Math.round(co2_kg / 0.1); // 1h TV = ~0.1kg CO₂
  if (tv_hours > 0) {
    comparisons.push(`${tv_hours}h de TV 📺`);
  }

  return comparisons;
}
