import { api } from '@/src/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Listing } from '@/src/services/useListings';

export function useGetFavoriteIds() {
  return useQuery<number[]>({
    queryKey: ['favoriteIds'],
    queryFn: async () => {
      const { data } = await api.get<number[]>('/favorites/ids');
      return data;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
  });
}

export function useGetFavorites() {
  return useQuery<Listing[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get<Listing[]>('/favorites');
      return data;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isFavorite }: { listingId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        await api.delete(`/favorites/${listingId}`);
      } else {
        await api.post(`/favorites/${listingId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteIds'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
