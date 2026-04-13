import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ChevronLeft, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { env } from '@/src/config/env';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { api } from '@/src/services/api';
import { supabase } from '@/src/services/supabase';

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface RoomDetails {
  id: string;
  status: string;
  ownerId: string;
  interestedId: string;
  listing: { id: number; title: string; image: string | null } | null;
  otherUser: { id: string; name: string | null; avatarUrl: string | null } | null;
}

export default function ChatRoom() {
  const { id: chatRoomId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUserProfile();

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [connection, setConnection] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const { data: room } = useQuery<RoomDetails>({
    queryKey: ['chatRoom', chatRoomId],
    queryFn: async () => {
      const { data } = await api.get<RoomDetails>(`/chat/${chatRoomId}`);
      return data;
    },
  });

  const { data: historyMessages, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chatHistory', chatRoomId],
    queryFn: async () => {
      const response = await api.get<ChatMessage[]>(`/chat/${chatRoomId}/messages`);
      return response.data;
    },
  });

  const allMessages = [...(historyMessages || []), ...liveMessages];
  const isCompleted = room?.status === 'completed';

  useEffect(() => {
    const setupSignalR = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const newConnection = new HubConnectionBuilder()
        .withUrl(env.SIGNALR_URL, { accessTokenFactory: () => token || '' })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

      newConnection.on('ReceiveMessage', (message: ChatMessage) => {
        setLiveMessages((prev) => [...prev, message]);
      });

      try {
        await newConnection.start();
        await newConnection.invoke('JoinChatGroup', chatRoomId);
        setConnection(newConnection);
      } catch (e) {
        console.error('Falha ao conectar no SignalR', e);
      }
    };

    setupSignalR();

    return () => {
      if (connection) {
        connection.invoke('LeaveChatGroup', chatRoomId).catch(() => {});
        connection.stop();
      }
    };
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !connection || isCompleted) return;

    try {
      await connection.invoke('SendMessage', chatRoomId, inputText);
      setInputText('');
    } catch (e) {
      console.error('Falha ao enviar mensagem', e);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'Marcar como entregue',
      'Confirma que o item foi entregue? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar entrega',
          onPress: async () => {
            setIsCompleting(true);
            try {
              await api.put(`/chat/${chatRoomId}/complete`);
              await queryClient.invalidateQueries({ queryKey: ['chatRoom', chatRoomId] });
              await queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
              await queryClient.invalidateQueries({ queryKey: ['listings'] });
              router.push(`/rate?chatRoomId=${chatRoomId}&userName=${encodeURIComponent(room?.otherUser?.name || 'Usuário')}`);
            } catch (err) {
              console.error('Erro ao completar:', err);
              alert('Erro ao marcar como entregue.');
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUser?.id;

    return (
      <View className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isMe ? 'bg-[#FF692E] rounded-br-sm' : 'bg-white border border-zinc-100 rounded-bl-sm'
          }`}
        >
          <Text className={isMe ? 'text-white' : 'text-[#3D2214]'}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1] p-0" noPadding applyBottomInset={false}>
      {/* Header */}
      <View className="px-5 pt-12 pb-3 bg-white border-b border-zinc-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft color="#3D2214" size={28} />
        </TouchableOpacity>

        {room?.otherUser?.avatarUrl ? (
          <Image source={{ uri: room.otherUser.avatarUrl }} className="w-10 h-10 rounded-full bg-zinc-100 mr-3" />
        ) : (
          <View className="w-10 h-10 rounded-full bg-[#FF692E]/10 items-center justify-center mr-3">
            <Text className="text-base font-bold text-[#FF692E]">
              {(room?.otherUser?.name ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-[#3D2214] font-bold text-sm">
            {room?.otherUser?.name ?? 'Carregando...'}
          </Text>
          <Text className="text-[#8C6D62] text-xs" numberOfLines={1}>
            {room?.listing?.title ?? ''}
          </Text>
        </View>

        {!isCompleted && (
          <TouchableOpacity onPress={handleComplete} disabled={isCompleting} className="ml-2 p-2">
            {isCompleting ? (
              <ActivityIndicator size="small" color="#84DCD9" />
            ) : (
              <CheckCircle color="#84DCD9" size={24} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Completed banner */}
      {isCompleted && (
        <View className="bg-[#84DCD9]/15 px-5 py-3 flex-row items-center">
          <CheckCircle color="#0D9488" size={16} style={{ marginRight: 8 }} />
          <Text className="text-[#0D9488] text-xs font-bold">Item entregue — negociação concluída</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {isLoadingHistory ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#FF692E" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input */}
        {isCompleted ? (
          <View className="px-5 py-4 bg-zinc-100 items-center">
            <Text className="text-[#8C6D62] text-sm">Esta conversa foi encerrada</Text>
          </View>
        ) : (
          <View
            className="px-5 py-3 bg-white border-t border-zinc-100 flex-row items-center"
            style={{ paddingBottom: Platform.OS === 'ios' ? 30 : 16 }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite uma mensagem..."
              placeholderTextColor="#8C6D62"
              className="flex-1 bg-zinc-50 rounded-full px-5 py-3 text-[#3D2214] border border-zinc-200"
              multiline
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim()}
              className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() ? 'bg-[#FF692E]' : 'bg-zinc-200'
              }`}
            >
              <Send color="#FFFFFF" size={20} style={{ marginLeft: -2 }} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
