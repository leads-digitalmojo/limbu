/* Limbu AI — shared UI primitives */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleProp, Text, TextInput, TextStyle,
  View, ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { Icon, IconName } from './Icon';

/* ---------------- text ---------------- */
export function T({
  children, style, size = 13.5, weight = '400', color, heading, numberOfLines,
}: {
  children?: React.ReactNode; style?: StyleProp<TextStyle>; size?: number;
  weight?: TextStyle['fontWeight']; color?: string; heading?: boolean; numberOfLines?: number;
}) {
  const { c, h, b } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        heading ? h : b,
        { fontSize: size, fontWeight: weight, color: color ?? c.text, lineHeight: size * 1.5 },
        heading && { letterSpacing: -0.4 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export const Muted = (p: {
  children: React.ReactNode; size?: number; style?: StyleProp<TextStyle>; numberOfLines?: number;
}) => {
  const { c } = useTheme();
  return <T size={p.size ?? 12} color={c.text3} style={p.style} numberOfLines={p.numberOfLines}>{p.children}</T>;
};

/* ---------------- layout ---------------- */
export const Row = ({ children, gap = 10, style, wrap = true, align = 'center' }: {
  children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle>;
  wrap?: boolean; align?: ViewStyle['alignItems'];
}) => (
  <View style={[{ flexDirection: 'row', alignItems: align, gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>
    {children}
  </View>
);

export const Between = ({ children, style, gap = 12 }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number;
}) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap }, style]}>
    {children}
  </View>
);

export const Stack = ({ children, gap = 16, style }: {
  children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle>;
}) => <View style={[{ gap }, style]}>{children}</View>;

/** responsive grid — collapses to fewer columns on narrow viewports */
export function Grid({ children, cols = 4, gap = 16, minWidth = 220 }: {
  children: React.ReactNode; cols?: number; gap?: number; minWidth?: number;
}) {
  const { width, wide } = useTheme();
  const avail = wide ? width - 264 - 60 : width - 32;
  const fit = Math.max(1, Math.min(cols, Math.floor(avail / minWidth)));
  const items = React.Children.toArray(children);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {items.map((ch, i) => (
        <View key={i} style={{ width: fit === 1 ? '100%' : `${100 / fit}%`, maxWidth: fit === 1 ? '100%' : undefined,
          flexBasis: fit === 1 ? '100%' : `${100 / fit}%`, flexGrow: 0, flexShrink: 1,
          paddingRight: 0 }}>
          <View style={{ flex: 1 }}>{ch}</View>
        </View>
      ))}
    </View>
  );
}

/** two-column page layout that stacks below the md breakpoint */
export function Cols({ main, side, sideWidth = 340, gap = 16 }: {
  main: React.ReactNode; side: React.ReactNode; sideWidth?: number; gap?: number;
}) {
  const { width } = useTheme();
  const stacked = width < 1100;
  return (
    <View style={{ flexDirection: stacked ? 'column' : 'row', gap }}>
      <View style={{ flex: 1, minWidth: 0, gap }}>{main}</View>
      <View style={{ width: stacked ? '100%' : sideWidth, gap }}>{side}</View>
    </View>
  );
}

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  const { c } = useTheme();
  return <View style={[{ height: 1, backgroundColor: c.line, marginVertical: 14 }, style]} />;
};

/* ---------------- card ---------------- */
export function Card({ children, style, pad, onPress }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>; pad?: boolean | number;
  onPress?: () => void;
}) {
  const { c } = useTheme();
  const [hover, setHover] = useState(false);
  const base: ViewStyle = {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: hover && onPress ? c.lemonHover : c.line,
    borderRadius: radius.lg,
    padding: pad === true ? 20 : typeof pad === 'number' ? pad : 0,
    overflow: 'hidden',
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[base, style]}
    >
      {children}
    </Pressable>
  );
}

export function CardHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <Between style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: c.line }}>
      <View style={{ flexShrink: 1 }}>
        <T size={15} weight="700" heading>{title}</T>
        {!!sub && <Muted>{sub}</Muted>}
      </View>
      {right}
    </Between>
  );
}

export const CardBody = ({ children, style, pad = 18 }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>; pad?: number;
}) => <View style={[{ padding: pad }, style]}>{children}</View>;

