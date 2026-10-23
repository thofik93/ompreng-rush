// The arena: falling food and hazards, the tray, and the round's rules.
import Phaser from 'phaser';
import {
  FOOD, FOOD_KEYS, LUX, HAZ, POW, LABELS, BUDGETS, TERBILANG, KIDS, NAMES, CLASSES,
  HAPPY, VISIT_HAPPY, WRONG, LEAVE, STEAL, RILIS, PEJABAT
} from '../data.js';
import {
  S, tray, prefs, store, rand, pick, clamp, rupiah, reduceMotion, DPR,
  mult, visiting, remaining, sizeFactor
} from '../state.js';
import { Hud, nextNews } from '../hud.js';
import { sfx, Voice } from '../audio.js';
import { EMOJI_SCALE, TXT, emoji, makeTextures } from './textures.js';
import { drawBackdrop, drawCarpet } from './backdrop.js';

const baseSpeed = H => (140 + S.level * 18) * Math.max(0.8, H / 700);
const spawnGap = () => Math.max(0.36, 1.0 - S.level * 0.06);

export class CanteenScene extends Phaser.Scene {
  constructor() { super('canteen'); }

  create() {
    // world units are CSS pixels; the canvas itself renders at device resolution
    this.cameras.main.setOrigin(0, 0).setZoom(DPR);
    makeTextures(this);

    this.bg = this.add.graphics().setDepth(0);
    this.bgDeco = this.add.container(0, 0).setDepth(0);
    this.carpet = this.add.graphics().setDepth(1).setVisible(false);
    this.aura = this.add.graphics().setVisible(false);
    this.trayG = this.add.graphics();
    this.tray = this.add.container(0, 0, [this.aura, this.trayG]).setDepth(3);
    this.trayFood = [];
    this.bump = { y: 0 };

    this.confetti = this.add.particles(0, 0, 'px', {
      speed: { min: 120, max: 380 }, angle: { min: 200, max: 340 }, lifespan: { min: 600, max: 1100 }, gravityY: 650,
      rotate: { min: 0, max: 360 }, alpha: { start: 1, end: 0 }, tint: [0xD7263D, 0xFFFFFF, 0xFFC93C, 0x2FA36B], emitting: false
    }).setDepth(4);
    this.sparks = this.add.particles(0, 0, 'px', {
      speed: { min: 60, max: 180 }, angle: { min: 210, max: 330 }, lifespan: { min: 400, max: 700 }, gravityY: 500,
      scale: { start: 0.8, end: 0.2 }, alpha: { start: 1, end: 0 }, tint: [0xFFC93C, 0x2FA36B, 0xFFFFFF], emitting: false
    }).setDepth(4);
    this.dust = this.add.particles(0, 0, 'px', {
      speed: { min: 60, max: 220 }, angle: { min: 0, max: 360 }, lifespan: { min: 400, max: 800 }, gravityY: 300,
      alpha: { start: 1, end: 0 }, tint: [0x6E5A55, 0x2A1A17], emitting: false
    }).setDepth(4);

    this.hint = this.add.text(0, 0, '', TXT(14, '#FFFFFF', { padding: { x: 14, y: 7 } })).setOrigin(0.5).setDepth(6).setVisible(false);
    this.banners = [0, 1, 2].map(i => this.add.text(12, 40 + i * 30, '', TXT(12, '#FFFFFF', { padding: { x: 10, y: 5 } })).setDepth(6).setVisible(false));

    this.items = [];
    this.spawnT = 0;
    this.layout();
    this.scale.on('resize', this.layout, this);

    this.input.on('pointermove', p => { tray.tx = p.worldX; });
    this.input.on('pointerdown', p => { tray.tx = p.worldX; });
    this.keys = this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D' });

    this.game.events.emit('canteen-ready', this);
  }

  // ---------- layout ----------
  layout() {
    this.W = this.scale.width / DPR;
    this.H = this.scale.height / DPR;
    this.cameras.main.setSize(this.scale.width, this.scale.height);
    tray.w = clamp(this.W * 0.32, 120, 200);
    tray.y = this.H - 52;
    tray.x = clamp(tray.x || this.W / 2, tray.w / 2, this.W - tray.w / 2);
    tray.tx = clamp(tray.tx || this.W / 2, tray.w / 2, this.W - tray.w / 2);
    drawBackdrop(this, this.bg, this.bgDeco, this.W, this.H);
    drawCarpet(this.carpet, this.W, this.H);
    this.drawTray();
  }

