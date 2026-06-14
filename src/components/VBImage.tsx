// Image with category-gradient fallback + warm wash + smooth fade-in.
import React, { useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { vbCategory } from '@/data/content';

type Props = {
  cat: string;
  src?: string;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  scrim?: React.ReactNode;
  children?: React.ReactNode;
};

export function VBImage({ cat, src, style, radius, scrim, children }: Props) {
  const c = vbCategory(cat) || ({ grad: ['#C9A45C', '#8A6A3E'] } as { grad: [string, string] });
  const [failed, setFailed] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const r = radius != null ? { borderRadius: radius } : null;
  return (
    <View style={[styles.wrap, r, style]}>
      <LinearGradient colors={c.grad} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      {!failed && src ? (
        <Animated.Image
          source={{ uri: src }}
          onLoad={() => Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }).start()}
          onError={() => setFailed(true)}
          style={[StyleSheet.absoluteFill, { opacity }]}
          resizeMode="cover"
        />
      ) : null}
      {/* subtle warm wash unifies stock photos with the brand */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(120,86,40,0.06)' }]} pointerEvents="none" />
      {scrim}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
});
