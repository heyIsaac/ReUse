import { useRouter as useExpoRouter } from 'expo-router';
import { supabase } from '@/src/services/supabase';
import {
  Car,
  ChevronDown,
  ChevronRight,
  Gem,
  Heart,
  Info,
  Leaf,
  LogOut,
  TrendingUp,
  Medal,
  Package,
  Settings,
  Star,
  Trees,
  Trophy,
  Wallet,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useGetListings } from '@/src/services/useListings';
import { api } from '@/src/services/api';
import { useQuery } from '@tanstack/react-query';
import { useTotalCarbonImpact, getImpactLevel } from '@/src/services/useCarbon';
import { useMultiCurrencyConversion, formatCurrency } from '@/src/services/useExchange';

const TOOLTIP_TREES_TITLE = 'Árvores equivalentes';
const TOOLTIP_TREES_BODY =
  'É uma comparação: quantas árvores, em cerca de um ano, absorveriam da atmosfera uma quantidade de CO₂ parecida com a que você ajudou a evitar. Serve só para ter noção de escala, não é contagem real de árvores plantadas.';

const TOOLTIP_CAR_TITLE = 'Quilômetros de carro equivalentes';
const TOOLTIP_CAR_BODY =
  'É o quanto um carro de passeio típico precisaria rodar para emitir o mesmo CO₂ (ordem de grandeza). Não é uma viagem que alguém deixou de fazer — só uma forma de visualizar o tamanho do impacto.';

const TOOLTIP_CURRENCIES_TITLE = 'O que significam estes valores?';
const TOOLTIP_CURRENCIES_BODY =
  'Cada valor em real, dólar ou euro estima quanto deixou de ser gasto em compras de produtos novos graças aos seus desapegos. Já os quilogramas de CO₂ medem poluição evitada. Não existe conversão direta entre os dois (por exemplo, “30 kg = R$ 200”): são duas leituras diferentes do benefício de reutilizar — uma em dinheiro e outra no clima.';

