import { useQuery } from '@tanstack/react-query';

/**
 * API Externa: ViaCEP
 * Busca endereço brasileiro por CEP
 * 
 * Documentação: https://viacep.com.br/
 * Telas que usam: Create Listing, Edit Profile
 */

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  erro?: boolean;
}

/**
 * Hook para buscar endereço por CEP
 * 
 * @param cep - CEP no formato "01310100" ou "01310-100"
 * @returns Dados do endereço ou null se não encontrado
 * 
 * @example
 * const { data, isLoading, error } = useViaCep('01310100');
 * if (data) {
 *   console.log(data.localidade); // "São Paulo"
 *   console.log(data.uf); // "SP"
 * }
 */
export function useViaCep(cep: string | null) {
  const cleanCep = cep?.replace(/\D/g, ''); // Remove formatação

  return useQuery<ViaCepResponse | null>({
    queryKey: ['viacep', cleanCep],
    queryFn: async () => {
      if (!cleanCep || cleanCep.length !== 8) {
        return null;
      }

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );

      if (!response.ok) {
        throw new Error('CEP inválido');
      }

      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return data;
    },
    enabled: !!cleanCep && cleanCep.length === 8,
    staleTime: 1000 * 60 * 60 * 24, // Cache por 24h (CEP não muda)
    retry: 1,
  });
}

/**
 * Hook para buscar múltiplos CEPs de uma vez
 * Útil para carregar endereços de vários anúncios
 */
export function useMultipleViaCep(ceps: string[]) {
  return useQuery<Record<string, ViaCepResponse>>({
    queryKey: ['viacep-multiple', ceps],
    queryFn: async () => {
      const promises = ceps.map(async (cep) => {
        const clean = cep.replace(/\D/g, '');
        if (clean.length !== 8) return [cep, null];

        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${clean}/json/`
          );
          const data = await response.json();
          return [cep, data.erro ? null : data];
        } catch {
          return [cep, null];
        }
      });

      const results = await Promise.all(promises);
      return Object.fromEntries(results);
    },
    enabled: ceps.length > 0,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Formata CEP para exibição
 * @example formatCep('01310100') // "01310-100"
 */
export function formatCep(cep: string): string {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return cep;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}
