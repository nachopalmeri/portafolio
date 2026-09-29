/* Motor de sonido: todo sintetizado con Web Audio (sin archivos).
   El AudioContext es también el reloj maestro de la película. */
const Sound = (() => {
  let ctx = null, master, musicBus, musicLP, sfxBus, noiseBuf, brownBuf;
  let muted = false;

  // ctxIn: un OfflineAudioContext para exportar la banda sonora al render de video
  function init(ctxIn) {
    ctx = ctxIn || new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .2;
    master = ctx.createGain(); master.gain.value = .9;
    master.connect(comp).connect(ctx.destination);
    musicLP = ctx.createBiquadFilter(); musicLP.type = "lowpass"; musicLP.frequency.value = 18000; musicLP.Q.value = .7;
    musicBus = ctx.createGain(); musicBus.gain.value = .55;
    musicBus.connect(musicLP).connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = .9; sfxBus.connect(master);

    const n = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    brownBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const w = noiseBuf.getChannelData(0), b = brownBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      w[i] = Math.random() * 2 - 1;
      last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; b[i] = last * 3.5;
    }
    return ctx;
  }

  const now = () => ctx.currentTime;

  // ---------- utilidades ----------
  function env(g, t, peak, a, d, sustainEnd) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, (sustainEnd || t + a) + d);
  }
  function noise(t, dur, buf = noiseBuf) {
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    s.start(t, Math.random()); s.stop(t + dur + .05); return s;
  }
  function osc(type, f, t, dur) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    o.start(t); o.stop(t + dur + .05); return o;
  }
  function filt(type, f, q = 1) { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; }
  function gain() { return ctx.createGain(); }

  // ---------- batería / música ----------
  function kick(t, v = 1, bus = musicBus) {
    const o = osc("sine", 150, t, .4), g = gain();
    o.frequency.exponentialRampToValueAtTime(46, t + .13);
    env(g, t, .95 * v, .003, .34); o.connect(g).connect(bus);
    const c = noise(t, .01), cg = gain(), hp = filt("highpass", 2500);
    env(cg, t, .12 * v, .001, .012); c.connect(hp).connect(cg).connect(bus);
  }
  function clap(t, v = 1) {
    const bp = filt("bandpass", 1500, 1.1), g = gain();
    const s = noise(t, .3); s.connect(bp).connect(g).connect(musicBus);
    g.gain.setValueAtTime(0.0001, t);
    [0, .011, .022].forEach(o => { g.gain.setValueAtTime(.34 * v, t + o); g.gain.exponentialRampToValueAtTime(.05, t + o + .009); });
    g.gain.setValueAtTime(.3 * v, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + .2);
    const o2 = osc("triangle", 190, t, .1), g2 = gain(); env(g2, t, .12 * v, .002, .07); o2.connect(g2).connect(musicBus);
  }
  function hat(t, v = 1, open = false) {
    const s = noise(t, .3), hp = filt("highpass", 7600), g = gain();
    env(g, t, .1 * v, .001, open ? .18 : .035); s.connect(hp).connect(g).connect(musicBus);
  }
  function bass(t, f, dur = .2) {
    const o = osc("sawtooth", f, t, dur + .1), o2 = osc("square", f / 2, t, dur + .1);
    const lp = filt("lowpass", 300, 4), g = gain(), g2 = gain(); g2.gain.value = .35;
    lp.frequency.setValueAtTime(1100, t); lp.frequency.exponentialRampToValueAtTime(260, t + dur);
    env(g, t, .2, .005, .12, t + dur * .6);
    o.connect(lp); o2.connect(g2).connect(lp); lp.connect(g).connect(musicBus);
  }
  function pluck(t, f, v = 1) { // marimba-ish
    const o = osc("sine", f, t, .6), o2 = osc("sine", f * 4, t, .2), o3 = osc("triangle", f * 2, t, .3);
    const g = gain(), g2 = gain(), g3 = gain();
    env(g, t, .15 * v, .003, .45); env(g2, t, .035 * v, .001, .06); env(g3, t, .03 * v, .002, .15);
    o.connect(g).connect(musicBus); o2.connect(g2).connect(musicBus); o3.connect(g3).connect(musicBus);
  }
  function stab(t, freqs, dur = .12, v = 1) {
    const lp = filt("lowpass", 1900, .8), g = gain();
    env(g, t, .045 * v, .006, .16, t + dur);
    lp.connect(g).connect(musicBus);
    freqs.forEach(f => [-7, 7].forEach(dt => { const o = osc("sawtooth", f, t, dur + .25); o.detune.value = dt; o.connect(lp); }));
  }
  function crash(t, v = 1) {
    const s = noise(t, 2), hp = filt("highpass", 4200), g = gain();
    env(g, t, .16 * v, .002, 1.6); s.connect(hp).connect(g).connect(musicBus);
  }

  // ---------- efectos ----------
  const sfx = {
    tick(t, v = 1) {
      const s = noise(t, .04), bp = filt("bandpass", 2600 + Math.random() * 1400, 2.5), g = gain();
      env(g, t, .22 * v, .001, .022); s.connect(bp).connect(g).connect(sfxBus);
      const o = osc("square", 1900 + Math.random() * 300, t, .02), g2 = gain(); env(g2, t, .025 * v, .001, .01); o.connect(g2).connect(sfxBus);
    },
    pop(t, f = 700, v = 1) {
      const o = osc("sine", f * .55, t, .2), g = gain();
      o.frequency.exponentialRampToValueAtTime(f * 1.35, t + .035);
      o.frequency.exponentialRampToValueAtTime(f * .9, t + .14);
      env(g, t, .28 * v, .004, .14); o.connect(g).connect(sfxBus);
    },
    whoosh(t, dur = .55, v = 1) {
      const s = noise(t, dur + .1), bp = filt("bandpass", 250, 1.3), g = gain();
      bp.frequency.setValueAtTime(220, t);
      bp.frequency.exponentialRampToValueAtTime(3200, t + dur * .55);
      bp.frequency.exponentialRampToValueAtTime(420, t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.5 * v, t + dur * .5);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp).connect(g).connect(sfxBus);
    },
    ding(t, v = 1) {
      [[1568, .09], [2349.3, .05], [3136, .025], [4699, .012]].forEach(([f, a]) => {
        const o = osc("sine", f, t, 1.6), g = gain(); env(g, t, a * v, .002, 1.4); o.connect(g).connect(sfxBus);
      });
    },
    riser(t, dur = .6, v = 1) {
      const s = noise(t, dur), bp = filt("bandpass", 300, 3), g = gain();
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(7000, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.3 * v, t + dur * .95); g.gain.linearRampToValueAtTime(0, t + dur);
      s.connect(bp).connect(g).connect(sfxBus);
      const o = osc("sawtooth", 120, t, dur), lp = filt("lowpass", 900), g2 = gain();
      o.frequency.exponentialRampToValueAtTime(900, t + dur);
      g2.gain.setValueAtTime(.0001, t); g2.gain.exponentialRampToValueAtTime(.05 * v, t + dur * .95); g2.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(lp).connect(g2).connect(sfxBus);
    },
    thump(t, v = 1) { kick(t, .55 * v, sfxBus); },
    click(t, v = 1) { // click seco de interfaz
      const s = noise(t, .02), hp = filt("highpass", 3500), g = gain();
      env(g, t, .16 * v, .001, .008); s.connect(hp).connect(g).connect(sfxBus);
      const o = osc("sine", 180, t, .05), g2 = gain(); env(g2, t, .12 * v, .002, .035); o.connect(g2).connect(sfxBus);
    },
    blip(t, f = 800, v = 1) {
      const o = osc("sine", f, t, .1), g = gain(); env(g, t, .045 * v, .002, .06); o.connect(g).connect(sfxBus);
    },
    glitch(t, v = 1) {
      for (let i = 0; i < 7; i++) {
        const at = t + i * .028, o = osc("square", 180 + Math.random() * 1600, at, .03), g = gain();
        env(g, at, .07 * v, .001, .02); o.connect(g).connect(sfxBus);
      }
      const s = noise(t, .25), bp = filt("bandpass", 1200, .6), g = gain();
      env(g, t, .2 * v, .002, .2); s.connect(bp).connect(g).connect(sfxBus);
      kick(t, .5 * v, sfxBus);
    },
    confirm(t, v = 1) {
      [[220, 0], [329.63, .07]].forEach(([f, d]) => {
        const o = osc("triangle", f, t + d, .6), g = gain(); env(g, t + d, .12 * v, .004, .45); o.connect(g).connect(sfxBus);
      });
      sfx.click(t, .6 * v);
    },
    sub(t, v = 1) { sub808(t, 55, 1.4, v); },
    printer(t, dur, v = 1) { // impresora térmica de tickets
      const s = noise(t, dur), bp = filt("bandpass", 2400, 1.8), g = gain(), am = gain();
      const lfo = osc("square", 38, t, dur), lg = gain(); lg.gain.value = .5;
      am.gain.value = .5; lfo.connect(lg).connect(am.gain);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16 * v, t + .03);
      g.gain.setValueAtTime(.16 * v, t + dur - .05); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp).connect(am).connect(g).connect(sfxBus);
      const m = osc("sawtooth", 95, t, dur), ml = filt("lowpass", 400), mg = gain();
      mg.gain.setValueAtTime(.0001, t); mg.gain.exponentialRampToValueAtTime(.05 * v, t + .03);
      mg.gain.setValueAtTime(.05 * v, t + dur - .05); mg.gain.exponentialRampToValueAtTime(.0001, t + dur);
      m.connect(ml).connect(mg).connect(sfxBus);
    },
    stamp(t, v = 1) { // sello de goma sobre papel
      kick(t, 1.1 * v, sfxBus); sub808(t, 50, 1.2, .9 * v);
      const s = noise(t, .3), lp = filt("lowpass", 1400), g = gain();
      env(g, t, .5 * v, .001, .18); s.connect(lp).connect(g).connect(sfxBus);
      crash(t + .01, .5 * v);
    },
    sting(t, v = 1) { // golpe disonante de suspenso
      const lp = filt("lowpass", 700, 1), g = gain();
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09 * v, t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, t + 1.8);
      lp.connect(g).connect(sfxBus);
      [110, 116.54, 164.81].forEach(f => [-6, 6].forEach(dt => { const o = osc("sawtooth", f, t, 1.9); o.detune.value = dt; o.connect(lp); }));
      sub808(t, 55, 1.2, .8 * v);
    },
    projector(t, dur, v = 1) { // traqueteo del proyector
      for (let x = 0; x < dur; x += 1 / 18) {
        const at = t + x, s = noise(at, .02), bp = filt("bandpass", 1800 + Math.random() * 600, 3), g = gain();
        env(g, at, .07 * v, .001, .014); s.connect(bp).connect(g).connect(sfxBus);
      }
      const s = noise(t, dur), lp = filt("lowpass", 300), g = gain();
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05 * v, t + .2);
      g.gain.setValueAtTime(.05 * v, t + dur - .2); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(lp).connect(g).connect(sfxBus);
    },
    silence(t) { // corte seco de la música
      musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t); musicBus.gain.linearRampToValueAtTime(0, t + .03);
    },
    fadeMusic(t, dur) { musicBus.gain.setValueAtTime(.55, t); musicBus.gain.linearRampToValueAtTime(0, t + dur); },
    glass(t, v = 1) { // "tink" de la lupa
      [[2637, .06], [3951, .03]].forEach(([f, a]) => { const o = osc("sine", f, t, .5), g = gain(); env(g, t, a * v, .001, .4); o.connect(g).connect(sfxBus); });
    },
    room(t, dur, v = 1) { // tono de ambiente
      const s = noise(t, dur, brownBuf), lp = filt("lowpass", 520), g = gain();
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05 * v, t + .8);
      g.gain.setValueAtTime(.05 * v, t + dur - .6); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(lp).connect(g).connect(sfxBus);
    },
    hum(t, dur, v = 1) { // zumbido de pantalla
      [[60, .03], [120, .018], [180, .006]].forEach(([f, a]) => {
        const o = osc("sine", f, t, dur), g = gain();
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(a * v, t + .3);
        g.gain.setValueAtTime(a * v, t + dur - .4); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g).connect(sfxBus);
      });
      const s = noise(t, dur), hp = filt("highpass", 9000), g = gain();
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.012 * v, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(hp).connect(g).connect(sfxBus);
    },
  };

  // ---------- la canción (100 BPM, La menor: Am – F – Dm – E) ----------
  const BPM = 100, BEAT = 60 / BPM, STEP = BEAT / 4, BAR = BEAT * 4;
  const CHORDS = [[220, 261.63, 329.63], [174.61, 220, 261.63], [146.83, 174.61, 220], [164.81, 207.65, 246.94]];
  const ROOTS = [55, 43.65, 36.71, 41.2];

  function sub808(t, f, dur, v = 1) {
    const o = osc("sine", f * 1.9, t, dur + .1), g = gain(), sh = ctx.createWaveShaper();
    const c = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c[i] = Math.tanh(x * 2.2); }
    sh.curve = c;
    o.frequency.exponentialRampToValueAtTime(f, t + .06);
    env(g, t, .55 * v, .004, .25, t + dur * .7);
    o.connect(sh).connect(g).connect(musicBus);
  }
  function pad(t, freqs, dur, v = 1) {
    const lp = filt("lowpass", 700, .6), g = gain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.022 * v, t + .4);
    g.gain.setValueAtTime(.022 * v, t + dur - .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .2);
    lp.connect(g).connect(musicBus);
    freqs.forEach(f => [-9, 0, 9].forEach(dt => { const o = osc("sawtooth", f / 2, t, dur + .3); o.detune.value = dt; o.connect(lp); }));
  }
  function arp(t, f, v = 1) {
    const o = osc("sawtooth", f, t, .25), lp = filt("lowpass", 1400, 3), g = gain();
    lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(500, t + .18);
    env(g, t, .045 * v, .003, .16); o.connect(lp).connect(g).connect(musicBus);
  }

  /** bars: [{ i: acorde, drums: 'sparse'|'full', arp, pad, breakFrom: paso donde se corta, roll, end }] */
  function song(start, bars) {
    bars.forEach((b, n) => {
      const t0 = start + n * BAR, ci = b.i ?? n % 4, ch = CHORDS[ci], root = ROOTS[ci];
      if (b.pad) pad(t0, ch, (b.breakFrom ?? 16) * STEP);
      for (let s = 0; s < 16; s++) {
        const t = t0 + s * STEP;
        const on = (b.breakFrom == null || s < b.breakFrom) && (b.startFrom == null || s >= b.startFrom);
        if (on && b.drums) {
          const full = b.drums === "full";
          if (s === 0 || s === 10 || (full && s === 7)) kick(t, s === 0 ? 1 : .8);
          if (s === 0 || s === 10 || (full && s === 7)) sub808(t, root, s === 0 ? STEP * 6 : STEP * 3);
          if (s === 4 || s === 12) clap(t, .9);
          if (full) hat(t, s % 4 === 2 ? .9 : .45); else if (s % 2 === 0) hat(t, .6);
        } else if (b.roll && !on && s >= (b.breakFrom ?? 16)) {
          const k = s - b.breakFrom, total = 16 - b.breakFrom;
          hat(t, .3 + .7 * k / total); hat(t + STEP / 2, .2 + .6 * k / total);
        }
        if (b.arp && on && s % 2 === 0) arp(t, ch[(s / 2) % 3] * 2 * (s % 8 === 6 ? 2 : 1), s % 4 === 0 ? 1 : .6);
      }
      if (b.end) { kick(t0 + b.breakFrom * STEP, 1.1); sub808(t0 + b.breakFrom * STEP, ROOTS[0], 1.6, 1.1); crash(t0 + b.breakFrom * STEP, .8); }
    });
    return start + bars.length * BAR;
  }
  function musicReset(t) {
    musicLP.frequency.cancelScheduledValues(t); musicLP.frequency.setValueAtTime(18000, t);
    musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(.55, t);
  }

  function musicFilter(t, f, dur) {
    musicLP.frequency.setValueAtTime(musicLP.frequency.value, t);
    musicLP.frequency.exponentialRampToValueAtTime(f, t + dur);
  }
  function musicGain(t, v, dur) {
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(v, t + dur);
  }

  function stop(fade = .35) {
    if (!ctx) return;
    const t = now();
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => ctx && ctx.close(), fade * 1000 + 100);
  }
  function setMuted(m) {
    muted = m; if (!ctx) return;
    master.gain.setTargetAtTime(m ? 0 : .9, now(), .05);
  }

  return {
    init, now, sfx, song, kick, crash, musicFilter, musicGain, musicReset, stop, setMuted,
    get ctx() { return ctx; }, get muted() { return muted; }, BEAT, BAR,
  };
})();
