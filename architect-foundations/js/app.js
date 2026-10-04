/* CCA-F Architect Lab: app engine (routing, labs, mock exam, practice). */
(function () {
"use strict";

const DOMAINS = window.COURSE_DOMAINS, LABS = window.COURSE_LABS;
const SCEN = window.EXAM_SCENARIOS, BANK = window.EXAM_BANK, CAL = window.CALIBRATION;
const app = document.getElementById("app");
const tabsEl = document.getElementById("tabs");
const KEYS = ["A", "B", "C", "D"];
const TYPE_LABEL = { code: "Code lab", defect: "Bug hunt", classify: "Triage", fill: "Config", order: "Sequence", editor: "Author & validate", sim: "Simulation" };

/* ---------------- utilities ---------------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
const dom = id => DOMAINS.find(d => d.id === id);
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const fmtTime = s => { s = Math.max(0, s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

function seeded(seed) {
  let h = 2166136261;
  for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}
function shuffle(arr, rnd) {
  const a = arr.slice(); rnd = rnd || Math.random;
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const range = n => Array.from({ length: n }, (_, i) => i);

/* ---------------- per-viewer progress (localStorage, optional) ---------------- */
const STORE = "ccaf-architect-lab-v1";
let P = { done: {}, exams: [] };
try { const raw = localStorage.getItem(STORE); if (raw) P = Object.assign(P, JSON.parse(raw)); } catch (e) { /* storage unavailable */ }
function save() { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) { /* ignore */ } }
function markDone(lab) { if (!P.done[lab.id]) { P.done[lab.id] = Date.now(); save(); } }
const labsOf = d => LABS.filter(l => l.d === d);
const doneCount = list => list.filter(l => P.done[l.id]).length;

/* ---------------- routing ---------------- */
let current = "overview";
function route() {
  const h = (location.hash || "").replace(/^#/, "") || "overview";
  current = h;
  if (/^d[1-5]$/.test(h)) renderDomain(+h[1]);
  else if (h.indexOf("lab-") === 0 && LABS.some(l => l.id === h.slice(4))) renderLab(LABS.find(l => l.id === h.slice(4)));
  else if (h === "exam") renderExam();
  else if (h === "practice") renderPractice();
  else { current = "overview"; renderOverview(); }
  renderTabs();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

function renderTabs() {
  let active = current;
  if (current.indexOf("lab-") === 0) active = "d" + current.slice(4, 5);
  const tabs = [["overview", "", "Overview"]]
    .concat(DOMAINS.map(d => ["d" + d.id, "D" + d.id, d.tab]))
    .concat([["exam", "", "Mock exam"], ["practice", "", "Practice"]]);
  tabsEl.innerHTML = tabs.map(([k, n, label]) =>
    `<a class="tab" href="#${k}" ${active === k ? 'aria-current="page"' : ""}>${n ? `<span class="n">${n}</span>` : ""}${esc(label)}</a>`).join("");
}

/* ---------------- overview ---------------- */
function renderOverview() {
  const total = LABS.length, done = doneCount(LABS);
  const last = P.exams.length ? P.exams[P.exams.length - 1] : null;
  const doms = DOMAINS.map(d => {
    const ls = labsOf(d.id), dn = doneCount(ls);
    return `<a class="dom" href="#d${d.id}">
      <span class="dom-num">D${d.id}</span>
      <span><span class="dom-name">${esc(d.name)}</span><br><span class="dom-sub">${d.ts.length} task statements · ${ls.length} labs · ${dn} passed</span></span>
      <span class="bar ${dn === ls.length ? "ok" : ""}" aria-label="${dn} of ${ls.length} labs passed"><i style="width:${pct(dn, ls.length)}%"></i></span>
      <span class="dom-w">${d.weight}% · ~${Math.round(d.weight * 0.6)} items</span>
    </a>`;
  }).join("");

  app.innerHTML = `
  <section class="hero">
    <div>
      <p class="eyebrow">Claude Certified Architect · Foundations</p>
      <h1>Hands-on prep for the <em>CCA‑F</em> architect exam</h1>
      <p class="lede">Write the agent loop, the refund gate, the MCP error payloads and the extraction schemas that the exam asks you to reason about. Every lab is graded in the page. Then sit a 60-item mock drawn from the exam guide's six scenarios.</p>
    </div>
    <div class="sheet sheet-pad progress-ring">
      <span class="eyebrow" style="margin:0">Your progress</span>
      <span style="font-family:var(--display);font-stretch:112%;font-size:30px;font-weight:700;line-height:1">${done}<span class="muted" style="font-size:18px"> / ${total} labs passed</span></span>
      <span class="bar ${done === total ? "ok" : ""}"><i style="width:${pct(done, total)}%"></i></span>
      <span class="muted" style="font-size:13.5px">${last ? `Last mock exam: <b style="color:var(--ink)">${last.scale}</b> (${last.pass ? "pass" : "below 720"})` : "No mock exam taken yet."}</span>
      <div class="row" style="margin-top:4px">
        <a class="btn primary sm" href="#${nextLabId() ? "lab-" + nextLabId() : "exam"}" style="text-decoration:none">${nextLabId() ? "Continue with the next lab" : "Take the mock exam"}</a>
        <a class="btn sm" href="#exam" style="text-decoration:none">Mock exam</a>
      </div>
    </div>
  </section>

  <dl class="tblock" aria-label="Exam facts">
    <div><dt>Items</dt><dd>60</dd></div>
    <div><dt>Time</dt><dd>120 <small>min</small></dd></div>
    <div><dt>Pass</dt><dd>720 <small>/ 1000</small></dd></div>
    <div><dt>Scenarios</dt><dd>4 <small>of 6</small></dd></div>
  </dl>

  <div class="sect">
    <h2 class="h2">The five sheets</h2>
    <p class="sect-sub">One sheet per exam domain, weighted as in the official content outline. Each holds a briefing on every task statement and the labs for that domain.</p>
    <div class="sheet sheet-pad" style="padding-block:6px"><div class="domains">${doms}</div></div>
  </div>

  <div class="sect">
    <h2 class="h2">How the course works</h2>
    <p class="sect-sub">Work through it in this order; each step builds on the one before.</p>
    <div class="grid3">
      <div class="sheet sheet-pad"><p class="eyebrow">Step 1</p><h3 class="h3">Read the sheet</h3><p class="muted" style="margin:0;font-size:14.5px">Each task statement from the exam guide, condensed to what's tested, plus the trap answer that catches people who know it only roughly.</p></div>
      <div class="sheet sheet-pad"><p class="eyebrow">Step 2</p><h3 class="h3">Work the labs</h3><p class="muted" style="margin:0;font-size:14.5px">${LABS.filter(l => l.type === "code").length} Python labs with pytest-style tests (run in the page or locally), plus bug hunts, config builders, schema and payload authoring with live validators, triage drills, sequencing, and a calibration simulator.</p></div>
      <div class="sheet sheet-pad"><p class="eyebrow">Step 3</p><h3 class="h3">Sit the mock</h3><p class="muted" style="margin:0;font-size:14.5px">Four random scenarios, 15 items each, 120 minutes, one best answer per item. Results break out by domain and scenario and link back to the labs for what you missed.</p></div>
    </div>
  </div>

  <div class="sect">
    <div class="drift">
      <h3>Exam guide wording vs. today's API</h3>
      <ul>
        <li>The guide describes forcing tool use with <code>tool_choice</code> <code>any</code> or a named tool. Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject forced choice with a 400; use <code>auto</code> with a prompt instruction, <code>strict: true</code> on the tool, or <code>output_config.format</code>. The bank never makes forced choice the right answer.</li>
        <li>Assistant prefill (starting the reply with <code>{</code>) returns a 400 on current models. Structured outputs replace it.</li>
        <li>Thinking depth is set with <code>output_config.effort</code> and adaptive thinking; <code>budget_tokens</code> is rejected on current models.</li>
        <li>The guide calls the subagent-spawning tool <code>Task</code>; the labs use that name.</li>
      </ul>
    </div>
  </div>

  <p class="footer">Practice material, not real exam items, and not affiliated with or endorsed by Anthropic. The domains, weights, scenarios and task statements follow Anthropic's Claude Certified Architect – Foundations exam guide (60 items, 120 minutes, scaled score 100–1,000, pass at 720). API behaviour is checked against current Claude documentation. Progress is stored only in this browser.</p>`;
}
function nextLabId() { const l = LABS.find(x => !P.done[x.id]); return l ? l.id : null; }

/* ---------------- domain page ---------------- */
function renderDomain(id) {
  const d = dom(id), ls = labsOf(id), dn = doneCount(ls);
  const ts = d.ts.map(t => `<div class="ts">
      <span class="ts-n">${t.n}</span>
      <div><h3>${esc(t.t)}</h3><ul>${t.pts.map(p => `<li>${md(p)}</li>`).join("")}</ul>
      <div class="trap"><b>Trap</b>${md(t.trap)}</div></div>
    </div>`).join("");
  const cards = ls.map(l => `<a class="labcard" href="#lab-${l.id}">
      <span class="t">${esc(l.title)}</span>
      <span class="meta">${P.done[l.id] ? '<span class="chip ok">Passed</span>' : ""}<span class="chip blue">${TYPE_LABEL[l.type]}</span></span>
      <span class="d">${md(l.summary)} <span class="mono" style="font-size:12px">· TS ${esc(l.ts)} · ~${l.mins} min</span></span>
    </a>`).join("");

  app.innerHTML = `
  <p class="crumb"><a href="#overview">Overview</a> / Sheet D${id}</p>
  <p class="eyebrow">Sheet D${id} · ${d.weight}% of scored content</p>
  <h1 style="font-size:clamp(30px,5vw,44px);font-weight:760;line-height:1.05">${esc(d.name)}</h1>
  <p class="lede">${esc(d.intro)}</p>
  <dl class="tblock" style="margin-top:22px">
    <div><dt>Weight</dt><dd>${d.weight}%</dd></div>
    <div><dt>Expected items</dt><dd>~${Math.round(d.weight * 0.6)} <small>of 60</small></dd></div>
    <div><dt>Task statements</dt><dd>${d.ts.length}</dd></div>
    <div><dt>Labs passed</dt><dd>${dn} <small>/ ${ls.length}</small></dd></div>
  </dl>
  <div class="sect">
    <h2 class="h2">Labs</h2>
    <p class="sect-sub">Graded in the page. Pass each one to tick it off.</p>
    <div class="stack">${cards}</div>
  </div>
  <div class="sect">
    <h2 class="h2">Briefing</h2>
    <p class="sect-sub">What each task statement tests, and the wrong answer that looks right.</p>
    <div class="sheet sheet-pad">${ts}</div>
  </div>
  <div class="sect row">
    <a class="btn" href="#practice" style="text-decoration:none" data-practice="d${id}">Practice D${id} questions</a>
    <span class="spacer"></span>
    ${id > 1 ? `<a class="btn" href="#d${id - 1}" style="text-decoration:none">← D${id - 1}</a>` : ""}
    ${id < 5 ? `<a class="btn" href="#d${id + 1}" style="text-decoration:none">D${id + 1} →</a>` : ""}
  </div>`;
  const pb = app.querySelector("[data-practice]");
  pb.addEventListener("click", e => { e.preventDefault(); startPractice("d", id); location.hash = "practice"; });
}

/* ---------------- lab page ---------------- */
const LS = {}; // in-memory lab state
function renderLab(lab) {
  const d = dom(lab.d), i = LABS.indexOf(lab);
  const prev = LABS[i - 1], next = LABS[i + 1];
  app.innerHTML = `
  <p class="crumb"><a href="#overview">Overview</a> / <a href="#d${d.id}">D${d.id} ${esc(d.short)}</a> / Lab ${lab.id}</p>
  <div class="row">
    <span class="chip blue">${TYPE_LABEL[lab.type]}</span>
    <span class="chip">TS ${esc(lab.ts)}</span>
    <span class="chip">~${lab.mins} min</span>
    <span id="donechip">${P.done[lab.id] ? '<span class="chip ok">Passed</span>' : ""}</span>
  </div>
  <h1 class="lab-h">${esc(lab.title)}</h1>
  <div class="brief">${lab.brief.map(p => `<p>${md(p)}</p>`).join("")}</div>
  ${lab.spec ? `<div class="spec" style="margin:6px 0 18px"><b>Requirements</b><ul>${lab.spec.map(s => `<li>${md(s)}</li>`).join("")}</ul></div>` : ""}
  <div id="ex" style="margin-top:16px"></div>
  <div id="after" style="margin-top:18px"></div>
  <div class="nav" style="margin-top:28px">
    ${prev ? `<a class="btn" href="#lab-${prev.id}" style="text-decoration:none">← ${esc(prev.title)}</a>` : ""}
    <span class="spacer"></span>
    ${next ? `<a class="btn" href="#lab-${next.id}" style="text-decoration:none">${esc(next.title)} →</a>` : `<a class="btn primary" href="#exam" style="text-decoration:none">Take the mock exam →</a>`}
  </div>`;
  drawLab(lab);
}
function drawLab(lab) {
  const host = document.getElementById("ex");
  if (!host) return;
  ({ classify: labClassify, defect: labDefect, fill: labFill, order: labOrder, editor: labEditor, code: labCode, sim: labSim })[lab.type](lab, host);
  drawAfter(lab);
}
function drawAfter(lab) {
  const el = document.getElementById("after"); if (!el) return;
  el.innerHTML = P.done[lab.id] ? `<div class="takeaway"><b>Takeaway</b>${md(lab.takeaway)}</div>` : "";
  const chip = document.getElementById("donechip");
  if (chip) chip.innerHTML = P.done[lab.id] ? '<span class="chip ok">Passed</span>' : "";
}
function pass(lab) { markDone(lab); drawAfter(lab); }

/* classify */
function labClassify(lab, host) {
  const st = LS[lab.id] || (LS[lab.id] = { picks: {}, checked: false });
  const n = lab.items.length;
  const right = lab.items.filter((it, i) => st.picks[i] === it.a).length;
  host.innerHTML = `<div class="cls">${lab.items.map((it, i) => {
      const pick = st.picks[i], ok = pick === it.a;
      return `<div class="cls-item ${st.checked ? (ok ? "ok" : "no") : ""}">
        <div class="cls-t">${md(it.t)}</div>
        <div class="seg" role="group" aria-label="Choose a category">${lab.buckets.map((b, k) =>
          `<button type="button" data-i="${i}" data-k="${k}" aria-pressed="${pick === k}" class="${st.checked && !ok && k === it.a ? "right" : ""}">${esc(b)}</button>`).join("")}</div>
        ${st.checked ? `<div class="why">${ok ? "" : `<b>Answer: ${esc(lab.buckets[it.a])}.</b> `}${md(it.why)}</div>` : ""}
      </div>`;
    }).join("")}</div>
    <div class="row" style="margin-top:16px">
      <button class="btn primary" type="button" id="chk">Check answers</button>
      <span id="msg" class="muted" style="font-size:14px">${st.checked ? (right === n ? "" : `${right} of ${n} correct. Change the red ones and check again.`) : `${Object.keys(st.picks).length} of ${n} answered`}</span>
    </div>
    ${st.checked && right === n ? `<div class="result ok" style="margin-top:12px">All ${n} correct.</div>` : ""}`;
  host.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
    st.picks[+b.dataset.i] = +b.dataset.k; st.checked = false; labClassify(lab, host);
  }));
  host.querySelector("#chk").addEventListener("click", () => {
    const left = n - Object.keys(st.picks).length;
    if (left) { host.querySelector("#msg").textContent = `Answer all ${n} items first (${left} left).`; return; }
    st.checked = true; labClassify(lab, host);
    if (lab.items.every((it, i) => st.picks[i] === it.a)) pass(lab);
  });
}

