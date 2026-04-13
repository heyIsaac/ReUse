import { useGetCategories } from '@/src/services/useCategories';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CategorySelectorProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  const { data: categories } = useGetCategories();
  const items = ['Todos', ...(categories?.map(c => c.name) ?? [])];

  useEffect(() => {
    SecureStore.getItemAsync('selectedCategory').then((saved) => {
      if (saved && items.includes(saved)) onSelect(saved);
    });
  }, [categories]);

  const handleSelect = (category: string) => {
    onSelect(category);
    SecureStore.setItemAsync('selectedCategory', category);
  };

  return (
    <View className="mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 24, paddingRight: 40, gap: 12 }}>
        {items.map((category) => {
          const isSelected = selected === category;

          return (
            <TouchableOpacity
              key={category}
              onPress={() => handleSelect(category)}
              activeOpacity={0.7}
              className={`h-12 px-5 rounded-full items-center justify-center border ${
                isSelected
                  ? 'bg-[#3BA99C] border-[#3BA99C]'
                  : 'bg-white border-[#E0E0E0]'
              }`}>
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 'text-[#8C8C8C]'
                }`}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
