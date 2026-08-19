import React from 'react';
import { View } from 'react-native';
import {
  Between, Button, Card, CardBody, CardHead, Field, Grid, Muted, PageHeader, Row,
  Segment, Select, Stack, T, ToggleRow, useWork,
} from '../components/ui';
import { useStore } from '../store/useStore';
import { useUI } from '../store/ui';
import { useTheme } from '../theme/ThemeProvider';

export default function Settings() {
  const { scheme } = useTheme();
  const { settings, theme, setSetting, setTheme, resetDemo } = useStore();
  const { toast, openModal, closeModal } = useUI();
  const { run, isBusy } = useWork();

  const flip = (k: keyof typeof settings, label: string) => {
    const next = !settings[k];
    setSetting(k, next as any);
    toast(next ? 'Enabled' : 'Disabled', label, 'ok');
  };

  const confirm = (title: string, body: string, cta: string, onYes: () => void) => openModal({
    title, content: <Muted size={13}>{body}</Muted>,
    footer: (
      <Row gap={9}>
        <Button label="Cancel" variant="ghost" onPress={closeModal} />
        <Button label={cta} variant="danger" onPress={() => { closeModal(); onYes(); }} />
      </Row>
    ),
  });

  return (
    <View>
      <PageHeader eyebrow="Configuration" eyebrowIcon="settings" title="Settings"
        sub="Control how Limbu behaves on your account." />

      <Grid cols={2} minWidth={360} gap={16}>
        <Stack gap={16}>
          <Card>
            <CardHead title="Automation" />
            <CardBody>
              <ToggleRow title="Auto Post" desc="Limbu plans and publishes a weekly content calendar on its own"
                on={settings.autoPost} onPress={() => flip('autoPost', 'Auto Post')} />
              <ToggleRow title="Auto-reply to reviews" desc="AI drafts and posts replies to new Google reviews"
                on={settings.autoReply} onPress={() => flip('autoReply', 'Auto-reply')} />
              <ToggleRow title="Admin approval" desc="Content and replies wait for your approval before going live"
                on={settings.adminApproval} onPress={() => flip('adminApproval', 'Admin approval')} />
            </CardBody>
          </Card>

          <Card>
            <CardHead title="Notifications" />
            <CardBody>
              <ToggleRow title="Email notifications" desc="Daily activity summary and lead alerts"
                on={settings.notifyEmail} onPress={() => flip('notifyEmail', 'Email notifications')} />
              <ToggleRow title="WhatsApp notifications" desc="Instant alerts for new leads and reviews"
                on={settings.notifyWhatsapp} onPress={() => flip('notifyWhatsapp', 'WhatsApp notifications')} />
            </CardBody>
          </Card>

          <Card>
            <CardHead title="Language" />
            <CardBody>
              <Field label="Content generation language" style={{ marginBottom: 0 }}>
                <Select value={settings.lang} onChange={(v) => { setSetting('lang', v); toast('Language updated', undefined, 'ok'); }}
                  options={[
                    { value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी (Hindi)' },
                    { value: 'mr', label: 'मराठी (Marathi)' }, { value: 'ta', label: 'தமிழ் (Tamil)' }]} />
              </Field>
            </CardBody>
          </Card>
        </Stack>

        <Stack gap={16}>
          <Card>
            <CardHead title="Security" />
            <CardBody>
              <ToggleRow title="Passkey authentication" desc="Sign in with Face ID, Touch ID or a security key"
                on={settings.passkey} onPress={() => flip('passkey', 'Passkey authentication')} />
              <Row gap={8} style={{ marginTop: 14 }}>
                <Button label="Change password" size="sm" icon="lock"
                  onPress={() => openModal({
                    title: 'Change password',
                    content: (
                      <View>
                        <Field label="Current password"><PasswordBox /></Field>
                        <Field label="New password"><PasswordBox /></Field>
                        <Field label="Confirm new password"><PasswordBox /></Field>
                      </View>
                    ),
                    footer: (
                      <Row gap={9}>
                        <Button label="Cancel" variant="ghost" onPress={closeModal} />
                        <Button label="Update password" variant="primary"
                          onPress={() => { closeModal(); toast('Password updated', undefined, 'ok'); }} />
                      </Row>
                    ),
                  })} />
                <Button label="Add passkey" size="sm" icon="key"
                  onPress={() => toast('Passkey prompt', 'Your device will ask for Face ID or Touch ID')} />
              </Row>
            </CardBody>
          </Card>

          <Card>
            <CardHead title="Appearance" />
            <CardBody>
              <Between>
                <View style={{ flexShrink: 1 }}>
                  <T size={13} weight="700">Theme</T>
                  <Muted>Light or dark interface</Muted>
                </View>
                <Segment value={theme} onChange={(v) => setTheme(v as 'light' | 'dark')}
                  items={[{ key: 'light', label: 'Light' }, { key: 'dark', label: 'Dark' }]} />
              </Between>
            </CardBody>
          </Card>

          <Card>
            <CardHead title="Data" />
            <CardBody>
              <Stack gap={10}>
                <Button label="Export all my data" icon="download" block loading={isBusy('x')}
                  onPress={() => run('x', 1200, () => toast('Export ready', 'limbu-account-data.json', 'ok'))} />
                <Button label="Reset demo data" icon="refresh" block
                  onPress={() => confirm('Reset demo data?',
                    'All posts, reviews, leads and settings return to their starting state.', 'Reset',
                    () => { resetDemo(); toast('Demo data reset', undefined, 'ok'); })} />
                <Button label="Delete account" variant="danger" icon="trash" block
                  onPress={() => confirm('Delete your Limbu account?',
                    'This permanently removes your data, credits and connected profiles. This cannot be undone.',
                    'Delete account', () => toast('Request submitted', 'Our team will confirm within 24 hours', 'err'))} />
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Grid>
    </View>
  );
}

function PasswordBox() {
  const { c, b } = useTheme();
  const { TextInput } = require('react-native');
  return (
    <TextInput secureTextEntry placeholder="••••••••" placeholderTextColor={c.muted}
      style={[b, { height: 40, borderWidth: 1, borderColor: c.line, borderRadius: 10,
        paddingHorizontal: 12, color: c.text, fontSize: 13.5, outlineStyle: 'none' }]} />
  );
}
