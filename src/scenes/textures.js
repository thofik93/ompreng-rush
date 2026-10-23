// Emoji are baked once into canvas textures, then used as ordinary sprites.
import { FOOD, FOOD_KEYS, LUX, POW } from '../data.js';
import { DPR } from '../state.js';

const EMOJI_PX = 80;
const EMOJI_TEX = 112;
// a sprite of an emoji "size" px tall needs this display size to match a glyph of that font size
export const EMOJI_SCALE = EMOJI_TEX / EMOJI_PX;

export const FONT = 'Poppins, system-ui, -apple-system, Roboto, "Noto Sans", sans-serif';
export const TXT = (size, color, extra) =>
  Object.assign({ fontFamily: FONT, fontStyle: '800', fontSize: size + 'px', color, resolution: DPR }, extra);

export function emoji(scene, e) {
  const key = 'e:' + e;
  if (scene.textures.exists(key)) return key;
  const ct = scene.textures.createCanvas(key, EMOJI_TEX, EMOJI_TEX), c = ct.getContext();
  c.font = `${EMOJI_PX}px sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(e, EMOJI_TEX / 2, EMOJI_TEX / 2 + 4);
  ct.refresh();
  return key;
}

export function makeTextures(scene) {
  const s = EMOJI_TEX, m = s / 2, p = EMOJI_PX;
  [...Object.values(FOOD).map(f => f.e), ...Object.values(LUX), ...Object.values(POW), '🪰', '🪨', '🤵', '🍱'].forEach(e => emoji(scene, e));

  // yesterday's food: the same dish under a green haze, with germs
  FOOD_KEYS.forEach(k => {
    const ct = scene.textures.createCanvas('basi:' + k, s, s), c = ct.getContext();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `${p}px sans-serif`;
    c.fillText(FOOD[k].e, m, m + 4);
    c.fillStyle = 'rgba(110,160,40,.45)';
    c.beginPath(); c.arc(m, m, p * 0.55, 0, Math.PI * 2); c.fill();
    c.font = `${p * 0.45}px sans-serif`;
    c.fillText('🦠', m + p * 0.35, m - p * 0.3);
    c.fillText('🦠', m - p * 0.35, m + p * 0.25);
    ct.refresh();
  });

  // the rat, wearing a necktie
  {
    const ct = scene.textures.createCanvas('tikus', s, s), c = ct.getContext();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `${p}px sans-serif`;
    c.fillText('🐀', m, m + 4);
    c.fillStyle = '#D7263D';
    c.beginPath();
    c.moveTo(m - p * 0.08, m + p * 0.12); c.lineTo(m + p * 0.08, m + p * 0.12); c.lineTo(m + p * 0.12, m + p * 0.42);
    c.lineTo(m, m + p * 0.52); c.lineTo(m - p * 0.12, m + p * 0.42);
    c.closePath(); c.fill();
    c.fillStyle = '#A11A2E';
    c.fillRect(m - p * 0.07, m + p * 0.06, p * 0.14, p * 0.08);
    ct.refresh();
  }

  // rings: green = catch, dashed red = avoid, glow = bonus
  const g = scene.make.graphics({ add: false });
  g.fillStyle(0x2FA36B, 0.15).fillCircle(64, 64, 60);
  g.lineStyle(6, 0x2FA36B, 0.9).strokeCircle(64, 64, 58);
  g.generateTexture('ringG', 128, 128); g.clear();
  g.lineStyle(6, 0xD7263D, 0.85);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    g.beginPath(); g.arc(64, 64, 58, a, a + 0.24); g.strokePath();
  }
  g.generateTexture('ringR', 128, 128); g.clear();
  g.fillStyle(0xFFC93C, 1).fillCircle(64, 64, 64);
  g.generateTexture('glow', 128, 128); g.clear();
  g.fillStyle(0xFFFFFF, 1).fillRect(0, 0, 6, 10);
  g.generateTexture('px', 6, 10);
  g.destroy();
}
