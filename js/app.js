/* ============ rendering & interactivity ============ */
let LANG = localStorage.getItem("wc26lang") || "en";
let venueFilter = "ALL";
let confFilter = "ALL";
let teamQuery = "";

const $ = (id) => document.getElementById(id);
const t = (key) => I18N[LANG][key] ?? key;
const flag = (code, w = 40) =>
  `<img src="https://flagcdn.com/w${w}/${code}.png" srcset="https://flagcdn.com/w${w * 2}/${code}.png 2x" alt="" width="${w > 40 ? 34 : 24}" loading="lazy">`;
const tName = (id) => TEAMS[id][LANG];
const fmtDate = (m, d) =>
  LANG === "bg" ? `${d} ${MONTHS.bg[m - 1]}` : `${MONTHS.en[m - 1]} ${d}`;

function setLang(lang) {
  LANG = lang;
  localStorage.setItem("wc26lang", lang);
  document.documentElement.lang = lang;
  $("btnEN").classList.toggle("active", lang === "en");
  $("btnBG").classList.toggle("active", lang === "bg");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[LANG][key] !== undefined) el.innerHTML = I18N[LANG][key];
  });
  $("teamSearch").placeholder = t("te_search");
  renderAll();
}

/* ---------- overview ---------- */
function cardHTML(item) {
  const [h, p] = item[LANG];
  return `<div class="card reveal"><span class="icon">${item.icon}</span><h4>${h}</h4><p>${p}</p></div>`;
}
function renderOverview() {
  $("factCards").innerHTML = FACTS.map(cardHTML).join("");
  $("ruleCards").innerHTML = RULES.map(cardHTML).join("");
}

/* ---------- venues ---------- */
function renderVenueFilters() {
  const btn = (key, label, flagCode) =>
    `<button class="chip ${venueFilter === key ? "active" : ""}" onclick="venueFilter='${key}';renderVenueFilters();renderVenues()">
      ${flagCode ? flag(flagCode, 20) + " " : ""}${label}</button>`;
  $("venueFilters").innerHTML =
    btn("ALL", t("ve_all")) +
    btn("US", HOSTS.US[LANG], "us") +
    btn("MX", HOSTS.MX[LANG], "mx") +
    btn("CA", HOSTS.CA[LANG], "ca");
}
function renderVenues() {
  const maxCap = 80824;
  $("venueGrid").innerHTML = VENUES.filter(
    (v) => venueFilter === "ALL" || v.country === venueFilter
  )
    .map((v) => {
      const h = HOSTS[v.country];
      return `<div class="venue reveal">
        <div class="venue-photo">
          <img src="assets/venues/${v.img}" alt="${v.stadium}" loading="lazy">
          <span class="venue-flag">${flag(h.flag, 20)} ${h[LANG]}</span>
          <div class="venue-name">${v.stadium}</div>
        </div>
        <div class="venue-stripe" style="background:${h.color}"></div>
        <div class="venue-body">
          <div class="city">📍 ${v.city[LANG]}</div>
          <div class="cap-bar"><div class="cap-fill" style="width:${Math.round((v.cap / maxCap) * 100)}%"></div></div>
          <div class="cap-num"><b>${v.cap.toLocaleString(LANG === "bg" ? "bg-BG" : "en-US")}</b> ${t("cap")}</div>
          ${v.tag ? `<span class="tag">★ ${v.tag[LANG]}</span>` : ""}
        </div></div>`;
    })
    .join("");
  observeReveals();
}

