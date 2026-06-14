import React from 'react';
import { imageFor } from '@/services/images';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { vbVerse } from '@/data/content';
import { vbOrder } from '@/data/order';
import { VBImage } from '@/components/VBImage';
import { Icon } from '@/components/Icon';
import { OverlayScreen, OverlayHeader } from '@/components/ui';

export function JournalScreen() {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const s = useStore();
  const kindLabel = (kind: string) => kind === 'reflection' ? t('card.reflection') : kind === 'study' ? t('sg.myNote') : kind === 'gratitude' ? t('sg.gratitudeNote') : t('act.note');

  return (
    <OverlayScreen animateKey="journal">
      <OverlayHeader title={lang === 'ko' ? '묵상 저널' : 'Journal'} onBack={s.closeOverlay} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}>
        {s.journalEntries.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
            <View style={{ width: 78, height: 78, borderRadius: 24, backgroundColor: theme.fill, borderWidth: 0.5, borderColor: theme.hair, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icon name="note" size={34} color={theme.goldInk} />
            </View>
            <Text style={{ textAlign: 'center', color: theme.labelSecondary, fontSize: 15, lineHeight: 22 }}>
              {lang === 'ko' ? '묵상 저널이 비어 있어요.\n오늘의 작은 생각부터 남겨보세요.' : 'Your reflection journal is empty.\nStart with one small thought today.'}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {s.journalEntries.map((e) => {
              const v = vbVerse(e.id);
              if (!v) return null;
              const [a] = vbOrder(v, s.order);
              return (
                <Pressable key={e.id + e.kind} onPress={() => s.openVerse(v)} style={[{ flexDirection: 'row', gap: 12, backgroundColor: theme.card, borderRadius: 16, borderWidth: 0.5, borderColor: theme.hair, padding: 15 }, theme.shadowSm]}>
                  <VBImage cat={v.cat} src={imageFor(v)} radius={12} style={{ width: 48, height: 48 }} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: theme.goldInk }}>{a.ref}</Text>
                      <Text style={{ fontSize: 10, fontWeight: '500', color: theme.labelTertiary }}>{kindLabel(e.kind)}</Text>
                      <Text style={{ marginLeft: 'auto', fontSize: 11, fontWeight: '500', color: theme.labelTertiary }}>{e.date}</Text>
                    </View>
                    <Text numberOfLines={2} style={{ marginTop: 7, fontSize: 14, lineHeight: 21, color: theme.labelPrimary, fontStyle: 'italic' }}>{e.text}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </OverlayScreen>
  );
}