  drawTray() {
    const g = this.trayG, w = tray.w, h = tray.h, x = -w / 2, y = -h / 2;
    g.clear();
    this.trayFood.forEach(f => f.destroy());
    this.trayFood = [];
    g.fillStyle(0x000000, 0.15).fillEllipse(0, h / 2 + 10, w * 0.96, 12);
    g.fillStyle(0x9AA7AE).fillRoundedRect(x, y, w, h, 10);
    g.fillStyle(0xC7D0D5).fillRoundedRect(x, y, w, h - 5, 10);
    g.fillStyle(0xF2F5F7).fillRoundedRect(x, y, w, h * 0.45, { tl: 10, tr: 10, bl: 0, br: 0 });
    g.lineStyle(1.5, 0x7F8C93).strokeRoundedRect(x, y, w, h, 10);
    const items = S.running && S.order ? S.order.items : [{}, {}, {}, {}];
    const n = items.length, pad = 5, cw = (w - pad * (n + 1)) / n;
    for (let i = 0; i < n; i++) {
      const cx = x + pad + i * (cw + pad);
      g.fillStyle(0xB4BEC4).fillRoundedRect(cx, y + 5, cw, h - 10, 5);
      if (items[i].done) {
        const d = Math.min(cw, h) * 0.8 * sizeFactor() * EMOJI_SCALE;
        const img = this.add.image(cx + cw / 2, 1, emoji(this, visiting() ? LUX[items[i].k] : FOOD[items[i].k].e)).setDisplaySize(d, d);
        this.tray.add(img);
        this.trayFood.push(img);
      }
    }
    g.fillStyle(0xFFFFFF, 0.55).fillRoundedRect(x + 8, y + 2, w - 16, 3, 1.5);
    this.aura.clear().lineStyle(4, 0xD7263D, 1).strokeRoundedRect(x - 8, y - 8, w + 16, h + 16, 14);
  }

  syncOrder() {
    Hud.order();
    this.drawTray();
  }

  float(txt, x, y, color, size) {
    const t = this.add.text(x, y, txt, TXT(size || 22, color || '#2A1A17', { stroke: '#FFFFFF', strokeThickness: 5 })).setOrigin(0.5).setDepth(6);
    const s = Math.min(1, (this.W - 24) / t.width);
    t.setScale(s * 1.3);
    t.x = clamp(x, t.width * s / 2 + 12, this.W - t.width * s / 2 - 12);
    this.tweens.add({ targets: t, scale: s, duration: 160, ease: 'Back.Out' });
    this.tweens.add({ targets: t, y: y - 48, alpha: 0, delay: 850, duration: 450, onComplete: () => t.destroy() });
  }

  // ---------- round lifecycle ----------
  reset() {
    this.items.forEach(it => this.removeItem(it));
    this.items = [];
    Object.assign(S, {
      running: true, paused: false, score: 0, lives: 3, served: 0, streak: 0, maxMult: 1, level: 1, budget: BUDGETS[0],
      stolen: 0, kasus: 0, visits: 0, sinceNeeded: 0, slowT: 0, magnetT: 0, visitT: 0, visitIn: rand(18, 24), seen: {},
      hintMove: !prefs.tutorialDone, hintCatch: !prefs.tutorialDone, moved: 0
    });
    this.spawnT = 0.6;
    this.carpet.setVisible(false);
    tray.x = tray.tx = this.W / 2;
    this.newOrder();
    Hud.stats();
  }

  newOrder() {
    const list = ['nasi', pick(['ayam', 'telur', 'ikan']), pick(['brokoli', 'wortel']), pick(['pisang', 'jeruk', 'semangka'])];
    if (S.level >= 5 || (S.level >= 3 && Math.random() < 0.5)) list.push('susu');
    const pat = Math.max(9, 18 - S.level * 0.8) + (list.length === 5 ? 2 : 0);
    S.order = { kid: pick(KIDS), name: pick(NAMES), cls: pick(CLASSES), items: list.map(k => ({ k, done: false })), pat, patMax: pat, low: false };
    Hud.lowPatience(false);
    this.syncOrder();
  }

