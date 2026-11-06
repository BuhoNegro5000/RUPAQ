import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE =
  'https://raw.githubusercontent.com/jmcastagnetto/ubigeo-peru-aumentado/master/ubigeo_distrito.json';

const JUNGLE = new Set(['LORETO', 'UCAYALI', 'MADRE DE DIOS', 'SAN MARTIN']);
const NORTH_COAST = new Set(['TUMBES', 'PIURA', 'LAMBAYEQUE', 'LA LIBERTAD']);

function titleCase(value) {
  return value
    .toLocaleLowerCase('es-PE')
    .replace(/(^|[\s(/-])([a-záéíóúüñ])/g, (_, pre, c) => pre + c.toLocaleUpperCase('es-PE'));
}

function climateZone(row) {
  const altitude = Number(row.altitude) || 0;
  if (altitude >= 1800) return 'sierra';
  if (JUNGLE.has(row.departamento) || row.macroregion_inei === 'ORIENTE') {
    if (altitude < 1800) return 'amazonia';
  }
  if (NORTH_COAST.has(row.departamento)) return 'costa_norte';
  return 'costa_central';
}

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`No se pudo descargar el ubigeo: ${response.status}`);
const rows = await response.json();

const compact = rows
  .filter((row) => row.inei && row.latitude && row.longitude)
  .map((row) => [
    row.inei,
    titleCase(row.departamento),
    titleCase(row.provincia),
    titleCase(row.distrito),
    Math.round(Number(row.latitude) * 10000) / 10000,
    Math.round(Number(row.longitude) * 10000) / 10000,
    Number(row.altitude) || 0,
    climateZone(row)
  ])
  .sort((a, b) => a[1].localeCompare(b[1], 'es') || a[2].localeCompare(b[2], 'es'));

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(root, 'static/data/ubigeo.json');
await mkdir(dirname(target), { recursive: true });
await writeFile(target, JSON.stringify(compact));

// Un índice pequeño para el arranque y las pruebas.
const featuredCodes = ['150101', '200104', '160101', '040101', '080101', '130101', '010101', '070101'];
const featured = compact.filter((row) => featuredCodes.includes(row[0])).map((row) => ({
  ubigeo: row[0],
  departamento: row[1],
  provincia: row[2],
  distrito: row[3],
  lat: row[4],
  lon: row[5],
  altitud: row[6],
  zona: row[7]
}));

await writeFile(resolve(root, 'src/lib/data/featured-locations.json'), JSON.stringify(featured, null, 2));
await mkdir(resolve(root, 'src/lib/data'), { recursive: true });
await writeFile(resolve(root, 'src/lib/data/ubigeo-server.json'), JSON.stringify(compact));

console.log(`Generados ${compact.length} distritos (${(JSON.stringify(compact).length / 1024).toFixed(0)} KB).`);
