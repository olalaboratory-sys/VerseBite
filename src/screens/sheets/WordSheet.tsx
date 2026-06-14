import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { lookup } from '@/data/words';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { VBSheet } from '@/components/Sheet';
import { Icon } from '@/components/Icon';
import type { WordEntry } from '@/store/AppStore';

export function WordSheet({ token, lang: wlang, saved, onToggleSave, onClose }: { token: string; lang: 'en' | 'ko'; saved: boolean; onToggleSave: (w: WordEntry) => void; onClose: () => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  const hit = lookup(token, wlang);
  const headword = hit ? hit.headword : token.replace(/[^A-Za-z'가-힣]/g, '');
  const wordObj: WordEntry = { key: wlang + ':' + headword, headword, lang: wlang, def: hit ? hit.def : '', trans: hit ? hit.trans : '', roman: hit ? hit.roman : null };
  return (
    <VBSheet onClose={onClose} maxH={0.72}>
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: theme.goldInk }}>{wlang === 'ko' ? t('word.koWord') : t('word.enWord')}</Text>
          <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 99, backgroundColor: theme.fill, alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16} color={theme.labelSecondary} /></Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 11 }}>
          <Text style={{ fontFamily: wlang === 'en' ? serifFamily(600) : undefined, fontWeight: '600', fontSize: 40, letterSpacing: -0.5, color: theme.labelPrimary }}>{headword}</Text>
          {hit && hit.roman ? <Text style={{ fontSize: 16, color: theme.labelTertiary, fontStyle: 'italic' }}>{hit.roman}</Text> : null}
          {hit && hit.pos ? <View style={{ backgroundColor: theme.fill, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 }}><Text style={{ fontSize: 12, fontWeight: '500', color: theme.labelSecondary }}>{hit.pos}</Text></View> : null}
        </View>

        {hit ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.labelTertiary }}>{wlang === 'ko' ? 'English' : '한국어'}</Text>
              <Text style={{ fontFamily: wlang === 'ko' ? serifFamily(600) : undefined, fontWeight: '600', fontSize: 22, color: theme.goldInk }}>{hit.trans}</Text>
            </View>
            {hit.def && hit.def !== hit.trans ? <Text style={{ fontSize: 16, lineHeight: 24, color: theme.labelSecondary }}>{hit.def}</Text> : null}
          </>
        ) : (
          <Text style={{ marginTop: 18, fontSize: 15, lineHeight: 22, color: theme.labelSecondary }}>{t('word.noDef')}</Text>
        )}

        <Pressable onPress={() => onToggleSave(wordObj)} style={{ marginTop: 26, height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: saved ? theme.fill : theme.goldInk, borderWidth: saved ? 0.5 : 0, borderColor: theme.hair }}>
          <Icon name={saved ? 'check' : 'plus'} size={19} color={saved ? theme.goldInk : '#fff'} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: saved ? theme.goldInk : '#fff' }}>{saved ? t('word.saved') : t('word.save')}</Text>
        </Pressable>
      </View>
    </VBSheet>
  );
}
