// Reusable gradient scrim for image overlays.
import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  colors: string[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export function Scrim({ colors, locations, start = { x: 0.5, y: 1 }, end = { x: 0.5, y: 0 } }: Props) {
  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={locations as [number, number, ...number[]] | undefined}
      start={start}
      end={end}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}
