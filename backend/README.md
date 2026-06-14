# VerseBite — backend & paid-feature integration

The app ships with clean integration points that **degrade gracefully**: with no
keys configured, AI reflection is hidden, purchases resolve in sandbox mode, and
imagery falls back to the bundled Unsplash stand-ins. Set the env vars below
(in `.env` / EAS secrets, all `EXPO_PUBLIC_`-prefixed so they inline into the app)
to switch each on.

| Env var | Enables | Service |
|---|---|---|
| `EXPO_PUBLIC_AI_ENDPOINT` | AI reflection (`src/services/ai.ts`) | `reflection/` Edge Function |
| `EXPO_PUBLIC_RC_API_KEY` | In-app purchases (`src/services/purchases.ts`) | RevenueCat |
| `EXPO_PUBLIC_IMAGE_ENDPOINT` | On-demand AI verse imagery (`src/services/images.ts`) | `image/` Edge Function (Gemini/Imagen) |
| `EXPO_PUBLIC_IMAGE_BASE` | Optional static/pre-rendered imagery fallback | any CDN |
| `EXPO_PUBLIC_STUDY_ENDPOINT` | AI study-guide metadata, **paid only** (`src/services/studyguide.ts`) | `studyguide/` Edge Function (Claude) |

## 1. AI reflection (`reflection/index.ts`)
Supabase Edge Function that proxies to the Anthropic Messages API so the key
never ships in the client. The "Suggest with AI" button in the Study Guide calls
`EXPO_PUBLIC_AI_ENDPOINT` and falls back to the authored static question on any
error. Uses `claude-haiku-4-5` (a short question is a light task).

**Diversification:** the app sends the last ~30 reflection/key phrasings as an
`avoid` list (shared between the reflection and study-guide prompts) so new
content steers away from recent ones; once the list passes 30 the prompt allows
mild similarity, and older phrasings roll off so reuse is fine after ~a month.

```bash
supabase functions deploy reflection --no-verify-jwt
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# then: EXPO_PUBLIC_AI_ENDPOINT=https://<project>.functions.supabase.co/reflection
```

## 2. Payments — RevenueCat
`src/services/purchases.ts` dynamically loads `react-native-purchases` (so the
app still runs in Expo Go without it). To go live:

```bash
npx expo install react-native-purchases   # then build a dev/standalone client
```
- Create products in App Store Connect / Play Console and a RevenueCat project.
- Map product ids in `RC_PRODUCTS` (`versebite_plus_monthly|yearly`, `versebite_lifetime`).
- Set `EXPO_PUBLIC_RC_API_KEY`. `choosePlan` and Restore then run the real flow;
  `plan` should ultimately be derived from the active entitlement.

## 3. AI image generation (`image/index.ts`)
Images are generated **on demand** as the verse changes (daily pick / refresh),
not pre-rendered. The app shows the gradient/stand-in instantly, then calls
`EXPO_PUBLIC_IMAGE_ENDPOINT` and fades in the generated art; results are cached
per verse so each verse keeps a distinct image (and a unique `seed` is sent so
two verses never collide).

```bash
supabase functions deploy image --no-verify-jwt
supabase secrets set GEMINI_API_KEY=AIza...
# create a PUBLIC storage bucket named "verse-images"
# then: EXPO_PUBLIC_IMAGE_ENDPOINT=https://<project>.functions.supabase.co/image
```
**Durable archive:** the function generates once, **uploads the image to Supabase
Storage**, and returns a stable public URL; later requests (any user/device, and
**past dates in the Calendar**) return the stored image instead of regenerating.
The app records the verse shown each day (`daily` map) so a past date re-opens the
exact verse + its saved image.

**Content rules (enforced in the prompt):** no text/words, no depiction of Jesus
or faces, no violence; warm cinematic realism in ivory/gold tones.
Set `EXPO_PUBLIC_IMAGE_BASE` instead if you prefer pre-rendered CDN images.

## 4. AI study-guide metadata (`studyguide/index.ts`) — paid only
As the daily verse updates, the app (for **paid users only**) generates the full
bilingual study metadata (passage · context · key message · reflection ·
application · journal · prayer) via Claude, then stores it in Supabase Storage
(`study-guides` bucket) and re-serves the saved copy thereafter. The Study Guide
screen prefers the generated guide and falls back to the 45 authored guides when
unconfigured. Visibility is paid-gated both client-side (the Study Guide is
behind the paywall) and by only generating for paid users.

```bash
supabase functions deploy studyguide --no-verify-jwt
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# create a PUBLIC storage bucket named "study-guides"
# then: EXPO_PUBLIC_STUDY_ENDPOINT=https://<project>.functions.supabase.co/studyguide
```
