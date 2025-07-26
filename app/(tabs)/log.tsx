import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { blink } from '../../lib/blink';
import Modal from 'react-native-modal';

const mealTypes = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', color: '#FFD3B6' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', color: '#A8E6CF' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', color: '#FFAAA5' },
  { id: 'snack', name: 'Snack', emoji: '🍎', color: '#E6E6FA' },
];

export default function LogScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [user, setUser] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [recentMeals, setRecentMeals] = useState([]);
  
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadRecentMeals();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Set default meal type based on time
    const hour = new Date().getHours();
    if (hour < 11) setSelectedMealType('breakfast');
    else if (hour < 16) setSelectedMealType('lunch');
    else if (hour < 20) setSelectedMealType('dinner');
    else setSelectedMealType('snack');
  }, []);

  const loadRecentMeals = async () => {
    try {
      const meals = await blink.db.meals.list({
        where: { user_id: user?.id },
        orderBy: { created_at: 'desc' },
        limit: 5
      });
      setRecentMeals(meals);
    } catch (error) {
      console.error('Error loading recent meals:', error);
    }
  };

  const startVoiceInput = () => {
    setIsVoiceModalVisible(true);
    setIsListening(true);
    setVoiceText('');
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate voice recognition (in real app, use expo-speech or similar)
    setTimeout(() => {
      setIsListening(false);
      setVoiceText("2 eggs and a banana");
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }, 3000);
  };

  const processVoiceInput = () => {
    if (voiceText) {
      // Simple parsing - in real app, use AI to parse food items
      setFoodName(voiceText);
      setCalories('350'); // Estimated calories
      setIsVoiceModalVisible(false);
      setVoiceText('');
    }
  };

  const logMeal = async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    try {
      const mealType = mealTypes.find(m => m.id === selectedMealType);
      
      await blink.db.meals.create({
        id: `meal_${Date.now()}`,
        user_id: user?.id,
        food_name: foodName,
        calories: parseInt(calories) || 0,
        notes: notes,
        meal_type: selectedMealType,
        emoji: mealType?.emoji || '🍽️',
        created_at: new Date().toISOString()
      });

      // Reset form
      setFoodName('');
      setCalories('');
      setNotes('');
      
      Alert.alert('Success', 'Meal logged successfully!');
      loadRecentMeals();
      
    } catch (error) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const quickAddMeal = async (meal) => {
    try {
      await blink.db.meals.create({
        id: `meal_${Date.now()}`,
        user_id: user?.id,
        food_name: meal.food_name,
        calories: meal.calories,
        notes: 'Quick add from recent',
        meal_type: selectedMealType,
        emoji: mealTypes.find(m => m.id === selectedMealType)?.emoji || '🍽️',
        created_at: new Date().toISOString()
      });
      
      Alert.alert('Success', 'Meal added successfully!');
      loadRecentMeals();
    } catch (error) {
      console.error('Error quick adding meal:', error);
    }
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
            Please sign in to log meals
          </Text>
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
          <Text className="text-2xl font-bold" style={{ color: textColor }}>
            Log Your Meal
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/camera')}
            className="bg-[#A8E6CF] px-4 py-2 rounded-full"
          >
            <Text className="text-white font-medium">📸 Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.push('/camera')}
            className="flex-1 mr-2 rounded-2xl p-4 items-center"
            style={{ backgroundColor: '#A8E6CF' }}
          >
            <Ionicons name="camera" size={32} color="white" />
            <Text className="text-white font-semibold mt-2">Camera</Text>
            <Text className="text-white text-xs opacity-80">AI Recognition</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={startVoiceInput}
            className="flex-1 mx-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: '#FFD3B6' }}
          >
            <Ionicons name="mic" size={32} color="white" />
            <Text className="text-white font-semibold mt-2">Voice</Text>
            <Text className="text-white text-xs opacity-80">Say your meal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 ml-2 rounded-2xl p-4 items-center"
            style={{ backgroundColor: '#FFAAA5' }}
          >
            <Ionicons name="search" size={32} color="white" />
            <Text className="text-white font-semibold mt-2">Search</Text>
            <Text className="text-white text-xs opacity-80">Food database</Text>
          </TouchableOpacity>
        </View>

        {/* Meal Type Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: textColor }}>
            Meal Type
          </Text>
          <View className="flex-row justify-between">
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedMealType(type.id)}
                className={`flex-1 mx-1 rounded-2xl p-3 items-center ${
                  selectedMealType === type.id ? 'opacity-100' : 'opacity-60'
                }`}
                style={{ 
                  backgroundColor: selectedMealType === type.id ? type.color : cardBackground 
                }}
              >
                <Text className="text-2xl mb-1">{type.emoji}</Text>
                <Text 
                  className="font-medium text-sm"
                  style={{ 
                    color: selectedMealType === type.id ? 'white' : textColor 
                  }}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Manual Entry Form */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Manual Entry
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Food Name
            </Text>
            <TextInput
              value={foodName}
              onChangeText={setFoodName}
              placeholder="e.g., Grilled chicken salad"
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
              Calories (optional)
            </Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g., 350"
              placeholderTextColor={subtextColor}
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
              Notes (optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Homemade, with olive oil dressing"
              placeholderTextColor={subtextColor}
              multiline
              numberOfLines={3}
              className="border rounded-xl px-4 py-3"
              style={{ 
                borderColor: isDark ? '#333333' : '#E0E0E0',
                backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                color: textColor,
                textAlignVertical: 'top'
              }}
            />
          </View>
          
          <TouchableOpacity
            onPress={logMeal}
            className="bg-[#A8E6CF] rounded-xl py-4"
          >
            <Text className="text-white font-semibold text-center text-lg">
              Log Meal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Add from Recent */}
        {recentMeals.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: textColor }}>
              Quick Add from Recent
            </Text>
            {recentMeals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                onPress={() => quickAddMeal(meal)}
                className="flex-row items-center justify-between p-4 mb-2 rounded-xl"
                style={{ backgroundColor: cardBackground }}
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-2xl mr-3">{meal.emoji || '🍽️'}</Text>
                  <View className="flex-1">
                    <Text className="font-medium" style={{ color: textColor }}>
                      {meal.food_name}
                    </Text>
                    <Text className="text-sm" style={{ color: subtextColor }}>
                      {meal.calories} cal
                    </Text>
                  </View>
                </View>
                <Ionicons name="add-circle" size={24} color="#A8E6CF" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Voice Input Modal */}
      <Modal
        isVisible={isVoiceModalVisible}
        onBackdropPress={() => setIsVoiceModalVisible(false)}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <View 
          className="bg-white rounded-3xl p-8 mx-6"
          style={{ backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }}
        >
          <View className="items-center">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                marginBottom: 20,
              }}
            >
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{ backgroundColor: isListening ? '#A8E6CF' : '#FFD3B6' }}
              >
                <Ionicons 
                  name={isListening ? "mic" : "checkmark"} 
                  size={40} 
                  color="white" 
                />
              </View>
            </Animated.View>
            
            <Text className="text-xl font-bold mb-2" style={{ color: textColor }}>
              {isListening ? 'Listening...' : 'Voice Captured!'}
            </Text>
            
            <Text className="text-center mb-4" style={{ color: subtextColor }}>
              {isListening 
                ? 'Say your meal (e.g., "2 eggs and a banana")'
                : `"${voiceText}"`
              }
            </Text>
            
            {!isListening && voiceText && (
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setIsVoiceModalVisible(false)}
                  className="flex-1 mr-2 py-3 rounded-xl border"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <Text className="text-center font-medium" style={{ color: subtextColor }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={processVoiceInput}
                  className="flex-1 ml-2 py-3 rounded-xl bg-[#A8E6CF]"
                >
                  <Text className="text-white text-center font-medium">
                    Use This
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}