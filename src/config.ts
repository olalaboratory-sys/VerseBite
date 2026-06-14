// Runtime configuration via public env vars (inlined at build time by Expo).
// Each integration degrades gracefully when its value is empty.
//
//   EXPO_PUBLIC_AI_ENDPOINT     — URL of the reflection-generation proxy (see backend/)
//   EXPO_PUBLIC_RC_API_KEY      — RevenueCat public SDK key
//   EXPO_PUBLIC_IMAGE_ENDPOINT  — proxy that generates a verse image (Gemini/Imagen)
//   EXPO_PUBLIC_IMAGE_BASE      — optional static CDN base (fallback / pre-rendered)
export const CONFIG = {
  aiEndpoint: process.env.EXPO_PUBLIC_AI_ENDPOINT ?? '',
  rcApiKey: process.env.EXPO_PUBLIC_RC_API_KEY ?? '',
  imageEndpoint: process.env.EXPO_PUBLIC_IMAGE_ENDPOINT ?? '',
  imageBase: process.env.EXPO_PUBLIC_IMAGE_BASE ?? '',
};

export const hasAI = () => CONFIG.aiEndpoint.length > 0;
export const hasPurchases = () => CONFIG.rcApiKey.length > 0;
export const hasImageGen = () => CONFIG.imageEndpoint.length > 0;
export const hasImagePipeline = () => CONFIG.imageBase.length > 0;
