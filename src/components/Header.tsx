import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { serifFamily } from '@/theme/tokens';

export function VBHeader({ kicker, title, subtitle, right }: { kicker?: string; title: string; subtitle?: string; right?: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          {kicker ? <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: theme.goldInk, marginBottom: 8 }}>{kicker}</Text> : null}
          <Text style={{ fontFamily: serifFamily(600), fontSize: 34, lineHeight: 36, letterSpacing: 0.2, color: theme.labelPrimary }}>{title}</Text>
          {subtitle ? <Text style={{ marginTop: 7, fontSize: 15, lineHeight: 21, color: theme.labelSecondary }}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={{ paddingTop: 2 }}>{right}</View> : null}
      </View>
    </View>
  );
}
