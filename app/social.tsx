import React from 'react';
import { View } from 'react-native';
import { Hero } from './dashboard';
import { Icon, IconName } from '../components/Icon';
import { StatCard } from '../components/StatCard';
import {
  Badge, Between, Button, Card, Grid, LinkButton, Muted, PageHeader, Row, T, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

const NETS: { k: string; name: string; icon: IconName; color: string; desc: string; actions: string[] }[] = [
  { k: 'google', name: 'Google Business Profile', icon: 'google', color: '#4285F4', desc: 'Posts, reviews, insights and Q&A', actions: ['Connect Business Profile'] },
  { k: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2', desc: 'Publish to your Facebook Page', actions: ['Connect Page'] },
  { k: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E1306C', desc: 'Feed posts, reels and stories', actions: ['Connect Business Account'] },
  { k: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', desc: 'Company page or personal profile', actions: ['Connect Page', 'Connect Profile'] },
  { k: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000', desc: 'Publish shorts and long-form video', actions: ['Add Channel'] },
  { k: 'pinterest', name: 'Pinterest', icon: 'pinterest', color: '#E60023', desc: 'Pin products and service boards', actions: ['Add Profile'] },
  { k: 'whatsapp', name: 'WhatsApp Business', icon: 'whatsapp', color: '#25D366', desc: 'Automated replies and lead alerts', actions: ['Connect WhatsApp automation'] },
];

export default function Social() {
  const { c } = useTheme();
  const biz = useBiz();
  const { social, gmbConnected, posts, setSocial, patch } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const isOn = (k: string) => (k === 'google' ? gmbConnected : !!social[k]);
  const connected = NETS.filter((nt) => isOn(nt.k)).length;

  const connect = (k: string) => run(k, 1500, () => {
    if (k === 'google') patch({ gmbConnected: true }); else setSocial(k, true);
    toast('Connected', `${NETS.find((nt) => nt.k === k)!.name} is now linked`, 'ok');
  });

  const disconnect = (k: string) => openModal({
    title: `Disconnect ${NETS.find((nt) => nt.k === k)!.name}?`,
    content: <Muted size={13}>Scheduled posts to this platform will stop publishing.</Muted>,
    footer: (
      <Row gap={9}>
        <Button label="Cancel" variant="ghost" onPress={closeModal} />
        <Button label="Disconnect" variant="danger" onPress={() => {
          if (k === 'google') patch({ gmbConnected: false }); else setSocial(k, false);
          closeModal(); toast('Disconnected', undefined, 'err');
        }} />
      </Row>
    ),
  });

  return (
    <View>
      <PageHeader eyebrow="Connections" eyebrowIcon="share" title="Social Connections"
        sub="Connect once — then publish everywhere from a single Magic Post."
        actions={<LinkButton label="Create a post" href="/posts/new" variant="primary" icon="wand" />} />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="link" tone="green" value={`${connected} / ${NETS.length}`} label="Platforms connected" />
          <StatCard icon="send" tone="blue" value={fmt.n(posts.filter((p) => p.status === 'posted').length)} label="Cross-posted this month" delta={28} />
          <StatCard icon="users" tone="pink" value={fmt.compact(18400)} label="Combined audience" delta={87} />
          <StatCard icon="activity" value={fmt.compact(posts.reduce((a, p) => a + p.stats.views, 0))} label="Total reach" delta={37} />
        </Grid>
      </View>

      <Grid cols={2} minWidth={340} gap={16}>
        {NETS.map((nt) => {
          const on = isOn(nt.k);
          return (
            <Card key={nt.k} pad={16}>
              <Between>
                <Row gap={12} wrap={false} style={{ flexShrink: 1 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: nt.color,
                    alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={nt.icon} size={21} color="#fff" />
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <T size={14} weight="700">{nt.name}</T>
                    <Muted>{nt.desc}</Muted>
                  </View>
                </Row>
                {on ? <Badge label="Connected" tone="green" dot /> : <Badge label="Not connected" />}
              </Between>

              {on ? (
                <Between style={{ marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: c.line2 }}>
                  <Muted>{biz.name} • synced just now</Muted>
                  <Button label="Disconnect" size="sm" variant="ghost" onPress={() => disconnect(nt.k)} />
                </Between>
              ) : (
                <Row gap={8} style={{ marginTop: 14 }}>
                  {nt.actions.map((a) => (
                    <Button key={a} label={a} size="sm" icon="link" loading={isBusy(nt.k)} onPress={() => connect(nt.k)} />
                  ))}
                </Row>
              )}
            </Card>
          );
        })}
      </Grid>

      <View style={{ marginTop: 20 }}>
        <Hero title="One post. Every platform."
          sub="Limbu adapts the caption, hashtags and image ratio for each network automatically — square for Instagram, 16:9 for Google, vertical for Shorts."
          cta={<LinkButton label="Try a Magic Post" href="/posts/new" variant="primary" icon="wand" />} />
      </View>
    </View>
  );
}
