import { Text } from '@/components/ui/text';
import { api } from '@/src/services/api';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function QrScannerScreen() {
  const { chatRoomId } = useLocalSearchParams<{ chatRoomId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const match = data.match(/reuse:\/\/confirm\/([^/]+)\/(.+)/);
    if (!match) {
      Alert.alert('', 'QR Code inválido.');
      setIsProcessing(false);
      return;
    }

    const [, roomId, token] = match;

    try {
      await api.post(`/chat/${roomId}/confirm-delivery`, { token });
      Alert.alert('', 'Entrega confirmada!');
      router.replace(`/rate?chatRoomId=${roomId}&userName=`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao confirmar entrega.';
      Alert.alert('', msg);
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FDF9F1] px-6">
        <Text className="text-[#642714] font-bold text-lg text-center mb-4">
          Precisamos da câmera para escanear o QR Code
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-[#FF692E] px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold">Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View className="absolute inset-0" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-5 pt-4 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black/50 p-2.5 rounded-full"
          >
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white font-bold text-base ml-3">Escanear QR Code</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <View style={{ width: 250, height: 250, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 24 }} />
          <Text className="text-white/70 text-sm mt-4">Aponte para o QR Code do dono</Text>
        </View>

        {isProcessing && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center">
            <ActivityIndicator color="white" size="large" />
            <Text className="text-white mt-3">Confirmando entrega...</Text>
          </View>
        )}
      </View>
    </View>
  );
}
