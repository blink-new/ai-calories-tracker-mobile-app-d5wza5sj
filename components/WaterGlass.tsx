import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

interface WaterGlassProps {
  filled: number;
  total: number;
  size?: number;
}

export function WaterGlass({ filled, total, size = 50 }: WaterGlassProps) {
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fillPercentage = Math.min(filled / total, 1);
    
    // Animate fill level
    Animated.timing(fillAnimation, {
      toValue: fillPercentage,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Animate wave effect
    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  }, [filled, total]);

  const glassHeight = size;
  const glassWidth = size * 0.7;

  return (
    <View 
      style={{
        width: glassWidth,
        height: glassHeight,
        position: 'relative',
      }}
    >
      {/* Glass container */}
      <View
        style={{
          width: glassWidth,
          height: glassHeight,
          borderWidth: 2,
          borderColor: '#A8E6CF',
          borderRadius: 8,
          borderTopWidth: 1,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}
      >
        {/* Water fill */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#A8E6CF',
            opacity: 0.7,
            height: fillAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, glassHeight - 4],
            }),
            borderRadius: 6,
          }}
        />
        
        {/* Wave effect */}
        {filled > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: fillAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, glassHeight - 14],
              }),
              left: -5,
              right: -5,
              height: 10,
              backgroundColor: '#A8E6CF',
              opacity: 0.5,
              borderRadius: 5,
              transform: [
                {
                  scaleX: waveAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1],
                  }),
                },
                {
                  translateY: waveAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -2, 0],
                  }),
                },
              ],
            }}
          />
        )}
      </View>
      
      {/* Bubbles effect */}
      {filled > 0 && (
        <>
          <Animated.View
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#A8E6CF',
              borderRadius: 2,
              left: glassWidth * 0.3,
              bottom: fillAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [5, glassHeight * 0.3],
              }),
              opacity: waveAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.8, 0.3],
              }),
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              width: 3,
              height: 3,
              backgroundColor: '#A8E6CF',
              borderRadius: 1.5,
              right: glassWidth * 0.3,
              bottom: fillAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [8, glassHeight * 0.5],
              }),
              opacity: waveAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 0.2],
              }),
            }}
          />
        </>
      )}
    </View>
  );
}