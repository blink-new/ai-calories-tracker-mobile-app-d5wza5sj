import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { blink } from '../../lib/blink';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [user, setUser] = useState(null);
  const [dailyGoal, setDailyGoal] = useState('2000');
  const [waterGoal, setWaterGoal] = useState('8');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        setDisplayName(state.user.displayName || '');
      }
    });
    return unsubscribe;
  }, []);

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      await blink.auth.updateMe({
        displayName: displayName.trim() || user.email?.split('@')[0] || 'User'
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const signOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => blink.auth.logout()
        }
      ]
    );
  };

  const backgroundColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const cardBackground = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(168, 230, 207, 0.1)';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const subtextColor = isDark ? '#CCCCCC' : '#666666';

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold mb-4" style={{ color: textColor }}>
            Please sign in to access settings
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
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              Profile & Settings
            </Text>
            <Text className="text-sm" style={{ color: subtextColor }}>
              Customize your experience
            </Text>
          </View>
          <View 
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: '#A8E6CF' }}
          >
            <Text className="text-2xl">
              {displayName ? displayName[0].toUpperCase() : '👤'}
            </Text>
          </View>
        </View>

        {/* Profile Section */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Profile Information
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Display Name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={subtextColor}
              className="border rounded-xl px-4 py-3"
              style={{ 
                borderColor: isDark ? '#333333' : '#E0E0E0',
                backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                color: textColor
              }}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Email
            </Text>
            <View 
              className="border rounded-xl px-4 py-3"
              style={{ 
                borderColor: isDark ? '#333333' : '#E0E0E0',
                backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
              }}
            >
              <Text style={{ color: subtextColor }}>
                {user.email}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={updateProfile}
            className="bg-[#A8E6CF] rounded-xl py-3"
          >
            <Text className="text-white font-semibold text-center">
              Update Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Goals Section */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Daily Goals
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Calorie Goal
            </Text>
            <TextInput
              value={dailyGoal}
              onChangeText={setDailyGoal}
              placeholder="2000"
              keyboardType="numeric"
              className="border rounded-xl px-4 py-3"
              style={{ 
                borderColor: isDark ? '#333333' : '#E0E0E0',
                backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                color: textColor
              }}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Water Goal (glasses)
            </Text>
            <TextInput
              value={waterGoal}
              onChangeText={setWaterGoal}
              placeholder="8"
              keyboardType="numeric"
              className="border rounded-xl px-4 py-3"
              style={{ 
                borderColor: isDark ? '#333333' : '#E0E0E0',
                backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                color: textColor
              }}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Preferences
          </Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <Ionicons name="notifications" size={20} color="#A8E6CF" />
              <View className="ml-3">
                <Text className="font-medium" style={{ color: textColor }}>
                  Push Notifications
                </Text>
                <Text className="text-sm" style={{ color: subtextColor }}>
                  Meal reminders and habit alerts
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E0E0E0', true: '#A8E6CF' }}
              thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons name="moon" size={20} color="#A8E6CF" />
              <View className="ml-3">
                <Text className="font-medium" style={{ color: textColor }}>
                  Dark Mode
                </Text>
                <Text className="text-sm" style={{ color: subtextColor }}>
                  Follow system setting
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#A8E6CF' }}
              thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            App Information
          </Text>
          
          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Ionicons name="help-circle" size={20} color="#A8E6CF" />
              <Text className="ml-3 font-medium" style={{ color: textColor }}>
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Ionicons name="document-text" size={20} color="#A8E6CF" />
              <Text className="ml-3 font-medium" style={{ color: textColor }}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#A8E6CF" />
              <Text className="ml-3 font-medium" style={{ color: textColor }}>
                Rate the App
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </TouchableOpacity>
          
          <View className="flex-row items-center py-3">
            <Ionicons name="information-circle" size={20} color="#A8E6CF" />
            <Text className="ml-3" style={{ color: subtextColor }}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* Achievement Section */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: '#A8E6CF' }}
        >
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🏆</Text>
            <Text className="text-white font-bold text-lg">
              Your Achievements
            </Text>
          </View>
          <Text className="text-white mb-4">
            Keep logging meals and building healthy habits to unlock more achievements!
          </Text>
          
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl mb-1">🥇</Text>
              <Text className="text-white text-xs text-center">First Meal</Text>
            </View>
            <View className="items-center opacity-50">
              <Text className="text-2xl mb-1">🔥</Text>
              <Text className="text-white text-xs text-center">7-Day Streak</Text>
            </View>
            <View className="items-center opacity-50">
              <Text className="text-2xl mb-1">💧</Text>
              <Text className="text-white text-xs text-center">Hydration Hero</Text>
            </View>
            <View className="items-center opacity-50">
              <Text className="text-2xl mb-1">🌟</Text>
              <Text className="text-white text-xs text-center">Habit Master</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={signOut}
          className="rounded-2xl p-4 items-center"
          style={{ backgroundColor: '#FFAAA5' }}
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}