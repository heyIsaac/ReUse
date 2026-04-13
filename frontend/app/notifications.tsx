import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Bell, Check, ChevronLeft, Gift, Heart, MessageCircle, Star } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const ICON_MAP: Record<string, any> = {
  rating: Star,
  new_interest: MessageCircle,
  completed: Gift,
  favorite_donated: Heart,
  welcome: Bell,
};

const COLOR_MAP: Record<string, string> = {
  rating: '#F8A720',
  new_interest: '#FF692E',
  completed: '#84DCD9',
  favorite_donated: '#ef4444',
  welcome: '#3BA99C',
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}min`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h atrás`;
  if (diffHours < 48) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<NotificationItem[]>('/notifications');
      return data;
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    } catch {}
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const Icon = ICON_MAP[item.type] || Bell;
    const color = COLOR_MAP[item.type] || '#8C6D62';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => markRead(item.id)}
        className={`flex-row p-4 mb-2 rounded-2xl ${item.read ? 'bg-white' : 'bg-[#FF692E]/5'}`}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-[#3D2214] font-bold text-sm">{item.title}</Text>
            <Text className="text-[#B0978E] text-[10px]">{formatTime(item.createdAt)}</Text>
          </View>
          <Text className="text-[#8C6D62] text-xs mt-1">{item.body}</Text>
        </View>
        {!item.read && (
          <View className="w-2.5 h-2.5 rounded-full bg-[#FF692E] ml-2 mt-1" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100 mr-3"
          >
            <ChevronLeft color="#642714" size={22} />
          </TouchableOpacity>
          <Text variant="h3" className="text-[#642714]">Notificações</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} className="flex-row items-center">
            <Check size={16} color="#3BA99C" style={{ marginRight: 4 }} />
            <Text className="text-[#3BA99C] text-xs font-bold">Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF692E" size="large" />
        </View>
      ) : !notifications || notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Bell color="#D4D4D8" size={64} />
          <Text className="text-[#8C6D62] text-base font-semibold mt-4">
            Sem notificações
          </Text>
          <Text className="text-[#B0978E] text-sm mt-1 text-center px-10">
            Quando houver novidades, elas aparecerão aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </ScreenLayout>
  );
}
