import React from 'react';
import { Text, View } from 'react-native';
import { vbCategory } from '@/data/content';
import { useTheme } from '@/theme/ThemeProvider';
import { mix } from '@/theme/tokens';
import { useI18n } from '@/i18n';

export function CatChip({ cat, onImage = false, size = 'md' }: { cat: string; onImage?: boolean; size?: 'sm' | 'md' }) {
  const c = vbCategory(cat);
  const theme = useTheme();
  const { catName } = useI18n();
  if (!c) return null;
  const padV = size === 'sm' ? 5 : 7;
  const padH = size === 'sm' ? 11 : 14;
  const fs = size === 'sm' ? 12 : 13;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: padV,
        paddingHorizontal: padH,
        borderRadius: 999,
        alignSelf: 'flex-start',
        backgroundColor: onImage ? 'rgba(255,255,255,0.18)' : mix(c.tint, theme.card, 20),
        borderWidth: 0.5,
        borderColor: onImage ? 'rgba(255,255,255,0.35)' : mix(c.tint, 'rgba(0,0,0,0)', 35),
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: onImage ? '#fff' : c.tint, opacity: onImage ? 0.9 : 1 }} />
      <Text style={{ fontSize: fs, fontWeight: '600', letterSpacing: 0.2, color: onImage ? '#fff' : mix(c.tint, '#2A211A', 65) }}>{catName(c)}</Text>
    </View>
  );
}
