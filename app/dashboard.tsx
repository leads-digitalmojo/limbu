import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { StatCard } from '../components/StatCard';
import { LineChart } from '../components/charts';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Cols, Grid, IconTile, LinkButton,
  Muted, PageHeader, Row, Segment, Stack, T, Tone, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { lastDays, series } from '../lib/mock';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';

const QUICK: { id: string; label: string; icon: IconName; tone: Tone; desc: string }[] = [
  { id: 'competitors',  label: 'Competitor Analysis', icon: 'map',         tone: 'blue',   desc: 'Grid rank audit' },
  { id: 'gmb-health',   label: 'GMB Health',          icon: 'stethoscope', tone: 'green',  desc: 'Profile score' },
  { id: 'gmb-insights', label: 'GMB Insights',        icon: 'chart',       tone: 'indigo', desc: 'Views & calls' },
  { id: 'magic-qr',     label: 'Magic QR',            icon: 'qr',          tone: 'pink',   desc: 'Collect reviews' },
  { id: 'review-reply', label: 'Review Reply',        icon: 'reply',       tone: 'orange', desc: 'AI responses' },
  { id: 'keywords',     label: 'Keyword Planner',     icon: 'key',         tone: 'lemon',  desc: 'Local SEO' },
  { id: 'website',      label: 'Website Builder',     icon: 'monitor',     tone: 'blue',   desc: 'From GMB data' },
  { id: 'posts/new',    label: 'Create Post',         icon: 'wand',        tone: 'lemon',  desc: 'Magic Post' },
];

const LIVE = [
  { k: 'google',    name: 'Google Business Profile', icon: 'google'    as IconName, color: '#4285F4' },
  { k: 'facebook',  name: 'Facebook',                icon: 'facebook'  as IconName, color: '#1877F2' },
  { k: 'instagram', name: 'Instagram',               icon: 'instagram' as IconName, color: '#E1306C' },
  { k: 'whatsapp',  name: 'WhatsApp',                icon: 'whatsapp'  as IconName, color: '#25D366' },
  { k: 'linkedin',  name: 'LinkedIn',                icon: 'linkedin'  as IconName, color: '#0A66C2' },
  { k: 'youtube',   name: 'YouTube',                 icon: 'youtube'   as IconName, color: '#FF0000' },
  { k: 'pinterest', name: 'Pinterest',               icon: 'pinterest' as IconName, color: '#E60023' },
];

