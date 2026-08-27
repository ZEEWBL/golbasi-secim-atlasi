(function () {
  "use strict";

  const DATA = window.ATLAS;
  if (!DATA) {
    document.getElementById("app").innerHTML =
      '<div class="wrap"><div class="err-box">Veri yüklenemedi. <code>assets/data.js</code> dosyası aynı klasörde olmalı.</div></div>';
    return;
  }

  const NF = new Intl.NumberFormat("tr-TR");
  const N1 = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const N2 = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const RACES = [
    { id: "2019_ilce_baskan", yil: 2019, kisa: "2019 İlçe", uzun: "2019 İlçe Belediye Başkanlığı", tur: "aday" },
    { id: "2023_milletvekili", yil: 2023, kisa: "2023 MV", uzun: "2023 Milletvekili Genel Seçimi", tur: "parti" },
    { id: "2023_cb1", yil: 2023, kisa: "2023 CB 1. tur", uzun: "2023 Cumhurbaşkanlığı 1. tur", tur: "aday" },
    { id: "2023_cb2", yil: 2023, kisa: "2023 CB 2. tur", uzun: "2023 Cumhurbaşkanlığı 2. tur", tur: "aday" },
    { id: "2024_ilce_baskan", yil: 2024, kisa: "2024 İlçe", uzun: "2024 İlçe Belediye Başkanlığı", tur: "aday" },
    { id: "2024_meclis", yil: 2024, kisa: "2024 Meclis", uzun: "2024 İlçe Belediye Meclisi", tur: "parti" },
    { id: "2024_buyuksehir", yil: 2024, kisa: "2024 Büyükşehir", uzun: "2024 Ankara Büyükşehir Belediye Başkanlığı — Gölbaşı", tur: "aday" }
  ];
  const RACE_MAP = Object.fromEntries(RACES.map((r) => [r.id, r]));

  const CAND_PARTY = {
    "Recep Tayyip Erdoğan": "AK Parti",
    "Kemal Kılıçdaroğlu": "CHP",
    "Sinan Oğan": "ATA",
    "Muharrem İnce": "Memleket"
  };

  const MUTED = "#8a8478";
  const COLOR_RULES = [
    [/cumhuriyet halk|^chp$/, "#E30A17"],
    [/adalet ve kalkinma|^ak$/, "#F7941D"],
    [/milliyetci hareket|^mhp$/, "#870000"],
    [/^iyi$/, "#00B0F0"],
    [/yesil sol|^dem$|^ysp$|halklarin esitlik/, "#5E2A84"],
    [/buyuk birlik|^bbp$/, "#6B0000"],
    [/yeniden refah/, "#F15A22"],
    [/^zafer$/, "#C8102E"],
    [/^saadet$/, "#F5A623"],
    [/^tip$|turkiye isci/, "#9B1B30"],
    [/^deva$/, "#00A19A"],
    [/memleket/, "#5B8C5A"],
    [/^dsp$/, "#0033A0"],
    [/^dp$|demokrat parti/, "#6e1f2c"],
    [/vatan/, "#7A1F1F"],
    [/^btp$/, "#2E5A88"],
    [/^tkp$/, "#C41E3A"],
    [/^tkh$/, "#7B1113"],
    [/^sol$/, "#B71C1C"],
    [/^emep$/, "#C41E3A"],
    [/huda/, "#2D5A27"],
    [/^ata$/, "#1B365D"],
    [/bagimsiz/, "#5c574e"],
    [/millet ittifaki|^millet$/, "#E30A17"],
    [/hak.?par/, "#2f5d3a"],
    [/gencparti/, "#3d6b8a"],
    [/^anap$/, "#C45C26"],
    [/^hkp$/, "#8B1E1E"],
    [/milli yol/, "#6B3FA0"],
    [/^gbp$|^ab$|^ap$|^ocak$|^ytp$|^yol$|^emep$/, MUTED]
  ];

  function foldTR(s) {
    return String(s || "")
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ç/g, "c")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/â/g, "a")
      .replace(/î/g, "i")
      .replace(/û/g, "u");
  }
  function partyKey(name) {
    return foldTR(name)
      .replace(/partisi/g, "parti")
      .replace(/\bparti\b/g, "")
      .replace(/belediye|baskanligi|baskan/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function partyColor(name) {
    const k = partyKey(name);
    if (!k) return MUTED;
    for (const [re, c] of COLOR_RULES) if (re.test(k)) return c;
    return MUTED;
  }
  function hasFold(s, needle) {
    return foldTR(s).includes(foldTR(needle));
  }
  function findAd(list, needle) {
    return list.findIndex((a) => hasFold(a.ad || a.parti || a, needle));
  }
  function partyShort(name) {
    if (!name) return "";
    const k = partyKey(name);
    const map = {
      chp: "CHP",
      ak: "AK Parti",
      mhp: "MHP",
      "milliyetci hareket": "MHP",
      iyi: "İYİ",
      dem: "DEM",
      "yesil sol": "YSP",
      ysp: "YSP",
      bbp: "BBP",
      "buyuk birlik": "BBP",
      "yeniden refah": "YRP",
      zafer: "Zafer",
      saadet: "Saadet"
    };
    return map[k] || name.replace(/ PARTİSİ$/i, "").replace(/ PARTİ$/i, "").replace(/ Parti$/i, "");
  }

  const LOGO_BY_KEY = {
    chp: "chp.svg",
    ak: "ak-parti.png",
    mhp: "mhp.svg",
    "milliyetci hareket": "mhp.svg",
    iyi: "iyi.png",
    dem: "dem.png",
    "yesil sol": "dem.png",
    ysp: "dem.png",
    "halklarin esitlik": "dem.png",
    bbp: "bbp.png",
    "buyuk birlik": "bbp.png",
    "yeniden refah": "yrp.png",
    zafer: "zafer.png",
    saadet: "saadet.png",
    tip: "tip.png",
    "turkiye isci": "tip.png",
    deva: "deva.svg",
    memleket: "memleket.png",
    dsp: "dsp.png",
    dp: "dp.png",
    demokrat: "dp.png",
    vatan: "vatan.png",
    btp: "btp.png",
    tkp: "tkp.png",
    huda: "huda-par.png",
    "huda par": "huda-par.png"
  };
  const PORTRAIT_BY_FOLD = {
    "mansur yavas": "mansur-yavas.jpg",
    "turgut altinok": "turgut-altinok.jpg",
    "recep tayyip erdogan": "recep-tayyip-erdogan.jpg",
    "kemal kilicdaroglu": "kemal-kilicdaroglu.jpg",
    "sinan ogan": "sinan-ogan.jpg",
    "muharrem ince": "muharrem-ince.jpg"
  };

  function initialsOf(s) {
    const t = displayName(s).trim();
    if (!t) return "?";
    if (t.length <= 3 && !/\s/.test(t)) return t.toLocaleUpperCase("tr-TR");
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
    return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("tr-TR");
  }
  function logoFile(party) {
    const k = partyKey(party);
    if (!k) return null;
    if (LOGO_BY_KEY[k]) return LOGO_BY_KEY[k];
    for (const [key, file] of Object.entries(LOGO_BY_KEY)) {
      if (k === key || k.startsWith(key + " ") || k.endsWith(" " + key) || k.includes(" " + key + " ")) return file;
    }
    return null;
  }
  function portraitFile(name) {
    return PORTRAIT_BY_FOLD[foldTR(displayName(name))] || null;
  }
  function iniSpan(text, color, extraCls) {
    return `<span class="ini${extraCls ? " " + extraCls : ""}" style="background:${color || MUTED}" aria-hidden="true">${esc(text)}</span>`;
  }
  function mediaWithFallback(imgClass, src, alt, ini, color, iniCls) {
    return `<span class="media-wrap"><img class="${imgClass}" src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.removeAttribute('hidden')">${iniSpan(ini, color, iniCls).replace("<span ", "<span hidden ")}</span>`;
  }
  function logoMark(party, cls) {
    const file = logoFile(party);
    const col = partyColor(party);
    const alt = partyShort(party) || displayName(party) || "parti";
    const ini = initialsOf(alt);
    const imgCls = "logo-img" + (cls ? " " + cls : "");
    if (!file) return iniSpan(ini, col, cls);
    return mediaWithFallback(imgCls, "./assets/logos/" + file, alt, ini, col, cls);
  }
  function portraitMark(name, party, cls) {
    const file = portraitFile(name);
    const col = partyColor(party || name);
    const alt = displayName(name);
    const ini = initialsOf(alt);
    const imgCls = "portrait" + (cls ? " " + cls : "");
    if (!file) return iniSpan(ini, col, "portrait-ini" + (cls ? " " + cls : ""));
    return mediaWithFallback(imgCls, "./assets/portraits/" + file, alt, ini, col, "portrait-ini" + (cls ? " " + cls : ""));
  }
  function contestantMark(c, cls) {
    if (c && !c.isParti) return portraitMark(c.ad || c.label, c.parti, cls);
    return logoMark((c && (c.parti || c.ad)) || "", cls);
  }
  function winnerMarks(w) {
    if (!w) return "";
    if (w.tie && w.tied && w.tied.length) {
      return w.tied.map((t) => contestantMark(t, "sm")).join("");
    }
    if (w.tie) return logoMark(w.partiRaw || w.parti, "sm");
    const isPerson = w.label && w.parti && foldTR(w.label) !== foldTR(w.parti) && foldTR(w.label) !== foldTR(w.partiRaw || "");
    if (isPerson) return portraitMark(w.label, w.partiRaw || w.parti, "sm");
    return logoMark(w.partiRaw || w.parti || w.label, "sm");
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }
  function fmt(n) {
    if (n == null || n === "") return "—";
    return NF.format(n);
  }
  function pct(n, d) {
    if (!d) return "—";
    return "%" + N2.format((100 * n) / d);
  }
  function pct1(n, d) {
    if (!d) return "—";
    return "%" + N1.format((100 * n) / d);
  }
  function isAllCaps(s) {
    const t = String(s || "");
    return t === t.toLocaleUpperCase("tr-TR") && t !== t.toLocaleLowerCase("tr-TR");
  }
  function titleTR(s) {
    const lower = String(s || "")
      .replace(/İ/g, "i")
      .replace(/I/g, "ı")
      .toLocaleLowerCase("tr-TR");
    return lower.replace(/(^|[\s/\-'])(\S)/g, (m, a, b) => a + b.toLocaleUpperCase("tr-TR"));
  }
  function displayName(s) {
    if (!s) return "";
    return isAllCaps(s) ? titleTR(s) : s;
  }
  function deltaCls(n) {
    if (n > 0) return "delta up";
    if (n < 0) return "delta down";
    return "delta";
  }
  function deltaTxt(n) {
    if (n == null) return "—";
    const sign = n > 0 ? "+" : "";
    return sign + fmt(n);
  }

  function contestants(race) {
    if (race.adaylar) {
      return race.adaylar.map((a) => {
        const parti = a.parti || CAND_PARTY[a.ad] || "";
        return { ad: a.ad, parti, label: displayName(a.ad), isParti: false };
      });
    }
    return (race.partiler || []).map((p) => {
      const name = typeof p === "string" ? p : p.parti;
      return { ad: name, parti: name, label: name, isParti: true };
    });
  }

  function ensureIlceOylar(race) {
    const n = contestants(race).length;
    const raw = race.ilce.oylar || [];
    const empty = !raw.length || raw.every((x) => !x);
    if (!empty && raw.length === n) return raw;
    const sum = Array(n).fill(0);
    for (const m of race.mahalleler) {
      (m.oylar || []).forEach((o, i) => {
        if (i < n) sum[i] += o || 0;
      });
    }
    race.ilce.oylar = sum;
    race.ilce._oylarKaynak = "mahalle_toplami";
    return sum;
  }

  function winnerFromRow(race, row) {
    const cs = contestants(race);
    const k = row.kazanan || {};
    if (k.beraberlik && k.beraberlik.length) {
      const names = k.beraberlik.map(displayName);
      const tied = cs.filter((c) => k.beraberlik.some((b) => foldTR(b) === foldTR(c.ad)));
      return {
        tie: true,
        label: names.join(" / "),
        parti: tied.map((t) => partyShort(t.parti)).join(" / "),
        partiRaw: tied.map((t) => t.parti).join(" / "),
        oy: k.oy,
        color: "#9a7433",
        tied
      };
    }
    const ad = k.ad || k.parti || "";
    let parti = k.parti || "";
    const match = cs.find((c) => foldTR(c.ad) === foldTR(ad) || foldTR(c.parti) === foldTR(ad));
    if (match) {
      if (!parti) parti = match.parti;
      return {
        tie: false,
        label: match.isParti ? match.label : displayName(match.ad),
        parti: partyShort(match.parti || parti),
        partiRaw: match.parti || parti,
        oy: k.oy,
        color: partyColor(match.parti || parti)
      };
    }
    if (!parti && CAND_PARTY[ad]) parti = CAND_PARTY[ad];
    return {
      tie: false,
      label: displayName(ad),
      parti: partyShort(parti),
      partiRaw: parti,
      oy: k.oy,
      color: partyColor(parti || ad)
    };
  }

  function katilim(row) {
    if (!row || !row.secmen) return null;
    return (100 * (row.kullanan || 0)) / row.secmen;
  }

  function mahalleById(id) {
    return DATA.mahalleler.find((m) => String(m.id) === String(id));
  }
  function raceRow(race, id) {
    return race.mahalleler.find((m) => String(m.id) === String(id));
  }

  function rankedVotes(race, oylar, gecerli) {
    const cs = contestants(race);
    return cs
      .map((c, i) => ({ ...c, oy: oylar[i] || 0, i }))
      .sort((a, b) => b.oy - a.oy)
      .map((c) => ({ ...c, pay: gecerli ? c.oy / gecerli : 0 }));
  }

  /* ---------- checksums ---------- */
  function runChecksums() {
    const y2019 = DATA.yarislar["2019_ilce_baskan"];
    const mv = DATA.yarislar["2023_milletvekili"];
    const cb1 = DATA.yarislar["2023_cb1"];
    const cb2 = DATA.yarislar["2023_cb2"];
    const ilce = DATA.yarislar["2024_ilce_baskan"];
    const meclis = DATA.yarislar["2024_meclis"];
    const bb = DATA.yarislar["2024_buyuksehir"];
    const o2019 = ensureIlceOylar(y2019);
    const oIlce = ensureIlceOylar(ilce);
    const oMeclis = ensureIlceOylar(meclis);
    const oBb = ensureIlceOylar(bb);
    const oCb1 = ensureIlceOylar(cb1);
    const oCb2 = ensureIlceOylar(cb2);

    const adnks = (year) => DATA.mahalleler.reduce((s, m) => s + (m.adnks[year] || 0), 0);
    const koparan = ilce.mahalleler.find((m) => m.m === "KOPARAN");
    const kocakI = findAd(ilce.adaylar, "kocak");
    const odabI = findAd(ilce.adaylar, "odabasi");
    const simI = findAd(ilce.adaylar, "simsek");
    const iyiI = y2019.adaylar.findIndex((a) => hasFold(a.parti, "iyi"));
    const mhpI = y2019.adaylar.findIndex((a) => a.parti === "MHP");
    const chpM = meclis.partiler.findIndex((p) => (p.parti || p) === "CHP");
    const yavasI = findAd(bb.adaylar, "yavas");
    const altinI = findAd(bb.adaylar, "altinok");
    const erI = findAd(cb1.adaylar, "erdogan");
    const kilI = findAd(cb1.adaylar, "kilicdaroglu");
    const oganI = findAd(cb1.adaylar, "sinan");
    const inceI = findAd(cb1.adaylar, "muharrem");
    const er2 = findAd(cb2.adaylar, "erdogan");
    const kil2 = findAd(cb2.adaylar, "kilicdaroglu");

    const rows = [
      ["2019 seçmen", y2019.ilce.secmen, 89967],
      ["2019 geçerli", y2019.ilce.gecerli, 75782],
      ["2019 MHP", o2019[mhpI], 41055],
      ["2019 İYİ", o2019[iyiI], 29626],
      ["2023 MV seçmen", mv.ilce.secmen, 106348],
      ["2023 MV kullanılan", mv.ilce.kullanan, 97355],
      ["2023 MV geçerli", mv.ilce.gecerli, 95750],
      ["2023 CB1 Erdoğan", oCb1[erI], 45423],
      ["2023 CB1 Kılıçdaroğlu", oCb1[kilI], 43393],
      ["2023 CB1 Oğan", oCb1[oganI], 7052],
      ["2023 CB1 İnce", oCb1[inceI], 257],
      ["2023 CB2 seçmen", cb2.ilce.secmen, 106440],
      ["2023 CB2 Erdoğan", oCb2[er2], 46811],
      ["2023 CB2 Kılıçdaroğlu", oCb2[kil2], 45958],
      ["2024 ilçe seçmen", ilce.ilce.secmen, 111188],
      ["2024 ilçe kullanılan", ilce.ilce.kullanan, 92325],
      ["2024 ilçe geçerli", ilce.ilce.gecerli, 88999],
      ["2024 Odabaşı CHP", oIlce[odabI], 39457],
      ["2024 Koçak BBP", oIlce[kocakI], 22610],
      ["2024 Şimşek MHP", oIlce[simI], 19324],
      ["2024 meclis CHP", oMeclis[chpM], 38957],
      ["2024 BB Yavaş", oBb[yavasI], 52760],
      ["2024 BB Altınok", oBb[altinI], 29754],
      ["ADNKS 2014", adnks("2014"), 118346],
      ["ADNKS 2019", adnks("2019"), 138944],
      ["ADNKS 2023", adnks("2023"), 157605],
      ["ADNKS 2024", adnks("2024"), 165201],
      ["Mahalle sayısı", DATA.mahalleler.length, 54],
      ["Koparan Koçak", koparan.oylar[kocakI], 146],
      ["Koparan Odabaşı", koparan.oylar[odabI], 146]
    ];
    return rows.map(([ad, got, want]) => ({ ad, got, want, ok: got === want }));
  }

  /* ---------- routing ---------- */
  const state = {
    view: "ozet",
    mahalleId: null,
    raceId: "2024_ilce_baskan",
    q: "",
    sort: "ad",
    dir: 1,
    cmpA: "2019_ilce_baskan",
    cmpB: "2024_ilce_baskan",
    onlyChanged: false,
    showAll: false,
    checks: null
  };

  function parseHash() {
    const h = (location.hash || "#/").replace(/^#/, "");
    const parts = h.split("/").filter(Boolean);
    state.view = parts[0] || "ozet";
    if (state.view === "mahalle" && parts[1]) {
      state.mahalleId = parts[1];
      state.raceId = parts[2] && RACE_MAP[parts[2]] ? parts[2] : "2024_ilce_baskan";
    } else if (state.view === "karsilastir") {
      if (parts[1] && RACE_MAP[parts[1]]) state.cmpA = parts[1];
      if (parts[2] && RACE_MAP[parts[2]]) state.cmpB = parts[2];
    }
    if (!RACE_MAP[state.raceId]) state.raceId = "2024_ilce_baskan";
  }
  function go(path) {
    location.hash = path.startsWith("#") ? path : "#/" + path.replace(/^\//, "");
  }

  /* ---------- pieces ---------- */
  function voteBars(race, oylar, gecerli, opts) {
    opts = opts || {};
    const ranked = rankedVotes(race, oylar, gecerli);
    const max = ranked[0] ? ranked[0].oy : 1;
    const limit = opts.showAll || ranked.length <= 8 ? ranked.length : 8;
    const shown = ranked.slice(0, limit).filter((c) => opts.showAll || c.oy > 0 || limit <= 8);
    const rest = ranked.length - shown.length;
    return (
      shown
        .map((c) => {
          const w = max ? (100 * c.oy) / max : 0;
          const col = partyColor(c.parti || c.ad);
          const sub = c.isParti ? "" : esc(partyShort(c.parti));
          const mark = contestantMark(c);
          const partyLogo = !c.isParti && c.parti ? logoMark(c.parti, "sm") : "";
          return `<div class="bar-row">
            <div class="lab">${mark}<div class="lab-text"><b>${esc(c.label)}</b>${sub ? `<span class="lab-sub">${partyLogo}${sub}</span>` : ""}</div></div>
            <div class="track" role="img" aria-label="${esc(c.label)} ${fmt(c.oy)} oy">
              <div class="fill" style="width:${w}%;background:${col}"></div>
            </div>
            <div class="val">${fmt(c.oy)}<small>${pct(c.oy, gecerli)}</small></div>
          </div>`;
        })
        .join("") +
      (rest > 0
        ? `<button class="more-btn" type="button" data-act="show-all">Tüm adaylar / partiler (${ranked.length})</button>`
        : "")
    );
  }

  function sparkline(values, years) {
    const w = 320, h = 86, p = 8;
    const nums = values.filter((v) => v != null);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = max - min || 1;
    const pts = values.map((v, i) => {
      const x = p + (i * (w - 2 * p)) / (values.length - 1);
      const y = h - p - ((v - min) / span) * (h - 2 * p);
      return [x, y, v, years[i]];
    });
    const d = pts.map((pt, i) => (i ? "L" : "M") + pt[0].toFixed(1) + " " + pt[1].toFixed(1)).join(" ");
    const area = `M${pts[0][0].toFixed(1)} ${h - p} ` + pts.map((pt) => `L${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ") + ` L${pts[pts.length - 1][0].toFixed(1)} ${h - p} Z`;
    const last = pts[pts.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <path class="area" d="${area}"></path>
      <path d="${d}"></path>
      <circle cx="${last[0]}" cy="${last[1]}" r="3.2"></circle>
    </svg>
    <div class="spark-axis"><span>${years[0]} · ${fmt(values[0])}</span><span>${years[years.length - 1]} · ${fmt(values[values.length - 1])}</span></div>`;
  }

  function miniSeries(pairs, color) {
    const max = Math.max(...pairs.map((p) => p.v));
    return `<div class="mini-bars" role="img" aria-label="zaman serisi">${pairs
      .map((p) => {
        const h = max ? Math.max(6, (76 * p.v) / max) : 6;
        return `<div class="mini-col"><span class="v">${fmt(p.v)}</span><div class="b" style="height:${h}px;background:${color || "var(--navy)"}"></div><span class="t">${esc(p.t)}</span></div>`;
      })
      .join("")}</div>`;
  }

  function headerNav() {
    const items = [
      ["ozet", "Özet", "#/"],
      ["mahalleler", "Mahalleler", "#/mahalleler"],
      ["mahalle", "Mahalle", state.mahalleId ? "#/mahalle/" + state.mahalleId : "#/mahalleler"],
      ["karsilastir", "Karşılaştır", "#/karsilastir/" + state.cmpA + "/" + state.cmpB],
      ["kaynak", "Kaynak", "#/kaynak"]
    ];
    return items
      .map(([id, lab, href]) => {
        const cur = state.view === id || (id === "mahalleler" && state.view === "mahalle" && false);
        const on = state.view === id || (id === "mahalle" && state.view === "mahalle");
        return `<a href="${href}" ${on ? 'aria-current="page"' : ""}>${esc(lab)}</a>`;
      })
      .join("");
  }

  function layout(main) {
    const checks = state.checks || (state.checks = runChecksums());
    const allOk = checks.every((c) => c.ok);
    document.getElementById("nav").innerHTML = headerNav();
    document.getElementById("app").innerHTML = main;
    const st = document.getElementById("status");
    if (st) {
      st.innerHTML = allOk
        ? '<span class="status-dot"></span>Sayılar doğrulandı · 54 mahalle · YSK + TÜİK'
        : '<span class="status-dot" style="background:#8f1d1d"></span>Checksum uyumsuz — Kaynak sayfasına bakın';
    }
  }

  /* ---------- views ---------- */
  function viewOzet() {
    const ilce = DATA.yarislar["2024_ilce_baskan"];
    const bb = DATA.yarislar["2024_buyuksehir"];
    const y2019 = DATA.yarislar["2019_ilce_baskan"];
    const mv = DATA.yarislar["2023_milletvekili"];
    const cb1 = DATA.yarislar["2023_cb1"];
    const cb2 = DATA.yarislar["2023_cb2"];
    const meclis = DATA.yarislar["2024_meclis"];
    const oIlce = ensureIlceOylar(ilce);
    const oBb = ensureIlceOylar(bb);
    const odabI = findAd(ilce.adaylar, "odabasi");
    const kocakI = findAd(ilce.adaylar, "kocak");
    const simI = findAd(ilce.adaylar, "simsek");
    const yavasI = findAd(bb.adaylar, "yavas");
    const altinI = findAd(bb.adaylar, "altinok");

    const secmen = [
      { t: "2014", v: 77096 },
      { t: "2019", v: 89967 },
      { t: "2023", v: 106348 },
      { t: "2024", v: 111188 }
    ];
    const nufus = [
      { t: "2014", v: 118346 },
      { t: "2019", v: 138944 },
      { t: "2023", v: 157605 },
      { t: "2024", v: 165201 }
    ];
    const turnout = [
      { t: "2019 ilçe", k: y2019.ilce },
      { t: "2023 MV", k: mv.ilce },
      { t: "2023 CB2", k: cb2.ilce },
      { t: "2024 ilçe", k: ilce.ilce }
    ];

    const wmap = {};
    for (const m of ilce.mahalleler) {
      const w = winnerFromRow(ilce, m);
      const key = w.tie ? "BERABERLİK" : w.partiRaw || w.parti;
      wmap[key] = (wmap[key] || 0) + 1;
    }

    const maxS = Math.max(...ilce.mahalleler.map((m) => m.secmen));
    const chips = ilce.mahalleler
      .slice()
      .sort((a, b) => b.secmen - a.secmen)
      .map((row) => {
        const meta = mahalleById(row.id);
        const w = winnerFromRow(ilce, row);
        const size = 11 + (11 * Math.log(row.secmen)) / Math.log(maxS);
        const cls = w.tie ? "chip tie" : "chip";
        return `<a class="${cls}" href="#/mahalle/${row.id}/2024_ilce_baskan" style="font-size:${size.toFixed(1)}px" title="${esc(meta.ad)} · ${esc(w.label)}">
          ${winnerMarks(w)}${esc(meta.ad)}
        </a>`;
      })
      .join("");

    const racesCards = RACES.map((meta) => {
      const race = DATA.yarislar[meta.id];
      const oylar = ensureIlceOylar(race);
      const top = rankedVotes(race, oylar, race.ilce.gecerli)[0];
      const k = katilim(race.ilce);
      return `<a class="card" href="#/karsilastir" style="text-decoration:none;color:inherit">
        <p class="kicker">${esc(meta.kisa)}</p>
        <p class="winner-line">${contestantMark(top, "sm")}<span><b>${esc(top.label)}</b>${top.parti && !top.isParti ? ` <span style="color:var(--muted);font-weight:600">· ${esc(partyShort(top.parti))}</span>` : ""}</span></p>
        <p class="foot">${fmt(top.oy)} oy · ${pct(top.oy, race.ilce.gecerli)} geçerli · katılım ${k ? N2.format(k) + "%" : "—"}</p>
      </a>`;
    }).join("");

    layout(`<div class="wrap">
      <header class="hero">
        <p class="eyebrow">Ankara · Gölbaşı · 54 mahalle</p>
        <h1>Bir ilçenin seçim hafızası, mahalle mahalle</h1>
        <p class="lede">2019 yerel, 2023 genel ve 2024 yerel sandık sonuçları YSK açık veriden mahalleye toplandı; nüfus TÜİK ADNKS 31 Aralık. <em>Kampanya sitesi değil</em> — derleme, checksum’ı açık bir seçim atlası.</p>
      </header>

      <div class="grid-2">
        <article class="card featured" style="--p:#E30A17">
          <p class="kicker">31 Mart 2024 · İlçe belediye başkanı</p>
          <p class="stat-num">${fmt(39457)} <small>${pct(39457, 88999)}</small></p>
          <p class="hero-person">${portraitMark("Yakup Odabaşı", "CHP", "hero")}${logoMark("CHP", "hero")}<span>Yakup Odabaşı · CHP</span></p>
          <p class="foot">Geçerli ${fmt(88999)} · kullanılan ${fmt(92325)} · seçmen ${fmt(111188)}. İkinci Gökhan Koçak (BBP) ${fmt(22610)}; üçüncü Ramazan Şimşek (MHP) ${fmt(19324)}.</p>
        </article>
        <article class="card featured" style="--p:#E30A17">
          <p class="kicker">31 Mart 2024 · Büyükşehir — Gölbaşı oyları</p>
          <p class="stat-num">${fmt(52760)} <small>${pct(52760, 89200)}</small></p>
          <p class="hero-person">${portraitMark("Mansur Yavaş", "CHP", "hero")}${logoMark("CHP", "hero")}<span>Mansur Yavaş · CHP</span></p>
          <p class="foot">Turgut Altınok (AK Parti) ${fmt(29754)}. İlçe başkanlığı ile büyükşehir Gölbaşı’da aynı rengin önde olduğu, fakat payların farklılaştığı bir tablo.</p>
        </article>
      </div>

      <div class="metrics">
        <div class="metric"><p class="kicker">Kayıtlı seçmen</p>
          <div class="series"><b>77.096</b><span>→</span><b>89.967</b><span>→</span><b>106.348</b><span>→</span><b>111.188</b></div>
          <p class="foot">2014 · 2019 · 2023 · 2024</p></div>
        <div class="metric"><p class="kicker">ADNKS nüfus</p>
          <div class="series"><b>118.346</b><span>→</span><b>138.944</b><span>→</span><b>157.605</b><span>→</span><b>165.201</b></div>
          <p class="foot">31 Aralık 2014–2024</p></div>
        <div class="metric"><p class="kicker">Katılım, 2024 ilçe</p>
          <p class="n">${pct(ilce.ilce.kullanan, ilce.ilce.secmen)}</p>
          <p class="foot">2023 MV ${pct(mv.ilce.kullanan, mv.ilce.secmen)} idi</p></div>
        <div class="metric"><p class="kicker">2019 ilçe kazanan</p>
          <p class="n hero-person" style="font-size:1.05rem">${portraitMark("Ramazan Şimşek", "MHP")}${logoMark("MHP")}<span>Ramazan Şimşek</span></p>
          <p class="foot">MHP ${fmt(41055)} · ${pct(41055, 75782)}</p></div>
      </div>

      <div class="grid-2" style="margin-top:.2rem">
        <section class="card">
          <h2>Seçmen ve nüfus</h2>
          <p class="foot" style="margin-bottom:.6rem">İlçe toplamı; mahalle kırılımı Mahalleler’de.</p>
          <p class="kicker">Kayıtlı seçmen</p>
          ${miniSeries(secmen, "#1e3a4c")}
          <p class="kicker" style="margin-top:.8rem">ADNKS</p>
          ${miniSeries(nufus, "#9a7433")}
        </section>
        <section class="card">
          <h2>Katılım</h2>
          <div class="chart" style="margin-top:.4rem">
            ${turnout
              .map((t) => {
                const k = katilim(t.k);
                return `<div class="bar-row">
                  <div class="lab"><b>${esc(t.t)}</b><span>${fmt(t.k.kullanan)} / ${fmt(t.k.secmen)}</span></div>
                  <div class="track"><div class="fill" style="width:${k}%;background:#2c5368"></div></div>
                  <div class="val">${k ? N2.format(k) + "%" : "—"}</div>
                </div>`;
              })
              .join("")}
          </div>
          <p class="note">2024 yerel seçimde katılım, 2023 genel seçimin altındadır. Geçersiz oy oranı da 2024 ilçede daha yüksektir (${pct(ilce.ilce.gecersiz, ilce.ilce.kullanan)} kullanılan).</p>
        </section>
      </div>

      <div class="sec-head">
        <h2 class="sec-title" style="margin:0">Mahalle kazananları · 2024 ilçe</h2>
        <p>Yazı boyutu kayıtlı seçmene göre. Koparan: 146–146 beraberlik.</p>
      </div>
      <section class="card">
        <div class="chips">${chips}</div>
        <div class="legend">
          <span>${logoMark("CHP", "sm")}CHP Odabaşı (${wmap["CHP"] || 0})</span>
          <span>${logoMark("BÜYÜK BİRLİK", "sm")}BBP Koçak (${wmap["BÜYÜK BİRLİK"] || 0})</span>
          <span>${logoMark("MHP", "sm")}MHP Şimşek (${wmap["MHP"] || 0})</span>
          <span>${logoMark("YENİDEN REFAH", "sm")}Yeniden Refah (${wmap["YENİDEN REFAH"] || 0})</span>
          <span><i style="background:#9a7433"></i>Beraberlik (${wmap["BERABERLİK"] || 0})</span>
        </div>
      </section>

      <div class="sec-head">
        <h2 class="sec-title" style="margin:0">Yedi yarış, ilçe özeti</h2>
        <p>İlk sıradaki aday veya parti.</p>
      </div>
      <div class="grid-3">${racesCards}</div>
    </div>`);
  }

  function viewMahalleler() {
    const race = DATA.yarislar["2024_ilce_baskan"];
    const q = foldTR(state.q);
    let rows = DATA.mahalleler.map((m) => {
      const r = raceRow(race, m.id);
      const w = winnerFromRow(race, r);
      return { m, r, w, k: katilim(r) };
    });
    if (q) {
      rows = rows.filter((x) => foldTR(x.m.ad + " " + x.m.ysk + " " + x.m.belediye).includes(q));
    }
    const key = state.sort;
    rows.sort((a, b) => {
      let va, vb;
      if (key === "ad") {
        va = a.m.ad.localeCompare(b.m.ad, "tr");
        return va * state.dir;
      }
      if (key === "nufus") {
        va = a.m.adnks["2024"];
        vb = b.m.adnks["2024"];
      } else if (key === "secmen") {
        va = a.m.secmen["2024"];
        vb = b.m.secmen["2024"];
      } else if (key === "katilim") {
        va = a.k || 0;
        vb = b.k || 0;
      } else if (key === "pay") {
        va = a.r.gecerli ? (a.w.oy || 0) / a.r.gecerli : 0;
        vb = b.r.gecerli ? (b.w.oy || 0) / b.r.gecerli : 0;
      } else if (key === "kazanan") {
        va = (a.w.parti || a.w.label).localeCompare(b.w.parti || b.w.label, "tr");
        return va * state.dir;
      } else {
        va = 0;
        vb = 0;
      }
      return (va - vb) * state.dir;
    });

    const th = (id, lab, cls) => {
      const on = state.sort === id;
      const arrow = on ? (state.dir > 0 ? " ↑" : " ↓") : "";
      return `<th class="${cls || ""}"><button type="button" data-sort="${id}" style="all:unset;cursor:pointer">${esc(lab)}${arrow}</button></th>`;
    };

    const body = rows.length
      ? rows
          .map((x) => {
            const href = `#/mahalle/${x.m.id}/2024_ilce_baskan`;
            const badge = x.w.tie
              ? `<span class="badge tie">${winnerMarks(x.w)}Beraberlik ${fmt(x.w.oy)}–${fmt(x.w.oy)}</span>`
              : `<span class="badge">${winnerMarks(x.w)}${esc(x.w.parti || x.w.label)}</span>`;
            return `<tr tabindex="0" data-href="${href}">
              <td><a class="mah" href="${href}">${esc(x.m.ad)}</a></td>
              <td class="num">${fmt(x.m.adnks["2024"])}</td>
              <td class="num">${fmt(x.m.secmen["2024"])}</td>
              <td class="num">${x.k != null ? N1.format(x.k) + "%" : "—"}</td>
              <td>${badge}</td>
              <td class="num">${x.w.tie ? "—" : pct(x.w.oy, x.r.gecerli)}</td>
            </tr>`;
          })
          .join("")
      : `<tr><td colspan="6"><div class="empty"><b>Sonuç yok</b>«${esc(state.q)}» ile eşleşen mahalle bulunamadı.</div></td></tr>`;

    layout(`<div class="wrap">
      <header class="hero">
        <p class="eyebrow">54 mahalle</p>
        <h1>Mahalleler</h1>
        <p class="lede">Nüfus ADNKS 2024, seçmen ve kazanan 31 Mart 2024 ilçe başkanlığı. Sıralayıp bir mahalleye tıklayın.</p>
      </header>
      <div class="toolbar">
        <div class="search-wrap"><input class="search" type="search" placeholder="Mahalle ara…" value="${esc(state.q)}" id="q" aria-label="Mahalle ara"></div>
        <span class="foot">${fmt(rows.length)} kayıt</span>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr>
            ${th("ad", "Mahalle")}
            ${th("nufus", "Nüfus 2024", "num")}
            ${th("secmen", "Seçmen 2024", "num")}
            ${th("katilim", "Katılım", "num")}
            ${th("kazanan", "Kazanan 2024")}
            ${th("pay", "Pay", "num")}
          </tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`);

    const inp = document.getElementById("q");
    if (inp) {
      inp.addEventListener("input", (e) => {
        state.q = e.target.value;
        viewMahalleler();
        const n = document.getElementById("q");
        if (n) {
          n.focus();
          n.setSelectionRange(n.value.length, n.value.length);
        }
      });
    }
    document.querySelectorAll("[data-sort]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-sort");
        if (state.sort === id) state.dir *= -1;
        else {
          state.sort = id;
          state.dir = id === "ad" || id === "kazanan" ? 1 : -1;
        }
        viewMahalleler();
      });
    });
    document.querySelectorAll("tr[data-href]").forEach((tr) => {
      tr.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        go(tr.getAttribute("data-href"));
      });
      tr.addEventListener("keydown", (e) => {
        if (e.key === "Enter") go(tr.getAttribute("data-href"));
      });
    });
  }

  function viewMahalle() {
    const m = mahalleById(state.mahalleId);
    if (!m) {
      layout(`<div class="wrap"><a class="back" href="#/mahalleler">← Mahalleler</a><div class="empty"><b>Mahalle bulunamadı</b></div></div>`);
      return;
    }
    const meta = RACE_MAP[state.raceId] || RACES[4];
    const race = DATA.yarislar[meta.id];
    const row = raceRow(race, m.id);
    const oylar = row ? row.oylar : [];
    const w = row ? winnerFromRow(race, row) : null;
    const years = Object.keys(m.adnks).sort();
    const vals = years.map((y) => m.adnks[y]);
    const yazim = m.ysk.replace(/ MAH\.$/, "") !== m.belediye;

    const pills = RACES.map((r) => {
      const on = r.id === meta.id;
      return `<button type="button" class="pill${on ? " active" : ""}" data-race="${r.id}" aria-pressed="${on}">${esc(r.kisa)}</button>`;
    }).join("");

    let gap = "";
    if (meta.id === "2023_milletvekili") {
      gap = `<p class="note">2023 milletvekilinde 8 bağımsızın mahalle kırılımı yayımlanmadı (ilçe toplamı 57 oy). İttifak haneleri parti oylarından ayrıdır; toplanırsa çift sayım olur.</p>`;
    } else if (meta.id === "2024_meclis") {
      gap = `<p class="note">2024 meclis sonuçlarında YSK sandık dosyasında aday oyu yok; yalnızca 22 parti listesi.</p>`;
    } else if (meta.id === "2024_ilce_baskan" && w && w.tie) {
      gap = `<div class="warn-box" style="margin:0 0 1rem"><strong>Koparan beraberliği.</strong> Gökhan Koçak (BBP) ve Yakup Odabaşı (CHP) ${fmt(146)}–${fmt(146)}. Kazanan işaretlenmedi.</div>`;
    }

    const prevYear =
      meta.yil === 2024 ? "2023" : meta.yil === 2023 ? "2019" : meta.yil === 2019 ? "2014" : null;
    const dN = prevYear ? m.adnks[String(meta.yil === 2024 ? 2024 : meta.yil === 2023 ? 2023 : 2019)] - m.adnks[prevYear] : null;
    const dS = prevYear ? m.secmen[String(meta.yil === 2024 ? 2024 : meta.yil === 2023 ? 2023 : 2019)] - (m.secmen[prevYear] || 0) : null;

    const nufusNow = m.adnks[String(meta.yil === 2019 ? 2019 : meta.yil === 2023 ? 2023 : 2024)];

    layout(`<div class="wrap">
      <a class="back" href="#/mahalleler">← Tüm mahalleler</a>
      <header class="hero">
        <p class="eyebrow">Mahalle · ${esc(String(m.id))}</p>
        <h1>${esc(m.ad)}</h1>
        <p class="yazim">YSK <code>${esc(m.ysk)}</code>${yazim ? ` · belediye yazımı <code>${esc(m.belediye)}</code>` : ""}</p>
      </header>
      <div class="pills" role="tablist" aria-label="Yarış">${pills}</div>
      ${gap}
      ${
        row
          ? `<div class="stack">
        <section class="card">
          <p class="kicker">${esc(meta.uzun)}</p>
          <h2 class="winner-line" style="margin-top:.2rem">${w ? winnerMarks(w) : ""}<span>${w.tie ? "Beraberlik" : esc(w.label)}${!w.tie && w.parti ? ` · ${esc(w.parti)}` : ""}</span></h2>
          <div class="dl" style="margin:.8rem 0 1rem">
            <div><dt>Sandık</dt><dd>${fmt(row.sandik)}</dd></div>
            <div><dt>Seçmen</dt><dd>${fmt(row.secmen)}</dd></div>
            <div><dt>Kullanan</dt><dd>${fmt(row.kullanan)} <span class="foot">(${pct1(row.kullanan, row.secmen)})</span></dd></div>
            <div><dt>Geçerli / geçersiz</dt><dd>${fmt(row.gecerli)} / ${fmt(row.gecersiz)}</dd></div>
          </div>
          <div class="chart">${voteBars(race, oylar, row.gecerli, { showAll: state.showAll })}</div>
        </section>
        <div class="grid-2">
          <section class="card">
            <h2>Nüfus 2013–2025</h2>
            ${sparkline(vals, years)}
            <p class="foot" style="margin-top:.5rem">ADNKS 31 Aralık. 2025 yılı TÜİK’in yayımladığı son nokta.</p>
          </section>
          <section class="card">
            <h2>Önceki seçime fark</h2>
            <div class="dl">
              <div><dt>Nüfus ${esc(String(meta.yil === 2024 ? 2024 : meta.yil))} vs ${esc(prevYear || "—")}</dt>
                <dd class="${deltaCls(dN)}">${deltaTxt(dN)}</dd></div>
              <div><dt>Seçmen vs ${esc(prevYear || "—")}</dt>
                <dd class="${deltaCls(dS)}">${deltaTxt(dS)}</dd></div>
              <div><dt>ADNKS ${esc(String(meta.yil === 2019 ? 2019 : meta.yil === 2023 ? 2023 : 2024))}</dt>
                <dd>${fmt(nufusNow)}</dd></div>
              <div><dt>Seçmen / nüfus</dt>
                <dd>${nufusNow ? pct(row.secmen, nufusNow) : "—"}</dd></div>
            </div>
            <p class="foot" style="margin-top:.8rem">2014 mahalle oyları ve mahalle sandık sayısı kaynakta yok; yalnızca ilçe seçmen 77.096.</p>
          </section>
        </div>
      </div>`
          : `<div class="empty"><b>Bu yarışta satır yok</b></div>`
      }
    </div>`);

    document.querySelectorAll("[data-race]").forEach((b) => {
      b.addEventListener("click", () => {
        state.showAll = false;
        go(`/mahalle/${m.id}/${b.getAttribute("data-race")}`);
      });
    });
    const more = document.querySelector("[data-act=show-all]");
    if (more)
      more.addEventListener("click", () => {
        state.showAll = true;
        viewMahalle();
      });
  }

  function viewKarsilastir() {
    if (state.cmpA === state.cmpB) state.cmpB = state.cmpA === "2024_ilce_baskan" ? "2019_ilce_baskan" : "2024_ilce_baskan";
    const a = DATA.yarislar[state.cmpA];
    const b = DATA.yarislar[state.cmpB];
    const ma = RACE_MAP[state.cmpA];
    const mb = RACE_MAP[state.cmpB];
    const opts = RACES.map((r) => `<option value="${r.id}">${esc(r.uzun)}</option>`).join("");

    let changed = 0;
    const rows = DATA.mahalleler.map((m) => {
      const ra = raceRow(a, m.id);
      const rb = raceRow(b, m.id);
      const wa = winnerFromRow(a, ra);
      const wb = winnerFromRow(b, rb);
      const pa = ra.gecerli ? (wa.oy || 0) / ra.gecerli : 0;
      const pb = rb.gecerli ? (wb.oy || 0) / rb.gecerli : 0;
      const same = !wa.tie && !wb.tie && partyKey(wa.partiRaw || wa.parti) === partyKey(wb.partiRaw || wb.parti) && partyKey(wa.partiRaw || wa.parti) !== "";
      if (!same) changed++;
      return { m, ra, rb, wa, wb, pa, pb, same };
    });
    const shown = state.onlyChanged ? rows.filter((r) => !r.same) : rows;
    shown.sort((x, y) => x.m.ad.localeCompare(y.m.ad, "tr"));

    const body = shown.length
      ? shown
          .map((x) => {
            const ba = x.wa.tie
              ? `<span class="badge tie">${winnerMarks(x.wa)}Beraberlik</span>`
              : `<span class="badge">${winnerMarks(x.wa)}${esc(x.wa.parti || x.wa.label)}</span>`;
            const bb = x.wb.tie
              ? `<span class="badge tie">${winnerMarks(x.wb)}Beraberlik</span>`
              : `<span class="badge">${winnerMarks(x.wb)}${esc(x.wb.parti || x.wb.label)}</span>`;
            return `<tr data-href="#/mahalle/${x.m.id}">
              <td><a class="mah" href="#/mahalle/${x.m.id}">${esc(x.m.ad)}</a></td>
              <td>${ba}<div class="foot">${esc(x.wa.label)}</div></td>
              <td class="num">${pct(x.wa.oy, x.ra.gecerli)}</td>
              <td>${bb}<div class="foot">${esc(x.wb.label)}</div></td>
              <td class="num">${pct(x.wb.oy, x.rb.gecerli)}</td>
              <td>${x.same ? '<span style="color:var(--muted)">aynı</span>' : "<b>değişti</b>"}</td>
            </tr>`;
          })
          .join("")
      : `<tr><td colspan="6"><div class="empty"><b>Gösterilecek mahalle yok</b></div></td></tr>`;

    layout(`<div class="wrap">
      <header class="hero">
        <p class="eyebrow">Mahalle düzeyi</p>
        <h1>İki yarışı karşılaştır</h1>
        <p class="lede">Kazanan (parti/aday) ve geçerli oy payı. «Aynı» yargı parti rengine indirgenir; başkanlıkta adayın partisi kullanılır.</p>
      </header>
      <div class="toolbar">
        <label>A <select class="sel" id="cmpA">${opts}</select></label>
        <label>B <select class="sel" id="cmpB">${opts}</select></label>
        <label class="check"><input type="checkbox" id="onlyCh" ${state.onlyChanged ? "checked" : ""}> Yalnız değişenler</label>
      </div>
      <p class="foot" style="margin:-.4rem 0 1rem">54 mahalleden <b>${fmt(changed)}</b> tanesinde kazanan rengi değişti · gösterilen ${fmt(shown.length)}</p>
      <div class="table-wrap">
        <table class="data">
          <thead><tr>
            <th>Mahalle</th>
            <th>${esc(ma.kisa)}</th>
            <th class="num">Pay A</th>
            <th>${esc(mb.kisa)}</th>
            <th class="num">Pay B</th>
            <th>Durum</th>
          </tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`);

    const sa = document.getElementById("cmpA");
    const sb = document.getElementById("cmpB");
    sa.value = state.cmpA;
    sb.value = state.cmpB;
    sa.addEventListener("change", () => go(`/karsilastir/${sa.value}/${sb.value}`));
    sb.addEventListener("change", () => go(`/karsilastir/${sa.value}/${sb.value}`));
    document.getElementById("onlyCh").addEventListener("change", (e) => {
      state.onlyChanged = e.target.checked;
      viewKarsilastir();
    });
    document.querySelectorAll("tr[data-href]").forEach((tr) => {
      tr.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        go(tr.getAttribute("data-href"));
      });
    });
  }

  function viewKaynak() {
    const checks = (state.checks = runChecksums());
    const allOk = checks.every((c) => c.ok);
    const lis = checks
      .map((c) => `<li><span>${esc(c.ad)}</span><span class="${c.ok ? "pass" : "fail"}">${c.ok ? "geçti" : "HATA"} · ${fmt(c.got)} / ${fmt(c.want)}</span></li>`)
      .join("");

    const yazim = DATA.mahalleler.filter((m) => m.ysk.replace(/ MAH\.$/, "") !== m.belediye);

    layout(`<div class="wrap">
      <header class="hero">
        <p class="eyebrow">Yöntem</p>
        <h1>Kaynak, boşluklar, doğrulama</h1>
        <p class="lede">Sayılar uydurulmadı. Sandık sonuçları YSK açık veriden mahalleye toplam; nüfus TÜİK ADNKS 31 Aralık. Derleme 27 Ağustos 2026.</p>
      </header>
      <div class="${allOk ? "ok-box" : "err-box"}" style="margin-bottom:1rem">
        <strong>${allOk ? "Tüm checksum’lar geçti." : "Checksum uyumsuzluğu var."}</strong>
        ${DATA.mahalleler.length} mahalle · ${esc(DATA.meta.kaynak)}
      </div>
      <div class="grid-2">
        <section class="card">
          <h2>Checksum</h2>
          <ul class="check-list">${lis}</ul>
        </section>
        <section class="card">
          <h2>Boşluklar (kaynakta yok)</h2>
          <ol class="gap-list">
            <li><b>2023 milletvekili bağımsızları</b> — 8 aday, ilçe 57 oy; mahalle kırılımı yayımlanmadı. Bu yüzden mahalle parti toplamı 94.889, ilçe geçerli 95.750 (fark 861 = ittifak haneleri 804 + bağımsız 57).</li>
            <li><b>2023 ittifak payı</b> mahalleye dağıtılmadı; parti ve ittifak haneleri ayrı tutulur (toplanırsa çift sayım).</li>
            <li><b>2024 meclis aday oyu</b> YSK sandık dosyasında yok; yalnızca 22 parti listesi.</li>
            <li><b>Koparan 2024 ilçe</b> Koçak (BBP) / Odabaşı (CHP) <b>146–146</b>.</li>
            <li><b>2014 mahalle oyları</b> ve mahalle sandık sayısı yok (yalnızca 2014 seçmen 77.096 ve ilçe 268 sandık).</li>
            <li>Ayrı <b>boş oy</b> hanesi yok (geçersiz ile birlikte).</li>
          </ol>
        </section>
      </div>
      <section class="card" style="margin-top:1rem">
        <h2>Yazım farkları</h2>
        <p class="foot">YSK / TÜİK adı solda, belediye yazımı sağda.</p>
        <ul class="gap-list">
          ${yazim.map((m) => `<li>${esc(m.ad)} — YSK <code>${esc(m.ysk)}</code> · belediye <code>${esc(m.belediye)}</code></li>`).join("")}
        </ul>
        <p class="note">Kaynak: YSK <code>acikveri.ysk.gov.tr</code> / <code>data.ysk.gov.tr</code> (ilceId=637); TÜİK ADNKS 31 Aralık. İlçe toplamı 54 mahallenin toplamıdır.</p>
      </section>
      <section class="card" style="margin-top:1rem">
        <h2>Logolar ve fotoğraflar</h2>
        <p>Parti logoları ve siyasetçi fotoğrafları Wikimedia Commons veya Vikipedi’den (Special:FilePath) indirildi; kampanya malzemesi değiller. Wikimedia’da dosyası bulunmayan adaylar için parti rengi üzerinde baş harf rozeti kullanılır. Kaynak, lisans ve dosya adları <a href="./assets/ATTRIBUTION.md">ATTRIBUTION.md</a> dosyasındadır.</p>
      </section>
    </div>`);
  }

  function render() {
    state.showAll = false;
    parseHash();
    const v = state.view;
    if (v === "mahalleler") viewMahalleler();
    else if (v === "mahalle") viewMahalle();
    else if (v === "karsilastir") viewKarsilastir();
    else if (v === "kaynak") viewKaynak();
    else viewOzet();
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", render);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();

  window.__ATLAS_DEBUG = {
    checksums: runChecksums,
    nMahalle: DATA.mahalleler.length,
    koparan: () => {
      const ilce = DATA.yarislar["2024_ilce_baskan"];
      return ilce.mahalleler.find((m) => m.m === "KOPARAN");
    }
  };
})();
