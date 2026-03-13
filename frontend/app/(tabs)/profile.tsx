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
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUserProfile } from '@/src/hooks/useUserProfile';

export default function ProfileScreen() {
  const router = useExpoRouter();

  const { data: user, isLoading } = useUserProfile();

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
            <Image
              source={{ uri: user?.avatarUrl }}
              className="w-28 h-28 rounded-full bg-zinc-200"
            />
            {/* Botão de editar foto */}
            <TouchableOpacity
              activeOpacity={0.8}
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
                {user?.name}
              </Text>
              <Text className="text-[#8C6D62] text-sm mt-1">
                {user?.email}
              </Text>
            </>
          )}
        </View>

        {/* ESTATÍSTICAS (Trust Building) */}
        <View
          className="flex-row justify-between bg-white rounded-3xl py-5 mt-2 mb-8"
        >
          <StatItem icon={Package} label="Desapegos" value="12" color="#FF692E" />

          <View className="w-[1px] h-full bg-zinc-100" />

          <StatItem icon={Leaf} label="Impacto" value="15kg" color="#84DCD9" />

          <View className="w-[1px] h-full bg-zinc-100" />

          <StatItem icon={Star} label="Avaliação" value="5.0" color="#F8A720" />
        </View>

        {/* MENU DE OPÇÕES */}
        <View >
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
    </ScreenLayout>
  );
}

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
};
