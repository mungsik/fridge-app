import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#2563eb"/>
  <rect x="146" y="72" width="220" height="368" rx="18" fill="white" opacity="0.95"/>
  <line x1="146" y1="192" x2="366" y2="192" stroke="#2563eb" stroke-width="4"/>
  <rect x="330" y="120" width="10" height="44" rx="5" fill="#2563eb"/>
  <rect x="330" y="220" width="10" height="44" rx="5" fill="#2563eb"/>
  <circle cx="256" cy="132" r="16" fill="none" stroke="#60a5fa" stroke-width="4"/>
  <line x1="256" y1="112" x2="256" y2="152" stroke="#60a5fa" stroke-width="3"/>
  <line x1="236" y1="132" x2="276" y2="132" stroke="#60a5fa" stroke-width="3"/>
  <rect x="172" y="216" width="40" height="52" rx="6" fill="#fbbf24" opacity="0.85"/>
  <rect x="222" y="228" width="36" height="40" rx="6" fill="#34d399" opacity="0.85"/>
  <rect x="268" y="220" width="42" height="48" rx="6" fill="#f87171" opacity="0.85"/>
  <rect x="182" y="290" width="48" height="36" rx="6" fill="#a78bfa" opacity="0.85"/>
  <rect x="242" y="294" width="56" height="32" rx="6" fill="#38bdf8" opacity="0.85"/>
  <rect x="166" y="440" width="16" height="20" rx="4" fill="white" opacity="0.6"/>
  <rect x="330" y="440" width="16" height="20" rx="4" fill="white" opacity="0.6"/>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf).resize(192, 192).png().toFile('public/pwa-192x192.png');
await sharp(buf).resize(512, 512).png().toFile('public/pwa-512x512.png');
await sharp(buf).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(buf).resize(32, 32).png().toFile('public/favicon.ico');

console.log('Icons generated: pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png, favicon.ico');
