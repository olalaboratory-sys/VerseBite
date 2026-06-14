import React from 'react';
import { imageFor } from '@/services/images';
import { Pressable, Text, View } from 'react-native';
import { Verse, vbCategory } from '@/data/content';
import { vbOrder } from '@/data/order';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { VBSheet } from '@/components/Sheet';
import { VBImage } from '@/components/VBImage';
import { Scrim } from '@/components/Scrim';
import { Icon, IconName } from '@/components/Icon';
import { shareVerse } from '@/utils/share';
import type { Toast } from '@/store/AppStore';

export function ShareSheet({ verse, order, isPaid, imgSrc, onEditor, onClose, onToast }: { verse: Verse; order: 'en' | 'ko'; isPaid: boolean; imgSrc?: string; onEditor: () => void; onClose: () => void; onToast: (t: Toast) => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  const src = imgSrc ?? imageFor(verse);
  const [a, b] = vbOrder(verse, order);
  const c = vbCategory(verse.cat)!;
  const opts: { id: string; label: string; icon: IconName; toast: string }[] = [
    { id: 'image', label: 'Save Image', icon: 'share', toast: 't.savedPhotos' },
    { id: 'story', label: 'Story', icon: 'sparkle', toast: 't.shared' },
    { id: 'link', label: 'Copy Link', icon: 'quote', toast: 't.linkCopied' },
    { id: 'more', label: 'More', icon: 'grid', toast: 't.shared' },
  ];
  return (
    <VBSheet onClose={onClose} maxH={0.92}>
      <Text style={{ paddingTop: 14, textAlign: 'center', fontSize: 17, fontWeight: '600', color: theme.labelPrimary }}>Share Verse Card</Text>
      <View style={{ paddingHorizontal: 44, paddingTop: 16, paddingBottom: 8 }}>
        <View style={[{ borderRadius: 18, overflow: 'hidden', aspectRatio: 9 / 16 }, theme.shadow]}>
          <VBImage cat={verse.cat} src={src} radius={18} style={{ flex: 1 }} scrim={<Scrim colors={['rgba(28,22,17,0.10)', 'rgba(28,22,17,0.86)']} />}>
            <View style={{ position: 'absolute', top: 14, left: 0, right: 0, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="quote" size={13} color={theme.gold} />
                <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)' }}>{t('brand')}</Text>
              </View>
            </View>
            <View style={{ position: 'absolute', left: 18, right: 18, bottom: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: theme.gold }}>{c.label} · {c.ko}</Text>
              <Text style={{ marginTop: 9, fontFamily: a.lang === 'en' ? serifFamily(500) : undefined, fontWeight: '500', fontSize: 16, lineHeight: 21, color: '#fff', textAlign: 'center' }}>{a.text}</Text>
              <Text style={{ marginTop: 8, fontFamily: b.lang === 'en' ? serifFamily(400) : undefined, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>{b.text}</Text>
              <View style={{ marginTop: 12, width: 30, height: 0.5, backgroundColor: 'rgba(255,255,255,0.5)' }} />
              <Text style={{ marginTop: 9, fontSize: 10, fontWeight: '500', letterSpacing: 1, color: 'rgba(255,255,255,0.78)' }}>{a.ref}</Text>
            </View>
          </VBImage>
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <Pressable onPress={onEditor} style={{ height: 50, borderRadius: 14, backgroundColor: theme.goldInk, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <Icon name="sparkle" size={17} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{isPaid ? 'Premium card editor' : 'Premium card · add a message'}</Text>
        </Pressable>
        <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: theme.labelTertiary }}>Send the verse with your heart · 말씀에 마음을 담아 보내세요</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12 }}>
        {opts.map((o) => (
          <Pressable key={o.id} onPress={async () => { onClose(); if (o.id === 'link') { onToast({ text: o.toast, icon: 'check' }); } else { await shareVerse(verse, order, t('brand')); } }} style={{ flex: 1, alignItems: 'center', gap: 7 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: theme.fill, borderWidth: 0.5, borderColor: theme.hair, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={o.icon} size={22} color={theme.goldInk} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '500', color: theme.labelSecondary }}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <Pressable onPress={onClose} style={[{ height: 50, borderRadius: 14, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' }, theme.shadowSm]}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: theme.goldInk }}>{t('c.cancel')}</Text>
        </Pressable>
      </View>
    </VBSheet>
  );
}
