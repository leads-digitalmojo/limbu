import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Donut } from '../components/charts';
import { Icon, IconName } from '../components/Icon';
import { StatCard } from '../components/StatCard';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Cols, Divider, Empty, Field, Grid,
  IconTile, Input, Muted, PageHeader, Progress, Row, Segment, Select, Stack, T, useWork,
} from '../components/ui';
import { competitorsApi } from '../lib/api/competitors';
import { fmt } from '../lib/format';
import { COMPETITORS, KEYWORD_SEEDS, pick, rand, uid } from '../lib/mock';
import { COSTS } from '../lib/nav';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import type { Audit, GridPoint } from '../store/types';
import { useTheme } from '../theme/ThemeProvider';

const RANK_COLORS = ['#059669', '#22C55E', '#EAB308', '#F97316', '#DC2626', '#475569'];
const rankColor = (r: number | null) =>
  r == null ? RANK_COLORS[5] : r <= 1 ? RANK_COLORS[0] : r <= 3 ? RANK_COLORS[1]
    : r <= 7 ? RANK_COLORS[2] : r <= 12 ? RANK_COLORS[3] : RANK_COLORS[4];

function buildAudit(n: number, kw: string, city: string, bizId: string): Audit {
  const pts: GridPoint[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dist = Math.hypot(x - (n - 1) / 2, y - (n - 1) / 2);
      let rank: number | null = Math.max(1, Math.round(1 + dist * 1.7 + (Math.random() * 3 - 1)));
      if (rank > 20) rank = null;
      pts.push({ x, y, rank, competitor: pick(COMPETITORS) });
    }
  }
  const ranked = pts.filter((p) => p.rank != null) as { rank: number }[];
  const avg = ranked.reduce((a, p) => a + p.rank, 0) / Math.max(1, ranked.length);
  const top3 = pts.filter((p) => p.rank && p.rank <= 3).length;
  const comps = COMPETITORS.map((name) => ({
    name, freq: rand(3, n * n), avg: (Math.random() * 8 + 1.4).toFixed(1),
    rating: (Math.random() * 1.4 + 3.6).toFixed(1), reviews: rand(60, 900),
  })).sort((a, b) => Number(a.avg) - Number(b.avg));

  return {
    id: uid('audit'), kw, city, bizId, n, pts, avg: avg.toFixed(1), top3,
    coverage: Math.round((ranked.length / pts.length) * 100),
    visibility: Math.round((top3 / pts.length) * 100),
    best: Math.min(...ranked.map((p) => p.rank)),
    comps, at: new Date().toISOString(),
  };
}

