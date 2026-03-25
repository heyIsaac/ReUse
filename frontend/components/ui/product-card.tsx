import { cloudinaryThumb } from "@/src/services/cloudinaryUpload";
import { Listing } from "@/src/services/useListings";
import { useRouter } from "expo-router";
import { Heart, MapPin } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";

import { Text } from '@/components/ui/text';

export function ProductCard({ item }: { item: Listing }) {
  const router = useRouter();
  const thumbnailUrl = item.images?.[0]
    ? cloudinaryThumb(item.images[0], 400, 500)
    : null;

  // Condition badge color
  const conditionColor =
    item.condition === 'Novo'
      ? '#84DCD9'
      : item.condition === 'Seminovo'
      ? '#F8A720'
      : '#8C6D62';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/listing/${item.id}`)}
      className="bg-white w-[48%] rounded-2xl mb-4 overflow-hidden"
    >
      <View className="relative h-48 w-full bg-zinc-100">
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-zinc-300 text-3xl">📦</Text>
          </View>
        )}

        <TouchableOpacity className="absolute top-2 right-2 bg-white/90 p-2 rounded-full">
          <Heart color="#FF692E" size={18} strokeWidth={2.5} />
        </TouchableOpacity>

        <View className="absolute bottom-2 left-2 px-2 py-1 rounded-md" style={{ backgroundColor: conditionColor + '22', borderWidth: 1, borderColor: conditionColor }}>
          <Text className="text-[10px] font-black" style={{ color: conditionColor }}>
            {item.condition}
          </Text>
        </View>
      </View>

      <View className="p-3">
        <Text className="text-[#642714] text-sm font-bold mb-1" numberOfLines={1}>
          {item.title}
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center gap-1">
            <MapPin color="#8C6D62" size={12} />
            <Text className="text-[#8C6D62] text-xs font-medium">
              {item.owner?.name ?? 'Anônimo'}
            </Text>
          </View>
          <Text className="text-[#8C6D62] text-[10px]" numberOfLines={1}>
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
