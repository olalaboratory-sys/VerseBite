// Generates VerseBite brand icons/splash as PNGs (ivory bg, gold rounded
// square, white serif "V"). Run: node scripts/make-assets.js
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const IVORY = [243, 234, 219];
const GOLD = [201, 164, 92];
const GOLD_DEEP = [138, 106, 62];
const WHITE = [255, 255, 255];

function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// draw a verse "V" formed by two thick strokes inside a box [x0,y0,w,h]
function inV(px, py, x0, y0, w, h, thick) {
  const apexX = x0 + w / 2, apexY = y0 + h * 0.82;
  const topL = [x0 + w * 0.16, y0 + h * 0.18];
  const topR = [x0 + w * 0.84, y0 + h * 0.18];
  const d = Math.min(
    distToSeg(px, py, topL[0], topL[1], apexX, apexY),
    distToSeg(px, py, topR[0], topR[1], apexX, apexY),
  );
  return d <= thick;
}

function make(size, opts) {
  const { transparent = false, sqFrac = 0.62 } = opts || {};
  const png = new PNG({ width: size, height: size });
  const sq = size * sqFrac;
  const sx = (size - sq) / 2, sy = (size - sq) / 2;
  const radius = sq * 0.24;
  const thick = sq * 0.085;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2;
      let r, g, b, a = 255;
      if (transparent) { r = 0; g = 0; b = 0; a = 0; } else { [r, g, b] = IVORY; }
      // rounded square (gold, vertical gradient gold -> goldDeep)
      const inX = x >= sx && x <= sx + sq, inY = y >= sy && y <= sy + sq;
      if (inX && inY) {
        // rounded corners
        const cxx = Math.min(Math.max(x, sx + radius), sx + sq - radius);
        const cyy = Math.min(Math.max(y, sy + radius), sy + sq - radius);
        const corner = Math.hypot(x - cxx, y - cyy);
        if (corner <= radius) {
          const t = (y - sy) / sq;
          r = Math.round(GOLD[0] + (GOLD_DEEP[0] - GOLD[0]) * t);
          g = Math.round(GOLD[1] + (GOLD_DEEP[1] - GOLD[1]) * t);
          b = Math.round(GOLD[2] + (GOLD_DEEP[2] - GOLD[2]) * t);
          a = 255;
          if (inV(x, y, sx, sy, sq, sq, thick)) { [r, g, b] = WHITE; }
        }
      }
      png.data[i] = r; png.data[i + 1] = g; png.data[i + 2] = b; png.data[i + 3] = a;
    }
  }
  return PNG.sync.write(png);
}

const out = path.join(__dirname, '..', 'assets');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon.png'), make(1024, { sqFrac: 0.62 }));
fs.writeFileSync(path.join(out, 'adaptive-icon.png'), make(1024, { transparent: true, sqFrac: 0.46 }));
fs.writeFileSync(path.join(out, 'splash-icon.png'), make(1024, { transparent: true, sqFrac: 0.4 }));
fs.writeFileSync(path.join(out, 'favicon.png'), make(48, { sqFrac: 0.7 }));
console.log('wrote assets:', fs.readdirSync(out).join(', '));