  finishTutorial() {
    if (S.hintMove || S.hintCatch || prefs.tutorialDone) return;
    prefs.tutorialDone = true;
    store.set('ompreng-tutorial', '1');
  }

  // ---------- falling things ----------
  pickHaz() {
    const w = { lalat: 3, kerikil: 2, tikus: 2 + S.level * 0.4, basi: 1 + S.level * 0.35 };
    let r = Math.random() * Object.values(w).reduce((a, b) => a + b, 0);
    for (const k in w) { r -= w[k]; if (r <= 0) return k; }
    return 'lalat';
  }

  spawn(attract) {
    const need = remaining(), r = Math.random();
    // hazards get swept under the rug while the cameras are here
    const hz = Math.min(0.11 + S.level * 0.02, 0.32) * (visiting() ? 0.25 : 1);
    let kind = 'food', key, look;
    if (attract) key = pick(FOOD_KEYS);
    else if (need.length && (S.sinceNeeded >= 3 || r < 0.45)) { key = pick(need); S.sinceNeeded = 0; }
    else if (r < 0.45 + hz) { kind = 'haz'; key = this.pickHaz(); if (key === 'basi') look = pick(FOOD_KEYS); S.sinceNeeded++; }
    else if (r < 0.45 + hz + 0.055) { kind = 'pow'; key = (S.lives < 3 && Math.random() < 0.3) ? 'hati' : pick(['viral', 'esteh', 'orangdalam']); S.sinceNeeded++; }
    else { key = pick(FOOD_KEYS); if (need.includes(key)) S.sinceNeeded = 0; else S.sinceNeeded++; }

    let size = clamp(this.W * 0.085, 34, 48);
    if (!attract && (kind === 'food' || key === 'basi')) size *= sizeFactor();
    const x = rand(size / 2 + 8, this.W - size / 2 - 8);

    const tex = kind === 'food' ? emoji(this, FOOD[key].e)
      : key === 'basi' ? 'basi:' + look
        : key === 'tikus' ? 'tikus'
          : kind === 'haz' ? emoji(this, HAZ[key].e) : emoji(this, POW[key]);
    const ring = this.add.image(0, 0, 'ringG').setDisplaySize(size * 1.24, size * 1.24).setVisible(false);
    const spr = this.add.image(0, 0, tex).setDisplaySize(size * EMOJI_SCALE, size * EMOJI_SCALE);
    const c = this.add.container(x, -size, [ring, spr]).setDepth(2);
    if (kind === 'pow') {
      ring.setTexture('glow').setDisplaySize(size * 1.4, size * 1.4).setVisible(true).setAlpha(0.5);
      this.tweens.add({ targets: ring, alpha: 0.15, yoyo: true, repeat: -1, duration: 260 });
    } else if (kind === 'haz' && !attract) {
      ring.setTexture('ringR').setDisplaySize(size * 1.24, size * 1.24).setVisible(true);
    }

    // explain each hazard and power-up the first time it shows up in a round
    let label = null;
    if (!attract && kind !== 'food' && !S.seen[key]) {
      S.seen[key] = true;
      label = this.add.text(x, 0, LABELS[key], TXT(11, '#FFFFFF', { backgroundColor: kind === 'haz' ? '#D7263D' : '#2A1A17', padding: { x: 8, y: 4 } }))
        .setOrigin(0.5, 0).setDepth(5);
    }

    this.items.push({
      c, ring, spr, label, key, kind, size, x, y: -size, rot: rand(-0.3, 0.3), vr: rand(-1.5, 1.5), wob: rand(0, 6.28),
      vy: baseSpeed(this.H) * rand(0.85, 1.2) * (attract ? 0.55 : 1), lux: false
    });
  }

  removeItem(it) {
    this.tweens.killTweensOf(it.ring);
    it.c.destroy();
    if (it.label) it.label.destroy();
  }