/* defect (bug hunt) */
function labDefect(lab, host) {
  const st = LS[lab.id] || (LS[lab.id] = { sel: lab.rounds.map(() => []), checked: lab.rounds.map(() => false) });
  host.innerHTML = lab.rounds.map((r, ri) => {
    const sel = st.sel[ri], ck = st.checked[ri];
    const exact = sel.length === r.bad.length && r.bad.every(b => sel.indexOf(b) >= 0);
    const lines = r.code.map((ln, li) => {
      const s = sel.indexOf(li) >= 0, isBad = r.bad.indexOf(li) >= 0;
      const cls = ck ? (isBad ? (s ? "isbad" : "missed") : "") : "";
      return `<button type="button" class="ln ${cls}" data-r="${ri}" data-l="${li}" aria-pressed="${s}"><i>${li + 1}</i>${esc(ln) || " "}</button>`;
    }).join("");
    const wrongPicks = ck ? sel.filter(x => r.bad.indexOf(x) < 0).map(x => x + 1) : [];
    return `<div class="sheet sheet-pad" style="margin-bottom:16px">
      <p class="eyebrow">Snippet ${ri + 1} of ${lab.rounds.length}${r.bad.length > 1 ? ` · ${r.bad.length} lines` : ""}</p>
      <h3 class="h3" style="font-stretch:105%">${esc(r.title)}</h3>
      <div class="code" style="margin:10px 0 12px">${lines}</div>
      <div class="row"><button type="button" class="btn sm primary" data-chk="${ri}">Check snippet ${ri + 1}</button>
        <span class="muted" style="font-size:13.5px">${sel.length ? `Selected line${sel.length > 1 ? "s" : ""} ${sel.slice().sort((a, b) => a - b).map(x => x + 1).join(", ")}` : "Click the line(s) at fault"}</span></div>
      ${ck ? `<div class="result ${exact ? "ok" : "bad"}" style="margin-top:12px">${exact ? "Correct." : `Not quite.${wrongPicks.length ? ` Line${wrongPicks.length > 1 ? "s" : ""} ${wrongPicks.join(", ")} ${wrongPicks.length > 1 ? "are" : "is"} fine.` : ""} The faulty line${r.bad.length > 1 ? "s are" : " is"} ${r.bad.map(x => x + 1).join(", ")}.`}</div>
        <div class="why" style="border-top:none;padding-top:0">${md(r.why)}</div>
        <p class="mono muted" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin:12px 0 4px">Fix</p>
        <div class="code"><pre>${esc(r.fix)}</pre></div>` : ""}
    </div>`;
  }).join("");
  host.querySelectorAll(".ln").forEach(b => b.addEventListener("click", () => {
    const ri = +b.dataset.r, li = +b.dataset.l, sel = st.sel[ri];
    const k = sel.indexOf(li); if (k >= 0) sel.splice(k, 1); else sel.push(li);
    st.checked[ri] = false; labDefect(lab, host);
  }));
  host.querySelectorAll("[data-chk]").forEach(b => b.addEventListener("click", () => {
    const ri = +b.dataset.chk; st.checked[ri] = true; labDefect(lab, host);
    const allOk = lab.rounds.every((r, i) => st.checked[i] && st.sel[i].length === r.bad.length && r.bad.every(x => st.sel[i].indexOf(x) >= 0));
    if (allOk) pass(lab);
  }));
}

/* fill (config with blanks) */
function labFill(lab, host) {
  const st = LS[lab.id] || (LS[lab.id] = { picks: {}, checked: false, perm: lab.blanks.map((b, i) => shuffle(range(b.opts.length), seeded(lab.id + ":" + i))) });
  const parts = lab.code.split(/\{\{(\d+)\}\}/);
  let html = "";
  parts.forEach((p, i) => {
    if (i % 2 === 0) { html += esc(p); return; }
    const b = +p, bl = lab.blanks[b], pick = st.picks[b];
    const cls = st.checked ? (pick === bl.a ? "ok" : "no") : "";
    html += `<select data-b="${b}" class="${cls}" aria-label="Blank ${b + 1}"><option value="">[${b + 1}] choose…</option>${st.perm[b].map(o =>
      `<option value="${o}" ${pick === o ? "selected" : ""}>${esc(bl.opts[o])}</option>`).join("")}</select>`;
  });
  const right = lab.blanks.filter((b, i) => st.picks[i] === b.a).length;
  host.innerHTML = `<div class="code"><pre>${html}</pre></div>
    <div class="row" style="margin-top:14px"><button type="button" class="btn primary" id="chk">Check config</button>
      <span id="msg" class="muted" style="font-size:14px">${st.checked && right < lab.blanks.length ? `${right} of ${lab.blanks.length} blanks correct.` : ""}</span></div>
    ${st.checked ? `<div class="sheet sheet-pad" style="margin-top:14px">${lab.blanks.map((b, i) => {
      const ok = st.picks[i] === b.a;
      return `<div class="blank-why"><span class="k">[${i + 1}]</span><span><span class="chip ${ok ? "ok" : "bad"}">${ok ? "Correct" : "Incorrect"}</span> ${ok ? "" : `Answer: <code>${esc(b.opts[b.a])}</code>. `}${md(b.why)}</span></div>`;
    }).join("")}</div>` : ""}`;
  host.querySelectorAll("select").forEach(s => s.addEventListener("change", () => {
    st.picks[+s.dataset.b] = s.value === "" ? undefined : +s.value; st.checked = false; labFill(lab, host);
  }));
  host.querySelector("#chk").addEventListener("click", () => {
    const left = lab.blanks.filter((b, i) => st.picks[i] === undefined).length;
    if (left) { host.querySelector("#msg").textContent = `Fill every blank first (${left} left).`; return; }
    st.checked = true; labFill(lab, host);
    if (lab.blanks.every((b, i) => st.picks[i] === b.a)) pass(lab);
  });
}

