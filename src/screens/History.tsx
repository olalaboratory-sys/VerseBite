import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { vbVerse } from '@/data/content';
import { VerseRow } from '@/components/VerseRow';
import { Icon } from '@/components/Icon';
import { OverlayScreen, OverlayHeader } from '@/components/ui';

export function HistoryScreen() {
  const theme = useTheme();
  const { lang } = useI18n();
  const s = useStore();
  return (
    <OverlayScreen animateKey="history">
      <OverlayHeader title={lang === 'ko' ? '지난 말씀' : 'Verse History'} onBack={s.closeOverlay} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}>
        {s.history.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
            <View style={{ width: 78, height: 78, borderRadius: 24, backgroundColor: theme.fill, borderWidth: 0.5, borderColor: theme.hair, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icon name="today" size={34} color={theme.goldInk} />
            </View>
            <Text style={{ textAlign: 'center', color: theme.labelSecondary, fontSize: 15, lineHeight: 22 }}>
              {lang === 'ko' ? '읽은 말씀이 이곳에 보관됩니다.' : 'Verses you read will appear here as your personal archive.'}
            </Text>
          </View>
        ) : (
          <View style={[{ backgroundColor: theme.card, borderRadius: 18, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
            {s.history.map((h, i) => {
              const v = vbVerse(h.id);
              if (!v) return null;
              return (
                <View key={h.ts}>
                  {i > 0 ? <View style={{ height: 0.5, backgroundColor: theme.separator, marginLeft: 96 }} /> : null}
                  <VerseRow verse={v} order={s.order} savedDate={h.date} onOpen={() => s.openVerse(v)} />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </OverlayScreen>
  );
}
