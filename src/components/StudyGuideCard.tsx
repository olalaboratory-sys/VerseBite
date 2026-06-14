// Collapsed Study Guide entry card. Locked for free users.
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from './Icon';
import { PlusChip } from './ui';
import { useTheme } from '@/theme/ThemeProvider';
import { GOLD_DEEP } from '@/theme/tokens';
import { useI18n } from '@/i18n';

export function StudyGuideCard({ isPaid, onOpen, onUpgrade }: { isPaid: boolean; onOpen: () => void; onUpgrade: () => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <View style={[{ backgroundColor: theme.card, borderRadius: 18, borderWidth: 0.5, borderColor: theme.hair, overflow: 'hidden' }, theme.shadowSm]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12 }}>
        <LinearGradient colors={[theme.gold, GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="quote" size={20} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', letterSpacing: -0.2, color: theme.labelPrimary }}>{t('sg.title')}</Text>
            {!isPaid && <PlusChip />}
          </View>
          <Text style={{ fontSize: 12.5, lineHeight: 17, color: theme.labelSecondary, marginTop: 4 }}>{isPaid ? t('sg.subPlus') : t('sg.subFree')}</Text>
        </View>
      </View>
      <Pressable onPress={isPaid ? onOpen : onUpgrade} style={{ height: 48, borderTopWidth: 0.5, borderTopColor: theme.hair, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: isPaid ? theme.goldInk : theme.fill }}>
        <Icon name={isPaid ? 'quote' : 'sparkle'} size={17} color={isPaid ? '#fff' : theme.goldInk} />
        <Text style={{ fontSize: 15, fontWeight: '600', color: isPaid ? '#fff' : theme.goldInk }}>{isPaid ? t('sg.ctaPlus') : t('sg.ctaFree')}</Text>
      </Pressable>
    </View>
  );
}
