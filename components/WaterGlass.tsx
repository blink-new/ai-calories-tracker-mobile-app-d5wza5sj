import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WaterGlassProps {
  glasses: number;
  maxGlasses: number;
}

export function WaterGlass({ glasses, maxGlasses }: WaterGlassProps) {
  const fillPercentage = Math.min((glasses / maxGlasses) * 100, 100);
  
  return (
    <View style={styles.container}>
      {/* Glass Container */}
      <View style={styles.glassContainer}>
        {/* Glass Background */}
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={styles.glassBackground}
        >
          {/* Water Fill */}
          <View style={styles.waterContainer}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={[
                styles.waterFill,
                {
                  height: `${fillPercentage}%`,
                }
              ]}
            />
            
            {/* Water Surface Animation */}
            {fillPercentage > 0 && (
              <View style={[styles.waterSurface, { bottom: `${100 - fillPercentage}%` }]}>
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
                  style={styles.surfaceGradient}
                />
              </View>
            )}
          </View>
          
          {/* Glass Shine Effect */}
          <LinearGradient
            colors={['rgba(255,255,255,0.4)', 'transparent']}
            style={styles.glassShine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </LinearGradient>
        
        {/* Glass Border */}
        <View style={styles.glassBorder} />
      </View>
      
      {/* Water Drops Animation */}
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.waterDrop,
            {
              left: 20 + index * 15,
              top: 10 + index * 5,
              opacity: fillPercentage > 20 ? 0.6 : 0,
            }
          ]}
        >
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.dropGradient}
          />
        </View>
      ))}
      
      {/* Progress Indicators */}
      <View style={styles.progressIndicators}>
        {Array.from({ length: maxGlasses }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index < glasses ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)',
                transform: [{ scale: index < glasses ? 1 : 0.7 }],
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  glassContainer: {
    width: 80,
    height: 100,
    position: 'relative',
  },
  glassBackground: {
    flex: 1,
    borderRadius: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  waterContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  waterFill: {
    width: '100%',
    borderRadius: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  waterSurface: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
  },
  surfaceGradient: {
    flex: 1,
    borderRadius: 2,
  },
  glassShine: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 16,
    height: 32,
    borderRadius: 8,
  },
  glassBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  waterDrop: {
    position: 'absolute',
    width: 6,
    height: 8,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dropGradient: {
    flex: 1,
    borderRadius: 3,
  },
  progressIndicators: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});