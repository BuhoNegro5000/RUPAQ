import fs from 'node:fs';
import path from 'node:path';

const CLIENT_DIR = path.resolve('.svelte-kit/output/client');

if (!fs.existsSync(CLIENT_DIR)) {
  console.error('El directorio de salida no existe. Ejecuta "npm run build" primero.');
  process.exit(1);
}

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push({ path: fullPath, size: stat.size });
    }
  }
  return results;
}

const files = getFiles(CLIENT_DIR);
let totalBytes = 0;
for (const file of files) {
  totalBytes += file.size;
}

console.log(`✓ Auditoría de tamaño: ${files.length} archivos cliente analizados.`);
console.log(`✓ Peso total cliente: ${(totalBytes / 1024).toFixed(2)} KB.`);
