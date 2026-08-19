import React, { useState } from 'react';
import { View } from 'react-native';
import { StatCard } from '../components/StatCard';
import {
  Badge, Between, Button, Card, CardBody, CardHead, CheckRow, Cols, Field, Grid, IconTile,
  Input, LinkButton, Muted, PageHeader, Row, Stack, T, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { uid } from '../lib/mock';
import { COSTS } from '../lib/nav';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

const TEMPLATES = [
  { id: 'medical', name: 'Medical Pro', desc: 'Clinics, dentists, diagnostics', c: ['#0EA5E9', '#0F172B'] },
  { id: 'salon', name: 'Glow Studio', desc: 'Salons, spas, wellness', c: ['#EC4899', '#431407'] },
  { id: 'food', name: 'Savour', desc: 'Restaurants and cafés', c: ['#F97316', '#431407'] },
  { id: 'fitness', name: 'Iron', desc: 'Gyms and fitness studios', c: ['#10B981', '#052E16'] },
  { id: 'retail', name: 'Storefront', desc: 'Shops and showrooms', c: ['#6366F1', '#1E1B4B'] },
  { id: 'service', name: 'Trade Pro', desc: 'Services and contractors', c: ['#EAB308', '#0F172B'] },
];

const SECTIONS: [string, string][] = [
  ['Business information', 'Name, category, about'],
  ['Services', 'Pulled from your GMB services list'],
  ['Photo gallery', 'Every photo on your Business Profile'],
  ['Business hours', 'Live hours, including holidays'],
  ['Reviews wall', 'Your best Google reviews, auto-updating'],
  ['Contact & map', 'Click-to-call, WhatsApp, directions'],
  ['Lead capture form', 'Feeds straight into Website Leads'],
  ['SEO pages', 'A page per service × locality from your keywords'],
];

export default function Website() {
  const { c } = useTheme();
  const biz = useBiz();
  const { websites, leads, brand, user, spend, patch } = useStore();
  const { toast, openModal } = useUI();
  const { run, isBusy } = useWork();

  const site = websites[0];
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [domain, setDomain] = useState(site?.domain ?? 'sunrisedental.limbu.site');
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map(([s]) => [s, true])));

  const build = () => {
    if (user.credits < COSTS.website) return toast('Not enough credits', `Website generation needs ${COSTS.website} credits`, 'err');
    run('build', 2400, () => {
      spend(COSTS.website, 'Website builder generation');
      patch({ websites: [{ id: uid('site'), name: biz.name, template: tpl.name, domain: domain.trim(),
        status: 'live', pages: 8, leads: leads.length, createdAt: new Date().toISOString() }] });
      toast('Website published 🎉', `${domain} is live`, 'ok');
    });
  };

  const Preview = () => (
    <Card style={{ overflow: 'hidden' }}>
      <Row gap={5} wrap={false} style={{ padding: 8, backgroundColor: c.surface3 }}>
        {['#EF4444', '#EAB308', '#10B981'].map((col) => (
          <View key={col} style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: col }} />
        ))}
        <Muted size={10} style={{ marginLeft: 8 }}>{domain}</Muted>
      </Row>
      <View style={{ backgroundColor: tpl.c[0], padding: 20 }}>
        <T size={10} color="rgba(255,255,255,0.85)" style={{ letterSpacing: 1 }}>{biz.cat.toUpperCase()}</T>
        <T size={17} weight="800" heading color="#fff" style={{ marginVertical: 5 }}>{biz.name}</T>
        <T size={11} color="rgba(255,255,255,0.85)">{biz.loc} • {biz.rating}★</T>
        <View style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#FACC15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
          <T size={11} weight="700" color="#0F172B">Book appointment</T>
        </View>
      </View>
      <View style={{ padding: 14 }}>
        <Row gap={7} wrap={false}>
          {[1, 2, 3].map((i) => <View key={i} style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: c.surface3 }} />)}
        </Row>
        <View style={{ height: 9, borderRadius: 5, backgroundColor: c.surface3, marginTop: 12 }} />
        <View style={{ height: 9, borderRadius: 5, backgroundColor: c.surface3, marginTop: 6, width: '70%' }} />
        <Row gap={6} style={{ marginTop: 12 }}>
          {brand.products.slice(0, 3).map((p) => <Badge key={p.id} label={p.name} />)}
        </Row>
      </View>
    </Card>
  );

  return (
    <View>
      <PageHeader eyebrow="Website & leads" eyebrowIcon="monitor" title="Website Builder"
        sub="Generate a complete, SEO-ready website from your Google Business Profile — no designer, no developer."
        actions={
          <>
            <Button label="Preview" icon="eye" onPress={() => openModal({ title: 'Website preview', wide: true, content: <Preview /> })} />
            <Button label="Generate website" variant="primary" icon="wand" loading={isBusy('build')} onPress={build} />
          </>
        } />

      {!!site && (
        <Card pad={16} style={{ marginBottom: 16 }}>
          <Between>
            <Row gap={12} wrap={false} style={{ flexShrink: 1 }}>
              <IconTile icon="globe" tone="green" />
              <View style={{ flexShrink: 1 }}>
                <T size={14} weight="700">{site.domain}</T>
                <Muted>{site.template} template • {site.pages} pages • published {fmt.ago(site.createdAt)}</Muted>
              </View>
            </Row>
            <Row gap={8}>
              <Badge label="Live" tone="green" dot />
              <LinkButton label={`${site.leads} leads`} href="/leads" size="sm" icon="inbox" />
              <Button label="Edit" size="sm" icon="edit" onPress={() => toast('Editor opening', 'Drag-and-drop editor loads here')} />
            </Row>
          </Between>
        </Card>
      )}

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="globe" tone="blue" value={websites.length} label="Live websites" />
          <StatCard icon="eye" value={fmt.compact(2840)} label="Website visitors (30d)" delta={64} />
          <StatCard icon="inbox" tone="pink" value={fmt.n(leads.length)} label="Leads captured" delta={19} />
          <StatCard icon="zap" tone="green" value="98" label="PageSpeed score" />
        </Grid>
      </View>

      <Cols
        sideWidth={330}
        main={
          <>
            <Card>
              <CardHead title="1 · Choose a template" sub="Every template is mobile-first and SEO-ready" />
              <CardBody>
                <Grid cols={3} minWidth={190} gap={12}>
                  {TEMPLATES.map((t) => (
                    <Card key={t.id} onPress={() => setTpl(t)} style={{ borderColor: tpl.id === t.id ? c.lemon : c.line }}>
                      <View style={{ height: 82, backgroundColor: t.c[0], alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: '55%', height: 5, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.85)' }} />
                        <View style={{ width: '38%', height: 4, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.5)', marginTop: 6 }} />
                        <T size={13} weight="800" heading color="#fff" style={{ marginTop: 10 }}>{t.name}</T>
                      </View>
                      <View style={{ padding: 12 }}>
                        <T size={12.5} weight="700">{t.name}</T>
                        <Muted>{t.desc}</Muted>
                      </View>
                    </Card>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="2 · Data imported from your Google Business Profile"
                sub="Nothing to type — Limbu reads it straight from Google"
                right={<Button label="Re-import" size="sm" icon="sync" loading={isBusy('imp')}
                  onPress={() => run('imp', 1300, () => toast('Re-imported', 'Latest GMB data pulled into your site', 'ok'))} />} />
              <CardBody>
                <Grid cols={2} minWidth={230} gap={12}>
                  {([['Business name', biz.name], ['Category', biz.cat], ['Address', biz.loc], ['Phone', biz.phone],
                     ['Hours', biz.hours], ['Rating', `${biz.rating}★ from ${biz.reviews} reviews`],
                     ['Services', `${brand.products.length} services imported`], ['Photos', '11 photos imported']] as const).map(([k, v]) => (
                    <Card key={k} pad={12}><Muted size={11.5}>{k}</Muted><T size={13} weight="700">{v}</T></Card>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="3 · Sections to include" />
              <CardBody>
                <Grid cols={2} minWidth={240} gap={10}>
                  {SECTIONS.map(([label, desc]) => (
                    <CheckRow key={label} label={label} desc={desc} checked={!!sections[label]}
                      onPress={() => setSections((s) => ({ ...s, [label]: !s[label] }))} />
                  ))}
                </Grid>
              </CardBody>
            </Card>
          </>
        }
        side={
          <Card>
            <CardHead title="Live preview" />
            <CardBody>
              <Preview />
              <Field label="Domain" hint="Free limbu.site subdomain, or connect your own domain." style={{ marginTop: 16 }}>
                <Input value={domain} onChangeText={setDomain} />
              </Field>
              <Button label="Publish website" variant="primary" icon="rocket" block loading={isBusy('build')} onPress={build} />
            </CardBody>
          </Card>
        }
      />
    </View>
  );
}
