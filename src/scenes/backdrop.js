// Static canteen drawing: tiled wall, red-white bunting, the program banner, the counter, and the red carpet.
import Phaser from 'phaser';
import { EMOJI_SCALE, TXT } from './textures.js';

export function drawBackdrop(scene, g, deco, W, H) {
  const T = 36;
  g.clear();
  deco.removeAll(true);

  g.fillStyle(0xDFF3EC).fillRect(0, 0, W, H);
  g.fillStyle(0xD3EDE4);
  for (let y = 0; y < H; y += T) for (let x = 0; x < W; x += T) if (((x / T) + (y / T)) % 2 === 0) g.fillRect(x, y, T, T);
  g.lineStyle(2, 0xFFFFFF, 0.7);
  for (let x = 0; x <= W; x += T) g.lineBetween(x, 0, x, H);
  for (let y = 0; y <= H; y += T) g.lineBetween(0, y, W, y);

  // red-white bunting
  const n = Math.max(6, Math.round(W / 34)), yAt = t => 6 + 64 * t * (1 - t);
  const pts = [];
  for (let i = 0; i <= 24; i++) pts.push(new Phaser.Math.Vector2(W * i / 24, yAt(i / 24)));
  g.lineStyle(1.5, 0x7A5A4A).strokePoints(pts);
  for (let i = 0; i < n; i++) {
    const t0 = (i + 0.15) / n, t1 = (i + 0.85) / n, tm = (i + 0.5) / n;
    g.fillStyle(i % 2 ? 0xFFFFFF : 0xD7263D).fillTriangle(t0 * W, yAt(t0), t1 * W, yAt(t1), tm * W, yAt(tm) + 20);
  }

  // wall banner: big face, small food
  if (W > 360) {
    const bw = 124, bh = 84, bx = W - bw - 14, by = 46, cx = bx + bw / 2;
    g.fillStyle(0x8A5A33).fillRect(bx + 10, by + bh, 3, 14).fillRect(bx + bw - 13, by + bh, 3, 14);
    g.fillStyle(0xFFFFFF).fillRect(bx, by, bw, bh);
    g.fillStyle(0xD7263D).fillRect(bx, by, bw, 16);
    deco.add([
      scene.add.text(cx, by + 8.5, 'MAKAN SIANG GRATIS', TXT(9, '#FFFFFF')).setOrigin(0.5),
      scene.add.image(cx - 18, by + 47, 'e:🤵').setDisplaySize(40 * EMOJI_SCALE, 40 * EMOJI_SCALE),
      scene.add.image(cx + 30, by + 60, 'e:🍱').setDisplaySize(12 * EMOJI_SCALE, 12 * EMOJI_SCALE),
      scene.add.text(cx, by + 77, '(foto makanan: ukuran sebenarnya)', TXT(7, '#2A1A17', { fontStyle: '700' })).setOrigin(0.5)
    ]);
  }

  // counter
  const cy = H - 26;
  g.fillStyle(0xA86F38).fillRect(0, cy, W, H - cy);
  g.fillStyle(0xC98A4B).fillRect(0, cy, W, 8);
  g.fillStyle(0x000000, 0.08);
  for (let x = 0; x < W; x += 60) g.fillRect(x, cy + 8, 2, H - cy);
}

// red carpet rolled out while the cameras are here
export function drawCarpet(g, W, H) {
  g.clear();
  g.fillStyle(0xD7263D, 0.18).fillRect(0, 0, W, H);
  g.fillStyle(0xD7263D).fillRect(0, H - 26, W, 26);
  g.fillStyle(0xFFC93C).fillRect(0, H - 26, W, 3);
}
