import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  Avatar, Badge, Between, Button, Card, CardBody, CardHead, Cols, IconTile, Muted,
  PageHeader, Row, Stack, T,
} from '../components/ui';
import { gmbApi } from '../lib/api/gmb';
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
  const params = useLocalSearchParams<{ connected?: string; error?: string }>();
  const { businesses, activeBiz, gmbConnected, gmbEmail, user, setActiveBiz, setGmbConnection } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const [loadingLocations, setLoadingLocations] = React.useState(false);

  // the OAuth callback route redirects here with ?connected=1 or ?error=...
  React.useEffect(() => {
    if (params.error) {
      toast('Google connection failed', params.error, 'err');
      router.setParams({ error: undefined });
      return;
    }
    if (params.connected) {
      gmbApi.status().then((s) => setGmbConnection(s.connected, s.email))
        .then(() => toast('Google Business Profile connected', undefined, 'ok'));
      router.setParams({ connected: undefined });
    }
  }, [params.connected, params.error]);

  // pick up a session from an earlier visit (e.g. after a reload)
  React.useEffect(() => {
    gmbApi.status().then((s) => setGmbConnection(s.connected, s.email)).catch(() => {});
  }, []);

  const connect = () => {
    if (Platform.OS !== 'web') {
      toast('Google sign-in on device is coming soon', 'Use the browser build for now', 'err');
      return;
    }
    gmbApi.startConnect();
  };

  const disconnect = () => openModal({
    title: 'Disconnect Google?',
    content: <Muted size={13}>Posting, reviews, insights and health checks will stop working until you reconnect.</Muted>,
    footer: (
      <Row gap={9}>
        <Button label="Cancel" variant="ghost" onPress={closeModal} />
        <Button label="Disconnect" variant="danger" onPress={async () => {
          await gmbApi.disconnect().catch(() => {});
          setGmbConnection(false);
          closeModal();
          toast('Disconnected', undefined, 'err');
        }} />
      </Row>
    ),
  });

  // Pulls the real Business Profile locations for the connected Google account.
  // Picking one doesn't merge it into `businesses` yet — Google's location
  // object doesn't carry a rating, review count or hours the way our demo
  // Business type expects, and those need their own API calls (Places,
  // Business Calendar) that aren't wired up. Showing a fabricated number here
  // would be worse than saying "not yet".
  const addLocation = async () => {
    setLoadingLocations(true);
    try {
      const { locations } = await gmbApi.listLocations();
      openModal({
        title: 'Select a location to connect',
        content: (
          <View>
            <Muted size={13} style={{ marginBottom: 12 }}>Business Profiles available on {gmbEmail ?? user.email}.</Muted>
            {locations.length === 0 ? (
              <Muted size={13}>No additional locations found on this Google account.</Muted>
            ) : (
              <Stack gap={9}>
                {locations.map((l) => (
                  <Card key={l.id} pad={14} onPress={() => {
                    closeModal();
                    toast('Location found', `${l.name} — full sync lands in a follow-up release`, 'ok');
                  }}>
                    <T size={13} weight="700">{l.name}</T>
                    <Muted>{[l.primaryCategory, l.address].filter(Boolean).join(' • ') || 'No address on file'}</Muted>
                  </Card>
                ))}
              </Stack>
            )}
          </View>
        ),
      });
    } catch {
      toast('Could not load locations', 'Check that a Google OAuth client is configured — see .env.example', 'err');
    } finally {
      setLoadingLocations(false);
    }
  };

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
                right={<Button label="Connect location" size="sm" variant="primary" icon="plus" loading={loadingLocations} onPress={addLocation} />} />
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
                  {gmbConnected ? (gmbEmail ?? user.email) : 'Sign in with the Google account that owns your Business Profile.'}
                </Muted>
                <View style={{ width: '100%', marginTop: 16 }}>
                  {gmbConnected
                    ? <Button label="Disconnect" icon="logout" block onPress={disconnect} />
                    : <Button label="Continue with Google" variant="primary" size="lg" icon="google" block onPress={connect} />}
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
