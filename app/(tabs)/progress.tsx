import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { blink } from '../../lib/blink';
import { CircularProgress } from '../../components/CircularProgress';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [user, setUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stats, setStats] = useState({
    avgCalories: 0,
    totalMeals: 0,
    streakDays: 0,
    waterAvg: 0,
  });

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadProgressData();
      }
    });
    return unsubscribe;
  }, []);

  const loadProgressData = async () => {
    try {
      // Load last 7 days data
      const weekData = [];
      const monthData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get meals for this day
        const meals = await blink.db.meals.list({
          where: { 
            user_id: user?.id,
            created_at: { 
              gte: dateStr + 'T00:00:00.000Z',
              lt: dateStr + 'T23:59:59.999Z'
            }
          }
        });
        
        // Get water intake for this day
        const water = await blink.db.hydration_logs.list({
          where: { 
            user_id: user?.id,
            logged_at: { 
              gte: dateStr + 'T00:00:00.000Z',
              lt: dateStr + 'T23:59:59.999Z'
            }
          }
        });
        
        const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const totalWater = water.reduce((sum, log) => sum + (log.glasses || 0), 0);
        
        weekData.push({
          date: dateStr,
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          calories: totalCalories,
          meals: meals.length,
          water: totalWater,
        });
      }
      
      // Load last 30 days for monthly view
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const meals = await blink.db.meals.list({
          where: { 
            user_id: user?.id,
            created_at: { 
              gte: dateStr + 'T00:00:00.000Z',
              lt: dateStr + 'T23:59:59.999Z'
            }
          }
        });
        
        const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        
        monthData.push({
          date: dateStr,
          calories: totalCalories,
          meals: meals.length,
        });
      }
      
      setWeeklyData(weekData);
      setMonthlyData(monthData);
      
      // Calculate stats
      const avgCalories = weekData.reduce((sum, day) => sum + day.calories, 0) / 7;
      const totalMeals = weekData.reduce((sum, day) => sum + day.meals, 0);
      const waterAvg = weekData.reduce((sum, day) => sum + day.water, 0) / 7;
      
      // Calculate streak (consecutive days with meals logged)
      let streak = 0;
      for (let i = weekData.length - 1; i >= 0; i--) {
        if (weekData[i].meals > 0) {
          streak++;
        } else {
          break;
        }
      }
      
      setStats({
        avgCalories: Math.round(avgCalories),
        totalMeals,
        streakDays: streak,
        waterAvg: Math.round(waterAvg * 10) / 10,
      });
      
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const renderBarChart = (data, maxValue) => {
    const chartWidth = width - 80;
    const chartHeight = 150;
    const barWidth = chartWidth / data.length - 8;
    
    return (
      <View className="flex-row items-end justify-between" style={{ height: chartHeight }}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.calories / maxValue) * (chartHeight - 40) : 0;
          
          return (
            <View key={index} className="items-center">
              <View
                className="rounded-t-lg mb-2"
                style={{
                  width: barWidth,
                  height: Math.max(barHeight, 4),
                  backgroundColor: item.calories > 0 ? '#A8E6CF' : '#E0E0E0',
                }}
              />
              <Text 
                className="text-xs font-medium"
                style={{ color: isDark ? '#CCCCCC' : '#666666' }}
              >
                {selectedPeriod === 'week' ? item.day : item.date.split('-')[2]}
              </Text>
            </View>
          );
        })}
      </View>
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
            Please sign in to view progress
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentData = selectedPeriod === 'week' ? weeklyData : monthlyData;
  const maxCalories = Math.max(...currentData.map(d => d.calories), 2000);

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
              Your Progress
            </Text>
            <Text className="text-sm" style={{ color: subtextColor }}>
              Track your healthy journey
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-l-full ${
                selectedPeriod === 'week' ? 'bg-[#A8E6CF]' : ''
              }`}
              style={{ 
                backgroundColor: selectedPeriod === 'week' ? '#A8E6CF' : cardBackground 
              }}
            >
              <Text 
                className="font-medium"
                style={{ 
                  color: selectedPeriod === 'week' ? 'white' : textColor 
                }}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-r-full ${
                selectedPeriod === 'month' ? 'bg-[#A8E6CF]' : ''
              }`}
              style={{ 
                backgroundColor: selectedPeriod === 'month' ? '#A8E6CF' : cardBackground 
              }}
            >
              <Text 
                className="font-medium"
                style={{ 
                  color: selectedPeriod === 'month' ? 'white' : textColor 
                }}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View 
            className="w-[48%] rounded-2xl p-4 mb-4"
            style={{ backgroundColor: cardBackground }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="flame" size={20} color="#FF6B6B" />
              <Text className="text-sm font-medium ml-2" style={{ color: textColor }}>
                Avg Calories
              </Text>
            </View>
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              {stats.avgCalories}
            </Text>
            <Text className="text-xs" style={{ color: subtextColor }}>
              per day
            </Text>
          </View>

          <View 
            className="w-[48%] rounded-2xl p-4 mb-4"
            style={{ backgroundColor: cardBackground }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="restaurant" size={20} color="#A8E6CF" />
              <Text className="text-sm font-medium ml-2" style={{ color: textColor }}>
                Total Meals
              </Text>
            </View>
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              {stats.totalMeals}
            </Text>
            <Text className="text-xs" style={{ color: subtextColor }}>
              this week
            </Text>
          </View>

          <View 
            className="w-[48%] rounded-2xl p-4 mb-4"
            style={{ backgroundColor: cardBackground }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="trophy" size={20} color="#FFD700" />
              <Text className="text-sm font-medium ml-2" style={{ color: textColor }}>
                Streak
              </Text>
            </View>
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              {stats.streakDays}
            </Text>
            <Text className="text-xs" style={{ color: subtextColor }}>
              days
            </Text>
          </View>

          <View 
            className="w-[48%] rounded-2xl p-4 mb-4"
            style={{ backgroundColor: cardBackground }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="water" size={20} color="#4FC3F7" />
              <Text className="text-sm font-medium ml-2" style={{ color: textColor }}>
                Water Avg
              </Text>
            </View>
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              {stats.waterAvg}
            </Text>
            <Text className="text-xs" style={{ color: subtextColor }}>
              glasses/day
            </Text>
          </View>
        </View>

        {/* Calorie Chart */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Calorie Intake
          </Text>
          
          {currentData.length > 0 ? (
            <>
              {renderBarChart(currentData, maxCalories)}
              <View className="flex-row justify-between mt-4">
                <Text className="text-sm" style={{ color: subtextColor }}>
                  0 cal
                </Text>
                <Text className="text-sm" style={{ color: subtextColor }}>
                  {maxCalories} cal
                </Text>
              </View>
            </>
          ) : (
            <View className="items-center py-8">
              <Text className="text-4xl mb-2">📊</Text>
              <Text className="text-center" style={{ color: subtextColor }}>
                No data available yet
              </Text>
            </View>
          )}
        </View>

        {/* Weekly Summary */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            This Week's Highlights
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#A8E6CF] items-center justify-center mr-3">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text style={{ color: textColor }}>
                Logged meals for {stats.streakDays} consecutive days
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#FFD3B6] items-center justify-center mr-3">
                <Ionicons name="trending-up" size={16} color="white" />
              </View>
              <Text style={{ color: textColor }}>
                Average {stats.avgCalories} calories per day
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#4FC3F7] items-center justify-center mr-3">
                <Ionicons name="water" size={16} color="white" />
              </View>
              <Text style={{ color: textColor }}>
                Staying hydrated with {stats.waterAvg} glasses daily
              </Text>
            </View>
          </View>
        </View>

        {/* Motivational Card */}
        <View 
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#A8E6CF' }}
        >
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🎉</Text>
            <Text className="text-white font-bold text-lg">
              Keep it up!
            </Text>
          </View>
          <Text className="text-white">
            {stats.streakDays > 0 
              ? `You're on a ${stats.streakDays}-day streak! Consistency is key to building healthy habits.`
              : "Start your healthy journey today! Log your first meal to begin building positive habits."
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}