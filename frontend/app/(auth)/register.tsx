import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { supabase } from "@/src/services/supabase";

const AVATAR_COUNT = 12;

function generateAvatars(): string[] {
  return Array.from({ length: AVATAR_COUNT }).map(
    () =>
      `https://api.dicebear.com/9.x/fun-emoji/png?seed=${Math.random().toString(36).substring(7)}`
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [avatars, setAvatars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generated = generateAvatars();
    setAvatars(generated);
    setSelectedAvatar(generated[0]);
  }, []);

  const isValid = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.auth.updateUser({
        data: { full_name: name.trim(), avatar_url: selectedAvatar },
      });

      await supabase.from("profiles").upsert({
        id: user.id,
        name: name.trim(),
        avatar_url: selectedAvatar,
      });

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
          paddingBottom: Math.max(insets.bottom + 16, 32),
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
          Só precisamos do seu nome e um avatar para começar.
        </Text>

        <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
          Seu nome
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Como quer ser chamado?"
          placeholderTextColor="#B0978E"
          maxLength={40}
          className="bg-white h-14 px-5 rounded-2xl border-2 border-transparent text-[#3D2214] text-base mb-8"
          style={{ fontSize: 16 }}
        />

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

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
          className={`w-full h-14 rounded-2xl items-center justify-center ${
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