/* ---------- teams ---------- */
function renderConfFilters() {
  const btn = (key, label) =>
    `<button class="chip ${confFilter === key ? "active" : ""}" onclick="confFilter='${key}';renderConfFilters();renderTeams()">${label}</button>`;
  $("confFilters").innerHTML =
    btn("ALL", t("ve_all")) +
    Object.keys(CONFS).map((c) => btn(c, CONFS[c][LANG])).join("");
}
const BADGE_LABEL = {
  host: { en: "HOST", bg: "ДОМАКИН", cls: "host" },
  deb: { en: "DEBUT", bg: "ДЕБЮТ", cls: "deb" },
  champ: { en: "🏆 CHAMPION", bg: "🏆 ШАМПИОН", cls: "champ" },
  fin: { en: "FINALIST", bg: "ФИНАЛИСТ", cls: "fin" }
};
function renderTeams() {
  const q = teamQuery.toLowerCase();
  $("teamGrid").innerHTML = Object.entries(TEAMS)
    .filter(([, tm]) => confFilter === "ALL" || tm.conf === confFilter)
    .filter(
      ([, tm]) =>
        !q || tm.en.toLowerCase().includes(q) || tm.bg.toLowerCase().includes(q)
    )
    .sort((a, b) => a[1][LANG].localeCompare(b[1][LANG], LANG))
    .map(([id, tm]) => {
      const badges = (tm.badges || [])
        .map((b) => `<span class="badge ${BADGE_LABEL[b].cls}">${BADGE_LABEL[b][LANG]}</span>`)
        .join("");
      return `<div class="team reveal conf-${tm.conf}">${flag(tm.flag, 40)}
        <div><div class="tn">${tm[LANG]}${badges}</div>
        <div class="tc">${CONFS[tm.conf][LANG]}</div></div></div>`;
    })
    .join("");
  $("teamLegend").innerHTML = `
    <span><span class="badge host">${BADGE_LABEL.host[LANG]}</span> ${t("leg_host")}</span>
    <span><span class="badge deb">${BADGE_LABEL.deb[LANG]}</span> ${t("leg_deb")}</span>
    <span><span class="badge champ">${BADGE_LABEL.champ[LANG]}</span> ${t("leg_champ")}</span>
    <span><span class="badge fin">${BADGE_LABEL.fin[LANG]}</span> ${t("leg_fin")}</span>`;
  observeReveals();
}

