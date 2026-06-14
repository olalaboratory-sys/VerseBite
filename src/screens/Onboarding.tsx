import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES, catImg } from '@/data/content';
import { useTheme } from '@/theme/ThemeProvider';
import { serifFamily, GOLD_DEEP } from '@/theme/tokens';
import { VBImage } from '@/components/VBImage';
import { Scrim } from '@/components/Scrim';
import { Icon } from '@/components/Icon';
import { Button, PlusChip } from '@/components/ui';
import type { Lang } from '@/i18n/dict';
import type { Learn, Plan } from '@/store/AppStore';

type DoneArg = { appLang: Lang; learningMode: Learn; primaryLang: string; order: string; verseOrder: 'auto'; categories: string[]; notifications: boolean; plan: Plan };

function Dots({ step, total }: { step: number; total: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 7, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 99, backgroundColor: i === step ? theme.gold : theme.hair }} />
      ))}
    </View>
  );
}

function SelectCard({ active, onPress, title, sub }: { active: boolean; onPress: () => void; title: string; sub?: string }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 18, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1.5, borderColor: active ? theme.gold : theme.hair }, active ? theme.shadowSm : null]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', letterSpacing: -0.3, color: theme.labelPrimary }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 14, lineHeight: 19, color: theme.labelSecondary, marginTop: 4 }}>{sub}</Text> : null}
      </View>
      <View style={{ width: 26, height: 26, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? theme.gold : 'transparent', borderWidth: active ? 0 : 1.5, borderColor: theme.hair }}>
        {active ? <Icon name="check" size={16} color="#fff" strokeWidth={2.4} /> : null}
      </View>
    </Pressable>
  );
}

