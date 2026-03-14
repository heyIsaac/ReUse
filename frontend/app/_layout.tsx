import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, useColorScheme } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Adicione isto
import "react-native-reanimated";
import "../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="create-listing"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
          </Stack>
          <StatusBar style="auto" translucent />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
