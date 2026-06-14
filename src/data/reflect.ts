// Per-category AI reflection question + learning-note builder. Ported from vb-premium.jsx.
import { Verse } from './content';
import { WORDS, tokenize } from './words';

export const REFLECT: Record<string, { en: string; ko: string }> = {
  friendship: { en: 'Who has been a steady friend to you lately, and how can you thank them?', ko: '최근 당신 곁을 지켜준 친구는 누구였나요? 어떻게 감사를 전할 수 있을까요?' },
  love: { en: 'Where can you show patience and kindness to someone today?', ko: '오늘 누구에게 오래 참고 친절함을 보일 수 있을까요?' },
  family: { en: 'What is one small way to bring peace to your home today?', ko: '오늘 가정에 평안을 더할 작은 한 가지는 무엇일까요?' },
  motivation: { en: 'What is one step you can take again today, even a small one?', ko: '오늘 다시 내디딜 수 있는 작은 한 걸음은 무엇인가요?' },
  faith: { en: 'Where do you need to trust God even without seeing the way?', ko: '길이 보이지 않아도 하나님을 신뢰해야 할 곳은 어디인가요?' },
  forgiveness: { en: 'Is there something you can begin to release today?', ko: '오늘 내려놓기 시작할 수 있는 것이 있나요?' },
  gratitude: { en: 'What small grace today do you not want to overlook?', ko: '오늘 무심코 지나치고 싶지 않은 작은 은혜는 무엇인가요?' },
  hope: { en: 'Where do you need to remember that your story is not over?', ko: '당신의 이야기가 끝나지 않았음을 기억해야 할 곳은 어디인가요?' },
  wisdom: { en: 'What choice today is asking for discernment?', ko: '오늘 분별이 필요한 선택은 무엇인가요?' },
};

export type LearnNote = { en: string; ko: string; def: string; pos: string };

export function learnNotes(verse: Verse): LearnNote[] {
  const toks = tokenize(verse.en, 'en').filter((t) => t.word);
  const seen = new Set<string>();
  const out: LearnNote[] = [];
  for (const t of toks) {
    const k = t.text.toLowerCase().replace(/[^a-z']/g, '');
    if (seen.has(k)) continue;
    const e = WORDS.en[k];
    if (e) {
      out.push({ en: t.text, ko: e.ko, def: e.def, pos: e.pos });
      seen.add(k);
    }
    if (out.length >= 3) break;
  }
  return out;
}
