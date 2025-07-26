import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MealCardProps {
  meal: {
    id: string;
    food_name: string;
    calories: number;
    notes?: string;
    image_url?: string;
    meal_type?: string;
    emoji?: string;
    created_at: string;
  };
  onPress: () => void;
  isDark?: boolean;
}

export function MealCard({ meal, onPress, isDark = false }: MealCardProps) {
  const cardBackground = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(168, 230, 207, 0.1)';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const subtextColor = isDark ? '#CCCCCC' : '#666666';
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return '#FFD3B6';
      case 'lunch': return '#A8E6CF';
      case 'dinner': return '#FFAAA5';
      case 'snack': return '#E6E6FA';
      default: return '#A8E6CF';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl p-4 mb-3"
      style={{ 
        backgroundColor: cardBackground,
        shadowColor: '#A8E6CF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row">
        {/* Meal Image or Emoji */}
        <View className="mr-4">
          {meal.image_url ? (
            <Image
              source={{ uri: meal.image_url }}
              className="w-16 h-16 rounded-xl"
              style={{ backgroundColor: '#F0F0F0' }}
            />
          ) : (
            <View 
              className="w-16 h-16 rounded-xl items-center justify-center"
              style={{ backgroundColor: getMealTypeColor(meal.meal_type || 'snack') }}
            >
              <Text className="text-2xl">{meal.emoji || '🍽️'}</Text>
            </View>
          )}
        </View>

        {/* Meal Details */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold" style={{ color: textColor }}>
              {meal.food_name}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="flame" size={16} color="#FF6B6B" />
              <Text className="text-sm font-bold ml-1" style={{ color: textColor }}>
                {meal.calories} cal
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View 
                className="px-2 py-1 rounded-full mr-2"
                style={{ backgroundColor: getMealTypeColor(meal.meal_type || 'snack') }}
              >
                <Text className="text-xs font-medium text-white capitalize">
                  {meal.meal_type || 'Snack'}
                </Text>
              </View>
              <Text className="text-sm" style={{ color: subtextColor }}>
                {formatTime(meal.created_at)}
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </View>
          
          {meal.notes && (
            <Text 
              className="text-sm mt-2 opacity-80" 
              style={{ color: subtextColor }}
              numberOfLines={1}
            >
              {meal.notes}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}