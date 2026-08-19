/* Shared implementation behind /reviews and /review-reply */
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { StatCard } from './StatCard';
import { Icon } from './Icon';
import {
  Avatar, Badge, Between, Button, Card, CardBody, CardHead, Chip, Cols, Divider, Empty, Field,
  Grid, Input, Muted, PageHeader, Progress, Row, Select, Stack, Stars, T, ToggleRow, useWork,
} from './ui';
import { fmt } from '../lib/format';
import { pick } from '../lib/mock';
import { COSTS } from '../lib/nav';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import type { Review } from '../store/types';
import { useTheme } from '../theme/ThemeProvider';

export function aiReply(r: Review, biz: { name: string; phone: string }) {
  const name = r.author.split(' ')[0];
  if (r.rating >= 4) return pick([
    `Thank you so much, ${name}! 💛 We are delighted you had a great experience at ${biz.name}. Our team looks forward to welcoming you again.`,
    `This made our day, ${name}! Thanks for trusting ${biz.name} with your care. See you at your next visit!`,
    `Really appreciate the kind words, ${name}. Reviews like yours keep our team going. Thank you for choosing ${biz.name}!`,
  ]);
  if (r.rating === 3)
    return `Thank you for the honest feedback, ${name}. We are sorry the wait was longer than expected — we have added extra slots to reduce waiting time. Please call us at ${biz.phone} so we can make your next visit smoother.`;
  return `We are truly sorry about this experience, ${name}. This is not the standard we hold ourselves to at ${biz.name}. Please reach us directly at ${biz.phone} — we would like to understand what happened and set it right.`;
}

export function ReviewsScreen({ replyMode }: { replyMode: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  const biz = useBiz();
  const { reviews, businesses, settings, user, setReviewReply, setSetting, spend } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

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

  const openReply = (r: Review, initial: string, charge: boolean) => {
    let draft = initial;
    const Body = () => {
      const [v, setV] = useState(initial);
      const { run: run2, isBusy: busy2 } = useWork();
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
          <Button label="Regenerate with AI" size="sm" icon="refresh" loading={busy2('rg')}
            onPress={() => run2('rg', 800, () => { const t = aiReply(r, biz); setV(t); draft = t; })} />
        </View>
      );
    };
    openModal({
      title: `Reply to ${r.author}`,
      content: <Body />,
      footer: (
        <Row gap={9}>
          <Button label="Cancel" variant="ghost" onPress={closeModal} />
          <Button label="Post reply" variant="primary" icon="send" onPress={() => {
            if (!draft.trim()) return toast('Reply is empty', undefined, 'err');
            setReviewReply(r.id, draft.trim(), charge);
            if (charge) spend(COSTS.reviewReply, 'AI review reply');
            closeModal();
            toast('Reply posted', 'Published to Google Business Profile', 'ok');
          }} />
        </Row>
      ),
    });
  };

  const bulkReply = () => {
    const pending = reviews.filter((r) => !r.reply);
    if (!pending.length) return toast('Nothing pending', 'Every review already has a reply', 'ok');
    const cost = pending.length * COSTS.reviewReply;
    if (user.credits < cost) return toast('Not enough credits', `Need ${cost} credits`, 'err');
    run('bulk', 1800, () => {
      pending.forEach((r) => setReviewReply(r.id, aiReply(r, biz), true));
      spend(cost, `AI review replies ×${pending.length}`);
      toast(`Replied to ${pending.length} reviews`, `${cost} credits used`, 'ok');
    });
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
            <Button label="Refresh" icon="refresh" loading={isBusy('rf')}
              onPress={() => run('rf', 800, () => toast('Reviews refreshed', undefined, 'ok'))} />
            <Button label="Force sync" icon="sync" loading={isBusy('fs')}
              onPress={() => run('fs', 1600, () => toast('Force sync complete', 'Pulled all reviews from Google Business Profile', 'ok'))} />
            <Button label="AI reply to all pending" variant="primary" icon="sparkles" loading={isBusy('bulk')} onPress={bulkReply} />
          </>
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="star" value={`${avg}★`} label="Average rating" delta={4} />
          <StatCard icon="message" tone="blue" value={fmt.n(total)} label="Total reviews" delta={12} />
          <StatCard icon="reply" tone="green" value={`${Math.round(((total - noReply) / Math.max(1, total)) * 100)}%`} label="Reply rate" delta={26} />
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
                desc="Try clearing the filters, or force sync to pull the latest from Google." /></Card>
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
                              onPress={() => { setReviewReply(r.id, null); toast('Reply removed'); }} />
                          </Row>
                        </View>
                      ) : (
                        <Row gap={8} style={{ marginTop: 13 }}>
                          <Button label="Generate AI reply" size="sm" variant="primary" icon="sparkles"
                            loading={isBusy(r.id)}
                            onPress={() => {
                              if (user.credits < COSTS.reviewReply) return toast('Not enough credits', undefined, 'err');
                              run(r.id, 1100, () => openReply(r, aiReply(r, biz), true));
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
                <Field label="Reply tone">
                  <Select value="warm" onChange={() => toast('Tone updated', undefined, 'ok')}
                    options={[
                      { value: 'warm', label: 'Warm & professional' }, { value: 'short', label: 'Short & friendly' },
                      { value: 'formal', label: 'Formal' }, { value: 'playful', label: 'Playful' }]} />
                </Field>
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