/* ---------------- button ---------------- */
type BtnVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';
export function Button({
  label, onPress, variant = 'outline', icon, size = 'md', block, disabled, loading, style,
}: {
  label: string; onPress?: () => void; variant?: BtnVariant; icon?: IconName;
  size?: 'sm' | 'md' | 'lg'; block?: boolean; disabled?: boolean; loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const [hover, setHover] = useState(false);
  const H = size === 'sm' ? 32 : size === 'lg' ? 46 : 38;
  const F = size === 'sm' ? 12 : size === 'lg' ? 14.5 : 13;

  const map: Record<BtnVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: hover ? c.lemonHover : c.lemon, fg: c.onLemon, border: 'transparent' },
    dark: { bg: c.ink, fg: c.surface, border: 'transparent' },
    outline: { bg: hover ? c.lemonSoft : c.surface, fg: hover ? c.lemonInk : c.text, border: hover ? c.lemonHover : c.line },
    ghost: { bg: hover ? c.surface3 : 'transparent', fg: c.text2, border: 'transparent' },
    danger: { bg: c.red, fg: '#fff', border: 'transparent' },
  };
  const s = map[variant];
  const off = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={off}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[{
        height: H, paddingHorizontal: size === 'sm' ? 11 : size === 'lg' ? 22 : 15,
        borderRadius: size === 'sm' ? 8 : 10, borderWidth: 1, borderColor: s.border,
        backgroundColor: s.bg, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 7, opacity: off ? 0.55 : 1,
        alignSelf: block ? 'stretch' : 'flex-start',
      }, style]}
    >
      {loading ? <ActivityIndicator size="small" color={s.fg} />
        : icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} color={s.fg} /> : null}
      <T size={F} weight="600" color={s.fg}>{loading ? 'Working…' : label}</T>
    </Pressable>
  );
}

/** Button that runs an async-looking task, showing a spinner for `ms` first */
export function useWork() {
  const [busy, setBusy] = useState<string | null>(null);
  const run = (key: string, ms: number, done: () => void) => {
    setBusy(key);
    setTimeout(() => { setBusy(null); done(); }, ms);
  };
  return { busy, run, isBusy: (k: string) => busy === k };
}

export function LinkButton(p: { label: string; href: string; variant?: BtnVariant; icon?: IconName; block?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const router = useRouter();
  return <Button {...p} onPress={() => router.push(p.href as any)} />;
}

/* ---------------- badge / chip ---------------- */
export type Tone = 'lemon' | 'green' | 'blue' | 'red' | 'amber' | 'slate' | 'pink' | 'indigo' | 'orange';

export function toneColors(c: ReturnType<typeof useTheme>['c'], tone: Tone) {
  switch (tone) {
    case 'lemon': return { bg: c.lemon, fg: c.onLemon };
    case 'green': return { bg: c.greenSoft, fg: c.greenText };
    case 'blue': return { bg: c.blueSoft, fg: c.blueText };
    case 'red': return { bg: c.redSoft, fg: c.redText };
    case 'amber': return { bg: c.amberSoft, fg: c.amberText };
    case 'pink': return { bg: c.pinkSoft, fg: c.pinkText };
    case 'indigo': return { bg: c.indigoSoft, fg: c.indigoText };
    case 'orange': return { bg: c.orangeSoft, fg: c.orangeText };
    default: return { bg: c.surface3, fg: c.text3 };
  }
}

export function Badge({ label, tone = 'slate', icon, dot }: {
  label: string; tone?: Tone; icon?: IconName; dot?: boolean;
}) {
  const { c } = useTheme();
  const t = toneColors(c, tone);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.bg,
      paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      {dot && <View style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: t.fg }} />}
      {icon && <Icon name={icon} size={12} color={t.fg} />}
      <T size={11} weight="600" color={t.fg}>{label}</T>
    </View>
  );
}

export function Chip({ label, on, onPress, icon, right, swatch }: {
  label: string; on?: boolean; onPress?: () => void; icon?: IconName;
  right?: React.ReactNode; swatch?: string;
}) {
  const { c } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 6,
        borderRadius: radius.pill, borderWidth: 1,
        borderColor: on ? c.lemon : hover ? c.lemonHover : c.line,
        backgroundColor: on ? c.lemon : hover ? c.lemonSoft : c.surface,
      }}
    >
      {swatch && <View style={{ width: 13, height: 13, borderRadius: 4, backgroundColor: swatch }} />}
      {icon && <Icon name={icon} size={13} color={on ? c.onLemon : c.text2} />}
      <T size={12.5} weight={on ? '600' : '500'} color={on ? c.onLemon : c.text}>{label}</T>
      {right}
    </Pressable>
  );
}

