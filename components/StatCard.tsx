import React from 'react';
import { View } from 'react-native';
import { Icon, IconName } from './Icon';
import { Sparkline } from './charts';
import { Card, IconTile, T, Muted, Tone } from './ui';
import { useTheme } from '../theme/ThemeProvider';

export function StatCard({ icon, tone = 'lemon', value, label, delta, spark, sparkColor }: {
  icon: IconName; tone?: Tone; value: string | number; label: string;
  delta?: number; spark?: number[]; sparkColor?: string;
}) {
  const { c } = useTheme();
  const up = (delta ?? 0) > 0;
  const flat = delta === 0;
  return (
    <Card pad={17}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
        <IconTile icon={icon} tone={tone} />
        {delta != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3,
            borderRadius: 99, backgroundColor: flat ? c.surface3 : up ? c.greenSoft : c.redSoft }}>
            <Icon name={up ? 'trend' : flat ? 'activity' : 'trendDown'} size={12}
              color={flat ? c.text3 : up ? c.greenText : c.redText} />
            <T size={11.5} weight="700" color={flat ? c.text3 : up ? c.greenText : c.redText}>
              {up ? '+' : ''}{delta}%
            </T>
          </View>
        )}
      </View>
      <T size={27} weight="800" heading>{String(value)}</T>
      <Muted style={{ marginTop: 3 }}>{label}</Muted>
      {!!spark && <View style={{ marginTop: 10 }}><Sparkline data={spark} color={sparkColor ?? c.lemonHover} /></View>}
    </Card>
  );
}
