import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import TripListScreen from './components/TripListScreen';
import NewTripScreen from './components/NewTripScreen';
import ProfileScreen from './components/ProfileScreen';
import TripDetailScreen from './components/TripDetailScreen';
import { RootStackParamList } from './types';
import { COLORS } from './constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Componente de Navegação em Abas Inferior
const MainTabs = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#101922' : '#ffffff',
          borderTopColor: isDark ? '#22303e' : '#e5e7eb',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? '#9ba8b8' : '#637588',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="TripsTab"
        component={TripListScreen}
        options={{
          tabBarLabel: 'Viagens',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="airplane-takeoff" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={TripListScreen} // Placeholder
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={TripListScreen} // Placeholder
        options={{
          tabBarLabel: 'Salvos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador Principal com Lógica Condicional
const MainNavigator = () => {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) {
    return null; // Or Splash
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!session ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="TripList" component={MainTabs} />
          <Stack.Screen
            name="NewTrip"
            component={NewTripScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

import { NetworkProvider } from './contexts/NetworkContext';
import { SyncIndicator } from './components/SyncIndicator';

// ... other imports

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <MainNavigator />
          </NavigationContainer>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
