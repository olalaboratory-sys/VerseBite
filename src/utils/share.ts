import { Share } from 'react-native';
import { Verse } from '@/data/content';
import { vbOrder } from '@/data/order';

/** Open the native OS share sheet with the verse text. */
export async function shareVerse(verse: Verse, order: 'en' | 'ko', brand: string, note?: string): Promise<boolean> {
  const [a, b] = vbOrder(verse, order);
  const lines = [a.text, b.text];
  if (note && note.trim()) lines.push('', `“${note.trim()}”`);
  lines.push('', `— ${a.ref} · ${brand}`);
  try {
    const res = await Share.share({ message: lines.join('\n') });
    return res.action === Share.sharedAction;
  } catch {
    return false;
  }
}
