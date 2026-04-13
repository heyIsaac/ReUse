import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export function HomeHeader() {
  const { data: user } = useUserProfile();
  const router = useRouter();

  const { data: unread } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>('/notifications/unread-count');
      return data.count;
    },
    refetchInterval: 30000,
  });

  return (
    <View className="flex-row items-center justify-between pt-6 pb-6 px-6 bg-[#FDF9F1]">
      <View>
        <Text className="text-[#8C6D62] text-sm font-medium">Olá,</Text>
        <Text variant="h2" className="text-[#642714] mt-0.5">
          {user?.name || 'Visitante'}
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/notifications')}
          className="relative bg-white p-2 rounded-full shadow-sm"
        >
          <Bell color="#642714" size={22} strokeWidth={2.5} />
          {(unread ?? 0) > 0 && (
            <View className="absolute -top-1 -right-1 bg-[#FF692E] rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{unread! > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
