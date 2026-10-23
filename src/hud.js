// Everything outside the canvas: order strip, header stats, ticker, subtitles and the end-of-round card.
import { FOOD, LUX, NEWS, PEJABAT } from './data.js';
import { $, S, prefs, store, pick, rupiah, rb, mult, visiting, rankFor, reduceMotion } from './state.js';
import { Voice } from './audio.js';

export const Hud = {
  order() {
    const o = S.order, say = $('#say');
    $('#kid').textContent = o.kid;
    say.classList.toggle('low', !!o.low);
    say.innerHTML = o.low ? `<b>${o.name}</b> sudah lapar banget. Cepetan, Kak!`
      : `<b>${o.name}</b> (${o.cls}) pesan:` + (o.items.length === 5 ? ' <b>5 Sempurna</b>' : '');
    $('#slots').innerHTML = o.items
      .map(i => `<div class="slot${i.done ? ' done' : ''}" title="${FOOD[i.k].n}">${visiting() ? LUX[i.k] : FOOD[i.k].e}</div>`)
      .join('');
  },

  stats() {
    $('#score').textContent = S.score;
    $('#best').textContent = Math.max(prefs.best, S.score);
    const l = Math.max(0, S.lives);
    $('#lives').textContent = '❤️'.repeat(l) + '🤍'.repeat(Math.max(0, 3 - l));
    $('#lv').textContent = 'Level ' + S.level;
    const m = mult() * (visiting() ? 2 : 1);
    $('#combo').hidden = !S.running || m <= 1;
    $('#combo').textContent = 'Combo x' + m.toLocaleString('id-ID') + (visiting() ? ' 📸' : '');
    $('#rp').textContent = 'Jatah ' + rb(S.budget);
    $('#pauseBtn').disabled = !S.running;
  },

  patience(pr) { $('#pat').style.width = (pr * 100) + '%'; },
  lowPatience(low) { $('#patWrap').classList.toggle('low', low); },
  happyKid() { restartAnimation($('#kid'), 'happy'); },
  budgetCut() { restartAnimation($('#rp'), 'cut'); },

  // the stamped note doubles as a subtitle for everything Pak Pejabat says
  releaseTimer: 0,
  release(txt, label) {
    $('#releaseLabel').textContent = label || 'RILIS RESMI';
    $('#releaseText').textContent = txt;
    $('#release').hidden = false;
    clearTimeout(this.releaseTimer);
    this.releaseTimer = setTimeout(() => { $('#release').hidden = true; }, Math.max(3200, txt.length * 70));
  },
  pejabat(txt) {
    this.release(txt, '🎙️ PAK PEJABAT');
    Voice.say(txt);
  },

  gameOver() {
    const isBest = S.score > prefs.best;
    if (isBest) { prefs.best = S.score; store.set('ompreng-best', prefs.best); }
    $('#finalScore').textContent = S.score;
    $('#newBest').hidden = !isBest || S.score === 0;
    $('#rank').textContent = rankFor(S.score);
    $('#rServed').textContent = S.served;
    $('#rStolen').textContent = S.stolen;
    $('#rKasus').textContent = S.kasus;
    $('#overTitle').textContent = S.served >= 10 ? 'Program Sukses Besar!' : 'Program Dievaluasi!';
    $('#persText').textContent =
      `Program dinyatakan berhasil 100% berdasarkan data internal. Sebanyak ${S.served} ompreng tersaji dengan jatah ${rupiah(S.budget)} per porsi. ` +
      (S.stolen ? `${S.stolen} lauk mengalami "penyesuaian distribusi". ` : 'Tidak ada kebocoran yang sempat terekam. ') +
      (S.kasus ? `${S.kasus} kasus adaptasi pencernaan sudah ditangani dengan rilis pers. ` : '') +
      (S.visits ? `Pejabat telah meninjau dapur ${S.visits} kali dan sangat puas.` : 'Pejabat berhalangan hadir karena sedang rapat evaluasi.');
    $('#shareBtn').textContent = 'Salin Skor buat Pamer';
    $('#overOv').hidden = false;
    $('#release').hidden = true;
    Voice.say(pick(PEJABAT.over));
    this.stats();
    $('#againBtn').focus();
  }
};

function restartAnimation(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// ---------- news ticker ----------
let newsQ = [];
export function nextNews(extra) {
  if (extra) newsQ.unshift(extra);
  if (!newsQ.length) newsQ = NEWS.slice().sort(() => Math.random() - 0.5);
  $('#track').textContent = newsQ.shift();
}
export function initTicker() {
  $('#track').addEventListener('animationiteration', () => nextNews());
  if (reduceMotion) setInterval(() => nextNews(), 7000);
  nextNews();
}
