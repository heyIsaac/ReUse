import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { api } from '@/src/services/api';
import { useGetListings } from '@/src/services/useListings';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORIES = ['Roupas', 'Calçados', 'Eletrônicos', 'Móveis', 'Livros'];
const CONDITIONS = ['Novo', 'Seminovo', 'Com marcas de uso'];

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: listings } = useGetListings();
  const listing = listings?.find(l => l.id.toString() === id);

  const [title, setTitle] = useState(listing?.title ?? '');
  const [category, setCategory] = useState(listing?.category ?? '');
  const [condition, setCondition] = useState(listing?.condition ?? '');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isValid = title.trim().length >= 5 && category && condition && description.trim().length >= 10;

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await api.put(`/listings/${id}`, {
        title: title.trim(),
        category,
        condition,
        description: description.trim(),
        images: listing?.images ?? [],
      });
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
      alert('Anúncio atualizado!');
      router.back();
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      alert('Erro ao atualizar o anúncio.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Excluir anúncio', 'Tem certeza? Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await api.delete(`/listings/${id}`);
            await queryClient.invalidateQueries({ queryKey: ['listings'] });
            router.replace('/(tabs)');
          } catch (err) {
            console.error('Erro ao excluir:', err);
            alert('Erro ao excluir o anúncio.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (!listing) {
    return (
      <ScreenLayout className="bg-[#FDF9F1]">
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#8C6D62]">Anúncio não encontrado.</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="flex-row items-center pb-4 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100 mr-3"
        >
          <ChevronLeft color="#642714" size={22} />
        </TouchableOpacity>
        <Text variant="h3" className="text-[#642714] flex-1">Editar Anúncio</Text>
        <TouchableOpacity onPress={handleDelete} disabled={isDeleting} className="p-2">
          {isDeleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Trash2 color="#ef4444" size={22} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {listing.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ gap: 8 }}>
            {listing.images.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                className="rounded-2xl bg-zinc-100"
                style={{ width: 100, height: 125 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Título</Text>
        <Input
          value={title}
          onChangeText={setTitle}
          maxLength={60}
          className="bg-white h-14 pl-5 rounded-2xl border-2 border-transparent text-[#3D2214] mb-6"
        />

        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Categoria</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-5 py-3 rounded-2xl border-2 ${category === cat ? 'bg-[#FF692E] border-[#FF692E]' : 'bg-white border-zinc-100'}`}
            >
              <Text className={`font-semibold text-sm ${category === cat ? 'text-white' : 'text-[#8C6D62]'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Estado</Text>
        <View className="gap-3 mb-6">
          {CONDITIONS.map(cond => (
            <TouchableOpacity
              key={cond}
              onPress={() => setCondition(cond)}
              className={`flex-row items-center px-5 rounded-2xl border-2 ${condition === cond ? 'bg-[#84DCD9]/15 border-[#84DCD9]' : 'bg-white border-zinc-100'}`}
              style={{ height: 56 }}
            >
              <View className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${condition === cond ? 'border-[#84DCD9]' : 'border-zinc-300'}`}>
                {condition === cond && <View className="w-2.5 h-2.5 rounded-full bg-[#84DCD9]" />}
              </View>
              <Text className={`font-semibold text-sm ${condition === cond ? 'text-[#642714]' : 'text-[#8C6D62]'}`}>{cond}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Descrição</Text>
        <Input
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
          className="bg-white pl-5 pt-4 rounded-2xl border-2 border-transparent text-[#3D2214] mb-8"
          style={{ height: 140 }}
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid || isSaving}
          className={`w-full h-14 rounded-2xl items-center justify-center ${isValid ? 'bg-[#FF692E]' : 'bg-zinc-300'}`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Salvar alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}
