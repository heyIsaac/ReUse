import { ScreenLayout } from '@/components/layout/screen-layout';
import { Text } from '@/components/ui/text';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { supabase } from '@/src/services/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const GENDERS = ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'];
const AVATAR_COUNT = 12;

function generateAvatars(): string[] {
  return Array.from({ length: AVATAR_COUNT }).map(
    () => `https://api.dicebear.com/9.x/fun-emoji/png?seed=${Math.random().toString(36).substring(7)}`
  );
}

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

function formatISOtoDisplay(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUserProfile();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [avatars, setAvatars] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAvatars(generateAvatars());
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchMeta = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const meta = authUser.user_metadata ?? {};
      setName(meta.full_name || meta.name || '');
      setBirthDate(meta.birth_date ? formatISOtoDisplay(meta.birth_date) : '');
      setGender(meta.gender || '');
      setSelectedAvatar(meta.avatar_url || user.avatarUrl || '');
    };
    fetchMeta();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          avatar_url: selectedAvatar,
          birth_date: birthDate.length === 10 ? parseDateToISO(birthDate) : undefined,
          gender: gender || undefined,
        },
      });

      await supabase.from('profiles').upsert({
        id: authUser.id,
        name: name.trim(),
        avatar_url: selectedAvatar,
        birth_date: birthDate.length === 10 ? parseDateToISO(birthDate) : null,
        gender: gender || null,
      });

      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      router.back();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
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
        <Text variant="h3" className="text-[#642714]">Editar Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar atual */}
        {selectedAvatar ? (
          <View className="items-center mb-6">
            <Image source={{ uri: selectedAvatar }} className="w-24 h-24 rounded-full bg-zinc-100" />
          </View>
        ) : null}

        {/* Nome */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor="#B0978E"
          maxLength={40}
          className="bg-white h-14 px-5 rounded-2xl border-2 border-transparent text-[#3D2214] text-base mb-6"
          style={{ fontSize: 16 }}
        />

        {/* Data de nascimento */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Data de nascimento</Text>
        <TextInput
          value={birthDate}
          onChangeText={(t) => setBirthDate(formatDateInput(t))}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#B0978E"
          keyboardType="number-pad"
          maxLength={10}
          className="bg-white h-14 px-5 rounded-2xl border-2 border-transparent text-[#3D2214] text-base mb-6"
          style={{ fontSize: 16 }}
        />

        {/* Gênero */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Gênero</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              className={`px-5 py-3 rounded-2xl border-2 ${
                gender === g ? 'bg-[#FF692E] border-[#FF692E]' : 'bg-white border-zinc-100'
              }`}
            >
              <Text className={`font-semibold text-sm ${gender === g ? 'text-white' : 'text-[#8C6D62]'}`}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Avatares */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">Trocar avatar</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {avatars.map((url) => (
            <TouchableOpacity
              key={url}
              onPress={() => setSelectedAvatar(url)}
              className={`rounded-2xl overflow-hidden ${
                selectedAvatar === url ? 'border-[3px] border-[#FF692E]' : 'border-2 border-zinc-100'
              }`}
              style={{ width: '22%', aspectRatio: 1 }}
            >
              <Image source={{ uri: url }} className="w-full h-full bg-white" resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Salvar */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || name.trim().length < 2}
          className={`w-full h-14 rounded-2xl items-center justify-center ${
            name.trim().length >= 2 ? 'bg-[#FF692E]' : 'bg-zinc-300'
          }`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Salvar alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}
