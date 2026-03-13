import { Text } from '@/components/ui/text';
import { Heart, MapPin } from 'lucide-react-native';
import { Image, TouchableOpacity, View } from 'react-native';

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Bermuda minimalista',
    distance: '2km',
    impact: '-15kg',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80',
    condition: 'Novo',
  },
  {
    id: '2',
    title: 'Tênis esportivo',
    distance: '1.2km',
    impact: '-10kg',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    condition: 'Usado',
  },
  {
    id: '3',
    title: 'Cadeira Eames Wood',
    distance: '5km',
    impact: '-30kg',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80',
    condition: 'Seminovo',
  },
];

export function ProductCard({ item }: { item: typeof MOCK_PRODUCTS[0] }) {
  return (
    <TouchableOpacity activeOpacity={0.9} className="bg-white w-[48%] rounded-2xl mb-4 overflow-hidden">
      <View className="relative h-48 w-full bg-zinc-100">
        <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />

        <TouchableOpacity className="absolute top-2 right-2 bg-white/90 p-2 rounded-full backdrop-blur-md">
          <Heart color="#FF692E" size={18} strokeWidth={2.5} />
        </TouchableOpacity>

        <View className="absolute bottom-2 left-2 bg-[#84DCD9] px-2 py-1 rounded-md">
          <Text className="text-[#642714] text-[10px] font-black">{item.impact} CO₂</Text>
        </View>
      </View>

      <View className="p-3">
        {/* Substituindo Text */}
        <Text className="text-[#642714] text-sm font-bold mb-1" numberOfLines={1}>{item.title}</Text>

        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center">
            <MapPin color="#8C6D62" size={12} className="mr-1" />
            <Text className="text-[#8C6D62] text-xs font-medium">{item.distance}</Text>
          </View>
          <Text className="text-[#F8A720] text-[10px] font-bold uppercase">{item.condition}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function RecommendationsList() {
  return (
    <View className="pb-24">
      <View className="flex-row justify-between items-end mb-4">
        <Text variant="h4" className="text-[#642714] font-black">Novos desapegos</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text className="text-[#FF692E] text-sm font-bold">Ver todos</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap justify-between">
       {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} item={product} />
        ))}
      </View>
    </View>
  );
}
