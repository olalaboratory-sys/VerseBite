import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n, fill } from '@/i18n';
import { mix } from '@/theme/tokens';
import { dateKey, dailyAll, FREE_PER_CAT } from '@/data/daily';
import { vbVerse } from '@/data/content';
import { Icon } from '@/components/Icon';
import { VBHeader } from '@/components/Header';
import { VerseRow } from '@/components/VerseRow';

export function CalendarScreen() {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const s = useStore();
  const todayKey = dateKey();
  const signup = s.signup;
  const daysOpened = s.counts.daysOpened || [];
  const [sel, setSel] = useState(todayKey);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  const loc = lang === 'ko' ? 'ko-KR' : 'en-US';
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  const dow = lang === 'ko' ? ['일', '월', '화', '수', '목', '금', '토'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const startDow = new Date(cursor.y, cursor.m, 1).getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const keyFor = (d: number) => dateKey(new Date(cursor.y, cursor.m, d));
  const locked = (k: string) => k < signup || k > todayKey;
  const visited = new Set(daysOpened);

  const prevMonth = () => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }));
  const nextMonth = () => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }));

  const selLocked = locked(sel);
  const sets = selLocked ? [] : dailyAll(sel, FREE_PER_CAT).filter((x) => x.verseIds.length);
  const [sy, sm, sd] = sel.split('-').map(Number);
  const selLabel = new Date(sy, sm - 1, sd).toLocaleDateString(loc, { weekday: 'long', month: 'long', day: 'numeric' });

  const navBtn = { width: 34, height: 34, borderRadius: 99, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: theme.fill };

  return (
    <View style={{ paddingBottom: 30 }}>
      <VBHeader kicker={t('cal.kicker')} title={t('cal.title')} subtitle={fill(t('cal.attendance'), { n: visited.size })} />

      {/* month grid */}
      <View style={[{ marginHorizontal: 16, marginTop: 8, backgroundColor: theme.card, borderRadius: 20, borderWidth: 0.5, borderColor: theme.hair, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 16 }, theme.shadowSm]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Pressable onPress={prevMonth} style={navBtn}><Icon name="back" size={18} color={theme.labelSecondary} /></Pressable>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.labelPrimary }}>{monthLabel}</Text>
          <Pressable onPress={nextMonth} style={[navBtn, { transform: [{ scaleX: -1 }] }]}><Icon name="back" size={18} color={theme.labelSecondary} /></Pressable>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {dow.map((w, i) => (<Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: theme.labelTertiary, paddingVertical: 4 }}>{w}</Text>))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((d, i) => {
            if (d === null) return <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
            const k = keyFor(d);
            const isLocked = locked(k);
            const isSel = k === sel;
            const isToday = k === todayKey;
            const start = k === signup;
            const vis = visited.has(k);
            return (
              <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 1 }}>
                <Pressable disabled={isLocked} onPress={() => setSel(k)} style={{
                  flex: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
                  borderWidth: !isSel && start ? 1.5 : 0, borderColor: theme.goldInk,
                  backgroundColor: isSel ? theme.goldInk : vis && !isLocked ? mix(theme.gold, 'rgba(0,0,0,0)', 16) : 'transparent',
                  opacity: isLocked ? 0.32 : 1,
                }}>
                  <Text style={{ fontSize: start ? 13 : 14, fontWeight: isSel || isToday || start ? '600' : '400', color: isSel ? '#fff' : isLocked ? theme.labelTertiary : theme.labelPrimary }}>{d}</Text>
                  {start ? <Text style={{ position: 'absolute', bottom: 2, fontSize: 7.5, fontWeight: '700', color: isSel ? 'rgba(255,255,255,0.9)' : theme.goldInk }}>{t('cal.start')}</Text> : null}
                  {!start && vis && !isSel ? <View style={{ position: 'absolute', bottom: 3 }}><Icon name="check" size={9} color={theme.goldInk} strokeWidth={3} /></View> : null}
                  {isToday && !isSel && !vis && !start ? <View style={{ position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 99, backgroundColor: theme.goldInk }} /> : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* selected day's verses */}
      <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="calendar" size={16} color={theme.goldInk} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.labelPrimary }}>{selLabel}</Text>
        </View>
        {selLocked ? (
          <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30 }}>
            <View style={{ marginBottom: 12, opacity: 0.6 }}><Icon name="calendar" size={30} color={theme.labelTertiary} /></View>
            <Text style={{ fontSize: 14.5, lineHeight: 22, color: theme.labelTertiary, textAlign: 'center' }}>{sel > todayKey ? t('cal.future') : t('cal.beforeSignup')}</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {(() => {
              const recorded = s.daily[sel];
              const base = sets.flatMap((x) => x.verseIds);
              return recorded ? [recorded, ...base.filter((id) => id !== recorded)] : base;
            })().map((id) => {
              const v = vbVerse(id);
              if (!v) return null;
              return (
                <View key={id} style={[{ borderRadius: 18, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
                  <VerseRow verse={v} order={s.order} saved={s.savedSet.has(id)} imgSrc={s.imageSrc(v)} onOpen={() => s.openVerse(v)} onToggleSave={s.toggleSave} />
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
