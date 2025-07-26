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
import { blink } from '../../lib/blink';
import Modal from 'react-native-modal';

const defaultHabits = [
  { name: 'Drink Water', emoji: '💧', target: 8 },
  { name: 'Eat Fruits', emoji: '🍎', target: 2 },
  { name: 'Exercise', emoji: '🏃‍♂️', target: 1 },
  { name: 'Meditate', emoji: '🧘‍♀️', target: 1 },
  { name: 'Sleep 8h', emoji: '😴', target: 1 },
  { name: 'Eat Vegetables', emoji: '🥬', target: 3 },
];

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState({});
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('✨');
  const [newHabitTarget, setNewHabitTarget] = useState('1');
  const [streaks, setStreaks] = useState({});

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadHabits();
        loadTodayLogs();
        calculateStreaks();
      }
    });
    return unsubscribe;
  }, []);

  const loadHabits = async () => {
    try {
      const habitsData = await blink.db.habits.list({
        where: { user_id: user?.id },
        orderBy: { created_at: 'asc' }
      });
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const loadTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logs = await blink.db.habit_logs.list({
        where: { 
          user_id: user?.id,
          completed_at: { gte: today + 'T00:00:00.000Z' }
        }
      });
      
      const logsMap = {};
      logs.forEach(log => {
        if (!logsMap[log.habit_id]) {
          logsMap[log.habit_id] = 0;
        }
        logsMap[log.habit_id] += log.count || 1;
      });
      
      setHabitLogs(logsMap);
    } catch (error) {
      console.error('Error loading habit logs:', error);
    }
  };

  const calculateStreaks = async () => {
    try {
      // Simple streak calculation - in real app, this would be more sophisticated
      const streaksMap = {};
      for (const habit of habits) {
        const logs = await blink.db.habit_logs.list({
          where: { 
            user_id: user?.id,
            habit_id: habit.id
          },
          orderBy: { completed_at: 'desc' },
          limit: 30
        });
        
        // Calculate consecutive days
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          const dayLogs = logs.filter(log => 
            log.completed_at.startsWith(dateStr)
          );
          
          if (dayLogs.length > 0) {
            streak++;
          } else if (i === 0) {
            // If today has no logs, streak is 0
            break;
          } else {
            // If any previous day has no logs, break streak
            break;
          }
        }
        
        streaksMap[habit.id] = streak;
      }
      setStreaks(streaksMap);
    } catch (error) {
      console.error('Error calculating streaks:', error);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      const habitId = `habit_${Date.now()}`;
      await blink.db.habits.create({
        id: habitId,
        user_id: user?.id,
        name: newHabitName,
        emoji: newHabitEmoji,
        target_count: parseInt(newHabitTarget) || 1,
        created_at: new Date().toISOString()
      });

      setNewHabitName('');
      setNewHabitEmoji('✨');
      setNewHabitTarget('1');
      setIsAddModalVisible(false);
      loadHabits();
      
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit');
    }
  };

  const logHabit = async (habit) => {
    try {
      await blink.db.habit_logs.create({
        id: `log_${Date.now()}`,
        user_id: user?.id,
        habit_id: habit.id,
        completed_at: new Date().toISOString(),
        count: 1
      });

      // Update local state
      setHabitLogs(prev => ({
        ...prev,
        [habit.id]: (prev[habit.id] || 0) + 1
      }));
      
      // Recalculate streaks
      calculateStreaks();
      
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  const quickAddHabit = async (defaultHabit) => {
    try {
      const habitId = `habit_${Date.now()}`;
      await blink.db.habits.create({
        id: habitId,
        user_id: user?.id,
        name: defaultHabit.name,
        emoji: defaultHabit.emoji,
        target_count: defaultHabit.target,
        created_at: new Date().toISOString()
      });
      
      loadHabits();
    } catch (error) {
      console.error('Error adding quick habit:', error);
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
            Please sign in to track habits
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
          <View>
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              Healthy Habits
            </Text>
            <Text className="text-sm" style={{ color: subtextColor }}>
              Build consistency, one day at a time
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsAddModalVisible(true)}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: '#A8E6CF' }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Today's Progress */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBackground }}
        >
          <Text className="text-lg font-semibold mb-3" style={{ color: textColor }}>
            Today's Progress
          </Text>
          
          {habits.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-6xl mb-4">🌱</Text>
              <Text className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                No habits yet
              </Text>
              <Text className="text-center mb-4" style={{ color: subtextColor }}>
                Start building healthy habits today!
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(true)}
                className="bg-[#A8E6CF] px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Add First Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {habits.map((habit) => {
                const completed = habitLogs[habit.id] || 0;
                const target = habit.target_count || 1;
                const progress = Math.min(completed / target, 1);
                const streak = streaks[habit.id] || 0;
                
                return (
                  <View key={habit.id} className="mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-2xl mr-3">{habit.emoji}</Text>
                        <View className="flex-1">
                          <Text className="font-semibold" style={{ color: textColor }}>
                            {habit.name}
                          </Text>
                          <Text className="text-sm" style={{ color: subtextColor }}>
                            {completed}/{target} • {streak} day streak 🔥
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => logHabit(habit)}
                        disabled={completed >= target}
                        className={`w-12 h-12 rounded-full items-center justify-center ${
                          completed >= target ? 'opacity-50' : ''
                        }`}
                        style={{ 
                          backgroundColor: completed >= target ? '#A8E6CF' : '#FFD3B6' 
                        }}
                      >
                        <Ionicons 
                          name={completed >= target ? "checkmark" : "add"} 
                          size={20} 
                          color="white" 
                        />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Progress Bar */}
                    <View 
                      className="h-2 rounded-full mb-2"
                      style={{ backgroundColor: isDark ? '#333333' : '#E0E0E0' }}
                    >
                      <View
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: '#A8E6CF',
                          width: `${progress * 100}%`
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Quick Add Habits */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: textColor }}>
            Quick Add Popular Habits
          </Text>
          <View className="flex-row flex-wrap">
            {defaultHabits.map((habit, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => quickAddHabit(habit)}
                className="mr-3 mb-3 px-4 py-3 rounded-full flex-row items-center"
                style={{ backgroundColor: cardBackground }}
              >
                <Text className="text-lg mr-2">{habit.emoji}</Text>
                <Text className="font-medium" style={{ color: textColor }}>
                  {habit.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Streak Leaderboard */}
        {habits.length > 0 && (
          <View 
            className="rounded-2xl p-4"
            style={{ backgroundColor: cardBackground }}
          >
            <Text className="text-lg font-semibold mb-3" style={{ color: textColor }}>
              Your Best Streaks 🏆
            </Text>
            {habits
              .sort((a, b) => (streaks[b.id] || 0) - (streaks[a.id] || 0))
              .slice(0, 3)
              .map((habit, index) => (
                <View key={habit.id} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Text className="text-lg mr-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </Text>
                    <Text className="text-lg mr-2">{habit.emoji}</Text>
                    <Text className="font-medium" style={{ color: textColor }}>
                      {habit.name}
                    </Text>
                  </View>
                  <Text className="font-bold text-[#A8E6CF]">
                    {streaks[habit.id] || 0} days
                  </Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        isVisible={isAddModalVisible}
        onBackdropPress={() => setIsAddModalVisible(false)}
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View 
          className="rounded-t-3xl p-6"
          style={{ backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }}
        >
          <View className="items-center mb-4">
            <View 
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: isDark ? '#444444' : '#E0E0E0' }}
            />
          </View>
          
          <Text className="text-xl font-bold mb-6" style={{ color: textColor }}>
            Add New Habit
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Habit Name
            </Text>
            <TextInput
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="e.g., Read for 30 minutes"
              placeholderTextColor={subtextColor}
              className="border rounded-xl px-4 py-3"
              style={{ 
                borderColor: isDark ? '#333333' : '#E0E0E0',
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                color: textColor
              }}
            />
          </View>
          
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                Emoji
              </Text>
              <TextInput
                value={newHabitEmoji}
                onChangeText={setNewHabitEmoji}
                placeholder="✨"
                className="border rounded-xl px-4 py-3 text-center"
                style={{ 
                  borderColor: isDark ? '#333333' : '#E0E0E0',
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  color: textColor
                }}
              />
            </View>
            
            <View className="flex-1 ml-2">
              <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                Daily Target
              </Text>
              <TextInput
                value={newHabitTarget}
                onChangeText={setNewHabitTarget}
                placeholder="1"
                keyboardType="numeric"
                className="border rounded-xl px-4 py-3"
                style={{ 
                  borderColor: isDark ? '#333333' : '#E0E0E0',
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  color: textColor
                }}
              />
            </View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setIsAddModalVisible(false)}
              className="flex-1 mr-2 py-4 rounded-xl border"
              style={{ borderColor: '#E0E0E0' }}
            >
              <Text className="text-center font-semibold" style={{ color: subtextColor }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={addHabit}
              className="flex-1 ml-2 py-4 rounded-xl bg-[#A8E6CF]"
            >
              <Text className="text-white text-center font-semibold">
                Add Habit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}