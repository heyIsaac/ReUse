import { Text } from '@/components/ui/text';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export function HomeHeader() {
  const { data: user } = useUserProfile();

  return (
    <View className="flex-row items-center justify-between pt-6 pb-6 px-6 bg-[#FDF9F1]">
      <View>
        <Text className="text-[#8C6D62] text-sm font-medium">Olá,</Text>
        <Text variant="h2" className="text-[#642714] mt-0.5">
          {user?.name || 'Visitante'}
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity activeOpacity={0.7} className="relative bg-white p-2 rounded-full shadow-sm">
          <Bell color="#642714" size={22} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
