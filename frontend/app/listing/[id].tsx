import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { cloudinaryThumb } from '@/src/services/cloudinaryUpload';
import { useGetListings, type Listing } from '@/src/services/useListings';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageCircle, Package } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Image Carousel ────────────────────────────────────────────────────────────

function ImageCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  };

  if (images.length === 0) {
    return (
      <View
        className="w-full bg-zinc-100 items-center justify-center"
        style={{ height: SCREEN_WIDTH }}
      >
        <Package color="#C4B5B0" size={64} />
        <Text className="text-zinc-400 mt-3 text-sm">Sem fotos</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image
            source={{ uri: cloudinaryThumb(item, 800, 800) }}
            style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
            resizeMode="cover"
          />
        )}
      />

      {/* Dot indicators */}
      {images.length > 1 && (
        <View className="flex-row justify-center gap-1.5 absolute bottom-4 w-full">
          {images.map((_, i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                backgroundColor: i === activeIndex ? '#FF692E' : 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Owner Card ────────────────────────────────────────────────────────────────

function OwnerCard({ owner }: { owner: Listing['owner'] }) {
  const name = owner?.name ?? 'Usuário ReUse';
  const avatar = owner?.profilePictureUrl;

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(400)}
      className="flex-row items-center bg-white rounded-2xl p-4 border border-zinc-100"
      style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 }}
    >
      <View className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 mr-3">
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-[#FF692E]/10">
            <Text className="text-xl">{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-[#3D2214] font-bold text-sm">{name}</Text>
        <Text className="text-[#8C6D62] text-xs mt-0.5">Doador verificado ✓</Text>
      </View>
    </Animated.View>
  );
}

// ── Detail Screen ─────────────────────────────────────────────────────────────

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch from cache (already loaded on home screen) or re-fetch
  const { data: listings } = useGetListings();
  const listing = listings?.find((l) => l.id.toString() === id);

  if (!listing) {
    return (
      <View className="flex-1 bg-[#FDF9F1] items-center justify-center">
        <Text className="text-[#8C6D62]">Desapego não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-[#FF692E] font-bold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const conditionColor =
    listing.condition === 'Novo' ? '#84DCD9' : listing.condition === 'Seminovo' ? '#F8A720' : '#8C6D62';

  const handleStartChat = async () => {
    console.log("👉 Tentando criar sala...");
    console.log("📦 Dados enviados:", { listingId: listing.id, ownerId: listing.owner?.id });

    try {
      const res = await api.post('/chat/start', {
        listingId: listing.id,
        ownerId: listing.owner?.id
      });

      console.log("✅ Sala criada/encontrada com sucesso!", res.data);
      router.push(`/chat/${res.data.roomId}`);

    } catch (error: any) {
      // Aqui está a magia! Vamos ver exatamente o que o C# não gostou
      console.error("❌ O C# rejeitou a requisição (Erro 400):", error.response?.data || error.message);
      alert("Ops! Não foi possível abrir o chat.");
    }
  };

  return (
    <View className="flex-1 bg-[#FDF9F1]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Image Carousel ── */}
        <View>
          <ImageCarousel images={listing.images} />

          {/* Back button overlaid on top of the carousel */}
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="absolute bg-white/90 rounded-full p-2.5"
            style={{
              top: insets.top + 12,
              left: 20,
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 8,
            }}
          >
            <ChevronLeft color="#3D2214" size={22} />
          </TouchableOpacity>

          {/* Condition badge */}
          <View
            className="absolute rounded-full px-3 py-1"
            style={{
              bottom: listing.images.length > 1 ? 28 : 12,
              right: 16,
              backgroundColor: conditionColor + '22',
              borderWidth: 1,
              borderColor: conditionColor,
            }}
          >
            <Text className="text-xs font-bold" style={{ color: conditionColor }}>
              {listing.condition}
            </Text>
          </View>
        </View>

        {/* ── Content ── */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ paddingHorizontal: 20, paddingTop: 24, gap: 16 }}
        >
          {/* Title + Category */}
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View className="bg-[#FF692E]/10 px-2.5 py-1 rounded-full">
                <Text className="text-[#FF692E] text-[10px] font-bold uppercase tracking-wider">
                  {listing.category}
                </Text>
              </View>
            </View>
            <Text
              className="text-[#3D2214] font-bold leading-tight"
              style={{ fontSize: 26, lineHeight: 32 }}
            >
              {listing.title}
            </Text>
          </View>

          {/* Owner */}
          <OwnerCard owner={listing.owner} />

          {/* Description */}
          <View className="bg-white rounded-2xl p-4 border border-zinc-100">
            <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-2">
              Sobre o item
            </Text>
            <Text className="text-[#5C3D2E] text-sm leading-relaxed">
              {listing.description}
            </Text>
          </View>

          {/* Posted date */}
          <Text className="text-[#B0978E] text-xs text-center">
            Publicado em{' '}
            {new Date(listing.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </Animated.View>
      </ScrollView>

    {/* ── Sticky CTA ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-[#FDF9F1]/95"
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 24,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.06)',
          zIndex: 50,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleStartChat}
          className="w-full h-14 rounded-2xl flex-row items-center justify-center gap-3 bg-[#FF692E]"
          style={{
            shadowColor: '#FF692E',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <MessageCircle color="#fff" size={20} />
          <Text className="text-white font-bold text-base">Entrar em contato</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