  // ---------- catching ----------
  catchItem(it) {
    this.bump.y = 6;
    this.tweens.add({ targets: this.bump, y: 0, duration: 220, ease: 'Quad.Out' });
    const tx = tray.x, ty = tray.y - 40, vm = visiting() ? 2 : 1;

    if (it.kind === 'food') {
      const slot = S.order.items.find(i => !i.done && i.k === it.key);
      if (slot) {
        slot.done = true;
        if (S.hintCatch) { S.hintCatch = false; this.finishTutorial(); }
        const pts = Math.round(10 * mult() * vm);
        S.score += pts;
        this.float('+' + pts, it.x, ty, '#2FA36B', 20);
        this.sparks.explode(8, it.x, tray.y - 10);
        sfx.pop();
        this.syncOrder();
        if (!remaining().length) this.serve();
      } else {
        S.score = Math.max(0, S.score - 5);
        S.streak = 0;
        S.order.pat = Math.max(0.5, S.order.pat - 1.5);
        this.float(pick(WRONG), tx, ty, '#D7263D', 18);
        sfx.wrong();
      }
    } else if (it.kind === 'haz') {
      if (it.key === 'tikus') {
        const done = S.order.items.filter(i => i.done);
        S.streak = 0;
        S.stolen++;
        if (done.length) { pick(done).done = false; this.syncOrder(); }
        else S.score = Math.max(0, S.score - 20);
        this.float(pick(STEAL), tx, ty, '#A11A2E', 20);
        this.dust.explode(12, tx, tray.y - 10);
        sfx.steal();
      } else if (it.key === 'basi') {
        S.kasus++;
        this.hurt('Lauk kemarin!');
        const rilis = pick(RILIS);
        Hud.release(rilis);
        Voice.say('Rilis resmi. ' + rilis);
      } else {
        this.hurt(pick(HAZ[it.key].lines));
      }
    } else {
      sfx.power();
      if (it.key === 'viral') { const p = Math.round(100 * mult()); S.score += p; this.float('Viral! +' + p, tx, ty, '#C98A00', 24); this.confetti.explode(24, tx, ty); }
      if (it.key === 'esteh') { S.slowT = 5; this.float('Es teh! Santai dulu…', tx, ty, '#A86F38', 20); }
      if (it.key === 'orangdalam') { S.magnetT = 6; this.float('Orang dalam! Semua lancar', tx, ty, '#D7263D', 20); }
      if (it.key === 'hati') { S.lives = Math.min(5, S.lives + 1); this.float('Warga patungan, lagi', tx, ty, '#D7263D', 20); }
    }
    Hud.stats();
  }

  serve() {
    const o = S.order, full = o.items.length === 5, vm = visiting() ? 2 : 1;
    const bonus = Math.round((50 + (o.pat / o.patMax) * 50 + (full ? 50 : 0)) * mult() * vm);
    S.score += bonus;
    S.served++;
    S.streak++;
    S.maxMult = Math.max(S.maxMult, mult());
    this.float(pick(vm > 1 ? VISIT_HAPPY : HAPPY), this.W / 2, this.H * 0.4, '#2A1A17', 20);
    this.float((vm > 1 ? 'Pencitraan sukses! +' : full ? '4 Sehat 5 Sempurna! +' : 'Ompreng tersaji! +') + bonus,
      this.W / 2, this.H * 0.4 + 30, full || vm > 1 ? '#D7263D' : '#2FA36B', 18);
    this.confetti.explode(40, tray.x, tray.y - 20);
    sfx.serve();
    Hud.happyKid();

    const lv = 1 + Math.floor(S.served / 3);
    if (lv > S.level) {
      S.level = lv;
      const old = S.budget;
      S.budget = BUDGETS[Math.min(lv - 1, BUDGETS.length - 1)];
      this.time.delayedCall(450, () => this.announceLevel(lv, old));
    }
    this.newOrder();
  }

