import React, { useEffect } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, CormorantGaramond_400Regular, CormorantGaramond_500Medium, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';

import { AppStoreProvider, useStore, StoreValue } from '@/store/AppStore';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { I18nProvider } from '@/i18n';

import { Onboarding } from '@/screens/Onboarding';
import { TodayScreen } from '@/screens/Today';
import { CalendarScreen } from '@/screens/Calendar';
import { AwardsScreen } from '@/screens/Awards';
import { SavedScreen } from '@/screens/Saved';
import { ProfileScreen } from '@/screens/Profile';
import { VerseDetailScreen } from '@/screens/VerseDetail';
import { CategoryDetailScreen } from '@/screens/CategoryDetail';
import { StudyGuideScreen } from '@/screens/StudyGuide';
import { PricingScreen } from '@/screens/Pricing';
import { HistoryScreen } from '@/screens/History';
import { JournalScreen } from '@/screens/Journal';
import { ShareEditorScreen } from '@/screens/ShareEditor';

import { TabBar } from '@/components/TabBar';
import { VBToast } from '@/components/Toast';
import { ScrollScreen } from '@/components/ui';
import { NoteSheet } from '@/screens/sheets/NoteSheet';
import { WordSheet } from '@/screens/sheets/WordSheet';
import { ShareSheet } from '@/screens/sheets/ShareSheet';
import { PaywallSheet } from '@/screens/sheets/PaywallSheet';
import { UnsaveSheet } from '@/screens/sheets/UnsaveSheet';

function TabContent({ s }: { s: StoreValue }) {
  switch (s.tab) {
    case 'today': return <ScrollScreen><TodayScreen /></ScrollScreen>;
    case 'calendar': return <ScrollScreen><CalendarScreen /></ScrollScreen>;
    case 'badges': return <ScrollScreen><AwardsScreen /></ScrollScreen>;
    case 'saved': return <SavedScreen />;
    case 'profile': return <ProfileScreen />;
  }
}

function Overlays({ s }: { s: StoreValue }) {
  const o = s.overlay;
  if (!o) return null;
  switch (o.type) {
    case 'verse': return <VerseDetailScreen verse={o.verse} />;
    case 'cat': return <CategoryDetailScreen cat={o.cat} />;
    case 'study': return <StudyGuideScreen verse={o.verse} />;
    case 'editor': return <ShareEditorScreen verse={o.verse} />;
    case 'pricing': return <PricingScreen />;
    case 'history': return <HistoryScreen />;
    case 'journal': return <JournalScreen />;
  }
}

function Sheets({ s }: { s: StoreValue }) {
  const sh = s.sheet;
  if (!sh) return null;
  switch (sh.type) {
    case 'note': return <NoteSheet verse={sh.verse} order={s.order} initial={s.notesMap[sh.verse.id] || ''} onCancel={() => s.setSheet(null)} onSave={(text) => { s.saveNote(sh.verse.id, text); s.setSheet(null); }} />;
    case 'share': return <ShareSheet verse={sh.verse} order={s.order} isPaid={s.isPaid} imgSrc={s.imageSrc(sh.verse)} onEditor={() => { s.setSheet(null); s.openEditor(sh.verse); }} onClose={() => s.setSheet(null)} onToast={s.showToast} />;
    case 'word': return <WordSheet token={sh.token} lang={sh.lang} saved={s.wordIsSaved(sh.token, sh.lang)} onToggleSave={(w) => s.toggleSaveWord(w)} onClose={() => s.setSheet(null)} />;
    case 'paywall': return <PaywallSheet reason={sh.reason} onChoose={s.choosePlan} onClose={() => s.setSheet(null)} onToast={s.showToast} />;
    case 'unsave': return <UnsaveSheet onConfirm={() => s.confirmUnsave(sh.id)} onCancel={() => s.setSheet(null)} />;
  }
}

function Root() {
  const s = useStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Android hardware back: close sheet → overlay → return to Today before exit.
  useEffect(() => {
    const onBack = () => {
      if (s.sheet) { s.setSheet(null); return true; }
      if (s.overlay) { s.closeOverlay(); return true; }
      if (s.onboarded && s.tab !== 'today') { s.setTab('today'); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [s]);

  if (!s.hydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.goldInk} /></View>;
  }

  if (!s.onboarded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar style="light" />
        <Onboarding onDone={s.finishOnboarding} />
      </View>
    );
  }

  const tabBarH = 50 + Math.max(insets.bottom, 10);
  const lightStatus = theme.dark || (s.overlay?.type === 'verse' || s.overlay?.type === 'cat');

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={lightStatus ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <TabContent s={s} />
      </View>
      <TabBar active={s.tab} onChange={s.setTab} />
      {s.overlay ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: tabBarH }}>
          <Overlays s={s} />
        </View>
      ) : null}
      <Sheets s={s} />
      <VBToast toast={s.toast} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ CormorantGaramond_400Regular, CormorantGaramond_500Medium, CormorantGaramond_600SemiBold });
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        {(store) => (
          <ThemeProvider dark={store.dark}>
            <I18nProvider lang={store.appLang}>
              {fontsLoaded ? <Root /> : <View style={{ flex: 1, backgroundColor: '#F3EADB' }} />}
            </I18nProvider>
          </ThemeProvider>
        )}
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
