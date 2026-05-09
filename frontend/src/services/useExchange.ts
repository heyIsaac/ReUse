import { useQuery } from '@tanstack/react-query';

/**
 * API Externa: ExchangeRate-API (Endpoint Público v4)
 * Converte moedas usando taxas de câmbio reais
 * 
 * Documentação: https://www.exchangerate-api.com/
 * Endpoint público (sem API key): https://api.exchangerate-api.com/v4/latest/{BASE}
 * Telas que usam: Profile (conversão de economia)
 * 
 * IMPORTANTE: Este endpoint é público e gratuito (~1500 req/dia)
 * Não requer autenticação ou cadastro
 */

interface ExchangeRateResponse {
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
}

interface ConversionResult {
  from: string;
  to: string;
  rate: number;
  amount: number;
  converted: number;
  date: string;
}

const EXCHANGE_API_BASE = 'https://api.exchangerate-api.com/v4/latest';

/**
 * Hook para buscar todas as taxas de câmbio com base em uma moeda
 * 
 * @param baseCurrency - Moeda base (ex: 'BRL', 'USD', 'EUR')
 * @returns Todas as taxas de câmbio disponíveis
 * 
 * @example
 * const { data } = useAllExchangeRates('BRL');
 * console.log(data.rates.USD); // Taxa BRL → USD
 * console.log(data.rates.EUR); // Taxa BRL → EUR
 */
export function useAllExchangeRates(baseCurrency: string = 'BRL') {
  return useQuery<ExchangeRateResponse>({
    queryKey: ['exchange-rates', baseCurrency],
    queryFn: async () => {
      const response = await fetch(`${EXCHANGE_API_BASE}/${baseCurrency.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar taxas de câmbio: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h (taxas atualizam 1x/dia)
    gcTime: 1000 * 60 * 60 * 48, // 48h
    retry: 2,
  });
}

/**
 * Hook para buscar taxa de câmbio específica entre duas moedas
 * 
 * @param from - Moeda de origem (ex: 'BRL')
 * @param to - Moeda de destino (ex: 'USD')
 * @returns Taxa de conversão
 * 
 * @example
 * const { data: rate } = useExchangeRate('BRL', 'USD');
 * const valueInUSD = 1500 * rate; // R$ 1500 → US$ 270
 */
export function useExchangeRate(from: string, to: string) {
  return useQuery<number>({
    queryKey: ['exchange-rate', from, to],
    queryFn: async () => {
      const response = await fetch(`${EXCHANGE_API_BASE}/${from.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar taxa ${from}→${to}: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();
      const rate = data.rates[to.toUpperCase()];

      if (!rate) {
        throw new Error(`Moeda ${to} não encontrada`);
      }

      return rate;
    },
    enabled: !!from && !!to,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    gcTime: 1000 * 60 * 60 * 48, // 48h
    retry: 2,
  });
}

/**
 * Hook para converter um valor entre duas moedas
 * 
 * @param amount - Valor a ser convertido
 * @param from - Moeda de origem
 * @param to - Moeda de destino
 * @returns Resultado completo da conversão
 * 
 * @example
 * const { data } = useConvertCurrency(1500, 'BRL', 'USD');
 * console.log(`R$ ${data.amount} = US$ ${data.converted}`);
 */
export function useConvertCurrency(
  amount: number,
  from: string,
  to: string
) {
  return useQuery<ConversionResult>({
    queryKey: ['convert-currency', amount, from, to],
    queryFn: async () => {
      const response = await fetch(`${EXCHANGE_API_BASE}/${from.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao converter ${from}→${to}: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();
      const rate = data.rates[to.toUpperCase()];

      if (!rate) {
        throw new Error(`Moeda ${to} não encontrada`);
      }

      const converted = amount * rate;

      return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate: Math.round(rate * 10000) / 10000, // 4 casas decimais
        amount,
        converted: Math.round(converted * 100) / 100, // 2 casas decimais
        date: data.date,
      };
    },
    enabled: amount > 0 && !!from && !!to,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    gcTime: 1000 * 60 * 60 * 48, // 48h
    retry: 2,
  });
}

/**
 * Hook para converter múltiplos valores de uma vez
 * Útil para mostrar economia em várias moedas simultaneamente
 * 
 * @param amount - Valor em BRL
 * @param targetCurrencies - Array de moedas destino
 * @returns Mapa de conversões
 * 
 * @example
 * const { data } = useMultiCurrencyConversion(1500, ['USD', 'EUR', 'GBP']);
 * // { USD: 270, EUR: 255, GBP: 225 }
 */
export function useMultiCurrencyConversion(
  amount: number,
  targetCurrencies: string[] = ['USD', 'EUR', 'GBP']
) {
  return useQuery<Record<string, number>>({
    queryKey: ['multi-currency', amount, targetCurrencies],
    queryFn: async () => {
      const response = await fetch(`${EXCHANGE_API_BASE}/BRL`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar taxas: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();
      const conversions: Record<string, number> = {};

      for (const currency of targetCurrencies) {
        const rate = data.rates[currency.toUpperCase()];
        if (rate) {
          conversions[currency.toUpperCase()] = Math.round(amount * rate * 100) / 100;
        }
      }

      return conversions;
    },
    enabled: amount > 0 && targetCurrencies.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    gcTime: 1000 * 60 * 60 * 48, // 48h
    retry: 2,
  });
}

/**
 * Formata valor com símbolo de moeda
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    BRL: 'R$',
    USD: 'US$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'AU$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
  };

  const symbol = symbols[currency.toUpperCase()] || currency.toUpperCase();
  const formatted = amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${formatted}`;
}

/**
 * Retorna lista de moedas mais comuns
 */
export const COMMON_CURRENCIES = [
  { code: 'USD', name: 'Dólar Americano', symbol: 'US$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'AU$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Rúpia Indiana', symbol: '₹', flag: '🇮🇳' },
  { code: 'ARS', name: 'Peso Argentino', symbol: 'AR$', flag: '🇦🇷' },
] as const;

/**
 * Exemplo de uso no Profile Screen:
 * 
 * ```tsx
 * import { useMultiCurrencyConversion, formatCurrency } from '@/services/useExchange';
 * 
 * function ProfileStats() {
 *   const totalSavedBRL = 1500;
 *   const { data: conversions, isLoading } = useMultiCurrencyConversion(
 *     totalSavedBRL,
 *     ['USD', 'EUR', 'GBP']
 *   );
 * 
 *   return (
 *     <View>
 *       <Text>Você economizou: R$ 1.500</Text>
 *       {!isLoading && conversions && (
 *         <>
 *           <Text>≈ {formatCurrency(conversions.USD, 'USD')}</Text>
 *           <Text>≈ {formatCurrency(conversions.EUR, 'EUR')}</Text>
 *           <Text>≈ {formatCurrency(conversions.GBP, 'GBP')}</Text>
 *         </>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
