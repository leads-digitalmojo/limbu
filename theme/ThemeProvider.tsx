import React, { createContext, useContext, useMemo } from 'react';
import { Platform, TextStyle, useWindowDimensions } from 'react-native';
import { BREAK_MD, BREAK_SM, Colors, colorsFor, fonts, Scheme } from './tokens';
import { useStore } from '../store/useStore';

type Ctx = {
  c: Colors;
  scheme: Scheme;
  /** true when the viewport is wide enough for the persistent sidebar */
  wide: boolean;
  /** true on phone-width viewports — collapse multi-column grids */
  narrow: boolean;
  width: number;
  /** font-family only applies on web; native uses the system face */
  h: TextStyle;
  b: TextStyle;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useStore((s) => s.theme);
  const { width } = useWindowDimensions();

  const value = useMemo<Ctx>(() => {
    const web = Platform.OS === 'web';
    return {
      c: colorsFor(scheme),
      scheme,
      wide: width >= BREAK_MD,
      narrow: width < BREAK_SM,
      width,
      h: web ? ({ fontFamily: fonts.heading } as TextStyle) : {},
      b: web ? ({ fontFamily: fonts.body } as TextStyle) : {},
    };
  }, [scheme, width]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}
