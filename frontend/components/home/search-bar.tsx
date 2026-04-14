import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View className="mb-6">
      <View className="relative flex-row items-center bg-white rounded-2xl h-14 w-full">
        <View className="absolute left-4 z-10">
          <Search color="#8C6D62" size={20} />
        </View>

        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="O que vamos reusar hoje?"
          placeholderTextColor="#8C6D62"
        />
      </View>
    </View>
  );
}