export default function ProfileScreen() {
  const router = useExpoRouter();

  const { data: user, isLoading } = useUserProfile();
  const { data: listings } = useGetListings();

  const { data: ratingData } = useQuery({
    queryKey: ['myRating', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await api.get(`/ratings/user/${user.id}`);
      return data as { average: number; count: number };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 20,
  });

  const myListingsCount = listings?.filter(l => l.owner?.id === user?.id).length ?? 0;
  
  // Calcular impacto de carbono real usando categorias dos listings
  const myListings = listings?.filter(l => l.owner?.id === user?.id) ?? [];
  const donations = myListings.map(listing => ({
    category: listing.category?.name || 'default',
    quantity: 1,
  }));
  
  const { data: carbonData } = useTotalCarbonImpact(donations);
  const impactKg = carbonData?.co2_kg.toString() ?? (myListingsCount * 2.5).toFixed(1).replace('.0', '');
  const impactLevel = carbonData ? getImpactLevel(carbonData.co2_kg) : null;
  
  // Calcular economia em outras moedas (assumindo R$ 100 por item)
  const estimatedSavingsBRL = myListingsCount * 100;
  const { data: currencyConversions } = useMultiCurrencyConversion(estimatedSavingsBRL, ['USD', 'EUR']);
  
  const ratingDisplay = ratingData && ratingData.count > 0 ? ratingData.average.toString() : '-';

  const [economyDetailsOpen, setEconomyDetailsOpen] = useState(false);
  const chevronRotation = useSharedValue(0);

  useEffect(() => {
    chevronRotation.value = withTiming(economyDetailsOpen ? 180 : 0, { duration: 220 });
  }, [economyDetailsOpen]);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const toggleEconomyDetails = () => setEconomyDetailsOpen((o) => !o);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER DO PERFIL */}
        <View className="items-center pt-8 pb-6">
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/edit-profile')}>
            <Image
              source={{ uri: user?.avatarUrl || `https://api.dicebear.com/9.x/fun-emoji/png?seed=${user?.id}` }}
              className="w-28 h-28 rounded-full bg-zinc-200"
            />
          </TouchableOpacity>

          {isLoading ? (
            <View className="items-center mt-5">
              <View className="h-8 w-40 bg-zinc-200 rounded-md mb-2" />
              <View className="h-4 w-32 bg-zinc-200 rounded-md" />
            </View>
          ) : (
            <>
              <Text variant="h3" className="text-[#642714] mt-5">
                {user?.name || "Usuário"}
              </Text>
              <Text className="text-[#8C6D62] text-sm mt-1">
                {user?.email || ""}
              </Text>
            </>
          )}
        </View>

        {/* ESTATÍSTICAS — só desapegos e avaliação */}
        <View className="flex-row justify-between bg-white rounded-3xl py-5 mt-2 mb-4 border border-zinc-100">
          <StatItem icon={Package} label="Desapegos" value={myListingsCount.toString()} color="#FF692E" />
          <View className="w-[1px] self-stretch bg-zinc-100" />
          <StatItem icon={Star} label="Avaliação" value={ratingDisplay} color="#F8A720" />
        </View>

        {/* Impacto (CO₂) em destaque + detalhes expansíveis */}
        <View className="mb-8 rounded-3xl overflow-hidden border border-zinc-100 bg-white">
          <View
            className={`flex-row items-start bg-white ${economyDetailsOpen ? 'border-b border-zinc-100' : ''}`}
          >
            <Pressable
              onPress={toggleEconomyDetails}
              className="flex-1 p-6 pr-2 active:bg-zinc-50"
              accessibilityRole="button"
              accessibilityState={{ expanded: economyDetailsOpen }}
              accessibilityLabel={
                economyDetailsOpen
                  ? 'Ocultar detalhes de impacto e referência em dinheiro'
                  : 'Ver detalhes de impacto e referência em dinheiro'
              }
            >
              <Text className="text-[#8C6D62] text-sm font-medium mb-1">
                Estimativa de impacto
              </Text>
              <Text variant="h1" className="text-[#059669] text-left font-extrabold mb-3 border-b-0 pb-0">
                {impactKg}Kg CO₂
              </Text>
              <Text className="text-[#8C6D62] text-sm mb-3 leading-5">
                Estimativa de emissões evitadas ao reutilizar em vez de comprar novo
              </Text>
              <View className="flex-row items-center bg-[#059669]/10 self-start px-3 py-1.5 rounded-full">
                <TrendingUp color="#059669" size={14} style={{ marginRight: 6 }} />
                <Text className="text-[#642714] text-xs font-bold">
                  {myListingsCount === 0
                    ? 'Comece a desapegar!'
                    : `${myListingsCount} ${myListingsCount === 1 ? 'item doado' : 'itens doados'}`}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={toggleEconomyDetails}
              className="justify-center px-4 py-6"
              hitSlop={{ top: 16, bottom: 16, left: 8, right: 16 }}
              accessibilityRole="button"
              accessibilityLabel={
                economyDetailsOpen ? 'Recolher detalhes' : 'Abrir detalhes'
              }
            >
              <View className="w-10 h-10 rounded-full bg-[#FDF9F1] border border-zinc-100 items-center justify-center">
                <Animated.View
                  style={[
                    chevronAnimatedStyle,
                    { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
                  ]}
                >
                  <ChevronDown size={22} color="#642714" strokeWidth={2.5} />
                </Animated.View>
              </View>
            </Pressable>
          </View>

          {economyDetailsOpen && (
            <View className="bg-white px-5 py-5">
              {/* Impacto sustentável */}
              <View className="mb-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-9 h-9 rounded-2xl bg-[#FF692E]/10 items-center justify-center">
                    <Leaf size={18} color="#FF692E" strokeWidth={2.2} />
                  </View>
                  <Text className="text-[#642714] font-bold text-base flex-1">
                    Impacto sustentável
                  </Text>
                </View>

                {carbonData ? (
                  <>
                    <View className="flex-row gap-3 mb-3">
                      <View className="flex-1 bg-[#FDF9F1] rounded-2xl p-3.5 border border-zinc-100">
                        <View className="flex-row items-center justify-between mb-2">
                          <Trees size={22} color="#059669" strokeWidth={2.2} />
                          <Pressable
                            onPress={() => Alert.alert(TOOLTIP_TREES_TITLE, TOOLTIP_TREES_BODY)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={`Saiba mais: ${TOOLTIP_TREES_TITLE}`}
                          >
                            <Info size={17} color="#8C6D62" strokeWidth={2.2} />
                          </Pressable>
                        </View>
                        <Text className="text-[#8C6D62] text-xs font-semibold uppercase tracking-wide text-left mb-2">
                          Árvores equivalentes
                        </Text>
                        <Text className="text-[#642714] text-xl font-black text-left">
                          {carbonData.trees_equivalent}
                        </Text>
                      </View>
                      <View className="flex-1 bg-[#FDF9F1] rounded-2xl p-3.5 border border-zinc-100">
                        <View className="flex-row items-center justify-between mb-2">
                          <Car size={22} color="#059669" strokeWidth={2.2} />
                          <Pressable
                            onPress={() => Alert.alert(TOOLTIP_CAR_TITLE, TOOLTIP_CAR_BODY)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={`Saiba mais: ${TOOLTIP_CAR_TITLE}`}
                          >
                            <Info size={17} color="#8C6D62" strokeWidth={2.2} />
                          </Pressable>
                        </View>
                        <Text className="text-[#8C6D62] text-xs font-semibold uppercase tracking-wide text-left mb-2">
                          Quilômetros de carro equivalentes
                        </Text>
                        <Text className="text-[#642714] text-xl font-black text-left">
                          {carbonData.car_km_equivalent}
                        </Text>
                      </View>
                    </View>
                    {impactLevel && (
                      <View className="flex-row items-center gap-2.5 py-3 px-3 rounded-2xl bg-[#FDF9F1] border border-zinc-100 mt-1">
                        <ImpactLevelIcon level={impactLevel.level} size={18} />
                        <Text className="text-[#642714] font-bold text-sm flex-1">
                          {impactLevel.message}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text className="text-[#8C6D62] text-xs leading-4">
                    Publique desapegos para ver o CO₂ por categoria.
                  </Text>
                )}
              </View>

              <View className="h-px bg-zinc-200 my-4" />

              {/* Referência em dinheiro (outras moedas) */}
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-9 h-9 rounded-2xl bg-[#FF692E]/10 items-center justify-center">
                    <Wallet size={18} color="#FF692E" strokeWidth={2.2} />
                  </View>
                  <Text className="text-[#642714] font-bold text-base flex-1">
                    Em outras moedas
                  </Text>
                  <Pressable
                    onPress={() => Alert.alert(TOOLTIP_CURRENCIES_TITLE, TOOLTIP_CURRENCIES_BODY)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Saiba mais: o que significam os valores em outras moedas"
                  >
                    <Info size={20} color="#8C6D62" strokeWidth={2.2} />
                  </Pressable>
                </View>
                <View className="rounded-2xl overflow-hidden border border-zinc-100">
                  <View className="flex-row justify-between items-center py-3 px-3.5 bg-[#FDF9F1] border-b border-zinc-100">
                    <Text className="text-[#642714] font-medium text-sm">🇧🇷 Brasil</Text>
                    <Text className="text-[#642714] font-black text-base">
                      R$ {estimatedSavingsBRL.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                  {currencyConversions?.USD != null && estimatedSavingsBRL > 0 && (
                    <View className="flex-row justify-between items-center py-3 px-3.5 bg-white border-b border-zinc-100">
                      <Text className="text-[#642714] font-medium text-sm">🇺🇸 EUA</Text>
                      <Text className="text-[#642714] font-black text-base">
                        {formatCurrency(currencyConversions.USD, 'USD')}
                      </Text>
                    </View>
                  )}
                  {currencyConversions?.EUR != null && estimatedSavingsBRL > 0 && (
                    <View className="flex-row justify-between items-center py-3 px-3.5 bg-[#FDF9F1]">
                      <Text className="text-[#642714] font-medium text-sm">🇪🇺 Europa</Text>
                      <Text className="text-[#642714] font-black text-base">
                        {formatCurrency(currencyConversions.EUR, 'EUR')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* MENU DE OPÇÕES */}
        <View>
          <Text className="text-[#8C6D62] text-sm font-bold uppercase tracking-wider mb-3 ml-2">
            Minha Conta
          </Text>

          <View className="bg-white rounded-3xl overflow-hidden">
            <MenuItem icon={Package} title="Meus Anúncios" badge={myListingsCount > 0 ? `${myListingsCount} ${myListingsCount === 1 ? 'ativo' : 'ativos'}` : undefined} onPress={() => router.push('/my-listings')} />
            <View className="h-[1px] bg-zinc-50 mx-4" />
            <MenuItem icon={Heart} title="Itens Salvos" onPress={() => router.push('/favorites')} />
            <View className="h-[1px] bg-zinc-50 mx-4" />
            <MenuItem icon={Settings} title="Configurações" onPress={() => router.push('/settings')} />
          </View>
        </View>

        {/* BOTÃO DE SAIR */}
        <View className="px-6 mt-10">
          <Button
            variant="ghost"
            className="w-full flex-row items-center justify-center bg-red-50 py-4 rounded-2xl active:bg-red-100"
            onPress={handleLogout}
          >
            <LogOut size={20} color="#ef4444" strokeWidth={2.5} />
            <Text className="text-red-500 font-bold ml-2 text-base">Sair da conta</Text>
          </Button>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

// === SUBCOMPONENTES ===

function ImpactLevelIcon({
  level,
  size = 20,
}: {
  level: 'bronze' | 'prata' | 'ouro' | 'platina';
  size?: number;
}) {
  const w = 2.25;
  switch (level) {
    case 'platina':
      return <Gem size={size} color="#6366f1" strokeWidth={w} />;
    case 'ouro':
      return <Trophy size={size} color="#D97706" strokeWidth={w} />;
    case 'prata':
      return <Medal size={size} color="#64748b" strokeWidth={w} />;
    default:
      return <Medal size={size} color="#B45309" strokeWidth={w} />;
  }
}

function StatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="items-center flex-1">
      <View className="mb-2" style={{ backgroundColor: `${color}15`, padding: 8, borderRadius: 12 }}>
        <Icon size={20} color={color} strokeWidth={2.5} />
      </View>
      <Text className="text-[#642714] font-black text-lg">{value}</Text>
      <Text className="text-[#8C6D62] text-xs font-medium mt-0.5">{label}</Text>
    </View>
  );
}

function MenuItem({ icon: Icon, title, badge, onPress }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-[#FDF9F1] items-center justify-center mr-3">
          <Icon size={20} color="#642714" strokeWidth={2} />
        </View>
        <Text className="text-[#642714] font-bold text-base">{title}</Text>
      </View>

      <View className="flex-row items-center">
        {badge && (
          <View className="bg-[#84DCD9]/20 px-2 py-1 rounded-md mr-3">
            <Text className="text-[#0D9488] text-[10px] font-black uppercase">{badge}</Text>
          </View>
        )}
        <ChevronRight size={20} color="#D4D4D8" />
      </View>
    </TouchableOpacity>
  );
}
