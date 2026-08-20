import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Donut } from '../components/charts';
import { Icon, IconName } from '../components/Icon';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Cols, Empty, IconTile, Muted, PageHeader,
  Progress, Row, Select, Stack, T,
} from '../components/ui';
import { gmbApi, GmbProfile } from '../lib/api/gmb';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

// score: null means "no real data source for this signal" — it shows as
// "Not tracked" instead of a fabricated number, and doesn't count toward
// the weighted average below.
type Check = { label: string; w: number; score: number | null; note: string };

// Photos & videos and Post frequency have no public API left to check at
// all: the Business Profile Photos/Media API was sunset for third-party
// apps in 2022, and Local Posts has been invite-only since the same year.
// Services & pricing and Attributes & amenities are real Google APIs, but
// scoring them meaningfully needs a per-category metadata lookup (the full
// list of *available* attributes for this business's category) that isn't
// built. None of these four get a number, ever.
const UNTRACKABLE: Record<string, string> = {
  'Photos & videos': 'Google has no public API for this anymore — check manually in Business Profile.',
  'Services & pricing': 'Needs a per-category attributes lookup that is not built yet.',
  'Post frequency': 'The Local Posts API has been invite-only since 2022.',
  'Attributes & amenities': 'Needs a per-category attributes lookup that is not built yet.',
};

function buildChecks(profile: GmbProfile | null, pendingReplies: number, totalReviews: number): Check[] {
  const nameScore = !profile ? null : profile.title && profile.primaryCategory ? 100 : (profile.title || profile.primaryCategory) ? 50 : 0;
  const nameNote = !profile ? 'Connect Google Business Profile to check this.'
    : profile.title && profile.primaryCategory ? `"${profile.primaryCategory}" is set as the primary category.`
    : 'Add a business name and a primary category on Google.';

  const secCount = profile?.additionalCategories.length ?? 0;
  const secScore = !profile ? null : Math.min(100, secCount * 34);
  const secNote = !profile ? 'Connect Google Business Profile to check this.'
    : secCount === 0 ? 'No secondary categories set — add a few to appear in more searches.'
    : `${secCount} secondary categor${secCount === 1 ? 'y' : 'ies'} set: ${profile.additionalCategories.join(', ')}.`;

  const hoursScore = !profile ? null : profile.hasHours ? 100 : 0;
  const hoursNote = !profile ? 'Connect Google Business Profile to check this.'
    : profile.hasHours ? 'Regular hours are set on your profile.' : 'No business hours set on Google.';

  const descLen = profile?.description?.length ?? 0;
  const descScore = !profile ? null : descLen >= 250 ? 100 : descLen > 0 ? 60 : 0;
  const descNote = !profile ? 'Connect Google Business Profile to check this.'
    : descLen === 0 ? 'No business description set.'
    : descLen >= 250 ? 'A full-length description is set.' : `Only ${descLen} characters — Google allows up to 750.`;

  const siteScore = !profile ? null : profile.websiteUri ? 100 : 0;
  const siteNote = !profile ? 'Connect Google Business Profile to check this.'
    : profile.websiteUri ? profile.websiteUri : 'No website URL set on your profile.';

  const replyRate = totalReviews === 0 ? 1 : (totalReviews - pendingReplies) / totalReviews;
  const reviewScore = Math.round(replyRate * 100);
  const reviewNote = totalReviews === 0 ? 'No reviews synced yet.'
    : pendingReplies === 0 ? 'Every review currently has a reply.'
    : `${pendingReplies} review${pendingReplies === 1 ? ' is' : 's are'} still waiting for a reply.`;

  return [
    { label: 'Business name & category', w: 10, score: nameScore, note: nameNote },
    { label: 'Secondary categories', w: 8, score: secScore, note: secNote },
    { label: 'Business hours', w: 9, score: hoursScore, note: hoursNote },
    { label: 'Photos & videos', w: 14, score: null, note: UNTRACKABLE['Photos & videos'] },
    { label: 'Services & pricing', w: 12, score: null, note: UNTRACKABLE['Services & pricing'] },
    { label: 'Business description', w: 8, score: descScore, note: descNote },
    { label: 'Post frequency', w: 14, score: null, note: UNTRACKABLE['Post frequency'] },
    // always derived from the reviews already in the store — real once review sync exists.
    { label: 'Reviews & replies', w: 15, score: reviewScore, note: reviewNote },
    { label: 'Attributes & amenities', w: 5, score: null, note: UNTRACKABLE['Attributes & amenities'] },
    { label: 'Website & booking link', w: 5, score: siteScore, note: siteNote },
  ];
}

const PLAN_BASE: [IconName, string, string][] = [
  ['image', 'Upload more photos', '/assets'],
  ['send', 'Publish posts more often', '/posts/new'],
  ['tag', 'Add missing services', '/gmb-health'],
  ['key', 'Work a top keyword into your description', '/keywords'],
];