export default function Dashboard() {
  const { c, narrow } = useTheme();
  const router = useRouter();
  const biz = useBiz();
  const { user, posts, reviews, leads, gmbConnected, social } = useStore();
  const toast = useUI((s) => s.toast);
  const { run, isBusy } = useWork();

  const [range, setRange] = useState('14');
  const n = Number(range);
  const [chart, setChart] = useState(() => ({ views: series(14, 280, 90), calls: series(14, 46, 22), labels: lastDays(14) }));

  const changeRange = (r: string) => {
    setRange(r);
    const k = Number(r);
    setChart({ views: series(k, 280, 90), calls: series(k, 46, 22), labels: lastDays(k) });
  };

  const noReply = reviews.filter((r) => !r.reply).length;
  const pending = posts.filter((p) => p.status === 'pending').length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const totalViews = chart.views.reduce((a, b) => a + b, 0);
  const totalCalls = chart.calls.reduce((a, b) => a + b, 0);

  return (
    <View>
      <PageHeader
        eyebrow="Live dashboard" eyebrowIcon="zap"
        title={`Welcome back, ${user.name.split(' ')[0]} 👋`}
        sub={`Here is how ${biz.name} is performing on Google and social this fortnight.`}
        actions={
          <>
            <Button label="Refresh" icon="refresh" loading={isBusy('refresh')}
              onPress={() => run('refresh', 1000, () => toast('Dashboard synced', 'Latest Google data pulled', 'ok'))} />
            <LinkButton label="Create Magic Post" href="/posts/new" variant="primary" icon="wand" />
          </>
        }
      />

      {!gmbConnected && (
        <Card pad={18} style={{ marginBottom: 16, borderColor: c.lemon, backgroundColor: c.lemonSoft }}>
          <Between>
            <Row wrap={false} style={{ flexShrink: 1 }}>
              <IconTile icon="google" />
              <View style={{ flexShrink: 1 }}>
                <T size={13.5} weight="700">Connect your Google Business Profile</T>
                <Muted>Most Limbu features need a connected GMB location.</Muted>
              </View>
            </Row>
            <LinkButton label="Connect now" href="/gmb-connect" variant="dark" icon="link" />
          </Between>
        </Card>
      )}

      {posts.length === 0 && (
        <Hero title="Make your first Magic Post ✨"
          sub="Give Limbu one line about your offer. It writes the caption, generates the image with your brand assets and publishes to Google, Facebook and Instagram."
          cta={<LinkButton label="Make your first Magic Post" href="/posts/new" variant="primary" size="lg" icon="wand" />}
          style={{ marginBottom: 16 }} />
      )}

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={230}>
          <StatCard icon="eye" tone="blue" value={fmt.n(totalViews)} label={`Profile views (${n}d)`} delta={42} spark={chart.views} sparkColor={c.blue} />
          <StatCard icon="phone" tone="green" value={fmt.n(totalCalls)} label="Calls from Google" delta={18} spark={chart.calls} sparkColor={c.emerald} />
          <StatCard icon="star" value={`${biz.rating.toFixed(1)}★`} label={`${biz.reviews} Google reviews`} delta={6} />
          <StatCard icon="inbox" tone="pink" value={fmt.n(leads.length)} label="Website leads" delta={-4} spark={series(14, 6, 4)} sparkColor={c.pink} />
        </Grid>
      </View>

      <Cols
        sideWidth={340}
        main={
          <>
            <Card>
              <CardHead title="Growth this fortnight" sub="Profile views vs calls from your Google Business Profile"
                right={<Segment value={range} onChange={changeRange}
                  items={[{ key: '14', label: '14d' }, { key: '30', label: '30d' }, { key: '90', label: '90d' }]} />} />
              <CardBody>
                <LineChart labels={chart.labels}
                  series={[
                    { name: 'Profile views', data: chart.views, color: c.lemonHover },
                    { name: 'Calls', data: chart.calls, color: c.blue },
                  ]} />
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Quick launch" sub="Jump straight into your most-used tools" />
              <CardBody>
                <Grid cols={4} minWidth={150} gap={12}>
                  {QUICK.map((q) => (
                    <Card key={q.id} pad={14} onPress={() => router.push(`/${q.id}` as any)} style={{ alignItems: 'center' }}>
                      <IconTile icon={q.icon} tone={q.tone} />
                      <T size={12.5} weight="600" style={{ marginTop: 9, textAlign: 'center' }}>{q.label}</T>
                      <Muted size={11.5}>{q.desc}</Muted>
                    </Card>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Needs your attention" sub="Items waiting on an action from you" />
              <CardBody>
                <Grid cols={3} minWidth={180} gap={12}>
                  <Todo icon="star" href="/review-reply" n={noReply} label="reviews without a reply" cta="Reply with AI" />
                  <Todo icon="send" href="/posts" n={pending} label="posts pending approval" cta="Review posts" />
                  <Todo icon="inbox" href="/leads" n={newLeads} label="new leads to contact" cta="Open inbox" />
                </Grid>
              </CardBody>
            </Card>
          </>
        }
        side={
          <>
            <Card>
              <CardHead title="Live connections" sub="Platforms linked to Limbu"
                right={<Button label="Manage" variant="ghost" size="sm" onPress={() => router.push('/social')} />} />
              <CardBody>
                <Stack gap={10}>
                  {LIVE.map((p) => {
                    const on = p.k === 'google' ? gmbConnected : social[p.k];
                    return (
                      <Row key={p.k} wrap={false} gap={11}>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: p.color,
                          alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={p.icon} size={17} color="#fff" />
                        </View>
                        <T size={13} weight="500" style={{ flex: 1 }} numberOfLines={1}>{p.name}</T>
                        {on ? <Badge label="Live" tone="green" dot />
                          : <Pressable onPress={() => router.push('/social')}><Badge label="Connect" /></Pressable>}
                      </Row>
                    );
                  })}
                </Stack>
              </CardBody>
            </Card>

            <Hero title="Rank higher on Google Maps"
              sub="Run a 5×5 grid audit to see exactly where you win — and where competitors beat you."
              cta={
                <Row gap={8}>
                  <LinkButton label="Run rank audit" href="/competitors" variant="primary" icon="target" />
                  <Button label="Plan keywords" variant="ghost" onPress={() => router.push('/keywords')} />
                </Row>
              } />

            <Card>
              <CardHead title="Recent activity" />
              <CardBody><Activity /></CardBody>
            </Card>
          </>
        }
      />
    </View>
  );
}

function Todo({ icon, href, n, label, cta }: { icon: IconName; href: string; n: number; label: string; cta: string }) {
  const { c } = useTheme();
  const router = useRouter();
  return (
    <Card pad={16} onPress={() => router.push(href as any)}>
      <Between>
        <IconTile icon={icon} />
        <Badge label={n ? 'Action needed' : 'All clear'} tone={n ? 'amber' : 'green'} />
      </Between>
      <T size={27} weight="800" heading style={{ marginTop: 11 }}>{String(n)}</T>
      <Muted>{label}</Muted>
      <Row gap={4} style={{ marginTop: 10 }}>
        <T size={12.5} weight="600" color={c.lemonInk}>{cta}</T>
        <Icon name="chevronR" size={14} color={c.lemonInk} />
      </Row>
    </Card>
  );
}

function Activity() {
  const { posts, reviews, leads } = useStore();
  const items = [
    ...posts.slice(0, 3).map((p) => ({ icon: 'send' as IconName, t: `Post ${p.status}`, d: `${p.caption.slice(0, 52)}…`, at: p.createdAt })),
    ...reviews.slice(0, 2).map((r) => ({ icon: 'star' as IconName, t: `${r.rating}★ review from ${r.author}`, d: r.reply ? 'Replied automatically' : 'Awaiting reply', at: r.createdAt })),
    ...leads.slice(0, 2).map((l) => ({ icon: 'inbox' as IconName, t: `New lead — ${l.name}`, d: `${l.service} • ${l.source}`, at: l.createdAt })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);

  return (
    <Stack gap={13}>
      {items.map((i, k) => (
        <Row key={k} wrap={false} gap={11} align="flex-start">
          <IconTile icon={i.icon} size={30} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <T size={12.5} weight="600" numberOfLines={1}>{i.t}</T>
            <Muted size={11.5}>{i.d}</Muted>
          </View>
          <Muted size={11}>{fmt.ago(i.at)}</Muted>
        </Row>
      ))}
    </Stack>
  );
}

export function Hero({ title, sub, cta, style }: { title: string; sub: string; cta: React.ReactNode; style?: any }) {
  return (
    <View style={[{ borderRadius: radius.xl, padding: 24, backgroundColor: '#0F172B', overflow: 'hidden' }, style]}>
      <View style={{ position: 'absolute', right: -70, top: -80, width: 300, height: 300, borderRadius: 999,
        backgroundColor: 'rgba(250,204,21,0.16)' }} />
      <T size={22} weight="800" color="#fff" heading style={{ maxWidth: 520 }}>{title}</T>
      <T size={13.5} color="#CBD5E1" style={{ marginTop: 8, maxWidth: 520 }}>{sub}</T>
      <View style={{ marginTop: 18, flexDirection: 'row' }}>{cta}</View>
    </View>
  );
}
