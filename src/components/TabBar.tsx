import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export type TabId = 'today' | 'calendar' | 'badges' | 'saved' | 'profile';

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const tabs: { id: TabId; label: string; icon: IconName }[] = [
    { id: 'today', label: t('tab.today'), icon: 'today' },
    { id: 'calendar', label: t('tab.calendar'), icon: 'calendar' },
    { id: 'badges', label: t('tab.badges'), icon: 'award' },
    { id: 'saved', label: t('tab.saved'), icon: 'bookmark' },
    { id: 'profile', label: t('tab.profile'), icon: 'person' },
  ];
  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 10), backgroundColor: theme.card, borderTopWidth: 0.5, borderTopColor: theme.hair }}>
      <View style={{ height: 50, flexDirection: 'row' }}>
        {tabs.map((tab) => {
          const on = tab.id === active;
          return (
            <Pressable key={tab.id} onPress={() => onChange(tab.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={tab.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3.5 }}>
              <Icon name={tab.icon} size={25} color={on ? theme.goldInk : theme.labelTertiary} fill={on && tab.id === 'saved'} strokeWidth={on ? 1.9 : 1.7} />
              <Text style={{ fontSize: 10, fontWeight: on ? '600' : '500', letterSpacing: 0.1, color: on ? theme.goldInk : theme.labelTertiary }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
