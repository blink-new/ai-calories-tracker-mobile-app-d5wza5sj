import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Plus, Camera } from 'lucide-react-native';
import { blink } from '@/lib/blink';
import { CircularProgress } from '@/components/CircularProgress';
import { MealCard } from '@/components/MealCard';
import { LinearGradient } from 'expo-linear-gradient';

interface Meal {
  id: string;
  image_url: string;
  calories: number;
  food_name: string;
  notes?: string;
  meal_type: string;
  created_at: string;
}

interface UserGoal {
  daily_calorie_goal: number;
}

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [userGoal, setUserGoal] = useState<UserGoal>({ daily_calorie_goal: 2000 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadData();
      }
    });
    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      const userData = await blink.auth.me();
      if (!userData) return;

      // Load today's meals
      const today = new Date().toISOString().split('T')[0];
      const mealsData = await blink.db.meals.list({
        where: { 
          user_id: userData.id,
          created_at: { gte: `${today}T00:00:00.000Z` }
        },
        orderBy: { created_at: 'desc' },
        limit: 20
      });

      // Load user goals
      const goalsData = await blink.db.userGoals.list({
        where: { user_id: userData.id },
        limit: 1
      });

      setMeals(mealsData || []);
      if (goalsData && goalsData.length > 0) {
        setUserGoal(goalsData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const progress = Math.min(totalCalories / userGoal.daily_calorie_goal, 1);

  const openCamera = () => {
    router.push('/camera');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your meals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Calories Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your healthy habits</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Daily Progress */}
        <View style={styles.progressSection}>
          <CircularProgress
            progress={progress}
            size={160}
            strokeWidth={12}
            color="#22C55E"
            backgroundColor="#E2E8F0"
          />
          <View style={styles.progressInfo}>
            <Text style={styles.caloriesText}>{totalCalories}</Text>
            <Text style={styles.caloriesLabel}>of {userGoal.daily_calorie_goal} calories</Text>
            <Text style={styles.remainingText}>
              {userGoal.daily_calorie_goal - totalCalories > 0 
                ? `${userGoal.daily_calorie_goal - totalCalories} remaining`
                : 'Goal reached! 🎉'
              }
            </Text>
          </View>
        </View>

        {/* Today's Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Camera size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No meals logged today</Text>
              <Text style={styles.emptySubtext}>Tap the camera button to get started!</Text>
            </View>
          ) : (
            meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openCamera}>
        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          style={styles.fabGradient}
        >
          <Plus size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  progressInfo: {
    position: 'absolute',
    alignItems: 'center',
  },
  caloriesText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  remainingText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  mealsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
});