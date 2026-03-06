import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    // SafeAreaView garante que o conteúdo não bata no notch da câmera ou barra de gestos
    // O flex-1 estica a view para ocupar tudo, e o fundo preenche o edge-to-edge
    <SafeAreaView className="flex-1 items-center justify-between bg-white px-6 py-8 dark:bg-zinc-950">
      {/* Espaço em branco no topo para empurrar o conteúdo para o centro */}
      <View className="flex-1 items-center justify-center">
        {/* Título do App */}
        <Text className="mb-4 text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">
          ReUse!
        </Text>

        {/* Subtítulo baseado na visão da Clara */}
        <Text className="text-center text-lg leading-7 text-zinc-600 dark:text-zinc-400">
          Dê uma nova história para seus objetos. Conecte-se com sua comunidade
          e transforme hábitos de consumo.
        </Text>
      </View>

      {/* Botão */}
      <View className="w-full gap-4 pb-4">
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full items-center rounded-2xl bg-emerald-600 py-4 shadow-sm active:bg-emerald-700 dark:bg-emerald-500"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-lg font-bold text-white">Começar Agora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
