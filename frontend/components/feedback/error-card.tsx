import { Text } from '@/components/ui/text';
import { TouchableOpacity, View } from 'react-native';

export function ErrorCard({ refetch }: { refetch: () => void }) {

    return (
         <View className="items-center py-10">
          <Text className="text-[#8C6D62] text-sm mb-3">Não foi possível carregar os desapegos.</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#FF692E] px-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-bold text-sm">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
    )
}
