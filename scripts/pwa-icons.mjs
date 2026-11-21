// Dependency-free PWA icon generator for Tayyib Vista (entertainment.bd).
//
// The GitHub connector used to publish this repo only accepts UTF-8 text
// files, so the PNG icons cannot be committed through it. Instead they are
// rendered at build time into dist/ by the Vite plugin in vite.config.ts.
// If real icon files are ever added under public/, they take precedence
// (the plugin skips any icon that already exists in dist/).
//
// Design: white "TV" letters on the brand green #0F5132, matching the
// site's dominant color (src/index.css / App.tsx). No logo file exists in
// the repo, so letterform icons are used.
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const BG = [0x0f, 0x51, 0x32]; // #0F5132
const FG = [0xff, 0xff, 0xff];

// --- minimal PNG encoder (8-bit RGB, filter 0) ---------------------------
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    raw[rowStart] = 0; // filter: none
    rgb.copy(raw, rowStart + 1, y * width * 3, (y + 1) * width * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- "TV" letterforms ------------------------------------------------------
// Shapes are defined in a unit box per letter, then rasterized with
// supersampling for smooth edges.
function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inRect(x, y, [x0, y0, x1, y1]) {
  return x >= x0 && x < x1 && y >= y0 && y < y1;
}

// T: top bar + stem. V: single polygon. Coordinates in letter-local units.
const T_SHAPES = [
  [0, 0, 1, 0.18], // bar
  [0.39, 0, 0.61, 1], // stem
];
const V_POLY = [
  [0, 0],
  [0.24, 0],
  [0.5, 0.74],
  [0.76, 0],
  [1, 0],
  [0.63, 1],
  [0.37, 1],
];

function renderIcon(size, textWidthFraction) {
  const SS = 3; // supersampling factor
  const S = size * SS;
  const textW = S * textWidthFraction;
  const textH = textW * 0.55;
  const tW = textW * 0.46;
  const gap = textW * 0.06;
  const vW = textW * 0.48;
  const x0 = (S - textW) / 2;
  const y0 = (S - textH) / 2;
  const tX = x0;
  const vX = x0 + tW + gap;

  const hi = new Float32Array(S * S); // coverage 0/1 at supersampled res
  for (let y = 0; y < S; y++) {
    const ly = (y - y0) / textH;
    if (ly < 0 || ly >= 1) continue;
    for (let x = 0; x < S; x++) {
      let covered = false;
      const tx = (x - tX) / tW;
      if (tx >= 0 && tx < 1) {
        covered = T_SHAPES.some((r) => inRect(tx, ly, r));
      }
      if (!covered) {
        const vx = (x - vX) / vW;
        if (vx >= 0 && vx < 1) covered = pointInPolygon(vx, ly, V_POLY);
      }
      if (covered) hi[y * S + x] = 1;
    }
  }

  const rgb = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          sum += hi[(y * SS + dy) * S + (x * SS + dx)];
        }
      }
      const a = sum / (SS * SS);
      const o = (y * size + x) * 3;
      rgb[o] = Math.round(BG[0] + (FG[0] - BG[0]) * a);
      rgb[o + 1] = Math.round(BG[1] + (FG[1] - BG[1]) * a);
      rgb[o + 2] = Math.round(BG[2] + (FG[2] - BG[2]) * a);
    }
  }
  return encodePng(size, size, rgb);
}

const ICONS = [
  {file: 'icon-192.png', size: 192, fraction: 0.62},
  {file: 'icon-512.png', size: 512, fraction: 0.62},
  // Maskable: letters kept inside the central 80% safe zone.
  {file: 'icon-maskable-512.png', size: 512, fraction: 0.55},
];

export function generatePwaIcons(outDir) {
  for (const icon of ICONS) {
    const target = path.join(outDir, icon.file);
    if (fs.existsSync(target)) continue; // public/ copy wins
    fs.writeFileSync(target, renderIcon(icon.size, icon.fraction));
  }
}

// Allow running standalone: node scripts/pwa-icons.mjs <outDir>
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] || '.';
  fs.mkdirSync(outDir, {recursive: true});
  for (const icon of ICONS) {
    fs.writeFileSync(
      path.join(outDir, icon.file),
      renderIcon(icon.size, icon.fraction)
    );
    console.log('wrote', icon.file);
  }
}
