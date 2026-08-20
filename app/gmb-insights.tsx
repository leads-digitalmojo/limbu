import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { BarChart, LineChart } from '../components/charts';
import { StatCard } from '../components/StatCard';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Empty, Grid, Muted, PageHeader, Select, Stack,
} from '../components/ui';
import { gmbApi } from '../lib/api/gmb';
import { fmt } from '../lib/format';
import { useBiz } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

const RANGES = [
  { value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' }, { value: '52', label: 'This year' },
];

type Data = { labels: string[]; views: number[]; searches: number[]; calls: number[]; dirs: number[]; websiteClicks: number[] };

export default function GmbInsights() {
  const { c } = useTheme();
  const biz = useBiz();
  const { toast } = useUI();

  const [range, setRange] = useState('30');
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(n: number) {
    if (!biz?.googleLocationId) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const live = await gmbApi.getInsights(biz.googleLocationId, n);
      setData({ labels: live.labels, views: live.views, searches: live.searchViews, calls: live.calls, dirs: live.directions, websiteClicks: live.websiteClicks });
    } catch {
      toast('Could not load insights', 'Check your Google connection and try again', 'err');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(Number(range)); }, [biz?.googleLocationId]);

  if (!biz) {
    return (
      <View>
        <PageHeader eyebrow="Performance" eyebrowIcon="chart" title="GMB Insights"
          sub="Connect your Google Business Profile to see performance data." />
        <Card><Empty icon="chart" title="No business connected"
          desc="Connect a Google Business Profile location to see views, calls and direction requests." /></Card>
      </View>
    );
  }

  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const exportCsv = () => {
    if (!data || Platform.OS !== 'web') return;
    const rows = [
      ['date', 'views', 'search impressions', 'calls', 'direction requests', 'website clicks'],
      ...data.labels.map((label, i) => [label, data.views[i], data.searches[i], data.calls[i], data.dirs[i], data.websiteClicks[i]]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmb-insights-${biz.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported', `gmb-insights-${range}d.csv`, 'ok');
  };

  return (
    <View>
      <PageHeader eyebrow="Performance" eyebrowIcon="chart" title="GMB Insights"
        sub={`How customers find and interact with ${biz.name} on Google Search and Maps.`}
        actions={
          <>
            {data && <Badge label="Live from Google" tone="green" icon="checkCircle" />}
            <View style={{ width: 180 }}>
              <Select value={range} options={RANGES}
                onChange={(v) => { setRange(v); load(Number(v)); }} />
            </View>
            <Button label="Export" icon="download" disabled={!data} onPress={exportCsv} />
          </>
        } />

      {!data ? (
        <Card>
          <Empty icon="chart" title={loading ? 'Loading…' : 'No insights available'}
            desc={loading ? 'Pulling performance data from Google.' : 'Could not load performance data for this location right now.'} />
        </Card>
      ) : (
        <>
          <View style={{ marginBottom: 16 }}>
            <Grid cols={4} minWidth={230}>
              <StatCard icon="eye" tone="blue" value={fmt.compact(sum(data.views))} label="Profile views" spark={data.views} sparkColor={c.blue} />
              <StatCard icon="search" value={fmt.compact(sum(data.searches))} label="Search impressions" spark={data.searches} sparkColor={c.lemonHover} />
              <StatCard icon="phone" tone="green" value={fmt.n(sum(data.calls))} label="Calls" spark={data.calls} sparkColor={c.emerald} />
              <StatCard icon="navigation" tone="pink" value={fmt.n(sum(data.dirs))} label="Direction requests" spark={data.dirs} sparkColor={c.pink} />
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

            <Card>
              <CardHead title="Customer actions" sub="What people did after finding you" />
              <CardBody>
                <BarChart color={c.lemonHover} height={200}
                  data={[sum(data.calls), sum(data.dirs), sum(data.websiteClicks)]}
                  labels={['Calls', 'Directions', 'Website clicks']} />
              </CardBody>
            </Card>
          </Stack>
        </>
      )}
    </View>
  );
}
