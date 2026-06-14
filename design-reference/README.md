# Handoff: VerseBite — Bilingual Daily Verse App

## Overview
VerseBite (Korean: **말씀한입**) is a bilingual (English/Korean) daily Bible-verse app for iOS. Each day it surfaces one verse per theme, paired with cinematic imagery, and supports spiritual reflection **and** language learning. Core pillars:

- **Daily verse** with bilingual text, cinematic image, save / note / share / refresh.
- **Calendar archive** — revisit any day since signup, with a "Day 1" start marker and attendance stamps.
- **Study Guide** (paid) — full passage, context, key message, storybook-style word glossary, reflection questions + note, gratitude note, prayer.
- **Learning mode** — tap underlined words in the learning-target language for definitions; collect a word archive.
- **Achievements** — 20 MVP badges across 7 groups with a progress engine.
- **Monetization** — Free / Plus / Lifetime; Free has ads + locked refresh; Plus unlocks features (no per-day verse-count difference — **1 verse per theme per day for everyone**).
- **Full EN/KO localization** of all UI chrome, independent of the per-verse learning language.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via in-browser Babel)** — prototypes showing intended look and behavior, **not production code to ship directly**. The task is to **recreate these designs in the target codebase's environment** (the brief targets **React Native / SwiftUI** for iOS, with Supabase/Firebase backend) using its established patterns. If no environment exists yet, choose the most appropriate stack and implement there. Treat the HTML/JSX as the source of truth for layout, tokens, copy, and interaction — re-implement, don't transpile.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy (both languages), and interactions are all specified and implemented. Recreate pixel-faithfully using the codebase's component library. The visual system follows an **iOS Human Interface** style (system chrome, 44pt tap targets, inset-grouped lists, sheets, push transitions) skinned with VerseBite's warm ivory/gold palette.

---

## Information Architecture

5 bottom tabs (tab bar persists on every screen, including pushed overlays):
1. **Today** (오늘) — daily verse card + actions + daily pulse + study guide entry
2. **Calendar** (달력) — month grid archive, signup-gated
3. **Awards** (배지) — achievements
4. **Saved** (저장됨) — saved verses + saved words, search incl. date search
5. **Profile** (프로필) — subscription, language settings, reminder, donate

Onboarding (first run, 5 steps): Welcome → App Language → Learning Mode → Categories → Notification → Plan preview.

Overlays (push from right, reserve bottom 84px so tab bar stays visible & tappable; tapping a tab dismisses any overlay): Verse Detail, Study Guide, Pricing, History, Journal, Share Editor, Category Detail, and Profile drill-in pickers (App Language / Learning Mode / Donate).

---

## Screens / Views

### Onboarding
- **Welcome** — full-bleed cinematic image, dark gradient, serif headline, gold "Get Started".
- **App Language** — pick English / 한국어 (sets entire UI). Drives `window.VB_LANG`.
- **Learning Mode** — Learn English / Learn Korean / Learning off, each with sub-description. Determines which language leads the verse + which words are tappable.
- **Categories** — multi-select chips of the 9 themes.
- **Notification** — enable 8 AM daily reminder.
- **Plan** — Free / Plus / Lifetime cards.
4-dot then 5-step progress; localizes live to chosen app language.

