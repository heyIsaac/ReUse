import { supabase } from '@/src/services/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) throw new Error('Usuário não autenticado');

      const meta = user.user_metadata ?? {};

      return {
        id: user.id,
        name: meta.full_name || meta.name || 'Guest',
        email: user.email || 'email@desconhecido.com',
        avatarUrl: meta.avatar_url || meta.picture
          || `https://api.dicebear.com/9.x/fun-emoji/png?seed=${user.id}`,
      };
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
