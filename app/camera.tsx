import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { blink } from '../lib/blink';
import Modal from 'react-native-modal';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [user, setUser] = useState(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const cameraRef = useRef(null);
  const processingAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Animate scanning line
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      
      // Start processing animation
      Animated.timing(processingAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      setCapturedImage(photo);
      
      // Simulate AI processing
      setTimeout(() => {
        processImage(photo);
      }, 2000);
      
    } catch (error) {
      console.error('Error taking picture:', error);
      setIsProcessing(false);
      showCameraFallback();
    }
  };

  const processImage = async (photo) => {
    try {
      // Upload image to storage
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      
      const { publicUrl } = await blink.storage.upload(
        blob,
        `meals/meal_${Date.now()}.jpg`,
        { upsert: true }
      );

      // Simulate AI food recognition (in real app, use Replicate API)
      const mockFoodData = {
        food_name: 'Grilled Chicken Salad',
        calories: 350,
        confidence: 0.92,
        ingredients: ['chicken breast', 'mixed greens', 'tomatoes', 'cucumber'],
      };

      // Save to database
      await blink.db.meals.create({
        id: `meal_${Date.now()}`,
        user_id: user?.id,
        food_name: mockFoodData.food_name,
        calories: mockFoodData.calories,
        notes: `AI detected with ${Math.round(mockFoodData.confidence * 100)}% confidence`,
        image_url: publicUrl,
        meal_type: getCurrentMealType(),
        emoji: '🥗',
        created_at: new Date().toISOString()
      });

      setIsProcessing(false);
      processingAnim.setValue(0);
      
      Alert.alert(
        'Meal Logged! 🎉',
        `${mockFoodData.food_name} - ${mockFoodData.calories} calories`,
        [
          { text: 'View Details', onPress: () => router.push('/meal-details') },
          { text: 'Add Another', onPress: () => setCapturedImage(null) },
          { text: 'Done', onPress: () => router.back() }
        ]
      );
      
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
      showCameraFallback();
    }
  };

  const getCurrentMealType = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const showCameraFallback = () => {
    setShowFallbackModal(true);
  };

  const handleFallbackOption = (option) => {
    setShowFallbackModal(false);
    
    switch (option) {
      case 'voice':
        router.push('/(tabs)/log');
        break;
      case 'manual':
        router.push('/(tabs)/log');
        break;
      case 'search':
        router.push('/(tabs)/log');
        break;
      case 'retry':
        // Reset camera state
        setCapturedImage(null);
        setIsProcessing(false);
        break;
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-white text-lg text-center mb-4">
            Loading camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="camera-outline" size={80} color="white" />
          <Text className="text-white text-xl font-bold text-center mb-4">
            Camera Access Needed
          </Text>
          <Text className="text-white text-center mb-8 opacity-80">
            We need camera permission to scan your meals and estimate calories using AI.
          </Text>
          
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-[#A8E6CF] px-8 py-4 rounded-full mb-4"
          >
            <Text className="text-white font-semibold text-lg">
              Grant Permission
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={showCameraFallback}
            className="px-6 py-3"
          >
            <Text className="text-white opacity-80">
              Use manual entry instead
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-6 w-10 h-10 rounded-full bg-black bg-opacity-50 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <CameraView 
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        onCameraReady={() => console.log('Camera ready')}
        onMountError={(error) => {
          console.error('Camera mount error:', error);
          showCameraFallback();
        }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center p-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black bg-opacity-50 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="bg-black bg-opacity-50 px-4 py-2 rounded-full">
            <Text className="text-white font-medium">
              AI Food Scanner
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={toggleCameraFacing}
            className="w-10 h-10 rounded-full bg-black bg-opacity-50 items-center justify-center"
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Scanning Overlay */}
        <View className="flex-1 justify-center items-center">
          <View 
            className="border-2 border-white rounded-3xl"
            style={{ 
              width: width * 0.8, 
              height: width * 0.8,
              position: 'relative'
            }}
          >
            {/* Corner indicators */}
            <View className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-[#A8E6CF] rounded-tl-2xl" />
            <View className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-[#A8E6CF] rounded-tr-2xl" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-[#A8E6CF] rounded-bl-2xl" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-[#A8E6CF] rounded-br-2xl" />
            
            {/* Scanning line */}
            <Animated.View
              className="absolute left-0 right-0 h-0.5 bg-[#A8E6CF]"
              style={{
                top: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, width * 0.8 - 20],
                }),
                opacity: scanLineAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              }}
            />
          </View>
          
          <Text className="text-white text-center mt-6 px-8">
            Position your meal within the frame
          </Text>
          <Text className="text-white text-center opacity-80 mt-2">
            AI will automatically detect and estimate calories
          </Text>
        </View>

        {/* Bottom Controls */}
        <View className="p-6">
          <View className="flex-row justify-center items-center">
            <TouchableOpacity
              onPress={showCameraFallback}
              className="w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center mr-8"
            >
              <Ionicons name="text" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={takePicture}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${
                isProcessing ? 'bg-[#FFD3B6]' : 'bg-[#A8E6CF]'
              }`}
            >
              {isProcessing ? (
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: processingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons name="sync" size={32} color="white" />
                </Animated.View>
              ) : (
                <Ionicons name="camera" size={32} color="white" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/log')}
              className="w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center ml-8"
            >
              <Ionicons name="mic" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-white text-center mt-4 opacity-80">
            {isProcessing ? 'Processing with AI...' : 'Tap to capture'}
          </Text>
        </View>
      </CameraView>

      {/* Camera Fallback Modal */}
      <Modal
        isVisible={showFallbackModal}
        onBackdropPress={() => setShowFallbackModal(false)}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <View 
          className="bg-white rounded-3xl p-6 mx-6"
          style={{ backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }}
        >
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-[#FFAAA5] items-center justify-center mb-4">
              <Ionicons name="camera-off" size={32} color="white" />
            </View>
            <Text className="text-xl font-bold mb-2" style={{ color: isDark ? '#FFFFFF' : '#333333' }}>
              Camera not available
            </Text>
            <Text className="text-center" style={{ color: isDark ? '#CCCCCC' : '#666666' }}>
              Don't worry! You can still log your meals using these options:
            </Text>
          </View>
          
          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => handleFallbackOption('voice')}
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: '#FFD3B6' }}
            >
              <Ionicons name="mic" size={24} color="white" />
              <View className="ml-4">
                <Text className="text-white font-semibold">Voice Input</Text>
                <Text className="text-white opacity-80 text-sm">Say your meal aloud</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleFallbackOption('search')}
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: '#A8E6CF' }}
            >
              <Ionicons name="search" size={24} color="white" />
              <View className="ml-4">
                <Text className="text-white font-semibold">Search Food</Text>
                <Text className="text-white opacity-80 text-sm">Browse food database</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleFallbackOption('manual')}
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: '#FFAAA5' }}
            >
              <Ionicons name="create" size={24} color="white" />
              <View className="ml-4">
                <Text className="text-white font-semibold">Manual Entry</Text>
                <Text className="text-white opacity-80 text-sm">Type meal details</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row mt-6">
            <TouchableOpacity
              onPress={() => handleFallbackOption('retry')}
              className="flex-1 mr-2 py-3 rounded-xl border"
              style={{ borderColor: '#E0E0E0' }}
            >
              <Text className="text-center font-medium" style={{ color: isDark ? '#CCCCCC' : '#666666' }}>
                Try Camera Again
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowFallbackModal(false)}
              className="flex-1 ml-2 py-3 rounded-xl"
              style={{ backgroundColor: '#A8E6CF' }}
            >
              <Text className="text-white text-center font-medium">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}