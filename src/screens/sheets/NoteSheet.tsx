import React, { useState } from 'react';
import { imageFor } from '@/services/images';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Verse } from '@/data/content';
import { vbOrder } from '@/data/order';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { serifFamily } from '@/theme/tokens';
import { VBSheet } from '@/components/Sheet';
import { VBImage } from '@/components/VBImage';

export function NoteSheet({ verse, order, initial = '', onCancel, onSave }: { verse: Verse; order: 'en' | 'ko'; initial?: string; onCancel: () => void; onSave: (text: string) => void }) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const [text, setText] = useState(initial);
  const [a] = vbOrder(verse, order);
  const chips = ['adversity = 역경', '오늘 나에게 필요한 말', 'Remember this'];
  return (
    <VBSheet onClose={onCancel} maxH={0.9}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
        <Pressable onPress={onCancel}><Text style={{ fontSize: 17, color: theme.goldInk }}>{t('c.cancel')}</Text></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '600', color: theme.labelPrimary }}>{initial ? (lang === 'ko' ? '메모 수정' : 'Edit Note') : (lang === 'ko' ? '메모 추가' : 'Add Note')}</Text>
        <Pressable onPress={() => onSave(text)}><Text style={{ fontSize: 17, fontWeight: '600', color: theme.goldInk }}>{t('c.save')}</Text></Pressable>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, padding: 12, backgroundColor: theme.card, borderRadius: 16, borderWidth: 0.5, borderColor: theme.hair, marginBottom: 16 }}>
          <VBImage cat={verse.cat} src={imageFor(verse)} radius={11} style={{ width: 50, height: 50 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: theme.goldInk }}>{a.ref}</Text>
            <Text numberOfLines={2} style={{ marginTop: 5, fontFamily: a.lang === 'en' ? serifFamily(400) : undefined, fontSize: 14, lineHeight: 19, color: theme.labelSecondary }}>{a.text}</Text>
          </View>
        </View>
        <TextInput autoFocus value={text} onChangeText={setText} multiline placeholder={lang === 'ko' ? '묵상, 기도, 언어 노트를 적어보세요…' : 'Write your reflection, prayer, or language note…'} placeholderTextColor={theme.labelTertiary} style={{ minHeight: 150, borderWidth: 0.5, borderColor: theme.hair, borderRadius: 16, padding: 16, backgroundColor: theme.card, fontSize: 16, lineHeight: 24, color: theme.labelPrimary, textAlignVertical: 'top' }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
          {chips.map((ch) => (
            <Pressable key={ch} onPress={() => setText((prev) => (prev ? prev : ch))} style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 99, borderWidth: 0.5, borderStyle: 'dashed', borderColor: theme.hair }}>
              <Text style={{ fontSize: 13, color: theme.labelTertiary }}>{ch}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </VBSheet>
  );
}
