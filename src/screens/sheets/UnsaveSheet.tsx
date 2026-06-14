import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { VBSheet } from '@/components/Sheet';
import { Icon } from '@/components/Icon';

export function UnsaveSheet({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <VBSheet onClose={onCancel} maxH={0.5}>
      <View style={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 8, alignItems: 'center' }}>
        <View style={{ width: 52, height: 52, borderRadius: 16, marginBottom: 14, backgroundColor: theme.fill, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="trash" size={24} color={theme.goldInk} />
        </View>
        <Text style={{ fontFamily: serifFamily(600), fontSize: 21, color: theme.labelPrimary }}>{t('nudge.unsaveTitle')}</Text>
        <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 14.5, lineHeight: 22, color: theme.labelSecondary }}>{t('nudge.unsaveBody')}</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 8 }}>
        <Pressable onPress={onConfirm} style={{ height: 50, borderRadius: 14, backgroundColor: theme.sysRed, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{t('nudge.remove')}</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={[{ height: 50, borderRadius: 14, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' }, theme.shadowSm]}>
          <Text style={{ color: theme.goldInk, fontSize: 16, fontWeight: '600' }}>{t('nudge.keep')}</Text>
        </Pressable>
      </View>
    </VBSheet>
  );
}
