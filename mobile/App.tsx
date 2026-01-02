import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from './components/WelcomeScreen';
import TripListScreen from './components/TripListScreen';
import NewTripScreen from './components/NewTripScreen';
import { RootStackParamList } from './types';
import { COLORS } from './constants';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator Component
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
        component={TripListScreen} // Placeholder
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

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="TripList" component={MainTabs} />
          <Stack.Screen
            name="NewTrip"
            component={NewTripScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
