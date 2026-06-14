import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { Icon } from '@/components/Icon';
import { PlusChip, OverlayScreen, OverlayHeader } from '@/components/ui';

export function PricingScreen() {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const s = useStore();
  const plan = s.plan;
  const KL = (en: string, ko: string) => (lang === 'ko' ? ko : en);

  const rows: [string, boolean | string, boolean | string, boolean | string][] = [
    [KL('Daily verse · EN + KO', '매일 말씀 · 영/한'), true, true, true],
    [KL('AI cinematic image', 'AI 시네마틱 이미지'), true, true, true],
    [KL('Save · notes · share', '저장 · 메모 · 공유'), true, true, true],
    [KL('Ads', '광고'), '—', KL('None', '없음'), KL('None', '없음')],
    [KL('Unlimited refresh', '무제한 새로고침'), false, true, true],
    [t('sg.title'), false, true, true],
    [KL('Context & key message', '배경·핵심 메시지'), false, true, true],
    [KL('Reflection & application', '묵상·적용 가이드'), false, true, true],
    [KL('Bilingual meaning notes', '영·한 의미 노트'), false, true, true],
    [KL('Premium share cards', '프리미엄 공유 카드'), false, true, true],
    [KL('History & journal', '지난 말씀·저널'), KL('Recent', '최근'), true, true],
  ];

  const cell = (v: boolean | string) =>
    v === true ? <Icon name="check" size={15} color={theme.goldInk} strokeWidth={2.4} /> :
    v === false ? <Text style={{ color: theme.labelTertiary }}>—</Text> :
    <Text style={{ fontSize: 11, fontWeight: '500', color: theme.goldInk }}>{v}</Text>;

  const cards = [
    { id: 'free', name: t('c.free'), tag: 'Start each day with a bilingual verse card.', price: '$0' },
    { id: 'plus', name: t('brandPlus'), tag: 'Ad-free, unlimited refresh, reflection, premium sharing.', price: '$2.99/mo · $19.99/yr', hot: true },
    { id: 'lifetime', name: t('brandLifetime'), tag: 'One purchase. A lifetime of quiet daily verses.', price: '$29.99 once' },
  ];

  return (
    <OverlayScreen animateKey="pricing">
      <OverlayHeader title="Plans" onBack={s.closeOverlay} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}>
        <View style={{ gap: 12, marginBottom: 24 }}>
          {cards.map((p) => (
            <View key={p.id} style={[{ backgroundColor: theme.card, borderRadius: 18, borderWidth: plan === p.id ? 1.5 : 0.5, borderColor: plan === p.id ? theme.gold : theme.hair, padding: 18 }, theme.shadowSm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.labelPrimary }}>{p.name}</Text>
                {p.hot ? <PlusChip /> : null}
                {plan === p.id ? <Text style={{ marginLeft: 'auto', fontSize: 11, fontWeight: '600', color: theme.goldInk }}>Current</Text> : null}
              </View>
              <Text style={{ fontSize: 13.5, lineHeight: 20, color: theme.labelSecondary, marginVertical: 8 }}>{p.tag}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.goldInk }}>{p.price}</Text>
                {p.id !== 'free' && plan === 'free' ? (
                  <Pressable onPress={() => { s.closeOverlay(); s.openPaywall(null); }} style={{ borderRadius: 10, paddingVertical: 9, paddingHorizontal: 16, backgroundColor: theme.goldInk }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Choose</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: theme.card, borderRadius: 18, borderWidth: 0.5, borderColor: theme.hair, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: theme.separator }}>
            <Text style={{ flex: 1.6, fontSize: 11, fontWeight: '600', color: theme.labelSecondary }}>Feature</Text>
            {[t('c.free'), t('c.plus'), t('c.lifetime')].map((h) => <Text key={h} style={{ flex: 0.8, textAlign: 'center', fontSize: 11, fontWeight: '600', color: theme.labelSecondary }}>{h}</Text>)}
          </View>
          {rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: i < rows.length - 1 ? 0.5 : 0, borderBottomColor: theme.separator }}>
              <Text style={{ flex: 1.6, fontSize: 13, color: theme.labelSecondary }}>{r[0]}</Text>
              {[r[1], r[2], r[3]].map((v, j) => <View key={j} style={{ flex: 0.8, alignItems: 'center' }}>{cell(v)}</View>)}
            </View>
          ))}
        </View>
      </ScrollView>
    </OverlayScreen>
  );
}
