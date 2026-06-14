# VerseBite — backend & paid-feature integration (Firebase + Gemini)

All AI runs on **Gemini**, hosted on **Firebase Cloud Functions**, with generated
art and study guides stored in **Firebase Storage**. One `GEMINI_API_KEY` powers
everything. The app calls plain HTTPS endpoints (configured by env var), so it is
backend-agnostic — only the URLs change.

Everything **degrades gracefully**: with no endpoints set, AI imagery falls back
to the bundled stand-ins, the study guide uses the 45 authored guides, AI
reflection is hidden, and purchases run in sandbox.

| Env var | Enables | Function |
|---|---|---|
| `EXPO_PUBLIC_IMAGE_ENDPOINT` | On-demand verse imagery (Imagen) | `image` |
| `EXPO_PUBLIC_AI_ENDPOINT` | AI reflection (Gemini) | `reflection` |
| `EXPO_PUBLIC_STUDY_ENDPOINT` | AI study-guide metadata, **paid only** (Gemini) | `studyguide` |
| `EXPO_PUBLIC_RC_API_KEY` | In-app purchases | RevenueCat (separate) |

## Deploy the functions
```bash
cd backend/functions && npm install
firebase login
firebase use <your-project>            # uses your existing Firebase project
firebase functions:secrets:set GEMINI_API_KEY    # paste your Gemini key
firebase deploy --only functions,storage
```
Then set the three `EXPO_PUBLIC_*_ENDPOINT` vars to the deployed URLs
(`https://us-central1-<project>.cloudfunctions.net/<image|reflection|studyguide>`).

## How each works
- **`image`** — generates a cinematic image with Imagen, uploads it to Storage
  (`verse-images/{cat}/{id}.png`) and returns a stable public URL. Later requests
  (any user/device, any **past date** in the Calendar) return the stored image.
  A per-verse `seed` keeps images distinct. Content rules are enforced in the
  prompt: no text/words, no faces or depiction of Jesus, no violence; warm
  cinematic realism.
- **`reflection`** — returns one short bilingual reflection question.
- **`studyguide`** — generates the full bilingual study metadata, stores it
  (`study-guides/{id}.json`), and re-serves it forever. Called only for **paid**
  users (the Study Guide is also paywalled client-side).
- **Diversification** — the app sends the last ~30 reflection/key phrasings as an
  `avoid` list (shared by `reflection` and `studyguide`) so new content steers
  away from recent ones; past 30 it allows mild similarity and old phrasings roll
  off, so reuse is fine after ~a month.

## Why Firebase + Gemini
The design brief named a Supabase/Firebase backend; since the app uses **Gemini**
for images and you already have a **Gemini key + Firebase account**, Firebase keeps
everything in one Google stack with a single key — and Firebase Auth will back the
upcoming login (Apple / Google / Kakao / email).

## Payments — RevenueCat
`src/services/purchases.ts` dynamically loads `react-native-purchases`. To go live:
`npx expo install react-native-purchases`, create products
(`versebite_plus_monthly|yearly`, `versebite_lifetime`) + a RevenueCat project,
then set `EXPO_PUBLIC_RC_API_KEY`.
