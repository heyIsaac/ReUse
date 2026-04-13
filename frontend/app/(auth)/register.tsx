import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { supabase } from "@/src/services/supabase";
import { useQueryClient } from "@tanstack/react-query";

const AVATAR_COUNT = 12;
const GENDERS = ["Masculino", "Feminino", "Outro", "Prefiro não dizer"];

function generateAvatars(): string[] {
  return Array.from({ length: AVATAR_COUNT }).map(
    () =>
      `https://api.dicebear.com/9.x/fun-emoji/png?seed=${Math.random().toString(36).substring(7)}`
  );
}

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isValidDate(dateStr: string): boolean {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const [, day, month, year] = match;
  const date = new Date(+year, +month - 1, +day);
  const now = new Date();
  return (
    date.getDate() === +day &&
    date.getMonth() === +month - 1 &&
    date.getFullYear() === +year &&
    date < now &&
    +year >= 1900
  );
}

function parseDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [avatars, setAvatars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generated = generateAvatars();
    setAvatars(generated);
    setSelectedAvatar(generated[0]);
  }, []);

  const isValid =
    name.trim().length >= 2 &&
    isValidDate(birthDate) &&
    gender.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          avatar_url: selectedAvatar,
          birth_date: parseDateToISO(birthDate),
          gender,
        },
      });

      await supabase.from("profiles").upsert({
        id: user.id,
        name: name.trim(),
        avatar_url: selectedAvatar,
        birth_date: parseDateToISO(birthDate),
        gender,
      });

      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF9F1]">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 24,
          paddingBottom: Math.max(insets.bottom + 40, 60),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          className="text-[#642714] font-bold mb-2"
          style={{ fontSize: 28, lineHeight: 34 }}
        >
          Complete{"\n"}seu perfil
        </Text>
        <Text className="text-[#8C6D62] text-sm mb-8">
          Precisamos de algumas informações para começar.
        </Text>

        {/* Nome */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
          Seu nome
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Como quer ser chamado?"
          placeholderTextColor="#B0978E"
          maxLength={40}
          className="bg-white h-14 px-5 rounded-2xl border-2 border-transparent text-[#3D2214] text-base mb-6"
          style={{ fontSize: 16 }}
        />

        {/* Data de nascimento */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
          Data de nascimento
        </Text>
        <TextInput
          value={birthDate}
          onChangeText={(text) => setBirthDate(formatDateInput(text))}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#B0978E"
          keyboardType="number-pad"
          maxLength={10}
          className="bg-white h-14 px-5 rounded-2xl border-2 border-transparent text-[#3D2214] text-base mb-6"
          style={{ fontSize: 16 }}
        />

        {/* Gênero */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
          Gênero
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {GENDERS.map((g) => {
            const isSelected = gender === g;
            return (
              <TouchableOpacity
                key={g}
                activeOpacity={0.7}
                onPress={() => setGender(g)}
                className={`px-5 py-3 rounded-2xl border-2 ${
                  isSelected
                    ? "bg-[#FF692E] border-[#FF692E]"
                    : "bg-white border-zinc-100"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isSelected ? "text-white" : "text-[#8C6D62]"
                  }`}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Avatares */}
        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
          Escolha um avatar
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {avatars.map((url) => (
            <TouchableOpacity
              key={url}
              activeOpacity={0.7}
              onPress={() => setSelectedAvatar(url)}
              className={`rounded-2xl overflow-hidden ${
                selectedAvatar === url
                  ? "border-[3px] border-[#FF692E]"
                  : "border-2 border-zinc-100"
              }`}
              style={{ width: "22%", aspectRatio: 1 }}
            >
              <Image
                source={{ uri: url }}
                className="w-full h-full bg-white"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
          className={`w-full h-14 rounded-2xl items-center justify-center mb-4 ${
            isValid ? "bg-[#FF692E]" : "bg-zinc-300"
          }`}
          style={{
            shadowColor: isValid ? "#FF692E" : "transparent",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Começar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
