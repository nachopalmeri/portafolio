/* Intro cinematográfica — prototipo (gancho → infancia → la compu: web3, código, IA).
   Una única línea de tiempo GSAP en pausa, conducida por el reloj del AudioContext,
   así imagen y sonido nunca se desfasan. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RESPECT_SEEN = false; // en el prototipo siempre se reproduce
  const SEEN_KEY = "intro:v1:seen";

  const win = $("#window"), stage = $("#stage"), world = $("#world"), site = $("#site img");
  const avatar = $(".avatar"), hud = $("#hud"), slug = $(".slug"), tcEl = $(".tc b");

  // ---------- encuadre: el escenario 1280×720 se escala a la ventana ----------
  function fit() { gsap.set(stage, { xPercent: -50, yPercent: -50, scale: win.clientWidth / 1280 }); }
  fit(); addEventListener("resize", fit);

  // ---------- grano de película ----------
  (() => {
    const c = document.createElement("canvas"); c.width = c.height = 220;
    const x = c.getContext("2d"), d = x.createImageData(220, 220);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() * 200;
    }
    x.putImageData(d, 0, 0);
    $(".grain").style.backgroundImage = `url(${c.toDataURL()})`;
  })();

  // aleatorio con semilla: el decorado sale igual en cada visita
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------- pasto a tinta ----------
  (() => {
    let s = "";
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 1280, y = 606 + rnd() * 110, h = 6 + rnd() * 10;
      if (x > 540 && x < 740 && y < 660) continue;
      s += `<path d="M${x} ${y} l-3 -${h} M${x} ${y} l2 -${h * .8} M${x} ${y} l6 -${h * .6}" />`;
    }
    const g = $(".grass"); g.innerHTML = s;
    g.setAttribute("stroke", "#161614"); g.setAttribute("stroke-width", "1.5"); g.setAttribute("stroke-linecap", "round"); g.setAttribute("opacity", ".55");
  })();

  // ---------- velas del gráfico ----------
  const candles = (() => {
    const svg = $(".candles"), W = 560, H = 290, n = 28;
    let p = 1, out = [];
    for (let i = 0; i < n; i++) {
      const o = p, drift = .045 + i * .002, c = o * (1 + drift + (rnd() - .42) * .16);
      out.push({ o, c, h: Math.max(o, c) * (1 + rnd() * .05), l: Math.min(o, c) * (1 - rnd() * .05) });
      p = c;
    }
    const lo = Math.min(...out.map(k => k.l)), hi = Math.max(...out.map(k => k.h));
    const L = Math.log, y = v => H - 10 - (L(v) - L(lo)) / (L(hi) - L(lo)) * (H - 30);
    let s = "";
    for (let g = 0; g < 5; g++) s += `<line class="grid" x1="0" x2="${W}" y1="${10 + g * (H - 20) / 4}" y2="${10 + g * (H - 20) / 4}"/>`;
    out.forEach((k, i) => {
      const x = i * 20 + 4, up = k.c >= k.o, col = up ? "#34d399" : "#ef5b5b";
      const top = y(Math.max(k.o, k.c)), bh = Math.max(2, Math.abs(y(k.o) - y(k.c)));
      k.cx = x + 6; k.cy = top + bh / 2;
      s += `<g class="cd" data-i="${i}"><line x1="${x + 6}" x2="${x + 6}" y1="${y(k.h)}" y2="${y(k.l)}" stroke="${col}" stroke-width="1.5"/>` +
           `<rect x="${x}" y="${top}" width="12" height="${bh}" fill="${col}"/></g>`;
    });
    svg.innerHTML = s;
    return out;
  })();

  // ---------- el código ----------
  const CODE = [
    [["k", "def "], ["f", "aprender"], ["", "(tema):"]],
    [["", "    "], ["k", "while not "], ["f", "entiendo"], ["", "(tema):"]],
    [["", "        "], ["f", "leer"], ["", "(tema)"]],
    [["", "        "], ["f", "probar"], ["", "()"]],
    [["", "        "], ["f", "romper"], ["", "()"]],
    [["", "    "], ["k", "return "], ["f", "construir"], ["", "(tema)"]],
  ];
  const FIX = [["k", "from "], ["", "curiosidad "], ["k", "import "], ["f", "entiendo"]];
  const rowLen = r => r.reduce((a, [, s]) => a + s.length, 0);
  const CODE_LEN = CODE.reduce((a, r) => a + rowLen(r) + 1, 0), FIX_LEN = rowLen(FIX);
  function rowHTML(r, n) {
    let h = "";
    for (const [c, s] of r) { if (n <= 0) break; const t = s.slice(0, n); n -= s.length; h += c ? `<span class="${c}">${t}</span>` : t; }
    return h;
  }
  const code = { fix: 0, n: 0 };
  function renderCode() {
    const rows = [];
    if (code.fix > 0) rows.push(["new", rowHTML(FIX, code.fix)]);
    let n = code.n;
    for (const r of CODE) { if (n <= 0) break; rows.push(["", rowHTML(r, n)]); n -= rowLen(r) + 1; }
    if (!rows.length) rows.push(["", ""]);
    $(".e-code").innerHTML = rows.map(([c, h], i) => `<span class="row ${c}"><span class="ln">${i + 1}</span>${h}</span>`).join("");
  }
  renderCode();

  // ---------- estados iniciales ----------
  const bug = { x: 780, y: 628, r: -70 };
  const beetle = $("#beetle"), lens = $(".lens");
  const drawBug = () => beetle.setAttribute("transform", `translate(${bug.x} ${bug.y}) rotate(${bug.r})`);
  drawBug();
  $(".lens-zoom").setAttribute("transform", "scale(2.3) translate(-640 -600)");

  gsap.set(avatar, { x: 440, rotation: -10, transformOrigin: "50% 100%" });
  gsap.set(".m > span", { yPercent: 115 });
  gsap.set(".bubble", { opacity: 0, scale: .92 });
  gsap.set(lens, { scale: .6, opacity: 0, svgOrigin: "0 0" });
  gsap.set("#field", { transformOrigin: "640px 600px" });
  gsap.set(".kid", { transformOrigin: "50% 100%" });
  gsap.set($$(".cd"), { scaleY: 0, opacity: 0, transformOrigin: "50% 50%" });
  gsap.set([".tag", ".node", ".tests"], { opacity: 0 });
  const cutFlash = document.createElement("div"); cutFlash.className = "flash"; cutFlash.style.zIndex = 5; $("#screen").appendChild(cutFlash);

  // ---------- helpers de guion ----------
  const tl = gsap.timeline({ paused: true });
  const SND = []; // [tiempo, (T)=>{}]
  const snd = (t, fn) => SND.push([t, fn]);
  const B = n => 2.8 + n * Sound.BEAT; // grilla de pulsos: la música arranca en "Soy"
  const face = (f, t) => tl.call(() => { avatar.dataset.face = f; }, null, t);
  const setSlug = (s, t) => tl.call(() => { slug.textContent = s; }, null, t);
  const show = (sel, t) => tl.set(sel, { visibility: "visible" }, t);
  const hide = (sel, t) => tl.set(sel, { visibility: "hidden" }, t);
  const reveal = (sel, t, d = .8) => tl.to(sel, { yPercent: 0, duration: d, ease: "expo.out", stagger: .09 }, t);
  function type(el, text, t, cps, v = .8, every = 1) {
    tl.call(() => { el.textContent = ""; }, null, Math.max(0, t - .01));
    [...text].forEach((ch, i) => {
      const at = t + i / cps;
      tl.call(() => { el.textContent = text.slice(0, i + 1); }, null, at);
      if (ch.trim() && i % every === 0) snd(at, T => Sound.sfx.tick(T, v * (.8 + Math.random() * .4)));
    });
    return t + text.length / cps;
  }
  function flap(t0, t1) { // boca: habla/neutral
    let t = t0, open = true;
    while (t < t1) { face(open ? "talk" : "neutral", t); open = !open; t += .12 + Math.random() * .06; }
  }

  // ================= GUION =================
  // --- 01 · psst ---
  snd(0, T => Sound.sfx.room(T, 12.5, 1));
  tl.to(avatar, { x: 300, rotation: -14, duration: .8, ease: "power3.out" }, .5);
  snd(.5, T => Sound.sfx.whoosh(T, .5, .22));
  face("blink", 1.22); face("side", 1.34);
  tl.to(avatar, { rotation: -12, duration: .6, ease: "sine.inOut" }, 1.3);
  tl.to(".bubble", { opacity: 1, scale: 1, duration: .25, ease: "power3.out" }, 1.6);
  snd(1.6, T => Sound.sfx.click(T, .7));
  type($(".bubble .bt"), "psst…", 1.74, 8, .5);
  tl.to(".bubble", { opacity: 0, duration: .15 }, 2.5);
  tl.to(avatar, { x: 0, rotation: 0, duration: .6, ease: "power4.out" }, 2.42);
  snd(2.4, T => Sound.sfx.whoosh(T, .45, .55));

  reveal("#hook .soy .m > span", B(0));
  snd(B(0), T => Sound.sfx.thump(T));
  flap(B(0), B(1.6));
  reveal("#hook .nacho .m > span", B(1), .9);
  tl.set("#hook .nacho .uline path", { opacity: 1 }, B(2));
  tl.to("#hook .nacho .uline path", { strokeDashoffset: 0, duration: .45, ease: "power2.inOut" }, B(2));
  reveal("#hook .arreglo .m > span", B(3));
  flap(B(3), B(3.8));
  face("smile", B(4));
  tl.to(avatar, { scale: 1.035, duration: 3, ease: "sine.inOut" }, B(4));
  face("side", B(6));

  // --- paneo látigo hacia la izquierda: el pasado ---
  tl.to(world, { x: 1280, duration: .62, ease: "power3.inOut" }, B(7));
  tl.to("#mbBlur", { attr: { stdDeviation: "70 0" }, duration: .31, ease: "power2.in" }, B(7));
  tl.to("#mbBlur", { attr: { stdDeviation: "0 0" }, duration: .31, ease: "power2.out" }, B(7) + .31);
  tl.set(world, { filter: "url(#mb)" }, B(7)); tl.set(world, { filter: "none" }, B(8) + .02);
  snd(B(7) - .05, T => Sound.sfx.whoosh(T, .7, 1));
  setSlug("// 02 — desde chico", B(7.5));
  snd(B(8), T => Sound.sfx.sub(T, .7));

  // --- 02 · desde chico ---
  tl.to("#field", { scale: 1.045, duration: B(15) - B(8), ease: "none" }, B(8));
  tl.to(".kid", { rotation: .8, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 3 }, B(8));
  reveal("#field .desde .m > span", B(9));
  reveal("#field .curioso .m > span", B(10), .9);
  tl.set("#field .curioso .uline path", { opacity: 1 }, B(11));
  tl.to("#field .curioso .uline path", { strokeDashoffset: 0, duration: .45, ease: "power2.inOut" }, B(11));
  tl.to(bug, { x: 646, y: 604, r: -95, duration: 2.1, ease: "sine.inOut", onUpdate: drawBug }, B(10.5));
  tl.to(lens, { scale: 1, opacity: 1, duration: .5, ease: "power3.out" }, B(12));
  snd(B(12), T => { Sound.sfx.click(T, .8); Sound.sfx.glass(T + .03, .5); });
  tl.to(".an-line", { strokeDashoffset: 0, duration: .4, ease: "power2.inOut" }, B(12.5));
  type($(".an-label .tt"), "¿cómo funciona?", B(13), 24, .4);
  tl.to(bug, { r: -80, duration: .3, yoyo: true, repeat: 3, ease: "sine.inOut", onUpdate: drawBug }, B(13.4));

  // --- empuje dentro de la lupa: la lente se vuelve pantalla ---
  const P0 = B(15), P1 = B(16);
  tl.set("#screen", { clipPath: "circle(80px at 640px 600px)" }, P0);
  tl.fromTo("#screen", { opacity: 0 }, { opacity: 1, duration: .15 }, P0);
  tl.to("#screen", { clipPath: "circle(1500px at 640px 600px)", duration: P1 - P0 - .05, ease: "power4.in" }, P0 + .08);
  tl.to("#field", { scale: 3.2, duration: P1 - P0, ease: "power4.in" }, P0);
  const rim = $("#rim circle");
  tl.set(rim, { attr: { cx: 640, cy: 600, r: 80 } }, P0);
  tl.to(rim, { attr: { r: 1500, "stroke-width": 90 }, duration: P1 - P0 - .05, ease: "power4.in" }, P0 + .08);
  tl.set(".lens", { opacity: 0 }, P0 + .02);
  snd(P0 - .1, T => Sound.sfx.riser(T, .7, 1));
  snd(P0, T => { Sound.musicFilter(T, 160, .6); Sound.musicGain(T + .45, 0, .2); });

  // --- 03 · la compu: silencio, zumbido, primer "hola" ---
  tl.call(() => hud.classList.add("dark"), null, P1);
  setSlug("// 03 — la compu", P1);
  snd(P1, T => Sound.sfx.hum(T, 2.6, 1));
  type($(".term .typed"), "hola, mundo", P1 + .6, 10, 1);
  snd(B(19), T => Sound.sfx.riser(T, .6, .8));

  // --- web3: vuelve la música de golpe ---
  const W0 = B(20);
  hide(".p-hello", W0); show(".p-web3", W0);
  setSlug("// 04 — la ola", W0);
  snd(W0, T => { Sound.musicReset(T); Sound.sfx.sub(T, 1); Sound.crash(T, .6); });
  reveal(".p-web3 .d-title .m > span", W0);
  tl.fromTo(".chart", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: "power3.out" }, W0 + .1);
  const price = { v: .0041, pct: 0 };
  const cdEls = $$(".cd"), C0 = W0 + .35, CSTEP = .075;
  cdEls.forEach((el, i) => {
    tl.to(el, { scaleY: 1, opacity: 1, duration: .14, ease: "power2.out" }, C0 + i * CSTEP);
    if (i % 2 === 0) snd(C0 + i * CSTEP, T => Sound.sfx.blip(T, 480 + i * 26, .7));
  });
  tl.to(price, {
    v: .0213, pct: 420, duration: cdEls.length * CSTEP, ease: "power1.in",
    onUpdate: () => { $(".price").textContent = "$" + price.v.toFixed(4); $(".chg").textContent = "+" + Math.round(price.pct) + "%"; },
  }, C0);
  [".t1", ".t2", ".t3"].forEach((s, i) => {
    tl.fromTo(s, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, ease: "power3.out" }, B(22 + i));
    snd(B(22 + i), T => Sound.sfx.click(T, .6));
  });
  // empuje dentro de la última vela verde
  const last = candles[candles.length - 1];
  tl.to(".p-web3 .d-title", { opacity: 0, duration: .3 }, B(25));
  tl.to(".chart", { scale: 18, duration: .6, ease: "power4.in", transformOrigin: `${20 + last.cx}px ${70 + last.cy}px` }, B(25));
  tl.to(".t1, .t2, .t3", { opacity: 0, duration: .2 }, B(25));
  tl.to(cutFlash, { opacity: 1, duration: .25, ease: "power2.in" }, B(26) - .25);
  snd(B(25), T => { Sound.sfx.riser(T, .6, .7); Sound.sfx.whoosh(T + .1, .5, .6); });

  // --- código ---
  const K0 = B(26);
  hide(".p-web3", K0); show(".p-code", K0);
  tl.to(cutFlash, { opacity: 0, duration: .45, ease: "power2.out" }, K0);
  setSlug("// 05 — código", K0);
  reveal(".p-code .d-title .m > span", K0);
  tl.fromTo(".editor", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: "power3.out" }, K0 + .1);
  const CPS = 55, typeStart = K0 + .5;
  tl.to(code, { n: CODE_LEN, duration: CODE_LEN / CPS, ease: "none", onUpdate: () => { code.n = Math.round(code.n); renderCode(); } }, typeStart);
  for (let i = 0; i < CODE_LEN; i += 2) snd(typeStart + i / CPS, T => Sound.sfx.tick(T, .5 + Math.random() * .3));
  type($(".et1"), "$ python aprender.py", B(30), 60, .5, 2);
  tl.call(() => { const e = $(".et2"); e.className = "et2 err"; e.textContent = "NameError: name 'entiendo' is not defined"; }, null, B(31));
  tl.to(".p-code", { keyframes: [{ x: -10, skewX: 5 }, { x: 8, skewX: -4 }, { x: -4, skewX: 2 }, { x: 0, skewX: 0 }], duration: .28 }, B(31));
  tl.fromTo(".editor", { borderColor: "rgba(239,91,91,.9)" }, { borderColor: "rgba(233,230,221,.1)", duration: .6 }, B(31));
  snd(B(31), T => Sound.sfx.glitch(T, 1));
  tl.call(() => { $(".et1").textContent = ""; const e = $(".et2"); e.className = "et2"; e.textContent = ""; }, null, B(32) - .05);
  tl.to(code, { fix: FIX_LEN, duration: FIX_LEN / 60, ease: "none", onUpdate: () => { code.fix = Math.round(code.fix); renderCode(); } }, B(32));
  for (let i = 0; i < FIX_LEN; i += 2) snd(B(32) + i / 60, T => Sound.sfx.tick(T, .6));
  tl.call(() => { $(".et1").textContent = "$ python aprender.py"; }, null, B(33));
  tl.call(() => { const e = $(".et2"); e.className = "et2 ok"; e.textContent = "✓ funciona."; }, null, B(33.5));
  snd(B(33.5), T => Sound.sfx.confirm(T, 1));

  // --- IA: látigo vertical ---
  const A0 = B(34);
  show(".p-ai", A0 - .3);
  tl.set(".p-ai", { y: 720 }, 0);
  tl.to(".p-code", { y: -720, duration: .55, ease: "power3.inOut" }, A0 - .3);
  tl.to(".p-ai", { y: 0, duration: .55, ease: "power3.inOut" }, A0 - .3);
  tl.set("#screen", { filter: "url(#mbv)" }, A0 - .3); tl.set("#screen", { filter: "none" }, A0 + .27);
  tl.to("#mbvBlur", { attr: { stdDeviation: "0 60" }, duration: .27, ease: "power2.in" }, A0 - .3);
  tl.to("#mbvBlur", { attr: { stdDeviation: "0 0" }, duration: .28, ease: "power2.out" }, A0 - .03);
  snd(A0 - .35, T => Sound.sfx.whoosh(T, .6, .9));
  setSlug("// 06 — IA", A0);
  reveal(".p-ai .d-title .m > span", A0 + .15);
  tl.fromTo(".prompt", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "power3.out" }, A0 + .2);
  const promptEnd = type($(".pr-text"), "armá un bot que me avise cuando aparezca un laburo para mí", B(35), 36, .5, 2);
  snd(B(38), T => Sound.sfx.click(T, 1.1));
  const OUT = ["<b>plan</b>", "\n  1. ", "scraper ", "de ", "ofertas", "\n  2. ", "filtro ", "por ", "perfil", "\n  3. ", "alerta ", "por ", "Telegram"];
  OUT.forEach((_, i) => {
    const at = B(38) + .15 + i * .07;
    tl.call(() => { $(".pr-out").innerHTML = OUT.slice(0, i + 1).join(""); }, null, at);
    snd(at, T => Sound.sfx.tick(T, .35));
  });
  tl.to(".node, .tests", { opacity: 1, duration: .4, stagger: .06 }, B(37));
  [[".n1", ".e1"], [".n2", ".e2"], [".n3", null]].forEach(([n, e], i) => {
    const at = B(39 + i * .5);
    tl.call(() => $(n).classList.add("on"), null, at);
    snd(at, T => Sound.sfx.click(T, .8));
    if (e) tl.to(`${e} span`, { scaleX: 1, duration: .3, ease: "power2.inOut" }, at + .05);
  });
  const tests = { n: 0 };
  tl.to(tests, { n: 12, duration: 1.1, ease: "none", onUpdate: () => { $(".tests b").textContent = Math.round(tests.n); } }, B(40));
  for (let i = 0; i < 12; i++) snd(B(40) + i * 1.1 / 12, T => Sound.sfx.blip(T, 700 + i * 40, .6));
  tl.call(() => { $(".tests").classList.add("ok"); $(".tests").innerHTML = "tests <b>12</b>/12 ✓"; }, null, B(42));
  snd(B(42), T => Sound.sfx.confirm(T, 1));

  // ================= 07 · EL MOSTRADOR (Grido) =================
  const G0 = B(43);
  show("#grido", G0);
  tl.call(() => hud.classList.remove("dark"), null, G0);
  setSlug("// 07 — el mostrador", G0);
  snd(G0, T => { Sound.sfx.click(T, 1); Sound.sfx.thump(T, .6); });
  const mini = $(".avatar.mini");
  const miniFace = (f, t) => tl.call(() => { mini.dataset.face = f; }, null, t);
  gsap.set(mini, { y: 320 });
  gsap.set(".receipt", { yPercent: -101 });
  gsap.set(".g-term", { y: 40 });
  reveal("#grido .t-day .m > span", G0 + .05);
  tl.to(mini, { y: 0, duration: .8, ease: "power3.out" }, G0 + .5);
  tl.to(".receipt", { yPercent: 0, duration: B(47) - B(44), ease: "steps(26)" }, B(44));
  snd(B(44), T => Sound.sfx.printer(T, B(47) - B(44), 1));
  tl.set(".r-ring path", { opacity: 1 }, B(48));
  tl.to(".r-ring path", { strokeDashoffset: 0, duration: .45, ease: "power2.inOut" }, B(48));
  tl.fromTo(".r-dif", { scale: 1 }, { scale: 1.06, duration: .12, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, B(48));
  miniFace("surprised", B(48));
  snd(B(48), T => Sound.sfx.sting(T, 1));
  // de noche: el script concilia la caja
  tl.to("#grido .t-day .m > span", { yPercent: -115, duration: .45, ease: "power3.in", stagger: .05 }, B(50) - .45);
  reveal("#grido .t-night .m > span", B(50));
  miniFace("side", B(50));
  tl.to(".g-term", { opacity: 1, y: 0, duration: .6, ease: "power3.out" }, B(50));
  const GT = [
    "<span class=dim>$</span> python conciliar.py --caja 02",
    "<span class=ok>✓</span> ventas          1.284.300",
    "<span class=ok>✓</span> efectivo          842.100",
    "<span class=ok>✓</span> tarjetas          440.960",
    "<span class=ok>→</span> ticket #0042 sin registrar  <span class=ok>+1.240</span>",
  ];
  const gtEl = $(".gt"), gtFirst = "$ python conciliar.py --caja 02";
  [...gtFirst].forEach((ch, i) => {
    const at = B(50) + .3 + i / 60;
    tl.call(() => { gtEl.innerHTML = `<span class=dim>$</span>${gtFirst.slice(1, i + 1)}`; }, null, at);
    if (i % 2 === 0) snd(at, T => Sound.sfx.tick(T, .5));
  });
  GT.slice(1).forEach((_, i) => {
    const at = B(51) + .15 + i * .22;
    tl.call(() => { gtEl.innerHTML = GT.slice(0, i + 2).join("\n"); }, null, at);
    snd(at, T => Sound.sfx.blip(T, 620 + i * 90, .8));
  });
  tl.call(() => { $(".r-dif").classList.add("ok"); $(".dif-v").textContent = "$ 0 ✓ cuadra"; }, null, B(53));
  tl.to(".r-ring path", { stroke: "#0e8a5e", duration: .2 }, B(53));
  miniFace("smile", B(53));
  snd(B(53), T => Sound.sfx.confirm(T, 1.1));

  // ================= 08 · LO QUE CONSTRUÍ =================
  const PA = "https://ignaciopalmeri.dev/project-assets/";
  const PROJ = [
    ["JobBot", "jobbot-lime.vercel.app", "automation saas", "job-bot"],
    ["Darter", "privado", "sistema financiero personal", "darter"],
    ["Pisculichi Labs", "polytools-omega.vercel.app", "product lab", "polymarktporyect"],
    ["Agents System", "local", "workflow system", "agents-system"],
    ["FranquiYA", "franqui-ya.vercel.app", "gestión de franquicias", "franquiya"],
    ["Motor Predictivo", "prode-mundial-2026-ten-omega.vercel.app", "analytics de deportes", "prode-mundial-2026"],
    ["FulboTracker", "fulbotracker.vercel.app", "sports product", "futtracker"],
    ["PISKU CLI", "pisku-cli.vercel.app", "cli product", "pisku-cli-correct"],
    ["Piscubi Store", "piscubi-store.vercel.app", "e-commerce de libros", "piscubi"],
    ["Comida de Barrio", "comidadebarrio.vercel.app", "local commerce", "comidadebarrio"],
    ["Dulces Creaciones", "dulcescreaciones.vercel.app", "commerce landing", "dulcescreaciones"],
    ["DOM", "dom-two.vercel.app", "sports landing", "dom"],
  ];
  const deck = $(".deck");
  PROJ.forEach(([, url, , img]) => {
    const d = document.createElement("div"); d.className = "bw";
    d.innerHTML = `<div class="bw-bar"><i></i><i></i><i></i><span>${url}</span></div><img src="${PA}${img}.webp" alt="">`;
    deck.appendChild(d);
  });
  const wins = $$(".bw");
  const J0 = B(56), JSTEP = Sound.BEAT / 2;
  hide("#grido", J0); hide(".p-ai", J0); hide(".p-code", J0); show(".p-proj", J0);
  tl.call(() => hud.classList.add("dark"), null, J0);
  setSlug("// 08 — lo que construí", J0);
  wins.forEach((w, i) => {
    const at = J0 + i * JSTEP;
    tl.fromTo(w, { opacity: 0, x: 110, scale: .965 }, { opacity: 1, x: 0, scale: 1, duration: .3, ease: "expo.out", immediateRender: false }, at);
    if (i > 0) tl.to(wins[i - 1], { opacity: 0, x: -80, scale: .95, duration: .26, ease: "power2.in" }, at);
    tl.call(() => {
      $(".pj-n").textContent = String(i + 1).padStart(2, "0");
      $(".pj-name").textContent = PROJ[i][0]; $(".pj-tag").textContent = "// " + PROJ[i][2];
    }, null, at);
    snd(at, T => { Sound.sfx.click(T, .9); if (i % 2 === 0) Sound.sfx.whoosh(T - .05, .3, .35); });
  });
  // la cámara se aleja: el muro de ventanas
  const WALL = B(62), GW = 272, GH = 178, GX = 64, GY = 104, GAP = 16, SC = GW / 740;
  tl.to(".pj-count, .pj-name, .pj-tag", { opacity: 0, duration: .3 }, WALL);
  wins.forEach((w, i) => {
    const c = i % 4, r = Math.floor(i / 4);
    tl.to(w, { opacity: 1, x: GX + c * (GW + GAP) - 470, y: GY + r * (GH + GAP) - 118, scale: SC, duration: .7, ease: "expo.inOut" }, WALL + i * .015);
  });
  snd(WALL, T => Sound.sfx.whoosh(T, .7, .8));
  setSlug("// 08 — 12 proyectos · 10 online", WALL + .3);
  // el sello
  const ST = B(63);
  tl.fromTo(".stamp", { xPercent: -50, yPercent: -50, opacity: 0, scale: 2.8, rotation: -16 },
    { opacity: 1, scale: 1, rotation: -8, duration: .2, ease: "power4.in" }, ST - .2);
  tl.to(".deck", { filter: "brightness(.45)", duration: .1 }, ST);
  tl.to(".p-proj", { keyframes: [{ x: -12, y: 8 }, { x: 10, y: -6 }, { x: -5, y: 3 }, { x: 0, y: 0 }], duration: .3 }, ST);
  snd(ST, T => Sound.sfx.stamp(T, 1));
  tl.to(".stamp", { x: 440, y: -268, scale: .3, duration: .6, ease: "expo.inOut" }, B(64.5));
  tl.to(".deck", { filter: "brightness(.8)", duration: .6 }, B(64.5));

  // ================= 09 · EL GIRO =================
  const TW = B(66);
  hide(".p-proj", TW); show(".p-twist", TW);
  setSlug("// 09 — el giro", TW);
  snd(TW, T => Sound.sfx.room(T, 1.4, .8));
  reveal(".tw1 .m > span", TW + .3, 1);
  tl.to(".tw1 .m > span", { yPercent: -115, duration: .45, ease: "power3.in", stagger: .05 }, B(68) - .45);
  reveal(".tw2 .m > span", B(68), 1);
  snd(B(68), T => Sound.sfx.sub(T, .8));
  // libros
  const BOOKS = [
    ["Crimen y castigo", "DOSTOIEVSKI", "#5a2a27", 340, 72],
    ["Los hermanos Karamázov", "DOSTOIEVSKI", "#1f2b3d", 368, 86],
    ["El retrato de Dorian Gray", "WILDE", "#23392d", 330, 64],
    ["Romeo y Julieta", "SHAKESPEARE", "#6b2f3a", 290, 58],
    ["El Hobbit", "TOLKIEN", "#6b5427", 300, 68],
    ["The Catcher in the Rye", "SALINGER", "#a8452d", 312, 60],
    ["Fooled by Randomness", "TALEB", "#d9d3c3", 334, 64],
    ["AI Engineering", "HUYEN", "#0f1412", 350, 74],
  ];
  $(".books").innerHTML = BOOKS.map(([t, a, c, h, w]) => {
    const light = c === "#d9d3c3", ai = t === "AI Engineering";
    return `<div class="spine" style="height:${h}px;width:${w}px;background:${c};${light ? "color:#161614;" : ""}${ai ? "box-shadow:inset 0 0 0 2px #34d399;color:#34d399;" : ""}"><small>${a}</small>${t}</div>`;
  }).join("");
  const BK = B(71), rowW = BOOKS.reduce((a, b) => a + b[4] + 6, 0);
  tl.to(".tw2 .m > span", { yPercent: -115, duration: .45, ease: "power3.in", stagger: .05 }, BK - .45);
  tl.fromTo(".books", { x: 0 }, { x: -1280 + (1280 - rowW) / 2, duration: 1.1, ease: "expo.out" }, BK);
  tl.to(".books", { x: -1280 + (1280 - rowW) / 2 - 50, duration: B(75) - BK - 1.1, ease: "none" }, BK + 1.1);
  snd(BK - .1, T => Sound.sfx.whoosh(T, .6, .7));
  reveal(".cap-books .m > span", B(72), .9);
  // cine
  const FM = B(75);
  tl.to(".books", { x: "-=1500", duration: .45, ease: "power3.in" }, FM - .35);
  tl.to(".cap-books .m > span", { yPercent: -115, duration: .35, ease: "power3.in" }, FM - .35);
  const frames = ["01-city", "07-cinema", "05-rain", "06-read", "03-desk", "08-roof"];
  $(".film-track").innerHTML = [...frames, ...frames].map(f => `<img src="assets/film-${f}.jpg" alt="">`).join("");
  show(".film", FM);
  tl.fromTo(".film-track", { x: 900 }, { x: -2700, duration: B(79) - FM + .3, ease: "none" }, FM);
  tl.fromTo(".film", { scaleY: 0 }, { scaleY: 1, duration: .35, ease: "expo.out" }, FM);
  snd(FM, T => Sound.sfx.projector(T, B(79) - FM + .4, 1));
  reveal(".cap-film .m > span", B(76), .9);

  // ================= 10 · REMATE =================
  const PY = B(79);
  show("#payoff", PY);
  tl.fromTo("#payoff", { clipPath: "circle(0px at 640px 360px)" }, { clipPath: "circle(760px at 640px 360px)", duration: .6, ease: "power3.inOut", immediateRender: false }, PY);
  tl.call(() => hud.classList.remove("dark"), null, PY + .3);
  setSlug("// 10 — fin del rollo", PY + .3);
  snd(PY - .15, T => Sound.sfx.whoosh(T, .7, .9));
  const NAME = "Ignacio Palmeri";
  $(".py-name").innerHTML = [...NAME].map(c => c === " " ? '<span class="sp"></span>' : `<span class="ch">${c}</span>`).join("");
  const big = $(".avatar.big");
  gsap.set(big, { y: 380 });
  gsap.set(".py-sub", { opacity: 0, y: 12 });
  const NM = B(80);
  tl.fromTo(".py-name .ch", { yPercent: 130, opacity: 0, rotation: () => gsap.utils.random(-25, 25) },
    { yPercent: 0, opacity: 1, rotation: 0, duration: .8, ease: "expo.out", stagger: .035 }, NM);
  snd(NM, T => { Sound.sfx.stamp(T, .55); });
  tl.to(big, { y: 0, duration: .8, ease: "power3.out" }, B(81));
  snd(B(81), T => Sound.sfx.whoosh(T, .45, .35));
  tl.to(".py-sub", { opacity: 1, y: 0, duration: .6, ease: "power3.out" }, B(81.5));
  tl.call(() => { big.dataset.face = "smile"; }, null, B(82));
  tl.call(() => { big.dataset.face = "wink"; }, null, B(83));
  snd(B(83), T => Sound.sfx.click(T, 1.1));
  tl.call(() => { big.dataset.face = "smile"; }, null, B(84));

  // ================= PANTALLA FINAL (tipo YouTube) =================
  const ES = B(85), CD = 6;
  const TILES = PROJ.slice(0, 8);
  $(".es-grid").innerHTML = TILES.map(([n, url, , img]) => {
    const href = url.includes(".") ? `https://${url}` : "https://ignaciopalmeri.dev/#proyectos";
    return `<a class="tile" href="${href}" target="_blank" rel="noopener"><div class="th"><img src="${PA}${img}.webp" alt=""></div><b>${n}</b><span>${url}</span></a>`;
  }).join("");
  tl.to(big, { opacity: 0, y: -40, scale: .8, duration: .5, ease: "power2.in" }, ES);
  tl.to(".py-block", { y: -352, scale: .34, duration: .8, ease: "expo.inOut" }, ES);
  show(".es", ES + .2);
  tl.fromTo(".tile", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .6, ease: "power3.out", stagger: .05 }, ES + .25);
  tl.fromTo(".es-head, .es-bar", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6, ease: "power3.out", stagger: .1 }, ES + .5);
  snd(ES, T => Sound.sfx.whoosh(T, .5, .5));
  const cdStart = ES + .8;
  tl.fromTo(".es-ring circle", { strokeDashoffset: 0 }, { strokeDashoffset: 1, duration: CD - .6, ease: "none" }, cdStart);
  for (let i = 0; i < CD; i++) tl.call(() => { $(".es-n").textContent = String(CD - i); }, null, cdStart + i * (CD - .6) / CD);
  const END = ES + CD + .4;
  snd(END - .05, T => { Sound.sfx.thump(T, .5); Sound.sfx.click(T + .02, 1.2); }); // picaporte
  tl.set({}, {}, END);

  // canción: el pulso sostiene todo el montaje
  function scheduleMusic(T0) {
    Sound.song(T0 + B(0), [
      { i: 0, drums: "sparse", pad: true },
      { i: 1, drums: "sparse", pad: true, breakFrom: 12, roll: true },
      { i: 2, drums: "full", pad: true },
      { i: 3, drums: "full", pad: true },
    ]);
    Sound.song(T0 + W0, [
      { i: 0, drums: "full", pad: true, arp: true },            // 14.8 la ola
      { i: 1, drums: "full", pad: true, arp: true },
      { i: 2, drums: "full", pad: true, arp: true, breakFrom: 12 }, // el error
      { i: 3, drums: "full", pad: true, arp: true },
      { i: 0, drums: "full", pad: true, arp: true },            // 24.4 IA
      { i: 1, drums: "full", pad: true, arp: true },
      { i: 2, drums: "sparse", pad: true },                     // 29.2 el ticket
      { i: 3, drums: "full", pad: true, startFrom: 8 },         // 31.6 la diferencia
      { i: 0, drums: "full", pad: true, arp: true },            // 34.0 cuadra
      { i: 1, drums: "full", pad: true, arp: true },            // 36.4 proyectos
      { i: 2, drums: "full", pad: true, arp: true },
      { i: 3, drums: "full", pad: true, arp: true, breakFrom: 8 }, // 42.4 silencio
      { i: 0, drums: "sparse", pad: true },                     // 43.6 el giro
      { i: 1, drums: "sparse", pad: true },                     // 46.0 libros
      { i: 2, drums: "full", pad: true, arp: true, breakFrom: 12, roll: true }, // 48.4 cine
      { i: 0, drums: "full", pad: true, arp: true },            // 50.8 remate
      { i: 1, pad: true },                                      // 53.2 pantalla final
      { i: 2, pad: true },
      { i: 0, pad: true },
    ]);
    Sound.crash(T0 + B(80), .7);
    Sound.sfx.fadeMusic(T0 + END - 2.4, 2.6);
  }

  // ================= REPRODUCCIÓN =================
  let clock = null, done = false;
  const fmt = t => {
    const f = Math.floor(t * 24), ff = f % 24, s = Math.floor(t) % 60, m = Math.floor(t / 60);
    return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
  };
  // un solo reloj de cuadros (el ticker de GSAP) mueve la película y los tweens sueltos
  function loop() {
    const t = clock();
    if (t >= 0) { tl.time(Math.min(t, END)); tcEl.textContent = fmt(Math.min(t, END)); }
    if (t >= END) exit(false);
  }

  function start(withSound) {
    gsap.to("#gate", { opacity: 0, duration: .45, ease: "power2.out", onComplete: () => $("#gate").remove() });
    if (withSound) {
      const ctx = Sound.init();
      ctx.resume();
      const T0 = ctx.currentTime + .5;
      SND.forEach(([t, fn]) => fn(T0 + t));
      scheduleMusic(T0);
      clock = () => ctx.currentTime - T0;
    } else {
      $("#mute").textContent = "♪ off";
      const p0 = performance.now() + 500;
      clock = () => (performance.now() - p0) / 1000;
    }
    gsap.ticker.add(loop);
  }

  // salida: la ventana crece hasta ser la web y el desenfoque llega a 0
  function exit(fast) {
    if (done) return; done = true;
    gsap.ticker.remove(loop);
    Sound.stop(fast ? .3 : 1.2);
    try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    const d = fast ? .9 : 1.5;
    gsap.set(win, { height: win.offsetHeight, aspectRatio: "auto" });
    const x = gsap.timeline({ onComplete: () => {
      $("#intro").remove();
      if (window.parent !== window) window.parent.postMessage({ type: "portfolio:intro-exit" }, "*");
    } });
    x.to("#controls", { opacity: 0, duration: .2 }, 0)
     .to(stage, { opacity: 0, duration: d * .4, ease: "power2.in" }, 0)
     .to(win, { width: innerWidth, height: innerHeight, borderRadius: 0, duration: d, ease: "expo.inOut" }, fast ? 0 : .1)
     .to(win, { backgroundColor: "rgba(9,12,11,0)", boxShadow: "0 0 0 0 rgba(0,0,0,0), 0 0 0 0 rgba(255,255,255,0)", duration: d * .45, ease: "power2.inOut" }, d * .15)
     .to(site, { filter: "blur(0px) brightness(1) saturate(1)", scale: 1, duration: d, ease: "expo.inOut" }, fast ? 0 : .1);
  }

  // ---------- controles ----------
  $("#go").addEventListener("click", () => start(true));
  $("#go-mute").addEventListener("click", () => start(false));
  $("#skip").addEventListener("click", () => exit(true));
  addEventListener("keydown", e => { if (e.key === "Escape") exit(true); });
  $("#mute").addEventListener("click", e => {
    const m = !Sound.muted; Sound.setMuted(m);
    e.currentTarget.textContent = m ? "♪ off" : "♪ on"; e.currentTarget.setAttribute("aria-pressed", m);
  });
  $("#replay")?.addEventListener("click", () => location.reload());
  $(".es-cta")?.addEventListener("click", () => exit(false));
  $(".es-replay")?.addEventListener("click", () => location.reload());

  let seen = false; try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch (e) {}

  const params = new URLSearchParams(location.search);
  // ---------- modo render: cada cuadro se fija a mano y el audio se exporta offline ----------
  if (params.has("render")) {
    document.documentElement.classList.add("render");
    $("#gate").remove(); fit();
    window.__END = END;
    window.__seek = t => {
      tl.time(t); tcEl.textContent = fmt(t);
      document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
    };
    window.__renderAudio = async () => {
      const SR = 48000, dur = END + .5;
      const oc = new OfflineAudioContext(2, Math.ceil(SR * dur), SR);
      Sound.init(oc);
      SND.forEach(([t, fn]) => fn(t));
      scheduleMusic(0);
      const buf = await oc.startRendering();
      // WAV 16 bits estéreo
      const n = buf.length, L = buf.getChannelData(0), R = buf.getChannelData(1);
      const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab);
      const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt ");
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, SR, true);
      v.setUint32(28, SR * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
      for (let i = 0, o = 44; i < n; i++, o += 4) {
        v.setInt16(o, Math.max(-1, Math.min(1, L[i])) * 32767, true);
        v.setInt16(o + 2, Math.max(-1, Math.min(1, R[i])) * 32767, true);
      }
      const bytes = new Uint8Array(ab); let s = "";
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return btoa(s);
    };
  } else if (RESPECT_SEEN && seen) exit(true);

  // depuración: ?t=9 salta a un segundo concreto (sin sonido)
  const q = params.get("t");
  if (q != null && !params.has("render")) { $("#gate").remove(); tl.time(+q); tcEl.textContent = fmt(+q); }
  window.__tl = tl;
})();
