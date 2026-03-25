import { ErrorCard } from '@/components/feedback/error-card';
import { SkeletonCard } from '@/components/feedback/skeleton-card';
import { ProductCard } from '@/components/ui/product-card';
import { Text } from '@/components/ui/text';
import { useGetListings } from '@/src/services/useListings';
import { TouchableOpacity, View } from 'react-native';

export function RecommendationsList() {
  const { data: listings, isLoading, isError, refetch } = useGetListings();

  return (
    <View className="pb-24">
      <View className="flex-row justify-between items-end mb-4">
        <Text variant="h4" className="text-[#642714] font-black">Novos desapegos</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => refetch()}>
          <Text className="text-[#FF692E] text-sm font-bold">Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoading && (
        <View className="flex-row flex-wrap justify-between">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <ErrorCard refetch={refetch} />
      )}

      {/* Empty state */}
      {!isLoading && !isError && listings?.length === 0 && (
        <View className="items-center py-12">
          <Text className="text-4xl mb-3">🌱</Text>
          <Text className="text-[#642714] font-bold text-base mb-1">Sem desapegos ainda</Text>
          <Text className="text-[#8C6D62] text-sm text-center">
            Seja o primeiro a publicar um item!
          </Text>
        </View>
      )}

      {/* listings */}
      {!isLoading && !isError && listings && listings.length > 0 && (
        <View className="flex-row flex-wrap justify-between">
          {listings.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
}

