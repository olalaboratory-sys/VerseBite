# VerseBite — Migration & Handoff

This document lets a **fresh Claude session (any account)** pick up this project with
full context. The chat that produced it is not transferable, so everything needed is
captured here + in git history.

- **Repo:** `olalaboratory-sys/versebite`  ·  **Branch:** `claude/wonderful-dijkstra-wewotz`
- **Owner email:** soorang.soo@gmail.com
- **What it is:** VerseBite (말씀한입) — a bilingual (EN/KO) daily Bible-verse iOS/Android app,
  React Native + Expo (SDK 54) + TypeScript. Recreated from a high-fidelity HTML/React design
  handoff (kept in `design-reference/` as the source of truth).

## How to continue

**Option A — clone the repo** (has all history):
```bash
git clone <repo> && cd versebite && git checkout claude/wonderful-dijkstra-wewotz
npm install
npx expo start        # i / a / w, or Expo Go via QR
npm run lint          # tsc --noEmit
npm run qc            # 100-persona QC harness -> QC_REPORT.md
```
**Option B — from the git bundle** (offline, full history/logs): `versebite.bundle` is included in
the migration zip. `git clone versebite.bundle versebite && cd versebite && git checkout claude/wonderful-dijkstra-wewotz`.

> The container is ephemeral; `node_modules` is not committed — always `npm install` first.

## Current status (all green)
- `tsc --noEmit` clean; Metro bundles all modules; `expo prebuild` generates native projects; icons/splash/`eas.json` in place.
- 100-persona QC harness: **0 critical / high / medium / low**. Study guides 45/45.
  Difficult-word dictionary coverage — daily verses **EN 100% · KO 95%**, study passages **EN 92% · KO 72%**.
- **Build caveat:** local `expo export` for native fails only at Hermes AOT (`hermesc`) because this
  sandbox ships an ancient `hermesc` (8.0.0svn) that rejects RN 0.81's own `#private` fields
  (`DOMRectReadOnly`). This is environmental — **EAS build servers compile fine**. Dev (Expo Go /
  `expo start`) is unaffected.

## Architecture
```
src/
  theme/      tokens.ts (palette, runtime color-mix, fonts), ThemeProvider (light/dark)
  i18n/       dict.ts (full EN/KO parity), index.tsx (I18nProvider, t, catName)
  data/       content (9 cats · 45 verses · imagery), words (dictionary + EN lemmatizer +
              KO particle/ending stemmer + lookup), daily (deterministic set + signup gating),
              badges (20-badge engine), reflect, studyData (45 guides), order
  store/      AppStore.tsx — single AsyncStorage-backed state machine + all actions + navigation
  components/ Icon (SVG), VBImage, Scrim, CatChip, VerseBody, VerseCard, ActionBar,
              DailyResonance, TabBar, Header, Toast, Sheet, VerseRow, StudyGuideCard,
              PlatformPicker, ui (PlusChip, Button, SegmentedControl, ListRow, overlays…)
  screens/    Onboarding, Today, Calendar, Awards, Saved, Profile, VerseDetail, CategoryDetail,
              StudyGuide, Pricing, History, Journal, ShareEditor, sheets/(Note,Word,Share,Paywall,Unsave)
  services/   ai, studyguide, images, purchases   (all env-gated; graceful fallback)
  utils/      share, notifications, haptics, useReducedMotion
  config.ts   EXPO_PUBLIC_* integration flags
  App.tsx     providers + tab shell + push overlays + sheets + toast + Android back + splash
backend/      Firebase Cloud Functions (Gemini) + Storage/Firestore rules  (see backend/README.md)
qc/           sim.ts — 100-persona QC harness (npm run qc)
scripts/      make-assets.js — brand icon/splash generator (npm run assets)
```

### State model (persisted keys, `vb_*`)
`prefs` (appLang/learningMode/verseOrder/categories/notifications/reminderHour|Minute), `saved`,
`words`, `journal`, `resonance`, `history`, `counts`, `plan`, `signup`, `onboarded`, `today`,
`dark`, `seen` (no-repeat), `daily` (dateKey→verse for past-date archive), `genImages`
(verseId→url), `genGuides` (verseId→AI study guide), `recent` (30-item diversify list).
**App Language ≠ Learning Mode ≠ Verse Order** are three independent axes.

## Backend & paid features (Firebase + Gemini) — `backend/`
One `GEMINI_API_KEY` powers everything; the app calls env-configured HTTPS endpoints, so it is
backend-agnostic. All features degrade gracefully when unset (fallback imagery/authored guides,
AI hidden, sandbox purchases). See `backend/README.md` for deploy steps.

