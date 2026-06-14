import React from 'react';
import { Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import type { Toast } from '@/store/AppStore';

export function VBToast({ toast }: { toast: Toast }) {
  const theme = useTheme();
  const { t } = useI18n();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 104, alignItems: 'center', zIndex: 90 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999, backgroundColor: 'rgba(37,34,31,0.94)', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
        {toast.icon ? <Icon name={toast.icon as IconName} size={17} color={theme.gold} /> : null}
        <Text style={{ color: '#F8F2E8', fontSize: 14, fontWeight: '500' }}>{t(toast.text)}</Text>
      </View>
    </View>
  );
}