/* ---------------- tabs / segment ---------------- */
export function Tabs({ items, value, onChange }: {
  items: { key: string; label: string; count?: number }[];
  value: string; onChange: (k: string) => void;
}) {
  const { c } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={{ borderBottomWidth: 1, borderBottomColor: c.line, marginBottom: 18, flexGrow: 0 }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)}
            style={{ paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 7,
              borderBottomWidth: 2, borderBottomColor: on ? c.lemonHover : 'transparent' }}>
            <T size={13} weight="600" color={on ? (c.bg === '#0B1220' ? c.lemon : c.lemonInk) : c.text3}>{it.label}</T>
            {it.count != null && (
              <View style={{ backgroundColor: on ? c.lemon : c.surface3, paddingHorizontal: 6, borderRadius: 99 }}>
                <T size={10.5} weight="700" color={on ? c.onLemon : c.text3}>{String(it.count)}</T>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Segment({ items, value, onChange, style }: {
  items: { key: string; label: string }[]; value: string; onChange: (k: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: c.surface3, borderRadius: 10, padding: 3, gap: 2 }, style]}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)}
            style={{ paddingHorizontal: 13, paddingVertical: 6, borderRadius: 8, backgroundColor: on ? c.surface : 'transparent', flex: 1 }}>
            <T size={12.5} weight="600" color={on ? c.text : c.text3} style={{ textAlign: 'center' }}>{it.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------- inputs ---------------- */
export function Field({ label, hint, children, required, style }: {
  label?: string; hint?: string; children: React.ReactNode; required?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View style={[{ marginBottom: 15 }, style]}>
      {!!label && (
        <T size={12} weight="600" color={c.text2} style={{ marginBottom: 6 }}>
          {label}{required ? <T size={12} color={c.red}> *</T> : null}
        </T>
      )}
      {children}
      {!!hint && <Muted size={11.5} style={{ marginTop: 5 }}>{hint}</Muted>}
    </View>
  );
}

export function Input({
  value, onChangeText, placeholder, icon, multiline, keyboardType, style, onSubmitEditing,
}: {
  value: string; onChangeText: (v: string) => void; placeholder?: string; icon?: IconName;
  multiline?: boolean; keyboardType?: 'default' | 'numeric' | 'email-address'; style?: StyleProp<ViewStyle>;
  onSubmitEditing?: () => void;
}) {
  const { c, b } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{
      flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: 8,
      borderWidth: 1, borderColor: focus ? c.lemonHover : c.line, borderRadius: 10,
      backgroundColor: c.surface, paddingHorizontal: 12,
      height: multiline ? undefined : 40, minHeight: multiline ? 110 : undefined,
      paddingVertical: multiline ? 11 : 0,
    }, style]}>
      {icon && <Icon name={icon} size={16} color={c.muted} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[b, {
          flex: 1, fontSize: 13.5, color: c.text, minHeight: multiline ? 88 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          outlineStyle: 'none' as any, paddingVertical: 0,
        }]}
      />
    </View>
  );
}

