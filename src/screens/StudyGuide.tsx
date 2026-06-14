import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Verse } from '@/data/content';
import { vbCategory } from '@/data/content';
import { studyGuide } from '@/data/studyData';
import { tokenize, lookup } from '@/data/words';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { mix, serifFamily, alpha } from '@/theme/tokens';
import { VBImage } from '@/components/VBImage';
import { Scrim } from '@/components/Scrim';
import { Icon, IconName } from '@/components/Icon';
import { PlusChip, CircleBack } from '@/components/ui';

const hasKo = (s: string) => /[가-힣]/.test(s);
function famStyle(text: string, weight: 400 | 500 | 600 = 500) {
  return hasKo(text) ? { fontWeight: String(weight) as '400' | '500' | '600' } : { fontFamily: serifFamily(weight) };
}
const order2 = (en: string, ko: string, order: 'en' | 'ko') => (order === 'ko' ? [ko, en] : [en, ko]) as [string, string];

function passageGloss(text: string, lang: 'en' | 'ko') {
  const toks = tokenize(text, lang);
  const glossary: { term: string; gloss: string }[] = [];
  const seen = new Set<string>();
  const rendered = toks.map((tk, i) => {
    if (!tk.word) return { k: i, text: tk.text, def: false };
    const hit = lookup(tk.text, lang);
    if (hit && !seen.has(hit.headword)) {
      seen.add(hit.headword);
      glossary.push({ term: lang === 'ko' ? hit.headword : tk.text.replace(/[^A-Za-z'-]/g, ''), gloss: hit.trans });
    }
    return { k: i, text: tk.text, def: !!hit };
  });
  return { rendered, glossary };
}

function Section({ icon, label, accent, children, defaultOpen = true }: { icon: IconName; label: string; accent: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[{ backgroundColor: theme.card, borderRadius: 18, borderWidth: 0.5, borderColor: theme.hair, overflow: 'hidden' }, theme.shadowSm]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 18, paddingVertical: 15 }}>
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={16} color="#fff" /></View>
        <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: theme.labelPrimary }}>{label}</Text>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}><Icon name="chevron" size={16} color={theme.labelTertiary} /></View>
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 18, paddingBottom: 18 }}>{children}</View> : null}
    </View>
  );
}