export function Onboarding({ onDone }: { onDone: (a: DoneArg) => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Learn>('en');
  const [applang, setApplang] = useState<Lang>('en');
  const [notif, setNotif] = useState(true);
  const [cats, setCats] = useState<Set<string>>(new Set(['hope', 'gratitude', 'faith']));
  const L = applang === 'ko';

  // Android hardware back steps backward through onboarding instead of exiting.
  useEffect(() => {
    const onBack = () => { if (step > 0) { setStep((s) => s - 1); return true; } return false; };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [step]);

  const toggleCat = (id: string) => setCats((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const finish = (plan: Plan) => onDone({ appLang: applang, learningMode: lang, primaryLang: lang === 'off' ? 'both' : lang, order: lang === 'ko' ? 'ko' : 'en', verseOrder: 'auto', categories: Array.from(cats), notifications: notif, plan });

  // Step 0 — Welcome
  if (step === 0) {
    return (
      <View style={{ flex: 1 }}>
        <VBImage cat="hope" src={catImg('hope', 1)} radius={0} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} scrim={<Scrim colors={['rgba(28,22,17,0.42)', 'rgba(28,22,17,0.10)', 'rgba(28,22,17,0.78)']} locations={[0, 0.38, 1]} />} />
        <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28, paddingHorizontal: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Icon name="quote" size={22} color={theme.gold} />
            <Text style={{ fontSize: 16, fontWeight: '600', letterSpacing: 1, color: 'rgba(255,255,255,0.92)' }}>{L ? '말씀한입' : 'VerseBite'}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', color: theme.gold, marginBottom: 18 }}>Daily Bilingual Devotion</Text>
            <Text style={{ fontFamily: serifFamily(600), fontSize: 50, lineHeight: 51, color: '#fff', letterSpacing: 0.5 }}>A quiet word{'\n'}to begin{'\n'}your day.</Text>
            <Text style={{ marginTop: 18, fontSize: 17, lineHeight: 26, color: 'rgba(255,255,255,0.82)', maxWidth: 300 }}>Daily Bible verses in English and Korean, paired with cinematic imagery to reflect and learn.</Text>
            <View style={{ marginTop: 30 }}>
              <Button label="Get Started" onPress={() => setStep(1)} />
            </View>
            <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>매일 영어와 한국어로 만나는 성경 한 구절</Text>
          </View>
        </View>
      </View>
    );
  }

  // Steps 1–3 frame
  const Frame = ({ children, footer, dotStep }: { children: React.ReactNode; footer: React.ReactNode; dotStep: number }) => (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Pressable onPress={() => setStep((sp) => sp - 1)} style={{ width: 38, height: 38, borderRadius: 99, backgroundColor: theme.fill, alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={20} color={theme.labelSecondary} /></Pressable>
        <View style={{ flex: 1 }}><Dots step={dotStep} total={5} /></View>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>{children}</ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 16 }}>{footer}</View>
    </View>
  );

  const Title = ({ title, sub }: { title: string; sub: string }) => (
    <View style={{ marginBottom: 26 }}>
      <Text style={{ fontFamily: serifFamily(600), fontSize: 30, lineHeight: 35, letterSpacing: -0.2, color: theme.labelPrimary }}>{title}</Text>
      <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 22, color: theme.labelSecondary }}>{sub}</Text>
    </View>
  );

  if (step === 1) {
    return (
      <Frame dotStep={0} footer={<Button label={L ? '계속' : 'Continue'} onPress={() => setStep(2)} />}>
        <Title title={L ? '앱을 어떤 언어로 사용할까요?' : 'What language for the app?'} sub={L ? '메뉴, 버튼, 카테고리, 설정 등 앱 인터페이스 언어예요. 학습할 언어와는 별개입니다.' : 'Sets the interface — menus, buttons, settings. Separate from the language you learn.'} />
        <View style={{ gap: 12 }}>
          <SelectCard active={applang === 'en'} onPress={() => setApplang('en')} title="English" sub="Use the app in English" />
          <SelectCard active={applang === 'ko'} onPress={() => setApplang('ko')} title="한국어" sub="앱을 한국어로 사용하기" />
        </View>
      </Frame>
    );
  }

  if (step === 2) {
    return (
      <Frame dotStep={1} footer={<Button label={L ? '계속' : 'Continue'} onPress={() => setStep(3)} />}>
        <Title title={L ? '언어 학습은 어떻게 할까요?' : 'How do you want to learn?'} sub={L ? '선택한 학습 언어가 카드 위쪽에 표시돼요. 말씀 속 단어를 눌러 뜻을 보고 저장할 수 있어요.' : 'Your learning language leads on each card. Tap words in the main verse to see their meaning and save them.'} />
        <View style={{ gap: 12 }}>
          <SelectCard active={lang === 'en'} onPress={() => setLang('en')} title={L ? '영어 학습' : 'Learn English'} sub="영어 단어와 표현을 한국어로 설명해드려요" />
          <SelectCard active={lang === 'ko'} onPress={() => setLang('ko')} title={L ? '한국어 학습' : 'Learn Korean'} sub="Korean words explained in English · tap to learn" />
          <SelectCard active={lang === 'off'} onPress={() => setLang('off')} title={L ? '학습 끄기' : 'Just reading'} sub={L ? '학습 노트 없이 조용하게 말씀만 볼래요' : 'Show both languages, no word lookups'} />
        </View>
      </Frame>
    );
  }

  if (step === 3) {
    return (
      <Frame dotStep={2} footer={<Button label={cats.size > 0 ? (L ? `계속 · ${cats.size}개 선택` : `Continue · ${cats.size} chosen`) : (L ? '하나 이상 선택하세요' : 'Choose at least one')} onPress={() => cats.size > 0 && setStep(4)} disabled={cats.size === 0} />}>
        <Title title={L ? '어떤 말씀이 마음에 닿나요?' : 'What speaks to your heart?'} sub={L ? '받고 싶은 주제를 선택하세요. 모든 카테고리는 나중에 둘러볼 수 있어요.' : "Choose the themes you'd like to receive. You can browse every category later."} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CATEGORIES.map((c) => {
            const on = cats.has(c.id);
            return (
              <Pressable key={c.id} onPress={() => toggleCat(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1.5, borderColor: on ? c.tint : theme.hair, backgroundColor: theme.card }}>
                <View style={{ width: 9, height: 9, borderRadius: 99, backgroundColor: c.tint, opacity: on ? 1 : 0.4 }} />
                <Text style={{ fontSize: 15, fontWeight: '500', color: on ? c.tint : theme.labelSecondary }}>{L ? c.ko : c.label}</Text>
                <Text style={{ fontSize: 13, color: theme.labelTertiary }}>{L ? c.label : c.ko}</Text>
              </Pressable>
            );
          })}
        </View>
      </Frame>
    );
  }

  if (step === 4) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12 }}>
          <Pressable onPress={() => setStep(3)} style={{ width: 38, height: 38, borderRadius: 99, backgroundColor: theme.fill, alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={20} color={theme.labelSecondary} /></Pressable>
          <View style={{ flex: 1 }}><Dots step={3} total={5} /></View>
          <View style={{ width: 38 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <View style={{ width: 128, height: 128, marginBottom: 34 }}>
            <LinearGradient colors={[theme.gold, GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flex: 1, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bell" size={56} color="#fff" strokeWidth={1.5} />
            </LinearGradient>
            <View style={{ position: 'absolute', top: -4, right: -2, width: 30, height: 30, borderRadius: 99, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...theme.shadowSm }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.goldInk }}>8</Text>
            </View>
          </View>
          <Text style={{ fontFamily: serifFamily(600), fontSize: 30, lineHeight: 36, color: theme.labelPrimary, textAlign: 'center', maxWidth: 300 }}>{L ? '아침을 말씀으로 시작해보세요' : 'Start your morning with a verse'}</Text>
          <Text style={{ marginTop: 14, fontSize: 16, lineHeight: 24, color: theme.labelSecondary, textAlign: 'center', maxWidth: 290 }}>{L ? 'VerseBite가 매일 아침 8:00에 새로운 말씀을 전해드려요. 당신을 위한 조용한 시간이에요.' : 'VerseBite refreshes your daily verse every morning at 8:00 AM. A gentle moment, kept just for you.'}</Text>
        </View>
        <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16, gap: 6 }}>
          <Button label={L ? '매일 알림 켜기' : 'Enable Daily Reminder'} onPress={() => { setNotif(true); setStep(5); }} />
          <Button variant="plain" label={L ? '다음에 할게요' : 'Maybe later'} onPress={() => { setNotif(false); setStep(5); }} />
        </View>
      </View>
    );
  }

  // Step 5 — Plan
  const planCards = [
    { id: 'free' as Plan, name: L ? '무료' : 'Free', tag: L ? '매일의 이중언어 말씀 카드, 저장, 메모, 기본 공유.' : 'A daily bilingual verse card, saving, notes & basic sharing.', price: '$0', cta: L ? '무료로 시작' : 'Continue free', hot: false },
    { id: 'plus' as Plan, name: L ? '말씀한입 플러스' : 'VerseBite Plus', tag: L ? '광고 없이 · 무제한 새로고침 · AI 묵상 · 학습 노트 · 프리미엄 카드.' : 'Ad-free, unlimited refresh, AI reflection, learning notes & premium cards.', price: '$2.99/mo · $19.99/yr', cta: L ? '플러스 시작' : 'Start Plus', hot: true },
    { id: 'lifetime' as Plan, name: L ? '평생 이용' : 'Lifetime', tag: L ? '한 번의 결제로 평생 조용한 말씀 경험을.' : 'One purchase. A lifetime of quiet daily verses.', price: '$29.99 once', cta: L ? '평생 잠금 해제' : 'Unlock Lifetime', hot: false },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Pressable onPress={() => setStep(4)} style={{ width: 38, height: 38, borderRadius: 99, backgroundColor: theme.fill, alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={20} color={theme.labelSecondary} /></Pressable>
        <View style={{ flex: 1 }}><Dots step={4} total={5} /></View>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: insets.bottom + 20 }}>
        <Text style={{ fontFamily: serifFamily(600), fontSize: 29, lineHeight: 33, letterSpacing: -0.2, color: theme.labelPrimary }}>{L ? '어떻게 시작할까요?' : 'Choose how you’ll begin'}</Text>
        <Text style={{ marginTop: 9, marginBottom: 20, fontSize: 15, lineHeight: 22, color: theme.labelSecondary }}>{L ? '무료로 시작하거나 Plus로 더 조용하고 깊게. 언제든 바꿀 수 있어요.' : 'Start free, or go quieter and deeper with Plus. You can change anytime.'}</Text>
        <View style={{ gap: 12 }}>
          {planCards.map((p) => (
            <Pressable key={p.id} onPress={() => finish(p.id)}>
              {p.hot ? (
                <LinearGradient colors={['#2A2017', '#4A3A26']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ borderRadius: 18, padding: 18 }, theme.shadow]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#F4E9D8' }}>{p.name}</Text>
                    <PlusChip />
                  </View>
                  <Text style={{ marginTop: 8, marginBottom: 12, fontSize: 13, lineHeight: 19, color: 'rgba(244,233,216,0.72)' }}>{p.tag}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.gold }}>{p.price}</Text>
                    <View style={{ paddingVertical: 9, paddingHorizontal: 16, borderRadius: 11, backgroundColor: theme.gold }}><Text style={{ fontSize: 13, fontWeight: '600', color: '#2A2017' }}>{p.cta}</Text></View>
                  </View>
                </LinearGradient>
              ) : (
                <View style={[{ borderRadius: 18, padding: 18, backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.hair }, theme.shadowSm]}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: theme.labelPrimary }}>{p.name}</Text>
                  <Text style={{ marginTop: 8, marginBottom: 12, fontSize: 13, lineHeight: 19, color: theme.labelSecondary }}>{p.tag}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.goldInk }}>{p.price}</Text>
                    <View style={{ paddingVertical: 9, paddingHorizontal: 16, borderRadius: 11, backgroundColor: theme.fill }}><Text style={{ fontSize: 13, fontWeight: '600', color: theme.goldInk }}>{p.cta}</Text></View>
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </View>
        <Text style={{ textAlign: 'center', fontSize: 11, lineHeight: 16, color: theme.labelTertiary, paddingTop: 16 }}>You can start free and upgrade later from Profile.</Text>
      </ScrollView>
    </View>
  );
}
