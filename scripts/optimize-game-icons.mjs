import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'fs/promises';
import path from 'path';

const DIR = 'public/games';
const QUALITY = 80;
const MAX_SIZE = 256;

async function main() {
  console.log('🔍 Leyendo carpeta:', DIR);

  const files = await readdir(DIR);
  const pngs = files.filter((f) => f.toLowerCase().endsWith('.png'));

  if (pngs.length === 0) {
    console.log('⚠️ No se encontraron PNGs en', DIR);
    return;
  }

  console.log(`📦 Encontrados ${pngs.length} PNGs. Procesando...\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of pngs) {
    const input = path.join(DIR, file);
    const backup = input + '.bak';

    try {
      // 1) Renombrar original a .bak
      await rename(input, backup);

      // 2) Comprimir y guardar con el nombre original
      await sharp(backup)
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: QUALITY, compressionLevel: 9, palette: true })
        .toFile(input);

      const sizeBefore = (await stat(backup)).size;
      const sizeAfter = (await stat(input)).size;
      totalBefore += sizeBefore;
      totalAfter += sizeAfter;

      const reduction = Math.round((1 - sizeAfter / sizeBefore) * 100);
      const kb = (n) => (n / 1024).toFixed(0);
      console.log(
        `✓ ${file.padEnd(28)} ${kb(sizeBefore).padStart(6)} KB → ${kb(sizeAfter).padStart(4)} KB  (-${reduction}%)`
      );
    } catch (e) {
      // Si algo falla, restaurar el original
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
  console.log(`💾 Ahorro: ${kb(totalBefore - totalAfter)} KB (${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB)`);
  console.log('='.repeat(60));
  console.log('\n✅ Listo. Los archivos originales quedaron como .bak');
  console.log('   Si todo se ve bien, borralos con:');
  console.log('   Get-ChildItem public\\games\\*.bak | Remove-Item');
}

main().catch((e) => {
  console.error('❌ Error fatal:', e);
  process.exit(1);
});