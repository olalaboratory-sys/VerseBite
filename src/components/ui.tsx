// Small shared UI atoms: PlusChip, Button, SegmentedControl, ListSection, ListRow, Switch, Overlay shell.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Switch as RNSwitch, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { GOLD_DEEP, serifFamily } from '@/theme/tokens';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/utils/useReducedMotion';

// Scrollable tab screen with top safe-area padding.
export function ScrollScreen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function PlusChip({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const { t } = useI18n();
  return (
    <LinearGradient colors={['#C9A45C', GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: size === 'sm' ? 3 : 5, paddingHorizontal: size === 'sm' ? 9 : 11, borderRadius: 999, alignSelf: 'flex-start' }}>
      <Icon name="sparkle" size={size === 'sm' ? 11 : 13} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size === 'sm' ? 10 : 12, letterSpacing: 0.6 }}>{t('plusBadge')}</Text>
    </LinearGradient>
  );
}

export function Button({ label, onPress, variant = 'filled', disabled }: { label: string; onPress: () => void; variant?: 'filled' | 'plain'; disabled?: boolean }) {
  const theme = useTheme();
  const filled = variant === 'filled';
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => ({
      height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      backgroundColor: filled ? theme.goldInk : 'transparent',
      opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
    })}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: filled ? '#fff' : theme.goldInk }}>{label}</Text>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: theme.fill, borderRadius: 10, padding: 2 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[{ flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, on && { backgroundColor: theme.card, ...theme.shadowSm }]}>
            <Text style={{ fontSize: 13.5, fontWeight: on ? '600' : '500', color: on ? theme.labelPrimary : theme.labelSecondary }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ListSection({ header, footer, children }: { header?: string; footer?: string; children: React.ReactNode }) {
  const theme = useTheme();
  const items = React.Children.toArray(children);
  return (
    <View style={{ marginBottom: 22 }}>
      {header ? <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase', color: theme.labelSecondary, marginBottom: 8, marginLeft: 4 }}>{header}</Text> : null}
      <View style={[{ backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <View style={{ height: 0.5, backgroundColor: theme.separator, marginLeft: 56 }} /> : null}
            {child}
          </View>
        ))}
      </View>
      {footer ? <Text style={{ fontSize: 12, lineHeight: 17, color: theme.labelTertiary, marginTop: 8, marginLeft: 4 }}>{footer}</Text> : null}
    </View>
  );
}

export function ListRow({ icon, iconBg, title, subtitle, value, accessory, trailing, onPress }: {
  icon?: IconName; iconBg?: string; title: string; subtitle?: string; value?: string; accessory?: 'chevron' | 'check' | 'none'; trailing?: React.ReactNode; onPress?: () => void;
}) {
  const theme = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 52 }}>
      {icon ? <View style={{ width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg || theme.goldInk }}><Icon name={icon} size={17} color="#fff" /></View> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: theme.labelPrimary }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 13, color: theme.labelSecondary, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={{ fontSize: 15, color: theme.labelSecondary }}>{value}</Text> : null}
      {trailing}
      {accessory === 'chevron' ? <Icon name="chevron" size={16} color={theme.labelTertiary} /> : null}
      {accessory === 'check' ? <Icon name="check" size={18} color={theme.goldInk} strokeWidth={2.4} /> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>{content}</Pressable> : content;
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const theme = useTheme();
  return <RNSwitch value={checked} onValueChange={onChange} trackColor={{ true: theme.goldInk, false: theme.hair }} thumbColor="#fff" ios_backgroundColor={theme.hair} />;
}

// Pushed overlay shell — fills its parent (which is bounded above the tab bar).
export function OverlayScreen({ children, animateKey }: { children: React.ReactNode; animateKey?: string }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    x.setValue(0);
    Animated.timing(x, { toValue: 1, duration: reduced ? 0 : 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [x, animateKey, reduced]);
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
}

// Glass circular back button used on image headers.
export function GlassBack({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)', opacity: pressed ? 0.6 : 1 })}>
      <Icon name="back" size={20} color="#fff" />
    </Pressable>
  );
}

// Plain circular back button (on ivory).
export function CircleBack({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.fill, opacity: pressed ? 0.6 : 1 })}>
      <Icon name="back" size={20} color={theme.labelSecondary} />
    </Pressable>
  );
}

export function OverlayHeader({ title, onBack, right, style }: { title: string; onBack: () => void; right?: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 10 }, style]}>
      <CircleBack onPress={onBack} />
      <Text style={{ flex: 1, fontFamily: serifFamily(600), fontSize: 24, color: theme.labelPrimary }}>{title}</Text>
      {right}
    </View>
  );
}
