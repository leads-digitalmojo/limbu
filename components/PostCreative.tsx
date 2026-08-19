/* Limbu AI — the AI post creative preview (gradient canvas + caption + brand marks) */
import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { POST_THEMES, ratioValue } from '../lib/nav';
import { useTheme } from '../theme/ThemeProvider';
import { T } from './ui';

export function PostCreative({ caption, theme, ratio, logo, initials, badge }: {
  caption: string; theme: string; ratio: string; logo?: boolean; initials?: string; badge?: React.ReactNode;
}) {
  const [from, to] = POST_THEMES[theme] ?? POST_THEMES.lemon;
  return (
    <View style={{ aspectRatio: ratioValue(ratio), backgroundColor: to, alignItems: 'center',
      justifyContent: 'center', overflow: 'hidden' }}>
      <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Defs>
          <RadialGradient id="glow" cx="30%" cy="18%" r="80%">
            <Stop offset="0%" stopColor={from} stopOpacity={1} />
            <Stop offset="55%" stopColor={to} stopOpacity={0.85} />
            <Stop offset="100%" stopColor="#0F172B" stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#glow)" />
      </Svg>

      {logo && (
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#fff',
          paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 }}>
          <T size={12} weight="800" color="#0F172B" heading>{initials ?? 'L'}</T>
        </View>
      )}
      {!!badge && <View style={{ position: 'absolute', top: 11, right: 11 }}>{badge}</View>}

      <T size={19} weight="800" color="#fff" heading
        style={{ textAlign: 'center', paddingHorizontal: 22, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 12 }}
        numberOfLines={4}>
        {caption}
      </T>

      <T size={10} weight="600" color="rgba(255,255,255,0.75)" style={{ position: 'absolute', bottom: 10, right: 12 }}>
        Made with Limbu AI
      </T>
    </View>
  );
}
