import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { LogBox } from 'react-native';

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import "../global.css";

export default function RootLayout() {
  // Lendo o tema (Light/Dark) diretamente do sistema operacional
  const colorScheme = useColorScheme();
  LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* headerShown: false remove as barras superiores nativas, permitindo o edge-to-edge */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Aqui mapeamos as rotas principais que criaremos */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      {/* translucent e style="auto" garantem que a barra se adapte ao fundo (claro/escuro) */}
      <StatusBar style="auto" translucent />
    </ThemeProvider>
  );
}
