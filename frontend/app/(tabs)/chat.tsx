import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CheckCircle, MessageCircle, Package } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from 'react-native';

interface MyListingChat {
  listingId: number;
  title: string;
  image: string | null;
  interestedCount: number;
  lastMessage: { text: string; createdAt: string } | null;
}

interface MyInterest {
  roomId: string;
  status: string;
  listing: { id: number; title: string; image: string | null } | null;
  owner: { id: string; name: string | null; avatarUrl: string | null } | null;
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

function TabToggle({ active, onSelect }: { active: string; onSelect: (tab: string) => void }) {
  return (
    <View className="flex-row bg-white rounded-2xl p-1 mb-4">
      {['anuncios', 'interesses'].map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onSelect(tab)}
          className={`flex-1 py-3 rounded-xl items-center ${active === tab ? 'bg-[#FF692E]' : ''}`}
        >
          <Text className={`text-sm font-bold ${active === tab ? 'text-white' : 'text-[#8C6D62]'}`}>
            {tab === 'anuncios' ? 'Meus Anúncios' : 'Meus Interesses'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MyListingsTab() {
  const router = useRouter();
  const { data, isLoading } = useQuery<MyListingChat[]>({
    queryKey: ['chatMyListings'],
    queryFn: async () => {
      const { data } = await api.get<MyListingChat[]>('/chat/my-listings');
      return data;
    },
  });

  if (isLoading) return <View className="flex-1 items-center justify-center"><ActivityIndicator color="#FF692E" /></View>;

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Package color="#D4D4D8" size={56} />
        <Text className="text-[#8C6D62] font-semibold mt-4">Nenhum interessado ainda</Text>
        <Text className="text-[#B0978E] text-sm mt-1 text-center px-8">
          Quando alguém se interessar por um item seu, aparecerá aqui.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.listingId.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/chat/listing-conversations?listingId=${item.listingId}&title=${encodeURIComponent(item.title)}`)}
          className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
        >
          {item.image ? (
            <Image source={{ uri: item.image }} className="w-14 h-14 rounded-xl bg-zinc-100" resizeMode="cover" />
          ) : (
            <View className="w-14 h-14 rounded-xl bg-zinc-100 items-center justify-center">
              <Package color="#D4D4D8" size={24} />
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="text-[#3D2214] font-bold text-sm" numberOfLines={1}>{item.title}</Text>
            <Text className="text-[#8C6D62] text-xs mt-0.5">
              {item.interestedCount} {item.interestedCount === 1 ? 'interessado' : 'interessados'}
            </Text>
            {item.lastMessage && (
              <Text className="text-[#B0978E] text-xs mt-1" numberOfLines={1}>
                {item.lastMessage.text}
              </Text>
            )}
          </View>
          {item.lastMessage && (
            <Text className="text-[#B0978E] text-[10px] ml-2">{formatTime(item.lastMessage.createdAt)}</Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

function MyInterestsTab() {
  const router = useRouter();
  const { data, isLoading } = useQuery<MyInterest[]>({
    queryKey: ['chatMyInterests'],
    queryFn: async () => {
      const { data } = await api.get<MyInterest[]>('/chat/my-interests');
      return data;
    },
  });

  if (isLoading) return <View className="flex-1 items-center justify-center"><ActivityIndicator color="#FF692E" /></View>;

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <MessageCircle color="#D4D4D8" size={56} />
        <Text className="text-[#8C6D62] font-semibold mt-4">Nenhum interesse ainda</Text>
        <Text className="text-[#B0978E] text-sm mt-1 text-center px-8">
          Quando você se interessar por um item, a conversa aparecerá aqui.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.roomId}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      renderItem={({ item }) => {
        const isCompleted = item.status === 'completed';
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(`/chat/${item.roomId}`)}
            className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
          >
            <View className="relative">
              {item.owner?.avatarUrl ? (
                <Image source={{ uri: item.owner.avatarUrl }} className="w-14 h-14 rounded-full bg-zinc-100" />
              ) : (
                <View className="w-14 h-14 rounded-full bg-[#FF692E]/10 items-center justify-center">
                  <Text className="text-xl font-bold text-[#FF692E]">
                    {(item.owner?.name ?? '?').charAt(0).toUpperCase()}
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
              <Text className="text-[#3D2214] font-bold text-sm" numberOfLines={1}>
                {item.owner?.name ?? 'Usuário'}
              </Text>
              <Text className="text-[#8C6D62] text-xs mt-0.5" numberOfLines={1}>
                {item.listing?.title ?? ''}
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
  );
}

export default function ChatListScreen() {
  const [activeTab, setActiveTab] = useState('anuncios');

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="pt-6 pb-2">
        <Text variant="h2" className="text-[#642714] mb-4">Conversas</Text>
        <TabToggle active={activeTab} onSelect={setActiveTab} />
      </View>

      {activeTab === 'anuncios' ? <MyListingsTab /> : <MyInterestsTab />}
    </ScreenLayout>
  );
}
