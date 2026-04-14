import { ScreenLayout } from '@/components/layout/screen-layout';
import { ProductCard } from '@/components/ui/product-card';
import { Text } from '@/components/ui/text';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useGetListings } from '@/src/services/useListings';
import { useRouter } from 'expo-router';
import { ChevronLeft, Package } from 'lucide-react-native';
import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

export default function MyListingsScreen() {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const { data: listings, isLoading } = useGetListings();

  const myListings = listings?.filter(l => l.owner?.id === user?.id) ?? [];

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="flex-row items-center pb-4 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100 mr-3"
        >
          <ChevronLeft color="#642714" size={22} />
        </TouchableOpacity>
        <Text variant="h3" className="text-[#642714]">Meus Anúncios</Text>
      </View>

      {myListings.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Package color="#D4D4D8" size={64} />
          <Text className="text-[#8C6D62] text-base font-semibold mt-4">
            Nenhum anúncio ainda
          </Text>
          <Text className="text-[#B0978E] text-sm mt-1 text-center px-10">
            Comece a desapegar! Seus anúncios aparecerão aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={myListings}
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
