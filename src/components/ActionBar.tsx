import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { mix } from '@/theme/tokens';
import { useI18n } from '@/i18n';

type BtnProps = { icon: IconName; label: string; active?: boolean; locked?: boolean; fill?: boolean; onPress: () => void };

export function ActionBar({ saved, isPaid = true, onRefresh, onSave, onNote, onShare }: {
  saved: boolean; isPaid?: boolean; onRefresh?: (() => void) | null; onSave: () => void; onNote: () => void; onShare: () => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const Btn = ({ icon, label, active, locked, fill, onPress }: BtnProps) => (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 10, opacity: pressed ? 0.55 : 1 })}>
      <View style={{ width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? mix(theme.gold, theme.card, 24) : theme.fill, borderWidth: 0.5, borderColor: theme.hair }}>
        <Icon name={icon} size={22} color={active ? theme.goldInk : theme.labelSecondary} fill={fill} />
        {locked && (
          <View style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 99, backgroundColor: theme.goldInk, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={10} color="#fff" />
          </View>
        )}
      </View>
      <Text style={{ fontSize: 11, fontWeight: '500', letterSpacing: 0.2, color: active ? theme.goldInk : theme.labelSecondary }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {onRefresh && <Btn icon="refresh" label={t('act.refresh')} locked={!isPaid} onPress={onRefresh} />}
      <Btn icon="bookmark" label={saved ? t('act.saved') : t('act.save')} active={saved} fill={saved} onPress={onSave} />
      <Btn icon="note" label={t('act.note')} onPress={onNote} />
      <Btn icon="share" label={t('act.share')} onPress={onShare} />
    </View>
  );
}
