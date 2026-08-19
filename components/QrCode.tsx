/* Limbu AI — deterministic decorative QR rendering for the Magic QR screen */
import React from 'react';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

/** xorshift keyed on the slug so the same link always draws the same code */
function cells(seed: string, n: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967295; };
  const out: [number, number][] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      const centre = Math.abs(x - (n - 1) / 2) < 2 && Math.abs(y - (n - 1) / 2) < 2;
      if (finder || centre) continue;
      if (rnd() > 0.55) out.push([x, y]);
    }
  }
  return out;
}

export function QrCode({ value, size = 210, ink = '#0F172B', accent = '#FACC15' }: {
  value: string; size?: number; ink?: string; accent?: string;
}) {
  const n = 25;
  const pts = React.useMemo(() => cells(value, n), [value]);
  const eye = (x: number, y: number) => (
    <G key={`${x}-${y}`}>
      <Rect x={x} y={y} width={7} height={7} rx={2} fill="none" stroke={ink} strokeWidth={1} />
      <Rect x={x + 2} y={y + 2} width={3} height={3} rx={0.8} fill={ink} />
    </G>
  );
  return (
    <Svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`}>
      <G fill={ink}>
        {pts.map(([x, y]) => <Rect key={`${x},${y}`} x={x} y={y} width={1} height={1} />)}
      </G>
      {eye(0, 0)}{eye(n - 7, 0)}{eye(0, n - 7)}
      <Rect x={(n - 7) / 2} y={(n - 7) / 2} width={7} height={7} rx={2} fill={accent} />
      <SvgText x={n / 2} y={n / 2 + 1.7} textAnchor="middle" fontSize={4.6} fontWeight="800" fill={ink}>L</SvgText>
    </Svg>
  );
}
