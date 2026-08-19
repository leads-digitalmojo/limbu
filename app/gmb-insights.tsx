import React, { useState } from 'react';
import { View } from 'react-native';
import { BarChart, LineChart } from '../components/charts';
import { StatCard } from '../components/StatCard';
import {
  Between, Button, Card, CardBody, CardHead, Divider, Grid, IconTile, Muted, PageHeader,
  Progress, Row, Select, Stack, T, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { KEYWORD_SEEDS, lastDays, series } from '../lib/mock';
import { useBiz } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

const RANGES = [
  { value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' }, { value: '52', label: 'This year' },
];

export default function GmbInsights() {
  const { c } = useTheme();
  const biz = useBiz();
  const { toast } = useUI();
  const { run, isBusy } = useWork();

  const [range, setRange] = useState('30');
  const [data, setData] = useState(() => build(30));

  function build(n: number) {
    return {
      labels: lastDays(n), views: series(n, 320, 110), searches: series(n, 540, 180),
      calls: series(n, 52, 20), dirs: series(n, 88, 34),
    };
  }
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  return (
    <View>
      <PageHeader eyebrow="Performance" eyebrowIcon="chart" title="GMB Insights"
        sub={`How customers find and interact with ${biz.name} on Google Search and Maps.`}
        actions={
          <>
            <View style={{ width: 180 }}>
              <Select value={range} options={RANGES}
                onChange={(v) => { setRange(v); setData(build(Number(v))); toast('Range updated', RANGES.find((r) => r.value === v)?.label); }} />
            </View>
            <Button label="Export" icon="download" loading={isBusy('x')}
              onPress={() => run('x', 900, () => toast('Exported', 'gmb-insights.csv', 'ok'))} />
          </>
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={230}>
          <StatCard icon="eye" tone="blue" value={fmt.compact(sum(data.views))} label="Profile views" delta={442} spark={data.views} sparkColor={c.blue} />
          <StatCard icon="search" value={fmt.compact(sum(data.searches))} label="Search impressions" delta={85} spark={data.searches} sparkColor={c.lemonHover} />
          <StatCard icon="phone" tone="green" value={fmt.n(sum(data.calls))} label="Calls" delta={31} spark={data.calls} sparkColor={c.emerald} />
          <StatCard icon="navigation" tone="pink" value={fmt.n(sum(data.dirs))} label="Direction requests" delta={19} spark={data.dirs} sparkColor={c.pink} />
        </Grid>
      </View>

      <Stack gap={16}>
        <Card>
          <CardHead title="Discovery over time" sub="Views vs search impressions" />
          <CardBody>
            <LineChart labels={data.labels} height={250}
              series={[
                { name: 'Profile views', data: data.views, color: c.lemonHover },
                { name: 'Search impressions', data: data.searches, color: c.blue },
              ]} />
          </CardBody>
        </Card>

        <Grid cols={2} minWidth={340} gap={16}>
          <Card>
            <CardHead title="Customer actions" sub="What people did after finding you" />
            <CardBody>
              <BarChart color={c.lemonHover} height={200}
                data={[sum(data.calls), sum(data.dirs), Math.round(sum(data.views) * 0.08), Math.round(sum(data.views) * 0.03)]}
                labels={['Calls', 'Directions', 'Website', 'Bookings']} />
            </CardBody>
          </Card>

          <Card>
            <CardHead title="How customers search" />
            <CardBody>
              <Stack gap={14}>
                {([['Discovery — searched a category or service', 68, 'blue'],
                   ['Direct — searched your business name', 24, 'green'],
                   ['Branded — searched a brand you carry', 8, 'lemon']] as const).map(([l, v, tone]) => (
                  <View key={l}>
                    <Between style={{ marginBottom: 6 }}>
                      <T size={12} style={{ flexShrink: 1 }}>{l}</T>
                      <T size={12} weight="700">{v}%</T>
                    </Between>
                    <Progress value={v} tone={tone as any} />
                  </View>
                ))}
                <Divider />
                <T size={13} weight="700">Top search queries</T>
                {KEYWORD_SEEDS.slice(0, 5).map(([kw, vol]) => (
                  <Between key={kw}>
                    <T size={12}>{kw}</T>
                    <Muted>{fmt.n(Math.round(vol / 28))} views</Muted>
                  </Between>
                ))}
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Grid cols={3} minWidth={250} gap={16}>
          <Tile title="Where people see you" a="Google Maps" av="62% of views" b="Google Search — 38%" icon="map" />
          <Tile title="Peak day" a="Saturday" av="214 views" b="Quietest: Sunday — 48 views" icon="calendar" />
          <Tile title="Peak time" a="6 – 8 PM" av="31% of calls" b="Slowest: 2 – 4 PM" icon="clock" />
        </Grid>
      </Stack>
    </View>
  );
}

function Tile({ title, a, av, b, icon }: { title: string; a: string; av: string; b: string; icon: any }) {
  return (
    <Card pad={16}>
      <Between>
        <T size={13} weight="700">{title}</T>
        <IconTile icon={icon} size={30} />
      </Between>
      <T size={22} weight="800" heading style={{ marginTop: 12 }}>{a}</T>
      <Muted>{av}</Muted>
      <Divider style={{ marginVertical: 12 }} />
      <Muted>{b}</Muted>
    </Card>
  );
}
