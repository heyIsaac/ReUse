import { api } from '@/src/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      const data = response.data;

      return {
        id: data.id,
        name: data.name || 'Guest',
        email: data.email || 'email@desconhecido.com',
        avatarUrl: data.profilePictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      };
    },
    // Mantém os dados no cache ("frescos") por bastante tempo para evitar requisições repetidas na API
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await api.put('/users/me/avatar', { avatarUrl });
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query do perfil do usuário para que a tela recarregue a imagem instantaneamente
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
