import { Text } from '@/components/ui/text';
import { Leaf, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

export function ImpactCard() {
  return (
    <View className="mb-10">
      <View  className="bg-[#FF692E] rounded-3xl p-6 flex-row justify-between items-center overflow-hidden">
        <View className="z-10 flex-1">
          <Text className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">Seu Impacto</Text>
          <Text variant="h1" className="text-white text-left font-extrabold  mb-4 border-b-0 pb-0">15Kg CO₂</Text>

          <View className="flex-row items-center bg-black/10 self-start px-3 py-1.5 rounded-full">
            <TrendingUp color="#FFFFFF" size={14} className="mr-1.5" />
            <Text className="text-white text-xs font-bold">Salvos nesta semana</Text>
          </View>
        </View>
        <View className="absolute -right-8 -bottom-8 opacity-20">
          <Leaf color="#FFFFFF" size={160} />
        </View>
      </View>
    </View>
  );
}
