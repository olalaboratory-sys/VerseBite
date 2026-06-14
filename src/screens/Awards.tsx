import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n, fill } from '@/i18n';
import { mix, serifFamily, GOLD_DEEP } from '@/theme/tokens';
import { badgeProgress, BADGE_GROUPS, BadgeProgress } from '@/data/badges';
import { Icon, IconName } from '@/components/Icon';
import { VBHeader } from '@/components/Header';

function Ring({ pct, size = 72, stroke = 7, track, color }: { pct: number; size?: number; stroke?: number; track: string; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} />
    </Svg>
  );
}

export function AwardsScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const s = useStore();
  const prog = badgeProgress({ saved: s.saved, words: s.words, journal: s.journal, resonance: s.resonance, counts: s.counts });
  const byId = Object.fromEntries(prog.map((p) => [p.badge.id, p]));
  const unlockedCount = prog.filter((p) => p.unlocked).length;
  const total = prog.length;
  const overallPct = Math.round((unlockedCount / total) * 100);
  const inProgress = prog.filter((p) => !p.unlocked).sort((a, b) => b.pct - a.pct).slice(0, 3);

  const Medallion = ({ icon, u, size = 46 }: { icon: IconName; u: boolean; size?: number }) => (
    u ? (
      <LinearGradient colors={[theme.gold, GOLD_DEEP]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: size, height: size, borderRadius: 99, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={Math.round(size * 0.44)} color="#fff" fill={icon === 'bookmark'} strokeWidth={1.8} />
      </LinearGradient>
    ) : (
      <View style={{ width: size, height: size, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.fill, borderWidth: 1, borderColor: theme.hair }}>
        <Icon name={icon} size={Math.round(size * 0.44)} color={theme.labelTertiary} strokeWidth={1.8} />
      </View>
    )
  );

  const Row = ({ p, last }: { p: BadgeProgress; last: boolean }) => {
    const b = p.badge;
    const u = p.unlocked;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: last ? 0 : 0.5, borderBottomColor: theme.separator }}>
        <Medallion icon={b.icon as IconName} u={u} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: u ? theme.labelPrimary : theme.labelSecondary }}>{t('badge.' + b.id + '.name')}</Text>
          <Text style={{ fontSize: 12.5, lineHeight: 17, color: theme.labelTertiary, marginTop: 3 }}>{t('badge.' + b.id + '.desc')}</Text>
          {!u && p.target > 1 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1, height: 5, borderRadius: 99, backgroundColor: theme.hair, overflow: 'hidden' }}>
                <View style={{ width: `${Math.max(p.pct, 3)}%`, height: '100%', backgroundColor: theme.goldInk, borderRadius: 99 }} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.labelTertiary }}>{p.value}/{p.target}</Text>
            </View>
          ) : null}
        </View>
        {u ? (
          <View style={{ width: 24, height: 24, borderRadius: 99, backgroundColor: mix(theme.gold, theme.card, 20), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={15} color={theme.goldInk} strokeWidth={2.6} />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ paddingBottom: 30 }}>
      <VBHeader kicker={t('badge.kicker')} title={t('badge.title')} />

      {/* hero */}
      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20 }}>
        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 18, padding: 20, borderRadius: 22, backgroundColor: mix(theme.gold, theme.card, 16), borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
          <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
            <Ring pct={overallPct} track={theme.hair} color={theme.goldInk} />
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '700', color: theme.labelPrimary }}>{unlockedCount}</Text>
              <Text style={{ fontSize: 10, fontWeight: '500', color: theme.labelTertiary, marginTop: 2 }}>/ {total}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: serifFamily(600), fontSize: 21, lineHeight: 25, color: theme.labelPrimary }}>{fill(t('badge.count'), { n: unlockedCount, total })}</Text>
            <Text style={{ fontSize: 13, color: theme.labelSecondary, marginTop: 5 }}>{overallPct}%</Text>
          </View>
        </View>
      </View>

      {/* in progress */}
      {inProgress.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 22 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.goldInk, marginBottom: 11, marginLeft: 4 }}>{t('badge.inprogress')}</Text>
          <View style={[{ backgroundColor: theme.card, borderRadius: 18, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
            {inProgress.map((p, i) => <Row key={p.badge.id} p={p} last={i === inProgress.length - 1} />)}
          </View>
        </View>
      )}

      {/* groups */}
      <View style={{ paddingHorizontal: 16 }}>
        {BADGE_GROUPS.map((g) => {
          const earned = g.ids.filter((id) => byId[id].unlocked).length;
          return (
            <View key={g.id} style={{ marginBottom: 22 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.labelPrimary }}>{t('badge.group.' + g.id)}</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: theme.labelTertiary }}>{earned}/{g.ids.length}</Text>
              </View>
              <View style={[{ backgroundColor: theme.card, borderRadius: 18, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.hair }, theme.shadowSm]}>
                {g.ids.map((id, i) => <Row key={id} p={byId[id]} last={i === g.ids.length - 1} />)}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
