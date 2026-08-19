import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Donut } from '../components/charts';
import { Icon, IconName } from '../components/Icon';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Cols, IconTile, Muted, PageHeader,
  Progress, Row, Select, Stack, T, useWork,
} from '../components/ui';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

const CHECKS = [
  { label: 'Business name & category', w: 10, score: 100, note: 'Primary category “Dental clinic” matches your services.' },
  { label: 'Secondary categories', w: 8, score: 60, note: 'Add “Cosmetic dentist” and “Orthodontist” to appear in more searches.' },
  { label: 'Business hours', w: 9, score: 100, note: 'Complete, including special holiday hours.' },
  { label: 'Photos & videos', w: 14, score: 45, note: 'Only 11 photos. Profiles with 30+ get 42% more direction requests.' },
  { label: 'Services & pricing', w: 12, score: 70, note: '6 of 11 services listed. Add prices to improve conversions.' },
  { label: 'Business description', w: 8, score: 80, note: 'Good, but missing your top keyword “dentist near me”.' },
  { label: 'Post frequency', w: 14, score: 55, note: 'Last post 9 days ago. Weekly posting is the ranking sweet spot.' },
  { label: 'Reviews & replies', w: 15, score: 78, note: '7 reviews are still waiting for a reply.' },
  { label: 'Attributes & amenities', w: 5, score: 40, note: 'Add wheelchair access, parking and payment options.' },
  { label: 'Website & booking link', w: 5, score: 100, note: 'Website and appointment link are both live.' },
];

const PLAN: [IconName, string, string, string][] = [
  ['image', 'Upload 19 more photos', '+14 pts', '/assets'],
  ['send', 'Publish 4 posts this month', '+13 pts', '/posts/new'],
  ['reply', 'Reply to 7 pending reviews', '+9 pts', '/review-reply'],
  ['tag', 'Add 5 missing services', '+7 pts', '/gmb-health'],
  ['key', 'Add “dentist near me” to your description', '+5 pts', '/keywords'],
];

export default function GmbHealth() {
  const { c } = useTheme();
  const router = useRouter();
  const biz = useBiz();
  const { businesses, activeBiz, setActiveBiz } = useStore();
  const { toast } = useUI();
  const { run, isBusy } = useWork();

  const score = Math.round(
    CHECKS.reduce((a, x) => a + x.score * x.w, 0) / CHECKS.reduce((a, x) => a + x.w, 0));
  const missing = CHECKS.filter((x) => x.score < 80);
  const scoreColor = score >= 80 ? c.emerald : score >= 60 ? c.lemonHover : c.red;

  return (
    <View>
      <PageHeader eyebrow="Profile audit" eyebrowIcon="stethoscope" title="GMB Health"
        sub={`A full audit of ${biz.name} against the 10 signals Google weighs most for local ranking.`}
        actions={
          <>
            <View style={{ width: 220 }}>
              <Select value={activeBiz} onChange={setActiveBiz} options={businesses.map((b) => ({ value: b.id, label: b.name }))} />
            </View>
            <Button label="Run health check" variant="primary" icon="refresh" loading={isBusy('run')}
              onPress={() => run('run', 1800, () => toast('Health check complete', 'Audited 10 profile signals', 'ok'))} />
          </>
        } />

      <Cols
        sideWidth={320}
        main={
          <>
            <Card>
              <CardHead title="Profile audit" sub="Weighted by ranking impact" />
              <CardBody>
                <Stack gap={16}>
                  {CHECKS.map((x) => (
                    <View key={x.label}>
                      <Between style={{ marginBottom: 6 }}>
                        <Row gap={8} wrap={false} style={{ flexShrink: 1 }}>
                          <Icon name={x.score >= 80 ? 'checkCircle' : 'alert'} size={16}
                            color={x.score >= 80 ? c.emerald : x.score >= 60 ? c.lemonHover : c.red} />
                          <T size={13} weight="700">{x.label}</T>
                          <Badge label={`weight ${x.w}`} />
                        </Row>
                        <T size={12} weight="700">{x.score}%</T>
                      </Between>
                      <Progress value={x.score} tone={x.score >= 80 ? 'green' : x.score >= 60 ? 'lemon' : 'red'} />
                      <Muted size={11.5} style={{ marginTop: 6 }}>{x.note}</Muted>
                    </View>
                  ))}
                </Stack>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Optimisation plan" sub="Do these in order for the fastest gain" />
              <CardBody>
                <Stack gap={10}>
                  {PLAN.map(([icon, title, gain, href]) => (
                    <Card key={title} pad={11} onPress={() => router.push(href as any)}>
                      <Between>
                        <Row gap={10} wrap={false} style={{ flexShrink: 1 }}>
                          <IconTile icon={icon} size={30} />
                          <T size={13} weight="600" style={{ flexShrink: 1 }}>{title}</T>
                        </Row>
                        <Row gap={6} wrap={false}>
                          <Badge label={gain} tone="green" />
                          <Icon name="chevronR" size={15} color={c.text3} />
                        </Row>
                      </Between>
                    </Card>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </>
        }
        side={
          <>
            <Card pad={20}>
              <Donut value={score} max={100} color={scoreColor} label="Health score" />
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Badge tone={score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'}
                  label={score >= 80 ? 'Strong profile' : score >= 60 ? 'Needs work' : 'Critical issues'} />
                <Muted style={{ textAlign: 'center', marginTop: 10 }}>
                  Fixing the {missing.length} items below could lift you an estimated +{100 - score} points.
                </Muted>
              </View>
            </Card>

            <Card>
              <CardHead title="Missing information" />
              <CardBody>
                <Stack gap={10}>
                  {missing.map((x) => (
                    <Row key={x.label} gap={9} wrap={false}>
                      <Icon name="alert" size={15} color={c.red} />
                      <T size={12.5} style={{ flex: 1 }}>{x.label}</T>
                      <Badge label={`${x.score}%`} tone="red" />
                    </Row>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </>
        }
      />
    </View>
  );
}
