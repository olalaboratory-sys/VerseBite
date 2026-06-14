import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { mix } from '@/theme/tokens';
import { useI18n } from '@/i18n';

export function DailyResonance({ value, onPick, streak = 0 }: { value?: string; onPick: (id: string) => void; streak?: number }) {
  const theme = useTheme();
  const { t } = useI18n();
  const feelings: { id: string; icon: IconName; label: string }[] = [
    { id: 'comfort', icon: 'heart', label: t('pulse.comfort') },
    { id: 'courage', icon: 'sun', label: t('pulse.courage') },
    { id: 'gratitude', icon: 'sparkle', label: t('pulse.gratitude') },
    { id: 'peace', icon: 'moon', label: t('pulse.peace') },
    { id: 'challenge', icon: 'check', label: t('pulse.challenge') },
  ];
  const picked = !!value;
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 15, paddingBottom: 14, backgroundColor: theme.fill, borderRadius: 18, borderWidth: 0.5, borderColor: theme.hair }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 }}>
        <Icon name={picked ? 'check' : 'sparkle'} size={18} color={theme.goldInk} />
        <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '500', lineHeight: 20, color: theme.labelSecondary }}>{picked ? t('pulse.done') : t('pulse.q')}</Text>
        {streak > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: mix(theme.gold, theme.card, 18) }}>
            <Icon name="sun" size={13} color={theme.goldInk} />
            <Text style={{ color: theme.goldInk, fontSize: 12, fontWeight: '600' }}>{streak} {streak === 1 ? t('pulse.streak1') : t('pulse.streakN')}</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {feelings.map((f) => {
          const on = value === f.id;
          return (
            <Pressable key={f.id} onPress={() => onPick(f.id)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5, height: 60, borderRadius: 14, backgroundColor: on ? theme.goldInk : theme.card, borderWidth: on ? 1.5 : 1, borderColor: on ? theme.goldInk : theme.hair }}>
              <Icon name={f.icon} size={19} color={on ? '#fff' : theme.labelSecondary} strokeWidth={on ? 2 : 1.7} />
              <Text style={{ fontSize: 11.5, fontWeight: on ? '600' : '500', letterSpacing: -0.2, color: on ? '#fff' : theme.labelSecondary }}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
