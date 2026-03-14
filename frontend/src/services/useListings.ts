import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface CreateListingData {
  title: string;
  category: string;
  condition: string;
  description: string;
  images: string[];
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateListingData) => {
      // Faz o POST para o nosso novo ListingsController
      const response = await api.post('/listings', data);
      return response.data;
    },
    onSuccess: () => {
      // Quando der sucesso, invalida as queries de listings para recarregar o feed (útil no futuro)
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
