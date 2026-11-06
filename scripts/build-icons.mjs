import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const symbolPath = resolve(root, 'static/rupaq-symbol-transparent.png');

// Generar favicon e iconos de PWA con el símbolo oficial de RUPAQ
const rawSymbol = await sharp(symbolPath).toBuffer();

// 1. Favicon (48x48 y 32x32)
await sharp(rawSymbol).resize(48, 48, { fit: 'contain' }).png().toFile(resolve(root, 'static/favicon.png'));

// 2. Iconos PWA y Apple Touch Icon
await sharp(rawSymbol).resize(192, 192, { fit: 'contain' }).png().toFile(resolve(root, 'static/icons/icon-192.png'));
await sharp(rawSymbol).resize(512, 512, { fit: 'contain' }).png().toFile(resolve(root, 'static/icons/icon-512.png'));
await sharp(rawSymbol).resize(180, 180, { fit: 'contain' }).png().toFile(resolve(root, 'static/icons/apple-touch-icon.png'));

// 3. Maskable Icon (zona segura del 80%)
const inner = await sharp(rawSymbol).resize(410, 410, { fit: 'contain' }).toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#201a16' }
})
  .composite([{ input: inner, top: 51, left: 51 }])
  .png()
  .toFile(resolve(root, 'static/icons/icon-maskable-512.png'));

await writeFile(resolve(root, 'static/icons/.generated'), new Date().toISOString());
console.log('✅ Iconos PWA actualizados con el símbolo oficial de RUPAQ.');
