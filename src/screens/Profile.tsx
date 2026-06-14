import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n, LEARN_LABEL, fill } from '@/i18n';
import { serifFamily, GOLD_DEEP } from '@/theme/tokens';
import { vbCategory } from '@/data/content';
import { Icon } from '@/components/Icon';
import { VBHeader } from '@/components/Header';
import { ListSection, ListRow, Switch, PlusChip, ScrollScreen, OverlayScreen, OverlayHeader, Button } from '@/components/ui';
import { PlatformPicker, formatTime } from '@/components/PlatformPicker';

type Panel = null | 'applang' | 'learn' | 'donate';

export function ProfileScreen() {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const s = useStore();
  const [panel, setPanel] = useState<Panel>(null);
  const [showTime, setShowTime] = useState(false);
  const reminderDate = new Date();
  reminderDate.setHours(s.prefs.reminderHour ?? 8, s.prefs.reminderMinute ?? 0, 0, 0);
  const learnLabel = t(LEARN_LABEL[s.learn] || 'learn.en');
  const appLangLabel = s.appLang === 'ko' ? '한국어' : 'English';
  const tint = (id: string) => vbCategory(id)!.tint;

  if (panel === 'applang' || panel === 'learn') {
    const isLang = panel === 'applang';
    const options = isLang
      ? [{ id: 'en', title: 'English', sub: t('lang.en.sub') }, { id: 'ko', title: '한국어', sub: t('lang.ko.sub') }]
      : [{ id: 'en', title: t('learn.en'), sub: t('learn.en.sub') }, { id: 'ko', title: t('learn.ko'), sub: t('learn.ko.sub') }, { id: 'off', title: t('learn.off'), sub: t('learn.off.sub') }];
    const value = isLang ? s.appLang : s.learn;
    return (
      <OverlayScreen animateKey={panel}>
        <OverlayHeader title={isLang ? t('lang.pick') : t('learn.pick')} onBack={() => setPanel(null)} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 36 }}>
          <ListSection>
            {options.map((o) => (
              <ListRow key={o.id} icon="sparkle" iconBg={tint('faith')} title={o.title} subtitle={o.sub}
                accessory={value === o.id ? 'check' : 'none'}
                onPress={() => { if (isLang) s.setAppLang(o.id as 'en' | 'ko'); else s.setLearn(o.id as 'en' | 'ko' | 'off'); setPanel(null); }} />
            ))}
          </ListSection>
        </ScrollView>
      </OverlayScreen>
    );
  }
  if (panel === 'donate') return <DonatePanel onBack={() => setPanel(null)} />;

  return (
    <>
    <ScrollScreen>
      <VBHeader title={t('h.profile')} />

      {/* user card */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 22 }}>
        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, backgroundColor: theme.card, borderRadius: 20, borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
          <LinearGradient colors={[theme.gold, GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 60, height: 60, borderRadius: 99, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: serifFamily(600), fontSize: 24, color: '#fff' }}>은</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: '600', letterSpacing: -0.3, color: theme.labelPrimary }}>Grace Eun</Text>
            <Text style={{ fontSize: 14, color: theme.labelSecondary, marginTop: 3 }}>{learnLabel}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, paddingLeft: 12, borderLeftWidth: 0.5, borderLeftColor: theme.hair }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: serifFamily(600), fontSize: 22, color: theme.goldInk }}>{s.savedList.length}</Text>
              <Text style={{ fontSize: 10, fontWeight: '500', color: theme.labelTertiary, marginTop: 4 }}>{t('unit.verses')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: serifFamily(600), fontSize: 22, color: theme.goldInk }}>{s.savedWordsList.length}</Text>
              <Text style={{ fontSize: 10, fontWeight: '500', color: theme.labelTertiary, marginTop: 4 }}>{t('unit.words')}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* subscription */}
        {s.plan === 'free' ? (
          <Pressable onPress={() => s.openPaywall(null)} style={{ marginBottom: 22 }}>
            <LinearGradient colors={['#2A2017', '#4A3A26']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ borderRadius: 20, padding: 20 }, theme.shadow]}>
              <PlusChip size="md" />
              <Text style={{ marginTop: 12, fontFamily: serifFamily(600), fontSize: 21, lineHeight: 25, color: '#F4E9D8' }}>{t('sub.quietDeep')}</Text>
              <Text style={{ marginTop: 7, marginBottom: 14, fontSize: 13.5, lineHeight: 20, color: 'rgba(244,233,216,0.7)' }}>{t('sub.quietDeepSub')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: theme.gold }}>
                <Text style={{ color: '#2A2017', fontSize: 14, fontWeight: '600' }}>{t('sub.tryPlus')}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 22, borderRadius: 20, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.gold }, theme.shadowSm]}>
            <LinearGradient colors={[theme.gold, GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={22} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.labelPrimary }}>{s.plan === 'lifetime' ? t('brandLifetime') : t('brandPlus')}</Text>
              <Text style={{ fontSize: 13, color: theme.labelSecondary, marginTop: 3 }}>{s.plan === 'lifetime' ? t('sub.lifetime') : t('sub.active')}</Text>
            </View>
            <Pressable onPress={() => s.showToast({ text: 'row.manage', icon: 'gear' })} style={{ backgroundColor: theme.fill, borderRadius: 99, paddingVertical: 9, paddingHorizontal: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.goldInk }}>{t('row.manage')}</Text>
            </Pressable>
          </View>
        )}

        <ListSection header={t('sec.language')} footer={t('language.footer')}>
          <ListRow icon="globe" iconBg={theme.goldInk} title={t('row.appLanguage')} value={appLangLabel} accessory="chevron" onPress={() => setPanel('applang')} />
          <ListRow icon="sparkle" iconBg={tint('faith')} title={t('row.learningMode')} value={learnLabel} accessory="chevron" onPress={() => setPanel('learn')} />
        </ListSection>

        <ListSection header={t('sec.library')}>
          <ListRow icon="quote" iconBg={tint('gratitude')} title={t('row.plans')} accessory="chevron" onPress={() => s.setOverlay({ type: 'pricing' })} />
          <ListRow icon="today" iconBg={tint('hope')} title={t('row.verseHistory')} accessory="chevron" onPress={() => s.requirePaid('pw.reasonHistory', () => s.setOverlay({ type: 'history' }))} />
          <ListRow icon="note" iconBg={tint('love')} title={t('row.journal')} accessory="chevron" onPress={() => s.requirePaid('pw.reasonJournal', () => s.setOverlay({ type: 'journal' }))} />
        </ListSection>

        <ListSection header={t('sec.reminder')} footer={t('reminder.footer')}>
          <ListRow icon="bell" iconBg={tint('motivation')} title={t('row.dailyReminder')} trailing={<Switch checked={s.prefs.notifications} onChange={(v) => s.setPrefs((p) => ({ ...p, notifications: v }))} />} />
          <ListRow icon="today" iconBg={tint('hope')} title={t('row.reminderTime')} value={formatTime(s.prefs.reminderHour ?? 8, s.prefs.reminderMinute ?? 0, lang)} accessory="chevron" onPress={() => setShowTime(true)} />
        </ListSection>

        <ListSection header={t('sec.appearance')}>
          <ListRow icon="moon" iconBg={tint('faith')} title={t('row.darkTheme')} trailing={<Switch checked={s.dark} onChange={s.setDark} />} />
        </ListSection>

        <ListSection header={t('sec.about')} footer={t('brand') + ' v2'}>
          <ListRow icon="sparkle" iconBg={tint('gratitude')} title={t('row.about')} accessory="chevron" onPress={() => s.showToast({ text: 'brand', icon: 'sparkle' })} />
          <ListRow icon="check" iconBg={tint('forgiveness')} title={t('row.terms')} accessory="chevron" onPress={() => s.showToast({ text: 'row.terms', icon: 'check' })} />
          <ListRow icon="refresh" iconBg={tint('motivation')} title={t('row.replay')} accessory="chevron" onPress={s.replayOnboarding} />
        </ListSection>

        {/* donate */}
        <Pressable onPress={() => setPanel('donate')} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, backgroundColor: theme.card, borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
          <LinearGradient colors={[theme.gold, GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart" size={17} color="#fff" fill />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.labelPrimary }}>{t('donate.title')}</Text>
            <Text style={{ fontSize: 12.5, color: theme.labelSecondary, marginTop: 2 }}>{t('donate.short')}</Text>
          </View>
          <Icon name="chevron" size={16} color={theme.labelTertiary} />
        </Pressable>
      </View>
    </ScrollScreen>
    <PlatformPicker
      visible={showTime}
      mode="time"
      value={reminderDate}
      onConfirm={(d) => { s.setPrefs((p) => ({ ...p, reminderHour: d.getHours(), reminderMinute: d.getMinutes() })); setShowTime(false); }}
      onCancel={() => setShowTime(false)}
    />
    </>
  );
}

