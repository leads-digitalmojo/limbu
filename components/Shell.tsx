/* Limbu AI — app shell: sidebar, topbar, command palette, modal + toast hosts */
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal as RNModal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fmt } from '../lib/format';
import { FLAT, NAV, PALETTE_ACTIONS } from '../lib/nav';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';
import { SIDEBAR_W, TOPBAR_H, radius } from '../theme/tokens';
import { Icon } from './Icon';
import { Avatar, Badge, Button, Divider, IconTile, Muted, Progress, Row, T } from './ui';

/* ============================ SIDEBAR ============================ */
function NavRow({ item, active, count, onPress }: {
  item: (typeof FLAT)[number]; active: boolean; count?: number; onPress: () => void;
}) {
  const { c, scheme } = useTheme();
  const [hover, setHover] = useState(false);
  const fg = active ? (scheme === 'dark' ? c.lemon : c.lemonInk) : hover ? c.text : c.text2;
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 8,
        borderRadius: 10, backgroundColor: active ? c.lemonSoft : hover ? c.surface3 : 'transparent',
      }}
    >
      <Icon name={item.icon} size={17} color={active ? c.lemonHover : c.text3} />
      <T size={13} weight={active ? '600' : '500'} color={fg} style={{ flex: 1 }} numberOfLines={1}>{item.label}</T>
      {item.tag ? (
        <View style={{ backgroundColor: c.lemon, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 }}>
          <T size={9.5} weight="700" color={c.onLemon}>{item.tag}</T>
        </View>
      ) : count ? (
        <T size={11} weight="600" color={c.muted}>{String(count)}</T>
      ) : null}
    </Pressable>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { c } = useTheme();
  const router = useRouter();
  const path = usePathname();
  const biz = useBiz();
  const { user, reviews, leads, posts } = useStore();
  const setDrawer = useUI((s) => s.setDrawer);
  const openModal = useUI((s) => s.openModal);

  const counts = {
    reviews: reviews.filter((r) => !r.reply).length,
    leads: leads.filter((l) => l.status === 'new').length,
    posts: posts.filter((p) => p.status === 'pending').length,
  };

  const go = (id: string) => { router.push(`/${id}` as any); setDrawer(false); onNavigate?.(); };

  return (
    <View style={{ width: SIDEBAR_W, backgroundColor: c.surface, borderRightWidth: 1, borderRightColor: c.line, height: '100%' }}>
      {/* brand */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, paddingBottom: 14 }}>
        <Pressable onPress={() => go('dashboard')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.lemon, alignItems: 'center', justifyContent: 'center' }}>
            <T size={20} weight="800" color="#0F172B" heading>L</T>
          </View>
          <T size={19} weight="800" heading>Limbu<T size={19} weight="800" color={c.lemonHover} heading>AI</T></T>
        </Pressable>
      </View>

      {/* business switcher */}
      <Pressable
        onPress={() => openModal({ title: 'Switch business location', content: <BizSwitcher /> })}
        style={{ marginHorizontal: 14, marginBottom: 14, padding: 10, borderWidth: 1, borderColor: c.line,
          borderRadius: radius.md, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar name={biz.name} size={34} tone="ink" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T size={12.5} weight="600" numberOfLines={1}>{biz.name}</T>
          <Muted size={11}>{biz.loc}</Muted>
        </View>
        <Icon name="chevrons" size={16} color={c.muted} />
      </Pressable>

      {/* nav */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        {NAV.map((g) => (
          <View key={g.group} style={{ marginBottom: 16 }}>
            <T size={10} weight="700" color={c.muted} style={{ paddingHorizontal: 10, paddingVertical: 6, letterSpacing: 1 }}>
              {g.group.toUpperCase()}
            </T>
            {g.items.map((it) => (
              <NavRow key={it.id} item={it as any} onPress={() => go(it.id)}
                active={path === `/${it.id}` || (it.id === 'posts' && path.startsWith('/posts'))}
                count={it.countKey ? counts[it.countKey] : undefined} />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* credits */}
      <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: c.line }}>
        <View style={{ backgroundColor: '#0F172B', borderRadius: radius.md, padding: 13 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={10.5} weight="600" color="#94A3B8" style={{ letterSpacing: 0.6 }}>AVAILABLE CREDITS</T>
            <Badge label={user.plan} tone="lemon" />
          </View>
          <T size={24} weight="800" color={c.lemon} heading>{fmt.n(user.credits)}</T>
          <View style={{ marginVertical: 8 }}>
            <Progress value={(user.credits / user.creditCap) * 100} />
          </View>
          <Button label="Recharge wallet" variant="primary" size="sm" block onPress={() => go('wallet')} />
        </View>
      </View>
    </View>
  );
}

function BizSwitcher() {
  const { c } = useTheme();
  const { businesses, activeBiz, setActiveBiz } = useStore();
  const { closeModal, toast } = useUI();
  const router = useRouter();
  return (
    <View style={{ gap: 10 }}>
      {businesses.map((b) => (
        <Pressable key={b.id}
          onPress={() => { setActiveBiz(b.id); closeModal(); toast('Business switched', b.name, 'ok'); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderWidth: 1,
            borderColor: b.id === activeBiz ? c.lemon : c.line, borderRadius: radius.md, backgroundColor: c.surface }}>
          <Avatar name={b.name} size={40} tone="ink" />
          <View style={{ flex: 1 }}>
            <T size={13.5} weight="700">{b.name}</T>
            <Muted>{b.loc} • {b.rating}★ ({b.reviews})</Muted>
          </View>
          {b.id === activeBiz ? <Badge label="Active" tone="lemon" />
            : b.verified ? <Badge label="Verified" tone="green" /> : <Badge label="Unverified" tone="amber" />}
        </Pressable>
      ))}
      <Button label="Connect another location" icon="plus" block
        onPress={() => { closeModal(); router.push('/gmb-connect'); }} />
    </View>
  );
}

/* ============================ TOPBAR ============================ */
function Topbar() {
  const { c, wide, narrow, scheme } = useTheme();
  const router = useRouter();
  const { user, toggleTheme, notifications, clearNotifications } = useStore();
  const { setDrawer, setPalette, openModal, closeModal, toast } = useUI();

  return (
    <View style={{ height: TOPBAR_H, flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: wide ? 24 : 14, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.line }}>
      {!wide && (
        <Pressable onPress={() => setDrawer(true)} style={{ padding: 8 }} accessibilityLabel="Open menu">
          <Icon name="menu" size={20} color={c.text2} />
        </Pressable>
      )}

      <Pressable onPress={() => setPalette(true)}
        style={{ flex: 1, maxWidth: 460, height: 38, borderWidth: 1, borderColor: c.line, borderRadius: 99,
          backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12 }}>
        <Icon name="search" size={16} color={c.muted} />
        {!narrow && <T size={13} color={c.text3} style={{ flex: 1 }} numberOfLines={1}>Search features, tools, keywords…</T>}
        {!narrow && Platform.OS === 'web' && (
          <View style={{ backgroundColor: c.surface3, borderWidth: 1, borderColor: c.line, borderRadius: 6, paddingHorizontal: 6 }}>
            <T size={10.5} weight="600" color={c.text3}>⌘K</T>
          </View>
        )}
      </Pressable>

      <View style={{ flex: 1 }} />

      <Pressable onPress={() => router.push('/wallet')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 13,
          borderRadius: 99, borderWidth: 1, borderColor: c.lemon, backgroundColor: c.lemonSoft }}>
        <Icon name="coin" size={15} color={scheme === 'dark' ? c.lemon : c.lemonInk} />
        {!narrow && <T size={13} weight="700" color={scheme === 'dark' ? c.lemon : c.lemonInk}>{fmt.n(user.credits)}</T>}
      </Pressable>

      <Pressable onPress={toggleTheme} style={{ padding: 8 }} accessibilityLabel="Toggle theme">
        <Icon name={scheme === 'dark' ? 'sun' : 'moon'} size={18} color={c.text2} />
      </Pressable>

      <Pressable
        onPress={() => openModal({
          title: 'Notifications',
          content: <NotificationList />,
          footer: (
            <Row gap={9}>
              <Button label="Clear all" variant="ghost" onPress={() => { clearNotifications(); closeModal(); toast('Notifications cleared'); }} />
              <Button label="Done" variant="dark" onPress={closeModal} />
            </Row>
          ),
        })}
        style={{ padding: 8 }} accessibilityLabel="Notifications">
        <Icon name="bell" size={18} color={c.text2} />
        {notifications.length > 0 && (
          <View style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 99,
            backgroundColor: c.red, borderWidth: 2, borderColor: c.surface }} />
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/profile')}>
        <Avatar name={user.name} size={34} tone="ink" />
      </Pressable>
    </View>
  );
}

function NotificationList() {
  const { c } = useTheme();
  const notifications = useStore((s) => s.notifications);
  if (!notifications.length) {
    return <Muted>No new notifications right now.</Muted>;
  }
  return (
    <View>
      {notifications.map((n) => (
        <View key={n.id} style={{ flexDirection: 'row', gap: 12, paddingVertical: 13,
          borderBottomWidth: 1, borderBottomColor: c.line2, alignItems: 'flex-start' }}>
          <IconTile icon={n.icon as any} size={32} />
          <View style={{ flex: 1 }}>
            <T size={13} weight="700">{n.title}</T>
            <Muted>{n.desc}</Muted>
          </View>
          <Muted>{fmt.ago(n.at)}</Muted>
        </View>
      ))}
    </View>
  );
}

/* ============================ COMMAND PALETTE ============================ */
function Palette() {
  const { c } = useTheme();
  const router = useRouter();
  const { paletteOpen, setPalette } = useUI();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);

  const results = useMemo(() => {
    const pool = [...FLAT, ...PALETTE_ACTIONS];
    const needle = q.trim().toLowerCase();
    return needle
      ? pool.filter((i) => `${i.label} ${i.desc} ${i.group}`.toLowerCase().includes(needle))
      : pool;
  }, [q]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { if (paletteOpen) { setQ(''); setSel(0); } }, [paletteOpen]);

  const open = (id: string) => { setPalette(false); router.push(`/${id}` as any); };

  /* web-only keyboard handling: ⌘K toggles, arrows navigate, enter opens */
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(!useUI.getState().paletteOpen);
        return;
      }
      if (!useUI.getState().paletteOpen) return;
      if (e.key === 'Escape') setPalette(false);
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (s + 1) % Math.max(1, results.length)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => (s - 1 + results.length) % Math.max(1, results.length)); }
      if (e.key === 'Enter' && results[sel]) { e.preventDefault(); open(results[sel].id); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [results, sel, setPalette]);

  if (!paletteOpen) return null;

  const groups = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.group] ||= []).push(r);
    return acc;
  }, {});

  return (
    <RNModal transparent visible animationType="fade" onRequestClose={() => setPalette(false)}>
      <Pressable onPress={() => setPalette(false)}
        style={{ flex: 1, backgroundColor: c.scrim, alignItems: 'center', paddingTop: '11%' }}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '92%', maxWidth: 620, maxHeight: '66%',
          backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: radius.lg, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14,
            borderBottomWidth: 1, borderBottomColor: c.line }}>
            <Icon name="search" size={18} color={c.muted} />
            <PaletteInput value={q} onChange={setQ} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 8 }}>
            {!results.length && <Muted style={{ padding: 24, textAlign: 'center' }}>No matches for “{q}”</Muted>}
            {Object.entries(groups).map(([group, items]) => (
              <View key={group}>
                <T size={10} weight="700" color={c.muted} style={{ paddingHorizontal: 10, paddingTop: 9, paddingBottom: 5, letterSpacing: 1 }}>
                  {group.toUpperCase()}
                </T>
                {items.map((it) => {
                  const idx = results.indexOf(it);
                  const on = idx === sel;
                  return (
                    <Pressable key={`${group}-${it.id}-${it.label}`} onPress={() => open(it.id)} onHoverIn={() => setSel(idx)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 9, borderRadius: 9,
                        backgroundColor: on ? c.lemonSoft : 'transparent' }}>
                      <Icon name={it.icon} size={16} color={on ? c.lemonInk : c.text3} />
                      <View style={{ flex: 1 }}>
                        <T size={13.5} weight="600">{it.label}</T>
                        <Muted size={11.5}>{it.desc}</Muted>
                      </View>
                      <Muted size={11}>↵</Muted>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

function PaletteInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { c, b } = useTheme();
  const ref = React.useRef<any>(null);
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 30); return () => clearTimeout(t); }, []);
  const { TextInput } = require('react-native');
  return (
    <TextInput ref={ref} value={value} onChangeText={onChange} autoFocus
      placeholder="Search features, tools and actions…" placeholderTextColor={c.muted}
      style={[b, { flex: 1, fontSize: 15, color: c.text, outlineStyle: 'none' }]} />
  );
}

/* ============================ MODAL + TOAST HOSTS ============================ */
function ModalHost() {
  const { c, narrow } = useTheme();
  const { modal, closeModal } = useUI();
  if (!modal) return null;
  return (
    <RNModal transparent visible animationType="fade" onRequestClose={closeModal}>
      <Pressable onPress={closeModal}
        style={{ flex: 1, backgroundColor: c.scrim, alignItems: 'center', justifyContent: 'center', padding: 18 }}>
        <Pressable onPress={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: modal.wide ? 880 : 560, maxHeight: '88%',
            backgroundColor: c.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            padding: 17, borderBottomWidth: 1, borderBottomColor: c.line }}>
            <T size={16} weight="700" heading style={{ flex: 1 }}>{modal.title}</T>
            <Pressable onPress={closeModal} style={{ padding: 6 }} accessibilityLabel="Close">
              <Icon name="x" size={18} color={c.text2} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>{modal.content}</ScrollView>
          {!!modal.footer && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 9, padding: 14,
              borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface2 }}>
              {modal.footer}
            </View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

function ToastHost() {
  const { c } = useTheme();
  const toasts = useUI((s) => s.toasts);
  const insets = useSafeAreaInsets();
  if (!toasts.length) return null;
  return (
    <View pointerEvents="box-none"
      style={{ position: 'absolute', right: 16, bottom: 16 + insets.bottom, gap: 9, zIndex: 999 }}>
      {toasts.map((t) => {
        const col = t.kind === 'ok' ? c.emerald : t.kind === 'err' ? c.red : c.lemonHover;
        return (
          <View key={t.id} style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start',
            minWidth: 260, maxWidth: 360, padding: 13, backgroundColor: c.surface, borderWidth: 1,
            borderColor: c.line, borderLeftWidth: 3, borderLeftColor: col, borderRadius: radius.md,
            shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
            <Icon name={t.kind === 'ok' ? 'checkCircle' : t.kind === 'err' ? 'alert' : 'info'} size={17} color={col} />
            <View style={{ flex: 1 }}>
              <T size={13} weight="700">{t.title}</T>
              {!!t.desc && <Muted>{t.desc}</Muted>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ============================ SHELL ============================ */
export function Shell({ children }: { children: React.ReactNode }) {
  const { c, wide } = useTheme();
  const { drawerOpen, setDrawer } = useUI();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.bg, paddingTop: insets.top }}>
      {wide && <Sidebar />}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Topbar />
        <ScrollView style={{ flex: 1 }}
          contentContainerStyle={{ padding: wide ? 26 : 16, paddingBottom: 60 + insets.bottom, maxWidth: 1480, width: '100%', alignSelf: 'center' }}>
          {children}
        </ScrollView>
      </View>

      {/* drawer on narrow viewports */}
      {!wide && drawerOpen && (
        <RNModal transparent visible animationType="slide" onRequestClose={() => setDrawer(false)}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ paddingTop: insets.top, backgroundColor: c.surface }}>
              <Sidebar />
            </View>
            <Pressable style={{ flex: 1, backgroundColor: c.scrim }} onPress={() => setDrawer(false)} />
          </View>
        </RNModal>
      )}

      <Palette />
      <ModalHost />
      <ToastHost />
    </View>
  );
}