### Today
- Header: brand wordmark (VerseBite / 말씀한입) + localized long date.
- Greeting (time-based) + subtitle.
- Horizontal **category rail** (9 themes, single-language chip; tap to swap the day's verse to that theme).
- **Verse card** (3 layout variants: editorial / fullbleed / stacked — default editorial): cinematic image, category chip, verse in learning-target language on top + other language below, references. Tappable → Verse Detail.
- **Action bar**: Refresh (Plus-locked → paywall for free), Save, Note, Share.
- **Daily Pulse**: "How does this verse meet you today?" + 5 one-tap feeling chips (Comfort/Courage/Grateful/Peace/Challenged) + streak count. Stored per date.
- **Study Guide card** (entry; locked w/ PLUS chip for free).
- Free users: a subtle "Sponsored" upsell row (ad placeholder).

### Verse Detail (push)
Large image + category chip, full bilingual verse body, action bar, Study Guide card, your note (if any). Bottom inset 84px keeps tab bar visible.

### Calendar
- Header subtitle: "{n} days visited" / "{n}일 출석".
- Month grid (prev/next month nav). Day cells:
  - **Locked** (before signup or future): 32% opacity, not tappable.
  - **Day 1** (signup date): gold outline ring + "Day 1 / 시작일" mini-label.
  - **Visited** (app opened that day): soft gold tint + gold check stamp.
  - **Today**: bold + dot (if not visited/selected).
  - **Selected**: solid gold-ink fill, white text.
- Below grid: selected day's verses grouped by theme (1 per theme), each a tappable verse row with save toggle.

### Awards (Achievements)
- **Hero card**: circular SVG progress ring (overall %) with "{n}/{total}" centered, headline "{n} of {total} unlocked" + percent.
- **In Progress**: top 3 nearest-to-earning locked badges as list rows (medallion + name + desc + progress bar + value/target).
- **Groups** (Daily Rhythm, Saved Verses, Reflection, Study Guide, Learning, Sharing, Categories): each a card of list rows; per-group earned count (e.g. 1/4). Row = medallion (gold gradient if earned, muted if locked) + name + description + earned check or progress bar.

### Saved
- Segmented: **Verses** / **Words**.
- Verses: search field (with **calendar icon → native date picker** that fills query with a date; also free-text search), category filter chips, grouped-by-theme cards (newest first), each row with note preview + saved date. Unsaving triggers a **confirmation nudge** sheet (Remove / Keep).
- Words: saved word archive (headword, romanization, translation, definition), remove button.
- Empty states for both.

### Profile
- **Subscription card**: Free → gold upsell block (tap → paywall); Plus/Lifetime → status + Manage.
- **Language section** (drill-in rows): App language ("English ›"), Learning mode ("Learn English ›"). Each opens a push picker (bottom-inset 84px) with checkmarked options + sub-descriptions.
- **Reminder section**: daily reminder toggle, reminder time (8:00 AM).
- **About section**: About, Terms & Privacy.
- **Donate row** (compact): "Support the developer" → push panel with preset amounts ($3/$5/$10/$20) + custom amount field + "Give $X" (one-time).
- User stat card: saved count / word count (localized labels).

### Study Guide (push, Plus)
Sections (collapsible accordions): Selected Verse (image hero) · **Full Passage** (both languages; learning-target line underlines defined words; in-card collapsible "Word meanings / 단어 뜻 보기" glossary list, default collapsed) · **Context** (single = app language) · **Key Message** (numbered) · **Reflection Questions** + your note textarea · **Application Guide** · **Gratitude note** (collapsed) · **Prayer** (collapsed). Scripture follows verse-display order; explanatory prose follows app language; glossary follows learning mode.

### Paywall / Pricing / History / Journal / Share Editor
- **Paywall** sheet: PLUS chip, bilingual headline, 6 feature cards, plan selector (monthly/yearly/lifetime with $ + ₩), Start/Unlock CTA, restore/terms.
- **Pricing** page: 3 plan cards + Free/Plus/Life comparison table.
- **History**: verses you've opened (archive).
- **Journal**: reflection/study/gratitude/note entries.
- **Share Editor** (Plus): 5 templates (Minimal/Cinematic/Letter/Prayer/Bilingual), recipient context, AI "suggest message", language layout, export size (Story/Square/Card), live preview.
- **Note sheet** & **Word sheet** (definition popover with save).

---

## Interactions & Behavior
- **Navigation**: tabs switch instantly and dismiss any open overlay. Overlays push in from right (`vbPush`, .32s, transform-only so they're never invisible if animation is frozen). Sheets slide up. Respect `prefers-reduced-motion`.
- **Refresh** (Plus only): re-picks a verse within the same theme; free users hit the paywall.
- **Save**: toggling save on an already-saved verse opens a confirm nudge before removing.
- **Word tap** (learning mode on): opens definition sheet (headword, romanization for Korean, part of speech, other-language meaning + short definition — definition shown once if it equals the translation), save to word archive.
- **Daily pulse**: one tap records the feeling for today; updates streak.
- **Calendar**: only days in `[signup, today]` are selectable; visited days stamped from `counts.daysOpened`.
- **Badges**: progress derived live from app state (no manual unlock).
- All toasts appear after the action, gently (no blocking popups during reading).

## State Management
Persisted (localStorage in the prototype → use the app's store/DB):
- `prefs`: `{ appLang:'en'|'ko', learningMode:'en'|'ko'|'off', verseOrder:'auto'|'en'|'ko', notifications, categories[] }`
- `saved`: `{ [verseId]: { note, savedAt, ts, guide } }`
- `words`: `{ ['en'|'ko'+':'+headword]: { headword, lang, def, trans, roman, savedAt, ts } }`
- `journal`: `{ [verseId]: { reflection, study, gratitude, ts, date } }`
- `resonance`: `{ [dateKey]: feelingId }`
- `history`: `[{ id, ts, date, source }]`
- `counts`: `{ opens, studyOpens, shares, refreshes, daysOpened[], morningDays[], bilingualDays[], streak }`
- `plan`: `'free'|'plus'|'lifetime'`, `signup`: dateKey, `onboarded`, `today`: `{date,id}`
- **App Language ≠ Learning Mode ≠ Verse Order** — three independent axes. `window.VB_LANG` drives the `t()` UI dictionary.

## Design Tokens
**Palette (light / dark):**
- bg `#F3EADB` / `#171411`; card `#FBF6EE` / `#221C18`
- gold (decorative) `#C9A45C`; gold-ink (interactive) light `#A8762F`, dark `#D8B978`
- label primary `#25221F` / `#F4E9D8`; warm dark brown `#3A2F28`
- secondary accents: sage `#9FAF98`, dusty rose `#CFA6A0`, mist blue `#A8B7C7`, clay `#A97C5B`
- alpha tokens for label/fill/separator; warm shadows (`0 14px 34px rgba(58,42,24,0.13)`)
**Type:** English serif = Cormorant Garamond (verses) / Playfair Display / Georgia; Korean = Noto Serif KR / Noto Sans KR; UI = Geist (iOS SF substitute). Large title 34px, verse 21–25px (never below 24px on hero), min UI 11px.
**Radius:** cards 18–24px, sheets 26px top, pills 999, controls 8–14px. **Tap target ≥44px.** Status bar 54px, home indicator 34px.
**Categories (9):** friendship/우정, love/사랑, family/가족, motivation/동기부여, faith/믿음, forgiveness/용서, gratitude/감사, hope/소망, wisdom/지혜 — each with tint, gradient, EN/KO core message.

## Assets
- **Verse images**: Unsplash CDN stand-ins (warm cinematic) keyed per category in `vb-data.jsx` `VB_IMAGES`. **Replace with system-generated AI images** per the brief (no text, no explicit Jesus, no violence; cinematic realism). A per-category gradient fallback sits beneath every image.
- **Icons**: inline SVG stroke set (`VBIcon` in `vb-data.jsx`) — thin, rounded. Map to SF Symbols / your icon set in native.
- **Fonts**: Google Fonts (Cormorant Garamond, Playfair Display, Noto Serif/Sans KR) + Geist via design-system tokens.

## Content / Data
- **45 verses** (9 themes × 5), public-domain EN (WEB/KJV-style) + KO (개역). Fields: id, refEn/refKo, en, ko, cat, angle, img — in `vb-data.jsx` `VB_VERSES`.
- **Study guides**: 27/45 authored (`vb-study-data.jsx`) — passage, context, key message per verse + reflection/application/journal/prayer per category. **Remaining 18 (v28–v45) fall back to "coming soon"** — author these before launch.
- **Word dictionary** (`vb-words.jsx`): ~170 EN + ~70 KO entries with KO definitions for EN words and EN for KO. Korean coverage is lighter (conjugation matching) — expand for parity.
- **i18n** (`vb-i18n.jsx`): full EN/KO key parity.

## Known gaps before production (from QC)
1. Author 18 remaining study guides (v28–v45).
2. Expand Korean word dictionary + stemming for learning-mode parity.
3. Wire real backends: payments (Plus/Lifetime/donate), 8 AM notifications, AI image pipeline, AI reflection, Kakao/SNS share.
4. Tokenize the brand palette (currently raw hex) into the codebase's design tokens.
5. Precompile (prototype uses in-browser Babel).

## Files (design reference)
- `VerseBite.html` — shell: fonts, iOS design-system bundle, script load order, viewport scaling, word-highlight CSS.
- `vb-data.jsx` — categories, 45 verses, image map, `VBIcon` set, helpers.
- `vb-i18n.jsx` — EN/KO dictionary + `t()`, `vbCatName`, localized date/greeting.
- `vb-words.jsx` — bilingual dictionary, tokenizer, lookup.
- `vb-shared.jsx` — VerseCard, ActionBar, DailyResonance, VBTabBar, VBHeader, CatChip, VBImage, toast.
- `vb-onboarding.jsx` — 5-step onboarding.
- `vb-screens-main.jsx` — Today, Category Detail, VerseRow.
- `vb-screens-lib.jsx` — Saved, Profile (+ pickers, Donate), Verse Detail, Note/Word/Share sheets, unsave nudge.
- `vb-premium.jsx` — Paywall, Pricing, Share Editor, History, Journal, reflection card, PlusChip.
- `vb-study-data.jsx` / `vb-study.jsx` — study-guide content + screen/card.
- `vb-daily.jsx` — deterministic daily-set generator + signup/date helpers.
- `vb-calendar.jsx` — calendar archive (Day 1 marker, attendance stamps).
- `vb-badges.jsx` — 20 badges + progress engine + Achievements screen.