function DonatePanel({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  const s = useStore();
  const [amt, setAmt] = useState('5');
  const presets = ['3', '5', '10', '20'];
  const valid = parseFloat(amt) > 0;
  return (
    <OverlayScreen animateKey="donate">
      <OverlayHeader title={t('donate.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36 }}>
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 18 }}>
          <LinearGradient colors={[theme.gold, GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 64, height: 64, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart" size={32} color="#fff" fill />
          </LinearGradient>
        </View>
        <Text style={{ marginBottom: 22, textAlign: 'center', fontSize: 14.5, lineHeight: 22, color: theme.labelSecondary }}>{t('donate.body')}</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase', color: theme.labelSecondary, marginBottom: 10 }}>{t('donate.choose')}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {presets.map((a) => {
            const on = amt === a;
            return (
              <Pressable key={a} onPress={() => setAmt(a)} style={{ flex: 1, height: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? theme.goldInk : theme.card, borderWidth: on ? 0 : 1, borderColor: theme.goldInk }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: on ? '#fff' : theme.goldInk }}>${a}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, paddingHorizontal: 16, borderRadius: 13, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.hair, marginBottom: 22 }}>
          <Text style={{ fontSize: 19, fontWeight: '600', color: theme.labelSecondary }}>$</Text>
          <TextInput value={amt} onChangeText={(v) => setAmt(v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder={t('donate.custom')} placeholderTextColor={theme.labelTertiary} style={{ flex: 1, fontSize: 19, fontWeight: '600', color: theme.labelPrimary, padding: 0 }} />
        </View>
        <Pressable disabled={!valid} onPress={() => { onBack(); s.showToast({ text: 'donate.thanks', icon: 'heart' }); }} style={{ height: 52, borderRadius: 14, backgroundColor: theme.goldInk, opacity: valid ? 1 : 0.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <Icon name="heart" size={18} color="#fff" fill />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{valid ? fill(t('donate.give'), { amt: '$' + amt }) : t('donate.cta')}</Text>
        </Pressable>
        <Text style={{ marginTop: 14, textAlign: 'center', fontSize: 11.5, color: theme.labelTertiary }}>{t('donate.onetime')}</Text>
      </ScrollView>
    </OverlayScreen>
  );
}
