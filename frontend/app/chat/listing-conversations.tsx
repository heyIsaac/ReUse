import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ChevronLeft, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from 'react-native';

interface Conversation {
  roomId: string;
  status: string;
  interested: { id: string; name: string | null; avatarUrl: string | null } | null;
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

export default function ListingConversationsScreen() {
  const { listingId, title } = useLocalSearchParams<{ listingId: string; title: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery<Conversation[]>({
    queryKey: ['listingConversations', listingId],
    queryFn: async () => {
      const { data } = await api.get<Conversation[]>(`/chat/listing/${listingId}/conversations`);
      return data;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="flex-row items-center pb-4 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100 mr-3"
        >
          <ChevronLeft color="#642714" size={22} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="h4" className="text-[#642714]">Interessados</Text>
          <Text className="text-[#8C6D62] text-xs" numberOfLines={1}>{title}</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF692E" size="large" />
        </View>
      ) : !data || data.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <MessageCircle color="#D4D4D8" size={56} />
          <Text className="text-[#8C6D62] font-semibold mt-4">Nenhum interessado</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.roomId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isCompleted = item.status === 'completed';
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/chat/${item.roomId}`)}
                className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
              >
                <View className="relative">
                  {item.interested?.avatarUrl ? (
                    <Image source={{ uri: item.interested.avatarUrl }} className="w-14 h-14 rounded-full bg-zinc-100" />
                  ) : (
                    <View className="w-14 h-14 rounded-full bg-[#FF692E]/10 items-center justify-center">
                      <Text className="text-xl font-bold text-[#FF692E]">
                        {(item.interested?.name ?? '?').charAt(0).toUpperCase()}
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
                  <Text className="text-[#3D2214] font-bold text-sm">
                    {item.interested?.name ?? 'Usuário'}
                  </Text>
                  <Text className="text-[#B0978E] text-xs mt-1" numberOfLines={1}>
                    {isCompleted ? '✓ Concluída' : item.lastMessage?.text ?? 'Nenhuma mensagem ainda'}
                  </Text>
                </View>
                {item.lastMessage && (
                  <Text className="text-[#B0978E] text-[10px] ml-2">{formatTime(item.lastMessage.createdAt)}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </ScreenLayout>
  );
}
