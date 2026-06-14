import React, { createContext, useContext, useMemo } from 'react';
import { I18N, Lang } from './dict';
import { Category } from '@/data/content';

export type { Lang } from './dict';
export { LEARN_LABEL } from './dict';

type TFn = (key: string) => string;

type I18nValue = {
  lang: Lang;
  t: TFn;
  catName: (cat?: Category) => string;
  catSecondary: (cat?: Category) => string;
  greeting: () => string;
  formatDate: (d?: Date) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function makeT(lang: Lang): TFn {
  return (key: string) => I18N[lang]?.[key] ?? I18N.en[key] ?? key;
}

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const value = useMemo<I18nValue>(() => {
    const t = makeT(lang);
    return {
      lang,
      t,
      catName: (cat) => (!cat ? '' : lang === 'ko' ? cat.ko : cat.label),
      catSecondary: (cat) => (!cat ? '' : lang === 'ko' ? cat.label : cat.ko),
      greeting: () => {
        const h = new Date().getHours();
        if (h < 12) return t('today.morning');
        if (h < 18) return t('today.afternoon');
        return t('today.evening');
      },
      formatDate: (d = new Date()) =>
        d.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Interpolate {n}, {total}, {amt} style placeholders. */
export function fill(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
