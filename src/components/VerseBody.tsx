// Verse text block — EN + KO in chosen order, with tappable words in learning mode.
import React from 'react';
import { Text, View } from 'react-native';
import { Verse } from '@/data/content';
import { vbOrder, Line } from '@/data/order';
import { tokenize, lookup } from '@/data/words';
import { useTheme } from '@/theme/ThemeProvider';
import { serifFamily, alpha } from '@/theme/tokens';

type Props = {
  verse: Verse;
  order?: 'en' | 'ko';
  light?: boolean;
  size?: 'lg' | 'md' | 'sm';
  align?: 'left' | 'center';
  learn?: 'en' | 'ko' | 'off';
  onWord?: (token: string, lang: 'en' | 'ko') => void;
  savedWords?: Set<string>;
};

export function VerseBody({ verse, order = 'en', light = false, size = 'lg', align = 'left', learn = 'off', onWord, savedWords }: Props) {
  const theme = useTheme();
  const [a, b] = vbOrder(verse, order);
  const enSize = size === 'lg' ? 25 : size === 'md' ? 21 : 18;
  const koSize = size === 'lg' ? 18 : size === 'md' ? 16 : 15;
  const sz = (l: 'en' | 'ko') => (l === 'en' ? enSize : koSize);
  const primary = light ? 'rgba(255,255,255,0.96)' : theme.labelPrimary;
  const secondary = light ? 'rgba(255,255,255,0.74)' : theme.labelSecondary;
  const gold = light ? 'rgba(255,255,255,0.82)' : theme.goldInk;

  const renderText = (item: Line, color: string, fontSize: number) => {
    const tappable = learn && learn !== 'off' && item.lang === learn && !!onWord;
    const fam = item.lang === 'en' ? serifFamily(500) : undefined;
    const lineHeight = item.lang === 'en' ? fontSize * 1.34 : fontSize * 1.5;
    if (!tappable) {
      return <Text style={{ fontFamily: fam, fontSize, lineHeight, color, fontWeight: item.lang === 'ko' ? '500' : undefined }}>{item.text}</Text>;
    }
    return (
      <Text style={{ fontFamily: fam, fontSize, lineHeight, color, fontWeight: item.lang === 'ko' ? '500' : undefined }}>
        {tokenize(item.text, item.lang).map((tok, i) => {
          if (!tok.word) return <Text key={i}>{tok.text}</Text>;
          const hit = lookup(tok.text, item.lang);
          const key = hit ? item.lang + ':' + hit.headword : null;
          const isSaved = key && savedWords && savedWords.has(key);
          const underline = hit ? { textDecorationLine: 'underline' as const, textDecorationColor: light ? 'rgba(255,255,255,0.6)' : alpha(theme.goldInk, 0.6) } : null;
          const savedBg = isSaved ? { backgroundColor: light ? 'rgba(255,255,255,0.26)' : alpha(theme.gold, 0.3) } : null;
          return (
            <Text key={i} onPress={() => onWord!(tok.text, item.lang)} style={[underline, savedBg]}>{tok.text}</Text>
          );
        })}
      </Text>
    );
  };

  const Block = ({ item, isPrimary }: { item: Line; isPrimary: boolean }) => (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      {renderText(item, isPrimary ? primary : secondary, sz(item.lang))}
      <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: gold, marginTop: 9, textAlign: align }}>{item.ref}</Text>
    </View>
  );

  return (
    <View style={{ gap: 18 }}>
      <Block item={a} isPrimary />
      <View style={{ height: 0.5, backgroundColor: light ? 'rgba(255,255,255,0.22)' : theme.separator, width: align === 'center' ? 48 : '100%', alignSelf: align === 'center' ? 'center' : 'stretch' }} />
      <Block item={b} isPrimary={false} />
    </View>
  );
}
