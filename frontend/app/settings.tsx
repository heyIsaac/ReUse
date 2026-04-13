import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { supabase } from '@/src/services/supabase';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Linking as LinkingIcon,
  Shield,
  Trash2,
  UserPen,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Switch, TouchableOpacity, View } from 'react-native';

function SettingsItem({ icon: Icon, title, onPress, danger }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white"
    >
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${danger ? 'bg-red-50' : 'bg-[#FDF9F1]'}`}>
          <Icon size={20} color={danger ? '#ef4444' : '#642714'} strokeWidth={2} />
        </View>
        <Text className={`font-bold text-base ${danger ? 'text-red-500' : 'text-[#642714]'}`}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#D4D4D8" />
    </TouchableOpacity>
  );
}

function ToggleItem({ icon: Icon, title, value, onToggle }: any) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-white">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-[#FDF9F1] items-center justify-center mr-3">
          <Icon size={20} color="#642714" strokeWidth={2} />
        </View>
        <Text className="text-[#642714] font-bold text-base">{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D4D4D8', true: '#FF692E' }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const [notifMessages, setNotifMessages] = useState(true);
  const [notifInterests, setNotifInterests] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('notif_messages').then(v => { if (v !== null) setNotifMessages(v === 'true'); });
    SecureStore.getItemAsync('notif_interests').then(v => { if (v !== null) setNotifInterests(v === 'true'); });
  }, []);

  const toggleNotifMessages = (val: boolean) => {
    setNotifMessages(val);
    SecureStore.setItemAsync('notif_messages', val.toString());
  };

  const toggleNotifInterests = (val: boolean) => {
    setNotifInterests(val);
    SecureStore.setItemAsync('notif_interests', val.toString());
  };

  const handleDeleteAccount = () => {
    Alert.prompt(
      'Deletar conta',
      'Esta ação é irreversível. Digite DELETAR para confirmar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async (text) => {
            if (text !== 'DELETAR') {
              Alert.alert('', 'Texto incorreto. Conta não deletada.');
              return;
            }
            try {
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            } catch (err) {
              console.error('Erro ao deletar conta:', err);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <View className="flex-row items-center pb-4 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100 mr-3"
        >
          <ChevronLeft color="#642714" size={22} />
        </TouchableOpacity>
        <Text variant="h3" className="text-[#642714]">Configurações</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Perfil */}
        <Text className="text-[#8C6D62] text-sm font-bold uppercase tracking-wider mb-3 ml-2">
          Perfil
        </Text>
        <View className="bg-white rounded-3xl overflow-hidden mb-6">
          <SettingsItem icon={UserPen} title="Editar Perfil" onPress={() => router.push('/edit-profile')} />
        </View>

        {/* Notificações */}
        <Text className="text-[#8C6D62] text-sm font-bold uppercase tracking-wider mb-3 ml-2">
          Notificações
        </Text>
        <View className="bg-white rounded-3xl overflow-hidden mb-6">
          <ToggleItem icon={Bell} title="Mensagens novas" value={notifMessages} onToggle={toggleNotifMessages} />
          <View className="h-[1px] bg-zinc-50 mx-4" />
          <ToggleItem icon={Bell} title="Novos interessados" value={notifInterests} onToggle={toggleNotifInterests} />
        </View>

        {/* Permissões */}
        <Text className="text-[#8C6D62] text-sm font-bold uppercase tracking-wider mb-3 ml-2">
          Permissões
        </Text>
        <View className="bg-white rounded-3xl overflow-hidden mb-6">
          <SettingsItem icon={Shield} title="Gerenciar permissões" onPress={() => Linking.openSettings()} />
        </View>

        {/* Conta */}
        <Text className="text-[#8C6D62] text-sm font-bold uppercase tracking-wider mb-3 ml-2">
          Conta
        </Text>
        <View className="bg-white rounded-3xl overflow-hidden">
          <SettingsItem icon={Trash2} title="Deletar conta" onPress={handleDeleteAccount} danger />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