  announceLevel(lv, oldBudget) {
    if (!S.running) return;
    if (S.budget < oldBudget) {
      this.float('EFISIENSI ANGGARAN!', this.W / 2, this.H * 0.2, '#D7263D', 24);
      this.float('Porsi jadi ' + rupiah(S.budget), this.W / 2, this.H * 0.2 + 28, '#2A1A17', 16);
      nextNews(`Efisiensi: jatah per porsi dipangkas jadi ${rupiah(S.budget)}. Anggaran rapat tidak terdampak.`);
      Hud.budgetCut();
      sfx.cut();
      Hud.pejabat(pick(PEJABAT.cut(TERBILANG[S.budget] || S.budget)));
    } else {
      this.float('LEVEL ' + lv + '! Jatah sudah mentok ' + rupiah(S.budget), this.W / 2, this.H * 0.2, '#D7263D', 18);
    }
    this.drawTray();
    Hud.stats();
  }

  hurt(msg) {
    S.lives--;
    S.streak = 0;
    if (!reduceMotion) this.cameras.main.shake(260, 0.012);
    this.cameras.main.flash(300, 215, 38, 61);
    this.float(msg, tray.x, tray.y - 96, '#D7263D', 20);
    sfx.hurt();
    if (navigator.vibrate) try { navigator.vibrate(80); } catch (e) {}
    Hud.stats();
    if (S.lives <= 0) this.time.delayedCall(350, () => this.gameOver());
  }

  kidLeaves() {
    this.float(S.order.name + ' ' + pick(LEAVE), this.W / 2, this.H * 0.4, '#D7263D', 18);
    this.hurt('Kelamaan!');
    if (S.lives > 0) this.newOrder();
  }

  startVisit() {
    S.visitT = 7;
    S.visits++;
    this.carpet.setVisible(true);
    this.float('📸 KUNJUNGAN PEJABAT!', this.W / 2, this.H * 0.22, '#D7263D', 24);
    this.float('Menu mendadak mewah. Poin x2', this.W / 2, this.H * 0.22 + 28, '#2A1A17', 16);
    nextNews('Pejabat tinjau dapur: "Menunya bagus sekali, setiap hari seperti ini?"');
    sfx.camera();
    Hud.pejabat(pick(PEJABAT.visit));
    this.syncOrder();
    Hud.stats();
  }

  endVisit() {
    S.visitIn = rand(22, 32);
    this.carpet.setVisible(false);
    this.float('Kamera pergi. Menu kembali normal.', this.W / 2, this.H * 0.3, '#6E5A55', 18);
    Hud.pejabat(pick(PEJABAT.leave));
    this.syncOrder();
    Hud.stats();
  }

  gameOver() {
    if (!S.running) return;
    S.running = false;
    S.visitT = 0;
    this.carpet.setVisible(false);
    this.drawTray();
    Hud.gameOver();
  }

  // ---------- frame ----------
  update(_, delta) {
    const dt = Math.min(0.05, delta / 1000), live = S.running, W = this.W, H = this.H;
    const ts = live && S.slowT > 0 ? 0.5 : 1;
    const t = this.time.now / 1000;

    if (live) {
      S.slowT = Math.max(0, S.slowT - dt);
      S.magnetT = Math.max(0, S.magnetT - dt);
      if (S.visitT > 0) {
        S.visitT -= dt;
        if (!reduceMotion && Math.random() < dt * 1.6) { this.cameras.main.flash(90, 255, 255, 255); sfx.camera(); }
        if (S.visitT <= 0) this.endVisit();
      } else if ((S.visitIn -= dt) <= 0) this.startVisit();
      const k = this.keys;
      if (k.left.isDown || k.a.isDown) tray.tx -= 560 * dt;
      if (k.right.isDown || k.d.isDown) tray.tx += 560 * dt;
    }

    this.updateTray(dt, live);

    this.spawnT -= dt * ts;
    if (this.spawnT <= 0) {
      this.spawn(!live);
      this.spawnT = (live ? spawnGap() : 1.1) * rand(0.8, 1.2);
    }

    if (live) this.updatePatience(dt * ts);
    this.updateItems(dt, ts, t, live);
    this.updateOverlays(t, live);
  }

