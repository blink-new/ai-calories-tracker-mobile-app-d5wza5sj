import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Calendar, TrendingUp, Target, Zap } from 'lucide-react-native';
import { blink } from '@/lib/blink';

const screenWidth = Dimensions.get('window').width;

interface DailyData {
  date: string;
  calories: number;
  meals: number;
}

export default function Progress() {
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGoal, setUserGoal] = useState(2000);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const user = await blink.auth.me();
      if (!user) return;

      // Load user goals
      const goalsData = await blink.db.userGoals.list({
        where: { user_id: user.id },
        limit: 1
      });

      if (goalsData && goalsData.length > 0) {
        setUserGoal(goalsData[0].daily_calorie_goal);
      }

      // Load meals from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const meals = await blink.db.meals.list({
        where: { 
          user_id: user.id,
          created_at: { gte: thirtyDaysAgo.toISOString() }
        },
        orderBy: { created_at: 'desc' }
      });

      // Process data by day
      const dailyStats = new Map<string, { calories: number; meals: number }>();
      
      meals?.forEach(meal => {
        const date = new Date(meal.created_at).toISOString().split('T')[0];
        const existing = dailyStats.get(date) || { calories: 0, meals: 0 };
        dailyStats.set(date, {
          calories: existing.calories + meal.calories,
          meals: existing.meals + 1
        });
      });

      // Generate last 7 days data
      const weekly: DailyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const stats = dailyStats.get(dateStr) || { calories: 0, meals: 0 };
        
        weekly.push({
          date: dateStr,
          calories: stats.calories,
          meals: stats.meals
        });
      }

      // Generate last 30 days data (weekly averages)
      const monthly: DailyData[] = [];
      for (let i = 3; i >= 0; i--) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (i * 7));
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        let totalCalories = 0;
        let totalMeals = 0;
        let daysWithData = 0;

        for (let j = 0; j < 7; j++) {
          const checkDate = new Date(startDate);
          checkDate.setDate(checkDate.getDate() + j);
          const dateStr = checkDate.toISOString().split('T')[0];
          const stats = dailyStats.get(dateStr);
          
          if (stats && stats.meals > 0) {
            totalCalories += stats.calories;
            totalMeals += stats.meals;
            daysWithData++;
          }
        }

        monthly.push({
          date: `Week ${4 - i}`,
          calories: daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0,
          meals: daysWithData > 0 ? Math.round(totalMeals / daysWithData) : 0
        });
      }

      setWeeklyData(weekly);
      setMonthlyData(monthly);

      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const stats = dailyStats.get(dateStr);
        
        if (stats && stats.meals > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#22C55E',
    },
  };

  const weeklyCaloriesData = {
    labels: weeklyData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        data: weeklyData.map(d => d.calories),
      },
    ],
  };

  const monthlyCaloriesData = {
    labels: monthlyData.map(d => d.date),
    datasets: [
      {
        data: monthlyData.map(d => d.calories),
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  const todayCalories = weeklyData[weeklyData.length - 1]?.calories || 0;
  const weekAverage = weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Track your healthy journey</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Zap size={24} color="#22C55E" />
            <Text style={styles.statValue}>{todayCalories}</Text>
            <Text style={styles.statLabel}>Today's Calories</Text>
          </View>

          <View style={styles.statCard}>
            <Target size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{userGoal}</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{Math.round(weekAverage)}</Text>
            <Text style={styles.statLabel}>Week Average</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={24} color="#EF4444" />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>This Week</Text>
          {weeklyData.length > 0 && (
            <LineChart
              data={weeklyCaloriesData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        {/* Monthly Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Monthly Trend</Text>
          {monthlyData.length > 0 && (
            <BarChart
              data={monthlyCaloriesData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=" cal"
            />
          )}
        </View>

        {/* Goal Progress */}
        <View style={styles.goalSection}>
          <Text style={styles.goalTitle}>Daily Goal Progress</Text>
          <View style={styles.goalProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((todayCalories / userGoal) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.goalText}>
              {Math.round((todayCalories / userGoal) * 100)}% of daily goal
            </Text>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>Insights</Text>
          
          {streak > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                🔥 Amazing! You're on a {streak}-day logging streak!
              </Text>
            </View>
          )}

          {todayCalories > userGoal && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                🎯 You've exceeded your daily goal today. Great job!
              </Text>
            </View>
          )}

          {weekAverage < userGoal * 0.8 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                💡 Your weekly average is below your goal. Consider adding more nutritious meals!
              </Text>
            </View>
          )}

          {weeklyData.filter(d => d.meals > 0).length === 7 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                ⭐ Perfect week! You logged meals every day this week.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  goalSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  goalProgress: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  goalText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  insightsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
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