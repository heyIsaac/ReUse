import { useGetCategories } from '@/src/services/useCategories';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export function CategorySelector() {
  const [selected, setSelected] = useState('Todos');
  const { data: categories } = useGetCategories();

  const items = ['Todos', ...(categories?.map(c => c.name) ?? [])];

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
              onPress={() => setSelected(category)}
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
