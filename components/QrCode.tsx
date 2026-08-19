/* Limbu AI — real, scannable QR code (react-native-qrcode-svg wraps the
   standard `qrcode` encoder). Renders through react-native-svg, same as the
   rest of the app, so it works on web and native without a native module. */
import React from 'react';
import RNQRCode from 'react-native-qrcode-svg';

const logo = (ink: string, accent: string) => `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="${accent}" />
    <text x="12" y="17" text-anchor="middle" font-size="15" font-weight="800" fill="${ink}" font-family="sans-serif">L</text>
  </svg>
`;

export function QrCode({ value, size = 210, ink = '#0F172B', accent = '#FACC15', getRef }: {
  value: string; size?: number; ink?: string; accent?: string;
  /** the underlying react-native-svg ref — call .toDataURL(cb, opts) on it to export a PNG */
  getRef?: (ref: any) => void;
}) {
  return (
    <RNQRCode
      value={value}
      size={size}
      color={ink}
      backgroundColor="#fff"
      ecl="H" // 30% error correction — leaves enough redundancy to survive the logo overlay
      logoSVG={logo(ink, accent)}
      logoSize={size * 0.22}
      logoBackgroundColor="#fff"
      logoMargin={3}
      logoBorderRadius={6}
      getRef={getRef}
    />
  );
}
