import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BarChart, Donut } from '../components/charts';
import { Icon, IconName } from '../components/Icon';
import { StatCard } from '../components/StatCard';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Cols, Field, Grid, IconTile, Input,
  LinkButton, Muted, PageHeader, Row, Stack, T,
} from '../components/ui';
import { fmt } from '../lib/format';
import { lastDays, rand, series } from '../lib/mock';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

export default function Profile() {
  const { c, width } = useTheme();
  const biz = useBiz();
  const { user, posts, businesses, brand, keywords, audits, transactions, patch } = useStore();
  const { toast, openModal, closeModal } = useUI();

  const stat = (s: string) => posts.filter((p) => p.status === s).length;
  const aiImages = posts.length * 3 + 42;

  const editProfile = () => {
    let draft = { ...user };
    const Body = () => {
      const [v, setV] = useState(user);
      draft = v;
      return (
        <View>
          <Field label="Full name"><Input value={v.name} onChangeText={(t) => { const nx = { ...v, name: t }; setV(nx); draft = nx; }} /></Field>
          <Field label="Email"><Input value={v.email} onChangeText={(t) => { const nx = { ...v, email: t }; setV(nx); draft = nx; }} /></Field>
          <Field label="Phone"><Input value={v.phone} onChangeText={(t) => { const nx = { ...v, phone: t }; setV(nx); draft = nx; }} /></Field>
        </View>
      );
    };
    openModal({
      title: 'Edit profile', content: <Body />,
      footer: (
        <Row gap={9}>
          <Button label="Cancel" variant="ghost" onPress={closeModal} />
          <Button label="Save changes" variant="primary" onPress={() => { patch({ user: draft }); closeModal(); toast('Profile updated', undefined, 'ok'); }} />
        </Row>
      ),
    });
  };

  return (
    <View>
      <PageHeader eyebrow="Account" eyebrowIcon="user" title="My Profile"
        sub="Your account, membership, credits and everything Limbu has created for you."
        actions={
          <>
            <Button label="Edit profile" icon="edit" onPress={editProfile} />
            <LinkButton label="Recharge" href="/wallet" variant="primary" icon="coin" />
          </>
        } />

      <Cols
        sideWidth={330}
        main={
          <>
            <Grid cols={4} minWidth={210}>
              <StatCard icon="checkCircle" tone="green" value={stat('approved') + stat('posted')} label="Approved & published" />
              <StatCard icon="clock" value={stat('pending')} label="Pending approval" />
              <StatCard icon="calendar" tone="blue" value={stat('scheduled')} label="Scheduled" />
              <StatCard icon="image" tone="pink" value={fmt.n(aiImages)} label="AI images generated" delta={46} />
            </Grid>

            <Card>
              <CardHead title="Daily activity" sub="Your content output over the last 14 days" />
              <CardBody>
                <BarChart data={series(14, 4, 4)} labels={lastDays(14).map((d) => d.split(' ')[0])} color={c.lemonHover} height={200} />
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Asset statistics" />
              <CardBody>
                <Grid cols={4} minWidth={140} gap={12}>
                  {([['Brand images', Object.values(brand.images).reduce((a, b) => a + b, 0), 'image'],
                     ['Products', brand.products.length, 'tag'],
                     ['Saved keywords', keywords.length, 'key'],
                     ['Saved audits', audits.length, 'map']] as const).map(([l, v, icon]) => (
                    <Card key={l} pad={15} style={{ alignItems: 'center' }}>
                      <IconTile icon={icon as IconName} size={30} />
                      <T size={20} weight="800" heading style={{ marginTop: 8 }}>{String(v)}</T>
                      <Muted>{l}</Muted>
                    </Card>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Transaction history"
                right={<LinkButton label="View all" href="/wallet" size="sm" variant="ghost" />} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: Math.max(width - 440, 560) }}>
                  <Row wrap={false} gap={0} style={{ backgroundColor: c.surface2, borderBottomWidth: 1, borderColor: c.line }}>
                    {[['Description', 3], ['Reference', 1.4], ['Date', 1.4], ['Amount', 1.2]].map(([h, f], i) => (
                      <View key={i} style={{ flex: f as number, padding: 11 }}>
                        <T size={10.5} weight="700" color={c.text3} style={{ letterSpacing: 0.8 }}>{String(h).toUpperCase()}</T>
                      </View>
                    ))}
                  </Row>
                  {transactions.slice(0, 7).map((t) => (
                    <Row key={t.id} wrap={false} gap={0} style={{ borderBottomWidth: 1, borderBottomColor: c.line2 }}>
                      <View style={{ flex: 3, padding: 11 }}><T size={12.5} weight="700">{t.label}</T></View>
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
            </Card>
          </>
        }
        side={
          <>
            <Card pad={20}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: c.lemon,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <T size={30} weight="800" color="#0F172B" heading>{fmt.initials(user.name)}</T>
                </View>
                <T size={17} weight="700" heading>{user.name}</T>
                <Row gap={6} style={{ marginVertical: 10, justifyContent: 'center' }}>
                  <Badge label={user.plan} tone="lemon" icon="crown" />
                  {user.verified && <Badge label="Verified" tone="green" icon="checkCircle" />}
                </Row>
              </View>
              <Stack gap={9}>
                {([['mail', user.email], ['phone', user.phone], ['building', biz.name],
                   ['calendar', `Member since ${user.memberSince}`]] as const).map(([icon, v]) => (
                  <Row key={v} gap={9} wrap={false}>
                    <Icon name={icon as IconName} size={15} color={c.muted} />
                    <T size={12.5} style={{ flex: 1 }}>{v}</T>
                  </Row>
                ))}
              </Stack>
            </Card>

            <Card>
              <CardHead title="Credits" />
              <CardBody>
                <Donut value={user.credits} max={user.creditCap} color={c.lemonHover} label={`of ${fmt.n(user.creditCap)}`} />
                <LinkButton label="Recharge wallet" href="/wallet" variant="primary" icon="coin" block />
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Membership" />
              <CardBody>
                <Stack gap={11}>
                  {([['Plan', user.plan], ['Billing cycle', 'Monthly'], ['Renews on', user.renews],
                     ['Access expires', user.renews], ['Locations', `${businesses.length} of 5`]] as const).map(([k, v]) => (
                    <Between key={k}><Muted>{k}</Muted><T size={12.5} weight="700">{v}</T></Between>
                  ))}
                  <LinkButton label="Upgrade plan" href="/pricing" icon="crown" block />
                </Stack>
              </CardBody>
            </Card>
          </>
        }
      />
    </View>
  );
}
