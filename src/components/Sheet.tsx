// Generic bottom sheet — dim backdrop + slide-up panel.
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

export function VBSheet({ children, onClose, maxH = 0.88 }: { children: React.ReactNode; onClose: () => void; maxH?: number }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const screenH = Dimensions.get('window').height;

  useEffect(() => {
    Animated.timing(slide, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });
  const opacity = slide;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(28,22,17,0.42)', opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          maxHeight: screenH * maxH,
          backgroundColor: theme.bg,
          borderTopLeftRadius: 26, borderTopRightRadius: 26,
          paddingBottom: Math.max(insets.bottom, 16),
          transform: [{ translateY }],
          shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 40, shadowOffset: { width: 0, height: -10 }, elevation: 24,
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: 10 }}>
          <View style={{ width: 40, height: 5, borderRadius: 99, backgroundColor: theme.hair }} />
        </View>
        {children}
      </Animated.View>
    </View>
  );
}