/* order */
function labOrder(lab, host) {
  const st = LS[lab.id] || (LS[lab.id] = (() => {
    let o = shuffle(range(lab.items.length), seeded(lab.id));
    if (o.every((v, i) => v === i)) o = o.reverse();
    return { order: o, checked: false };
  })());
  const n = lab.items.length;
  const right = st.order.filter((v, i) => v === i).length;
  host.innerHTML = `<div class="ord">${st.order.map((v, pos) => `
    <div class="ord-item ${st.checked ? (v === pos ? "ok" : "no") : ""}">
      <span class="n">${pos + 1}</span>
      <span>${md(lab.items[v])}</span>
      <span class="mv"><button type="button" data-p="${pos}" data-dir="-1" aria-label="Move up" ${pos === 0 ? "disabled" : ""}>↑</button><button type="button" data-p="${pos}" data-dir="1" aria-label="Move down" ${pos === n - 1 ? "disabled" : ""}>↓</button></span>
    </div>`).join("")}</div>
    <div class="row" style="margin-top:14px"><button type="button" class="btn primary" id="chk">Check order</button>
    <span class="muted" style="font-size:14px">${st.checked && right < n ? `${right} of ${n} in the right position.` : ""}</span></div>
    ${st.checked ? `<div class="result ${right === n ? "ok" : "bad"}" style="margin-top:12px">${right === n ? "Correct order." : "Green steps are in place; move the red ones."}</div>
      ${right === n ? `<div class="why" style="border-top:none">${md(lab.why)}</div>` : ""}` : ""}`;
  host.querySelectorAll(".mv button").forEach(b => b.addEventListener("click", () => {
    const p = +b.dataset.p, q = p + (+b.dataset.dir);
    [st.order[p], st.order[q]] = [st.order[q], st.order[p]]; st.checked = false; labOrder(lab, host);
    const btn = host.querySelector(`.mv button[data-p="${q}"][data-dir="${b.dataset.dir}"]`) || host.querySelector(`.mv button[data-p="${q}"]`);
    if (btn) btn.focus();
  }));
  host.querySelector("#chk").addEventListener("click", () => {
    st.checked = true; labOrder(lab, host);
    if (st.order.every((v, i) => v === i)) pass(lab);
  });
}

/* editor (author & validate) */
function editorKeys(ta, unit) {
  unit = unit || "  ";
  const put = text => { ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); };
  ta.addEventListener("keydown", e => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); put(unit); }
    else if (e.key === "Enter" && unit.length === 4) {
      // Python: keep the current indent, and indent one level after a line ending in ':'
      const before = ta.value.slice(0, ta.selectionStart), line = before.slice(before.lastIndexOf("\n") + 1);
      let ind = (line.match(/^[ \t]*/) || [""])[0];
      if (/:\s*(#.*)?$/.test(line)) ind += unit;
      e.preventDefault(); put("\n" + ind);
    }
  });
}
function labEditor(lab, host) {
  const st = LS[lab.id] || (LS[lab.id] = { text: lab.tasks.map(t => t.starter), res: lab.tasks.map(() => null), sol: lab.tasks.map(() => false) });
  host.innerHTML = lab.tasks.map((t, ti) => `
    <div class="sheet sheet-pad" style="margin-bottom:16px">
      ${lab.tasks.length > 1 ? `<p class="eyebrow">Task ${ti + 1} of ${lab.tasks.length}</p>` : ""}
      <h3 class="h3 mono" style="font-family:var(--mono);font-stretch:100%;font-size:14.5px">${esc(t.label)}</h3>
      <p style="margin:4px 0 12px;font-size:14.5px;color:var(--ink-2)">${md(t.prompt)}</p>
      <label class="sr" for="ed-${lab.id}-${ti}">Editor for ${esc(t.label)}</label>
      <textarea class="editor" id="ed-${lab.id}-${ti}" data-t="${ti}" spellcheck="false" autocapitalize="off" autocomplete="off" style="min-height:${Math.min(560, 60 + t.starter.split("\n").length * 21)}px">${esc(st.text[ti])}</textarea>
      <div class="row" style="margin-top:10px">
        <button type="button" class="btn primary sm" data-run="${ti}">Run checks</button>
        <button type="button" class="btn sm" data-reset="${ti}">Reset</button>
        <button type="button" class="linkbtn" data-sol="${ti}">${st.sol[ti] ? "Hide" : "Show"} a reference answer</button>
      </div>
      <div data-out="${ti}" style="margin-top:12px"></div>
      ${st.sol[ti] ? `<div class="code" style="margin-top:12px"><pre>${esc(t.solution)}</pre></div>` : ""}
    </div>`).join("");
  host.querySelectorAll("textarea").forEach(ta => { editorKeys(ta); ta.addEventListener("input", () => { st.text[+ta.dataset.t] = ta.value; }); });
  lab.tasks.forEach((t, ti) => { if (st.res[ti]) drawChecks(host, ti, st.res[ti]); });
  host.querySelectorAll("[data-run]").forEach(b => b.addEventListener("click", () => {
    const ti = +b.dataset.run; st.res[ti] = CHECKS[lab.tasks[ti].check](st.text[ti]);
    drawChecks(host, ti, st.res[ti]);
    if (lab.tasks.every((t, i) => st.res[i] && st.res[i].items.every(x => x.ok))) pass(lab);
  }));
  host.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", () => {
    const ti = +b.dataset.reset; st.text[ti] = lab.tasks[ti].starter; st.res[ti] = null; labEditor(lab, host);
  }));
  host.querySelectorAll("[data-sol]").forEach(b => b.addEventListener("click", () => { const ti = +b.dataset.sol; st.sol[ti] = !st.sol[ti]; labEditor(lab, host); }));
}
function drawChecks(host, ti, res) {
  const out = host.querySelector(`[data-out="${ti}"]`); if (!out) return;
  const ok = res.items.filter(x => x.ok).length;
  out.innerHTML = `<div class="result ${ok === res.items.length ? "ok" : "bad"}" style="margin-bottom:8px">${ok} of ${res.items.length} checks pass.</div>
    <div class="tests">${res.items.map(x => `<div class="test ${x.ok ? "ok" : "no"}"><span class="m">${x.ok ? "✓" : "✗"}</span><span>${md(x.msg)}</span></div>`).join("")}</div>
    ${res.extra || ""}`;
}

