import React, { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { QrCode } from '../components/QrCode';
import { StatCard } from '../components/StatCard';
import {
  Avatar, Badge, Between, Button, Card, CardBody, CardHead, Cols, Empty, Field, Grid, IconTile,
  Input, Muted, PageHeader, Row, Segment, Stack, Stars, T, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

export default function MagicQR() {
  const { c } = useTheme();
  const biz = useBiz();
  const { qr, reviews, setQr } = useStore();
  const { toast } = useUI();
  const { run, isBusy } = useWork();

  const [slug, setSlug] = useState(qr.slug);
  const [threshold, setThreshold] = useState(String(qr.threshold));
  // limbu.link isn't a real service yet — the routing/redirect backend behind
  // a scanned code (rate the visit -> Google review or a private lead) needs
  // a persistence layer this app doesn't have at all yet. The code itself is
  // now a real, standards-compliant, scannable QR (see components/QrCode.tsx);
  // what it points to is still a placeholder, same as the rest of the demo
  // business's fictional URLs.
  const url = `https://limbu.link/r/${slug}`;

  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<any>(null);

  const copy = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') navigator.clipboard?.writeText(url);
    toast('Link copied', url, 'ok');
  };

  const download = () => {
    if (Platform.OS !== 'web' || !qrRef.current) {
      toast('Download not available here yet', 'Use the browser build for now', 'err');
      return;
    }
    setDownloading(true);
    qrRef.current.toDataURL((base64: string) => {
      const a = document.createElement('a');
      a.href = `data:image/png;base64,${base64}`;
      a.download = `magic-qr-${slug}.png`;
      a.click();
      setDownloading(false);
      toast('QR downloaded', `magic-qr-${slug}.png`, 'ok');
    }, { width: 1024, height: 1024 });
  };

  if (!biz) {
    return (
      <View>
        <PageHeader eyebrow="Review collection" eyebrowIcon="qr" title="Magic QR"
          sub="Connect your Google Business Profile to generate a Magic QR." />
        <Card><Empty icon="qr" title="No business connected"
          desc="Connect a Google Business Profile location to generate your Magic QR." /></Card>
      </View>
    );
  }

  return (
    <View>
      <PageHeader eyebrow="Review collection" eyebrowIcon="qr" title="Magic QR"
        sub="Print one QR code. Happy customers go straight to Google, unhappy ones reach you privately first."
        actions={
          <>
            <Button label="Copy link" icon="copy" onPress={copy} />
            <Button label="Download QR" variant="primary" icon="download" loading={downloading} onPress={download} />
          </>
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={3} minWidth={220}>
          <StatCard icon="qr" value={fmt.n(qr.scans)} label="Total scans" />
          <StatCard icon="star" tone="green" value={fmt.n(qr.reviewsCollected)} label="Reviews collected" />
          <StatCard icon="percent" tone="blue"
            value={qr.scans > 0 ? `${Math.round((qr.reviewsCollected / qr.scans) * 100)}%` : '—'} label="Scan → review rate" />
        </Grid>
      </View>

      <Cols
        sideWidth={360}
        main={
          <>
            <Card>
              <CardHead title="Review routing" sub="How Limbu handles each rating" />
              <CardBody>
                <Grid cols={2} minWidth={230} gap={14}>
                  <Card pad={16}>
                    <IconTile icon="star" tone="green" />
                    <T size={13.5} weight="700" style={{ marginTop: 10 }}>Rated {threshold}★ or above</T>
                    <Muted size={12.5} style={{ marginTop: 5 }}>Customer is sent straight to your Google review page to publish it.</Muted>
                  </Card>
                  <Card pad={16}>
                    <IconTile icon="shield" tone="orange" />
                    <T size={13.5} weight="700" style={{ marginTop: 10 }}>Rated below {threshold}★</T>
                    <Muted size={12.5} style={{ marginTop: 5 }}>Feedback comes to you privately as a lead — no public damage.</Muted>
                  </Card>
                </Grid>

                <Field label="Google review threshold" style={{ marginTop: 22 }}
                  hint={`Currently routing ${threshold}★ and above to Google.`}>
                  <Segment value={threshold} onChange={setThreshold}
                    items={[{ key: '3', label: '3★ and up' }, { key: '4', label: '4★ and up' }, { key: '5', label: '5★ only' }]} />
                </Field>

                <Field label="QR link slug" hint={`limbu.link/r/${slug}`}>
                  <Input value={slug} onChangeText={setSlug} />
                </Field>

                <Button label="Save settings" variant="primary" icon="check" loading={isBusy('save')}
                  onPress={() => run('save', 700, () => {
                    setQr({ slug: slug.trim() || qr.slug, threshold: Number(threshold) });
                    toast('Magic QR updated', undefined, 'ok');
                  })} />
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Customer reviews via QR" sub="Latest feedback collected through the code" />
              <CardBody>
                {reviews.length === 0 ? (
                  <Empty icon="star" title="No reviews yet" desc="Reviews collected through this code will show up here." />
                ) : (
                <Stack gap={12}>
                  {reviews.slice(0, 4).map((r) => (
                    <Row key={r.id} gap={11} wrap={false} align="flex-start">
                      <Avatar name={r.author} />
                      <View style={{ flex: 1 }}>
                        <Row gap={8}><T size={13} weight="700">{r.author}</T><Stars value={r.rating} size={12} /></Row>
                        <Muted numberOfLines={2}>{r.text}</Muted>
                      </View>
                      <Badge label={r.rating >= Number(threshold) ? '→ Google' : '→ Private'}
                        tone={r.rating >= Number(threshold) ? 'green' : 'amber'} />
                    </Row>
                  ))}
                </Stack>
                )}
              </CardBody>
            </Card>
          </>
        }
        side={
          <Card>
            <CardHead title="Your Magic QR" sub={biz.name} />
            <CardBody>
              <View style={{ alignItems: 'center' }}>
                <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: c.line }}>
                  <QrCode value={url} getRef={(r) => { qrRef.current = r; }} />
                </View>
                <Muted size={11.5} style={{ marginTop: 12, textAlign: 'center' }}>{url}</Muted>
                <Row gap={8} style={{ marginTop: 14, justifyContent: 'center' }}>
                  <Button label="Print poster" size="sm" icon="file"
                    onPress={() => { if (Platform.OS === 'web') window.print(); else toast('Print sheet', 'Sends the poster to a connected printer'); }} />
                  <Button label="Share" size="sm" icon="share" onPress={() => toast('Share sheet', 'Send the QR to your team on WhatsApp')} />
                </Row>
              </View>
            </CardBody>
          </Card>
        }
      />
    </View>
  );
}
