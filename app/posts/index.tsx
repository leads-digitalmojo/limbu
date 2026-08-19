import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { PostCreative } from '../../components/PostCreative';
import { StatCard } from '../../components/StatCard';
import {
  Badge, Between, Button, Card, Empty, Grid, Input, LinkButton, Muted, PageHeader,
  Row, Select, Stack, T, Tabs, Tone, useWork,
} from '../../components/ui';
import { fmt } from '../../lib/format';
import { PLATFORMS } from '../../lib/nav';
import { useStore } from '../../store/useStore';
import { useUI } from '../../store/ui';
import type { Post } from '../../store/types';
import { useTheme } from '../../theme/ThemeProvider';

const TABS = [
  { key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' }, { key: 'scheduled', label: 'Scheduled' },
  { key: 'posted', label: 'Posted' }, { key: 'video', label: 'Videos' },
];

const STATUS_TONE: Record<string, Tone> = {
  posted: 'green', scheduled: 'blue', pending: 'amber', approved: 'green', rejected: 'red',
};

export default function Posts() {
  const { c } = useTheme();
  const { posts, updatePost, removePost } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [plat, setPlat] = useState('');

  const counts = (k: string) =>
    k === 'all' ? posts.length : k === 'video' ? posts.filter((p) => p.type === 'video').length
      : posts.filter((p) => p.status === k).length;

  const items = useMemo(() => posts.filter((p) => {
    if (tab === 'video') { if (p.type !== 'video') return false; }
    else if (tab !== 'all' && p.status !== tab) return false;
    if (plat && !p.platforms.includes(plat)) return false;
    if (q && !`${p.caption} ${p.keywords.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [posts, tab, q, plat]);

  const confirmDelete = (p: Post) =>
    openModal({
      title: 'Delete post?',
      content: <Muted size={13}>This post will be removed from Limbu. Published copies stay live on the platform.</Muted>,
      footer: (
        <Row gap={9}>
          <Button label="Cancel" variant="ghost" onPress={closeModal} />
          <Button label="Delete" variant="danger" onPress={() => { removePost(p.id); closeModal(); toast('Post deleted', undefined, 'ok'); }} />
        </Row>
      ),
    });

  return (
    <View>
      <PageHeader eyebrow="AI content" title="Post Management"
        sub="Create, approve and publish marketing posts across Google and your social platforms."
        actions={
          <>
            <Button label="Force sync" icon="sync" loading={isBusy('sync')}
              onPress={() => run('sync', 1200, () => toast('Sync complete', 'Post statuses refreshed from all platforms', 'ok'))} />
            <LinkButton label="New Magic Post" href="/posts/new" variant="primary" icon="wand" />
          </>
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="send" tone="blue" value={fmt.n(counts('posted'))} label="Published posts" delta={22} />
          <StatCard icon="clock" value={fmt.n(counts('scheduled'))} label="Scheduled" />
          <StatCard icon="alert" tone="orange" value={fmt.n(counts('pending'))} label="Pending approval" />
          <StatCard icon="eye" tone="green" value={fmt.compact(posts.reduce((a, p) => a + p.stats.views, 0))} label="Total post views" delta={37} />
        </Grid>
      </View>

      <Tabs value={tab} onChange={setTab} items={TABS.map((t) => ({ ...t, count: counts(t.key) }))} />

      <Between style={{ marginBottom: 16 }}>
        <View style={{ flex: 1, maxWidth: 320, minWidth: 200 }}>
          <Input value={q} onChangeText={setQ} icon="search" placeholder="Search captions and keywords…" />
        </View>
        <View style={{ width: 190 }}>
          <Select value={plat} onChange={setPlat} placeholder="All platforms"
            options={[{ value: '', label: 'All platforms' }, ...PLATFORMS.map((p) => ({ value: p.k, label: p.name }))]} />
        </View>
      </Between>

      {items.length === 0 ? (
        <Card><Empty icon="send" title="No posts here"
          desc="Nothing matches this filter yet. Create a Magic Post to fill this space."
          action={<LinkButton label="New Magic Post" href="/posts/new" variant="primary" icon="wand" />} /></Card>
      ) : (
        <Grid cols={3} minWidth={300} gap={16}>
          {items.map((p) => (
            <Card key={p.id}>
              <PostCreative caption={p.caption.split('.')[0]} theme={p.theme} ratio={p.ratio}
                badge={p.type === 'video' ? <Badge label="Video" tone="red" icon="video" /> : undefined} />
              <View style={{ padding: 12 }}>
                <Between style={{ marginBottom: 8 }}>
                  <Badge label={p.status} tone={STATUS_TONE[p.status] ?? 'slate'} />
                  <Row gap={5} wrap={false}>
                    {p.platforms.map((k) => {
                      const pl = PLATFORMS.find((x) => x.k === k) ?? PLATFORMS[0];
                      return (
                        <View key={k} style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: pl.color,
                          alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={pl.icon} size={12} color="#fff" />
                        </View>
                      );
                    })}
                  </Row>
                </Between>

                <T size={12.5} color={c.text2} numberOfLines={3}>{p.caption}</T>

                <Row gap={6} style={{ marginVertical: 9 }}>
                  {p.keywords.slice(0, 2).map((k, i) => <Badge key={i} label={`#${k.replace(/\s+/g, '')}`} />)}
                </Row>

                <Between style={{ borderTopWidth: 1, borderTopColor: c.line2, paddingTop: 9 }}>
                  <Muted size={11.5}>{fmt.compact(p.stats.views)} views • {fmt.ago(p.createdAt)}</Muted>
                  <Row gap={4} wrap={false}>
                    {p.status === 'pending' ? (
                      <>
                        <Button label="Approve" size="sm" variant="primary"
                          onPress={() => { updatePost(p.id, { status: 'approved' }); toast('Post approved', 'It will publish at the scheduled time', 'ok'); }} />
                        <Button label="Reject" size="sm" variant="ghost"
                          onPress={() => { updatePost(p.id, { status: 'rejected' }); toast('Post rejected', undefined, 'err'); }} />
                      </>
                    ) : (
                      <Button label="View" size="sm" onPress={() => openModal({ title: 'Post details', wide: true, content: <PostDetail post={p} /> })} />
                    )}
                    <Pressable onPress={() => confirmDelete(p)} style={{ padding: 6 }} accessibilityLabel="Delete post">
                      <Icon name="trash" size={15} color={c.text3} />
                    </Pressable>
                  </Row>
                </Between>
              </View>
            </Card>
          ))}
        </Grid>
      )}
    </View>
  );
}

function PostDetail({ post }: { post: Post }) {
  const { c } = useTheme();
  const kv = (k: string, v: string) => (
    <Card pad={12} key={k}><Muted size={11.5}>{k}</Muted><T size={13} weight="700">{v}</T></Card>
  );
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ overflow: 'hidden' }}>
        <PostCreative caption={post.caption.split('.')[0]} theme={post.theme} ratio={post.ratio} />
      </Card>
      <Card pad={14}><T size={13} color={c.text2}>{post.caption}</T></Card>
      <Grid cols={3} minWidth={130} gap={10}>
        {kv('Views', fmt.n(post.stats.views))}
        {kv('Likes', fmt.n(post.stats.likes))}
        {kv('Clicks', fmt.n(post.stats.clicks))}
        {kv('Ratio', post.ratio)}
        {kv('Mode', post.mode === 'auto' ? 'AI Auto Post' : 'Manual Post')}
        {kv('Created', fmt.date(post.createdAt))}
      </Grid>
    </View>
  );
}
