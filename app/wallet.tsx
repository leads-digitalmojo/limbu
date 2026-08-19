import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Cols, Divider, Empty, Field, Grid,
  Input, Muted, PageHeader, Progress, Row, Segment, Stack, T, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { COSTS } from '../lib/nav';
import { useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

const PACKS = [
  { amt: 200, bonus: 0 }, { amt: 500, bonus: 25 }, { amt: 1000, bonus: 100 }, { amt: 2500, bonus: 325 },
  { amt: 5000, bonus: 750 }, { amt: 10000, bonus: 2000 }, { amt: 25000, bonus: 6250 }, { amt: 50000, bonus: 15000 },
];

const PRICE_LIST: [string, number][] = [
  ['AI post generation', COSTS.generate], ['Publishing per platform', COSTS.publishPerPlatform],
  ['AI review reply', COSTS.reviewReply], ['Rank audit 5×5', COSTS.audit[5]],
  ['Website generation', COSTS.website], ['AI image', 20],
];

export default function Wallet() {
  const { c, width } = useTheme();
  const { user, transactions, topup } = useStore();
  const { toast } = useUI();
  const { run, isBusy } = useWork();

  const [sel, setSel] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [gst, setGst] = useState('');
  const [filter, setFilter] = useState('');

  const amount = sel != null ? PACKS[sel].amt : Number(custom) || 0;
  const bonus = sel != null ? PACKS[sel].bonus : Math.floor(amount * 0.15);
  const gstAmount = Math.round(amount * 0.18);

  const pay = () => {
    if (amount < 100) return toast('Choose an amount', 'Minimum recharge is ₹100', 'err');
    run('pay', 2000, () => {
      topup(amount, bonus);
      toast('Payment successful 🎉', `${fmt.n(amount + bonus)} credits added`, 'ok');
      setSel(null); setCustom('');
    });
  };

  const items = transactions.filter((t) => !filter || t.type === filter);

  return (
    <View>
      <PageHeader eyebrow="Billing" eyebrowIcon="wallet" title="Wallet"
        sub="Credits power AI generation, publishing, review replies and rank audits."
        actions={<Button label="Download invoices" icon="file" loading={isBusy('inv')}
          onPress={() => run('inv', 900, () => toast('Invoices downloaded', 'limbu-invoices.zip', 'ok'))} />} />

      <Cols
        sideWidth={370}
        main={
          <>
            <Card>
              <CardHead title="Recharge your wallet" sub="Bigger packs carry bigger bonuses" />
              <CardBody>
                <Grid cols={4} minWidth={150} gap={12}>
                  {PACKS.map((p, i) => (
                    <Card key={p.amt} pad={14} onPress={() => { setSel(i); setCustom(''); }}
                      style={{ alignItems: 'center', borderColor: sel === i ? c.lemon : c.line }}>
                      {p.bonus > 0 && <Badge label={`+${fmt.n(p.bonus)} bonus`} tone="lemon" />}
                      <T size={20} weight="800" heading style={{ marginTop: p.bonus ? 6 : 0 }}>{fmt.inr(p.amt)}</T>
                      <Muted>{fmt.n(p.amt + p.bonus)} credits</Muted>
                    </Card>
                  ))}
                </Grid>
                <Divider />
                <Grid cols={2} minWidth={230} gap={14}>
                  <Field label="Custom amount" style={{ marginBottom: 0 }}>
                    <Input value={custom} keyboardType="numeric" placeholder="Enter amount (min ₹100)"
                      onChangeText={(v) => { setCustom(v.replace(/[^0-9]/g, '')); setSel(null); }} />
                  </Field>
                  <Field label="GST number (optional)" style={{ marginBottom: 0 }}>
                    <Input value={gst} onChangeText={setGst} placeholder="27AABCU9603R1ZX" />
                  </Field>
                </Grid>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Transaction history" sub="All credits and debits on this account"
                right={<Segment value={filter} onChange={setFilter}
                  items={[{ key: '', label: 'All' }, { key: 'credit', label: 'Credits' }, { key: 'debit', label: 'Debits' }]} />} />
              {items.length === 0 ? (
                <Empty icon="card" title="No transactions" desc="Recharge your wallet to see activity here." />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ minWidth: Math.max(width - 480, 620) }}>
                    <Row wrap={false} gap={0} style={{ backgroundColor: c.surface2, borderBottomWidth: 1, borderColor: c.line }}>
                      {[['Description', 3], ['Type', 1], ['Reference', 1.4], ['Date', 1.4], ['Amount', 1.2]].map(([h, f], i) => (
                        <View key={i} style={{ flex: f as number, padding: 11 }}>
                          <T size={10.5} weight="700" color={c.text3} style={{ letterSpacing: 0.8 }}>{String(h).toUpperCase()}</T>
                        </View>
                      ))}
                    </Row>
                    {items.map((t) => (
                      <Row key={t.id} wrap={false} gap={0} style={{ borderBottomWidth: 1, borderBottomColor: c.line2 }}>
                        <View style={{ flex: 3, padding: 11 }}><T size={12.5} weight="700">{t.label}</T></View>
                        <View style={{ flex: 1, padding: 11 }}><Badge label={t.type} tone={t.type === 'credit' ? 'green' : 'slate'} /></View>
                        <View style={{ flex: 1.4, padding: 11 }}><Muted>{t.ref}</Muted></View>
                        <View style={{ flex: 1.4, padding: 11 }}><Muted>{fmt.date(t.at)}</Muted></View>
                        <View style={{ flex: 1.2, padding: 11 }}>
                          <T size={13} weight="700" color={t.amount > 0 ? c.emerald : c.red}>
                            {t.amount > 0 ? '+' : ''}{fmt.n(t.amount)}
                          </T>
                        </View>
                      </Row>
                    ))}
                  </View>
                </ScrollView>
              )}
            </Card>
          </>
        }
        side={
          <>
            <Card>
              <CardHead title="Order summary" />
              <CardBody>
                <View style={{ backgroundColor: '#0F172B', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <T size={10.5} weight="600" color="#94A3B8" style={{ letterSpacing: 0.6 }}>CURRENT BALANCE</T>
                  <T size={26} weight="800" heading color={c.lemon}>{fmt.n(user.credits)}</T>
                  <T size={12} color="#94A3B8">credits available</T>
                  <View style={{ marginTop: 10 }}><Progress value={(user.credits / user.creditCap) * 100} /></View>
                </View>

                <Stack gap={9}>
                  <Between><Muted>Recharge amount</Muted><T size={12.5} weight="700">{fmt.inr(amount)}</T></Between>
                  <Between><Muted>Bonus credits</Muted><T size={12.5} weight="700" color={c.emerald}>+{fmt.n(bonus)}</T></Between>
                  <Between><Muted>GST (18%)</Muted><T size={12.5} weight="700">{fmt.inr(gstAmount)}</T></Between>
                  <Divider style={{ marginVertical: 4 }} />
                  <Between>
                    <T size={13} weight="700">Total payable</T>
                    <T size={19} weight="800" heading>{fmt.inr(amount + gstAmount)}</T>
                  </Between>
                  <Between><Muted>Credits you receive</Muted><T size={12.5} weight="700">{fmt.n(amount + bonus)}</T></Between>
                </Stack>

                <Button label="Pay with Razorpay" variant="primary" size="lg" icon="card" block
                  style={{ marginTop: 16 }} loading={isBusy('pay')} onPress={pay} />
                <Row gap={5} wrap={false} style={{ marginTop: 10, justifyContent: 'center' }}>
                  <Icon name="lock" size={12} color={c.text3} />
                  <Muted size={11.5}>Secured by Razorpay • UPI, cards, netbanking</Muted>
                </Row>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="What credits cost" />
              <CardBody>
                <Stack gap={8}>
                  {PRICE_LIST.map(([l, v]) => (
                    <Between key={l}><T size={12.5}>{l}</T><T size={12.5} weight="700">{v}</T></Between>
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