| Env var | Enables |
|---|---|
| `EXPO_PUBLIC_IMAGE_ENDPOINT` | on-demand verse imagery (Imagen) — generate-once → Firebase Storage → re-served; per-verse seed so images never collide; re-viewable by past date |
| `EXPO_PUBLIC_AI_ENDPOINT` | AI reflection question (Gemini) |
| `EXPO_PUBLIC_STUDY_ENDPOINT` | AI study-guide metadata (Gemini), **paid only**, stored & re-served |
| `EXPO_PUBLIC_RC_API_KEY` | RevenueCat in-app purchases |
| `EXPO_PUBLIC_IMAGE_BASE` | optional static CDN fallback |

Functions: `image`, `reflection`, `studyguide`, `rcWebhook` (RevenueCat→Firestore+claim, subscription
source of truth), `dailyReminder` (scheduled FCM). Firestore rule: users read/write only their own
doc; `plan` is server-controlled. Diversification: app sends the last ~30 reflection/key phrasings as
an `avoid` list (shared by reflection+studyguide) so content doesn't repeat day-to-day; past 30 it
allows mild similarity (reuse fine after ~a month).

## Decision log (chronological — the chat's key choices)
1. User uploaded the VerseBite design handoff and said "새로 앱 개발" → chose **React Native + Expo**, "full features at once".
2. Built the entire app from the handoff (data, i18n, store, components, all screens, shell). tsc clean.
3. First push hit **403** (repo write not granted) → user granted the Claude GitHub App write access → pushed.
4. "남은 작업 착수" → user selected all tracks.
5. Authored the remaining **18 study guides** (now 45/45); wired **native share**, **local notifications** (+ reminder time), **native date/time pickers**.
6. Added **config-driven** AI reflection / payments / imagery integration points (initially Supabase Edge Functions + Anthropic).
7. Reworked imagery to **generate on demand as the verse changes** + **no-repeat** verse & image selection (per-verse seed).
8. Persisted the **daily verse per date** + generated images so **past dates re-open** the same verse+image; images stored durably.
9. Added **AI study-guide metadata** generation, stored per verse, **paid users only**.
10. Added **diversification** (30-day avoid list) shared across reflection + study guide.
11. **Deploy-readiness** check → documented hermesc caveat; generated **brand icons/splash** (`scripts/make-assets.js`) and **eas.json**.
12. Login: user chose **Apple + Google + Kakao + email**. Asked why Supabase; then noted they already have a **Gemini key + Firebase account** → **switched backend to Firebase + Gemini** (all AI on one key). Login itself is **NOT built yet** — next step, to use **Firebase Auth**.
13. **Hardened** the Firebase functions (validation, timeouts, runtime opts, cache headers, logging, soft paid-gate) + added **rcWebhook**, **dailyReminder**, **Firestore rules**; verified they compile.
14. Built the **100-persona QC harness**; expanded the **EN dictionary** (26%→86%).
15. Expanded the **KO dictionary** (33%→69%).
16. Refocused the dictionary on **difficult words** (dropped trivial function words) + added an **EN lemmatizer**; verse coverage **EN 100% / KO 95%**.
17. **Polish passes 1–3**: Android hardware back, haptics, reduce-motion, a11y roles/labels + toast screen-reader announce, press feedback, Dynamic-Type cap, image fade-in, toast spring, empty-state icons, splash handoff, onboarding hardware-back.
18. This **migration export**.

## Remaining / next steps
1. **Login (Apple / Google / Kakao / email) via Firebase Auth** — user requested it; not built. Wire
   `@react-native-firebase` or `expo-auth-session` + Firebase Auth; store `uid`; sync user state
   (saved/words/journal/plan) to Firestore `users/{uid}` (rules already written).
2. **Wire the real keys**: deploy `backend/functions` with `GEMINI_API_KEY`, set the three
   `EXPO_PUBLIC_*_ENDPOINT` vars; RevenueCat project + store products + `EXPO_PUBLIC_RC_API_KEY`.
3. **Native build via EAS** (`eas build`) — needs the owner's Apple/Google + EAS accounts.
4. Optional: expose a **9-theme Explore tab** (CategoriesScreen/CategoryDetail exist but are only
   reachable via the Today rail today); deepen KO study-passage dictionary coverage (72%).
5. Replace the Unsplash stand-in imagery once the Gemini pipeline is live.

## Reference
- Design source of truth: `design-reference/` (original HTML/React prototype + README).
- QC snapshot: `QC_REPORT.md`. Backend guide: `backend/README.md`. App guide: `README.md`.
- Full work log = `git log` on `claude/wonderful-dijkstra-wewotz`.
