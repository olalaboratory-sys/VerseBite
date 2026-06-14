# VerseBite — backend & paid-feature integration

The app ships with clean integration points that **degrade gracefully**: with no
keys configured, AI reflection is hidden, purchases resolve in sandbox mode, and
imagery falls back to the bundled Unsplash stand-ins. Set the env vars below
(in `.env` / EAS secrets, all `EXPO_PUBLIC_`-prefixed so they inline into the app)
to switch each on.

| Env var | Enables | Service |
|---|---|---|
| `EXPO_PUBLIC_AI_ENDPOINT` | AI reflection (`src/services/ai.ts`) | this folder's Edge Function |
| `EXPO_PUBLIC_RC_API_KEY` | In-app purchases (`src/services/purchases.ts`) | RevenueCat |
| `EXPO_PUBLIC_IMAGE_BASE` | AI verse imagery (`src/services/images.ts`) | any CDN |

## 1. AI reflection (`reflection/index.ts`)
Supabase Edge Function that proxies to the Anthropic Messages API so the key
never ships in the client. The "Suggest with AI" button in the Study Guide calls
`EXPO_PUBLIC_AI_ENDPOINT` and falls back to the authored static question on any
error. Uses `claude-haiku-4-5` (a short question is a light task).

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

## 3. AI image pipeline
Generate one cinematic image per verse (`{cat}/{id}.jpg`) and host on a CDN.
**Content rules (from the handoff):** no text, no explicit depiction of Jesus,
no violence; warm cinematic realism. Set `EXPO_PUBLIC_IMAGE_BASE` to the CDN root
and `imageFor(verse)` serves them automatically (gradient fallback still applies).
