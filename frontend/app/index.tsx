import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, Gift, Leaf, Users } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SLIDES = [
  {
    id: "1",
    title: "Bem-vindo ao ReUse",
    description: "Dê uma nova vida aos itens que você não usa mais e encontre o que precisa de forma gratuita.",
    icon: Gift,
  },
  {
    id: "2",
    title: "Comunidade Local",
    description: "Conecte-se com pessoas da sua região, fortalecendo a solidariedade e ajudando quem está próximo.",
    icon: Users,
  },
  {
    id: "3",
    title: "Impacto Sustentável",
    description: "Juntos reduzimos o desperdício, promovemos a economia circular e protegemos nosso planeta.",
    icon: Leaf,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollX = useSharedValue(0);

  useEffect(() => {
    async function checkInitialState() {
      const token = await SecureStore.getItemAsync("reuse_jwt_token");
      if (token) {
        // Usuário já logado
        router.replace("/(tabs)");

        // Debug
        // router.replace("/(auth)/login");
        return;
      }

      const hasCompleted = await SecureStore.getItemAsync("hasCompletedOnboarding");
      if (hasCompleted === "true") {
        router.replace("/(auth)/login");
      } else {
        setIsReady(true);
      }
    }
    checkInitialState();
  }, [router]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync("hasCompletedOnboarding", "true");
    router.replace("/(auth)/login");
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (!isReady) return null;

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <StatusBar style="auto" />

      {/* Top Header / Skip Button */}
      <View className="flex-row justify-end px-6 z-10" style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={handleSkip} className="p-2 active:opacity-75">
          <Text className="text-zinc-500 dark:text-zinc-400 font-medium text-base">Pular</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <Animated.FlatList
        ref={flatListRef as any}
        data={SLIDES}
        renderItem={({ item, index }) => <Slide item={item} index={index} width={width} scrollX={scrollX} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Bottom Controls */}
      <View
        className="flex-row items-center justify-between px-8"
        style={{ paddingBottom: insets.bottom + 24, paddingTop: 24 }}
      >
        <Pagination data={SLIDES} scrollX={scrollX} />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNext}
          className="w-16 h-16 rounded-full bg-emerald-500 items-center justify-center shadow-lg shadow-emerald-500/30 active:bg-emerald-600"
        >
          <ChevronRight color="white" size={32} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// === Subcomponents ===

function Slide({ item, index, width, scrollX }: any) {
  const Icon = item.icon;

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      {/* Icon Circle Animation */}
      <Animated.View
        style={imageStyle}
        className="w-72 h-72 bg-emerald-50 dark:bg-emerald-950/30 rounded-full items-center justify-center mb-12"
      >
        <Icon color="#10b981" size={120} strokeWidth={1.5} />
      </Animated.View>

      {/* Text Area */}
      <View className="w-full">
        <Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-4 text-center">{item.title}</Text>
        <Text className="text-base text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
          {item.description}
        </Text>
      </View>
    </View>
  );
}

function Pagination({ data, scrollX }: { data: any[]; scrollX: any }) {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-row h-10 items-center">
      {data.map((_, i) => {
        const dotStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);

          const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);

          return {
            width: dotWidth,
            opacity,
          };
        });

        return (
          <Animated.View
            key={`dot-${i}`}
            className="h-2 rounded-full bg-emerald-500 mx-1.5"
            style={dotStyle}
          />
        );
      })}
    </View>
  );
}
