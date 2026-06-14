import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { vbCategory, vbVersesByCat, catImg } from '@/data/content';
import { VBImage } from '@/components/VBImage';
import { Scrim } from '@/components/Scrim';
import { VerseRow } from '@/components/VerseRow';
import { GlassBack, OverlayScreen, SegmentedControl } from '@/components/ui';

export function CategoryDetailScreen({ cat }: { cat: string }) {
  const theme = useTheme();
  const { t, catName, catSecondary, lang } = useI18n();
  const s = useStore();
  const insets = useSafeAreaInsets();
  const c = vbCategory(cat)!;
  const [sort, setSort] = useState<'recent' | 'saved' | 'random'>('recent');

  const verses = useMemo(() => {
    let v = vbVersesByCat(cat);
    if (sort === 'random') v = [...v].sort(() => Math.random() - 0.5);
    if (sort === 'saved') v = [...v].sort((x, y) => (s.savedSet.has(y.id) ? 1 : 0) - (s.savedSet.has(x.id) ? 1 : 0));
    return v;
  }, [cat, sort, s.savedSet]);

  return (
    <OverlayScreen animateKey={cat}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <VBImage cat={cat} src={catImg(cat, 1)} radius={0} style={{ height: 248 }} scrim={<Scrim colors={['rgba(28,22,17,0.42)', 'rgba(28,22,17,0.18)', 'rgba(28,22,17,0.86)']} locations={[0, 0.38, 1]} />}>
          <View style={{ position: 'absolute', top: insets.top + 6, left: 16 }}><GlassBack onPress={s.closeOverlay} /></View>
          <View style={{ position: 'absolute', left: 22, right: 22, bottom: 20 }}>
            <Text style={{ fontFamily: serifFamily(500), fontSize: 15, color: theme.gold, letterSpacing: 1 }}>{catSecondary(c)}</Text>
            <Text style={{ fontFamily: serifFamily(600), fontSize: 36, lineHeight: 38, color: '#fff', marginTop: 4 }}>{catName(c)}</Text>
            <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 21, color: 'rgba(255,255,255,0.84)' }}>{lang === 'ko' ? c.koMsg : c.msg}</Text>
          </View>
        </VBImage>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
          <SegmentedControl value={sort} onChange={setSort} options={[{ value: 'recent', label: t('cat.recent') }, { value: 'saved', label: t('cat.mostSaved') }, { value: 'random', label: t('cat.random') }]} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={[{ backgroundColor: theme.card, borderRadius: 18, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
            {verses.map((v, i) => (
              <View key={v.id}>
                {i > 0 ? <View style={{ height: 0.5, backgroundColor: theme.separator, marginLeft: 96 }} /> : null}
                <VerseRow verse={v} order={s.order} saved={s.savedSet.has(v.id)} note={s.notesMap[v.id]} onOpen={() => s.openVerse(v)} onToggleSave={s.toggleSave} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </OverlayScreen>
  );
}
