import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { blink } from '../lib/blink';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Show loading screen
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF' 
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="camera" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom'
          }} 
        />
        <Stack.Screen 
          name="meal-details" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_right'
          }} 
        />
      </Stack>
    </>
  );
}