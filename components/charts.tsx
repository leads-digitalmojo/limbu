/* Limbu AI — SVG charts (no chart library; react-native-svg primitives) */
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { compact, n as fmtN } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';
import { T, Muted } from './ui';

const uid = () => `g${Math.random().toString(36).slice(2, 8)}`;

export function Sparkline({ data, color, height = 46 }: { data: number[]; color: string; height?: number }) {
  const id = React.useRef(uid()).current;
  const w = 140;
  const max = Math.max(...data), min = Math.min(...data), span = max - min || 1;
  const pts = data.map((v, i) => [i * (w / Math.max(1, data.length - 1)), height - ((v - min) / span) * (height - 8) - 4]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={`${d} L${w} ${height} L0 ${height} Z`} fill={`url(#${id})`} />
      <Path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LineChart({ series, labels, height = 230 }: {
  series: { name: string; data: number[]; color: string }[]; labels: string[]; height?: number;
}) {
  const { c } = useTheme();
  const ids = React.useRef(series.map(() => uid())).current;
  const w = 760, pl = 44, pr = 14, pt = 16, pb = 30;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all) * 1.12 || 10;
  const iw = w - pl - pr, ih = height - pt - pb;
  const x = (i: number) => pl + i * (iw / Math.max(1, labels.length - 1));
  const y = (v: number) => pt + ih - (v / max) * ih;

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 18, marginBottom: 6, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <View key={s.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: s.color }} />
            <Muted>{s.name}</Muted>
          </View>
        ))}
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`}>
        <G>
          {[0, 1, 2, 3, 4].map((i) => {
            const yy = pt + ih - (i / 4) * ih;
            return (
              <G key={i}>
                <Line x1={pl} x2={w - pr} y1={yy} y2={yy} stroke={c.line} strokeDasharray="3 4" />
                <SvgText x={pl - 9} y={yy + 4} textAnchor="end" fontSize={10} fill={c.muted}>
                  {compact(Math.round((max * i) / 4))}
                </SvgText>
              </G>
            );
          })}
          {labels.map((l, i) =>
            labels.length > 12 && i % Math.ceil(labels.length / 8) ? null : (
              <SvgText key={i} x={x(i)} y={height - 9} textAnchor="middle" fontSize={10} fill={c.muted}>{l}</SvgText>
            ))}
        </G>
        {series.map((s, si) => {
          const d = s.data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
          return (
            <G key={s.name}>
              <Defs>
                <LinearGradient id={ids[si]} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                  <Stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={`${d} L${x(s.data.length - 1)} ${pt + ih} L${pl} ${pt + ih} Z`} fill={`url(#${ids[si]})`} />
              <Path d={d} fill="none" stroke={s.color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

export function BarChart({ data, labels, color, height = 210 }: {
  data: number[]; labels: string[]; color: string; height?: number;
}) {
  const { c } = useTheme();
  const w = 760, pl = 40, pr = 10, pt = 12, pb = 28;
  const max = Math.max(...data) * 1.15 || 10;
  const iw = w - pl - pr, ih = height - pt - pb;
  const bw = Math.min(46, (iw / data.length) * 0.6);
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`}>
      {[0, 1, 2, 3].map((i) => {
        const yy = pt + ih - (i / 3) * ih;
        return (
          <G key={i}>
            <Line x1={pl} x2={w - pr} y1={yy} y2={yy} stroke={c.line} strokeDasharray="3 4" />
            <SvgText x={pl - 8} y={yy + 4} textAnchor="end" fontSize={10} fill={c.muted}>
              {compact(Math.round((max * i) / 3))}
            </SvgText>
          </G>
        );
      })}
      {data.map((v, i) => {
        const cx = pl + (i + 0.5) * (iw / data.length);
        const bh = (v / max) * ih;
        return (
          <G key={i}>
            <Rect x={cx - bw / 2} y={pt + ih - bh} width={bw} height={Math.max(2, bh)} rx={5} fill={color} />
            <SvgText x={cx} y={height - 8} textAnchor="middle" fontSize={10} fill={c.muted}>{labels[i]}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function Donut({ value, max, color, label, size = 140 }: {
  value: number; max: number; color: string; label?: string; size?: number;
}) {
  const { c } = useTheme();
  const r = 52, circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 140 140" style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={70} cy={70} r={r} fill="none" stroke={c.surface3} strokeWidth={14} />
        <Circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${(circ * pct).toFixed(1)} ${circ.toFixed(1)}`} />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <T size={26} weight="800" heading>{fmtN(value)}</T>
        {!!label && <Muted>{label}</Muted>}
      </View>
    </View>
  );
}
