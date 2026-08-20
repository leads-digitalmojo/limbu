import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '../../components/Icon';
import { PostCreative } from '../../components/PostCreative';
import {
  Badge, Between, Button, Card, CardBody, CardHead, CheckRow, Chip, Cols, Divider, Empty, Field,
  Grid, Input, Muted, PageHeader, Row, Segment, Stack, T, useWork,
} from '../../components/ui';
import { fmt } from '../../lib/format';
import { COSTS, PLATFORMS, POST_THEMES, RATIOS } from '../../lib/nav';
import { postsApi } from '../../lib/api/posts';
import { uid } from '../../lib/mock';
import { useBiz, useStore } from '../../store/useStore';
import { useUI } from '../../store/ui';
import { useTheme } from '../../theme/ThemeProvider';

const ASSET_SLOTS = [
  ['logo', 'Logo'], ['character', 'Character'], ['product', 'Product'],
  ['uniform', 'Uniform'], ['background', 'Background'],
] as const;

export default function NewPost() {
  const { c } = useTheme();
  const router = useRouter();
  const biz = useBiz();
  const { brand, keywords, user, spend, addPost } = useStore();
  const { toast } = useUI();
  const { run, isBusy } = useWork();

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [lang, setLang] = useState('en');
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['google']);
  const [selKeywords, setSelKeywords] = useState<string[]>([]);
  const [theme, setTheme] = useState(brand.theme);
  const [ratio, setRatio] = useState(brand.ratio);
  const [assets, setAssets] = useState<Record<string, boolean>>({ logo: true, character: false, product: true, uniform: false, background: true });
  const [schedule, setSchedule] = useState<'now' | 'schedule' | 'approval'>('now');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const cost = platforms.length * COSTS.publishPerPlatform;

  const generateCaption = async (): Promise<string> => {
    const { caption: text } = await postsApi.generateCaption({
      businessName: biz.name, city: biz.city, phone: biz.phone, address: biz.loc,
      prompt: prompt.trim() || 'A general update from the business', lang: lang as 'en' | 'hi',
      keywords: selKeywords,
    });
    return text;
  };

  const onGenerate = () => {
    if (!prompt.trim()) return toast('Add a prompt first', 'Tell Limbu what the post is about', 'err');
    if (user.credits < COSTS.generate) return toast('Not enough credits', 'Recharge your wallet to generate', 'err');
    setGenerating(true);
    generateCaption()
      .then((text) => {
        spend(COSTS.generate, 'AI post generation');
        setCaption(text);
        setGenerated(true);
        toast('Caption generated', `${COSTS.generate} credits used`, 'ok');
      })
      .catch((e) => toast('Could not generate caption', e instanceof Error ? e.message : String(e), 'err'))
      .finally(() => setGenerating(false));
  };

  const [regenerating, setRegenerating] = useState(false);
  const regenerate = () => {
    setRegenerating(true);
    generateCaption()
      .then(setCaption)
      .catch((e) => toast('Could not regenerate caption', e instanceof Error ? e.message : String(e), 'err'))
      .finally(() => setRegenerating(false));
  };

  const onDeploy = () => {
    if (!platforms.length) return toast('Pick a platform', 'Select at least one destination', 'err');
    if (!caption && !prompt) return toast('Nothing to publish', 'Generate or write a caption first', 'err');
    if (user.credits < cost) return toast('Not enough credits', 'Recharge your wallet', 'err');
    run('deploy', 1600, () => {
      spend(cost, `Post publishing ×${platforms.length}`);
      addPost({
        id: uid('post'), caption: caption || prompt, platforms: [...platforms],
        status: schedule === 'now' ? 'posted' : schedule === 'schedule' ? 'scheduled' : 'pending',
        type: 'image', ratio, theme, keywords: [...selKeywords], mode, bizId: biz.id,
        createdAt: new Date().toISOString(), stats: { views: 0, likes: 0, clicks: 0 },
      });
      toast(schedule === 'now' ? 'Post published 🎉' : 'Post queued',
        `${platforms.join(', ')} • ${cost} credits used`, 'ok');
      router.push('/posts');
    });
  };

  const toggle = <T,>(list: T[], v: T) => list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  if (!biz) {
    return (
      <View>
        <PageHeader eyebrow="Magic Post" eyebrowIcon="wand" title="Create a post"
          sub="Connect your Google Business Profile before creating a post." />
        <Card><Empty icon="wand" title="No business connected"
          desc="Connect a Google Business Profile location to generate a Magic Post." /></Card>
      </View>
    );
  }

  return (
    <View>
      <PageHeader eyebrow="Magic Post" eyebrowIcon="wand" title="Create a post"
        sub="Describe your offer in one line — Limbu writes the caption, generates the image with your brand assets and publishes everywhere."
        actions={<Button label="Back to posts" variant="ghost" onPress={() => router.push('/posts')} />} />

      <Cols
        sideWidth={330}
        main={
          <>
            <Card>
              <CardHead title="1 · Platforms" sub="Where should this post go?" />
              <CardBody>
                <Row gap={8}>
                  {PLATFORMS.map((p) => (
                    <Chip key={p.k} label={p.name} icon={p.icon} on={platforms.includes(p.k)}
                      onPress={() => setPlatforms((s) => toggle(s, p.k))} />
                  ))}
                </Row>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="2 · Content" sub="AI Auto Post or upload your own creative"
                right={<Segment value={mode} onChange={(v) => setMode(v as any)}
                  items={[{ key: 'auto', label: 'AI Auto Post' }, { key: 'manual', label: 'Manual Post' }]} />} />
              <CardBody>
                {mode === 'auto' ? (
                  <>
                    <Field label="What should this post be about?" required
                      hint="Tip: mention the offer, the audience and the deadline for the best results.">
                      <Input value={prompt} onChangeText={setPrompt} multiline
                        placeholder="e.g. Monsoon offer — full dental check-up and cleaning at ₹499, valid till 30th" />
                    </Field>
                    <Between>
                      <Row gap={8}>
                        <Segment value={lang} onChange={setLang}
                          items={[{ key: 'en', label: 'English' }, { key: 'hi', label: 'हिन्दी' }]} />
                        <Button label="Voice" icon="mic" size="sm"
                          onPress={() => toast('Listening…', 'Voice input captures your prompt in English or Hindi')} />
                      </Row>
                      <Button label="Generate with AI" variant="dark" icon="sparkles"
                        loading={generating} onPress={onGenerate} />
                    </Between>

                    {generated && (
                      <Card pad={14} style={{ marginTop: 14, borderColor: c.lemon }}>
                        <Between style={{ marginBottom: 10 }}>
                          <Row gap={6} wrap={false}>
                            <Icon name="sparkles" size={14} color={c.lemonHover} />
                            <T size={13} weight="700">AI generated caption</T>
                          </Row>
                          <Button label="Regenerate" size="sm" variant="ghost" loading={regenerating}
                            onPress={regenerate} />
                        </Between>
                        <Input value={caption} onChangeText={setCaption} multiline />
                      </Card>
                    )}
                  </>
                ) : (
                  <>
                    <Grid cols={2} minWidth={180} gap={12}>
                      <Card pad={22} onPress={() => toast('Upload ready', 'File picker opens here in the production build')}
                        style={{ alignItems: 'center' }}>
                        <Icon name="image" size={22} color={c.text2} />
                        <T size={13} weight="700" style={{ marginTop: 8 }}>Upload image</T>
                        <Muted size={11.5}>JPG / PNG up to 8MB</Muted>
                      </Card>
                      <Card pad={22} onPress={() => toast('Upload ready', 'File picker opens here in the production build')}
                        style={{ alignItems: 'center' }}>
                        <Icon name="video" size={22} color={c.text2} />
                        <T size={13} weight="700" style={{ marginTop: 8 }}>Upload video</T>
                        <Muted size={11.5}>MP4 up to 60s</Muted>
                      </Card>
                    </Grid>
                    <Field label="Caption" style={{ marginTop: 16 }}>
                      <Input value={caption} onChangeText={setCaption} multiline placeholder="Write your caption…" />
                    </Field>
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHead title="3 · Brand & style" sub="Pulled from your Assets Manager"
                right={<Button label="Edit assets" variant="ghost" size="sm" onPress={() => router.push('/assets')} />} />
              <CardBody>
                <Field label="Colour theme">
                  <Row gap={8}>
                    {Object.entries(POST_THEMES).map(([k, v]) => (
                      <Chip key={k} label={k} on={theme === k} swatch={v[0]} onPress={() => setTheme(k)} />
                    ))}
                  </Row>
                </Field>
                <Field label="Image ratio">
                  <Row gap={8}>
                    {RATIOS.map((r) => <Chip key={r} label={r} on={ratio === r} onPress={() => setRatio(r)} />)}
                  </Row>
                </Field>
                <Field label="Brand assets to include">
                  <Grid cols={3} minWidth={150} gap={9}>
                    {ASSET_SLOTS.map(([k, label]) => (
                      <CheckRow key={k} label={label} checked={!!assets[k]}
                        desc={`${(brand.images as any)[k] ?? 0} uploaded`}
                        onPress={() => setAssets((s) => ({ ...s, [k]: !s[k] }))} />
                    ))}
                  </Grid>
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHead title="4 · Keywords" sub="Saved keywords from your Keyword Planner get woven into the caption"
                right={<Button label="Planner" variant="ghost" size="sm" onPress={() => router.push('/keywords')} />} />
              <CardBody>
                {keywords.length ? (
                  <Row gap={8}>
                    {keywords.map((k) => (
                      <Chip key={k.id} label={k.kw} icon="key" on={selKeywords.includes(k.kw)}
                        onPress={() => setSelKeywords((s) => toggle(s, k.kw))} />
                    ))}
                  </Row>
                ) : (
                  <Muted>No saved keywords yet — find some in the Keyword Planner.</Muted>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHead title="5 · Publish" />
              <CardBody>
                <Row gap={8}>
                  <Chip label="Publish now" icon="zap" on={schedule === 'now'} onPress={() => setSchedule('now')} />
                  <Chip label="Schedule" icon="calendar" on={schedule === 'schedule'} onPress={() => setSchedule('schedule')} />
                  <Chip label="Send for approval" icon="shield" on={schedule === 'approval'} onPress={() => setSchedule('approval')} />
                </Row>
                <Row gap={12} style={{ marginTop: 16 }}>
                  <Button label="Deploy post" variant="primary" size="lg" icon="rocket" loading={isBusy('deploy')} onPress={onDeploy} />
                  <Muted>Costs {COSTS.publishPerPlatform} credits per platform</Muted>
                </Row>
              </CardBody>
            </Card>
          </>
        }
        side={
          <Card>
            <CardHead title="AI preview" sub="Live preview of your creative"
              right={<Button label="" icon="refresh" size="sm" variant="ghost" loading={regenerating}
                onPress={regenerate} />} />
            <CardBody>
              <Card style={{ overflow: 'hidden' }}>
                <PostCreative
                  caption={(caption || prompt || 'Your Magic Post headline appears here').split('.')[0].slice(0, 70)}
                  theme={theme} ratio={ratio} logo={assets.logo} initials={fmt.initials(biz.name)} />
                <View style={{ padding: 12 }}>
                  <Muted size={12.5}>{caption || 'Caption will be generated by AI…'}</Muted>
                  <Row gap={5} style={{ marginTop: 9 }}>
                    {selKeywords.map((k) => <Badge key={k} label={`#${k.replace(/\s+/g, '')}`} />)}
                  </Row>
                </View>
              </Card>
              <Divider />
              <Between>
                <Muted>Credits after publish</Muted>
                <T size={13} weight="700">{fmt.n(Math.max(0, user.credits - cost))}</T>
              </Between>
            </CardBody>
          </Card>
        }
      />
    </View>
  );
}
