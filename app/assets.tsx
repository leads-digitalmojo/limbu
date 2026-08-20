import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { PostCreative } from '../components/PostCreative';
import { StatCard } from '../components/StatCard';
import {
  Badge, Between, Button, Card, CardBody, CardHead, Chip, Cols, Field, Grid, IconTile,
  Input, Muted, PageHeader, Row, Stack, T, useWork,
} from '../components/ui';
import { fmt } from '../lib/format';
import { uid } from '../lib/mock';
import { POST_THEMES, RATIOS } from '../lib/nav';
import { useBiz, useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

type SlotKey = 'logo' | 'character' | 'uniform' | 'background';
const SLOTS: [SlotKey, string, string][] = [
  ['logo', 'Logo', 'Your brand mark, watermarked on every creative'],
  ['character', 'Character', 'A recurring face/mascot for consistent posts'],
  ['uniform', 'Uniform', 'Staff uniform so AI people look like your team'],
  ['background', 'Background', 'Your actual premises used as scene backdrops'],
];
const ICONS: Record<SlotKey, IconName> = { logo: 'zap', character: 'user', uniform: 'briefcase', background: 'image' };

export default function Assets() {
  const { c } = useTheme();
  const biz = useBiz();
  const { brand, businesses, setBrand } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const [style, setStyle] = useState(brand.style);
  const [custom, setCustom] = useState(brand.custom);

  const totalAssets = Object.values(brand.images).reduce((a, b) => a + b, 0)
    + brand.products.reduce((a, p) => a + p.imgs, 0);

  const addProduct = () => {
    let name = '', price = '';
    const Body = () => {
      const [n, setN] = useState(''); const [p, setP] = useState('');
      name = n; price = p;
      return (
        <View>
          <Field label="Product / service name" required>
            <Input value={n} onChangeText={(v) => { setN(v); name = v; }} placeholder="e.g. Invisible Aligners" />
          </Field>
          <Field label="Price">
            <Input value={p} onChangeText={(v) => { setP(v); price = v; }} placeholder="₹65,000" />
          </Field>
        </View>
      );
    };
    openModal({
      title: 'Add product',
      content: <Body />,
      footer: (
        <Row gap={9}>
          <Button label="Cancel" variant="ghost" onPress={closeModal} />
          <Button label="Add product" variant="primary" onPress={() => {
            if (!name.trim()) return toast('Name required', undefined, 'err');
            setBrand({ products: [...brand.products, { id: uid('p'), name: name.trim(), price: price || 'On request', imgs: 1 }] });
            closeModal(); toast('Product added', name, 'ok');
          }} />
        </Row>
      ),
    });
  };

  return (
    <View>
      <PageHeader eyebrow="Brand kit" eyebrowIcon="palette" title="Assets Management"
        sub="Everything the AI uses to make posts look like they came from your business — not a stock library."
        actions={
          <>
            <Button label="Copy to all locations" icon="copy" loading={isBusy('copy')}
              onPress={() => run('copy', 900, () => toast('Settings copied', `Applied to all ${businesses.length} locations`, 'ok'))} />
            <Button label="Force sync" icon="sync" loading={isBusy('sync')}
              onPress={() => run('sync', 1200, () => toast('Assets synced', undefined, 'ok'))} />
          </>
        } />

      <View style={{ marginBottom: 16 }}>
        <Grid cols={4} minWidth={220}>
          <StatCard icon="image" tone="blue" value={fmt.n(totalAssets)} label="Brand assets stored" />
          <StatCard icon="palette" value={brand.theme} label="Active colour theme" />
          <StatCard icon="layout" tone="indigo" value={brand.ratio} label="Default image ratio" />
          <StatCard icon="tag" tone="pink" value={fmt.n(brand.products.length)} label="Products in gallery" />
        </Grid>
      </View>

      <Cols
        sideWidth={330}
        main={
          <>
            <Card>
              <CardHead title="Brand style" sub="Sets the mood of every AI creative" />
              <CardBody>
                <Field label="Colour theme">
                  <Row gap={8}>
                    {Object.entries(POST_THEMES).map(([k, v]) => (
                      <Chip key={k} label={k} on={brand.theme === k} swatch={v[0]} onPress={() => setBrand({ theme: k })} />
                    ))}
                  </Row>
                </Field>
                <Grid cols={2} minWidth={240} gap={16}>
                  <Field label="Custom brand colour" hint="Used when no preset theme fits your palette.">
                    <Row gap={9} wrap={false}>
                      <View style={{ width: 46, height: 40, borderRadius: 10, backgroundColor: custom, borderWidth: 1, borderColor: c.line }} />
                      <View style={{ flex: 1 }}>
                        <Input value={custom} onChangeText={(v) => { setCustom(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) setBrand({ custom: v }); }} />
                      </View>
                    </Row>
                  </Field>
                  <Field label="Default image ratio">
                    <Row gap={8}>
                      {RATIOS.map((r) => <Chip key={r} label={r} on={brand.ratio === r} onPress={() => setBrand({ ratio: r })} />)}
                    </Row>
                  </Field>
                </Grid>
                <Field label="Brand voice & style notes" hint="Written into every AI prompt so captions stay on-brand.">
                  <Input value={style} onChangeText={setStyle} multiline />
                </Field>
                <Button label="Save brand style" variant="primary" icon="check" loading={isBusy('save')}
                  onPress={() => run('save', 700, () => { setBrand({ style }); toast('Brand style saved', 'Applied to all future AI posts', 'ok'); })} />
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Brand images" sub="Upload once — reused across every generated post" />
              <CardBody>
                <Grid cols={4} minWidth={165} gap={12}>
                  {SLOTS.map(([k, label, desc]) => (
                    <Card key={k}>
                      <View style={{ height: 88, backgroundColor: POST_THEMES[brand.theme]?.[1] ?? c.ink,
                        alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={ICONS[k]} size={20} color="#fff" />
                        <T size={11} weight="700" color="#fff" style={{ marginTop: 6 }}>{label.toUpperCase()}</T>
                      </View>
                      <View style={{ padding: 12 }}>
                        <Between>
                          <T size={12.5} weight="700">{label}</T>
                          <Badge label={String(brand.images[k] ?? 0)} tone={brand.images[k] ? 'green' : 'amber'} />
                        </Between>
                        <Muted size={11.5} style={{ marginVertical: 6 }}>{desc}</Muted>
                        <Button label="Upload" size="sm" icon="upload" block
                          onPress={() => {
                            const next = (brand.images[k] ?? 0) + 1;
                            setBrand({ images: { ...brand.images, [k]: next } });
                            toast('Asset uploaded', `${label} library now has ${next} image(s)`, 'ok');
                          }} />
                      </View>
                    </Card>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Product gallery" sub="Services and products the AI can feature in posts"
                right={<Button label="Add product" size="sm" variant="primary" icon="plus" onPress={addProduct} />} />
              <CardBody>
                {brand.products.length === 0 ? <Muted>No products yet.</Muted> : (
                  <Grid cols={3} minWidth={190} gap={12}>
                    {brand.products.map((p) => (
                      <Card key={p.id} pad={14}>
                        <Between>
                          <T size={13} weight="700" style={{ flexShrink: 1 }}>{p.name}</T>
                          <Pressable accessibilityLabel="Remove product" style={{ padding: 4 }}
                            onPress={() => { setBrand({ products: brand.products.filter((x) => x.id !== p.id) }); toast('Product removed', undefined, 'ok'); }}>
                            <Icon name="trash" size={14} color={c.text3} />
                          </Pressable>
                        </Between>
                        <Muted>{p.price} • {p.imgs} image{p.imgs > 1 ? 's' : ''}</Muted>
                        <Button label="Add images" size="sm" icon="upload" block style={{ marginTop: 12 }}
                          onPress={() => {
                            setBrand({ products: brand.products.map((x) => (x.id === p.id ? { ...x, imgs: x.imgs + 1 } : x)) });
                            toast('Image added', p.name, 'ok');
                          }} />
                      </Card>
                    ))}
                  </Grid>
                )}
              </CardBody>
            </Card>
          </>
        }
        side={
          <>
            <Card>
              <CardHead title="Live preview" sub="How your next post will look" />
              <CardBody>
                <Card style={{ overflow: 'hidden' }}>
                  <PostCreative caption={biz?.name ?? 'Your business'} theme={brand.theme} ratio={brand.ratio} logo initials={fmt.initials(biz?.name ?? 'Your business')} />
                  <View style={{ padding: 12 }}>
                    <Muted size={12.5}>
                      Theme {brand.theme} • Ratio {brand.ratio} • {Object.values(brand.images).reduce((a, b) => a + b, 0)} brand images in use
                    </Muted>
                  </View>
                </Card>
              </CardBody>
            </Card>
            <Card pad={16}>
              <Row gap={11} wrap={false} align="flex-start">
                <IconTile icon="info" />
                <View style={{ flex: 1 }}>
                  <T size={13} weight="700">Why assets matter</T>
                  <Muted size={12.5} style={{ marginTop: 4 }}>
                    Businesses that upload a logo, character and background see roughly 3× more engagement on AI posts,
                    because the creative looks like their real premises.
                  </Muted>
                </View>
              </Row>
            </Card>
          </>
        }
      />
    </View>
  );
}
