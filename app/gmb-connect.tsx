import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  Avatar, Badge, Between, Button, Card, CardBody, CardHead, Cols, IconTile, Muted,
  PageHeader, Row, Stack, T, useWork,
} from '../components/ui';
import { useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

const SCOPES: [string, string][] = [
  ['business.manage', 'Read and manage your Business Profile, posts and reviews'],
  ['reviews.reply', 'Publish replies to customer reviews'],
  ['insights.read', 'Read performance metrics (views, calls, directions)'],
  ['media.upload', 'Upload photos and videos to your profile'],
];

const DEPENDENTS: [any, string, string][] = [
  ['stethoscope', 'GMB Health', '/gmb-health'], ['chart', 'GMB Insights', '/gmb-insights'],
  ['star', 'Reviews', '/reviews'], ['send', 'Google posting', '/posts'],
  ['monitor', 'Website Builder', '/website'], ['map', 'Rank tracking', '/competitors'],
];

export default function GmbConnect() {
  const { c } = useTheme();
  const router = useRouter();
  const { businesses, activeBiz, gmbConnected, user, setActiveBiz, patch } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const disconnect = () => openModal({
    title: 'Disconnect Google?',
    content: <Muted size={13}>Posting, reviews, insights and health checks will stop working until you reconnect.</Muted>,
    footer: (
      <Row gap={9}>
        <Button label="Cancel" variant="ghost" onPress={closeModal} />
        <Button label="Disconnect" variant="danger" onPress={() => { patch({ gmbConnected: false }); closeModal(); toast('Disconnected', undefined, 'err'); }} />
      </Row>
    ),
  });

  const addLocation = () => run('add', 1400, () => openModal({
    title: 'Select a location to connect',
    content: (
      <View>
        <Muted size={13} style={{ marginBottom: 12 }}>These Business Profiles are available on {user.email}.</Muted>
        <Stack gap={9}>
          {['Sunrise Dental — Thane', 'Sunrise Ortho Centre', 'Sunrise Dental — Pune'].map((nm) => (
            <Card key={nm} pad={14} onPress={() => { closeModal(); toast('Location connected', 'Syncing reviews and insights…', 'ok'); }}>
              <T size={13} weight="700">{nm}</T>
              <Muted>Dental clinic • Unverified</Muted>
            </Card>
          ))}
        </Stack>
      </View>
    ),
  }));

  return (
    <View>
      <PageHeader eyebrow="Core connection" eyebrowIcon="google" title="GMB Connection"
        sub="Connect your Google Business Profile. Reviews, insights, posting, health checks and the website builder all depend on it." />

      <Cols
        sideWidth={330}
        main={
          <>
            <Card>
              <CardHead title="Connected locations" sub={`${businesses.length} location${businesses.length > 1 ? 's' : ''} linked to this account`}
                right={<Button label="Connect location" size="sm" variant="primary" icon="plus" loading={isBusy('add')} onPress={addLocation} />} />
              <CardBody>
                <Stack gap={12}>
                  {businesses.map((b) => (
                    <Card key={b.id} pad={15}>
                      <Between>
                        <Row gap={12} wrap={false} style={{ flexShrink: 1 }}>
                          <Avatar name={b.name} size={40} tone="ink" />
                          <View style={{ flexShrink: 1 }}>
                            <T size={13.5} weight="700">{b.name}</T>
                            <Muted>{b.cat} • {b.loc}</Muted>
                            <Muted>{b.rating}★ ({b.reviews} reviews) • {b.phone}</Muted>
                          </View>
                        </Row>
                        <Row gap={6}>
                          {b.verified ? <Badge label="Verified" tone="green" icon="checkCircle" />
                            : <Badge label="Unverified" tone="amber" icon="alert" />}
                          {b.id === activeBiz ? <Badge label="Active" tone="lemon" />
                            : <Button label="Use" size="sm" onPress={() => { setActiveBiz(b.id); toast('Switched business', b.name, 'ok'); }} />}
                        </Row>
                      </Between>
                    </Card>
                  ))}
                </Stack>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Permissions granted" sub="What Limbu can do on your behalf" />
              <CardBody>
                <Stack gap={11}>
                  {SCOPES.map(([scope, desc]) => (
                    <Row key={scope} gap={11} wrap={false}>
                      <IconTile icon="checkCircle" tone="green" size={30} />
                      <View style={{ flex: 1 }}>
                        <T size={12} weight="700" color={c.emerald}>{scope}</T>
                        <Muted>{desc}</Muted>
                      </View>
                    </Row>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </>
        }
        side={
          <>
            <Card pad={20}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: c.surface,
                  borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon name="google" size={28} color="#4285F4" />
                </View>
                <T size={16} weight="700" heading style={{ textAlign: 'center' }}>
                  {gmbConnected ? 'Google account connected' : 'Connect with Google'}
                </T>
                <Muted style={{ textAlign: 'center', marginTop: 4 }}>
                  {gmbConnected ? user.email : 'Sign in with the Google account that owns your Business Profile.'}
                </Muted>
                <View style={{ width: '100%', marginTop: 16 }}>
                  {gmbConnected
                    ? <Button label="Disconnect" icon="logout" block onPress={disconnect} />
                    : <Button label="Continue with Google" variant="primary" size="lg" icon="google" block
                        loading={isBusy('conn')}
                        onPress={() => run('conn', 1800, () => { patch({ gmbConnected: true }); toast('Google Business Profile connected', undefined, 'ok'); })} />}
                </View>
              </View>
            </Card>

            <Card pad={16}>
              <T size={13} weight="700">Depends on this connection</T>
              <Stack gap={8} style={{ marginTop: 10 }}>
                {DEPENDENTS.map(([icon, label, href]) => (
                  <Pressable key={href} onPress={() => router.push(href as any)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                    <Icon name={icon} size={15} color={c.lemonHover} />
                    <T size={12.5}>{label}</T>
                  </Pressable>
                ))}
              </Stack>
            </Card>
          </>
        }
      />
    </View>
  );
}
