import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit3, Save, Trash2, Zap } from 'lucide-react-native';
import { blink } from '@/lib/blink';
import { LinearGradient } from 'expo-linear-gradient';

interface Meal {
  id: string;
  image_url: string;
  calories: number;
  food_name: string;
  notes?: string;
  meal_type: string;
  created_at: string;
  confidence?: number;
}

export default function MealDetails() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedCalories, setEditedCalories] = useState('');
  const [editedFoodName, setEditedFoodName] = useState('');

  useEffect(() => {
    loadMeal();
  }, [mealId]);

  const loadMeal = async () => {
    try {
      const meals = await blink.db.meals.list({
        where: { id: mealId },
        limit: 1
      });

      if (meals && meals.length > 0) {
        const mealData = meals[0];
        setMeal(mealData);
        setEditedNotes(mealData.notes || '');
        setEditedCalories(mealData.calories.toString());
        setEditedFoodName(mealData.food_name);
      } else {
        Alert.alert('Error', 'Meal not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading meal:', error);
      Alert.alert('Error', 'Failed to load meal details');
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = async () => {
    if (!meal) return;

    try {
      const calories = parseInt(editedCalories) || 0;
      
      await blink.db.meals.update(meal.id, {
        notes: editedNotes,
        calories: calories,
        food_name: editedFoodName,
      });

      setMeal({
        ...meal,
        notes: editedNotes,
        calories: calories,
        food_name: editedFoodName,
      });

      setEditing(false);
      Alert.alert('Success', 'Meal updated successfully');
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const deleteMeal = async () => {
    if (!meal) return;

    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await blink.db.meals.delete(meal.id);
              router.back();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading meal details...</Text>
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Meal not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meal Details</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => editing ? saveMeal() : setEditing(true)}
          >
            {editing ? (
              <Save size={24} color="#FFFFFF" />
            ) : (
              <Edit3 size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Meal Image */}
        <Image source={{ uri: meal.image_url }} style={styles.image} />

        {/* Meal Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            {editing ? (
              <TextInput
                style={styles.titleInput}
                value={editedFoodName}
                onChangeText={setEditedFoodName}
                placeholder="Food name"
                multiline
              />
            ) : (
              <Text style={styles.title}>{meal.food_name}</Text>
            )}
            <View style={[styles.mealTypeBadge, { backgroundColor: getMealTypeColor(meal.meal_type) }]}>
              <Text style={styles.mealTypeText}>{meal.meal_type}</Text>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.date}>{formatDate(meal.created_at)}</Text>
            <Text style={styles.time}>{formatTime(meal.created_at)}</Text>
          </View>
        </View>

        {/* Calories */}
        <View style={styles.caloriesSection}>
          <View style={styles.caloriesHeader}>
            <Zap size={24} color="#22C55E" />
            <Text style={styles.caloriesLabel}>Calories</Text>
          </View>
          {editing ? (
            <TextInput
              style={styles.caloriesInput}
              value={editedCalories}
              onChangeText={setEditedCalories}
              placeholder="0"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.caloriesValue}>{meal.calories}</Text>
          )}
          {meal.confidence && (
            <Text style={styles.confidenceText}>
              AI Confidence: {Math.round(meal.confidence * 100)}%
            </Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes</Text>
          {editing ? (
            <TextInput
              style={styles.notesInput}
              value={editedNotes}
              onChangeText={setEditedNotes}
              placeholder="Add notes about your meal..."
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.notesText}>
              {meal.notes || 'No notes added'}
            </Text>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={deleteMeal}>
          <Trash2 size={20} color="#EF4444" />
          <Text style={styles.deleteText}>Delete Meal</Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#F1F5F9',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  mealTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 16,
    color: '#64748B',
  },
  time: {
    fontSize: 16,
    color: '#64748B',
  },
  caloriesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  caloriesLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  caloriesInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22C55E',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  notesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
  },
  notesLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  notesInput: {
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    marginBottom: 40,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
  },
});