/* Zeka Küpleri - çözücü. 3x3: iki aşamalı (Kociemba tarzı). 2x2: köşe arama.
   Yüz sırası: U R F D L B. Her yüz 9 (3x3) ya da 4 (2x2) çıkartma, satır satır okunur (standart açılım).
   Dışa açılan: ZKSolver.solve3(facelets54) / solve2(facelets24) -> { moves:["R","U'",...] } ya da { error } */
(function (root) {
  "use strict";
  var FACES = "URFDLB";
  // Köşeler: URF UFL ULB UBR DFR DLF DBL DRB ; Kenarlar: UR UF UL UB DR DF DL DB FR FL BL BR
  var cornerFacelet = [[8, 9, 20], [6, 18, 38], [0, 36, 47], [2, 45, 11], [29, 26, 15], [27, 44, 24], [33, 53, 42], [35, 17, 51]];
  var cornerColor = [[0, 1, 2], [0, 2, 4], [0, 4, 5], [0, 5, 1], [3, 2, 1], [3, 4, 2], [3, 5, 4], [3, 1, 5]];
  var edgeFacelet = [[5, 10], [7, 19], [3, 37], [1, 46], [32, 16], [28, 25], [30, 43], [34, 52], [23, 12], [21, 41], [50, 39], [48, 14]];
  var edgeColor = [[0, 1], [0, 2], [0, 4], [0, 5], [3, 1], [3, 2], [3, 4], [3, 5], [2, 1], [2, 4], [5, 4], [5, 1]];

  var MV = [
    { cp: [3, 0, 1, 2, 4, 5, 6, 7], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { cp: [4, 1, 2, 0, 7, 5, 6, 3], co: [2, 0, 0, 1, 1, 0, 0, 2], ep: [8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { cp: [1, 5, 2, 3, 0, 4, 6, 7], co: [1, 2, 0, 0, 2, 1, 0, 0], ep: [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11], eo: [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0] },
    { cp: [0, 1, 2, 3, 5, 6, 7, 4], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { cp: [0, 2, 6, 3, 4, 1, 5, 7], co: [0, 1, 2, 0, 0, 2, 1, 0], ep: [0, 1, 10, 3, 4, 5, 9, 7, 8, 2, 6, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { cp: [0, 1, 3, 7, 4, 5, 2, 6], co: [0, 0, 1, 2, 0, 0, 2, 1], ep: [0, 1, 2, 11, 4, 5, 6, 10, 8, 9, 3, 7], eo: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1] }
  ];
  // MV[f] yukarıdaki tablolar; ep[i] = i. konuma gelen parçanın eski konumu YERİNE
  // "i. konumdaki parça j'den gelir" biçiminde (hkociemba ile aynı).

  function ident() { return { cp: [0, 1, 2, 3, 4, 5, 6, 7], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }; }
  function mul(a, b) { // önce a, sonra b
    var r = ident(), i;
    for (i = 0; i < 8; i++) { r.cp[i] = a.cp[b.cp[i]]; r.co[i] = (a.co[b.cp[i]] + b.co[i]) % 3; }
    for (i = 0; i < 12; i++) { r.ep[i] = a.ep[b.ep[i]]; r.eo[i] = (a.eo[b.ep[i]] + b.eo[i]) % 2; }
    return r;
  }
  var MOVES = []; // 18 hamle: 3*f + (kuvvet-1)
  (function () {
    for (var f = 0; f < 6; f++) {
      var m = MV[f], p = m;
      MOVES.push(p); p = mul(p, m); MOVES.push(p); p = mul(p, m); MOVES.push(p);
    }
  })();
  var MNAME = [];
  for (var f0 = 0; f0 < 6; f0++) MNAME.push(FACES[f0], FACES[f0] + "2", FACES[f0] + "'");

  /* ---- Yüz dizisinden parça durumuna ---- */
  function fromFacelets(s) { // s: 54 elemanlı, her biri 0..5 (yüz indeksi)
    var c = ident(), i, j, k, ori;
    for (i = 0; i < 8; i++) {
      var fl = cornerFacelet[i];
      for (ori = 0; ori < 3; ori++) if (s[fl[ori]] === 0 || s[fl[ori]] === 3) break;
      var c1 = s[fl[(ori + 1) % 3]], c2 = s[fl[(ori + 2) % 3]], found = false;
      for (j = 0; j < 8; j++) {
        if (c1 === cornerColor[j][1] && c2 === cornerColor[j][2]) { c.cp[i] = j; c.co[i] = ori % 3; found = true; break; }
      }
      if (!found) return null;
    }
    for (i = 0; i < 12; i++) {
      var found2 = false;
      for (j = 0; j < 12; j++) {
        if (s[edgeFacelet[i][0]] === edgeColor[j][0] && s[edgeFacelet[i][1]] === edgeColor[j][1]) { c.ep[i] = j; c.eo[i] = 0; found2 = true; break; }
        if (s[edgeFacelet[i][0]] === edgeColor[j][1] && s[edgeFacelet[i][1]] === edgeColor[j][0]) { c.ep[i] = j; c.eo[i] = 1; found2 = true; break; }
      }
      if (!found2) return null;
    }
    return c;
  }
  function parity(p) { var n = 0, i, j; for (i = 0; i < p.length; i++) for (j = i + 1; j < p.length; j++) if (p[i] > p[j]) n++; return n & 1; }
  function verify(c) {
    var i, seen = [], t = 0, fl = 0;
    for (i = 0; i < 8; i++) { if (seen[c.cp[i]]) return "Köşe parçaları tutarsız: aynı köşe iki kez var."; seen[c.cp[i]] = 1; t += c.co[i]; }
    if (t % 3) return "Bir köşe parçası bükülmüş görünüyor (renkleri kontrol et).";
    seen = [];
    for (i = 0; i < 12; i++) { if (seen[c.ep[i]]) return "Kenar parçaları tutarsız: aynı kenar iki kez var."; seen[c.ep[i]] = 1; fl += c.eo[i]; }
    if (fl % 2) return "Bir kenar parçası ters çevrilmiş görünüyor (renkleri kontrol et).";
    if (parity(c.cp) !== parity(c.ep)) return "İki parça yer değiştirmiş görünüyor (renkleri kontrol et).";
    return null;
  }

  /* ---- Koordinatlar ---- */
  var FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320];
  function binom(n, k) { if (k < 0 || k > n) return 0; var r = 1, i; for (i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  var CB = []; (function () { for (var n = 0; n <= 12; n++) { CB[n] = []; for (var k = 0; k <= 5; k++) CB[n][k] = binom(n, k); } })();

  function getTwist(c) { var a = 0, i; for (i = 0; i < 7; i++) a = 3 * a + c.co[i]; return a; }
  function setTwist(c, a) { var s = 0, i; for (i = 6; i >= 0; i--) { c.co[i] = a % 3; s += c.co[i]; a = (a / 3) | 0; } c.co[7] = (3 - s % 3) % 3; }
  function getFlip(c) { var a = 0, i; for (i = 0; i < 11; i++) a = 2 * a + c.eo[i]; return a; }
  function setFlip(c, a) { var s = 0, i; for (i = 10; i >= 0; i--) { c.eo[i] = a & 1; s += c.eo[i]; a >>= 1; } c.eo[11] = s & 1; }
  function permRank(p, n) { var a = 0, i, j; for (i = 0; i < n; i++) { var s = 0; for (j = i + 1; j < n; j++) if (p[j] < p[i]) s++; a += s * FACT[n - 1 - i]; } return a; }
  function permUnrank(a, n, out) {
    var avail = [], i, j; for (i = 0; i < n; i++) avail.push(i);
    for (i = 0; i < n; i++) { var d = (a / FACT[n - 1 - i]) | 0; a -= d * FACT[n - 1 - i]; out[i] = avail.splice(d, 1)[0]; }
  }
  // Dilim kenarları (FR FL BL BR = 8..11): konum kümesi + sıra
  function getSlice(c) {
    var a = 0, x = 0, j, order = [];
    for (j = 11; j >= 0; j--) if (c.ep[j] >= 8) { a += CB[11 - j][x + 1]; x++; }
    for (j = 0; j < 12; j++) if (c.ep[j] >= 8) order.push(c.ep[j] - 8);
    return a * 24 + permRank(order, 4);
  }
  function setSlice(c, v) {
    var comb = (v / 24) | 0, pr = v % 24, order = [], i, j, r = 4, pos = [], other = [];
    permUnrank(pr, 4, order);
    for (j = 0; j < 12; j++) { var t = CB[11 - j][r]; if (r > 0 && comb >= t) { comb -= t; pos.push(j); r--; } }
    var oi = 0, ni = 0, isS = {}; for (i = 0; i < pos.length; i++) isS[pos[i]] = 1;
    for (j = 0; j < 12; j++) if (!isS[j]) c.ep[j] = ni++; // 0..7 sırayla
    for (i = 0; i < 4; i++) c.ep[pos[i]] = 8 + order[oi++];
  }
  function getCP(c) { return permRank(c.cp, 8); }
  function setCP(c, a) { permUnrank(a, 8, c.cp); }
  function getEP(c) { return permRank(c.ep.slice(0, 8), 8); } // yalnızca 2. aşamada geçerli
  function setEP(c, a) { var t = []; permUnrank(a, 8, t); for (var i = 0; i < 8; i++) c.ep[i] = t[i]; }

  /* ---- Tablolar ---- */
  var T = null;
  var P2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].filter(function (m) { var f = (m / 3) | 0; return f === 0 || f === 3 || m % 3 === 1; });

  function bfsTable(size, startIdx, nMoves, movesList, step) {
    var t = new Int8Array(size).fill(-1), cur = [startIdx], d = 0, i, k;
    t[startIdx] = 0;
    while (cur.length) {
      var nx = []; d++;
      for (i = 0; i < cur.length; i++) for (k = 0; k < movesList.length; k++) {
        var n2 = step(cur[i], movesList[k]);
        if (t[n2] < 0) { t[n2] = d; nx.push(n2); }
      }
      cur = nx;
    }
    return t;
  }

  function build() {
    if (T) return;
    var i, m, c;
    var all = []; for (m = 0; m < 18; m++) all.push(m);
    T = { twist: new Uint16Array(2187 * 18), flip: new Uint16Array(2048 * 18), slice: new Uint16Array(11880 * 18), cp: new Uint16Array(40320 * 18), ep: new Uint16Array(40320 * 18) };
    for (i = 0; i < 2187; i++) { c = ident(); setTwist(c, i); for (m = 0; m < 18; m++) T.twist[i * 18 + m] = getTwist(mul(c, MOVES[m])); }
    for (i = 0; i < 2048; i++) { c = ident(); setFlip(c, i); for (m = 0; m < 18; m++) T.flip[i * 18 + m] = getFlip(mul(c, MOVES[m])); }
    for (i = 0; i < 11880; i++) { c = ident(); setSlice(c, i); for (m = 0; m < 18; m++) T.slice[i * 18 + m] = getSlice(mul(c, MOVES[m])); }
    for (i = 0; i < 40320; i++) {
      c = ident(); setCP(c, i); var c2 = ident(); setEP(c2, i);
      for (var q = 0; q < P2.length; q++) { m = P2[q]; T.cp[i * 18 + m] = getCP(mul(c, MOVES[m])); T.ep[i * 18 + m] = getEP(mul(c2, MOVES[m])); }
    }
    var p1 = all;
    T.pTS = bfsTable(2187 * 495, 0, 18, p1, function (s, m) { var tw = (s / 495) | 0, sl = s % 495; return T.twist[tw * 18 + m] * 495 + ((T.slice[(sl * 24) * 18 + m] / 24) | 0); });
    T.pFS = bfsTable(2048 * 495, 0, 18, p1, function (s, m) { var fl = (s / 495) | 0, sl = s % 495; return T.flip[fl * 18 + m] * 495 + ((T.slice[(sl * 24) * 18 + m] / 24) | 0); });
    T.pCS = bfsTable(40320 * 24, 0, 10, P2, function (s, m) { var a = (s / 24) | 0, b = s % 24; return T.cp[a * 18 + m] * 24 + T.slice[b * 18 + m]; });
    T.pES = bfsTable(40320 * 24, 0, 10, P2, function (s, m) { var a = (s / 24) | 0, b = s % 24; return T.ep[a * 18 + m] * 24 + T.slice[b * 18 + m]; });
  }

  /* ---- Arama ---- */
  function search(c, maxLen, deadline) {
    build();
    var tw = getTwist(c), fl = getFlip(c), sl = getSlice(c), cp = getCP(c);
    var ep8 = null, path = [], sol = null;
    function ep8of() { return null; }
    var cc = c;
    // 2. aşama
    function dfs2(cpv, epv, spv, depth, last, limit) {
      var h = Math.max(T.pCS[cpv * 24 + spv], T.pES[epv * 24 + spv]);
      if (h === 0) return true;
      if (depth + h > limit) return false;
      for (var q = 0; q < P2.length; q++) {
        var m = P2[q], f = (m / 3) | 0;
        if (last >= 0 && (((last / 3) | 0) === f || (((last / 3) | 0) === ((f + 3) % 6) && f < 3))) continue;
        path.push(m);
        if (dfs2(T.cp[cpv * 18 + m], T.ep[epv * 18 + m], T.slice[spv * 18 + m], depth + 1, m, limit)) return true;
        path.pop();
      }
      return false;
    }
    function phase2(cpv, epv, spv, last, limit) {
      for (var l = 0; l <= limit; l++) { if (dfs2(cpv, epv, spv, 0, last, l)) return true; if (Date.now() > deadline) return false; }
      return false;
    }
    // 1. aşama
    var calls = 0;
    function dfs1(twv, flv, slv, depth, last, limit, c0) {
      var h = Math.max(T.pTS[twv * 495 + ((slv / 24) | 0)], T.pFS[flv * 495 + ((slv / 24) | 0)]);
      if (h === 0 && depth === limit) {
        if (last >= 0) { var lf = (last / 3) | 0; if (lf === 0 || lf === 3 || last % 3 === 1) return false; }
        // 2. aşama koordinatları
        var cc2 = c0;
        var cpv = getCP(cc2), spv = getSlice(cc2);
        if (spv >= 24) return false;
        var epv = getEP(cc2);
        var save = path.length;
        if (phase2(cpv, epv, spv, last, maxLen - depth)) { sol = path.slice(); return true; }
        path.length = save;
        return false;
      }
      if (depth + h > limit) return false;
      if (((++calls) & 0xffff) === 0 && Date.now() > deadline) return false;
      for (var m = 0; m < 18; m++) {
        var f = (m / 3) | 0;
        if (last >= 0 && (((last / 3) | 0) === f || (((last / 3) | 0) === ((f + 3) % 6) && f < 3))) continue;
        path.push(m);
        if (dfs1(T.twist[twv * 18 + m], T.flip[flv * 18 + m], T.slice[slv * 18 + m], depth + 1, m, limit, mul(c0, MOVES[m]))) return true;
        path.pop();
      }
      return false;
    }
    for (var lim = 0; lim <= 12; lim++) {
      path = [];
      if (dfs1(tw, fl, sl, 0, -1, lim, cc)) return sol;
      if (Date.now() > deadline) break;
    }
    return null;
  }

  function simplify(ms) { return ms.map(function (m) { return MNAME[m]; }); }

  /* ---- Dışa açılan: 3x3 ---- */
  function solve3(fl) {
    // fl: 54 uzunlukta yüz indeksleri (0..5) — merkezlere göre dönüştürülmüş
    var cnt = [0, 0, 0, 0, 0, 0], i;
    for (i = 0; i < 54; i++) cnt[fl[i]]++;
    for (i = 0; i < 6; i++) if (cnt[i] !== 9) return { error: "Her renkten tam 9 çıkartma olmalı." };
    var c = fromFacelets(fl);
    if (!c) return { error: "Bu renk dizilimi gerçek bir küpte olamaz (parçalar uyuşmuyor). Renkleri kontrol et." };
    var er = verify(c);
    if (er) return { error: er };
    var solved = true; for (i = 0; i < 8; i++) if (c.cp[i] !== i || c.co[i]) solved = false; for (i = 0; i < 12; i++) if (c.ep[i] !== i || c.eo[i]) solved = false;
    if (solved) return { moves: [] };
    var sol = search(c, 24, Date.now() + 8000);
    if (!sol) sol = search(c, 30, Date.now() + 12000);
    if (!sol) return { error: "Çözüm bulunamadı. Renkleri kontrol edip tekrar dene." };
    return { moves: simplify(sol) };
  }

  /* ---- 2x2 ---- */
  // fl24: 6 yüz × 4 (U R F D L B), her biri 0..5 yüz indeksi (DBL köşesine göre normalize edilmiş)
  var F2 = { 0: [0, 1, 2, 3], 1: [4, 5, 6, 7], 2: [8, 9, 10, 11], 3: [12, 13, 14, 15], 4: [16, 17, 18, 19], 5: [20, 21, 22, 23] };
  function fl24to54(a) { // 2x2'yi 3x3 çıkartma dizisine koy (kenar/merkez çözülmüş)
    var s = [], f, k;
    for (f = 0; f < 6; f++) for (k = 0; k < 9; k++) s[f * 9 + k] = f;
    // 2x2 çıkartma (r,c) -> 3x3 köşe konumu: (0,0)->0, (0,1)->2, (1,0)->6, (1,1)->8
    var map = [0, 2, 6, 8];
    for (f = 0; f < 6; f++) for (k = 0; k < 4; k++) s[f * 9 + map[k]] = a[f * 4 + k];
    return s;
  }
  function solve2(a24) {
    var cnt = [0, 0, 0, 0, 0, 0], i;
    for (i = 0; i < 24; i++) cnt[a24[i]]++;
    for (i = 0; i < 6; i++) if (cnt[i] !== 4) return { error: "Her renkten tam 4 çıkartma olmalı." };
    var c = fromFacelets(fl24to54(a24));
    if (!c) return { error: "Bu renk dizilimi gerçek bir 2×2'de olamaz. Renkleri kontrol et." };
    var t = 0; for (i = 0; i < 8; i++) t += c.co[i];
    if (t % 3) return { error: "Bir köşe bükülmüş görünüyor (renkleri kontrol et)." };
    // DBL (6) sabit olmalı: normalize ettik, yoksa hata
    if (c.cp[6] !== 6 || c.co[6] !== 0) return { error: "Renk dizilimi tutarsız: alt-sol-arka köşe referans olmalı." };
    // IDA*: U, R, F hamleleri (indeksler 0..2, 3..5, 6..8)
    var mv = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    var ori = 0, pm = [], k = 0;
    var idx = [0, 1, 2, 3, 4, 5, 7]; // DBL dışındakiler
    function key(cc) { var o = 0; for (var q = 0; q < 8; q++) if (q !== 6) o = o * 3 + cc.co[q]; return o; }
    function pkey(cc) { var p = []; for (var q = 0; q < 8; q++) if (q !== 6) p.push(cc.cp[q] > 6 ? cc.cp[q] - 1 : cc.cp[q]); return permRank(p, 7); }
    function decP(r) { var p = []; permUnrank(r, 7, p); var cc = ident(); var j = 0; for (var q = 0; q < 8; q++) if (q !== 6) { cc.cp[q] = p[j] >= 6 ? p[j] + 1 : p[j]; j++; } return cc; }
    // Basit: koordinatları durum üzerinden BFS ile (ayrı iki tablo)
    function tabO() {
      var t = {}, cur = [ident()], d = 0; t[key(cur[0])] = 0;
      while (cur.length) { var nx = []; d++; cur.forEach(function (s) { mv.forEach(function (m) { var n = mul(s, MOVES[m]); var kk = key(n); if (t[kk] === undefined) { t[kk] = d; nx.push(n); } }); }); cur = nx; }
      return t;
    }
    function tabP() {
      var t = {}, cur = [ident()], d = 0; t[pkey(cur[0])] = 0;
      while (cur.length) { var nx = []; d++; cur.forEach(function (s) { mv.forEach(function (m) { var n = mul(s, MOVES[m]); var kk = pkey(n); if (t[kk] === undefined) { t[kk] = d; nx.push(n); } }); }); cur = nx; }
      return t;
    }
    var TO = tabO(), TP = tabP(), path = [], deadline = Date.now() + 8000;
    function dfs(s, depth, limit, last) {
      var h = Math.max(TO[key(s)], TP[pkey(s)]);
      if (h === 0) return true;
      if (depth + h > limit || Date.now() > deadline) return false;
      for (var q = 0; q < mv.length; q++) {
        var m = mv[q], f = (m / 3) | 0;
        if (last >= 0 && f === ((last / 3) | 0)) continue;
        path.push(m);
        if (dfs(mul(s, MOVES[m]), depth + 1, limit, m)) return true;
        path.pop();
      }
      return false;
    }
    for (var lim = 0; lim <= 14; lim++) { path = []; if (dfs(c, 0, lim, -1)) return { moves: simplify(path) }; }
    return { error: "Çözüm bulunamadı. Renkleri kontrol et." };
  }

  /* ---- Yardımcılar: hamle dizisi ---- */
  function invert(moves) {
    return moves.slice().reverse().map(function (m) { return m.length === 1 ? m + "'" : m[1] === "2" ? m : m[0]; });
  }
  root.ZKSolver = { solve3: solve3, solve2: solve2, invert: invert, prepare: build, _mul: mul, _MOVES: MOVES, _fromFacelets: fromFacelets, MNAME: MNAME };
})(typeof window !== "undefined" ? window : globalThis);
