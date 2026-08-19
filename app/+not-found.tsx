import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Empty } from '../components/ui';

export default function NotFound() {
  const router = useRouter();
  return (
    <Empty icon="compass" title="Page not found"
      desc="That screen does not exist in Limbu. Try the dashboard, or press ⌘K to search every feature."
      action={<Button label="Go to dashboard" variant="primary" icon="grid" onPress={() => router.replace('/dashboard')} />} />
  );
}
