import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Meal {
  id: string;
  foodName: string;
  calories: number;
  mealType: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
}

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

const getMealTypeIcon = (mealType: string) => {
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return 'sunny';
    case 'lunch':
      return 'partly-sunny';
    case 'dinner':
      return 'moon';
    case 'snack':
      return 'cafe';
    default:
      return 'restaurant';
  }
};

const getMealTypeColor = (mealType: string) => {
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return '#f59e0b';
    case 'lunch':
      return '#22c55e';
    case 'dinner':
      return '#8b5cf6';
    case 'snack':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function MealCard({ meal, onPress }: MealCardProps) {
  const mealTypeColor = getMealTypeColor(meal.mealType);
  const mealTypeIcon = getMealTypeIcon(meal.mealType);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
        style={styles.gradient}
      >
        {/* Meal Image or Placeholder */}
        <View style={styles.imageContainer}>
          {meal.imageUrl ? (
            <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: `${mealTypeColor}20` }]}>
              <Ionicons name="restaurant" size={32} color={mealTypeColor} />
            </View>
          )}
          
          {/* Meal Type Badge */}
          <View style={[styles.mealTypeBadge, { backgroundColor: mealTypeColor }]}>
            <Ionicons name={mealTypeIcon as any} size={12} color="white" />
          </View>
        </View>

        {/* Meal Info */}
        <View style={styles.mealInfo}>
          <View style={styles.mealHeader}>
            <Text style={styles.foodName} numberOfLines={1}>
              {meal.foodName}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(meal.createdAt)}
            </Text>
          </View>
          
          <View style={styles.mealDetails}>
            <View style={styles.mealTypeContainer}>
              <Text style={[styles.mealTypeText, { color: mealTypeColor }]}>
                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
              </Text>
            </View>
            
            <View style={styles.caloriesContainer}>
              <Text style={styles.caloriesNumber}>{meal.calories}</Text>
              <Text style={styles.caloriesLabel}>cal</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: `${mealTypeColor}15` }]}>
            <Ionicons name="chevron-forward" size={16} color={mealTypeColor} />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mealInfo: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTypeContainer: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  caloriesNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 2,
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});