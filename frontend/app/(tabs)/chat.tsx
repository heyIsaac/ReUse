import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CheckCircle, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from 'react-native';

interface ChatRoom {
  id: string;
  status: string;
  listing: { listingId: number; title: string; image: string | null };
  otherUser: { id: string; name: string | null; avatarUrl: string | null };
  lastMessage: { text: string; createdAt: string; senderId: string } | null;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}min`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h`;
  if (diffHours < 48) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function ChatListScreen() {
  const router = useRouter();

  const { data: rooms, isLoading } = useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      const { data } = await api.get<ChatRoom[]>('/chat/rooms');
      return data;
    },
  });

  const renderItem = ({ item }: { item: ChatRoom }) => {
    const isCompleted = item.status === 'completed';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
        className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
      >
        <View className="relative">
          {item.otherUser.avatarUrl ? (
            <Image
              source={{ uri: item.otherUser.avatarUrl }}
              className="w-14 h-14 rounded-full bg-zinc-100"
            />
          ) : (
            <View className="w-14 h-14 rounded-full bg-[#FF692E]/10 items-center justify-center">
              <Text className="text-xl font-bold text-[#FF692E]">
                {(item.otherUser.name ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isCompleted && (
            <View className="absolute -bottom-1 -right-1 bg-white rounded-full">
              <CheckCircle color="#84DCD9" size={18} />
            </View>
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[#3D2214] font-bold text-sm" numberOfLines={1}>
              {item.otherUser.name ?? 'Usuário'}
            </Text>
            {item.lastMessage && (
              <Text className="text-[#B0978E] text-[10px]">
                {formatTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>
          <Text className="text-[#8C6D62] text-xs mt-0.5" numberOfLines={1}>
            {item.listing.title}
          </Text>
          <Text className="text-[#B0978E] text-xs mt-1" numberOfLines={1}>
            {isCompleted
              ? '✓ Negociação concluída'
              : item.lastMessage?.text ?? 'Nenhuma mensagem ainda'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="pt-6 pb-4">
        <Text variant="h2" className="text-[#642714]">Conversas</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF692E" size="large" />
        </View>
      ) : !rooms || rooms.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <MessageCircle color="#D4D4D8" size={64} />
          <Text className="text-[#8C6D62] text-base font-semibold mt-4">
            Nenhuma conversa ainda
          </Text>
          <Text className="text-[#B0978E] text-sm mt-1 text-center px-10">
            Quando alguém se interessar por um item seu, a conversa aparecerá aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ScreenLayout>
  );
}