/* --- validators for editor labs --- */
function findKey(obj, re) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) if (re.test(k)) return obj[k];
  for (const k of Object.keys(obj)) { const v = findKey(obj[k], re); if (v !== undefined) return v; }
  return undefined;
}
function parseJson(text) { try { return { j: JSON.parse(text) }; } catch (e) { return { err: e.message }; } }
function textOf(j) { return (Array.isArray(j.content) ? j.content : []).filter(b => b && b.type === "text").map(b => String(b.text || "")).join(" ").trim(); }
const CHECKS = {
  lookup(text) {
    const { j, err } = parseJson(text);
    if (err) return { items: [{ ok: false, msg: "Valid JSON. Parser says: " + err }] };
    const sc = j.structuredContent, items = [{ ok: true, msg: "Valid JSON" }];
    const txt = textOf(j);
    items.push({ ok: j.isError === true, msg: "Top-level `isError: true`, so the call is marked as failed" });
    items.push({ ok: txt.length >= 20 && !/^operation failed\.?$/i.test(txt), msg: "A `content` text block explaining what happened in plain language" });
    items.push({ ok: !!sc && typeof sc === "object", msg: "A `structuredContent` object with machine-readable fields" });
    items.push({ ok: String(findKey(sc, /^error_?category$/i)).toLowerCase() === "transient", msg: "`errorCategory: \"transient\"` (a timeout)" });
    items.push({ ok: findKey(sc, /^is_?retryable$/i) === true, msg: "`isRetryable: true`" });
    const aq = findKey(sc, /attempt|query/i);
    items.push({ ok: aq !== undefined && JSON.stringify(aq).indexOf("A-204918") >= 0, msg: "The attempted query, including order `A-204918`" });
    const pr = findKey(sc, /partial/i), prs = JSON.stringify(pr || "").toLowerCase();
    items.push({ ok: Array.isArray(pr) && prs.indexOf("us-east") >= 0 && prs.indexOf("apac") >= 0, msg: "`partialResults`: an array holding the US-East and APAC rows" });
    return { items };
  },
  refund(text) {
    const { j, err } = parseJson(text);
    if (err) return { items: [{ ok: false, msg: "Valid JSON. Parser says: " + err }] };
    const sc = j.structuredContent, items = [{ ok: true, msg: "Valid JSON" }];
    const txt = textOf(j);
    items.push({ ok: j.isError === true, msg: "Top-level `isError: true`" });
    items.push({ ok: txt.length >= 20 && !/^operation failed\.?$/i.test(txt), msg: "A `content` text block explaining the rejection" });
    items.push({ ok: !!sc && typeof sc === "object", msg: "A `structuredContent` object" });
    items.push({ ok: String(findKey(sc, /^error_?category$/i)).toLowerCase() === "business", msg: "`errorCategory: \"business\"` (a policy rule, not a fault)" });
    items.push({ ok: findKey(sc, /^is_?retryable$/i) === false, msg: "`isRetryable: false`" });
    const aq = findKey(sc, /attempt|query/i);
    items.push({ ok: aq !== undefined && JSON.stringify(aq).indexOf("A-118842") >= 0, msg: "The attempted call, including order `A-118842`" });
    const cm = findKey(sc, /customer|explanation|message/i);
    items.push({ ok: typeof cm === "string" && cm.length >= 30 && /90/.test(cm), msg: "A customer-facing explanation that mentions the 90-day policy" });
    return { items };
  },
  rules(text) {
    const fm = parseFrontmatter(text);
    if (!fm) return { items: [{ ok: false, msg: "Starts with a YAML frontmatter block between `---` lines" }] };
    const globs = fm.paths.filter(Boolean);
    const items = [{ ok: true, msg: "YAML frontmatter block found" }, { ok: globs.length > 0, msg: "A `paths:` key with at least one glob" }];
    let res;
    try { const res0 = globs.map(globToRe); res = res0; } catch (e) { items.push({ ok: false, msg: "Every glob compiles. Problem: " + e.message }); return { items }; }
    const hit = p => res.some(r => r.test(p));
    const MUST = ["src/components/Button.test.tsx", "src/utils/date.test.ts", "packages/api/src/handlers/refund.test.ts", "setup.test.ts"];
    const NOT = ["src/components/Button.tsx", "src/components/Button.stories.tsx", "e2e/checkout.spec.ts", "docs/testing.md", "src/utils/test-helpers.ts"];
    const missed = MUST.filter(p => !hit(p)), extra = NOT.filter(hit);
    items.push({ ok: !missed.length, msg: missed.length ? `Loads for every test file. Missing: ${missed.map(p => "`" + p + "`").join(", ")}` : "Loads for every test file, including the root-level one" });
    items.push({ ok: !extra.length, msg: extra.length ? `Loads for nothing else. Also matched: ${extra.map(p => "`" + p + "`").join(", ")}` : "Loads for nothing else" });
    items.push({ ok: /\S/.test(fm.body), msg: "The body still contains the conventions" });
    const rows = MUST.map(p => [p, true]).concat(NOT.map(p => [p, false])).map(([p, want]) => {
      const got = hit(p), ok = got === want;
      return `<tr><td class="mono" style="font-size:12.5px">${esc(p)}</td><td>${want ? "Load" : "Skip"}</td><td><span class="chip ${ok ? "ok" : "bad"}">${got ? "Loads" : "Skipped"}</span></td></tr>`;
    }).join("");
    return { items, extra: `<div class="tw" style="margin-top:12px"><table class="sim-table"><thead><tr><th>Path</th><th>Should</th><th>Your globs: ${esc(globs.join(", ") || "none")}</th></tr></thead><tbody>${rows}</tbody></table></div>` };
  },
  schema(text) {
    const { j, err } = parseJson(text);
    if (err) return { items: [{ ok: false, msg: "Valid JSON. Parser says: " + err }] };
    const p = (j && j.properties) || {};
    const T = v => { if (!v) return []; let t = Array.isArray(v.type) ? v.type : (v.type ? [v.type] : []); if (Array.isArray(v.anyOf)) v.anyOf.forEach(x => { t = t.concat(T(x)); }); return t; };
    const req = Array.isArray(j.required) ? j.required : [];
    const en = p.payment_terms && Array.isArray(p.payment_terms.enum) ? p.payment_terms.enum : [];
    return { items: [
      { ok: true, msg: "Valid JSON" },
      { ok: T(p.po_number).indexOf("null") >= 0 && T(p.po_number).indexOf("string") >= 0, msg: "`po_number` accepts a string or null" },
      { ok: T(p.due_date).indexOf("null") >= 0 && T(p.due_date).indexOf("string") >= 0, msg: "`due_date` accepts a string or null" },
      { ok: en.indexOf("other") >= 0, msg: "`payment_terms` enum includes \"other\"" },
      { ok: !!p.payment_terms_detail && T(p.payment_terms_detail).indexOf("string") >= 0 && T(p.payment_terms_detail).indexOf("null") >= 0, msg: "A nullable `payment_terms_detail` string for the verbatim terms" },
      { ok: T(p.stated_total).indexOf("number") >= 0, msg: "`stated_total` is still extracted as a number" },
      { ok: T(p.calculated_total).indexOf("number") >= 0, msg: "`calculated_total` (number): the sum of the line items" },
      { ok: T(p.conflict_detected).indexOf("boolean") >= 0, msg: "`conflict_detected` (boolean) so mismatches can be routed" },
      { ok: j.additionalProperties === false, msg: "`additionalProperties: false` at the top level" },
      { ok: Object.keys(p).length > 0 && Object.keys(p).every(k => req.indexOf(k) >= 0), msg: "Every property is listed in `required`; absence is expressed with null" }
    ] };
  }
};
function unq(s) { s = String(s).trim(); return (/^(["']).*\1$/.test(s)) ? s.slice(1, -1) : s; }
function splitList(s) {
  const out = []; let cur = "", depth = 0, q = null;
  for (const c of s) {
    if (q) { if (c === q) q = null; cur += c; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === "{") depth++; if (c === "}") depth--;
    if (c === "," && depth === 0) { out.push(unq(cur)); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(unq(cur));
  return out;
}
function parseFrontmatter(text) {
  const m = String(text).replace(/^﻿/, "").replace(/\r\n/g, "\n").match(/^\s*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);
  if (!m) return null;
  const lines = m[1].split("\n"); let paths = null;
  for (let i = 0; i < lines.length; i++) {
    const mm = lines[i].match(/^paths\s*:\s*(.*)$/); if (!mm) continue;
    const rest = mm[1].trim();
    if (rest.charAt(0) === "[") paths = splitList(rest.replace(/^\[/, "").replace(/\]\s*$/, ""));
    else if (rest) paths = [unq(rest)];
    else {
      paths = [];
      for (let k = i + 1; k < lines.length; k++) {
        const li = lines[k].match(/^\s*-\s*(.+)$/);
        if (li) paths.push(unq(li[1])); else if (lines[k].trim() === "") continue; else break;
      }
    }
  }
  return { paths: paths || [], body: m[2] };
}
function globToRe(g) {
  g = String(g).trim().replace(/^\.\//, "");
  let re = "", depth = 0;
  for (let i = 0; i < g.length;) {
    if (g.startsWith("**/", i)) { re += "(?:.*/)?"; i += 3; continue; }
    if (g.startsWith("**", i)) { re += ".*"; i += 2; continue; }
    const c = g[i++];
    if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else if (c === "{") { re += "(?:"; depth++; }
    else if (c === "}" && depth) { re += ")"; depth--; }
    else if (c === "," && depth) re += "|";
    else re += c.replace(/[.+^$()|[\]\\]/g, "\\$&");
  }
  if (depth) throw new Error("unclosed { in " + g);
  return new RegExp("^" + re + "$");
}

/* code (Python labs, run with Brython in a sandboxed worker) */
const BRYTHON = window.__BRYTHON_BASE || "https://cdn.jsdelivr.net/npm/brython@3.14.3/";
const PY_WORKER = [
  "try{var L=self.navigator.language;new Intl.DateTimeFormat(L);}catch(x){try{Object.defineProperty(self.navigator,'language',{value:'en-US'});}catch(y){}}",
  "self.onmessage=function(e){var m=e.data;",
  " if(m.base){try{importScripts(m.base+'brython.min.js',m.base+'brython_stdlib.js');",
  "  __BRYTHON__.runPythonSource('import json, sys, types, io, copy, re, traceback\\nfrom datetime import datetime, timezone');",
  "  self.postMessage({ready:true});}catch(err){self.postMessage({loadError:String(err&&err.message||err)});}return;}",
  " self.__RESULT__=null;",
  " try{__BRYTHON__.runPythonSource(m.src);}catch(err){}",
  " self.postMessage({id:m.id,result:self.__RESULT__});",
  "};"].join("\n");
let pyW = null, pyReady = null, pySeq = 0, pyState = "idle";
function pyWorker() {
  if (pyReady) return pyReady;
  pyState = "loading";
  pyReady = new Promise((resolve, reject) => {
    let w;
    try { w = new Worker(URL.createObjectURL(new Blob([PY_WORKER], { type: "text/javascript" }))); }
    catch (e) { reject(new Error("The browser refused to start a worker: " + e.message)); return; }
    const t = setTimeout(() => { w.terminate(); reject(new Error("Timed out loading the Python runtime.")); }, 90000);
    w.onmessage = e => {
      clearTimeout(t);
      if (e.data && e.data.ready) { pyW = w; resolve(w); }
      else { w.terminate(); reject(new Error((e.data && e.data.loadError) || "The Python runtime failed to load.")); }
    };
    w.onerror = e => { clearTimeout(t); if (e.preventDefault) e.preventDefault(); w.terminate(); reject(new Error(e.message || "The worker could not start.")); };
    w.postMessage({ base: BRYTHON });
  });
  pyReady.then(() => { pyState = "ready"; refreshPyStatus(); }, () => { pyState = "failed"; pyReady = null; refreshPyStatus(); });
  return pyReady;
}
function resetPy() { if (pyW) { try { pyW.terminate(); } catch (e) { /* ignore */ } } pyW = null; pyReady = null; pyState = "idle"; }
async function runPython(src, ms) {
  let w;
  try { w = await pyWorker(); } catch (e) { return { loadError: e.message }; }
  const id = ++pySeq;
  return new Promise(resolve => {
    const t = setTimeout(() => { resetPy(); resolve({ fatal: "Timed out after " + ms / 1000 + " seconds. Is there a loop that never ends?" }); }, ms);
    w.onmessage = e => {
      if (!e.data || e.data.id !== id) return;
      clearTimeout(t);
      try { resolve(JSON.parse(e.data.result)); } catch (x) { resolve({ fatal: "The Python runner stopped before reporting results." }); }
    };
    w.onerror = e => { clearTimeout(t); if (e.preventDefault) e.preventDefault(); resetPy(); resolve({ fatal: e.message || "The worker crashed." }); };
    w.postMessage({ id, src });
  });
}
function pyProgram(lab, code, tests) {
  const J = JSON.stringify;
  return [
    "import sys, types, json, io, traceback",
    "from browser import self as _scope",
    "_MOD = " + J(lab.py),
    "_USER = " + J(code),
    "_TESTS = " + J(tests),
    "_out = io.StringIO()",
    "_results = []",
    "if not getattr(json, '_lab_patched', False):",  // Brython raises its own JSONError; match CPython's ValueError subclass
    "    class JSONDecodeError(ValueError):",
    "        pass",
    "    _loads = json.loads",
    "    def _patched_loads(s, *a, **k):",
    "        try:",
    "            return _loads(s, *a, **k)",
    "        except ValueError:",
    "            raise",
    "        except Exception as e:",
    "            raise JSONDecodeError(str(e))",
    "    json.loads = _patched_loads",
    "    json.JSONDecodeError = JSONDecodeError",
    "    json._lab_patched = True",
    "def _where(exc):",
    "    try:",
    "        for fr in reversed(traceback.extract_tb(exc.__traceback__)):",
    "            if fr.filename == _MOD + '.py':",
    "                return ' (' + _MOD + '.py, line ' + str(fr.lineno) + ')'",
    "    except Exception:",
    "        pass",
    "    return ''",
    "_old = sys.stdout",
    "sys.stdout = _out",
    "try:",
    "    _mod = types.ModuleType(_MOD)",
    "    _mod.__file__ = _MOD + '.py'",
    "    try:",
    "        exec(compile(_USER, _MOD + '.py', 'exec'), _mod.__dict__)",
    "    except SyntaxError as e:",
    "        _results.append({'name': 'Your code compiles', 'pass': False, 'detail': 'SyntaxError: ' + str(e.msg) + ' (line ' + str(e.lineno) + ')'})",
    "    except Exception as e:",
    "        _results.append({'name': 'Your module loads', 'pass': False, 'detail': type(e).__name__ + ': ' + str(e) + _where(e)})",
    "    else:",
    "        sys.modules[_MOD] = _mod",
    "        _ns = {'__name__': 'test_' + _MOD}",
    "        try:",
    "            exec(compile(_TESTS, 'test_' + _MOD + '.py', 'exec'), _ns)",
    "        except Exception as e:",
    "            _results.append({'name': 'The tests can import your code', 'pass': False, 'detail': type(e).__name__ + ': ' + str(e)})",
    "        else:",
    "            for _name, _fn in list(_ns.items()):",
    "                if not (_name.startswith('test_') and callable(_fn)):",
    "                    continue",
    "                _doc = ((_fn.__doc__ or _name).strip().splitlines() or [_name])[0]",
    "                try:",
    "                    _fn()",
    "                    _results.append({'name': _doc, 'pass': True, 'detail': ''})",
    "                except AssertionError as e:",
    "                    _results.append({'name': _doc, 'pass': False, 'detail': str(e) or 'Assertion failed'})",
    "                except Exception as e:",
    "                    _results.append({'name': _doc, 'pass': False, 'detail': 'Raised ' + type(e).__name__ + ': ' + str(e) + _where(e)})",
    "finally:",
    "    sys.stdout = _old",
    "    sys.modules.pop(_MOD, None)",
    "_scope.__RESULT__ = json.dumps({'tests': _results, 'stdout': _out.getvalue()[-4000:]})"
  ].join("\n");
}
const FILES = {};
function labFiles(lab) {
  if (!FILES[lab.py]) {
    const get = p => fetch(p).then(r => { if (!r.ok) throw new Error(p + " (HTTP " + r.status + ")"); return r.text(); });
    FILES[lab.py] = Promise.all([get("labs/" + lab.py + ".py"), get("labs/solutions/" + lab.py + ".py"), get("labs/tests/test_" + lab.py + ".py")])
      .then(([starter, solution, tests]) => ({ starter, solution, tests }));
    FILES[lab.py].catch(() => { delete FILES[lab.py]; });
  }
  return FILES[lab.py];
}
function refreshPyStatus() {
  const el = document.getElementById("pystatus"); if (!el) return;
  el.textContent = { idle: "Python runtime loads on first run", loading: "Loading the Python runtime (about 6 MB, first time only)…", ready: "Python runtime ready", failed: "Python runtime unavailable here" }[pyState];
}
const localHint = lab => `<details class="spec" style="margin-top:14px"><summary style="cursor:pointer"><b>Run it locally with pytest</b></summary>
  <p style="margin:8px 0 6px">The same files are in the repository under <code>architect-foundations/labs/</code>. Edit <code>${esc(lab.py)}.py</code>, then from that folder:</p>
  <div class="code"><pre>pip install pytest
pytest tests/test_${esc(lab.py)}.py
LAB_TARGET=solutions pytest tests/test_${esc(lab.py)}.py   # check the reference solution</pre></div></details>`;
function labCode(lab, host) {
  const st = LS[lab.id] || (LS[lab.id] = { code: null, files: null, res: null, sol: false, tests: false, busy: false, err: null });
  if (!st.files) {
    host.innerHTML = st.err
      ? `<div class="result bad">Couldn't load the lab files: ${esc(st.err)}</div>${localHint(lab)}`
      : `<p class="muted">Loading the lab files…</p>`;
    if (!st.err) labFiles(lab).then(f => { st.files = f; if (st.code === null) st.code = f.starter; },
                                   e => { st.err = e.message; })
      .then(() => { if (document.getElementById("ex") === host) labCode(lab, host); });
    return;
  }
  if (pyState === "idle") pyWorker().catch(() => {});
  const lines = Math.max(st.code.split("\n").length, st.files.starter.split("\n").length) + 2;
  host.innerHTML = `
    <div class="row" style="margin-bottom:8px"><span class="chip blue">Python</span><span class="mono muted" style="font-size:12.5px">${esc(lab.py)}.py</span><span class="spacer"></span><span class="muted" id="pystatus" style="font-size:12.5px"></span></div>
    <label class="sr" for="code-${lab.id}">Python editor</label>
    <textarea class="editor" id="code-${lab.id}" spellcheck="false" autocapitalize="off" autocomplete="off" style="min-height:${Math.min(680, 40 + lines * 21)}px">${esc(st.code)}</textarea>
    <div class="row" style="margin-top:10px">
      <button type="button" class="btn primary" id="run" ${st.busy ? "disabled" : ""}>${st.busy ? "Running…" : "Run tests"}</button>
      <button type="button" class="btn" id="reset">Reset to starter</button>
      <button type="button" class="linkbtn" id="showtests">${st.tests ? "Hide" : "Show"} the tests</button>
      <button type="button" class="linkbtn" id="sol">${st.sol ? "Hide" : "Show"} reference solution</button>
    </div>
    <div id="out" style="margin-top:14px"></div>
    ${st.tests ? `<p class="mono muted" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin:16px 0 4px">tests/test_${esc(lab.py)}.py</p><div class="code"><pre>${esc(st.files.tests)}</pre></div>` : ""}
    ${st.sol ? `<p class="mono muted" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin:16px 0 4px">solutions/${esc(lab.py)}.py</p><div class="code"><pre>${esc(st.files.solution)}</pre></div>
      <button type="button" class="btn sm" id="loadsol" style="margin-top:8px">Load into editor</button>` : ""}
    ${localHint(lab)}`;
  refreshPyStatus();
  const ta = host.querySelector("textarea");
  editorKeys(ta, "    ");
  ta.addEventListener("input", () => { st.code = ta.value; });
  if (st.res) drawTests(host, st.res, st.files.tests);
  host.querySelector("#reset").addEventListener("click", () => { st.code = st.files.starter; st.res = null; labCode(lab, host); });
  host.querySelector("#sol").addEventListener("click", () => { st.sol = !st.sol; labCode(lab, host); });
  host.querySelector("#showtests").addEventListener("click", () => { st.tests = !st.tests; labCode(lab, host); });
  const ls = host.querySelector("#loadsol");
  if (ls) ls.addEventListener("click", () => { st.code = st.files.solution; st.res = null; st.sol = false; labCode(lab, host); });
  host.querySelector("#run").addEventListener("click", async () => {
    st.busy = true; labCode(lab, host);
    const res = await runPython(pyProgram(lab, st.code, st.files.tests), 15000);
    st.busy = false; st.res = res;
    if (document.getElementById("ex") === host) labCode(lab, host);
    if (res && Array.isArray(res.tests) && res.tests.length && res.tests.every(r => r.pass)) pass(lab);
  });
}
function testTitles(src) {
  const titles = {}, re = /def (test_\w+)\([^)]*\):[ \t]*\n[ \t]+(?:"""|''')([^\n]*?)(?:"""|'''|\n)/g;
  let m; while ((m = re.exec(src))) titles[m[1]] = m[2].trim();
  return titles;
}
function drawTests(host, res, testsSrc) {
  const out = host.querySelector("#out"); if (!out) return;
  if (res.loadError) {
    out.innerHTML = `<div class="result bad"><b>The Python runtime couldn't load in this viewer.</b> It comes from cdn.jsdelivr.net and needs permission to run code in the page. Use the pytest instructions below to run this lab on your machine. <span class="mono" style="font-size:12.5px">(${esc(res.loadError)})</span></div>`;
    return;
  }
  if (!Array.isArray(res.tests)) {
    out.innerHTML = `<div class="result bad"><b>Your code didn't finish.</b> <span class="mono" style="font-size:13px">${esc(res.fatal || "Unknown error")}</span></div>`;
    return;
  }
  const ok = res.tests.filter(r => r.pass).length, n = res.tests.length, titles = testTitles(testsSrc || "");
  res.tests.forEach(r => { if (titles[r.name]) r.name = titles[r.name]; });
  out.innerHTML = `<div class="result ${ok === n ? "ok" : "bad"}" style="margin-bottom:8px">${ok} of ${n} tests pass.</div>
    <div class="tests">${res.tests.map(r => `<div class="test ${r.pass ? "ok" : "no"}"><span class="m">${r.pass ? "✓" : "✗"}</span><span>${esc(r.name)}${r.detail ? `<br><span class="dt">${esc(r.detail)}</span>` : ""}</span></div>`).join("")}</div>
    ${res.stdout ? `<p class="mono muted" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin:14px 0 4px">Printed output</p><div class="code"><pre>${esc(res.stdout)}</pre></div>` : ""}`;
}

/* sim: calibration */
function labSim(lab, host) {
  const st = LS[lab.id] || (LS[lab.id] = { th: CAL.types.map(() => 0), audit: 0, link: false });
  const N = CAL.types.reduce((s, t) => s + t.counts.reduce((a, b) => a + b, 0), 0);
  let aggOk = 0; CAL.types.forEach(t => t.counts.forEach((c, i) => { aggOk += c * t.acc[i]; }));
  const rows = CAL.types.map((t, ti) => {
    const k = st.th[ti]; let n = 0, e = 0, rev = 0;
    t.counts.forEach((c, i) => { if (i >= k) { n += c; e += c * (1 - t.acc[i]); } else rev += c; });
    const fields = t.counts.reduce((a, b) => a + b, 0);
    return { t, ti, k, n, err: n ? e / n : 0, rev, fields };
  });
  const auto = rows.reduce((s, r) => s + r.n, 0);
  const audit = st.audit ? Math.round(auto * CAL.auditRate) : 0;
  const review = rows.reduce((s, r) => s + r.rev, 0) + audit;
  const worst = rows.reduce((m, r) => r.err > m.err ? r : m, rows[0]);
  const errOk = rows.every(r => r.err <= CAL.errTarget + 1e-9), budgetOk = review / N <= CAL.reviewBudget + 1e-9, auditOk = st.audit === 2;
  const allOk = errOk && budgetOk && auditOk;
  const p1 = v => (v * 100).toFixed(1) + "%";
  host.innerHTML = `
    <div class="grid3" style="margin-bottom:14px">
      <div class="stat"><span class="k">Aggregate accuracy</span><span class="v">${p1(aggOk / N)}</span><span class="muted" style="font-size:12.5px">all ${N.toLocaleString()} fields, before thresholds</span></div>
      <div class="stat"><span class="k">Worst auto-accept error</span><span class="v" style="color:${errOk ? "var(--ok)" : "var(--bad)"}">${p1(worst.err)}</span><span class="muted" style="font-size:12.5px">${esc(worst.t.name)} · target ≤ ${p1(CAL.errTarget)}</span></div>
      <div class="stat"><span class="k">Human review load</span><span class="v" style="color:${budgetOk ? "var(--ok)" : "var(--bad)"}">${p1(review / N)}</span><span class="muted" style="font-size:12.5px">${review.toLocaleString()} fields · budget ≤ ${p1(CAL.reviewBudget)}</span></div>
    </div>
    <div class="sheet sheet-pad">
      <div class="row" style="margin-bottom:6px"><h3 class="h3" style="margin:0">Auto-accept thresholds</h3><span class="spacer"></span>
        <label class="radio" style="padding:0"><input type="checkbox" id="link" ${st.link ? "checked" : ""}> Use one global threshold</label></div>
      <div class="tw"><table class="sim-table">
        <thead><tr><th>Document type</th><th>Fields</th><th style="min-width:150px">Accept at confidence ≥</th><th>Auto-accepted</th><th>Auto-accept error</th><th>To review</th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td><b>${esc(r.t.name)}</b></td>
          <td class="mono">${r.fields.toLocaleString()}</td>
          <td><div class="row" style="flex-wrap:nowrap;gap:8px"><input type="range" min="0" max="9" step="1" value="${r.k}" data-ti="${r.ti}" aria-label="Threshold for ${esc(r.t.name)}"><span class="mono" style="min-width:3ch">${CAL.bins[r.k].toFixed(2)}</span></div></td>
          <td class="mono">${r.n.toLocaleString()}</td>
          <td><span class="chip ${r.err <= CAL.errTarget + 1e-9 ? "ok" : "bad"}">${p1(r.err)}</span></td>
          <td class="mono">${r.rev.toLocaleString()}</td></tr>`).join("")}</tbody>
      </table></div>
      <h3 class="h3" style="margin-top:18px">After launch: audit the auto-accepted stream</h3>
      ${[["No ongoing audit", "Trust the thresholds as calibrated today."],
         ["Random 2% of all auto-accepted fields", "One pool; small document types are rarely sampled."],
         ["Stratified 2% per document type", "Every segment is sampled in proportion, including the small ones."]].map((o, k) =>
        `<label class="radio"><input type="radio" name="audit" value="${k}" ${st.audit === k ? "checked" : ""}><span><b>${o[0]}</b> <span class="muted">${o[1]}</span></span></label>`).join("")}
    </div>
    <div class="result ${allOk ? "ok" : "bad"}" style="margin-top:14px">${allOk
      ? `Target met: every type's auto-accept error is at or below ${p1(CAL.errTarget)}, review load is ${p1(review / N)}, and the audit samples every segment.`
      : [errOk ? "" : `${esc(worst.t.name)} auto-accept error is ${p1(worst.err)}, above the ${p1(CAL.errTarget)} target.`,
         budgetOk ? "" : `Review load is ${p1(review / N)}, over the ${p1(CAL.reviewBudget)} budget.`,
         auditOk ? "" : "Choose an audit that samples every document type."].filter(Boolean).join(" ")}</div>`;
  host.querySelectorAll("input[type=range]").forEach(r => r.addEventListener("input", () => {
    const v = +r.value;
    if (st.link) st.th = st.th.map(() => v); else st.th[+r.dataset.ti] = v;
    const focusTi = r.dataset.ti; labSim(lab, host);
    const again = host.querySelector(`input[type=range][data-ti="${focusTi}"]`); if (again) again.focus();
  }));
  host.querySelector("#link").addEventListener("change", e => { st.link = e.target.checked; if (st.link) st.th = st.th.map(() => Math.max.apply(null, st.th)); labSim(lab, host); });
  host.querySelectorAll("input[name=audit]").forEach(r => r.addEventListener("change", () => { st.audit = +r.value; labSim(lab, host); }));
  if (allOk) pass(lab);
}

/* ---------------- scoring helpers ---------------- */
function scaled(right, total) {
  const p = total ? right / total : 0, CUT = 0.72;
  return p < CUT ? Math.round(100 + (p / CUT) * 620) : Math.round(720 + ((p - CUT) / (1 - CUT)) * 280);
}
function prepItems(list) { return list.map(q => ({ q, order: shuffle(range(q.o.length)) })); }

/* ---------------- mock exam ---------------- */
const LIMIT = 120 * 60;
let E = { phase: "start" };
let tick = null;
function startExam() {
  const scen = shuffle(SCEN.map(s => s.id)).slice(0, 4);
  const items = [];
  scen.forEach(sid => prepItems(shuffle(BANK.filter(q => q.s === sid))).forEach(it => items.push(it)));
  E = { phase: "run", scen, items, i: 0, picks: {}, flags: {}, started: Date.now(), remaining: LIMIT, reason: null, filter: "all", open: {} };
  clearInterval(tick);
  tick = setInterval(() => {
    E.remaining = Math.max(0, LIMIT - Math.round((Date.now() - E.started) / 1000));
    const t = document.getElementById("timer");
    if (t) { t.textContent = fmtTime(E.remaining); t.className = "timer" + (E.remaining <= 300 ? " crit" : E.remaining <= 900 ? " warn" : ""); }
    if (E.remaining <= 0) submitExam("time");
  }, 1000);
  renderExam();
  window.scrollTo(0, 0);
}
function submitExam(reason) {
  clearInterval(tick); tick = null;
  closeModal();
  E.phase = "done"; E.reason = reason;
  const r = examScore();
  P.exams.push({ at: Date.now(), scale: r.scale, pass: r.pass, right: r.right, total: E.items.length, scen: E.scen });
  if (P.exams.length > 20) P.exams = P.exams.slice(-20);
  save();
  if (current === "exam") { renderExam(); window.scrollTo(0, 0); }
}
function examScore() {
  const per = {}, perS = {};
  DOMAINS.forEach(d => { per[d.id] = { r: 0, t: 0 }; });
  E.scen.forEach(s => { perS[s] = { r: 0, t: 0 }; });
  let right = 0;
  const rows = E.items.map((it, i) => {
    const pick = E.picks[i], ok = pick === 0;
    if (ok) right++;
    per[it.q.d].t++; perS[it.q.s].t++;
    if (ok) { per[it.q.d].r++; perS[it.q.s].r++; }
    return { it, i, pick, ok, skipped: pick === undefined };
  });
  const scale = scaled(right, E.items.length);
  return { rows, right, per, perS, scale, pass: scale >= 720 };
}
function renderExam() {
  if (E.phase === "run") return renderExamQ();
  if (E.phase === "done") return renderExamResults();
  const prev = P.exams.slice(-3).reverse();
  app.innerHTML = `
  <p class="eyebrow">Mock exam</p>
  <h1 style="font-size:clamp(30px,5vw,46px);font-weight:760;line-height:1.05">Four scenarios. 60 items. 120 minutes.</h1>
  <p class="lede">Like the real exam, four scenarios are drawn at random from the six below, with 15 items each. Every item has one best answer and three plausible distractors. Nothing is scored until you submit, and unanswered items count as wrong.</p>
  <dl class="tblock" style="margin-top:22px">
    <div><dt>Items</dt><dd>60</dd></div><div><dt>Time</dt><dd>120 <small>min</small></dd></div>
    <div><dt>Pass</dt><dd>720 <small>/ 1000</small></dd></div><div><dt>Bank</dt><dd>${BANK.length} <small>items</small></dd></div>
  </dl>
  <div class="sect">
    <h2 class="h2">The scenario pool</h2>
    <p class="sect-sub">Each scenario frames its items. Read the frame; it often decides between two plausible answers.</p>
    <div class="grid2">${SCEN.map(s => `<div class="sheet sheet-pad"><p class="eyebrow">${s.id}</p><h3 class="h3">${esc(s.name)}</h3>
      <p class="muted" style="margin:0 0 8px;font-size:14px">${md(s.text)}</p>
      <div class="row">${s.domains.map(d => `<span class="chip">D${d} ${esc(dom(d).short)}</span>`).join("")}</div></div>`).join("")}</div>
  </div>
  <div class="sect row">
    <button class="btn primary" type="button" id="go" style="padding:13px 26px;font-size:15.5px">Start the exam</button>
    <span class="muted" style="font-size:13.5px">The timer starts on click. Keys: A–D to answer, ← → to move, F to flag.</span>
  </div>
  ${prev.length ? `<div class="sect"><h2 class="h2">Recent attempts</h2><div class="sheet sheet-pad" style="padding-block:6px">${prev.map(x =>
    `<div class="mrow"><span class="nm">${new Date(x.at).toLocaleString()} · ${x.right}/${x.total} correct</span><span class="pc" style="color:${x.pass ? "var(--ok)" : "var(--bad)"}">${x.scale}</span></div>`).join("")}</div></div>` : ""}
  <p class="footer">Scaled score uses a linear model anchored at 720 = 72% raw, because the real scaling curve isn't published. Treat it as indicative and read the per-domain percentages as the stronger signal.</p>`;
  document.getElementById("go").addEventListener("click", startExam);
}
function renderExamQ() {
  const it = E.items[E.i], q = it.q, s = SCEN.find(x => x.id === q.s);
  const si = E.scen.indexOf(q.s), pick = E.picks[E.i];
  const answered = Object.keys(E.picks).length, total = E.items.length;
  app.innerHTML = `
  <div class="rail"><div class="rail-in">
    <span class="mono" style="font-size:12px;color:var(--ink-3)">Scenario ${si + 1}/4 · Q${E.i + 1}/${total}</span>
    <span class="bar"><i style="width:${pct(answered, total)}%"></i></span>
    <button class="btn sm" type="button" id="grid">Question grid</button>
    <span class="timer" id="timer">${fmtTime(E.remaining)}</span>
  </div></div>
  <div class="scen"><b>${esc(s.id)} · ${esc(s.name)}.</b> ${md(s.text)}</div>
  <div class="row" style="margin-bottom:10px"><span class="chip blue">D${q.d} ${esc(dom(q.d).short)}</span><span class="chip">TS ${esc(q.ts)}</span></div>
  <h2 class="stem">${md(q.q)}</h2>
  <div class="opts" id="opts">${it.order.map((o, k) => `<button class="opt" type="button" data-o="${o}" aria-pressed="${pick === o}"><span class="key">${KEYS[k]}</span><span class="txt">${md(q.o[o][0])}</span></button>`).join("")}</div>
  <div class="nav">
    <button class="btn" type="button" id="prev" ${E.i === 0 ? "disabled" : ""}>← Previous</button>
    <button class="flag" type="button" id="flag" aria-pressed="${!!E.flags[E.i]}">⚑ ${E.flags[E.i] ? "Flagged" : "Flag for review"}</button>
    <span class="spacer"></span>
    ${E.i === total - 1 ? `<button class="btn primary" type="button" id="fin">Review &amp; submit</button>` : `<button class="btn primary" type="button" id="next">Next →</button>`}
  </div>`;
  const tEl = document.getElementById("timer");
  tEl.className = "timer" + (E.remaining <= 300 ? " crit" : E.remaining <= 900 ? " warn" : "");
  document.getElementById("opts").addEventListener("click", e => {
    const b = e.target.closest(".opt"); if (!b) return;
    const o = +b.dataset.o;
    if (E.picks[E.i] === o) delete E.picks[E.i]; else E.picks[E.i] = o;
    renderExamQ();
  });
  const go = d => { E.i = Math.max(0, Math.min(total - 1, E.i + d)); renderExamQ(); window.scrollTo(0, 0); };
  const pv = document.getElementById("prev"); if (pv) pv.addEventListener("click", () => go(-1));
  const nx = document.getElementById("next"); if (nx) nx.addEventListener("click", () => go(1));
  const fn = document.getElementById("fin"); if (fn) fn.addEventListener("click", confirmSubmit);
  document.getElementById("flag").addEventListener("click", () => { E.flags[E.i] = !E.flags[E.i]; renderExamQ(); });
  document.getElementById("grid").addEventListener("click", openGrid);
}
let modalEl = null;
function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; } }
function modal(html, label) {
  closeModal();
  modalEl = document.createElement("div");
  modalEl.className = "modal";
  modalEl.innerHTML = `<button class="modal-bg" type="button" aria-label="Close"></button><div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</div>`;
  document.body.appendChild(modalEl);
  modalEl.querySelector(".modal-bg").addEventListener("click", closeModal);
  const f = modalEl.querySelector(".modal-card button, .modal-card a"); if (f) f.focus();
  return modalEl;
}
function openGrid() {
  const total = E.items.length, n = Object.keys(E.picks).length;
  let cells = "";
  E.items.forEach((it, i) => {
    if (i % 15 === 0) { const s = SCEN.find(x => x.id === E.scen[i / 15]); cells += `<span class="cells-sep">Scenario ${i / 15 + 1}: ${esc(s.name)}</span>`; }
    const cls = ["cell", E.picks[i] !== undefined ? "done" : "", i === E.i ? "here" : "", E.flags[i] ? "flagged" : ""].join(" ");
    cells += `<button type="button" class="${cls}" data-i="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`;
  });
  const m = modal(`<h2 class="h3" style="font-size:20px">Question grid</h2>
    <p class="muted" style="font-size:13.5px;margin:2px 0 14px">${n} of ${total} answered · ${Object.values(E.flags).filter(Boolean).length} flagged</p>
    <div class="cells">${cells}</div>
    <div class="nav" style="margin-top:18px"><button class="btn" type="button" id="mclose">Keep working</button><span class="spacer"></span><button class="btn primary" type="button" id="msub">Submit exam</button></div>`, "Question grid");
  m.querySelector(".cells").addEventListener("click", e => { const b = e.target.closest(".cell"); if (!b) return; E.i = +b.dataset.i; closeModal(); renderExamQ(); window.scrollTo(0, 0); });
  m.querySelector("#mclose").addEventListener("click", closeModal);
  m.querySelector("#msub").addEventListener("click", confirmSubmit);
}
function confirmSubmit() {
  const left = E.items.length - Object.keys(E.picks).length;
  const m = modal(`<h2 class="h3" style="font-size:20px">Submit for scoring?</h2>
    <p style="font-size:14.5px;color:var(--ink-2);margin:6px 0 18px">${left ? `<b style="color:var(--bad)">${left} item${left === 1 ? "" : "s"} unanswered.</b> Unanswered items score as wrong; there's no penalty for guessing.` : `All ${E.items.length} items answered, with ${fmtTime(E.remaining)} left.`}</p>
    <div class="nav" style="border:none;padding-top:0"><button class="btn" type="button" id="mback">Back to exam</button><span class="spacer"></span><button class="btn primary" type="button" id="mgo">Submit</button></div>`, "Submit exam");
  m.querySelector("#mback").addEventListener("click", closeModal);
  m.querySelector("#mgo").addEventListener("click", () => submitExam("manual"));
}
function meter(name, sub, r, t) {
  const p = pct(r, t), col = p >= 72 ? "var(--ok)" : p >= 50 ? "var(--warn)" : "var(--bad)";
  return `<div class="mrow"><span class="nm">${name}${sub ? ` <span class="muted mono" style="font-size:11.5px;font-weight:400">${sub}</span>` : ""}</span><span class="pc" style="color:${col}">${t ? p + "%" : "–"}</span>
    <span class="bar"><i style="width:${p}%;background:${col}"></i></span><span class="dt">${r} of ${t} correct</span></div>`;
}
function renderExamResults() {
  const r = examScore(), total = E.items.length, elapsed = LIMIT - E.remaining;
  const doms = DOMAINS.map(d => meter(`D${d.id} ${esc(d.name)}`, `${d.weight}% of exam`, r.per[d.id].r, r.per[d.id].t)).join("");
  const scens = E.scen.map(sid => meter(esc(SCEN.find(s => s.id === sid).name), sid, r.perS[sid].r, r.perS[sid].t)).join("");
  const miss = {};
  r.rows.filter(x => !x.ok).forEach(x => { miss[x.it.q.ts] = (miss[x.it.q.ts] || 0) + 1; });
  const plan = Object.keys(miss).map(ts => {
    const d = +ts.split(".")[0], dd = dom(d), t = dd.ts.find(z => z.n === ts);
    return { ts, n: miss[ts], d, w: dd.weight, title: t ? t.t : "", labs: LABS.filter(l => l.ts.split(/\s*·\s*/).indexOf(ts) >= 0) };
  }).sort((a, b) => b.n * b.w - a.n * a.w).slice(0, 6);
  const filters = [["all", `All ${total}`], ["wrong", `Incorrect (${r.rows.filter(x => !x.ok && !x.skipped).length})`], ["skipped", `Unanswered (${r.rows.filter(x => x.skipped).length})`], ["right", `Correct (${r.right})`], ["flagged", `Flagged (${Object.values(E.flags).filter(Boolean).length})`]];
  app.innerHTML = `
  <p class="eyebrow">Mock exam result</p>
  <div class="row" style="align-items:baseline;gap:18px"><span class="verdict ${r.pass ? "pass" : "fail"}">${r.pass ? "Pass" : "Not yet"}</span>
    <span style="font-family:var(--mono);font-size:clamp(26px,5vw,38px);font-weight:600;font-variant-numeric:tabular-nums">${r.scale}<span class="muted" style="font-size:.5em"> / 1000</span></span></div>
  <p class="muted" style="margin:8px 0 0">${r.right} of ${total} correct (${pct(r.right, total)}%) · ${fmtTime(elapsed)} used${E.reason === "time" ? ` · <b style="color:var(--bad)">time expired</b>` : ""} · 720 needed to pass</p>
  <div class="scale"><span class="bar"><i style="width:${Math.max(2, Math.min(100, (r.scale - 100) / 9)).toFixed(1)}%;background:${r.pass ? "var(--ok)" : "var(--blue)"}"></i></span>
    <span class="cut" style="left:${((720 - 100) / 9).toFixed(1)}%"><span>720</span></span></div>
  <div class="sect grid2">
    <div><h2 class="h2">By domain</h2><p class="sect-sub">72% is roughly the raw equivalent of 720.</p><div class="sheet sheet-pad" style="padding-block:4px">${doms}</div></div>
    <div><h2 class="h2">By scenario</h2><p class="sect-sub">The four scenarios you drew.</p><div class="sheet sheet-pad" style="padding-block:4px">${scens}</div></div>
  </div>
  <div class="sect"><h2 class="h2">What to work on next</h2><p class="sect-sub">Missed task statements, ranked by domain weight × items missed, with the labs that drill them.</p>
    <div class="sheet sheet-pad">${plan.length ? plan.map(p => `<div class="ts"><span class="ts-n">${p.ts}</span><div><h3>${esc(p.title)}</h3>
      <p class="muted" style="margin:0 0 6px;font-size:13.5px">${p.n} missed · D${p.d} carries ${p.w}% of the exam</p>
      <div class="row">${p.labs.length ? p.labs.map(l => `<a class="chip blue" href="#lab-${l.id}" style="text-decoration:none">Lab ${l.id}: ${esc(l.title)}</a>`).join("") : `<a class="chip" href="#d${p.d}" style="text-decoration:none">Read sheet D${p.d}</a>`}</div></div></div>`).join("")
      : `<p style="margin:0">Nothing missed. Try again later with a different scenario draw to confirm.</p>`}</div></div>
  <div class="sect"><h2 class="h2">Every item</h2><p class="sect-sub">Open any item for the answer and why each option is right or wrong.</p>
    <div class="filters" id="filters">${filters.map(([k, l]) => `<button class="filt" type="button" data-f="${k}" aria-pressed="${E.filter === k}">${l}</button>`).join("")}</div>
    <div id="rev"></div></div>
  <div class="nav" style="margin-top:20px"><button class="btn primary" type="button" id="again">New exam with a fresh draw</button><span class="spacer"></span><a class="btn" href="#practice" style="text-decoration:none">Practice by scenario</a></div>`;
  paintReview(r);
  document.getElementById("filters").addEventListener("click", e => {
    const b = e.target.closest(".filt"); if (!b) return;
    E.filter = b.dataset.f;
    document.querySelectorAll("#filters .filt").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.f === E.filter)));
    paintReview(r);
  });
  document.getElementById("again").addEventListener("click", () => { E = { phase: "start" }; renderExam(); window.scrollTo(0, 0); });
}
function explainOptions(q, order, pick) {
  return order.map((o, k) => {
    const cls = o === 0 ? "right" : (pick === o ? "wrong" : "");
    return `<div class="opt ${cls}" style="cursor:default"><span class="key">${KEYS[k]}</span><span class="txt">${md(q.o[o][0])}</span></div>
      <p class="opt-why">${o === 0 ? "<b>Correct.</b> " : (pick === o ? "<b>Your answer.</b> " : "")}${md(q.o[o][1])}</p>`;
  }).join("");
}
function paintReview(r) {
  const keep = r.rows.filter(x => E.filter === "wrong" ? (!x.ok && !x.skipped) : E.filter === "skipped" ? x.skipped : E.filter === "right" ? x.ok : E.filter === "flagged" ? !!E.flags[x.i] : true);
  const el = document.getElementById("rev");
  if (!keep.length) { el.innerHTML = `<p class="muted">No items in this view.</p>`; return; }
  el.innerHTML = keep.map(x => {
    const q = x.it.q, state = x.ok ? "ok" : x.skipped ? "skip" : "no", open = !!E.open[x.i];
    return `<div class="rev ${state}"><button class="rev-btn" type="button" data-i="${x.i}" aria-expanded="${open}">
      <span style="font-weight:700;color:${x.ok ? "var(--ok)" : x.skipped ? "var(--ink-3)" : "var(--bad)"}">${x.ok ? "✓" : x.skipped ? "–" : "✗"}</span>
      <span class="q">${x.i + 1}. ${md(q.q)}<span class="tags">${esc(q.s)} · D${q.d} · TS ${esc(q.ts)}${E.flags[x.i] ? " · flagged" : ""}</span></span>
      <span class="muted">${open ? "▾" : "▸"}</span></button>
      ${open ? `<div class="rev-panel"><div class="opts" style="margin:12px 0 0;gap:6px">${explainOptions(q, x.it.order, x.pick)}</div></div>` : ""}</div>`;
  }).join("");
  el.querySelectorAll(".rev-btn").forEach(b => b.addEventListener("click", () => { const i = +b.dataset.i; E.open[i] = !E.open[i]; paintReview(r); }));
}

/* ---------------- practice ---------------- */
let PR = null;
function startPractice(kind, id) {
  const list = BANK.filter(q => kind === "s" ? q.s === id : q.d === id);
  PR = { kind, id, items: prepItems(list), i: 0, picks: {} };
}
function renderPractice() {
  if (!PR) return renderPracticeMenu();
  const total = PR.items.length;
  if (PR.i >= total) {
    const right = PR.items.filter((it, i) => PR.picks[i] === 0).length;
    const missed = PR.items.filter((it, i) => PR.picks[i] !== 0).map(it => it.q);
    app.innerHTML = `<p class="crumb"><a href="#practice" id="menu">Practice sets</a> / ${esc(practiceName())}</p>
      <p class="eyebrow">Set complete</p><h1 style="font-size:clamp(30px,5vw,44px);font-weight:760">${right} of ${total} correct</h1>
      <p class="lede">${pct(right, total) >= 72 ? "Above the rough 72% pass line for this set." : "Below the rough 72% pass line. Retry the misses, then revisit the matching labs."}</p>
      <div class="row" style="margin-top:18px">${missed.length ? `<button class="btn primary" type="button" id="retry">Retry the ${missed.length} missed</button>` : ""}<button class="btn" type="button" id="back">Choose another set</button></div>`;
    const rt = document.getElementById("retry");
    if (rt) rt.addEventListener("click", () => { PR = { kind: PR.kind, id: PR.id, items: prepItems(missed), i: 0, picks: {}, retry: true }; renderPractice(); window.scrollTo(0, 0); });
    document.getElementById("back").addEventListener("click", () => { PR = null; renderPractice(); });
    document.getElementById("menu").addEventListener("click", e => { e.preventDefault(); PR = null; renderPractice(); });
    return;
  }
  const it = PR.items[PR.i], q = it.q, s = SCEN.find(x => x.id === q.s), pick = PR.picks[PR.i];
  const done = Object.keys(PR.picks).length, right = Object.keys(PR.picks).filter(k => PR.picks[k] === 0).length;
  app.innerHTML = `<p class="crumb"><a href="#practice" id="menu">Practice sets</a> / ${esc(practiceName())}${PR.retry ? " (missed items)" : ""}</p>
    <div class="row" style="margin-bottom:12px"><span class="mono muted" style="font-size:12.5px">Item ${PR.i + 1} of ${total} · ${right}/${done} correct so far</span><span class="spacer"></span><span class="bar" style="flex:0 1 220px"><i style="width:${pct(done, total)}%"></i></span></div>
    <div class="scen"><b>${esc(s.id)} · ${esc(s.name)}.</b> ${md(s.text)}</div>
    <div class="row" style="margin-bottom:10px"><span class="chip blue">D${q.d} ${esc(dom(q.d).short)}</span><span class="chip">TS ${esc(q.ts)}</span></div>
    <h2 class="stem">${md(q.q)}</h2>
    ${pick === undefined
      ? `<div class="opts" id="opts">${it.order.map((o, k) => `<button class="opt" type="button" data-o="${o}"><span class="key">${KEYS[k]}</span><span class="txt">${md(q.o[o][0])}</span></button>`).join("")}</div>`
      : `<div class="result ${pick === 0 ? "ok" : "bad"}" style="margin-bottom:12px">${pick === 0 ? "Correct." : "Not the best answer."}</div><div class="opts" style="gap:6px">${explainOptions(q, it.order, pick)}</div>`}
    <div class="nav"><span class="spacer"></span>${pick !== undefined ? `<button class="btn primary" type="button" id="pnext">${PR.i === total - 1 ? "Finish set" : "Next item →"}</button>` : `<span class="muted" style="font-size:13.5px">Pick an answer to see the explanation.</span>`}</div>`;
  const opts = document.getElementById("opts");
  if (opts) opts.addEventListener("click", e => { const b = e.target.closest(".opt"); if (!b) return; PR.picks[PR.i] = +b.dataset.o; renderPractice(); });
  const nx = document.getElementById("pnext");
  if (nx) { nx.addEventListener("click", () => { PR.i++; renderPractice(); window.scrollTo(0, 0); }); nx.focus(); }
  document.getElementById("menu").addEventListener("click", e => { e.preventDefault(); PR = null; renderPractice(); });
}
function practiceName() { return PR.kind === "s" ? SCEN.find(s => s.id === PR.id).name : "D" + PR.id + " " + dom(PR.id).name; }
function renderPracticeMenu() {
  app.innerHTML = `<p class="eyebrow">Practice</p>
    <h1 style="font-size:clamp(30px,5vw,44px);font-weight:760;line-height:1.05">Untimed sets with instant feedback</h1>
    <p class="lede">Work the bank one scenario or one domain at a time. Each answer shows why every option is right or wrong.</p>
    <div class="sect"><h2 class="h2">By scenario</h2><p class="sect-sub">15 items each.</p>
      <div class="grid2">${SCEN.map(s => `<button type="button" class="scen-pick" data-k="s" data-id="${s.id}"><span class="eyebrow" style="margin:0">${s.id} · ${BANK.filter(q => q.s === s.id).length} items</span><span class="h3" style="margin:0;font-family:var(--display);font-stretch:112%">${esc(s.name)}</span><span class="row">${s.domains.map(d => `<span class="chip">D${d}</span>`).join("")}</span></button>`).join("")}</div></div>
    <div class="sect"><h2 class="h2">By domain</h2><p class="sect-sub">Every item tagged to the domain, across scenarios.</p>
      <div class="grid2">${DOMAINS.map(d => `<button type="button" class="scen-pick" data-k="d" data-id="${d.id}"><span class="eyebrow" style="margin:0">D${d.id} · ${BANK.filter(q => q.d === d.id).length} items · ${d.weight}% of exam</span><span class="h3" style="margin:0;font-family:var(--display);font-stretch:112%">${esc(d.name)}</span></button>`).join("")}</div></div>`;
  app.querySelectorAll(".scen-pick").forEach(b => b.addEventListener("click", () => {
    startPractice(b.dataset.k, b.dataset.k === "s" ? b.dataset.id : +b.dataset.id); renderPractice(); window.scrollTo(0, 0);
  }));
}

/* ---------------- keyboard (exam) ---------------- */
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modalEl) { closeModal(); return; }
  if (current !== "exam" || E.phase !== "run" || modalEl) return;
  if (e.target.closest && e.target.closest("input,textarea,select")) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = KEYS.indexOf(e.key.toUpperCase());
  if (k >= 0) { e.preventDefault(); const b = document.querySelectorAll("#opts .opt")[k]; if (b) b.click(); return; }
  if (e.key === "ArrowRight" && E.i < E.items.length - 1) { E.i++; renderExamQ(); }
  else if (e.key === "ArrowLeft" && E.i > 0) { E.i--; renderExamQ(); }
  else if (e.key.toLowerCase() === "f") { E.flags[E.i] = !E.flags[E.i]; renderExamQ(); }
});

route();
})();
