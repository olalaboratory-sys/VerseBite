import React, { useState } from 'react';
import { imageFor } from '@/services/images';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Verse, vbCategory } from '@/data/content';
import { vbOrder } from '@/data/order';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { VBImage } from '@/components/VBImage';
import { Scrim } from '@/components/Scrim';
import { CatChip } from '@/components/CatChip';
import { Icon } from '@/components/Icon';
import { PlusChip, OverlayScreen, CircleBack } from '@/components/ui';
import { shareVerse } from '@/utils/share';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const hasKo = (s: string) => /[가-힣]/.test(s);

function Section({ label, right }: { label: string; right?: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 9 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: theme.labelSecondary }}>{label}</Text>
      {right}
    </View>
  );
}

function Rail({ items, value, onChange }: { items: [string, string][]; value: string; onChange: (v: string) => void }) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {items.map(([id, n]) => {
        const on = value === id;
        return (
          <Pressable key={id} onPress={() => onChange(id)} style={{ paddingVertical: 9, paddingHorizontal: 15, borderRadius: 999, borderWidth: 0.5, borderColor: theme.hair, backgroundColor: on ? theme.goldInk : theme.card }}>
            <Text style={{ fontSize: 13, fontWeight: on ? '600' : '500', color: on ? '#fff' : theme.labelSecondary }}>{n}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ShareEditorScreen({ verse }: { verse: Verse }) {
  const theme = useTheme();
  const { t } = useI18n();
  const s = useStore();
  const insets = useSafeAreaInsets();
  const c = vbCategory(verse.cat)!;
  const [tpl, setTpl] = useState('cinematic');
  const [ctx, setCtx] = useState('friend');
  const [vlang, setVlang] = useState('both');
  const [size, setSize] = useState('story');
  const [msg, setMsg] = useState('');
  const order = s.order;

  const templates: [string, string][] = [['minimal', 'Minimal'], ['cinematic', 'Cinematic'], ['letter', 'Letter'], ['prayer', 'Prayer'], ['bilingual', 'Bilingual']];
  const ctxs: [string, string][] = [['friend', 'Friend'], ['family', 'Family'], ['partner', 'Partner'], ['hard', 'Having a hard time'], ['thankful', 'Thankful for'], ['myself', 'Myself']];
  const suggestions: Record<string, { en: string; ko: string }> = {
    friend: { en: 'I thought of you when I read this verse.', ko: '네가 생각나서 이 구절을 보내.' },
    family: { en: 'Sending you a little peace today.', ko: '오늘 작은 평안을 보내.' },
    partner: { en: 'Grateful to walk through life with you.', ko: '함께 걸어가 줘서 고마워.' },
    hard: { en: 'I hope this gives you strength today.', ko: '오늘 너에게 작은 힘이 되길 바라.' },
    thankful: { en: 'I’m thankful for you — this reminded me of that.', ko: '네게 고마워서, 이 말씀이 떠올랐어.' },
    myself: { en: 'A word to hold onto today.', ko: '오늘 마음에 새길 한 마디.' },
  };
  const suggest = () => { const sg = suggestions[ctx]; setMsg(order === 'ko' ? sg.ko : sg.en); };
  const [a] = vbOrder(verse, order);
  const showLines = vlang === 'en' ? [verse.en] : vlang === 'ko' ? [verse.ko] : [vbOrder(verse, order)[0].text, vbOrder(verse, order)[1].text];
  const dims: Record<string, { ratio: number; label: string; w: number }> = {
    story: { ratio: 9 / 16, label: 'Story 1080×1920', w: 186 },
    square: { ratio: 1, label: 'Square 1080×1080', w: 280 },
    card: { ratio: 4 / 5, label: 'Card 1080×1350', w: 236 },
  };
  const dim = dims[size];
  const isLetter = tpl === 'letter' || tpl === 'prayer';

  return (
    <OverlayScreen animateKey="editor">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 8 }}>
        <CircleBack onPress={s.closeOverlay} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.labelPrimary }}>Share editor</Text>
          <PlusChip />
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}>
        {/* preview */}
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <View style={[{ width: dim.w, aspectRatio: dim.ratio, borderRadius: 16, overflow: 'hidden' }, theme.shadow]}>
            {isLetter ? (
              <View style={{ flex: 1, backgroundColor: tpl === 'prayer' ? '#F1E6CF' : '#FBF6EE', padding: 18, justifyContent: 'center', gap: 12 }}>
                <CatChip cat={verse.cat} size="sm" />
                {showLines.map((line, i) => <Text key={i} style={{ fontFamily: hasKo(line) ? undefined : serifFamily(500), fontWeight: '500', fontSize: i === 0 ? 16 : 13, lineHeight: i === 0 ? 22 : 18, color: i === 0 ? '#25221F' : 'rgba(58,47,40,0.62)' }}>{line}</Text>)}
                <View style={{ height: 0.5, backgroundColor: 'rgba(58,47,40,0.18)' }} />
                <Text style={{ fontSize: 13, lineHeight: 19, fontStyle: 'italic', color: 'rgba(58,47,40,0.62)' }}>{msg || (tpl === 'prayer' ? 'Praying this brings you peace.' : 'Your message appears here…')}</Text>
                <Text style={{ fontSize: 9, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: theme.goldInk }}>{a.ref} · {t('brand')}</Text>
              </View>
            ) : (
              <VBImage cat={verse.cat} src={imageFor(verse)} radius={16} style={{ flex: 1 }} scrim={<Scrim colors={tpl === 'minimal' ? ['rgba(28,22,17,0.05)', 'rgba(28,22,17,0.55)'] : ['rgba(28,22,17,0.10)', 'rgba(28,22,17,0.85)']} />}>
                <View style={{ position: 'absolute', left: 14, right: 14, bottom: 14, alignItems: tpl === 'minimal' ? 'flex-start' : 'center' }}>
                  {tpl !== 'minimal' ? <Text style={{ fontSize: 8, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: theme.gold }}>{c.label} · {c.ko}</Text> : null}
                  {showLines.map((line, i) => <Text key={i} style={{ fontFamily: hasKo(line) ? undefined : serifFamily(500), fontWeight: '500', fontSize: i === 0 ? 14 : 11, lineHeight: i === 0 ? 18 : 15, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.8)', marginTop: 7, textAlign: tpl === 'minimal' ? 'left' : 'center' }}>{line}</Text>)}
                  {msg ? <Text style={{ marginTop: 9, fontSize: 11, lineHeight: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', textAlign: tpl === 'minimal' ? 'left' : 'center' }}>“{msg}”</Text> : null}
                  <Text style={{ marginTop: 9, fontSize: 8, fontWeight: '500', letterSpacing: 1, color: 'rgba(255,255,255,0.75)' }}>{a.ref} · {t('brand')}</Text>
                </View>
              </VBImage>
            )}
          </View>
        </View>

        <Section label="Template" />
        <Rail items={templates} value={tpl} onChange={setTpl} />
        <Section label="Who is this for?" />
        <Rail items={ctxs} value={ctx} onChange={setCtx} />
        <Section label="Your message" right={
          <Pressable onPress={suggest} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.fill, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 12 }}>
            <Icon name="sparkle" size={13} color={theme.goldInk} /><Text style={{ fontSize: 12, fontWeight: '600', color: theme.goldInk }}>Suggest</Text>
          </Pressable>
        } />
        <TextInput value={msg} onChangeText={setMsg} maxLength={180} multiline placeholder="Write 1–3 short sentences…" placeholderTextColor={theme.labelTertiary} style={{ minHeight: 64, borderWidth: 0.5, borderColor: theme.hair, borderRadius: 14, padding: 13, backgroundColor: theme.card, fontSize: 15, color: theme.labelPrimary, textAlignVertical: 'top' }} />
        <Section label="Languages" />
        <Rail items={[['en', 'English'], ['ko', '한국어'], ['both', 'Bilingual']]} value={vlang} onChange={setVlang} />
        <Section label="Export size" />
        <Rail items={[['story', 'Story'], ['square', 'Square'], ['card', 'Card']]} value={size} onChange={setSize} />

        <Pressable onPress={async () => { s.bumpShare(); await shareVerse(verse, order, t('brand'), msg); s.closeOverlay(); }} style={{ marginTop: 18, height: 52, borderRadius: 14, backgroundColor: theme.goldInk, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="share" size={19} color="#fff" /><Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Share verse card</Text>
        </Pressable>
      </ScrollView>
    </OverlayScreen>
  );
}
