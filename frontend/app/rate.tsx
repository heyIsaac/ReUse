import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RateScreen() {
  const { chatRoomId, userName } = useLocalSearchParams<{ chatRoomId: string; userName: string }>();
  const router = useRouter();

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) return;
    setIsSending(true);
    try {
      await api.post('/ratings', {
        chatRoomId,
        score,
        comment: comment.trim() || null,
      });
      Alert.alert('', 'Avaliação enviada!');
      router.back();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao enviar avaliação.';
      Alert.alert('', msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="flex-1 justify-center px-2">
        <Text
          className="text-[#642714] font-bold text-center mb-2"
          style={{ fontSize: 26, lineHeight: 32 }}
        >
          Como foi a{'\n'}experiência?
        </Text>
        <Text className="text-[#8C6D62] text-sm text-center mb-8">
          Avalie sua negociação com {userName || 'o usuário'}
        </Text>

        {/* Stars */}
        <View className="flex-row justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setScore(i)} activeOpacity={0.7}>
              <Star
                size={44}
                color="#F8A720"
                fill={i <= score ? '#F8A720' : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-[#8C6D62] text-xs text-center mb-1">
          {score === 0 && 'Toque nas estrelas para avaliar'}
          {score === 1 && 'Péssimo'}
          {score === 2 && 'Ruim'}
          {score === 3 && 'Regular'}
          {score === 4 && 'Bom'}
          {score === 5 && 'Excelente!'}
        </Text>

        {/* Comment */}
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Comentário (opcional)"
          placeholderTextColor="#B0978E"
          multiline
          maxLength={200}
          className="bg-white px-5 pt-4 rounded-2xl border-2 border-transparent text-[#3D2214] text-base mt-6 mb-8"
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={score === 0 || isSending}
          className={`w-full h-14 rounded-2xl items-center justify-center ${
            score > 0 ? 'bg-[#FF692E]' : 'bg-zinc-300'
          }`}
        >
          {isSending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Enviar avaliação</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} className="mt-4 items-center py-3">
          <Text className="text-[#8C6D62] text-sm">Pular por agora</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}