/** lightweight select — opens an inline option list, works on web and native */
export function Select({ value, options, onChange, style, placeholder }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
  style?: StyleProp<ViewStyle>; placeholder?: string;
}) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => o.value === value);
  return (
    <View style={[{ position: 'relative', zIndex: open ? 50 : 1 }, style]}>
      <Pressable onPress={() => setOpen(!open)}
        style={{ height: 40, borderWidth: 1, borderColor: open ? c.lemonHover : c.line, borderRadius: 10,
          backgroundColor: c.surface, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <T size={13.5} color={cur ? c.text : c.muted} style={{ flex: 1 }} numberOfLines={1}>
          {cur?.label ?? placeholder ?? 'Select'}
        </T>
        <Icon name="chevronD" size={14} color={c.text3} />
      </Pressable>
      {open && (
        <View style={{ position: 'absolute', top: 44, left: 0, right: 0, backgroundColor: c.surface,
          borderWidth: 1, borderColor: c.line, borderRadius: 10, paddingVertical: 5, maxHeight: 260,
          shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 }}>
          <ScrollView>
            {options.map((o) => (
              <Pressable key={o.value} onPress={() => { onChange(o.value); setOpen(false); }}
                style={{ paddingHorizontal: 12, paddingVertical: 9,
                  backgroundColor: o.value === value ? c.lemonSoft : 'transparent' }}>
                <T size={13}>{o.label}</T>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export function Switch({ on, onPress }: { on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: on }}
      style={{ width: 40, height: 22, borderRadius: 99, backgroundColor: on ? c.lemonHover : c.line, padding: 3 }}>
      <View style={{ width: 16, height: 16, borderRadius: 99, backgroundColor: '#fff',
        transform: [{ translateX: on ? 18 : 0 }] }} />
    </Pressable>
  );
}

export function CheckRow({ label, desc, checked, onPress }: {
  label: string; desc?: string; checked: boolean; onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress}
      style={{ flexDirection: 'row', gap: 9, padding: 10, borderWidth: 1,
        borderColor: checked ? c.lemonHover : c.line, borderRadius: 10, flex: 1,
        backgroundColor: checked ? c.lemonSoft : c.surface }}>
      <View style={{ width: 17, height: 17, borderRadius: 5, marginTop: 2, borderWidth: 1.5,
        borderColor: checked ? c.lemonHover : c.line, backgroundColor: checked ? c.lemonHover : 'transparent',
        alignItems: 'center', justifyContent: 'center' }}>
        {checked && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
      </View>
      <View style={{ flex: 1 }}>
        <T size={12.5} weight="600">{label}</T>
        {!!desc && <Muted size={11.5}>{desc}</Muted>}
      </View>
    </Pressable>
  );
}

export function ToggleRow({ title, desc, on, onPress }: {
  title: string; desc: string; on: boolean; onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.line2 }}>
      <View style={{ flex: 1 }}>
        <T size={13} weight="600">{title}</T>
        <Muted>{desc}</Muted>
      </View>
      <Switch on={on} onPress={onPress} />
    </View>
  );
}

/* ---------------- feedback ---------------- */
export function Progress({ value, tone = 'lemon', width }: { value: number; tone?: 'lemon' | 'green' | 'red' | 'blue'; width?: number }) {
  const { c } = useTheme();
  const col = tone === 'green' ? c.emerald : tone === 'red' ? c.red : tone === 'blue' ? c.blue : c.lemonHover;
  return (
    <View style={{ height: 8, borderRadius: 99, backgroundColor: c.surface3, overflow: 'hidden', width: width ?? undefined, flex: width ? undefined : 1 }}>
      <View style={{ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: col, borderRadius: 99 }} />
    </View>
  );
}

export function Empty({ icon, title, desc, action }: {
  icon: IconName; title: string; desc: string; action?: React.ReactNode;
}) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 46, paddingHorizontal: 20 }}>
      <View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: c.lemonSoft,
        alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon name={icon} size={26} color={c.lemonInk} />
      </View>
      <T size={16} weight="700" heading>{title}</T>
      <Muted size={13} style={{ textAlign: 'center', marginTop: 6, maxWidth: 380 }}>{desc}</Muted>
      {!!action && <View style={{ marginTop: 16 }}>{action}</View>}
    </View>
  );
}

export function PageHeader({ title, sub, eyebrow, eyebrowIcon, actions }: {
  title: string; sub?: string; eyebrow?: string; eyebrowIcon?: IconName; actions?: React.ReactNode;
}) {
  const { c, narrow } = useTheme();
  return (
    <View style={{ flexDirection: narrow ? 'column' : 'row', alignItems: narrow ? 'flex-start' : 'flex-end',
      justifyContent: 'space-between', gap: 14, marginBottom: 22 }}>
      <View style={{ flexShrink: 1 }}>
        {!!eyebrow && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
            backgroundColor: c.lemonSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 9 }}>
            <Icon name={eyebrowIcon ?? 'sparkles'} size={12} color={c.lemonInk} />
            <T size={10.5} weight="700" color={c.lemonInk} style={{ letterSpacing: 1 }}>{eyebrow.toUpperCase()}</T>
          </View>
        )}
        <T size={26} weight="800" heading>{title}</T>
        {!!sub && <Muted size={13.5} style={{ marginTop: 5, maxWidth: 640 }}>{sub}</Muted>}
      </View>
      {!!actions && <Row gap={8}>{actions}</Row>}
    </View>
  );
}

export function Avatar({ name, size = 34, tone = 'lemon' }: { name: string; size?: number; tone?: 'lemon' | 'ink' }) {
  const { c } = useTheme();
  const bg = tone === 'ink' ? c.ink : c.lemonSoft;
  const fg = tone === 'ink' ? c.lemon : c.lemonInk;
  return (
    <View style={{ width: size, height: size, borderRadius: size > 40 ? 18 : 99, backgroundColor: bg,
      alignItems: 'center', justifyContent: 'center' }}>
      <T size={size * 0.36} weight="700" color={fg} heading>
        {name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
      </T>
    </View>
  );
}

export function IconTile({ icon, tone = 'lemon', size = 36 }: { icon: IconName; tone?: Tone; size?: number }) {
  const { c } = useTheme();
  const t = toneColors(c, tone);
  return (
    <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: t.bg,
      alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.5} color={t.fg} />
    </View>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} color={i <= value ? c.lemonHover : c.line}
          fill={i <= value ? c.lemonHover : 'none'} />
      ))}
    </View>
  );
}
