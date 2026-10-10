// Generates public/og.png (1200x630) from local shapes only. Run: node scripts/generate-og.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const W = 1200;
const H = 630;
const SPLIT = 600;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M30 0H0V30" fill="none" stroke="#1f2937" stroke-opacity="0.11"/>
    </pattern>
    <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="10" stroke="#0891b2" stroke-opacity="0.28" stroke-width="2"/>
    </pattern>
    <linearGradient id="build" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff5a36"/>
      <stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0c0a0e"/>
  <rect width="${SPLIT}" height="${H}" fill="#eff1f4"/>
  <rect width="${SPLIT}" height="${H}" fill="url(#grid)"/>
  <g fill="none" stroke="#1f2937" stroke-width="3" stroke-dasharray="10 6">
    <rect x="400" y="80" width="160" height="150" rx="6" fill="url(#hatch)"/>
    <rect x="400" y="270" width="160" height="220" rx="6"/>
    <line x1="418" y1="300" x2="540" y2="300"/>
    <line x1="418" y1="330" x2="500" y2="330"/>
  </g>
  <rect x="640" y="80" width="160" height="150" rx="10" fill="#111827" stroke="#3a4150" stroke-width="2"/>
  <rect x="640" y="270" width="160" height="220" rx="10" fill="#111827" stroke="#3a4150" stroke-width="2"/>
  <rect x="660" y="296" width="120" height="10" rx="5" fill="#ff5a36"/>
  <rect x="660" y="326" width="80" height="10" rx="5" fill="#06b6d4"/>
  <rect x="660" y="110" width="90" height="14" rx="7" fill="#f9fafb" fill-opacity="0.85"/>
  <rect x="${SPLIT - 3}" y="0" width="6" height="${H}" fill="url(#build)"/>
  <text x="60" y="400" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="700" fill="#111827">Eric</text>
  <text x="60" y="476" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="700" fill="#111827">Lingren</text>
  <text x="62" y="560" font-family="Courier, monospace" font-size="19" letter-spacing="1.5" fill="#bd4328">FRONTEND-FIRST FULL-STACK ENGINEER</text>
</svg>`;

const out = fileURLToPath(new URL("../public/og.png", import.meta.url));
await sharp(Buffer.from(svg)).png().toFile(out);
console.log("wrote", out);
