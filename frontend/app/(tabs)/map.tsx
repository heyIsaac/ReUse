import { Text } from '@/components/ui/text';
import { useGetListings } from '@/src/services/useListings';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MapPin, Navigation } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: listings, isLoading } = useGetListings();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const listingsWithLocation = listings?.filter(l => (l as any).latitude && (l as any).longitude) ?? [];

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: -23.55, longitude: -46.63, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  const centerOnUser = () => {
    if (userLocation && mapRef) {
      mapRef.animateToRegion({ ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
    }
  };

  return (
    <View className="flex-1">
      {isLoading || !userLocation ? (
        <View className="flex-1 items-center justify-center bg-[#FDF9F1]">
          <ActivityIndicator color="#FF692E" size="large" />
          <Text className="text-[#8C6D62] text-sm mt-3">Carregando mapa...</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={(ref) => setMapRef(ref)}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {listingsWithLocation.map((item) => (
              <Marker
                key={item.id}
                coordinate={{ latitude: (item as any).latitude, longitude: (item as any).longitude }}
              >
                <View className="bg-white p-1.5 rounded-xl shadow-sm border border-zinc-100">
                  {item.images?.[0] ? (
                    <Image
                      source={{ uri: item.images[0] }}
                      style={{ width: 36, height: 36, borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin color="#FF692E" size={16} />
                    </View>
                  )}
                </View>
                <Callout onPress={() => router.push(`/listing/${item.id}`)}>
                  <View style={{ width: 180, padding: 4 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#3D2214' }}>{item.title}</Text>
                    <Text style={{ fontSize: 11, color: '#8C6D62', marginTop: 2 }}>{item.category} · {item.condition}</Text>
                    <Text style={{ fontSize: 10, color: '#FF692E', marginTop: 4, fontWeight: '600' }}>Ver anúncio →</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Center on user button */}
          <TouchableOpacity
            onPress={centerOnUser}
            className="absolute bg-white p-3 rounded-full shadow-lg"
            style={{ bottom: insets.bottom + 90, right: 20 }}
          >
            <Navigation color="#FF692E" size={22} />
          </TouchableOpacity>

          {/* Info overlay */}
          {listingsWithLocation.length === 0 && (
            <View className="absolute top-0 left-0 right-0 bg-[#FF692E]/90 px-5 py-3" style={{ paddingTop: insets.top + 8 }}>
              <Text className="text-white text-xs font-bold text-center">
                Nenhum anúncio com localização ainda. Crie um para aparecer no mapa!
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
