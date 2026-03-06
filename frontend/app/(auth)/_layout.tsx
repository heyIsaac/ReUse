import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    // Escondemos o header padrão nativo para manter o design edge-to-edge limpo
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