export function StudyGuideScreen({ verse }: { verse: Verse }) {
  const theme = useTheme();
  const { t, catName, lang } = useI18n();
  const s = useStore();
  const insets = useSafeAreaInsets();
  const sg = studyGuide(verse.id);
  const c = vbCategory(verse.cat);
  const tintC = c ? c.tint : theme.goldInk;
  const [showGloss, setShowGloss] = useState(false);

  if (!sg) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <View style={{ position: 'absolute', top: insets.top + 6, left: 16, zIndex: 2 }}><CircleBack onPress={s.closeOverlay} /></View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Text style={{ color: theme.labelTertiary, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>{lang === 'ko' ? '이 말씀의 스터디 가이드는 곧 제공돼요.' : 'Study guide coming soon for this verse.'}</Text>
        </View>
      </View>
    );
  }

  const pri = lang;
  const order = s.order;
  const learn = s.learn;
  const [vA, vB] = order2(verse.en, verse.ko, order);
  const [rA, rB] = order2(verse.refEn, verse.refKo, order);
  const [pRefA] = order2(sg.pRefEn, sg.pRefKo, order);
  const ctx = order2(sg.ctxEn, sg.ctxKo, pri);
  const keys = pri === 'ko' ? sg.keyKo : sg.keyEn;
  const keysAlt = pri === 'ko' ? sg.keyEn : sg.keyKo;
  const reflects = pri === 'ko' ? sg.reflectKo : sg.reflectEn;
  const applies = pri === 'ko' ? sg.applyKo : sg.applyEn;
  const prayer = pri === 'ko' ? sg.prayerKo : sg.prayerEn;
  const passages = order === 'ko' ? [{ lang: 'ko' as const, text: sg.pKo }, { lang: 'en' as const, text: sg.pEn }] : [{ lang: 'en' as const, text: sg.pEn }, { lang: 'ko' as const, text: sg.pKo }];
  const pGloss = learn !== 'off' ? passageGloss(learn === 'en' ? sg.pEn : sg.pKo, learn) : null;
  const studySaved = (s.saved[verse.id] || {}).guide;
  const journalText = (s.journal[verse.id] || {}).study;
  const gratitudeText = (s.journal[verse.id] || {}).gratitude;
  const inputStyle = { minHeight: 96, borderWidth: 0.5, borderColor: theme.hair, borderRadius: 12, padding: 12, backgroundColor: theme.bg, fontSize: 15, color: theme.labelPrimary, textAlignVertical: 'top' as const };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: theme.hair }}>
        <CircleBack onPress={s.closeOverlay} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.labelPrimary }}>{t('sg.title')}</Text>
            <PlusChip />
          </View>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '500', color: theme.goldInk, marginTop: 3 }}>{catName(c)} · {rA}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 12 }}>
        {/* selected verse */}
        <View style={[{ borderRadius: 18, overflow: 'hidden' }, theme.shadowSm]}>
          <VBImage cat={verse.cat} src={verse.img} radius={18} style={{ minHeight: 172 }} scrim={<Scrim colors={['rgba(28,22,17,0.45)', 'rgba(28,22,17,0.20)', 'rgba(28,22,17,0.88)']} locations={[0, 0.36, 0.92]} />}>
            <View style={{ position: 'absolute', top: 12, left: 12 }}><Text style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>{t('sg.selectedVerse')}</Text></View>
            <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
              <Text style={[{ fontSize: 17, lineHeight: 22, color: '#fff' }, famStyle(vA)]}>{vA}</Text>
              <Text style={[{ fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.78)', marginTop: 6 }, famStyle(vB, 400)]}>{vB}</Text>
              <Text style={{ marginTop: 8, fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: theme.gold }}>{rA} · {rB}</Text>
            </View>
          </VBImage>
        </View>

        {/* full passage */}
        <Section icon="quote" label={t('sg.fullPassage')} accent={tintC}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', color: theme.goldInk, marginBottom: 10 }}>{pRefA}</Text>
          {passages.map((p, idx) => (
            <View key={p.lang}>
              {idx > 0 ? <View style={{ height: 0.5, backgroundColor: theme.separator, marginVertical: 14 }} /> : null}
              <Text style={[{ fontSize: idx === 0 ? 16 : 14.5, lineHeight: idx === 0 ? 26 : 24, color: idx === 0 ? theme.labelPrimary : theme.labelSecondary }, famStyle(p.text, idx === 0 ? 500 : 400)]}>
                {pGloss && p.lang === learn
                  ? pGloss.rendered.map((tok) => tok.def
                    ? <Text key={tok.k} style={{ textDecorationLine: 'underline', textDecorationColor: alpha(theme.goldInk, 0.6) }}>{tok.text}</Text>
                    : <Text key={tok.k}>{tok.text}</Text>)
                  : p.text}
              </Text>
            </View>
          ))}
          {pGloss && pGloss.glossary.length > 0 ? (
            <View style={{ marginTop: 15, paddingTop: 13, borderTopWidth: 0.5, borderTopColor: theme.separator }}>
              <Pressable onPress={() => setShowGloss((g) => !g)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="globe" size={14} color={theme.goldInk} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.labelSecondary }}>{t('sg.notes')}</Text>
                <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: theme.goldInk, fontSize: 12.5, fontWeight: '600' }}>{showGloss ? t('sg.hideWords') : t('sg.showWords')}</Text>
                  <View style={{ transform: [{ rotate: showGloss ? '90deg' : '0deg' }] }}><Icon name="chevron" size={13} color={theme.goldInk} /></View>
                </View>
              </Pressable>
              {showGloss ? (
                <View style={{ gap: 11, marginTop: 13 }}>
                  {pGloss.glossary.map((g, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 11, alignItems: 'baseline', paddingBottom: i < pGloss.glossary.length - 1 ? 11 : 0, borderBottomWidth: i < pGloss.glossary.length - 1 ? 0.5 : 0, borderBottomColor: theme.separator }}>
                      <Text style={[{ fontSize: 15.5, color: theme.labelPrimary, minWidth: 84 }, famStyle(g.term, 600)]}>{g.term}</Text>
                      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: theme.goldInk }}>{g.gloss}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </Section>

        {/* context */}
        <Section icon="search" label={t('sg.context')} accent={tintC}>
          <Text style={{ fontSize: 15, lineHeight: 24, color: theme.labelPrimary }}>{ctx[0]}</Text>
        </Section>

        {/* key message */}
        <Section icon="sparkle" label={t('sg.keyMessage')} accent={tintC}>
          <View style={{ gap: 12 }}>
            {keys.map((k, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 11 }}>
                <View style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: mix(tintC, theme.card, 18), alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 12, fontWeight: '700', color: theme.goldInk }}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 15.5, lineHeight: 22, color: theme.labelPrimary }, famStyle(k, 500)]}>{k}</Text>
                  <Text style={[{ fontSize: 12.5, lineHeight: 18, color: theme.labelTertiary, marginTop: 3 }, famStyle(keysAlt[i] || '', 400)]}>{keysAlt[i]}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        {/* reflection */}
        <Section icon="note" label={t('sg.reflection')} accent={tintC}>
          <View style={{ gap: 13 }}>
            {reflects.map((q, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Icon name="sparkle" size={15} color={theme.goldInk} />
                <Text style={[{ flex: 1, fontSize: 15.5, lineHeight: 23, color: theme.labelPrimary }, famStyle(q, 500)]}>{q}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 0.5, borderTopColor: theme.separator }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9 }}>
              <Icon name="note" size={14} color={theme.goldInk} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.labelSecondary }}>{t('sg.myNote')}</Text>
            </View>
            <TextInput value={journalText || ''} onChangeText={(v) => s.saveStudyJournal(verse.id, v)} placeholder={t('card.writeReflection')} placeholderTextColor={theme.labelTertiary} multiline style={inputStyle} />
          </View>
        </Section>

        {/* application */}
        <Section icon="check" label={t('sg.application')} accent={tintC}>
          <View style={{ gap: 11 }}>
            {applies.map((a, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start', paddingHorizontal: 13, paddingVertical: 11, backgroundColor: theme.fill, borderRadius: 12, borderWidth: 0.5, borderColor: theme.hair }}>
                <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: theme.card, borderWidth: 0.5, borderColor: theme.hair, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><Icon name="check" size={13} color={theme.goldInk} strokeWidth={2.2} /></View>
                <Text style={[{ flex: 1, fontSize: 14.5, lineHeight: 21, color: theme.labelPrimary }, famStyle(a, 400)]}>{a}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* gratitude */}
        <Section icon="sparkle" label={t('sg.gratitudeNote')} accent={tintC} defaultOpen={false}>
          <Text style={{ marginBottom: 10, fontSize: 14.5, lineHeight: 21, fontStyle: 'italic', color: theme.labelSecondary }}>{t('sg.gratitudePrompt')}</Text>
          <TextInput value={gratitudeText || ''} onChangeText={(v) => s.saveGratitude(verse.id, v)} placeholder={t('sg.gratitudePrompt')} placeholderTextColor={theme.labelTertiary} multiline style={inputStyle} />
        </Section>

        {/* prayer */}
        <Section icon="heart" label={t('sg.prayer')} accent={tintC} defaultOpen={false}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: mix(tintC, theme.bg, 12), borderRadius: 14, borderWidth: 0.5, borderColor: theme.hair }}>
            <Text style={[{ fontSize: 15.5, lineHeight: 25, fontStyle: 'italic', color: theme.labelPrimary }, famStyle(prayer, 500)]}>{prayer}</Text>
          </View>
        </Section>

        {/* save */}
        <Pressable onPress={() => s.saveStudyGuide(verse.id)} style={[{ height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: studySaved ? theme.fill : theme.goldInk }, !studySaved && theme.shadowSm]}>
          <Icon name="bookmark" size={18} color={studySaved ? theme.goldInk : '#fff'} fill={!!studySaved} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: studySaved ? theme.goldInk : '#fff' }}>{studySaved ? t('sg.savedState') : t('sg.save')}</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8 }}>
          <View style={{ flex: 1, height: 0.5, backgroundColor: theme.separator }} />
          <Text style={{ fontSize: 11, color: theme.labelTertiary }}>{t('brand')} · {pri === 'ko' ? '개역 · WEB' : 'WEB · 개역'}</Text>
          <View style={{ flex: 1, height: 0.5, backgroundColor: theme.separator }} />
        </View>
      </ScrollView>
    </View>
  );
}
