import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { blink } from '../../lib/blink';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      console.log('Auth state changed:', state);
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  const backgroundColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const subtextColor = isDark ? '#CCCCCC' : '#666666';

  console.log('Rendering HomeScreen - loading:', loading, 'user:', user);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-2xl font-bold mb-4" style={{ color: '#A8E6CF' }}>
            🥗 Loading...
          </Text>
          <Text className="text-center" style={{ color: subtextColor }}>
            Setting up your healthy habits tracker
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            Welcome to AI Calories Tracker! 🥗
          </Text>
          <Text className="text-center mb-8" style={{ color: subtextColor }}>
            Please sign in to start tracking your healthy habits
          </Text>
          <TouchableOpacity
            onPress={() => blink.auth.login()}
            className="bg-[#A8E6CF] px-8 py-4 rounded-full"
          >
            <Text className="text-white font-semibold text-lg">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <View>
            <Text className="text-lg" style={{ color: subtextColor }}>
              Good Morning 👋
            </Text>
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              {user?.displayName || user?.email?.split('@')[0] || 'Friend'}
            </Text>
          </View>
          <TouchableOpacity 
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(168, 230, 207, 0.1)' }}
          >
            <Ionicons name="notifications-outline" size={24} color="#A8E6CF" />
          </TouchableOpacity>
        </View>

        {/* Simple Progress Card */}
        <View 
          className="rounded-3xl p-6 mb-6"
          style={{ 
            backgroundColor: 'rgba(168, 230, 207, 0.1)',
            shadowColor: '#A8E6CF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Today's Progress
          </Text>
          
          <View className="items-center">
            <View className="w-32 h-32 rounded-full bg-[#A8E6CF] items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-white">0</Text>
              <Text className="text-sm text-white">of 2000 cal</Text>
            </View>
            
            <Text className="text-center" style={{ color: subtextColor }}>
              Start logging your meals to see your progress!
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.push('/camera')}
            className="flex-1 mr-2 rounded-2xl p-4 items-center"
            style={{ backgroundColor: '#A8E6CF' }}
          >
            <Ionicons name="camera" size={28} color="white" />
            <Text className="text-white font-semibold mt-2">Scan Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/log')}
            className="flex-1 ml-2 rounded-2xl p-4 items-center"
            style={{ backgroundColor: '#FFD3B6' }}
          >
            <Ionicons name="mic" size={28} color="white" />
            <Text className="text-white font-semibold mt-2">Voice Log</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View 
          className="rounded-2xl p-8 items-center"
          style={{ backgroundColor: 'rgba(168, 230, 207, 0.1)' }}
        >
          <Text className="text-6xl mb-4">🥦</Text>
          <Text className="text-lg font-semibold mb-2" style={{ color: textColor }}>
            No meals logged yet
          </Text>
          <Text className="text-center" style={{ color: subtextColor }}>
            Start by scanning your first meal!
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/camera')}
            className="bg-[#A8E6CF] px-6 py-3 rounded-full mt-4"
          >
            <Text className="text-white font-semibold">Add Meal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push('/camera')}
        className="absolute bottom-32 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{ 
          backgroundColor: '#A8E6CF',
          shadowColor: '#A8E6CF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}