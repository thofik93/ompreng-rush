import { BUDGETS, RANKS } from './data.js';

export const $ = s => document.querySelector(s);
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rupiah = n => 'Rp' + n.toLocaleString('id-ID');
export const rb = n => 'Rp' + (n / 1000).toLocaleString('id-ID') + 'rb';
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const DPR = Math.min(window.devicePixelRatio || 1, 2);

export const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

// per-viewer preferences, kept as one object so every module sees updates
export const prefs = {
  best: +store.get('ompreng-best') || 0,
  muted: store.get('ompreng-muted') === '1',
  tutorialDone: store.get('ompreng-tutorial') === '1'
};

// the current round; the scene resets it on every start
export const S = {
  running: false, paused: false, level: 1, budget: BUDGETS[0], visitT: 0, score: 0, lives: 3, streak: 0,
  order: { kid: '🧒', name: 'Budi', cls: '3B', items: ['nasi', 'ayam', 'brokoli', 'pisang'].map(k => ({ k, done: false })), pat: 1, patMax: 1 }
};

export const tray = { x: 0, tx: 0, y: 0, w: 150, h: 30 };

export const mult = () => 1 + Math.min(S.streak, 8) * 0.5;
export const visiting = () => S.running && S.visitT > 0;
export const remaining = () => (S.order ? S.order.items.filter(i => !i.done).map(i => i.k) : []);
// portion size shrinks with the budget
export const sizeFactor = () => 0.62 + 0.38 * (S.budget / BUDGETS[0]);
export const rankFor = score => {
  let r = RANKS[0][1];
  for (const [min, name] of RANKS) if (score >= min) r = name;
  return r;
};
