import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Icon } from '../components/Icon';
import { StatCard } from '../components/StatCard';
import {
  Avatar, Badge, Between, Button, Card, CardBody, Empty, Field, Grid, Input, LinkButton,
  Muted, PageHeader, Row, Select, T, Tabs, Tone, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { SERVICES } from '../lib/mock';
import { useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import type { Lead, LeadStatus } from '../store/types';
import { useTheme } from '../theme/ThemeProvider';

const TABS = [
  { key: 'all', label: 'All leads' }, { key: 'new', label: 'New' }, { key: 'contacted', label: 'Contacted' },
  { key: 'converted', label: 'Converted' }, { key: 'spam', label: 'Spam' },
];
const TONE: Record<LeadStatus, Tone> = { new: 'blue', contacted: 'amber', converted: 'green', spam: 'slate' };

export default function Leads() {
  const { c, width } = useTheme();
  const { leads, updateLead } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [svc, setSvc] = useState('');

  const count = (s: string) => (s === 'all' ? leads.length : leads.filter((l) => l.status === s).length);
  const conv = Math.round((count('converted') / Math.max(1, leads.length)) * 100);

  const items = useMemo(() => leads.filter((l) => {
    if (tab !== 'all' && l.status !== tab) return false;
    if (svc && l.service !== svc) return false;
    if (q && !`${l.name} ${l.phone} ${l.email} ${l.service}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [leads, tab, q, svc]);

  const openLead = (l: Lead) => openModal({
    title: `Lead — ${l.name}`,
    content: (
      <View>
        <Grid cols={2} minWidth={160} gap={10}>
          {([['Phone', l.phone], ['Email', l.email], ['Service', l.service], ['Source', l.source],
            ['Received', fmt.date(l.createdAt)], ['Status', l.status]] as const).map(([k, v]) => (
            <Card key={k} pad={12}><Muted size={11.5}>{k}</Muted><T size={13} weight="700">{v}</T></Card>
          ))}
        </Grid>
        <Field label="Message" style={{ marginTop: 16 }}>
          <Card pad={12}><T size={13}>{l.message}</T></Card>
        </Field>
      </View>
    ),
    footer: <Button label="Close" variant="dark" onPress={closeModal} />,
  });

  return (
    <View>
      <PageHeader eyebrow="Lead inbox" title="Website Leads"
        sub="Every enquiry submitted through your Limbu website, Magic QR and Google posts."
        actions={
          <>
            <Button label="Export CSV" icon="download" loading={isBusy('csv')}
              onPress={() => run('csv', 900, () => toast('CSV exported', `${leads.length} leads downloaded`, 'ok'))} />
            <LinkButton label="Open Website Builder" href="/website" variant="primary" icon="monitor" />
          </>
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="inbox" tone="blue" value={fmt.n(count('all'))} label="Total leads" delta={19} />
          <StatCard icon="zap" value={fmt.n(count('new'))} label="New — uncontacted" />
          <StatCard icon="checkCircle" tone="green" value={fmt.n(count('converted'))} label="Converted" delta={8} />
          <StatCard icon="percent" tone="pink" value={`${conv}%`} label="Conversion rate" delta={5} />
        </Grid>
      </View>

      <Tabs value={tab} onChange={setTab} items={TABS.map((t) => ({ ...t, count: count(t.key) }))} />

      <Card>
        <CardBody pad={16}>
          <Row gap={10}>
            <View style={{ flex: 1, maxWidth: 380, minWidth: 200 }}>
              <Input value={q} onChangeText={setQ} icon="search" placeholder="Search by name, phone, email or service…" />
            </View>
            <View style={{ width: 190 }}>
              <Select value={svc} onChange={setSvc} placeholder="All services"
                options={[{ value: '', label: 'All services' }, ...SERVICES.map((s) => ({ value: s, label: s }))]} />
            </View>
          </Row>
        </CardBody>

        {items.length === 0 ? (
          <Empty icon="inbox" title="No leads here" desc="Leads from your website form land in this inbox automatically." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: Math.max(width - 320, 860) }}>
              <Row wrap={false} gap={0} style={{ backgroundColor: c.surface2, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.line }}>
                {[['Lead', 2.2], ['Contact', 2], ['Service', 1.3], ['Source', 1.2], ['Received', 1], ['Status', 1.3], ['', 1.2]].map(([h, f], i) => (
                  <View key={i} style={{ flex: f as number, padding: 11 }}>
                    <T size={10.5} weight="700" color={c.text3} style={{ letterSpacing: 0.8 }}>{String(h).toUpperCase()}</T>
                  </View>
                ))}
              </Row>

              {items.map((l) => (
                <Row key={l.id} wrap={false} gap={0} style={{ borderBottomWidth: 1, borderBottomColor: c.line2 }}>
                  <View style={{ flex: 2.2, padding: 11 }}>
                    <Row gap={9} wrap={false}>
                      <Avatar name={l.name} size={32} />
                      <View style={{ flex: 1 }}>
                        <T size={13} weight="700" numberOfLines={1}>{l.name}</T>
                        <Muted size={11.5} >{l.message.slice(0, 34)}…</Muted>
                      </View>
                    </Row>
                  </View>
                  <View style={{ flex: 2, padding: 11 }}>
                    <T size={12.5}>{l.phone}</T>
                    <Muted size={11.5}>{l.email}</Muted>
                  </View>
                  <View style={{ flex: 1.3, padding: 11 }}><Badge label={l.service} /></View>
                  <View style={{ flex: 1.2, padding: 11 }}><Muted>{l.source}</Muted></View>
                  <View style={{ flex: 1, padding: 11 }}><Muted>{fmt.ago(l.createdAt)}</Muted></View>
                  <View style={{ flex: 1.3, padding: 8, zIndex: 5 }}>
                    <Select value={l.status}
                      onChange={(v) => { updateLead(l.id, { status: v as LeadStatus }); toast('Lead updated', `${l.name} → ${v}`, 'ok'); }}
                      options={(['new', 'contacted', 'converted', 'spam'] as LeadStatus[]).map((s) => ({ value: s, label: s }))} />
                  </View>
                  <View style={{ flex: 1.2, padding: 11 }}>
                    <Row gap={2} wrap={false}>
                      <Pressable onPress={() => toast(`Calling ${l.name}`, l.phone)} style={{ padding: 6 }} accessibilityLabel="Call">
                        <Icon name="phone" size={15} color={c.text3} />
                      </Pressable>
                      <Pressable onPress={() => toast('WhatsApp opened', l.phone, 'ok')} style={{ padding: 6 }} accessibilityLabel="WhatsApp">
                        <Icon name="whatsapp" size={15} color={c.text3} />
                      </Pressable>
                      <Pressable onPress={() => openLead(l)} style={{ padding: 6 }} accessibilityLabel="Open lead">
                        <Icon name="eye" size={15} color={c.text3} />
                      </Pressable>
                    </Row>
                  </View>
                </Row>
              ))}
            </View>
          </ScrollView>
        )}
      </Card>
    </View>
  );
}
