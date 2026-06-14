import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import type { Toast } from '@/store/AppStore';

export function VBToast({ toast }: { toast: Toast }) {
  const theme = useTheme();
  const { t } = useI18n();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }).start();
    }
  }, [toast, anim]);

  if (!toast) return null;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 104, alignItems: 'center', zIndex: 90 }}>
      <Animated.View style={{ opacity: anim, transform: [{ translateY }], flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999, backgroundColor: 'rgba(37,34,31,0.94)', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
        {toast.icon ? <Icon name={toast.icon as IconName} size={17} color={theme.gold} /> : null}
        <Text style={{ color: '#F8F2E8', fontSize: 14, fontWeight: '500' }}>{t(toast.text)}</Text>
      </Animated.View>
    </View>
  );
}
