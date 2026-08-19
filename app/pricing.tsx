import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Field, Grid, IconTile, Input,
  Muted, PageHeader, Row, Segment, Select, Stack, T,
} from '../components/ui';
import { fmt } from '../lib/format';
import { useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';

const PLANS = [
  { name: 'Basic', price: 1499, tag: 'For a single location getting started',
    features: ['1 Google Business Profile', '8 AI posts / month', 'AI review replies',
      'Magic QR review collection', 'Keyword Planner', 'Email support'] },
  { name: 'Professional', price: 3999, featured: true, tag: 'Most popular for growing businesses',
    features: ['Up to 3 locations', '30 AI posts / month', 'Auto-reply to all reviews',
      'Competitor rank audits (3×3)', 'Website Builder + lead inbox',
      'Facebook, Instagram & LinkedIn publishing', 'Priority WhatsApp support'] },
  { name: 'Premium', price: 8999, tag: 'For multi-location brands and franchises',
    features: ['Up to 10 locations', 'Unlimited AI posts', '5×5 grid rank audits',
      'AI video posts & Shorts', 'WhatsApp automation', 'Dedicated account manager', 'White-label reports'] },
];

const SERVICES: { icon: IconName; name: string; price: string; desc: string }[] = [
  { icon: 'google', name: 'GMB Setup & Verification', price: '₹4,999', desc: 'We create, verify and fully optimise your Business Profile.' },
  { icon: 'monitor', name: 'Website Packages', price: 'from ₹14,999', desc: 'Custom multi-page website with hosting and lead forms.' },
  { icon: 'trend', name: 'SEO Packages', price: 'from ₹9,999/mo', desc: 'On-page, local citations, backlinks and monthly reporting.' },
  { icon: 'target', name: 'Ads Account Setup', price: '₹6,999', desc: 'Google & Meta ads accounts, tracking and first campaign.' },
  { icon: 'whatsapp', name: 'WhatsApp Automation', price: '₹7,999', desc: 'Official WABA, chatbot flows and lead routing.' },
  { icon: 'rocket', name: 'Done-for-you Growth', price: 'Custom', desc: 'A dedicated marketing team running everything for you.' },
];

const COMPARE: [string, string, string][] = [
  ['Monthly cost', '₹40,000 – ₹80,000', '₹1,499 – ₹8,999'],
  ['Posts per month', '8 – 12', 'Unlimited'],
  ['Review replies', 'Next-day, manual', 'Within minutes, AI'],
  ['Rank tracking', 'Quarterly spreadsheet', 'Live 5×5 map grid'],
  ['Website', '₹50,000+ and 6 weeks', 'Generated in minutes'],
  ['Reporting', 'PDF once a month', 'Live dashboard 24×7'],
];

export default function Pricing() {
  const { c, width } = useTheme();
  const { user, patch } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const [cycle, setCycle] = useState('m');
  const yearly = cycle === 'y';

  const switchPlan = (name: string) => openModal({
    title: `Switch to ${name}?`,
    content: <Muted size={13}>Your new plan starts immediately and is billed on your next cycle.</Muted>,
    footer: (
      <Row gap={9}>
        <Button label="Cancel" variant="ghost" onPress={closeModal} />
        <Button label="Confirm switch" variant="primary" onPress={() => {
          patch({ user: { ...user, plan: name } }); closeModal(); toast('Plan updated', `You are now on ${name}`, 'ok');
        }} />
      </Row>
    ),
  });

  const callback = (svc: string) => openModal({
    title: 'Request a callback',
    content: (
      <View>
        <Muted size={13}>Our team will call you about {svc}.</Muted>
        <Field label="Phone" style={{ marginTop: 14 }}><Input value={user.phone} onChangeText={() => {}} /></Field>
        <Field label="Preferred time">
          <Select value="am" onChange={() => {}}
            options={[{ value: 'am', label: 'Morning (10am–1pm)' }, { value: 'pm', label: 'Afternoon (1pm–5pm)' },
              { value: 'eve', label: 'Evening (5pm–8pm)' }]} />
        </Field>
      </View>
    ),
    footer: (
      <Row gap={9}>
        <Button label="Cancel" variant="ghost" onPress={closeModal} />
        <Button label="Request callback" variant="primary"
          onPress={() => { closeModal(); toast('Callback requested', 'Our team will reach you today', 'ok'); }} />
      </Row>
    ),
  });

  const order = (n: string) => PLANS.findIndex((p) => p.name === n);

  return (
    <View>
      <PageHeader eyebrow="Plans & services" eyebrowIcon="crown" title="Subscription"
        sub="Simple pricing that costs about 1% of what a marketing agency charges."
        actions={
          <Segment value={cycle} onChange={setCycle}
            items={[{ key: 'm', label: 'Monthly' }, { key: 'y', label: 'Yearly · save 20%' }]} />
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={3} minWidth={280} gap={16}>
          {PLANS.map((p) => {
            const price = yearly ? Math.round(p.price * 12 * 0.8) : p.price;
            const current = p.name === user.plan;
            return (
              <View key={p.name} style={{ borderWidth: 1, borderColor: p.featured ? c.lemon : c.line,
                borderRadius: radius.xl, padding: 22, backgroundColor: c.surface, flex: 1 }}>
                {p.featured && (
                  <View style={{ alignSelf: 'center', backgroundColor: c.lemon, paddingHorizontal: 12,
                    paddingVertical: 4, borderRadius: 99, marginBottom: 8 }}>
                    <T size={10.5} weight="800" color="#0F172B" style={{ letterSpacing: 0.6 }}>MOST POPULAR</T>
                  </View>
                )}
                <T size={16} weight="800" heading>{p.name}</T>
                <Muted style={{ marginVertical: 6 }}>{p.tag}</Muted>
                <Row gap={4} wrap={false} align="flex-end">
                  <T size={34} weight="800" heading>₹{fmt.n(price)}</T>
                  <T size={13} weight="600" color={c.text3} style={{ marginBottom: 6 }}>/{yearly ? 'year' : 'month'}</T>
                </Row>
                {yearly && <T size={12} weight="600" color={c.emerald}>Save ₹{fmt.n(p.price * 12 - price)} a year</T>}
                <Stack gap={9} style={{ marginVertical: 16 }}>
                  {p.features.map((f) => (
                    <Row key={f} gap={8} wrap={false} align="flex-start">
                      <Icon name="check" size={15} color={c.emerald} />
                      <T size={13} color={c.text2} style={{ flex: 1 }}>{f}</T>
                    </Row>
                  ))}
                </Stack>
                {current
                  ? <Button label="Current plan" icon="checkCircle" block disabled />
                  : <Button block variant={p.featured ? 'primary' : 'dark'}
                      label={order(p.name) > order(user.plan) ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}
                      onPress={() => switchPlan(p.name)} />}
              </View>
            );
          })}
        </Grid>
      </View>

      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Add-on services" sub="Done-for-you work by the Limbu team" />
        <CardBody>
          <Grid cols={3} minWidth={250} gap={14}>
            {SERVICES.map((s) => (
              <Card key={s.name} pad={16}>
                <Between>
                  <IconTile icon={s.icon} />
                  <T size={12.5} weight="700" color={c.lemonInk}>{s.price}</T>
                </Between>
                <T size={13.5} weight="700" style={{ marginTop: 11 }}>{s.name}</T>
                <Muted style={{ marginVertical: 6 }}>{s.desc}</Muted>
                <Button label="Request callback" size="sm" block onPress={() => callback(s.name)} />
              </Card>
            ))}
          </Grid>
        </CardBody>
      </Card>

      <Card>
        <CardHead title="Compare with the old way" />
        <CardBody pad={0}>
          <Row wrap={false} gap={0} style={{ backgroundColor: c.surface2, borderBottomWidth: 1, borderColor: c.line }}>
            {[['', 1.4], ['Old way — agency', 1.6], ['With Limbu AI', 1.6]].map(([h, f], i) => (
              <View key={i} style={{ flex: f as number, padding: 12 }}>
                <T size={10.5} weight="700" color={c.text3} style={{ letterSpacing: 0.8 }}>{String(h).toUpperCase()}</T>
              </View>
            ))}
          </Row>
          {COMPARE.map(([k, old, now]) => (
            <Row key={k} wrap={false} gap={0} style={{ borderBottomWidth: 1, borderBottomColor: c.line2 }}>
              <View style={{ flex: 1.4, padding: 12 }}><T size={12.5} weight="700">{k}</T></View>
              <View style={{ flex: 1.6, padding: 12 }}><Muted>{old}</Muted></View>
              <View style={{ flex: 1.6, padding: 12 }}><Badge label={now} tone="green" icon="check" /></View>
            </Row>
          ))}
        </CardBody>
      </Card>
    </View>
  );
}
