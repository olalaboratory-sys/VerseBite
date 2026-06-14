import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { CATEGORIES } from '@/data/content';
import { Icon } from '@/components/Icon';
import { VBHeader } from '@/components/Header';
import { VerseRow } from '@/components/VerseRow';
import { SegmentedControl, ScrollScreen } from '@/components/ui';
import { PlatformPicker } from '@/components/PlatformPicker';

function SearchField({ value, onChange, placeholder, onCalendar }: { value: string; onChange: (v: string) => void; placeholder: string; onCalendar: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 38, paddingHorizontal: 12, borderRadius: 12, backgroundColor: theme.fill, borderWidth: 0.5, borderColor: theme.hair }}>
      <Icon name="search" size={17} color={theme.labelTertiary} />
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={theme.labelTertiary} style={{ flex: 1, fontSize: 16, color: theme.labelPrimary, padding: 0 }} />
      {value ? <Pressable onPress={() => onChange('')} hitSlop={8}><Icon name="close" size={16} color={theme.labelTertiary} /></Pressable> : null}
      <Pressable onPress={onCalendar} hitSlop={8}><Icon name="calendar" size={17} color={theme.goldInk} /></Pressable>
    </View>
  );
}

export function SavedScreen() {
  const theme = useTheme();
  const { t, catName } = useI18n();
  const s = useStore();
  const [view, setView] = useState<'verses' | 'words'>('verses');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDate, setShowDate] = useState(false);

  let list = s.savedList;
  if (filter !== 'all') list = list.filter((x) => x.verse.cat === filter);
  if (q.trim()) {
    const qq = q.toLowerCase();
    list = list.filter((x) => (x.verse.en + x.verse.ko + x.verse.refEn + x.verse.refKo + (x.note || '') + (x.savedAt || '')).toLowerCase().includes(qq));
  }
  let wordList = s.savedWordsList;
  if (q.trim()) {
    const qq = q.toLowerCase();
    wordList = wordList.filter((w) => ((w.headword || '') + (w.trans || '') + (w.def || '') + (w.roman || '') + (w.savedAt || '')).toLowerCase().includes(qq));
  }
  const catsWithSaved = CATEGORIES.filter((c) => s.savedList.some((x) => x.verse.cat === c.id));
  const filters = [{ id: 'all', label: t('saved.all') }, ...catsWithSaved.map((c) => ({ id: c.id, label: catName(c) }))];

  const Empty = ({ icon, title, sub }: { icon: 'bookmark' | 'globe'; title: string; sub: string }) => (
    <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
      <View style={{ width: 78, height: 78, borderRadius: 24, backgroundColor: theme.fill, borderWidth: 0.5, borderColor: theme.hair, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon name={icon} size={34} color={theme.goldInk} />
      </View>
      <Text style={{ fontFamily: serifFamily(600), fontSize: 23, color: theme.labelPrimary, textAlign: 'center' }}>{title}</Text>
      <Text style={{ marginTop: 9, fontSize: 15, lineHeight: 22, color: theme.labelSecondary, textAlign: 'center' }}>{sub}</Text>
    </View>
  );

  return (
    <>
    <ScrollScreen>
      <VBHeader title={t('h.saved')} subtitle={`${s.savedList.length} ${s.savedList.length === 1 ? t('count.verse') : t('count.verses')} · ${s.savedWordsList.length} ${s.savedWordsList.length === 1 ? t('count.word') : t('count.words')}`} />
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 }}>
        <SegmentedControl value={view} onChange={setView} options={[{ value: 'verses', label: t('saved.verses') }, { value: 'words', label: t('saved.words') }]} />
      </View>

      {view === 'verses' ? (
        s.savedList.length === 0 ? <Empty icon="bookmark" title={t('saved.noVerses')} sub={t('saved.noVersesSub')} /> : (
          <>
            <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
              <SearchField value={q} onChange={setQ} placeholder={t('saved.searchDate')} onCalendar={() => setShowDate(true)} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
              {filters.map((f) => {
                const on = filter === f.id;
                return (
                  <Pressable key={f.id} onPress={() => setFilter(f.id)} style={{ paddingVertical: 8, paddingHorizontal: 15, borderRadius: 999, borderWidth: 0.5, borderColor: theme.hair, backgroundColor: on ? theme.goldInk : theme.card }}>
                    <Text style={{ fontSize: 13, fontWeight: on ? '600' : '500', color: on ? '#fff' : theme.labelSecondary }}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={{ paddingHorizontal: 16 }}>
              {list.length === 0 ? <Text style={{ textAlign: 'center', color: theme.labelTertiary, fontSize: 15, paddingVertical: 40 }}>{t('saved.noMatches')}</Text> : (
                <View style={{ gap: 10 }}>
                  {list.map((x) => (
                    <View key={x.verse.id} style={[{ borderRadius: 18, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
                      <VerseRow verse={x.verse} order={s.order} saved note={x.note} savedDate={x.savedAt} guide={x.guide} onOpen={() => s.openVerse(x.verse)} onToggleSave={s.toggleSave} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )
      ) : (
        s.savedWordsList.length === 0 ? <Empty icon="globe" title={t('saved.noWords')} sub={s.learn !== 'off' ? t('saved.noWordsSub') : t('saved.noWordsOff')} /> : (
          <>
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <SearchField value={q} onChange={setQ} placeholder={t('saved.searchDate')} onCalendar={() => setShowDate(true)} />
            </View>
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              {wordList.length === 0 ? <Text style={{ textAlign: 'center', color: theme.labelTertiary, fontSize: 15, paddingVertical: 30 }}>{t('saved.noMatches')}</Text> : null}
              {wordList.map((w) => (
                <View key={w.key} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: theme.card, borderRadius: 16, borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={{ fontFamily: w.lang === 'en' ? serifFamily(600) : undefined, fontWeight: '600', fontSize: 21, color: theme.labelPrimary }}>{w.headword}</Text>
                      {w.roman ? <Text style={{ fontSize: 12, color: theme.labelTertiary, fontStyle: 'italic' }}>{w.roman}</Text> : null}
                      <Text style={{ marginLeft: 'auto', fontSize: 13, fontWeight: '600', color: theme.goldInk }}>{w.trans || '—'}</Text>
                    </View>
                    {w.def && w.def !== w.trans ? <Text style={{ fontSize: 13.5, lineHeight: 19, color: theme.labelSecondary, marginTop: 6 }}>{w.def}</Text> : null}
                    {w.savedAt ? <Text style={{ fontSize: 11, fontWeight: '500', color: theme.labelTertiary, marginTop: 8 }}>{t('saved.savedOn')} {w.savedAt}</Text> : null}
                  </View>
                  <Pressable onPress={() => s.removeWord(w.key)} style={{ width: 32, height: 32, borderRadius: 99, backgroundColor: theme.fill, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" size={16} color={theme.labelTertiary} />
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )
      )}
    </ScrollScreen>
    <PlatformPicker visible={showDate} mode="date" value={new Date()} onConfirm={(d) => { setQ(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })); setShowDate(false); }} onCancel={() => setShowDate(false)} />
    </>
  );
}
