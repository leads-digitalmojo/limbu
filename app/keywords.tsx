import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { BarChart } from '../components/charts';
import { Icon } from '../components/Icon';
import { StatCard } from '../components/StatCard';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Chip, Cols, Empty, Grid, Input,
  Muted, PageHeader, Progress, Row, T, useWork,
} from '../components/ui';
import { keywordsApi } from '../lib/api/keywords';
import { fmt } from '../lib/format';
import { uid } from '../lib/mock';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

type Idea = { kw: string; vol: number; diff: number; cpc: string };

export default function Keywords() {
  const { c, width } = useTheme();
  const router = useRouter();
  const biz = useBiz();
  const { keywords, posts, addKeyword, removeKeyword } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const [q, setQ] = useState('');
  const [city, setCity] = useState(biz?.city ?? '');
  const [results, setResults] = useState<Idea[]>([]);
  const [lastQ, setLastQ] = useState('');
  const [searching, setSearching] = useState(false);

  const search = async (seed?: string) => {
    const term = (seed ?? q).trim();
    if (!term) return toast('Enter a service', 'e.g. dental clinic', 'err');
    setQ(term);
    setSearching(true);
    try {
      const { ideas } = await keywordsApi.getIdeas(term);
      const all = ideas.slice(0, 16);
      setResults(all);
      setLastQ(term);
      toast(`Found ${all.length} keywords`, 'Real search volume from Google Ads', 'ok');
    } catch {
      toast('Could not fetch keyword data', 'Check your Google Ads connection and try again', 'err');
    } finally {
      setSearching(false);
    }
  };

  const importExcel = () => openModal({
    title: 'Import keywords from Excel',
    content: (
      <View>
        <Card pad={30} style={{ alignItems: 'center' }}>
          <Icon name="excel" size={26} color={c.text2} />
          <T size={13} weight="700" style={{ marginTop: 10 }}>Drop your .xlsx or .csv here</T>
          <Muted style={{ textAlign: 'center', marginTop: 4 }}>One keyword per row. Volume and difficulty are optional.</Muted>
        </Card>
        <Muted size={11.5} style={{ marginTop: 10 }}>Limbu will fetch fresh volume and difficulty for every imported keyword.</Muted>
      </View>
    ),
    footer: (
      <Row gap={9}>
        <Button label="Cancel" variant="ghost" onPress={closeModal} />
        <Button label="Import" variant="primary" onPress={() => { closeModal(); toast('Import queued', 'We will email you when processing finishes', 'ok'); }} />
      </Row>
    ),
  });

  return (
    <View>
      <PageHeader eyebrow="Local SEO" eyebrowIcon="key" title="Keyword Planner"
        sub="Find what customers actually type into Google near you, then reuse those keywords in every AI post."
        actions={
          <>
            <Button label="Import Excel" icon="excel" onPress={importExcel} />
            <Button label="PDF report" icon="file" loading={isBusy('pdf')}
              onPress={() => run('pdf', 1100, () => toast('PDF ready', `keyword-report-${(city || 'report').toLowerCase()}.pdf`, 'ok'))} />
            <Button label="WhatsApp report" variant="primary" icon="whatsapp" loading={isBusy('wa')}
              onPress={() => run('wa', 900, () => toast('Sent on WhatsApp', 'Report delivered to your registered number', 'ok'))} />
          </>
        } />

      <Card style={{ marginBottom: 16 }}>
        <CardBody>
          <Row gap={10}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Input value={q} onChangeText={setQ} icon="search" onSubmitEditing={() => search()}
                placeholder="Enter a service or business type — e.g. dental clinic" />
            </View>
            <View style={{ width: 150 }}><Input value={city} onChangeText={setCity} placeholder="City" /></View>
            <Button label="Find keywords" variant="primary" icon="sparkles" loading={searching} onPress={() => search()} />
          </Row>
          <Row gap={8} style={{ marginTop: 12 }}>
            <Muted>Try:</Muted>
            {['dentist near me', 'teeth whitening', 'dental implants', 'braces cost'].map((s) => (
              <Chip key={s} label={s} onPress={() => search(s)} />
            ))}
          </Row>
        </CardBody>
      </Card>

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="key" value={fmt.n(keywords.length)} label="Saved keywords" />
          <StatCard icon="trend" tone="green" value={fmt.compact(keywords.reduce((a, k) => a + k.vol, 0))} label="Combined monthly volume" />
          <StatCard icon="target" tone="blue" value={String(Math.round(keywords.reduce((a, k) => a + k.diff, 0) / Math.max(1, keywords.length)) || 0)} label="Avg. difficulty" />
          <StatCard icon="send" tone="pink" value={fmt.n(posts.filter((p) => p.keywords.length).length)} label="Posts using keywords" />
        </Grid>
      </View>

      <Cols
        sideWidth={350}
        main={
          <Card>
            <CardHead title="Keyword ideas"
              sub={results.length ? `${results.length} ideas for "${lastQ}"` : 'Search to see keyword ideas'}
              right={results.length ? <Badge label="Live from Google Ads" tone="green" icon="checkCircle" /> : undefined} />
            {results.length === 0 ? (
              <Empty icon="search" title="Start a search" desc="Enter a service above to see the keywords customers use near you." />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: Math.max(width - 420, 640) }}>
                  <Row wrap={false} gap={0} style={{ backgroundColor: c.surface2, borderBottomWidth: 1, borderColor: c.line }}>
                    {[['Keyword', 3], ['Volume / mo', 1.3], ['Difficulty', 1.8], ['CPC', 1], ['', 1.2]].map(([h, f], i) => (
                      <View key={i} style={{ flex: f as number, padding: 11 }}>
                        <T size={10.5} weight="700" color={c.text3} style={{ letterSpacing: 0.8 }}>{String(h).toUpperCase()}</T>
                      </View>
                    ))}
                  </Row>
                  {results.map((r) => {
                    const saved = keywords.some((k) => k.kw === r.kw);
                    const tone = r.diff < 35 ? 'green' : r.diff < 60 ? 'lemon' : 'red';
                    return (
                      <Row key={r.kw} wrap={false} gap={0} style={{ borderBottomWidth: 1, borderBottomColor: c.line2 }}>
                        <View style={{ flex: 3, padding: 11 }}><T size={13} weight="700">{r.kw}</T></View>
                        <View style={{ flex: 1.3, padding: 11 }}><T size={13} weight="600">{fmt.n(r.vol)}</T></View>
                        <View style={{ flex: 1.8, padding: 11 }}>
                          <Row gap={8} wrap={false}>
                            <Progress value={r.diff} tone={tone as any} width={64} />
                            <T size={12}>{String(r.diff)}</T>
                          </Row>
                        </View>
                        <View style={{ flex: 1, padding: 11 }}><T size={13} weight="600">₹{r.cpc}</T></View>
                        <View style={{ flex: 1.2, padding: 8 }}>
                          <Button label={saved ? 'Saved' : 'Save'} size="sm" icon={saved ? 'check' : 'plus'}
                            variant={saved ? 'outline' : 'primary'} disabled={saved}
                            onPress={() => {
                              addKeyword({ id: uid('kw'), kw: r.kw, vol: r.vol, diff: r.diff, cpc: r.cpc });
                              toast('Keyword saved', `${r.kw} is now available in Post Management`, 'ok');
                            }} />
                        </View>
                      </Row>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </Card>
        }
        side={
          <>
            <Card>
              <CardHead title="Saved keywords" sub="Shared with Post Management" />
              <CardBody>
                {keywords.length ? (
                  <Row gap={7}>
                    {keywords.map((k) => (
                      <Chip key={k.id} label={k.kw} on onPress={() => { removeKeyword(k.id); toast('Keyword removed'); }}
                        right={<Icon name="x" size={12} color={c.onLemon} />} />
                    ))}
                  </Row>
                ) : <Muted>No saved keywords yet.</Muted>}
              </CardBody>
              <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface2 }}>
                <Button label="Use in a Magic Post" variant="primary" size="sm" icon="wand" block
                  onPress={() => router.push('/posts/new')} />
              </View>
            </Card>

            <Card>
              <CardHead title="Volume comparison" />
              <CardBody>
                {keywords.length ? (
                  <BarChart data={keywords.slice(0, 6).map((k) => k.vol)}
                    labels={keywords.slice(0, 6).map((k) => k.kw.split(' ')[0])} color={c.lemonHover} height={190} />
                ) : <Muted>Save keywords to compare their search volume.</Muted>}
              </CardBody>
            </Card>
          </>
        }
      />
    </View>
  );
}
