import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 pt-12 pb-6 justify-between"
      >
        {/* Cabeçalho */}
        <View className="gap-2">
          <Text className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Bem-vindo de volta!
          </Text>
          <Text className="text-lg text-zinc-600 dark:text-zinc-400">
            Faça login para continuar suas trocas no ReUse.
          </Text>
        </View>

        {/* Formulário */}
        <View className="w-full gap-5 mt-10 flex-1">
          {/* Input E-mail */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 ml-1">
              E-mail
            </Text>
            <TextInput
              className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 text-base text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500"
              placeholder="seu@email.com"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Input Senha */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 ml-1">
              Senha
            </Text>
            <TextInput
              className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 text-base text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500"
              placeholder="••••••••"
              placeholderTextColor="#71717a"
              secureTextEntry
            />
          </View>

          {/* Esqueci minha senha */}
          <TouchableOpacity className="self-end" activeOpacity={0.7}>
            <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          {/* Botão Entrar */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full h-14 items-center justify-center rounded-2xl bg-emerald-600 mt-4 shadow-sm active:bg-emerald-700 dark:bg-emerald-500"
            onPress={() => console.log("Chamar API de Login")}
          >
            <Text className="text-lg font-bold text-white">Entrar</Text>
          </TouchableOpacity>
        </View>

        {/* Separador e Redes Sociais */}
        <View className="w-full gap-6 mt-8">
          <View className="flex-row items-center gap-4">
            <View className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              ou continue com
            </Text>
            <View className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 h-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-800">
              <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 h-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-800">
              <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                Facebook
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rodapé: Cadastre-se */}
        <View className="flex-row justify-center mt-10">
          <Text className="text-base text-zinc-600 dark:text-zinc-400">
            Não tem uma conta?{" "}
          </Text>
          <TouchableOpacity onPress={() => console.log("Ir para Cadastro")}>
            <Text className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
