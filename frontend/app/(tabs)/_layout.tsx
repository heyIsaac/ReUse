import { router, Tabs } from 'expo-router';
import { Home, Map as MapIcon, MessageCircle, Plus, User } from 'lucide-react-native';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // As cores do nosso Design System
        tabBarActiveTintColor: '#FF692E', // Laranja Coral (Mitti)
        tabBarInactiveTintColor: '#8C6D62', // Marrom claro suave (Inativo)
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0, // Tiramos a linha dura
          elevation: 10, // Sombra no Android
          shadowColor: '#642714', // Sombra no iOS usando nosso Marrom escuro
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 88 : 68, // Altura adaptável
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} strokeWidth={2.5} />,
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <MapIcon color={color} size={24} strokeWidth={2.5} />,
        }}
      />

     {/* O BOTAO CENTRAL INTERCEPTADO */}
      <Tabs.Screen
        name="donate"
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/create-listing');
          },
        })}
        options={{
          title: 'Desapegar',
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View
              className="items-center justify-center rounded-full bg-[#FF692E]"
              style={{
                width: 56, height: 56, marginTop: -32,
                borderWidth: 4, borderColor: '#FFFFFF',
                shadowColor: '#FF692E', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
                transform: [{ scale: focused ? 1.05 : 1 }]
              }}
            >
              <Plus color="#FFFFFF" size={28} strokeWidth={3.5} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={24} strokeWidth={2.5} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={24} strokeWidth={2.5} />,
        }}
      />

    </Tabs>
  );
}
