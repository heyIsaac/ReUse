import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface Category {
  id: number;
  name: string;
}

export function useGetCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
  });
}
