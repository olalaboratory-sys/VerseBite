// Signature verse card — three layouts (editorial default).
import React from 'react';
import { View } from 'react-native';
import { Verse } from '@/data/content';
import { VBImage } from './VBImage';
import { Scrim } from './Scrim';
import { CatChip } from './CatChip';
import { VerseBody } from './VerseBody';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  verse: Verse;
  layout?: 'editorial' | 'fullbleed' | 'stacked';
  order?: 'en' | 'ko';
  learn?: 'en' | 'ko' | 'off';
  onWord?: (token: string, lang: 'en' | 'ko') => void;
  savedWords?: Set<string>;
};

export function VerseCard({ verse, layout = 'editorial', order = 'en', learn = 'off', onWord, savedWords }: Props) {
  const theme = useTheme();
  const radius = theme.radius;
  const bodyProps = { learn, onWord, savedWords };

  if (layout === 'fullbleed') {
    return (
      <View style={[{ borderRadius: radius, overflow: 'hidden' }, theme.shadow]}>
        <VBImage cat={verse.cat} src={verse.img} radius={radius} style={{ minHeight: 476 }} scrim={<Scrim colors={['rgba(28,22,17,0.04)', 'rgba(28,22,17,0.30)', 'rgba(28,22,17,0.82)']} locations={[0.3, 0.58, 0.96]} />}>
          <View style={{ position: 'absolute', top: 16, left: 16 }}><CatChip cat={verse.cat} onImage /></View>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 22, paddingBottom: 24 }}>
            <VerseBody verse={verse} order={order} light size="lg" {...bodyProps} />
          </View>
        </VBImage>
      </View>
    );
  }

  if (layout === 'stacked') {
    return (
      <View style={{ paddingBottom: 2 }}>
        <VBImage cat={verse.cat} src={verse.img} radius={radius} style={[{ height: 286 }, theme.shadow]} scrim={<Scrim colors={['transparent', 'rgba(28,22,17,0.18)']} locations={[0.64, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />}>
          <View style={{ position: 'absolute', top: 16, left: 16 }}><CatChip cat={verse.cat} onImage /></View>
        </VBImage>
        <View style={[{ marginHorizontal: 14, marginTop: -46, backgroundColor: theme.card, borderRadius: radius - 4, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24, borderWidth: 0.5, borderColor: theme.hair }, theme.shadow]}>
          <VerseBody verse={verse} order={order} size="md" {...bodyProps} />
        </View>
      </View>
    );
  }

  // editorial (default)
  return (
    <View style={[{ backgroundColor: theme.card, borderRadius: radius, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadow]}>
      <VBImage cat={verse.cat} src={verse.img} style={{ height: 214 }} />
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 }}>
        <View style={{ marginBottom: 16 }}><CatChip cat={verse.cat} /></View>
        <VerseBody verse={verse} order={order} size="md" {...bodyProps} />
      </View>
    </View>
  );
}
