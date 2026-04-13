import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { CategorySelector } from '@/components/home/category-selector';
import { HomeHeader } from '@/components/home/home-header';
import { ImpactCard } from '@/components/home/impact-card';
import { RecommendationsList } from '@/components/home/recommendations-list';
import { SearchBar } from '@/components/home/search-bar';
import { ScreenLayout } from '@/components/layout/screen-layout';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['listings'] });
    await queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <ScreenLayout className="bg-[#FDF9F1]" noPadding applyBottomInset={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF692E" />
        }
      >
        <HomeHeader />

        <View className="bg-[#FDF9F1] pt-2 pb-2 z-10">
          <View className="px-6">
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
        </View>

        <View className="px-6">
          <ImpactCard />
          <RecommendationsList searchQuery={searchQuery} category={selectedCategory} />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
