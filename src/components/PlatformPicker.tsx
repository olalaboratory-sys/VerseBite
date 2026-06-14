// Cross-platform date/time picker.
// Android: native dialog via the imperative API. iOS: spinner inside a bottom sheet.
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { VBSheet } from './Sheet';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export function PlatformPicker({ visible, mode, value, onConfirm, onCancel }: {
  visible: boolean;
  mode: 'date' | 'time';
  value: Date;
  onConfirm: (d: Date) => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const [temp, setTemp] = useState(value);

  useEffect(() => {
    if (visible) setTemp(value);
    if (visible && Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        is24Hour: false,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onConfirm(date);
          else onCancel();
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (Platform.OS === 'android') return null;
  if (!visible) return null;

  return (
    <VBSheet onClose={onCancel} maxH={0.5}>
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <DateTimePicker value={temp} mode={mode} display="spinner" onChange={(_, d) => d && setTemp(d)} textColor={theme.labelPrimary} />
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <Pressable onPress={() => onConfirm(temp)} style={{ height: 50, borderRadius: 14, backgroundColor: theme.goldInk, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{t('c.save')}</Text>
        </Pressable>
      </View>
    </VBSheet>
  );
}

export function formatTime(hour: number, minute: number, lang: 'en' | 'ko'): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', { hour: 'numeric', minute: '2-digit' });
}
