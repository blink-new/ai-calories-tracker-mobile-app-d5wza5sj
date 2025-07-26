import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { blink } from '../../lib/blink';
import { CircularProgress } from '../../components/CircularProgress';
import { MealCard } from '../../components/MealCard';
import { WaterGlass } from '../../components/WaterGlass';

const { width, height } = Dimensions.get('window');

interface Meal {
  id: string;
  foodName: string;
  calories: number;
  mealType: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [dailyGoal] = useState(2000);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      loadTodaysMeals();
      loadWaterIntake();
    }
  }, [user]);

  const loadTodaysMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todaysMeals = await blink.db.meals.list({
        where: {
          userId: user!.id,
          createdAt: { gte: today }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      setMeals(todaysMeals);
      const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
      setDailyCalories(totalCalories);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const loadWaterIntake = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const waterEntries = await blink.db.water_intake.list({
        where: {
          userId: user!.id,
          date: today
        }
      });
      
      const totalGlasses = waterEntries.reduce((sum, entry) => sum + entry.glasses, 0);
      setWaterGlasses(totalGlasses);
    } catch (error) {
      console.error('Error loading water intake:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#f0fdf4', '#dcfce7', '#bbf7d0']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon}>
            <Ionicons name="nutrition" size={48} color="#22c55e" />
          </View>
          <Text style={styles.loadingText}>AI Calories Tracker</Text>
          <Text style={styles.loadingSubtext}>Loading your healthy journey...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient
        colors={['#f0fdf4', '#dcfce7', '#bbf7d0']}
        style={styles.authContainer}
      >
        <View style={styles.authContent}>
          <View style={styles.authIcon}>
            <Ionicons name="nutrition" size={64} color="#22c55e" />
          </View>
          <Text style={styles.authTitle}>Welcome to AI Calories Tracker</Text>
          <Text style={styles.authSubtitle}>Track your healthy habits with AI-powered insights</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => blink.auth.login()}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={styles.signInGradient}
            >
              <Text style={styles.signInText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const progress = Math.min((dailyCalories / dailyGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#f0fdf4', '#dcfce7', '#bbf7d0']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning! 🌅</Text>
            <Text style={styles.userName}>{user.displayName || user.email}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.profileGradient}
            >
              <Ionicons name="person" size={24} color="#22c55e" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Daily Progress Card */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={styles.cardGradient}
          >
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressDate}>{new Date().toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.progressContent}>
              <View style={styles.circularProgressContainer}>
                <CircularProgress
                  size={120}
                  strokeWidth={8}
                  progress={progress}
                  color="#22c55e"
                  backgroundColor="#e5e7eb"
                />
                <View style={styles.progressCenter}>
                  <Text style={styles.caloriesNumber}>{dailyCalories}</Text>
                  <Text style={styles.caloriesLabel}>calories</Text>
                </View>
              </View>
              
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dailyGoal - dailyCalories}</Text>
                  <Text style={styles.statLabel}>remaining</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{meals.length}</Text>
                  <Text style={styles.statLabel}>meals logged</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/camera')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.actionGradient}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="camera" size={28} color="#22c55e" />
                </View>
                <Text style={styles.actionText}>Scan Food</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/log')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.actionGradient}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="mic" size={28} color="#f59e0b" />
                </View>
                <Text style={styles.actionText}>Voice Log</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/log')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.actionGradient}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="add" size={28} color="#8b5cf6" />
                </View>
                <Text style={styles.actionText}>Manual Entry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Water Intake */}
        <View style={styles.waterSection}>
          <View style={styles.waterCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              style={styles.cardGradient}
            >
              <View style={styles.waterHeader}>
                <Text style={styles.waterTitle}>Hydration</Text>
                <Text style={styles.waterGoal}>{waterGlasses}/8 glasses</Text>
              </View>
              
              <View style={styles.waterContent}>
                <WaterGlass glasses={waterGlasses} maxGlasses={8} />
                <TouchableOpacity 
                  style={styles.addWaterButton}
                  onPress={async () => {
                    try {
                      const today = new Date().toISOString().split('T')[0];
                      await blink.db.water_intake.create({
                        userId: user.id,
                        date: today,
                        glasses: 1
                      });
                      setWaterGlasses(prev => prev + 1);
                    } catch (error) {
                      console.error('Error adding water:', error);
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.addWaterGradient}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/log')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {meals.length > 0 ? (
            <View style={styles.mealsList}>
              {meals.slice(0, 3).map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyMeals}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.emptyCard}
              >
                <View style={styles.emptyIcon}>
                  <Ionicons name="restaurant" size={48} color="#9ca3af" />
                </View>
                <Text style={styles.emptyTitle}>No meals logged yet</Text>
                <Text style={styles.emptySubtitle}>Start by scanning your first meal!</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/camera')}
      >
        <LinearGradient
          colors={['#22c55e', '#16a34a']}
          style={styles.fabGradient}
        >
          <Ionicons name="camera" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  authIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  signInButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signInGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGradient: {
    padding: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContent: {
    alignItems: 'center',
  },
  circularProgressContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  waterSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  waterCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  waterGoal: {
    fontSize: 14,
    color: '#6b7280',
  },
  waterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addWaterButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addWaterGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealsSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  mealsList: {
    gap: 12,
  },
  emptyMeals: {
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});