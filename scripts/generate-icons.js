const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Daftar ukuran ikon yang perlu dibuat
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Fungsi untuk membuat ikon SVG
function createIconSVG(size) {
  // Menggunakan SVG yang mirip dengan komponen AppIcon
  const backgroundColor = '#2E7D32';
  const strokeColor = 'white';
  const cornerRadius = size * 0.25;
  const iconScale = 0.6;
  const padding = (1 - iconScale) / 2;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${backgroundColor}" />
  <svg x="${size * padding}" y="${size * padding}" width="${size * iconScale}" height="${size * iconScale}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="12" y1="11" x2="12" y2="15" />
    <line x1="10" y1="13" x2="14" y2="13" />
  </svg>
</svg>`;
}

// Fungsi untuk membuat folder jika belum ada
async function ensureDirectoryExists(directory) {
  try {
    await mkdirAsync(directory, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// Fungsi utama untuk menghasilkan ikon
async function generateIcons() {
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Pastikan direktori icons ada
  await ensureDirectoryExists(iconsDir);
  
  // Buat ikon untuk semua ukuran
  for (const size of iconSizes) {
    const svgContent = createIconSVG(size);
    const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    await writeFileAsync(filePath, svgContent);
    console.log(`Created icon: ${filePath}`);
  }

  // Membuat juga ikon apple
  const appleIconSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
  for (const size of appleIconSizes) {
    if (!iconSizes.includes(size)) {
      const svgContent = createIconSVG(size);
      const filePath = path.join(iconsDir, `apple-icon-${size}x${size}.svg`);
      await writeFileAsync(filePath, svgContent);
      console.log(`Created Apple icon: ${filePath}`);
    }
  }
  
  console.log('All icons generated successfully!');
}

// Jalankan fungsi utama
generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
}); 