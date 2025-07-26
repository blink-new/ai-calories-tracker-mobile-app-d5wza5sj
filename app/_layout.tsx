import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, Text } from 'react-native';
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
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#A8E6CF',
          marginBottom: 16 
        }}>
          🥗 AI Calories Tracker
        </Text>
        <Text style={{ 
          color: colorScheme === 'dark' ? '#CCCCCC' : '#666666' 
        }}>
          Loading your healthy habits...
        </Text>
      </View>
    );
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