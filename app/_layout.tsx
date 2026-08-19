import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Shell } from '../components/Shell';
import { useStore } from '../store/useStore';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

/* Montserrat + Inter, loaded once on web. Native falls back to the system face. */
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('limbu-fonts')) {
  const link = document.createElement('link');
  link.id = 'limbu-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap';
  document.head.appendChild(link);
}

function Themed() {
  const { c, scheme } = useTheme();
  const hydrated = useStore((s) => s.hydrated);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {/* hold the first paint until persisted state is read, so the theme never flashes */}
      {hydrated ? <Shell><Slot /></Shell> : <View style={{ flex: 1, backgroundColor: c.bg }} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Themed />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
