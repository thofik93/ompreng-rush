import { S, prefs } from './state.js';

// ---------- sound effects: synthesized, no asset files ----------
let AC = null;

export function unlockAudio() {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.resume) AC.resume();
  } catch (e) {}
}

function tone(f1, f2, dur, type, vol, delay) {
  if (prefs.muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime + (delay || 0);
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol || 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(AC.destination);
    o.start(t); o.stop(t + dur + 0.02);
  } catch (e) {}
}

export const sfx = {
  pop: () => tone(620 + S.streak * 30, 980 + S.streak * 30, 0.09, 'square', 0.06),
  serve: () => { tone(523, 523, 0.1, 'triangle', 0.1); tone(659, 659, 0.1, 'triangle', 0.1, 0.09); tone(784, 1046, 0.18, 'triangle', 0.1, 0.18); },
  wrong: () => tone(240, 140, 0.16, 'sawtooth', 0.06),
  hurt: () => tone(180, 50, 0.32, 'sawtooth', 0.09),
  steal: () => { tone(900, 300, 0.12, 'square', 0.06); tone(700, 200, 0.12, 'square', 0.06, 0.1); },
  power: () => tone(400, 1400, 0.25, 'sine', 0.1),
  cut: () => { tone(500, 500, 0.1, 'square', 0.06); tone(400, 400, 0.1, 'square', 0.06, 0.12); tone(300, 200, 0.25, 'square', 0.06, 0.24); },
  camera: () => { tone(2000, 1200, 0.05, 'square', 0.05); tone(2000, 1200, 0.05, 'square', 0.05, 0.15); }
};

// ---------- Pak Pejabat's voice: browser text-to-speech ----------
export const Voice = {
  ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  voice: null,
  init() {
    if (!this.ok) return;
    const choose = () => {
      const all = speechSynthesis.getVoices();
      this.voice = all.find(v => /^id[-_]/i.test(v.lang)) || all.find(v => /^id/i.test(v.lang)) || null;
    };
    choose();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', choose);
  },
  say(text) {
    if (!this.ok || prefs.muted) return;
    try {
      // newest line wins, so speech never lags behind the game
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'id-ID';
      if (this.voice) u.voice = this.voice;
      u.rate = 0.95;
      u.pitch = 0.6; // a little lower and slower: podium voice
      speechSynthesis.speak(u);
    } catch (e) {}
  },
  stop() { if (this.ok) try { speechSynthesis.cancel(); } catch (e) {} }
};
Voice.init();