export default function Competitors() {
  const { c, width } = useTheme();
  const biz = useBiz();
  const { businesses, keywords, activeBiz, user, audits, spend, addAudit, removeAudit } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const kwOptions = keywords.length ? keywords.map((k) => k.kw) : KEYWORD_SEEDS.slice(0, 6).map((k) => k[0]);
  const [kw, setKw] = useState(kwOptions[0]);
  const [city, setCity] = useState(biz.city);
  const [bizId, setBizId] = useState(activeBiz);
  const [grid, setGrid] = useState('5');
  const [audit, setAudit] = useState<Audit | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [auditSource, setAuditSource] = useState<'live' | 'demo'>('demo');

  const n = Number(grid);
  const cost = COSTS.audit[n];

  const runAudit = async () => {
    if (user.credits < cost) return toast('Not enough credits', `This audit needs ${cost} credits`, 'err');
    const businessName = businesses.find((b) => b.id === bizId)?.name ?? biz.name;

    setAuditing(true);
    try {
      const { audit: live } = await competitorsApi.runAudit({ keyword: kw, city, businessName, gridSize: n as 1 | 3 | 5, bizId });
      spend(cost, `Competitor rank audit ${n}×${n}`);
      setAudit(live);
      setAuditSource('live');
      toast('Audit complete', `${cost} credits used — live from Google Maps`, 'ok');
      return;
    } catch {
      // no Maps credentials configured, city not found, or Google rejected the request — demo data either way
    } finally {
      setAuditing(false);
    }
    spend(cost, `Competitor rank audit ${n}×${n}`);
    setAudit(buildAudit(n, kw, city, bizId));
    setAuditSource('demo');
    toast('Audit complete', `${cost} credits used — demo data`, 'ok');
  };

  const openPoint = (p: GridPoint, i: number, a: Audit) => openModal({
    title: `Grid point ${i + 1}`,
    content: (
      <View>
        <Grid cols={2} minWidth={150} gap={10}>
          {([['Your rank', p.rank == null ? 'Not in top 20' : `#${p.rank}`],
            ['Keyword', `“${a.kw}”`],
            ['Top competitor here', p.competitor],
            ['Search area', `~${((Math.abs(p.x - (a.n - 1) / 2) + Math.abs(p.y - (a.n - 1) / 2)) * 1.2 + 0.5).toFixed(1)} km from clinic`],
          ] as const).map(([k, v]) => (
            <Card key={k} pad={12}><Muted size={11.5}>{k}</Muted><T size={13} weight="700">{v}</T></Card>
          ))}
        </Grid>
        <Card pad={14} style={{ marginTop: 14 }}>
          <T size={13} weight="700">Why you rank here</T>
          <Muted size={12.5} style={{ marginTop: 6 }}>
            {p.rank && p.rank <= 3
              ? 'Strong proximity signal plus review velocity. Keep posting weekly to hold this position.'
              : `You are outside the local pack at this point. ${p.competitor} has more reviews mentioning “${a.kw}”. Publish location-specific posts and collect reviews from customers in this area.`}
          </Muted>
        </Card>
      </View>
    ),
  });

  const openSaved = () => openModal({
    title: 'Saved audits', wide: true,
    content: audits.length ? (
      <Stack gap={0}>
        {audits.map((a) => (
          <Between key={a.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.line2 }}>
            <View>
              <T size={13} weight="700">“{a.kw}”</T>
              <Muted>{a.city} • {a.n}×{a.n} grid • {fmt.date(a.at)}</Muted>
            </View>
            <Row gap={8}>
              <Badge label={`#${a.avg} avg`} tone="green" />
              <Badge label={`${a.visibility}% vis`} tone="blue" />
              <Button label="Open" size="sm" onPress={() => { setAudit(a); closeModal(); }} />
              <Button label="Delete" size="sm" variant="ghost" icon="trash"
                onPress={() => { removeAudit(a.id); closeModal(); toast('Audit deleted'); }} />
            </Row>
          </Between>
        ))}
      </Stack>
    ) : <Empty icon="folder" title="No saved audits" desc="Run an audit and hit Save to keep a snapshot of your rankings over time." />,
  });

  const cellSize = Math.min(66, Math.max(38, (Math.min(width, 900) - 420) / n));

  return (
    <View>
      <PageHeader eyebrow="Local SEO" eyebrowIcon="map" title="Competitor Analysis"
        sub="See exactly where you rank on Google Maps across your city — and who is beating you at each point."
        actions={<Button label={`Saved audits (${audits.length})`} icon="folder" onPress={openSaved} />} />

      <Card style={{ marginBottom: 16 }}>
        <CardHead title="New rank audit" sub={`Costs ${cost} credits for a ${n}×${n} grid`} />
        <CardBody>
          <Grid cols={4} minWidth={200} gap={14}>
            <Field label="Business" style={{ marginBottom: 0 }}>
              <Select value={bizId} onChange={setBizId} options={businesses.map((b) => ({ value: b.id, label: b.name }))} />
            </Field>
            <Field label="Keyword" style={{ marginBottom: 0 }}>
              <Select value={kw} onChange={setKw} options={kwOptions.map((k) => ({ value: k, label: k }))} />
            </Field>
            <Field label="City" style={{ marginBottom: 0 }}>
              <Input value={city} onChangeText={setCity} />
            </Field>
            <Field label="Grid size" style={{ marginBottom: 0 }}>
              <Segment value={grid} onChange={setGrid}
                items={[{ key: '1', label: '1×1' }, { key: '3', label: '3×3' }, { key: '5', label: '5×5' }]} />
            </Field>
          </Grid>
          <Row gap={12} style={{ marginTop: 16 }}>
            <Button label="Run rank audit" variant="primary" size="lg" icon="target" loading={auditing} onPress={runAudit} />
            <Muted>Scans real Google Maps positions from up to {n * n} geographic points</Muted>
          </Row>
        </CardBody>
      </Card>

      {!audit ? null : (
        <View>
          <View style={{ marginBottom: 16 }}>
            <Grid cols={4} minWidth={220}>
              <StatCard icon="target" value={`#${audit.avg}`} label="Average map position" delta={12} />
              <StatCard icon="eye" tone="green" value={`${audit.visibility}%`} label="Visibility (top 3)" delta={9} />
              <StatCard icon="map" tone="blue" value={`${audit.coverage}%`} label="Grid coverage" />
              <StatCard icon="crown" tone="orange" value={`#${audit.best}`} label="Best rank achieved" />
            </Grid>
          </View>

          <Cols
            sideWidth={360}
            main={
              <>
                <Card>
                  <CardHead title="Geographic rank grid" sub={`“${audit.kw}” in ${audit.city} • ${audit.n}×${audit.n} points`}
                    right={
                      <Row gap={10} wrap={false} align="center">
                        {auditSource === 'live'
                          ? <Badge label="Live from Google Maps" tone="green" icon="checkCircle" />
                          : <Badge label="Demo data" tone="amber" />}
                        <Row gap={6}>
                          {[['#1', 0], ['2–3', 1], ['4–7', 2], ['8–12', 3], ['13–20', 4], ['20+', 5]].map(([l, i]) => (
                            <Row key={String(l)} gap={4} wrap={false}>
                              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: RANK_COLORS[i as number] }} />
                              <Muted size={11}>{l}</Muted>
                            </Row>
                          ))}
                        </Row>
                      </Row>
                    } />
                  <CardBody>
                    <View style={{ alignSelf: 'center' }}>
                      {Array.from({ length: audit.n }, (_, y) => (
                        <Row key={y} gap={7} wrap={false} style={{ marginBottom: 7 }}>
                          {Array.from({ length: audit.n }, (_, x) => {
                            const i = y * audit.n + x;
                            const p = audit.pts[i];
                            return (
                              <Pressable key={x} onPress={() => openPoint(p, i, audit)}
                                style={{ width: cellSize, height: cellSize, borderRadius: 10,
                                  backgroundColor: rankColor(p.rank), alignItems: 'center', justifyContent: 'center' }}>
                                <T size={15} weight="800" heading color={p.rank && p.rank > 3 && p.rank <= 7 ? '#0F172B' : '#fff'}>
                                  {p.rank == null ? '20+' : String(p.rank)}
                                </T>
                              </Pressable>
                            );
                          })}
                        </Row>
                      ))}
                    </View>
                    <Muted style={{ textAlign: 'center', marginTop: 14 }}>
                      Each square is a real search location around {biz.loc}. Tap a point for detail.
                    </Muted>
                  </CardBody>
                </Card>

                <Card>
                  <CardHead title="Competitor comparison" sub="Who shows up when you don’t" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ minWidth: Math.max(width - 460, 620) }}>
                      <Row wrap={false} gap={0} style={{ backgroundColor: c.surface2, borderBottomWidth: 1, borderColor: c.line }}>
                        {[['Business', 2.6], ['Avg. position', 1.2], ['Appears at', 1.4], ['Rating', 1.4], ['Score', 1.2]].map(([h, f], i) => (
                          <View key={i} style={{ flex: f as number, padding: 11 }}>
                            <T size={10.5} weight="700" color={c.text3} style={{ letterSpacing: 0.8 }}>{String(h).toUpperCase()}</T>
                          </View>
                        ))}
                      </Row>
                      <Row wrap={false} gap={0} style={{ backgroundColor: c.lemonSoft, borderBottomWidth: 1, borderColor: c.line2 }}>
                        <View style={{ flex: 2.6, padding: 11 }}>
                          <Row gap={7}><T size={13} weight="700">{biz.name}</T><Badge label="You" tone="lemon" /></Row>
                        </View>
                        <View style={{ flex: 1.2, padding: 11 }}><T size={13} weight="600">#{audit.avg}</T></View>
                        <View style={{ flex: 1.4, padding: 11 }}><T size={13}>{audit.coverage}% of grid</T></View>
                        <View style={{ flex: 1.4, padding: 11 }}><T size={13}>{biz.rating}★</T></View>
                        <View style={{ flex: 1.2, padding: 11 }}><Progress value={audit.visibility} width={70} /></View>
                      </Row>
                      {audit.comps.map((cp) => (
                        <Row key={cp.name} wrap={false} gap={0} style={{ borderBottomWidth: 1, borderBottomColor: c.line2 }}>
                          <View style={{ flex: 2.6, padding: 11 }}><T size={13}>{cp.name}</T></View>
                          <View style={{ flex: 1.2, padding: 11 }}><T size={13} weight="600">#{cp.avg}</T></View>
                          <View style={{ flex: 1.4, padding: 11 }}><T size={13}>{Math.round((cp.freq / (audit.n * audit.n)) * 100)}% of grid</T></View>
                          <View style={{ flex: 1.4, padding: 11 }}><T size={13}>{cp.rating}★ ({cp.reviews})</T></View>
                          <View style={{ flex: 1.2, padding: 11 }}>
                            <Progress value={Math.round((cp.freq / (audit.n * audit.n)) * 100)} tone="blue" width={70} />
                          </View>
                        </Row>
                      ))}
                    </View>
                  </ScrollView>
                </Card>
              </>
            }
            side={
              <>
                <Card>
                  <CardHead title="Visibility score" />
                  <CardBody>
                    <Donut value={audit.visibility} max={100} color={c.lemonHover} label="% top-3 visibility" />
                    <Divider />
                    <Between><Muted>Points in top 3</Muted><T size={13} weight="700">{audit.top3} / {audit.n * audit.n}</T></Between>
                    <Between style={{ marginTop: 6 }}><Muted>Best position</Muted><T size={13} weight="700">#{audit.best}</T></Between>
                    <Between style={{ marginTop: 6 }}><Muted>Grid coverage</Muted><T size={13} weight="700">{audit.coverage}%</T></Between>
                  </CardBody>
                </Card>

                <Card>
                  <CardHead title="AI recommendations" sub="Ranked by impact" />
                  <CardBody>
                    <Stack gap={12}>
                      {([
                        ['star', 'Collect 25 more reviews', `You need roughly 25 reviews to overtake ${audit.comps[0].name} on review count in the local pack.`, 'lemon', 'High', 'red'],
                        ['send', `Post 3× per week with “${audit.kw}”`, 'Businesses posting weekly rank 34% higher on average across the grid.', 'blue', 'Med', 'amber'],
                        ['pin', 'Add service areas to your profile', 'Your coverage drops sharply beyond 3 km. Listing nearby localities widens the radius.', 'green', 'Low', 'slate'],
                        ['image', 'Upload 10 fresh photos', 'Profiles with recent photos get 42% more direction requests.', 'pink', 'Low', 'slate'],
                      ] as const).map(([icon, title, desc, tone, pri, priTone]) => (
                        <Row key={title} gap={11} wrap={false} align="flex-start">
                          <IconTile icon={icon as IconName} tone={tone as any} size={32} />
                          <View style={{ flex: 1 }}>
                            <T size={12.5} weight="700">{title}</T>
                            <Muted size={11.5} style={{ marginTop: 3 }}>{desc}</Muted>
                          </View>
                          <Badge label={pri} tone={priTone as any} />
                        </Row>
                      ))}
                    </Stack>
                  </CardBody>
                </Card>

                <Card pad={16}>
                  <Row gap={8}>
                    <Button label="Save audit" variant="primary" icon="folder" loading={isBusy('save')}
                      onPress={() => run('save', 700, () => { addAudit(audit); toast('Audit saved', 'Find it under Saved audits', 'ok'); })} />
                    <Button label="Download PDF" icon="download" loading={isBusy('pdf')}
                      onPress={() => run('pdf', 1200, () => toast('PDF ready', `rank-audit-${audit.kw.replace(/\s+/g, '-')}.pdf`, 'ok'))} />
                  </Row>
                </Card>
              </>
            }
          />
        </View>
      )}
    </View>
  );
}