  updateTray(dt, live) {
    tray.tx = clamp(tray.tx, tray.w / 2, this.W - tray.w / 2);
    const step = (tray.tx - tray.x) * Math.min(1, dt * 20);
    tray.x += step;
    if (live && S.hintMove && (S.moved += Math.abs(step)) > 80) { S.hintMove = false; this.finishTutorial(); }
    this.tray.setPosition(tray.x, tray.y + this.bump.y);
    this.aura.setVisible(live && S.magnetT > 0).setAlpha(0.3 + 0.2 * Math.sin(this.time.now / 100));
  }

  updatePatience(dt) {
    S.order.pat -= dt;
    const pr = clamp(S.order.pat / S.order.patMax, 0, 1);
    Hud.patience(pr);
    const low = pr < 0.3;
    if (low !== S.order.low) { S.order.low = low; Hud.lowPatience(low); Hud.order(); }
    if (S.order.pat <= 0) this.kidLeaves();
  }

  updateItems(dt, ts, t, live) {
    const need = live ? remaining() : [];
    const top = tray.y - tray.h / 2, W = this.W;
    for (const it of this.items) {
      if (live && S.magnetT > 0 && it.kind === 'food' && need.includes(it.key)) it.x += (tray.x - it.x) * Math.min(1, dt * 3.5);
      it.y += it.vy * dt * ts;
      it.rot += it.vr * dt * ts;
      if (it.key === 'lalat') it.x += Math.sin(t * 7 + it.wob) * 90 * dt;
      if (it.key === 'tikus') it.x += Math.sin(t * 3 + it.wob) * 50 * dt;
      it.c.setPosition(it.x, it.y);
      it.spr.setRotation(it.rot);
      if (it.label) it.label.setPosition(clamp(it.x, it.label.width / 2 + 6, W - it.label.width / 2 - 6), it.y + it.size * 0.75);

      if (it.kind === 'food') {
        const needed = need.includes(it.key);
        it.ring.setVisible(needed);
        // food not on this kid's order fades so the eye skips it
        it.c.setAlpha(!live || needed ? 1 : 0.55);
        const lux = visiting();
        if (lux !== it.lux) {
          it.lux = lux;
          it.spr.setTexture(emoji(this, lux ? LUX[it.key] : FOOD[it.key].e)).setDisplaySize(it.size * EMOJI_SCALE, it.size * EMOJI_SCALE);
        }
      }

      const hit = it.y + it.size * 0.35 >= top && it.y - it.size * 0.35 <= top + tray.h && Math.abs(it.x - tray.x) < tray.w / 2 + it.size * 0.15;
      if (live && !it.dead && hit) {
        it.dead = true;
        this.catchItem(it);
        if (!S.running) break;
      }
      if (it.y - it.size > this.H) it.dead = true;
    }
    this.items = this.items.filter(it => {
      if (it.dead) this.removeItem(it);
      return !it.dead;
    });
  }

  updateOverlays(t, live) {
    // status pills, top-left
    const pills = [];
    if (live && S.visitT > 0) pills.push([`📸 Kunjungan pejabat ${S.visitT.toFixed(1)}s`, '#2A1A17']);
    if (live && S.slowT > 0) pills.push([`🧋 Slow-mo ${S.slowT.toFixed(1)}s`, '#A86F38']);
    if (live && S.magnetT > 0) pills.push([`🤝 Orang dalam ${S.magnetT.toFixed(1)}s`, '#D7263D']);
    this.banners.forEach((b, i) => {
      if (!pills[i]) { b.setVisible(false); return; }
      if (b.text !== pills[i][0]) b.setText(pills[i][0]);
      b.setBackgroundColor(pills[i][1]).setVisible(true);
    });

    // first-round coaching above the tray
    const showHint = live && (S.hintMove || S.hintCatch);
    this.hint.setVisible(showHint);
    if (showHint) {
      const msg = S.hintMove ? '⟵  Geser ompreng  ⟶' : 'Tangkap yang dilingkari hijau';
      if (this.hint.text !== msg) this.hint.setText(msg).setBackgroundColor(S.hintMove ? '#2A1A17' : '#2FA36B');
      this.hint.setPosition(clamp(tray.x, this.hint.width / 2 + 8, this.W - this.hint.width / 2 - 8), tray.y - 54 + Math.sin(t * 4) * 3);
    }
  }
}
