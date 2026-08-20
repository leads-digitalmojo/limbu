/* Shared implementation behind /reviews and /review-reply */
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { StatCard } from './StatCard';
import { Icon } from './Icon';
import {
  Avatar, Badge, Between, Button, Card, CardBody, CardHead, Chip, Cols, Divider, Empty, Field,
  Grid, Input, Muted, PageHeader, Progress, Row, Select, Stack, Stars, T, ToggleRow,
} from './ui';
import { reviewsApi } from '../lib/api/reviews';
import { fmt } from '../lib/format';
import { COSTS } from '../lib/nav';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import type { Business, Review } from '../store/types';
import { useTheme } from '../theme/ThemeProvider';

async function generateReply(r: Review, biz: Business): Promise<string> {
  const { reply } = await reviewsApi.generateReply(biz.name, r.rating, r.text);
  return reply;
}

export function ReviewsScreen({ replyMode }: { replyMode: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  const biz = useBiz();
  const { reviews, businesses, settings, user, syncReviews, setReviewReply, setSetting, spend } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const [bulking, setBulking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('');
  const [rate, setRate] = useState('');
  const [onlyUnreplied, setOnlyUnreplied] = useState(replyMode);

  const total = reviews.length;
  const noReply = reviews.filter((r) => !r.reply).length;
  const avg = (reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, total)).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((r) => reviews.filter((x) => x.rating === r).length);

  const items = useMemo(() => reviews.filter((r) => {
    if (onlyUnreplied && r.reply) return false;
    if (loc && r.bizId !== loc) return false;
    if (rate && r.rating !== Number(rate)) return false;
    if (q && !`${r.author} ${r.text}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [reviews, q, loc, rate, onlyUnreplied]);

  const syncNow = async () => {
    if (!biz?.googleLocationId) return toast('No business connected', 'Connect a Google Business Profile first', 'err');
    setSyncing(true);
    try {
      const { reviews: live } = await reviewsApi.sync(biz.googleLocationId);
      syncReviews(biz.id, live);
      toast('Reviews synced', `${live.length} review${live.length === 1 ? '' : 's'} from Google`, 'ok');
    } catch {
      toast('Could not sync reviews', 'Check your Google connection and try again', 'err');
    } finally {
      setSyncing(false);
    }
  };

  const openReply = (r: Review, initial: string, charge: boolean) => {
    const owner = businesses.find((b) => b.id === r.bizId);
    let draft = initial;
    const Body = () => {
      const [v, setV] = useState(initial);
      const [regenerating, setRegenerating] = useState(false);
      draft = v;
      return (
        <View>
          <Card pad={14} style={{ backgroundColor: c.surface2, marginBottom: 14 }}>
            <Row gap={8}><Stars value={r.rating} /><Muted>{fmt.ago(r.createdAt)}</Muted></Row>
            <Muted size={13} style={{ marginTop: 8 }}>{r.text}</Muted>
          </Card>
          <Field label="Your reply" hint="Replies post publicly on your Google Business Profile.">
            <Input value={v} onChangeText={(t) => { setV(t); draft = t; }} multiline />
          </Field>
          <Button label="Regenerate with AI" size="sm" icon="refresh" loading={regenerating}
            onPress={async () => {
              if (!owner) return;
              setRegenerating(true);
              try {
                const t = await generateReply(r, owner);
                setV(t); draft = t;
              } catch {
                toast('Could not generate a reply', 'Check the Anthropic API key and try again', 'err');
              } finally {
                setRegenerating(false);
              }
            }} />
        </View>
      );
    };
    openModal({
      title: `Reply to ${r.author}`,
      content: <Body />,
      footer: (
        <Row gap={9}>
          <Button label="Cancel" variant="ghost" onPress={closeModal} />
          <Button label="Post reply" variant="primary" icon="send" onPress={async () => {
            if (!draft.trim()) return toast('Reply is empty', undefined, 'err');
            if (charge && user.credits < COSTS.reviewReply) return toast('Not enough credits', undefined, 'err');
            if (!owner?.googleLocationId || !r.googleReviewId) return toast('Cannot post', 'This review is not linked to a live Google location', 'err');
            try {
              await reviewsApi.postReply(owner.googleLocationId, r.googleReviewId, draft.trim());
              setReviewReply(r.id, draft.trim(), charge);
              if (charge) spend(COSTS.reviewReply, 'AI review reply');
              closeModal();
              toast('Reply posted', 'Published to Google Business Profile', 'ok');
            } catch {
              toast('Could not post reply', 'Check your Google connection and try again', 'err');
            }
          }} />
        </Row>
      ),
    });
  };

  const bulkReply = async () => {
    const pending = reviews.filter((r) => !r.reply);
    if (!pending.length) return toast('Nothing pending', 'Every review already has a reply', 'ok');
    const cost = pending.length * COSTS.reviewReply;
    if (user.credits < cost) return toast('Not enough credits', `Need ${cost} credits`, 'err');

    setBulking(true);
    let done = 0;
    let failed = 0;
    for (const r of pending) {
      const owner = businesses.find((b) => b.id === r.bizId);
      if (!owner?.googleLocationId || !r.googleReviewId) { failed++; continue; }
      try {
        const text = await generateReply(r, owner);
        await reviewsApi.postReply(owner.googleLocationId, r.googleReviewId, text);
        setReviewReply(r.id, text, true);
        done++;
      } catch {
        failed++;
      }
    }
    if (done > 0) spend(done * COSTS.reviewReply, `AI review replies ×${done}`);
    setBulking(false);
    toast(`Replied to ${done} review${done === 1 ? '' : 's'}`, failed ? `${failed} failed — try those individually` : undefined, done ? 'ok' : 'err');
  };

  return (
    <View>
      <PageHeader
        eyebrow={replyMode ? 'AI review reply' : 'Reputation'}
        title={replyMode ? 'Review Reply' : 'Review Management'}
        sub={replyMode
          ? 'Generate on-brand replies with AI, approve them, or let Limbu auto-reply for you.'
          : 'Every Google review across your locations, in one inbox.'}
        actions={
          <>
            <Button label="Refresh" icon="refresh" loading={syncing} onPress={syncNow} />
            <Button label="Force sync" icon="sync" loading={syncing} onPress={syncNow} />
            <Button label="AI reply to all pending" variant="primary" icon="sparkles" loading={bulking} onPress={bulkReply} />
          </>
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="star" value={`${avg}★`} label="Average rating" />
          <StatCard icon="message" tone="blue" value={fmt.n(total)} label="Total reviews" />
          <StatCard icon="reply" tone="green" value={`${Math.round(((total - noReply) / Math.max(1, total)) * 100)}%`} label="Reply rate" />
          <StatCard icon="alert" tone="orange" value={fmt.n(noReply)} label="Without reply" />
        </Grid>
      </View>

      <Cols
        sideWidth={320}
        main={
          <>
            <Card>
              <CardBody>
                <Row gap={10}>
                  <View style={{ flex: 1, minWidth: 200 }}>
                    <Input value={q} onChangeText={setQ} icon="search" placeholder="Search reviews and reviewers…" />
                  </View>
                  <View style={{ width: 190 }}>
                    <Select value={loc} onChange={setLoc} placeholder="All locations"
                      options={[{ value: '', label: 'All locations' }, ...businesses.map((b) => ({ value: b.id, label: b.name }))]} />
                  </View>
                  <View style={{ width: 140 }}>
                    <Select value={rate} onChange={setRate} placeholder="All ratings"
                      options={[{ value: '', label: 'All ratings' }, ...[5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `${r} star` }))]} />
                  </View>
                  <Chip label="Without reply" icon="filter" on={onlyUnreplied} onPress={() => setOnlyUnreplied((v) => !v)} />
                </Row>
              </CardBody>
            </Card>

            {items.length === 0 ? (
              <Card><Empty icon="star" title="No reviews match"
                desc="Try clearing the filters, or sync to pull the latest from Google." /></Card>
            ) : (
              <Stack gap={12}>
                {items.map((r) => {
                  const b = businesses.find((x) => x.id === r.bizId);
                  return (
                    <Card key={r.id} pad={16}>
                      <Between>
                        <Row gap={10} wrap={false} align="flex-start" style={{ flexShrink: 1 }}>
                          <Avatar name={r.author} />
                          <View style={{ flexShrink: 1 }}>
                            <T size={13.5} weight="700">{r.author}</T>
                            <Row gap={8}>
                              <Stars value={r.rating} />
                              <Muted>{fmt.ago(r.createdAt)} • {b?.name}</Muted>
                            </Row>
                          </View>
                        </Row>
                        {r.reply
                          ? <Badge label={r.replyAuto ? 'Auto-replied' : 'Replied'} tone="green" icon="checkCircle" />
                          : <Badge label="Needs reply" tone="amber" />}
                      </Between>

                      <T size={13.5} color={c.text2} style={{ marginTop: 12 }}>{r.text}</T>

                      {r.reply ? (
                        <View style={{ marginTop: 13, padding: 12, backgroundColor: c.surface2,
                          borderLeftWidth: 3, borderLeftColor: c.lemonHover, borderRadius: 10 }}>
                          <Row gap={6} wrap={false}>
                            <Icon name="reply" size={13} color={c.text2} />
                            <T size={12} weight="700">Owner reply</T>
                          </Row>
                          <Muted size={12.5} style={{ marginTop: 4 }}>{r.reply}</Muted>
                          <Row gap={6} style={{ marginTop: 9 }}>
                            <Button label="Edit" size="sm" variant="ghost" icon="edit" onPress={() => openReply(r, r.reply!, false)} />
                            <Button label="Remove reply" size="sm" variant="ghost" icon="trash"
                              onPress={async () => {
                                if (b?.googleLocationId && r.googleReviewId) {
                                  try { await reviewsApi.removeReply(b.googleLocationId, r.googleReviewId); } catch {
                                    return toast('Could not remove reply', 'Check your Google connection and try again', 'err');
                                  }
                                }
                                setReviewReply(r.id, null);
                                toast('Reply removed');
                              }} />
                          </Row>
                        </View>
                      ) : (
                        <Row gap={8} style={{ marginTop: 13 }}>
                          <Button label="Generate AI reply" size="sm" variant="primary" icon="sparkles"
                            loading={generatingId === r.id}
                            onPress={async () => {
                              if (!b) return;
                              if (user.credits < COSTS.reviewReply) return toast('Not enough credits', undefined, 'err');
                              setGeneratingId(r.id);
                              try {
                                const t = await generateReply(r, b);
                                openReply(r, t, true);
                              } catch {
                                toast('Could not generate a reply', 'Check the Anthropic API key and try again', 'err');
                              } finally {
                                setGeneratingId(null);
                              }
                            }} />
                          <Button label="Write manually" size="sm" icon="edit" onPress={() => openReply(r, '', false)} />
                        </Row>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </>
        }
        side={
          <>
            <Card>
              <CardHead title="Rating breakdown" />
              <CardBody>
                {[5, 4, 3, 2, 1].map((r, i) => (
                  <Row key={r} gap={9} wrap={false} style={{ marginBottom: 9 }}>
                    <T size={12} style={{ width: 30 }}>{r}★</T>
                    <Progress value={(dist[i] / Math.max(1, total)) * 100} />
                    <Muted style={{ width: 22, textAlign: 'right' }}>{String(dist[i])}</Muted>
                  </Row>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Auto-reply" sub="Let Limbu reply within minutes" />
              <CardBody>
                <ToggleRow title="Auto-reply to new reviews" desc="AI drafts and posts replies automatically"
                  on={settings.autoReply} onPress={() => { setSetting('autoReply', !settings.autoReply); toast(settings.autoReply ? 'Disabled' : 'Enabled', 'Auto-reply', 'ok'); }} />
                <ToggleRow title="Require approval first" desc="Replies wait for your approval"
                  on={settings.adminApproval} onPress={() => setSetting('adminApproval', !settings.adminApproval)} />
                <Divider />
                <Muted size={11.5}>Every reply costs {COSTS.reviewReply} credits.</Muted>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Get more reviews" />
              <CardBody>
                <Muted size={12.5}>Print your Magic QR at the reception desk — customers scan and leave a Google review in seconds.</Muted>
                <Button label="Open Magic QR" variant="primary" icon="qr" block style={{ marginTop: 12 }}
                  onPress={() => router.push('/magic-qr')} />
              </CardBody>
            </Card>
          </>
        }
      />
    </View>
  );
}
