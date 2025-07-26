import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { blink } from '../../lib/blink';
import { CircularProgress } from '../../components/CircularProgress';
import { MealCard } from '../../components/MealCard';
import { WaterGlass } from '../../components/WaterGlass';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterGoal] = useState(8);
  const [greeting, setGreeting] = useState('');
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadTodayData();
      }
    });
    return unsubscribe;
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Load today's meals
      const mealsData = await blink.db.meals.list({
        where: { 
          user_id: user?.id,
          created_at: { gte: today + 'T00:00:00.000Z' }
        },
        orderBy: { created_at: 'desc' },
        limit: 10
      });
      
      setMeals(mealsData);
      
      // Calculate total calories
      const totalCalories = mealsData.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      setDailyCalories(totalCalories);
      
      // Load water intake
      const waterData = await blink.db.hydration_logs.list({
        where: { 
          user_id: user?.id,
          logged_at: { gte: today + 'T00:00:00.000Z' }
        }
      });
      
      const totalWater = waterData.reduce((sum, log) => sum + (log.glasses || 0), 0);
      setWaterGlasses(totalWater);
      
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const addWaterGlass = async () => {
    try {
      await blink.db.hydration_logs.create({
        id: `water_${Date.now()}`,
        user_id: user?.id,
        glasses: 1,
        logged_at: new Date().toISOString()
      });
      setWaterGlasses(prev => prev + 1);
    } catch (error) {
      console.error('Error adding water:', error);
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
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <ScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mt-4 mb-6">
            <View>
              <Text className="text-lg" style={{ color: subtextColor }}>
                {greeting} 👋
              </Text>
              <Text className="text-2xl font-bold" style={{ color: textColor }}>
                {user?.displayName || user?.email?.split('@')[0] || 'Friend'}
              </Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: cardBackground }}
            >
              <Ionicons name="notifications-outline" size={24} color="#A8E6CF" />
            </TouchableOpacity>
          </View>

          {/* Daily Progress Card */}
          <View 
            className="rounded-3xl p-6 mb-6"
            style={{ 
              backgroundColor: cardBackground,
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
            
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <CircularProgress
                  size={120}
                  progress={(dailyCalories / dailyGoal) * 100}
                  strokeWidth={8}
                  color="#A8E6CF"
                  backgroundColor={isDark ? '#333333' : '#F0F0F0'}
                >
                  <View className="items-center">
                    <Text className="text-2xl font-bold" style={{ color: textColor }}>
                      {dailyCalories}
                    </Text>
                    <Text className="text-sm" style={{ color: subtextColor }}>
                      of {dailyGoal} cal
                    </Text>
                  </View>
                </CircularProgress>
              </View>
              
              <View className="flex-1 ml-6">
                <View className="mb-4">
                  <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                    Water Intake 💧
                  </Text>
                  <View className="flex-row items-center">
                    <WaterGlass 
                      filled={waterGlasses} 
                      total={waterGoal} 
                      size={40}
                    />
                    <Text className="ml-3 text-lg font-semibold" style={{ color: textColor }}>
                      {waterGlasses}/{waterGoal}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={addWaterGlass}
                    className="bg-[#A8E6CF] px-4 py-2 rounded-full mt-2"
                  >
                    <Text className="text-white text-sm font-medium text-center">
                      Add Glass
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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

          {/* Recent Meals */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold" style={{ color: textColor }}>
                Today's Meals
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/log')}>
                <Text className="text-[#A8E6CF] font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            
            {meals.length === 0 ? (
              <View 
                className="rounded-2xl p-8 items-center"
                style={{ backgroundColor: cardBackground }}
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
            ) : (
              <View>
                {meals.slice(0, 3).map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onPress={() => router.push(`/meal-details?id=${meal.id}`)}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}
          </View>

          {/* AI Suggestions */}
          <View 
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: '#FFD3B6' }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">AI Suggestion</Text>
            </View>
            <Text className="text-white">
              {dailyCalories < dailyGoal * 0.5 
                ? "You're doing great! Consider adding some protein-rich snacks to reach your goal. 🥜"
                : dailyCalories > dailyGoal * 0.9
                ? "Almost at your goal! Maybe try some herbal tea instead of more calories. 🍵"
                : "Perfect pace! Keep up the balanced eating throughout the day. ✨"
              }
            </Text>
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
      </Animated.View>
    </SafeAreaView>
  );
}