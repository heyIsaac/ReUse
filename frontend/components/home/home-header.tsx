import { Text } from '@/components/ui/text';
import { Bell, Sparkles } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between pt-6 pb-6 bg-[#FDF9F1]">
      <View>
        <Text className="text-[#8C6D62] text-sm font-medium">Bom dia,</Text>
        <Text variant="h2" className="text-[#642714] mt-0.5">Isaac</Text>
      </View>

      <View className="flex-row items-center gap-3">
        {/* Badge eCoins */}
        <View className="flex-row items-center bg-[#FFF3D6] px-3 py-1.5 rounded-full border border-[#F8A720]/30">
          <Sparkles color="#F8A720" size={16} className="mr-1.5" />
          <Text className="text-[#642714] font-bold text-sm">340</Text>
        </View>

        {/* Notificação */}
        <TouchableOpacity activeOpacity={0.7} className="relative bg-white p-2 rounded-full shadow-sm">
          <Bell color="#642714" size={22} strokeWidth={2.5} />
          <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF692E] rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
