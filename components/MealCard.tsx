import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Clock, Zap } from 'lucide-react-native';

interface Meal {
  id: string;
  image_url: string;
  calories: number;
  food_name: string;
  notes?: string;
  meal_type: string;
  created_at: string;
}

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMealTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return '#F59E0B';
      case 'lunch':
        return '#EF4444';
      case 'dinner':
        return '#8B5CF6';
      case 'snack':
        return '#06B6D4';
      default:
        return '#64748B';
    }
  };

  const openMealDetails = () => {
    router.push({
      pathname: '/meal-details',
      params: { mealId: meal.id }
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={openMealDetails}>
      <Image source={{ uri: meal.image_url }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.foodName}>{meal.food_name}</Text>
          <View style={[styles.mealTypeBadge, { backgroundColor: getMealTypeColor(meal.meal_type) }]}>
            <Text style={styles.mealTypeText}>{meal.meal_type}</Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.calorieInfo}>
            <Zap size={16} color="#22C55E" />
            <Text style={styles.calories}>{meal.calories} cal</Text>
          </View>
          
          <View style={styles.timeInfo}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.time}>{formatTime(meal.created_at)}</Text>
          </View>
        </View>
        
        {meal.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {meal.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  mealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  notes: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});