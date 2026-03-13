import { api } from '@/src/services/api';
import { useQuery } from '@tanstack/react-query';

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      const data = response.data;

      return {
        name: data.name || 'Usuário ReUse',
        email: data.email || 'email@desconhecido.com',
        avatarUrl: data.profilePictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      };
    },
    // Mantém os dados no cache ("frescos") por bastante tempo para evitar requisições repetidas na API
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}
