/**
 * BT Secretary — app terrain v0.1
 *
 * Wrapper HTML de la plateforme Comptaria (Capacitor → APK / IPA).
 * Données conservées en localStorage (mode dégradé), synchronisées
 * via mcp-comtaria (DB schema) + mcp-csv (CSV/HTML brandé) côté serveur.
 *
 * Pas de backend local dans cette version : les rendus HTML/CSV
 * sont démontrés en calcul local dans le client (même logique que
 * mcp-csv/src/templates/html.ts) ; le câblage serveur se fera en M1.4.
 */
(() => {
  "use strict";

  // ---------- Tabs ----------
  const tabs = document.querySelectorAll(".nav button");
  const views = document.querySelectorAll(".view");
  tabs.forEach(b =>
    b.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));
      b.classList.add("active");
      const tab = b.dataset.tab;
      const view = document.querySelector(`[data-view="${tab}"]`);
      if (view) view.classList.add("active");
      location.hash = `#${tab}`;
    }),
  );
  if (location.hash) {
    const t = document.querySelector(`.nav button[data-tab="${location.hash.slice(1)}"]`);
    if (t) t.click();
  }

  // ---------- Sync indicator (offline-first demo) ----------
  const dot = document.getElementById("dot");
  const syncLabel = document.getElementById("sync-label");
  function setSync(state, label) {
    dot.classList.remove("dot-ok", "dot-warn", "dot-err");
    dot.classList.add(`dot-${state}`);
    syncLabel.textContent = label;
  }
  function isOnline() { return navigator.onLine; }
  window.addEventListener("online", () => setSync("ok", "En ligne"));
  window.addEventListener("offline", () => setSync("warn", "Hors ligne — sync plus tard"));
  setSync(isOnline() ? "ok" : "warn", isOnline() ? "En ligne" : "Hors ligne — sync plus tard");

  // ---------- Local store ----------
  const KEY_TS = "bt.ts.v1";
  const KEY_BT = "bt.bt.v1";
  const KEY_BILL = "bt.bill.v1";

  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
    del(key) { localStorage.removeItem(key); },
  };

  // ---------- Time sheet ----------
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return { week: Math.ceil(((t - yearStart) / 86400000 + 1) / 7), year: t.getUTCFullYear() };
  }
  function isoDate(d) {
    const z = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
  function startOfWeek(d = new Date()) {
    const out = new Date(d);
    const dow = (out.getDay() + 6) % 7; // lundi = 0
    out.setDate(out.getDate() - dow);
    out.setHours(0, 0, 0, 0);
    return out;
  }
  const dayNames = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  function buildWeek() {
    const start = startOfWeek();
    const stored = store.get(KEY_TS) || {};
    const wrap = document.getElementById("timeweek");
    wrap.innerHTML = "";
    const wk = isoWeek(start);
    document.getElementById("ts-week").textContent = `semaine ${wk.week}/${wk.year}`;
    const labels = ["2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19"]; // semaine de démo
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i);
      const k = labels[i] || isoDate(d);
      const rec = stored[k] || { n: 8, s: 0 };
      const total = (rec.n || 0) + (rec.s || 0);
      const card = document.createElement("div");
      card.className = "day";
      card.innerHTML = `
        <header><span>${dayNames[i]}</span><small>${k} · ${total} h</small></header>
        <div class="row">
          <span class="muted">Normales</span>
          <input type="number" min="0" max="24" step="0.25" value="${rec.n ?? 8}" data-k="${k}" data-f="n" />
          <input type="number" min="0" max="24" step="0.25" value="${rec.s ?? 0}" data-k="${k}" data-f="s" />
        </div>
        <div class="row" style="margin-top:6px">
          <span class="muted">Suppl.</span>
          <span></span>
          <span class="muted" style="font-size:11px">total calculé à droite</span>
        </div>`;
      wrap.appendChild(card);
    }
    wrap.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("change", () => {
        const v = parseFloat(inp.value) || 0;
        const stored2 = store.get(KEY_TS) || {};
        stored2[inp.dataset.k] = { n: Number(stored2[inp.dataset.k]?.n || 0), s: Number(stored2[inp.dataset.k]?.s || 0) };
        stored2[inp.dataset.k][inp.dataset.f] = v;
        store.set(KEY_TS, stored2);
        buildWeek();
      });
    });
  }
  buildWeek();

  document.getElementById("ts-sync").addEventListener("click", () => {
    const stored = store.get(KEY_TS) || {};
    const total_h = Object.values(stored).reduce((s, v) => s + (v.n || 0) + (v.s || 0), 0);
    const ids = Object.entries(stored).filter(([, v]) => (v.n || 0) + (v.s || 0) > 0);
    const msg = `Feuille envoyée: ${ids.length} jours pointés, ${total_h} h totales. ${isOnline() ? "Réception cabinet < 5s" : "Mise en file d'attente (hors ligne)"}.`;
    document.getElementById("ts-msg").textContent = msg;
  });

  // ---------- Bon de travail ----------
  function buildBT() {
    const stored = store.get(KEY_BT) || defaultBT();
    if (!store.get(KEY_BT)) store.set(KEY_BT, stored);
    const f = document.getElementById("bt-form");
    ["numero","date","client","projet","tache","periode","statut","notes"].forEach(k => {
      const el = f.elements[k]; if (el && stored[k]) el.value = stored[k];
    });
    const tbody = document.getElementById("bt-lines");
    tbody.innerHTML = "";
    stored.lignes.forEach((l, i) => addBTLine(i, l));
    refreshBTTotals();
  }
  function defaultBT() {
    return {
      numero: "BT-2026-0001",
      date: "2026-07-21",
      client: "Construction Rive-Nord",
      projet: "Rénovation fondation",
      tache: "Excavation / Coulée",
      periode: "2026-07-13 → 2026-07-21",
      statut: "En cours",
      notes: "Semaine de pilote interne. Loi 25.",
      lignes: [
        { description: "Excavation fondations", date: "2026-07-13", heures: 4, taux_cents: 9500, total_cents: 38000 },
        { description: "Coffrage mur sud",      date: "2026-07-14", heures: 3, taux_cents: 9500, total_cents: 28500 },
        { description: "Coulée béton",          date: "2026-07-15", heures: 5, taux_cents: 9500, total_cents: 47500 },
        { description: "Installation drain français", date: "2026-07-16", heures: 6, taux_cents: 9500, total_cents: 57000 },
        { description: "Remblayage et compaction", date: "2026-07-21", heures: 4, taux_cents: 9500, total_cents: 38000 },
      ],
    };
  }
  function addBTLine(i, l) {
    const tbody = document.getElementById("bt-lines");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input name="l_date" type="date" value="${l.date ?? ""}"></td>
      <td><input name="l_desc" type="text" value="${l.description ?? ""}"></td>
      <td class="r"><input name="l_heures" type="number" step="0.25" min="0" value="${l.heures ?? 0}"></td>
      <td class="r"><input name="l_taux" type="number" step="0.01" min="0" value="${((l.taux_cents ?? 0) / 100).toFixed(2)}"></td>
      <td class="r"><span data-tot>0,00</span></td>
      <td class="r"><button type="button" class="ghost" data-rm>×</button></td>`;
    tr.querySelector("[data-rm]").addEventListener("click", () => {
      const stored = store.get(KEY_BT) || defaultBT();
      stored.lignes.splice(i, 1);
      store.set(KEY_BT, stored);
      buildBT();
    });
    tr.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("change", () => {
        const stored = store.get(KEY_BT) || defaultBT();
        const idx = Number(inp.closest("tr").dataset.idx ?? i);
        const l0 = stored.lignes[idx] || (stored.lignes[idx] = {});
        if (inp.name === "l_heures") l0.heures = Number(inp.value) || 0;
        else if (inp.name === "l_taux") l0.taux_cents = Math.round((Number(inp.value) || 0) * 100);
        else if (inp.name === "l_date") l0.date = inp.value;
        else if (inp.name === "l_desc") l0.description = inp.value;
        l0.total_cents = Math.round((l0.heures || 0) * (l0.taux_cents || 0));
        store.set(KEY_BT, stored);
        refreshBTTotals();
      });
    });
    tr.dataset.idx = String(i);
    tbody.appendChild(tr);
  }
  function refreshBTTotals() {
    const stored = store.get(KEY_BT) || defaultBT();
    let total_cents = 0, total_h = 0;
    stored.lignes.forEach((l, i) => {
      total_cents += l.total_cents || 0;
      total_h += l.heures || 0;
      const tr = document.querySelector(`#bt-lines tr[data-idx="${i}"]`);
      if (tr) tr.querySelector("[data-tot]").textContent = ((l.total_cents || 0) / 100).toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
    });
    document.getElementById("bt-tot-heure").textContent = total_h.toString();
    document.getElementById("bt-tot-cents").textContent = (total_cents / 100).toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
  }
  document.getElementById("bt-add").addEventListener("click", () => {
    const stored = store.get(KEY_BT) || defaultBT();
    stored.lignes.push({ description: "", date: stored.date, heures: 0, taux_cents: 9500, total_cents: 0 });
    store.set(KEY_BT, stored);
    buildBT();
  });
  document.getElementById("bt-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const data = {
      numero: fd.get("numero"), date: fd.get("date"), statut: fd.get("statut"),
      client: fd.get("client"),
      adresse: "789 boul. de la Rive",
      projet: fd.get("projet"), tache: fd.get("tache"), periode: fd.get("periode"),
      emetteur: "emp1", notes: fd.get("notes"),
      lignes: (store.get(KEY_BT) || defaultBT()).lignes,
    };
    const html = renderHTMLBonTravail(data, bonAirBrand);
    document.getElementById("bt-out").innerHTML = `${html}<p class="muted">Pièce HTML brandée Bon-Air générée localement (web preview). Côté serveur, l'agent dispatcher envoie au chargé de projet. <button id=\"bt-print\" class=\"ghost\" type=\"button\">Imprimer / PDF</button> <button id=\"bt-csv2\" class="ghost" type="button">Voir CSV</button></p>`;
    document.getElementById("bt-print").addEventListener("click", () => openPrint(html, "Bon de travail"));
    document.getElementById("bt-csv2").addEventListener("click", () => alert(csvBonjour(data)));
  });
  document.getElementById("bt-csv").addEventListener("click", () => {
    const stored = store.get(KEY_BT) || defaultBT();
    const text = csvBonjour(stored);
    download(text, "bon-travail.csv", "text/csv");
  });
  buildBT();

  // ---------- Bill photo ----------
  const billCam = document.getElementById("bill-cam");
  billCam.addEventListener("change", () => {
    const f = billCam.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const prev = document.getElementById("bill-preview");
    prev.innerHTML = `<img src="${url}" alt="aperçu"><span>${f.name} · ${(f.size/1024).toFixed(1)} Ko · hash à calculer (sha-256)</span>`;
    store.set("bill.last_photo", { name: f.name, size: f.size, type: f.type });
  });
  document.getElementById("bill-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const sous_total = Number(fd.get("sous_total")) || 0;
    const tps = +(sous_total * 0.05).toFixed(2);
    const tvq = +(sous_total * 0.09975).toFixed(2);
    const total = +(sous_total + tps + tvq).toFixed(2);
    const payload = {
      fournisseur: fd.get("fournisseur"),
      date: fd.get("date"),
      numero: fd.get("numero"),
      sous_total, tps, tvq, total,
      categorie: fd.get("cat"),
      notes: fd.get("notes"),
      photo: store.get("bill.last_photo"),
    };
    const csv = csvFacture(payload);
    const html = renderHTMLFacture(payload, bonAirBrand);
    document.getElementById("bill-msg").innerHTML = `Facture ${payload.numero} reçue de ${payload.fournisseur} · ${payload.total.toLocaleString("fr-CA",{style:"currency",currency:"CAD",minimumFractionDigits:2})} · TPS ${tps.toFixed(2)} · TVQ ${tvq.toFixed(2)}. ${isOnline() ? "Cabinet notifié" : "Hors ligne, file d'attente"}. <button id="bill-html" class="ghost" type="button">HTML brandé</button> <button id="bill-csv2" class="ghost" type="button">CSV</button>`;
    document.getElementById("bill-html").addEventListener("click", () => openPrint(html, "Facture"));
    document.getElementById("bill-csv2").addEventListener("click", () => download(csv, "facture.csv", "text/csv"));
  });

  // ---------- Renderers (HTML brandé + CSV) ----------
  const bonAirBrand = {
    legal_name: "Bon-Air Construction inc.",
    neq: "1170001234",
    address_line1: "1234 rue de l'Avenir", address_line2: "Suite 200",
    city: "Lac-Bouchette, QC", postal_code: "G0X 1X0",
    phone: "+1 418-720-7735", email: "admin@bon-air.example",
    tps: "123456789 RT0001", tvq: "1000123456 TQ0001",
    primary: "#0b2545", secondary: "#bf4342",
    ink: "#0b2545", line: "#e3e9f2", bg_soft: "#f7f9fc",
    footer_note: "Bon-Air Construction inc. · Loi 25 · NEQ 1170001234",
  };

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function fmtMoney(cents) { return (Number(cents) / 100).toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $"; }
  function hashSHA256(s) {
    // Web Crypto API. Async, but we use a synchronous fallback (FNV-1a 64-bit-ish) so we don't await.
    // Server-side, the canonical hash is computed by mcp-csv.
    let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return ("00000000" + (h >>> 0).toString(16)).slice(-8);
  }
  function logoInline(b) {
    const initials = (b.legal_name || "CO").replace(/[^a-zA-Z ]/g, " ").trim().split(/\s+/).slice(0, 2).map(w => (w[0] || "").toUpperCase()).join("");
    return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style="width:96px;height:64px"><rect width="120" height="80" rx="8" fill="${b.bg_soft}" stroke="${b.line}"/><text x="60" y="46" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="32" font-weight="700" fill="${b.primary}">${esc(initials || "CO")}</text><text x="60" y="64" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="9" fill="${b.secondary}">${esc((b.legal_name || "").slice(0,18))}</text></svg>`;
  }
  function renderHeader(b) {
    const lines = [];
    lines.push(`<div style="display:flex;gap:16px;align-items:flex-start;border-bottom:2px solid ${b.ink};padding-bottom:10px;margin-bottom:16px"><div>${logoInline(b)}</div><div style="font-size:9pt;line-height:1.4;flex:1"><div style="font-size:14pt;font-weight:700">${esc(b.legal_name)}</div><div>${esc(b.address_line1)}</div><div>${esc(b.city)}${b.postal_code ? `, ${esc(b.postal_code)}` : ""}</div><div style="color:#5a6a82">${esc([b.phone ? "Tél. " + b.phone : "", b.email].filter(Boolean).join(" · "))}</div><div style="color:#5a6a82">${esc("NEQ " + (b.neq || "—"))}${b.tps ? " · TPS " + esc(b.tps) : ""}${b.tvq ? " · TVQ " + esc(b.tvq) : ""}</div></div></div>`);
    return lines.join("");
  }
  function renderFooter(b, title, hash) {
    return `<div style="margin-top:28px;padding-top:8px;border-top:1px solid ${b.line};display:flex;justify-content:space-between;font-size:7.5pt;color:#5a6a82;font-family:'JetBrains Mono',ui-monospace,monospace"><span style="font-family:-apple-system,'Segoe UI',Roboto,sans-serif">${esc(b.footer_note || "")}</span><span>Loi 25 · audit ${new Date().toISOString().slice(0,10)} · sha256 ${hash}</span><span>${esc(title)}</span></div>`;
  }
  function htmlShell(b, title, body) {
    const styles = `
      :root { --primary:${b.primary}; --secondary:${b.secondary}; --ink:${b.ink}; --line:${b.line}; --bg-soft:${b.bg_soft}; }
      html, body { margin: 0; padding: 0; background: #fafbfc; color: var(--ink); font-family: -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 10.5pt; line-height: 1.45; padding: 24px; }
      .page { max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: 28px 32px 36px 32px; box-shadow: 0 1px 3px rgba(11,37,69,0.06); }
      h1.title { margin: 0 0 4px; font-size: 18pt; }
      .doc-meta { color: #5a6a82; font-size: 9pt; margin-bottom: 14px; }
      section.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
      .box { border: 1px solid var(--line); border-radius: 6px; padding: 10px 12px; }
      .box-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.06em; color: var(--secondary); font-weight: 700; margin-bottom: 4px; }
      .box-line { font-size: 9.5pt; }
      table.items { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9.5pt; }
      table.items th, table.items td { border-bottom: 1px solid var(--line); padding: 6px 8px; text-align: left; }
      table.items th { background: var(--bg-soft); font-size: 8pt; text-transform: uppercase; letter-spacing: 0.04em; color: #5a6a82; }
      table.items tfoot td { border-top: 2px solid var(--ink); font-weight: 700; padding-top: 8px; }
      .right { text-align: right; white-space: nowrap; }
      .tax-table { margin-top: 12px; width: 50%; margin-left: auto; border-collapse: collapse; }
      .tax-table td { padding: 4px 8px; }
      .tax-table tr.total td { border-top: 2px solid var(--ink); font-size: 12pt; font-weight: 700; }
      .notes { margin-top: 14px; padding: 8px 10px; background: var(--bg-soft); border-left: 3px solid var(--secondary); font-size: 9.5pt; }
      .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 28px; }
      .signatures .sig { border-top: 1px solid var(--ink); padding-top: 4px; font-size: 8pt; color: #5a6a82; text-align: center; }
      .signatures .sig strong { display: block; color: var(--ink); font-size: 9.5pt; }
      @page { size: A4 portrait; margin: 18mm 14mm 22mm 14mm; }
      @media print { body { background: #fff; } }
    `;
    return `<!DOCTYPE html><html lang="fr-CA"><head><meta charset="utf-8"><title>${esc(title)} · ${esc(b.legal_name)}</title><style>${styles}</style></head><body><main class="page" data-brand="${esc(b.id || "default")}">${renderHeader(b)}${body}</main></body></html>`;
  }
  function renderHTMLBonTravail(data, b) {
    const lines = (data.lignes || []).map((l, i) => `<tr><td>${i+1}</td><td>${esc(l.date)}</td><td>${esc(l.description)}</td><td class="right">${l.heures}</td><td class="right">${fmtMoney(l.taux_cents)}</td><td class="right">${fmtMoney(l.total_cents)}</td></tr>`).join("");
    const total_h = (data.lignes || []).reduce((s, l) => s + (l.heures || 0), 0);
    const total_cents = (data.lignes || []).reduce((s, l) => s + (l.total_cents || 0), 0);
    const body = `
      <h1 class="title">Bon de travail</h1>
      <div class="doc-meta">N° ${esc(data.numero)} · ${esc(data.date)} · ${esc(data.statut)}</div>
      <section class="grid-2">
        <div class="box"><div class="box-label">Client</div><div class="box-line"><strong>${esc(data.client)}</strong></div><div class="box-line">${esc(data.adresse)}</div></div>
        <div class="box"><div class="box-label">Projet</div><div class="box-line"><strong>${esc(data.projet)}</strong></div><div class="box-line">${esc(data.tache)}</div><div class="box-line" style="color:#5a6a82;font-size:8pt">${esc(data.periode)}</div></div>
      </section>
      <table class="items"><thead><tr><th>#</th><th>Date</th><th>Description</th><th class="right">Heures</th><th class="right">Taux</th><th class="right">Total</th></tr></thead><tbody>${lines}</tbody><tfoot><tr><td colspan="3" class="right">Total</td><td class="right">${total_h}</td><td></td><td class="right">${fmtMoney(total_cents)}</td></tr></tfoot></table>
      ${data.notes ? `<div class="notes">${esc(data.notes)}</div>` : ""}
      <div class="signatures"><div class="sig"><strong>Préparé par</strong>${esc(data.emetteur || "________________________")}</div><div class="sig"><strong>Approuvé par</strong>________________________</div></div>`;
    const hash = hashSHA256("Bon de travail" + body);
    return htmlShell(b, "Bon de travail", body) + renderFooter(b, "Bon de travail", hash);
  }
  function renderHTMLFacture(p, b) {
    const subtotal = Number(p.sous_total) || 0;
    const tps = Number(p.tps) || 0;
    const tvq = Number(p.tvq) || 0;
    const total = Number(p.total) || 0;
    const body = `
      <h1 class="title">Facture fournisseur</h1>
      <div class="doc-meta">N° ${esc(p.numero)} · ${esc(p.date)} · Catégorie ${esc(p.categorie)}</div>
      <section class="grid-2">
        <div class="box"><div class="box-label">Fournisseur</div><div class="box-line"><strong>${esc(p.fournisseur)}</strong></div></div>
        <div class="box"><div class="box-label">Totaux</div><div class="box-line">Sous-total ${fmtMoney(subtotal*100)}</div><div class="box-line">TPS 5 % ${fmtMoney(tps*100)}</div><div class="box-line">TVQ 9,975 % ${fmtMoney(tvq*100)}</div><div class="box-line"><strong>Total ${fmtMoney(total*100)}</strong></div></div>
      </section>
      ${p.notes ? `<div class="notes">${esc(p.notes)}</div>` : ""}
      <div class="signatures"><div class="sig"><strong>Préparé par</strong>emp1 (${esc(new Date().toISOString().slice(0,10))})</div><div class="sig"><strong>Approuvé par</strong>Comptable cabinet</div></div>`;
    const hash = hashSHA256("Facture" + body);
    return htmlShell(b, "Facture fournisseur", body) + renderFooter(b, "Facture", hash);
  }

  // ---------- CSV multi-sections ----------
  function csvBonjour(d) {
    const lines = [];
    lines.push("# section: entete");
    lines.push(`titre,Bon de travail`);
    lines.push(`numero,${escCSV(d.numero || "")}`);
    lines.push(`date,${escCSV(d.date || "")}`);
    lines.push(`statut,${escCSV(d.statut || "")}`);
    lines.push(`emetteur,${escCSV(d.emetteur || "")}`);
    lines.push("");
    lines.push("# section: client");
    lines.push(`nom,${escCSV(d.client || "")}`);
    lines.push(`adresse,${escCSV(d.adresse || "")}`);
    lines.push("");
    lines.push("# section: projet");
    lines.push(`projet,${escCSV(d.projet || "")}`);
    lines.push(`tache,${escCSV(d.tache || "")}`);
    lines.push(`periode,${escCSV(d.periode || "")}`);
    lines.push("");
    lines.push("# section: lignes");
    lines.push("numero_ligne,date,description,heures,taux_cad,total_cad");
    (d.lignes || []).forEach((l, i) => {
      lines.push(`${i+1},${escCSV(l.date || "")},${escCSV(l.description || "")},${Number(l.heures || 0)},${(Number(l.taux_cents || 0) / 100).toFixed(2)},${(Number(l.total_cents || 0) / 100).toFixed(2)}`);
    });
    lines.push("");
    lines.push("# section: totaux");
    const total_h = (d.lignes || []).reduce((s, l) => s + (l.heures || 0), 0);
    const total_cents = (d.lignes || []).reduce((s, l) => s + (l.total_cents || 0), 0);
    lines.push(`heures_total,${total_h}`);
    lines.push(`total_cad,${(total_cents / 100).toFixed(2)}`);
    if (d.notes) {
      lines.push("");
      lines.push("# section: notes");
      lines.push(`notes,${escCSV(d.notes)}`);
    }
    return lines.join("\n") + "\n";
  }
  function csvFacture(p) {
    const lines = [];
    lines.push("# section: entete");
    lines.push("titre,Facture fournisseur");
    lines.push(`fournisseur,${escCSV(p.fournisseur)}`);
    lines.push(`date,${escCSV(p.date)}`);
    lines.push(`numero,${escCSV(p.numero)}`);
    lines.push(`categorie,${escCSV(p.categorie)}`);
    lines.push("");
    lines.push("# section: totaux");
    lines.push(`sous_total_cad,${(p.sous_total || 0).toFixed(2)}`);
    lines.push(`tps_5pct_cad,${(p.tps || 0).toFixed(2)}`);
    lines.push(`tvq_9_975pct_cad,${(p.tvq || 0).toFixed(2)}`);
    lines.push(`total_cad,${(p.total || 0).toFixed(2)}`);
    if (p.notes) {
      lines.push("");
      lines.push("# section: notes");
      lines.push(`notes,${escCSV(p.notes)}`);
    }
    if (p.photo) {
      lines.push("");
      lines.push("# section: photo");
      lines.push(`name,${escCSV(p.photo.name || "")}`);
      lines.push(`size,${escCSV(p.photo.size || 0)}`);
      lines.push(`type,${escCSV(p.photo.type || "")}`);
    }
    return lines.join("\n") + "\n";
  }
  function escCSV(v) {
    v = String(v ?? "");
    if (v.includes(",") || v.includes('"') || v.includes("\n")) return '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  // ---------- Helpers ----------
  function openPrint(html, title) {
    const w = window.open("", "_blank", "width=820,height=1080");
    if (!w) return alert("Pop-up bloquée. Activez les pop-ups pour cette URL.");
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.document.title = title;
    setTimeout(() => { try { w.focus(); w.print(); } catch (_) {} }, 250);
  }
  function download(text, name, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
})();
