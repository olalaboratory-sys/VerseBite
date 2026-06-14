// Image with category-gradient fallback + warm wash + fade-in (never looks broken).
import React, { useState } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
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
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const r = radius != null ? { borderRadius: radius } : null;
  return (
    <View style={[styles.wrap, r, style]}>
      <LinearGradient colors={c.grad} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      {!failed && src ? (
        <Image
          source={{ uri: src }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={[StyleSheet.absoluteFill, { opacity: loaded ? 1 : 0 }]}
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