/* ---------- groups ---------- */
function groupStats(g) {
  const s = {};
  g.order.forEach(([id]) => (s[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  g.matches.forEach(([t1, g1, t2, g2]) => {
    s[t1].p++; s[t2].p++;
    s[t1].gf += g1; s[t1].ga += g2;
    s[t2].gf += g2; s[t2].ga += g1;
    if (g1 > g2) { s[t1].w++; s[t2].l++; s[t1].pts += 3; }
    else if (g1 < g2) { s[t2].w++; s[t1].l++; s[t2].pts += 3; }
    else { s[t1].d++; s[t2].d++; s[t1].pts++; s[t2].pts++; }
  });
  return s;
}
function renderGroups() {
  $("groupGrid").innerHTML = GROUPS.map((g, gi) => {
    const st = groupStats(g);
    const rows = g.order
      .map(([id, status]) => {
        const s = st[id];
        const gd = s.gf - s.ga;
        return `<tr class="${status}">
          <td class="tm">${flag(TEAMS[id].flag, 20)} ${tName(id)}</td>
          <td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td>
          <td>${gd > 0 ? "+" + gd : gd}</td><td class="pts">${s.pts}</td></tr>`;
      })
      .join("");
    const matches = g.matches
      .map(
        ([t1, g1, t2, g2, m, d]) =>
          `<div class="gm"><span>${tName(t1)} <b>${g1}:${g2}</b> ${tName(t2)}</span><span>${fmtDate(m, d)}</span></div>`
      )
      .join("");
    return `<div class="group reveal">
      <div class="group-head"><span class="gl">${g.letter}</span><h4>${LANG === "bg" ? "ГРУПА" : "GROUP"} ${g.letter}</h4></div>
      <div class="group-body">
      <table><thead><tr><th>${t("th_team")}</th><th>${t("th_p")}</th><th>${t("th_w")}</th><th>${t("th_d")}</th><th>${t("th_l")}</th><th>${t("th_gd")}</th><th>${t("th_pts")}</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <button class="gm-toggle" onclick="toggleMatches(${gi},this)">${t("gm_show")}</button>
      <div class="gm-list" id="gm${gi}">${matches}</div></div></div>`;
  }).join("");
  observeReveals();
}
function toggleMatches(gi, btn) {
  const el = $("gm" + gi);
  el.classList.toggle("open");
  btn.textContent = el.classList.contains("open") ? t("gm_hide") : t("gm_show");
}

/* ---------- knockout ---------- */
function matchHTML(mt) {
  const played = mt.s1 !== undefined;
  const row = (id, sc, winner) =>
    `<div class="mrow ${winner ? "winner" : ""}">
      <div class="mteam">${flag(TEAMS[id].flag, 20)} <span>${tName(id)}</span></div>
      <div class="ms">${played ? sc : "–"}</div></div>`;
  return `<div class="match ${played ? "" : "upcoming"} ${mt.final ? "final-match" : ""} reveal">
    ${mt.final ? `<div class="final-tag">🏆</div>` : ""}
    ${row(mt.t1, mt.s1, played && mt.win === mt.t1)}
    ${row(mt.t2, mt.s2, played && mt.win === mt.t2)}
    ${mt.note ? `<div class="note">${mt.note[LANG]}</div>` : ""}
    <div class="meta"><span>📅 ${fmtDate(mt.m, mt.d)} · ${played ? t("played") : t("scheduled")}</span><span>📍 ${V[mt.v][LANG]}</span></div>
  </div>`;
}
function renderKnockout() {
  $("r32Grid").innerHTML = R32.map(matchHTML).join("");
  $("r16Grid").innerHTML = R16.map(matchHTML).join("");
  $("qfGrid").innerHTML = QF.map(matchHTML).join("");
  $("sfGrid").innerHTML = SF.map(matchHTML).join("");
  $("finGrid").innerHTML = FINALS.map(matchHTML).join("");
  observeReveals();
}

/* ---------- champions section ---------- */
function renderChampions() {
  $("finalFactCards").innerHTML = FINAL_FACTS.map(cardHTML).join("");
  $("awardCards").innerHTML = AWARDS.map((a) => {
    const [h, p] = a[LANG];
    return `<div class="card award ${a.medal} reveal"><span class="icon">${a.icon}</span><h4>${h}</h4><p>${p}</p></div>`;
  }).join("");
  const rows = RANKING.map(
    (r) => `<tr class="${r.pos === 1 ? "champion-row" : ""}">
      <td class="pos">${r.pos === 1 ? "🥇" : r.pos === 2 ? "🥈" : r.pos === 3 ? "🥉" : r.pos}</td>
      <td class="tm">${flag(TEAMS[r.team].flag, 20)} ${tName(r.team)}</td>
      <td>${r.w}-${r.dr}-${r.l}</td>
      <td>${r.gf}:${r.ga}</td></tr>`
  ).join("");
  $("rankTable").innerHTML = `<thead><tr><th>${t("th_pos")}</th><th>${t("th_team")}</th><th>${t("th_wdl")}</th><th>${t("th_goals")}</th></tr></thead><tbody>${rows}</tbody>`;
  observeReveals();
}

/* ---------- records ---------- */
function renderRecords() {
  $("statCards").innerHTML = STATS.map(
    (s) => `<div class="card reveal"><span class="icon">${s.icon}</span>
      <h4 style="font-size:24px;color:var(--gold)">${s.big}</h4><p>${s[LANG]}</p></div>`
  ).join("");
  $("scorerList").innerHTML = SCORERS.map(
    (s) => `<div class="scorer medal-${s.medal} reveal">${flag(TEAMS[s.team].flag, 40)}
      <div><div class="sn">${s.name}</div><div class="st">${tName(s.team)} · ${s.sub[LANG]}</div></div>
      <div class="sg">${s.goals}<small>${t("goals")}</small></div></div>`
  ).join("");
  const rows = I18N[LANG].pz_rows
    .map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`)
    .join("");
  $("prizeTable").innerHTML = `<thead><tr><th>${t("pz_pos")}</th><th>${t("pz_amount")}</th></tr></thead>
    <tbody>${rows}<tr><td colspan="2" style="color:var(--muted);font-size:13px">${t("pz_note")}</td></tr></tbody>`;
  observeReveals();
}

/* ---------- culture ---------- */
function renderCulture() {
  $("mascotCards").innerHTML = MASCOTS.map((m) => {
    const [h, p] = m[LANG];
    return `<div class="card mascot reveal"><span class="icon">${m.icon}</span>
      <h4>${m.name}</h4><p>${h}</p><p style="margin-top:6px">${p}</p>
      <div class="flag">${flag(m.flag, 20)}</div></div>`;
  }).join("");
  $("cultureCards").innerHTML = CULTURE.map(cardHTML).join("");
  observeReveals();
}

/* ---------- scroll reveal (staggered) ---------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.08 }
);
function observeReveals() {
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
    const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.setProperty("--rd", `${(sib % 6) * 70}ms`);
    io.observe(el);
  });
}

/* ---------- nav scrollspy ---------- */
const spyLinks = [...document.querySelectorAll("#navLinks a")];
const spy = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        spyLinks.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)
        );
      }
    }),
  { rootMargin: "-30% 0px -60% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

/* ---------- hero stat count-up ---------- */
function countUp() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ---------- boot ---------- */
function renderAll() {
  renderOverview();
  renderVenueFilters();
  renderVenues();
  renderConfFilters();
  renderTeams();
  renderGroups();
  renderKnockout();
  renderChampions();
  renderRecords();
  renderCulture();
}
$("teamSearch").addEventListener("input", (e) => {
  teamQuery = e.target.value;
  renderTeams();
});
setLang(LANG);
countUp();
