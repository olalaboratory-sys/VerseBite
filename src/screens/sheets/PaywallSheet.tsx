import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { VBSheet } from '@/components/Sheet';
import { Icon, IconName } from '@/components/Icon';
import { PlusChip, Button } from '@/components/ui';
import { restorePurchases } from '@/services/purchases';
import type { Plan, Toast } from '@/store/AppStore';

export function PaywallSheet({ reason, onChoose, onClose, onToast }: { reason: string | null; onChoose: (p: Plan, sku?: string) => void; onClose: () => void; onToast: (t: Toast) => void }) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const [sel, setSel] = useState('yearly');
  const KL = (en: string, ko: string) => (lang === 'ko' ? ko : en);
  const feats: { icon: IconName; t: string; s: string }[] = [
    { icon: 'sparkle', t: KL('No ads', '광고 없이'), s: KL('Read without interruption.', '방해 없이 읽어요.') },
    { icon: 'refresh', t: KL('Unlimited refresh', '무제한 새로고침'), s: KL('Find the verse your heart needs.', '마음에 필요한 말씀을 찾아요.') },
    { icon: 'quote', t: t('sg.title'), s: KL('Full passage, context & key message.', '전체 문맥·배경·핵심 메시지.') },
    { icon: 'note', t: KL('Reflection & application', '묵상·적용 가이드'), s: KL('Guided questions and meaning notes.', '묵상 질문과 의미 노트까지.') },
    { icon: 'share', t: KL('Premium share cards', '프리미엄 공유 카드'), s: KL('Send the verse with your heart.', '말씀에 마음을 담아 보내요.') },
    { icon: 'today', t: KL('History & journal', '지난 말씀·저널'), s: KL('Keep the verses that shaped your days.', '당신의 하루를 빚은 말씀을 보관해요.') },
  ];
  const plans = [
    { id: 'monthly', label: t('c.plus') + ' · ' + KL('Monthly', '월간'), price: '$2.99', per: '/mo', sub: '₩3,900 / 월', badge: '' },
    { id: 'yearly', label: t('c.plus') + ' · ' + KL('Yearly', '연간'), price: '$19.99', per: '/yr', sub: '₩25,000 / 년 · ' + KL('save 44%', '44% 할인'), badge: KL('Best value', '추천') },
    { id: 'lifetime', label: t('c.lifetime'), price: '$29.99', per: KL(' once', ' 한 번'), sub: '₩39,000 · ' + KL('early supporter', '얼리버드'), badge: KL('Forever', '영구') },
  ];

  return (
    <VBSheet onClose={onClose} maxH={0.94}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <PlusChip size="md" />
          <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 99, backgroundColor: theme.fill, alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16} color={theme.labelSecondary} /></Pressable>
        </View>
        <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
          {reason ? <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: '500', color: theme.goldInk, marginBottom: 8 }}>{t(reason)}</Text> : null}
          <Text style={{ fontFamily: serifFamily(600), fontSize: 30, lineHeight: 34, letterSpacing: -0.3, color: theme.labelPrimary }}>{t('pw.title')}</Text>
          <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 22, color: theme.labelSecondary }}>{t('pw.sub')}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          {feats.map((f, i) => (
            <View key={i} style={{ width: '47.5%', flexGrow: 1, backgroundColor: theme.card, borderRadius: 14, borderWidth: 0.5, borderColor: theme.hair, padding: 13 }}>
              <Icon name={f.icon} size={20} color={theme.goldInk} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.labelPrimary, marginTop: 8 }}>{f.t}</Text>
              <Text style={{ fontSize: 12, lineHeight: 17, color: theme.labelSecondary, marginTop: 3 }}>{f.s}</Text>
            </View>
          ))}
        </View>
        <View style={{ paddingHorizontal: 24, paddingTop: 10, gap: 10 }}>
          {plans.map((p) => {
            const on = sel === p.id;
            return (
              <Pressable key={p.id} onPress={() => setSel(p.id)} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 15, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1.5, borderColor: on ? theme.gold : theme.hair }, on && theme.shadowSm]}>
                <View style={{ width: 22, height: 22, borderRadius: 99, borderWidth: on ? 0 : 1.5, borderColor: theme.hair, backgroundColor: on ? theme.goldInk : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{on ? <Icon name="check" size={13} color="#fff" strokeWidth={2.6} /> : null}</View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.labelPrimary }}>{p.label}</Text>
                    {p.badge ? <View style={{ backgroundColor: theme.fill, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 99 }}><Text style={{ fontSize: 9, fontWeight: '600', color: theme.goldInk }}>{p.badge}</Text></View> : null}
                  </View>
                  <Text style={{ fontSize: 12, color: theme.labelSecondary, marginTop: 3 }}>{p.sub}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: theme.labelPrimary }}>{p.price}</Text>
                  <Text style={{ fontSize: 12, color: theme.labelTertiary }}>{p.per}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Button label={sel === 'lifetime' ? t('pw.unlockLife') : t('pw.startPlus')} onPress={() => onChoose(sel === 'lifetime' ? 'lifetime' : 'plus', sel)} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, paddingTop: 4, paddingBottom: 6 }}>
          <Pressable onPress={async () => { const ok = await restorePurchases(); onToast({ text: ok ? 'pw.restored' : 'pw.nothingToRestore', icon: ok ? 'check' : 'close' }); }}><Text style={{ fontSize: 13, fontWeight: '500', color: theme.goldInk }}>{t('pw.restore')}</Text></Pressable>
          <Text style={{ color: theme.hair }}>·</Text>
          <Pressable onPress={() => onToast({ text: 'pw.terms', icon: 'check' })}><Text style={{ fontSize: 13, fontWeight: '500', color: theme.labelTertiary }}>{t('pw.terms')}</Text></Pressable>
        </View>
        <Text style={{ textAlign: 'center', fontSize: 11, lineHeight: 16, color: theme.labelTertiary, paddingHorizontal: 30, paddingBottom: 18 }}>Lifetime includes all core premium features. Some future AI-cost-heavy features may have fair-use limits.</Text>
      </ScrollView>
    </VBSheet>
  );
}
