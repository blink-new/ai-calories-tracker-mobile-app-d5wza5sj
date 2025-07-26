import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  backgroundColor: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor,
}: CircularProgressProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Glow */}
      <View style={[
        styles.backgroundGlow,
        {
          width: size + 20,
          height: size + 20,
          borderRadius: (size + 20) / 2,
        }
      ]} />
      
      {/* SVG Progress Ring */}
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
            <Stop offset="50%" stopColor="#16a34a" stopOpacity="1" />
            <Stop offset="100%" stopColor="#15803d" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="rgba(229, 231, 235, 0.8)" stopOpacity="1" />
            <Stop offset="100%" stopColor="rgba(229, 231, 235, 0.4)" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#backgroundGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* Inner Glow Effect */}
      <View style={[
        styles.innerGlow,
        {
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  svg: {
    position: 'absolute',
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
});