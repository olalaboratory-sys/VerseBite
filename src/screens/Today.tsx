import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { mix, serifFamily } from '@/theme/tokens';
import { CATEGORIES, vbVerse } from '@/data/content';
import { Icon } from '@/components/Icon';
import { VerseCard } from '@/components/VerseCard';
import { ActionBar } from '@/components/ActionBar';
import { DailyResonance } from '@/components/DailyResonance';
import { StudyGuideCard } from '@/components/StudyGuideCard';

export function TodayScreen() {
  const theme = useTheme();
  const { t, catName, greeting, formatDate } = useI18n();
  const s = useStore();
  const verse = vbVerse(s.todayId);
  if (!verse) return null;

  return (
    <View style={{ paddingBottom: 30 }}>
      {/* brand row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Icon name="quote" size={18} color={theme.goldInk} />
          <Text style={{ fontSize: 14, fontWeight: '600', letterSpacing: 0.6, color: theme.labelPrimary }}>{t('brand')}</Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: '500', color: theme.labelSecondary }}>{formatDate()}</Text>
      </View>

      {/* greeting */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 }}>
        <Text style={{ fontFamily: serifFamily(600), fontSize: 33, lineHeight: 35, letterSpacing: 0.2, color: theme.labelPrimary }}>{greeting()}.</Text>
        <Text style={{ marginTop: 7, fontSize: 15, lineHeight: 21, color: theme.labelSecondary }}>{t('today.sub')}</Text>
      </View>

      {/* category rail */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        {CATEGORIES.map((c) => {
          const on = c.id === verse.cat;
          return (
            <Pressable key={c.id} onPress={() => s.pickCategory(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 0.5, borderColor: on ? c.tint : theme.hair, backgroundColor: on ? mix(c.tint, theme.card, 22) : theme.card }}>
              <View style={{ width: 7, height: 7, borderRadius: 99, backgroundColor: c.tint, opacity: on ? 1 : 0.45 }} />
              <Text style={{ fontSize: 13, fontWeight: on ? '600' : '500', color: on ? mix(c.tint, '#2A211A', 64) : theme.labelSecondary }}>{catName(c)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 16 }}>
        <Pressable onPress={() => s.openVerse(verse)}>
          <VerseCard verse={verse} layout="editorial" order={s.order} learn={s.learn} onWord={s.onWord} savedWords={s.savedWordSet} />
        </Pressable>

        <View style={{ marginTop: 20 }}>
          <ActionBar
            saved={s.savedSet.has(s.todayId)}
            isPaid={s.isPaid}
            onRefresh={() => s.requirePaid('pw.reasonRefresh', s.refresh)}
            onSave={() => s.toggleSave(s.todayId)}
            onNote={() => s.openNote(verse)}
            onShare={() => s.openShare(verse)}
          />
        </View>

        <View style={{ marginTop: 14 }}>
          <DailyResonance value={s.resonance[s.todayKey]} onPick={s.pickResonance} streak={s.resonanceStreak} />
        </View>

        <View style={{ marginTop: 14 }}>
          <StudyGuideCard isPaid={s.isPaid} onOpen={() => s.openStudy(verse)} onUpgrade={() => s.openPaywall('sg.reason')} />
        </View>

        {!s.isPaid && (
          <Pressable onPress={() => s.openPaywall(null)} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 0.5, borderStyle: 'dashed', borderColor: theme.hair, backgroundColor: theme.fill }}>
            <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: theme.card, borderWidth: 0.5, borderColor: theme.hair, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={16} color={theme.labelTertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.labelSecondary }}>Sponsored</Text>
              <Text style={{ fontSize: 12, color: theme.labelTertiary, marginTop: 2 }}>{t('sub.tryPlus')}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.goldInk }}>Remove</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
