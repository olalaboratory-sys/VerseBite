// Verse imagery resolver. Returns AI-generated CDN art when the pipeline is
// configured, otherwise the bundled Unsplash stand-in. Swapping to AI images
// is then just setting EXPO_PUBLIC_IMAGE_BASE and uploading {cat}/{id}.jpg.
import { CONFIG } from '@/config';
import { Verse } from '@/data/content';

export function imageFor(verse: Verse): string {
  if (CONFIG.imageBase) return `${CONFIG.imageBase.replace(/\/$/, '')}/${verse.cat}/${verse.id}.jpg`;
  return verse.img;
}
