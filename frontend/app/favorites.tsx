import { ScreenLayout } from '@/components/layout/screen-layout';
import { ProductCard } from '@/components/ui/product-card';
import { Text } from '@/components/ui/text';
import { useGetFavorites } from '@/src/hooks/useFavorites';
import { useRouter } from 'expo-router';
import { ChevronLeft, Heart } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: favorites, isLoading } = useGetFavorites();

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="flex-row items-center pb-4 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100 mr-3"
        >
          <ChevronLeft color="#642714" size={22} />
        </TouchableOpacity>
        <Text variant="h3" className="text-[#642714]">Itens Salvos</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF692E" size="large" />
        </View>
      ) : !favorites || favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Heart color="#D4D4D8" size={64} />
          <Text className="text-[#8C6D62] text-base font-semibold mt-4">
            Nenhum item salvo
          </Text>
          <Text className="text-[#B0978E] text-sm mt-1 text-center px-10">
            Toque no coração nos anúncios para salvar aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => <ProductCard item={item} />}
        />
      )}
    </ScreenLayout>
  );
}
