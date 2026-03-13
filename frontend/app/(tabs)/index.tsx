import React from 'react';
import { ScrollView, View } from 'react-native';

import { CategorySelector } from '@/components/home/category-selector';
import { HomeHeader } from '@/components/home/home-header';
import { ImpactCard } from '@/components/home/impact-card';
import { RecommendationsList } from '@/components/home/recommendations-list';
import { SearchBar } from '@/components/home/search-bar';
import { ScreenLayout } from '@/components/layout/screen-layout';

export default function HomeScreen() {
  return (
    <ScreenLayout className="bg-[#FDF9F1] p-0" applyBottomInset={false}>

      {/* stickyHeaderIndices={[1]} significa que o elemento de índice 1 (o bloco de filtros)
        vai grudar no topo. O HomeHeader (índice 0) vai rolar normalmente e sumir.
      */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        stickyHeaderIndices={[1]}
      >

        {/* ÍNDICE 0: Rola e vai embora */}
        <HomeHeader />

        {/* ÍNDICE 1: O Bloco Sticky (Gruda no teto) */}
        <View className="bg-[#FDF9F1] pt-2 pb-2 z-10">
          <SearchBar />
          <CategorySelector />
        </View>

        {/* ÍNDICE 2: O Resto do Conteúdo (Rola por trás do bloco sticky) */}
        <View>
          <ImpactCard />
          <RecommendationsList />
        </View>

      </ScrollView>
    </ScreenLayout>
  );
}
