import Phaser from 'phaser';
import './style.css';
import { PEJABAT } from './data.js';
import { $, S, prefs, store, pick, rupiah, rankFor, DPR } from './state.js';
import { Hud, initTicker } from './hud.js';
import { Voice, unlockAudio } from './audio.js';
import { CanteenScene } from './scenes/CanteenScene.js';

const stageEl = $('#stage');
let scene = null;

function stageSize() {
  const r = stageEl.getBoundingClientRect();
  return [Math.max(1, Math.round(r.width)), Math.max(1, Math.round(r.height))];
}

function boot() {
  const [w, h] = stageSize();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'stage',
    backgroundColor: '#DFF3EC',
    // render at device resolution, display at CSS size
    scale: { mode: Phaser.Scale.NONE, width: w * DPR, height: h * DPR, zoom: 1 / DPR },
    banner: false,
    scene: CanteenScene
  });
  game.events.once('canteen-ready', s => {
    scene = s;
    const b = $('#startBtn');
    b.disabled = false;
    b.textContent = 'Mulai Bagi Makan!';
    Hud.order();
  });
  new ResizeObserver(() => {
    const [w2, h2] = stageSize();
    game.scale.resize(w2 * DPR, h2 * DPR);
  }).observe(stageEl);
  if (import.meta.env.DEV) window.__game = game;
}

function togglePause() {
  if (!S.running || !scene) return;
  S.paused = !S.paused;
  $('#pauseOv').hidden = !S.paused;
  if (S.paused) { scene.scene.pause(); Voice.stop(); } else scene.scene.resume();
}

function start() {
  if (!scene) return;
  unlockAudio();
  $('#startOv').hidden = true;
  $('#overOv').hidden = true;
  $('#pauseOv').hidden = true;
  $('#release').hidden = true;
  if (S.paused) { S.paused = false; scene.scene.resume(); }
  scene.reset();
  Hud.pejabat(pick(PEJABAT.start));
}

function syncMute() {
  const b = $('#mute');
  b.textContent = prefs.muted ? '🔇' : '🔊';
  b.setAttribute('aria-label', prefs.muted ? 'Nyalakan suara' : 'Matikan suara');
}

function share() {
  const txt = `Di Ompreng Rush aku menyajikan ${S.served} ompreng makan siang gratis dengan jatah ${rupiah(S.budget)}/porsi. ${S.stolen} lauk disunat tikus berdasi, ${S.kasus} kasus "adaptasi pencernaan". Pangkat: ${rankFor(S.score)}. Skor ${S.score}. Bisa lebih efisien?`;
  const inp = $('#shareText');
  inp.value = txt;
  const done = () => { $('#shareBtn').textContent = 'Tersalin! Tempel di grup kelas'; };
  const fallback = () => { inp.select(); try { document.execCommand('copy'); done(); } catch (e) {} };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback);
  else fallback();
}

$('#startBtn').addEventListener('click', start);
$('#againBtn').addEventListener('click', start);
$('#resumeBtn').addEventListener('click', togglePause);
$('#pauseBtn').addEventListener('click', togglePause);
$('#shareBtn').addEventListener('click', share);
$('#mute').addEventListener('click', () => {
  prefs.muted = !prefs.muted;
  store.set('ompreng-muted', prefs.muted ? '1' : '0');
  if (prefs.muted) Voice.stop();
  syncMute();
});
addEventListener('keydown', e => { if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.running && !S.paused) togglePause(); });

syncMute();
initTicker();
$('#startBest').textContent = 'Rekor kamu: ' + prefs.best;
$('#best').textContent = prefs.best;
Hud.order();

// wait briefly for the display font so canvas text doesn't bake in a fallback
const fontsReady = document.fonts && document.fonts.load ? document.fonts.load('800 16px Poppins') : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).catch(() => {}).then(boot);
