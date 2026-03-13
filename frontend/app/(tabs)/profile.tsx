import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter as useExpoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  Camera,
  ChevronRight,
  CircleHelp,
  Heart,
  Leaf,
  LogOut,
  Package,
  Settings,
  Star
} from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUpdateAvatar, useUserProfile } from '@/src/hooks/useUserProfile';

export default function ProfileScreen() {
  const router = useExpoRouter();

  const { data: user, isLoading } = useUserProfile();
  const updateAvatar = useUpdateAvatar();

  const [emojiOptions, setEmojiOptions] = useState<string[]>([]);

  // Refs e Variáveis do Bottom Sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap Points: 0% (Fechado/Invisível) -> 45% (Pequeno) -> 90% (Tela Cheia)
  const snapPoints = useMemo(() => ['45%', '90%'], []);

  // Cria o fundo preto transparente que fecha o modal ao clicar fora
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  const generateEmojis = () => {
    const newOptions = Array.from({ length: 24 }).map(() =>
      `https://api.dicebear.com/9.x/fun-emoji/png?seed=${Math.random().toString(36).substring(7)}`
    );
    setEmojiOptions(newOptions);
  };

  const openAvatarModal = () => {
    generateEmojis();
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSelectAvatar = (url: string) => {
    updateAvatar.mutate(url);
    bottomSheetRef.current?.close();
  };

  const handleSurpriseMe = () => {
    const randomUrl = `https://api.dicebear.com/9.x/fun-emoji/png?seed=${Math.random().toString(36).substring(7)}`;
    handleSelectAvatar(randomUrl);
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("reuse_jwt_token");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>

        {/* HEADER DO PERFIL */}
        <View className="items-center pt-8 pb-6">
          <View className="relative">
            {updateAvatar.isPending ? (
              <View className="w-28 h-28 rounded-full bg-zinc-200 items-center justify-center">
                <ActivityIndicator size="large" color="#FF692E" />
              </View>
            ) : (
              <Image
                source={{ uri: user?.avatarUrl || 'https://api.dicebear.com/9.x/fun-emoji/png?seed=Isaac' }}
                className="w-28 h-28 rounded-full bg-zinc-200"
              />
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openAvatarModal}
              disabled={updateAvatar.isPending}
              className="absolute bottom-0 right-0 bg-[#FF692E] p-2.5 rounded-full border-4 border-[#FDF9F1]"
            >
              <Camera size={16} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="items-center mt-5">
              <View className="h-8 w-40 bg-zinc-200 rounded-md mb-2" />
              <View className="h-4 w-32 bg-zinc-200 rounded-md" />
            </View>
          ) : (
            <>
              <Text variant="h3" className="text-[#642714] mt-5">
                {user?.name || "Isaac Lima"}
              </Text>
              <Text className="text-[#8C6D62] text-sm mt-1">
                {user?.email || "isaac@mitti.com"}
              </Text>
            </>
          )}
        </View>

        {/* ESTATÍSTICAS */}
        <View className="flex-row justify-between bg-white rounded-3xl py-5 mt-2 mb-8">
          <StatItem icon={Package} label="Desapegos" value="12" color="#FF692E" />
          <View className="w-[1px] h-full bg-zinc-100" />
          <StatItem icon={Leaf} label="Impacto" value="15kg" color="#84DCD9" />
          <View className="w-[1px] h-full bg-zinc-100" />
          <StatItem icon={Star} label="Avaliação" value="5.0" color="#F8A720" />
        </View>

        {/* MENU DE OPÇÕES */}
        <View>
          <Text className="text-[#8C6D62] text-sm font-bold uppercase tracking-wider mb-3 ml-2">
            Minha Conta
          </Text>

          <View className="bg-white rounded-3xl overflow-hidden">
            <MenuItem icon={Package} title="Meus Anúncios" badge="2 ativos" />
            <View className="h-[1px] bg-zinc-50 mx-4" />
            <MenuItem icon={Heart} title="Itens Salvos" />
            <View className="h-[1px] bg-zinc-50 mx-4" />
            <MenuItem icon={Settings} title="Configurações" />
            <View className="h-[1px] bg-zinc-50 mx-4" />
            <MenuItem icon={CircleHelp} title="Ajuda e Suporte" />
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

      {/* BOTTOM SHEET GORHOM */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#FDF9F1', borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: '#D4D4D8', width: 50, height: 6 }}
      >
        <View className="px-6 pb-4 flex-row justify-between items-center">
          <Text variant="h3" className="text-[#642714]">Escolha seu Avatar</Text>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}>
          <View className="flex-row flex-wrap justify-between gap-y-4 mt-2">
            {emojiOptions.map((url, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleSelectAvatar(url)}
                className="w-[30%] aspect-square bg-transparent rounded-2xl items-center justify-center border-2 border-transparent focus:border-[#FF692E]"
              >
                <Image source={{ uri: url }} className="w-20 h-20 rounded-full" />
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetScrollView>

        <View className="px-6 py-5 bg-white border-t border-zinc-100">
          <Button
            variant="outline"
            className="w-full py-4 flex-row justify-center items-center border-[#FF692E] bg-orange-50"
            onPress={handleSurpriseMe}
          >
            <Text className="text-[#FF692E] font-bold text-base ml-2">🎲 Escolher Aleatoriamente</Text>
          </Button>
        </View>
      </BottomSheet>

    </ScreenLayout>
  );
}

// === SUBCOMPONENTES ===

function StatItem({ icon: Icon, label, value, color }: any) {
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

function MenuItem({ icon: Icon, title, badge }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
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
