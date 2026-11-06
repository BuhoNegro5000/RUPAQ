import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Resize official RUPAQ cultural symbol to 320x320
  const symbolBuffer = await sharp(resolve(root, 'static/rupaq-symbol-transparent.png'))
    .resize(320, 320, { fit: 'contain' })
    .toBuffer();

  // Resize Green Owl Labs mark to 44x44
  const gowlBuffer = await sharp(resolve(root, 'static/gowl-mark.png'))
    .resize(44, 44, { fit: 'contain' })
    .toBuffer();

  // SVG overlay for text, badges, gradients, and layout
  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunGlow" cx="15%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ea580c" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="#b45309" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#19130e" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="topGlow" cx="85%" cy="10%" r="50%">
          <stop offset="0%" stop-color="#ca8a04" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#19130e" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a1f18" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#1e1611" stop-opacity="0.95"/>
        </linearGradient>
      </defs>

      <!-- Background Atmosphere -->
      <rect width="100%" height="100%" fill="#16110e"/>
      <rect width="100%" height="100%" fill="url(#sunGlow)"/>
      <rect width="100%" height="100%" fill="url(#topGlow)"/>

      <!-- Ambient border frame -->
      <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="rgba(255, 230, 200, 0.12)" stroke-width="2"/>

      <!-- Symbol glow aura -->
      <circle cx="240" cy="315" r="190" fill="#ea580c" fill-opacity="0.18" filter="blur(40px)"/>

      <!-- Content Area (Right side) -->
      <!-- Top Tag / Pill -->
      <g transform="translate(480, 85)">
        <rect width="270" height="36" rx="18" fill="rgba(249, 115, 22, 0.18)" stroke="rgba(249, 115, 22, 0.45)" stroke-width="1.5"/>
        <text x="135" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#fb923c" text-anchor="middle" letter-spacing="0.08em">
          CALOR Y SALUD · PERÚ
        </text>
      </g>

      <!-- Main Brand Title -->
      <text x="480" y="210" font-family="system-ui, -apple-system, sans-serif" font-size="78" font-weight="900" fill="#fdf7f0" letter-spacing="-0.03em">
        RUPAQ
      </text>

      <!-- Subtitle -->
      <text x="480" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="650" fill="#fed7aa" letter-spacing="-0.01em">
        Asistente de Calor Extremo para el Perú
      </text>

      <!-- Description -->
      <text x="480" y="315" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#d6c5b5" line-height="1.4">
        <tspan x="480" dy="0">Pronóstico térmico en tiempo real por distrito, alertas médicas</tspan>
        <tspan x="480" dy="28">tempranas de golpe de calor y mapa de hidratación urbana.</tspan>
      </text>

      <!-- Features Row (Chips) -->
      <g transform="translate(480, 395)">
        <!-- Chip 1 -->
        <rect x="0" y="0" width="180" height="42" rx="10" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.14)"/>
        <text x="18" y="26" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#fdf7f0">🌡️ Sensación real</text>

        <!-- Chip 2 -->
        <rect x="192" y="0" width="175" height="42" rx="10" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.14)"/>
        <text x="210" y="26" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#fdf7f0">🚰 Puntos de agua</text>

        <!-- Chip 3 -->
        <rect x="379" y="0" width="220" height="42" rx="10" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.14)"/>
        <text x="397" y="26" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#fdf7f0">🚑 Emergencia 106/116</text>
      </g>

      <!-- Bottom Bar: Co-Brand Green Owl Labs -->
      <line x1="480" y1="475" x2="1100" y2="475" stroke="rgba(255, 235, 215, 0.14)" stroke-width="1"/>

      <g transform="translate(480, 498)">
        <text x="56" y="24" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#e2d4c7">
          Desarrollado por Green Owl Labs
        </text>
        <text x="56" y="44" font-family="system-ui, sans-serif" font-size="13" font-weight="400" fill="#a89685">
          100% privado · Sin registro · Datos abiertos Senamhi / Open-Meteo
        </text>
      </g>
    </svg>
  `;

  // Composite base image
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: '#16110e'
    }
  })
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      },
      {
        input: symbolBuffer,
        top: 155,
        left: 80
      },
      {
        input: gowlBuffer,
        top: 504,
        left: 480
      }
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(resolve(root, 'static/og-rupaq.png'));

  console.log('✅ og-rupaq.png generado con éxito (1200x630) con el logo oficial de RUPAQ.');
}

generateOgImage().catch(console.error);
