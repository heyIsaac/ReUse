import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQuery } from '@tanstack/react-query'; // ADICIONADO
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ChevronLeft, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { api } from '@/src/services/api'; // Para buscar o histórico

// Pegue a URL do seu C# (ex: http://192.168.1.15:5251)
const SIGNALR_URL = "http://SEU_IP_AQUI:5251/chathub";

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export default function ChatRoom() {
  const { id: chatRoomId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: currentUser } = useUserProfile();

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [connection, setConnection] = useState<any>(null);

  const flatListRef = useRef<FlatList>(null);

  // 1. BUSCAR HISTÓRICO VIA API REST (TanStack Query)
  const { data: historyMessages, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chatHistory', chatRoomId],
    queryFn: async () => {
      const response = await api.get<ChatMessage[]>(`/chat/${chatRoomId}/messages`);
      return response.data;
    }
  });

  // 2. Juntar Histórico com Mensagens ao Vivo
  const allMessages = [...(historyMessages || []), ...liveMessages];

  // 3. CONECTAR NO SIGNALR PARA OUVIR NOVAS MENSAGENS
  useEffect(() => {
    const setupSignalR = async () => {
      const token = await SecureStore.getItemAsync("reuse_jwt_token");

      const newConnection = new HubConnectionBuilder()
        .withUrl(SIGNALR_URL, { accessTokenFactory: () => token || "" })
        .withAutomaticReconnect() // Truque sênior para não cair a conexão se o 4G oscilar
        .configureLogging(LogLevel.Warning)
        .build();

      newConnection.on("ReceiveMessage", (message: ChatMessage) => {
        // Quando chega mensagem nova, adiciona no estado "ao vivo"
        setLiveMessages(prev => [...prev, message]);
      });

      try {
        await newConnection.start();
        await newConnection.invoke("JoinChatGroup", chatRoomId);
        setConnection(newConnection);
      } catch (e) {
        console.error("Falha ao conectar no SignalR", e);
      }
    };

    setupSignalR();

    return () => {
      if (connection) {
        connection.invoke("LeaveChatGroup", chatRoomId);
        connection.stop();
      }
    };
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !connection) return;

    try {
      await connection.invoke("SendMessage", chatRoomId, inputText);
      setInputText('');
    } catch (e) {
      console.error("Falha ao enviar mensagem", e);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUser?.id;

    return (
      <View className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-[#FF692E] rounded-br-sm' : 'bg-white border border-zinc-100 rounded-bl-sm'}`}>
          <Text className={isMe ? 'text-white' : 'text-[#3D2214]'}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1] p-0" applyBottomInset={false}>
          {/* HEADER DA SALA DE CHAT */}
      <View className="px-5 pt-12 pb-4 bg-white border-b border-zinc-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft color="#3D2214" size={28} />
        </TouchableOpacity>
        <Text variant="h4" className="text-[#3D2214]">Negociação</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">

        {isLoadingHistory ? (
           <View className="flex-1 items-center justify-center"><ActivityIndicator color="#FF692E" /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages} // AGORA USA A LISTA COMBINADA!
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

              {/* INPUT DE MENSAGEM */}
        <View className="px-5 py-3 bg-white border-t border-zinc-100 flex-row items-center" style={{ paddingBottom: Platform.OS === 'ios' ? 30 : 16 }}>
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

      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
