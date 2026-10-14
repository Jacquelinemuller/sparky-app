import sharp from 'sharp';
import { readdir, stat, rename } from 'fs/promises';
import path from 'path';

const DIR = 'public/diferencias';
const MAX_WIDTH = 1024;    // conservador, se ve nítido en cualquier celu
const QUALITY = 85;        // más alta que los íconos porque tienen detalle fino

async function main() {
  console.log('🔍 Leyendo carpeta:', DIR);

  const files = await readdir(DIR);
  const pngs = files.filter((f) => f.toLowerCase().endsWith('.png'));

  if (pngs.length === 0) {
    console.log('⚠️ No se encontraron PNGs');
    return;
  }

  console.log(`📦 Encontrados ${pngs.length} PNGs. Procesando...\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of pngs) {
    const input = path.join(DIR, file);
    const backup = input + '.bak';

    try {
      const originalMeta = await sharp(input).metadata();
      await rename(input, backup);

      await sharp(backup)
        .resize(MAX_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: QUALITY, compressionLevel: 9, palette: true, effort: 10 })
        .toFile(input);

      const sizeBefore = (await stat(backup)).size;
      const sizeAfter = (await stat(input)).size;
      totalBefore += sizeBefore;
      totalAfter += sizeAfter;

      const reduction = Math.round((1 - sizeAfter / sizeBefore) * 100);
      const kb = (n) => (n / 1024).toFixed(0);
      console.log(
        `✓ ${file.padEnd(18)} ${originalMeta.width}x${originalMeta.height} → max ${MAX_WIDTH}px   ${kb(sizeBefore).padStart(5)} KB → ${kb(sizeAfter).padStart(4)} KB  (-${reduction}%)`
      );
    } catch (e) {
      try {
        await rename(backup, input);
      } catch (_) {}
      console.error(`✗ ${file}: ${e.message}`);
    }
  }

  const kb = (n) => (n / 1024).toFixed(0);
  const totalReduction = Math.round((1 - totalAfter / totalBefore) * 100);

  console.log('\n' + '='.repeat(60));
  console.log(`📊 TOTAL: ${kb(totalBefore)} KB → ${kb(totalAfter)} KB  (-${totalReduction}%)`);
  console.log(`💾 Ahorro: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB`);
  console.log('='.repeat(60));
}

main().catch((e) => {
  console.error('❌ Error fatal:', e);
  process.exit(1);
});