import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, useColorScheme } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Adicione isto
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { supabase } from "@/src/services/supabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
});

/** Limpa / invalida cache do React Query quando a sessão Supabase muda (evita perfil da conta antiga). */
function AuthQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.clear();
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        [
          ["userProfile"],
          ["favoriteIds"],
          ["favorites"],
          ["listings"],
          ["notifications"],
          ["unreadNotifications"],
          ["chatMyListings"],
          ["chatMyInterests"],
          ["chatRooms"],
          ["myRating"],
        ].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthQuerySync />
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
            <Stack.Screen
              name="listing/[id]"
              options={{
                animation: 'slide_from_right',
              }}
            />
          </Stack>
          <StatusBar style="auto" translucent />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
