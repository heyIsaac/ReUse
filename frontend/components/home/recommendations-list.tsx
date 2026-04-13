import { ErrorCard } from '@/components/feedback/error-card';
import { SkeletonCard } from '@/components/feedback/skeleton-card';
import { ProductCard } from '@/components/ui/product-card';
import { Text } from '@/components/ui/text';
import { useGetListings } from '@/src/services/useListings';
import { TouchableOpacity, View } from 'react-native';

interface RecommendationsListProps {
  searchQuery?: string;
  category?: string;
}

export function RecommendationsList({ searchQuery = '', category = 'Todos' }: RecommendationsListProps) {
  const { data: listings, isLoading, isError, refetch } = useGetListings();

  const query = searchQuery.toLowerCase().trim();

  const filtered = listings?.filter((item) => {
    const matchesCategory = category === 'Todos' || item.category === category;
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <View className="pb-24">
      <View className="flex-row justify-between items-end mb-4">
        <Text variant="h4" className="text-[#642714] font-black">
          {query ? `Resultados para "${searchQuery}"` : 'Novos desapegos'}
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => refetch()}>
          <Text className="text-[#FF692E] text-sm font-bold">Atualizar</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View className="flex-row flex-wrap justify-between">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </View>
      )}

      {isError && !isLoading && <ErrorCard refetch={refetch} />}

      {!isLoading && !isError && (!filtered || filtered.length === 0) && (
        <View className="items-center py-12">
          <Text className="text-4xl mb-3">{query ? '🔍' : '🌱'}</Text>
          <Text className="text-[#642714] font-bold text-base mb-1">
            {query ? 'Nenhum resultado' : 'Sem desapegos ainda'}
          </Text>
          <Text className="text-[#8C6D62] text-sm text-center">
            {query ? 'Tente buscar com outras palavras.' : 'Seja o primeiro a publicar um item!'}
          </Text>
        </View>
      )}

      {!isLoading && !isError && filtered && filtered.length > 0 && (
        <View className="flex-row flex-wrap justify-between">
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
}
