// Compact verse row — used in category detail, saved, calendar, history.
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Verse } from '@/data/content';
import { imageFor } from '@/services/images';
import { vbOrder } from '@/data/order';
import { VBImage } from './VBImage';
import { CatChip } from './CatChip';
import { Icon } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { mix, serifFamily } from '@/theme/tokens';
import { useI18n } from '@/i18n';

type Props = {
  verse: Verse;
  order?: 'en' | 'ko';
  saved?: boolean;
  note?: string;
  savedDate?: string;
  guide?: boolean;
  onOpen: () => void;
  onToggleSave?: (id: string) => void;
};

export function VerseRow({ verse, order = 'en', saved, note, savedDate, guide, onOpen, onToggleSave }: Props) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const [a, b] = vbOrder(verse, order);
  return (
    <Pressable onPress={onOpen} style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: theme.card }}>
      <VBImage cat={verse.cat} src={imageFor(verse)} radius={14} style={{ width: 66, height: 66 }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 }}>
          <CatChip cat={verse.cat} size="sm" />
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', color: theme.goldInk }}>{lang === 'ko' ? verse.refKo : verse.refEn}</Text>
        </View>
        <Text numberOfLines={2} style={{ marginTop: 6, fontFamily: a.lang === 'en' ? serifFamily(500) : undefined, fontWeight: a.lang === 'ko' ? '500' : undefined, fontSize: 15, lineHeight: 20, color: theme.labelPrimary }}>{a.text}</Text>
        <Text numberOfLines={1} style={{ marginTop: 5, fontFamily: b.lang === 'en' ? serifFamily(400) : undefined, fontSize: 13, lineHeight: 18, color: theme.labelSecondary }}>{b.text}</Text>
        {note ? (
          <View style={{ marginTop: 8, flexDirection: 'row', gap: 7, alignItems: 'flex-start', paddingVertical: 7, paddingHorizontal: 10, backgroundColor: theme.fill, borderRadius: 10, borderWidth: 0.5, borderColor: theme.hair }}>
            <Icon name="note" size={13} color={theme.goldInk} />
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 12.5, lineHeight: 17, color: theme.labelSecondary, fontStyle: 'italic' }}>{note}</Text>
          </View>
        ) : null}
        {guide ? (
          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 99, backgroundColor: mix(theme.gold, theme.card, 16), borderWidth: 0.5, borderColor: mix(theme.gold, 'rgba(0,0,0,0)', 30) }}>
            <Icon name="quote" size={11} color={theme.goldInk} />
            <Text style={{ fontSize: 10.5, fontWeight: '600', color: theme.goldInk }}>{t('sg.includesGuide')}</Text>
          </View>
        ) : null}
        {savedDate ? <Text style={{ marginTop: 7, fontSize: 11, fontWeight: '500', color: theme.labelTertiary }}>{t('saved.savedOn')} {savedDate}</Text> : null}
      </View>
      {onToggleSave ? (
        <Pressable onPress={() => onToggleSave(verse.id)} hitSlop={8} style={{ padding: 4, alignSelf: 'flex-start' }}>
          <Icon name="bookmark" size={21} color={saved ? theme.goldInk : theme.labelTertiary} fill={saved} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