export default function GmbHealth() {
  const { c } = useTheme();
  const router = useRouter();
  const biz = useBiz();
  const { businesses, activeBiz, setActiveBiz, reviews } = useStore();
  const { toast } = useUI();
  const [profile, setProfile] = useState<GmbProfile | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!biz?.googleLocationId) {
      setProfile(null);
      return;
    }
    setLoading(true);
    try {
      const live = await gmbApi.getProfile(biz.googleLocationId);
      setProfile(live);
    } catch {
      toast('Could not load profile data', 'Check your Google connection and try again', 'err');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [biz?.googleLocationId]);

  if (!biz) {
    return (
      <View>
        <PageHeader eyebrow="Profile audit" eyebrowIcon="stethoscope" title="GMB Health"
          sub="Connect your Google Business Profile to run an audit." />
        <Card><Empty icon="stethoscope" title="No business connected"
          desc="Connect a Google Business Profile location to see your health score." /></Card>
      </View>
    );
  }

  const pendingReplies = reviews.filter((r) => r.bizId === biz.id && !r.reply).length;
  const totalReviews = reviews.filter((r) => r.bizId === biz.id).length;
  const CHECKS = buildChecks(profile, pendingReplies, totalReviews);
  const scored = CHECKS.filter((x): x is Check & { score: number } => x.score != null);
  const score = scored.length ? Math.round(scored.reduce((a, x) => a + x.score * x.w, 0) / scored.reduce((a, x) => a + x.w, 0)) : null;
  const missing = scored.filter((x) => x.score < 80);
  const scoreColor = score == null ? c.text3 : score >= 80 ? c.emerald : score >= 60 ? c.lemonHover : c.red;

  const PLAN: [IconName, string, string, string][] = [
    ...PLAN_BASE.map(([icon, title, href]) => [icon, title, '', href] as [IconName, string, string, string]),
  ];
  if (pendingReplies > 0) {
    PLAN.splice(2, 0, ['reply', `Reply to ${pendingReplies} pending review${pendingReplies === 1 ? '' : 's'}`, '', '/review-reply']);
  }

  return (
    <View>
      <PageHeader eyebrow="Profile audit" eyebrowIcon="stethoscope" title="GMB Health"
        sub={`A full audit of ${biz.name} against the 10 signals Google weighs most for local ranking.`}
        actions={
          <>
            <View style={{ width: 220 }}>
              <Select value={activeBiz} onChange={setActiveBiz} options={businesses.map((b) => ({ value: b.id, label: b.name }))} />
            </View>
            <Button label="Run health check" variant="primary" icon="refresh" loading={loading} onPress={load} />
          </>
        } />

      <Cols
        sideWidth={320}
        main={
          <>
            <Card>
              <CardHead title="Profile audit" sub="Weighted by ranking impact — signals with no real data source don't count toward the score" />
              <CardBody>
                <Stack gap={16}>
                  {CHECKS.map((x) => (
                    <View key={x.label}>
                      <Between style={{ marginBottom: 6 }}>
                        <Row gap={8} wrap={false} style={{ flexShrink: 1 }}>
                          <Icon name={x.score == null ? 'info' : x.score >= 80 ? 'checkCircle' : 'alert'} size={16}
                            color={x.score == null ? c.text3 : x.score >= 80 ? c.emerald : x.score >= 60 ? c.lemonHover : c.red} />
                          <T size={13} weight="700">{x.label}</T>
                          <Badge label={`weight ${x.w}`} />
                        </Row>
                        <T size={12} weight="700" color={x.score == null ? c.text3 : undefined}>
                          {x.score == null ? 'Not tracked' : `${x.score}%`}
                        </T>
                      </Between>
                      {x.score != null && <Progress value={x.score} tone={x.score >= 80 ? 'green' : x.score >= 60 ? 'lemon' : 'red'} />}
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
                  {PLAN.map(([icon, title, , href]) => (
                    <Card key={title} pad={11} onPress={() => router.push(href as any)}>
                      <Between>
                        <Row gap={10} wrap={false} style={{ flexShrink: 1 }}>
                          <IconTile icon={icon} size={30} />
                          <T size={13} weight="600" style={{ flexShrink: 1 }}>{title}</T>
                        </Row>
                        <Row gap={6} wrap={false}>
                          <Badge label="Recommended" tone="green" />
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
              {score == null ? (
                <Empty icon="stethoscope" title="No score yet"
                  desc="Connect this location's Google Business Profile to compute a health score." />
              ) : (
                <>
                  <Donut value={score} max={100} color={scoreColor} label="Health score" />
                  <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <Badge tone={score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'}
                      label={score >= 80 ? 'Strong profile' : score >= 60 ? 'Needs work' : 'Critical issues'} />
                    <Muted style={{ textAlign: 'center', marginTop: 10 }}>
                      Fixing the {missing.length} items below could lift you an estimated +{100 - score} points.
                    </Muted>
                  </View>
                </>
              )}
            </Card>

            <Card>
              <CardHead title="Missing information" />
              <CardBody>
                {missing.length === 0 ? (
                  <Muted>Nothing missing among the signals Limbu can check.</Muted>
                ) : (
                  <Stack gap={10}>
                    {missing.map((x) => (
                      <Row key={x.label} gap={9} wrap={false}>
                        <Icon name="alert" size={15} color={c.red} />
                        <T size={12.5} style={{ flex: 1 }}>{x.label}</T>
                        <Badge label={`${x.score}%`} tone="red" />
                      </Row>
                    ))}
                  </Stack>
                )}
              </CardBody>
            </Card>
          </>
        }
      />
    </View>
  );
}
