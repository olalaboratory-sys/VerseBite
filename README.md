# VerseBite (말씀한입)

A bilingual (English / Korean) daily Bible-verse app for iOS, built with **React Native + Expo (SDK 54) + TypeScript**. Recreated from the high-fidelity design handoff — warm ivory/gold iOS-style visual system, with daily verses, a calendar archive, a study guide, learning mode, achievements, and a Free / Plus / Lifetime monetization layer.

## Stack
- **Expo SDK 54**, React Native 0.81, React 19, TypeScript
- `react-native-svg` (icon set + progress rings), `expo-linear-gradient` (gradients/scrims)
- `@react-native-async-storage/async-storage` (persistence)
- `react-native-safe-area-context` (insets)
- Cormorant Garamond (English serif) via `@expo-google-fonts`; Korean & UI use the system font

## Run
```bash
npm install
npx expo start            # then press i (iOS), a (Android), or w (web)
npm run lint              # tsc --noEmit
```
> Outbound access to Expo's version API may be restricted in some sandboxes; dependencies are pinned to SDK-54-compatible versions so `npm install` works offline-of-that-API.

## Architecture
```
src/
  theme/       tokens.ts (palette, color-mix, fonts), ThemeProvider (light/dark)
  i18n/        dict.ts (full EN/KO parity), index.tsx (I18nProvider, t, catName)
  data/        content (9 categories · 45 verses · imagery), words (dictionary +
               tokenizer + lookup), daily (deterministic daily set + signup gating),
               badges (20-badge progress engine), reflect, studyData (27 guides), order
  store/       AppStore.tsx — single state machine (persisted state + actions +
               navigation), AsyncStorage-backed, mirrors the prototype's vb-app shell
  components/  Icon, VBImage, Scrim, CatChip, VerseBody, VerseCard, ActionBar,
               DailyResonance, TabBar, Header, Toast, Sheet, VerseRow, StudyGuideCard,
               ui (PlusChip, Button, SegmentedControl, ListSection/Row, Switch, overlays)
  screens/     Onboarding, Today, Calendar, Awards, Saved, Profile, VerseDetail,
               CategoryDetail, StudyGuide, Pricing, History, Journal, ShareEditor,
               sheets/ (Note, Word, Share, Paywall, Unsave)
  App.tsx      providers + tab shell + push overlays + bottom sheets + toast
```

### State model (persisted via AsyncStorage)
`prefs` (appLang / learningMode / verseOrder / categories / notifications), `saved`,
`words`, `journal`, `resonance`, `history`, `counts` (opens/streak/morning/bilingual…),
`plan`, `signup`, `onboarded`, `today`, `dark`. **App Language ≠ Learning Mode ≠ Verse
Order** are three independent axes, exactly as specified in the handoff.

## Implemented
- 5 tabs (Today · Calendar · Awards · Saved · Profile) with persistent tab bar over pushed overlays
- Onboarding (Welcome → App Language → Learning Mode → Categories → Notification → Plan)
- Daily verse card, category rail, action bar, Daily Pulse (feelings + streak), Study Guide entry
- Calendar archive with Day-1 marker + attendance stamps, signup/future gating
- Achievements (progress ring, in-progress, 7 groups, live progress)
- Saved verses (search + category filter + unsave nudge) and saved words
- Study Guide (passage glossary, context, key message, reflection note, application, gratitude, prayer)
- Paywall / Pricing / History / Journal / Share Editor; word & note sheets
- Full EN/KO localization + light/dark theme

## Known gaps before production (carried from the handoff QC)
1. ~~Author the remaining 18 study guides~~ ✅ all 45 verses now have a full study guide.
2. Expand the Korean word dictionary + stemming for learning-mode parity.
3. Wire real backends: payments (IAP/RevenueCat), 8 AM notifications (expo-notifications), AI image pipeline, AI reflection. ✅ native verse sharing now uses the OS share sheet.
4. Replace Unsplash stand-in imagery with the AI image pipeline.
5. Native date picker for the Saved date search (currently free-text).
