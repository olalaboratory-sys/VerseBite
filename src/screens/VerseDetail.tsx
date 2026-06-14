import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Verse } from '@/data/content';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { VBImage } from '@/components/VBImage';
import { Scrim } from '@/components/Scrim';
import { CatChip } from '@/components/CatChip';
import { VerseBody } from '@/components/VerseBody';
import { ActionBar } from '@/components/ActionBar';
import { StudyGuideCard } from '@/components/StudyGuideCard';
import { Icon } from '@/components/Icon';
import { GlassBack, OverlayScreen } from '@/components/ui';

export function VerseDetailScreen({ verse }: { verse: Verse }) {
  const theme = useTheme();
  const { t } = useI18n();
  const s = useStore();
  const insets = useSafeAreaInsets();
  const note = s.notesMap[verse.id];
  const saved = s.savedSet.has(verse.id);

  return (
    <OverlayScreen animateKey={verse.id}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <VBImage cat={verse.cat} src={verse.img} radius={0} style={{ height: 340 }} scrim={<Scrim colors={['rgba(28,22,17,0.34)', 'rgba(28,22,17,0.10)', theme.bg]} locations={[0, 0.56, 0.99]} />}>
          <View style={{ position: 'absolute', top: insets.top + 6, left: 16 }}><GlassBack onPress={s.closeOverlay} /></View>
          <View style={{ position: 'absolute', top: insets.top + 6, right: 16 }}><CatChip cat={verse.cat} onImage /></View>
        </VBImage>

        <View style={{ paddingHorizontal: 24, marginTop: -6 }}>
          <VerseBody verse={verse} order={s.order} size="lg" learn={s.learn} onWord={s.onWord} savedWords={s.savedWordSet} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <ActionBar saved={saved} isPaid={s.isPaid} onRefresh={null} onSave={() => s.toggleSave(verse.id)} onNote={() => s.openNote(verse)} onShare={() => s.openShare(verse)} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <StudyGuideCard isPaid={s.isPaid} onOpen={() => s.openStudy(verse)} onUpgrade={() => s.openPaywall('sg.reason')} />
        </View>

        {note ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', color: theme.goldInk, marginBottom: 10 }}>{s.appLang === 'ko' ? '나의 메모' : 'Your note'}</Text>
            <Pressable onPress={() => s.openNote(verse)} style={[{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingHorizontal: 18, paddingVertical: 16, borderRadius: 18, backgroundColor: theme.card, borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
              <Icon name="note" size={18} color={theme.goldInk} />
              <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: theme.labelPrimary, fontStyle: 'italic' }}>{note}</Text>
              <Icon name="chevron" size={16} color={theme.labelTertiary} />
            </Pressable>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, height: 0.5, backgroundColor: theme.separator }} />
            <Text style={{ fontSize: 12, color: theme.labelTertiary }}>Public domain · WEB / 개역</Text>
            <View style={{ flex: 1, height: 0.5, backgroundColor: theme.separator }} />
          </View>
        </View>
      </ScrollView>
    </OverlayScreen>
  );
}
