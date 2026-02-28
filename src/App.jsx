import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// THEME SYSTEM
// ─────────────────────────────────────────────
const ACCENTS = [
  { id: "gold",    label: "Gold",    a: "#c9a84c", b: "#e8c96d" },
  { id: "emerald", label: "Emerald", a: "#3dba7e", b: "#5dd49a" },
  { id: "sapphire",label: "Sapphire",a: "#4a8fe8", b: "#6aafff" },
  { id: "rose",    label: "Rose",    a: "#e8507a", b: "#ff7a9a" },
  { id: "violet",  label: "Violet",  a: "#9b6ee8", b: "#bc8fff" },
  { id: "copper",  label: "Copper",  a: "#d4784a", b: "#f09a6a" },
];

function buildCSSVars(accent, dark) {
  const a = ACCENTS.find(x => x.id === accent) || ACCENTS[0];
  if (dark) return `
    --black:#0a0a0b; --surface:#111114; --surface2:#18181d; --surface3:#1f1f26;
    --border:#2a2a35; --border2:#363645;
    --acc:${a.a}; --acc2:${a.b}; --acc-dim:${a.a}26; --acc-glow:${a.a}14;
    --text:#f0ede6; --text2:#9b9790; --text3:#5a5856;
    --red:#e05555; --green:#4caf82; --blue:#5b8fe8; --orange:#d4874a;
    --radius:10px; --radius2:14px;
    --card-bg:var(--surface); --page-bg:var(--black);
  `;
  return `
    --black:#f0f0f5; --surface:#ffffff; --surface2:#f4f4f8; --surface3:#eaeaf0;
    --border:#dddde8; --border2:#c8c8d8;
    --acc:${a.a}; --acc2:${a.b}; --acc-dim:${a.a}22; --acc-glow:${a.a}11;
    --text:#1a1a2e; --text2:#5a5a7a; --text3:#9898b0;
    --red:#d94040; --green:#2e9e6a; --blue:#3a72cc; --orange:#c06030;
    --radius:10px; --radius2:14px;
    --card-bg:#ffffff; --page-bg:#f0f0f5;
  `;
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;500;700&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; }

  .app { min-height:100vh; background:var(--page-bg); color:var(--text); transition:background 0.3s, color 0.3s; }
  .app.dark {
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--acc) 4%, transparent) 0%, transparent 70%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 40px);
  }
  .app.light {
    background-image: radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--acc) 5%, transparent) 0%, transparent 70%);
  }

  /* ── VAULT DOOR ── */
  .vault-door-overlay { position:fixed; inset:0; z-index:999; background:#05050a; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .vault-door-overlay.opening { animation:vaultFadeOut 0.6s 2.8s forwards; }
  @keyframes vaultFadeOut { to { opacity:0; pointer-events:none; } }
  .vault-bg-lines { position:absolute; inset:0; background-image:repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(201,168,76,0.04) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(201,168,76,0.04) 60px); }
  .vault-scene { position:relative; width:300px; height:300px; }
  .vault-ring { position:absolute; border-radius:50%; border:3px solid var(--acc); display:flex; align-items:center; justify-content:center; }
  .vault-ring-1 { inset:0; animation:ringPulse 1.5s ease-in-out infinite; }
  .vault-ring-2 { inset:20px; border-color:color-mix(in srgb, var(--acc) 40%, transparent); animation:ringRotate 4s linear infinite; }
  .vault-ring-3 { inset:40px; border-color:color-mix(in srgb, var(--acc) 20%, transparent); animation:ringRotate 3s linear infinite reverse; }
  @keyframes ringPulse { 0%,100%{box-shadow:0 0 60px color-mix(in srgb,var(--acc) 30%,transparent),inset 0 0 40px color-mix(in srgb,var(--acc) 5%,transparent);} 50%{box-shadow:0 0 100px color-mix(in srgb,var(--acc) 50%,transparent),inset 0 0 60px color-mix(in srgb,var(--acc) 10%,transparent);} }
  @keyframes ringRotate { to { transform:rotate(360deg); } }
  .vault-ring-2::before,.vault-ring-2::after { content:''; position:absolute; width:8px; height:8px; background:var(--acc); border-radius:50%; }
  .vault-ring-2::before { top:-4px; left:50%; transform:translateX(-50%); }
  .vault-ring-2::after  { bottom:-4px; left:50%; transform:translateX(-50%); }
  .vault-center { position:absolute; inset:60px; border-radius:50%; background:radial-gradient(circle,#1a1600 0%,#0a0a0b 100%); border:2px solid color-mix(in srgb,var(--acc) 50%,transparent); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px; }
  .vault-lock-icon { font-size:44px; animation:lockBounce 0.5s 2s forwards; }
  @keyframes lockBounce { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
  .vault-status-text { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--acc); opacity:0; animation:fadeInText 0.4s 0.5s forwards; }
  @keyframes fadeInText { to { opacity:1; } }
  .vault-spokes { position:absolute; inset:40px; border-radius:50%; animation:ringRotate 8s linear infinite; }
  .vault-spoke { position:absolute; width:2px; background:linear-gradient(to bottom,transparent,color-mix(in srgb,var(--acc) 40%,transparent),transparent); left:50%; transform-origin:bottom center; height:50%; bottom:50%; }
  .vault-flash { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle,color-mix(in srgb,var(--acc) 60%,transparent) 0%,transparent 70%); opacity:0; animation:unlockFlash 0.4s 2.1s forwards; }
  @keyframes unlockFlash { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
  .vault-door-text { position:absolute; bottom:80px; left:50%; transform:translateX(-50%); font-family:'DM Serif Display',serif; font-size:28px; color:var(--acc); letter-spacing:4px; text-transform:uppercase; white-space:nowrap; opacity:0; animation:fadeInText 0.6s 0.3s forwards; }
  .vault-door-subtext { position:absolute; bottom:58px; left:50%; transform:translateX(-50%); font-family:'JetBrains Mono',monospace; font-size:10px; color:rgba(255,255,255,0.3); letter-spacing:3px; text-transform:uppercase; white-space:nowrap; opacity:0; animation:fadeInText 0.6s 0.6s forwards; }
  .vault-progress-wrap { position:absolute; bottom:24px; left:50%; transform:translateX(-50%); width:200px; }
  .vault-progress-track { height:2px; background:color-mix(in srgb,var(--acc) 15%,transparent); border-radius:1px; overflow:hidden; }
  .vault-progress-fill { height:100%; background:linear-gradient(90deg,var(--acc),var(--acc2)); border-radius:1px; animation:progressFill 2s ease-out forwards; }
  @keyframes progressFill { from{width:0} to{width:100%} }
  .vault-progress-label { font-family:'JetBrains Mono',monospace; font-size:9px; color:rgba(255,255,255,0.3); letter-spacing:2px; text-align:center; margin-top:6px; }

  /* ── LOCK SCREEN ── */
  .lock-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:32px; padding:24px; }
  .lock-icon { width:80px; height:80px; border:2px solid var(--acc); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow:0 0 40px var(--acc-dim),inset 0 0 20px var(--acc-glow); animation:pulse 3s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{box-shadow:0 0 40px var(--acc-dim),inset 0 0 20px var(--acc-glow);} 50%{box-shadow:0 0 60px color-mix(in srgb,var(--acc) 35%,transparent),inset 0 0 30px color-mix(in srgb,var(--acc) 10%,transparent);} }
  .lock-title { font-family:'DM Serif Display',serif; font-size:42px; color:var(--text); letter-spacing:-0.5px; text-align:center; }
  .lock-sub { color:var(--text2); font-size:14px; letter-spacing:2px; text-transform:uppercase; }
  .lock-form { display:flex; flex-direction:column; gap:16px; width:100%; max-width:360px; }
  .lock-input { background:var(--surface2); border:1px solid var(--border2); border-radius:var(--radius); padding:14px 18px; color:var(--text); font-family:'JetBrains Mono',monospace; font-size:15px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; letter-spacing:2px; }
  .lock-input:focus { border-color:var(--acc); box-shadow:0 0 0 3px var(--acc-dim); }

  /* ── BUTTONS ── */
  .btn-primary { background:linear-gradient(135deg,var(--acc) 0%,var(--acc2) 100%); color:var(--surface); border:none; border-radius:var(--radius); padding:14px 24px; font-family:'Outfit',sans-serif; font-weight:600; font-size:14px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:opacity 0.2s,transform 0.1s; }
  .btn-primary:hover { opacity:0.9; transform:translateY(-1px); }
  .btn-primary:active { transform:translateY(0); }
  .btn-ghost { background:transparent; border:1px solid var(--border2); color:var(--text2); border-radius:var(--radius); padding:10px 16px; font-family:'Outfit',sans-serif; font-size:13px; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
  .btn-ghost:hover { border-color:var(--acc); color:var(--acc); }
  .btn-danger { background:color-mix(in srgb,var(--red) 15%,transparent); border:1px solid color-mix(in srgb,var(--red) 30%,transparent); color:var(--red); border-radius:var(--radius); padding:10px 16px; font-family:'Outfit',sans-serif; font-size:13px; cursor:pointer; transition:all 0.15s; }
  .btn-danger:hover { background:color-mix(in srgb,var(--red) 25%,transparent); }
  .error-msg { color:var(--red); font-size:13px; text-align:center; padding:10px; background:color-mix(in srgb,var(--red) 10%,transparent); border-radius:8px; border:1px solid color-mix(in srgb,var(--red) 20%,transparent); }

  /* ── LAYOUT ── */
  .main { display:flex; min-height:100vh; }
  .sidebar { width:260px; min-height:100vh; padding:24px 16px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; gap:20px; flex-shrink:0; transition:background 0.3s; }
  .sidebar-logo { display:flex; align-items:center; gap:12px; padding:0 4px; }
  .logo-mark { width:36px; height:36px; background:linear-gradient(135deg,var(--acc),var(--acc2)); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; }
  .logo-text { font-family:'DM Serif Display',serif; font-size:20px; color:var(--text); }
  .logo-ver { font-size:10px; color:var(--text3); font-family:'JetBrains Mono',monospace; letter-spacing:1px; }
  .search-wrap { position:relative; }
  .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text3); font-size:14px; }
  .search-input { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:10px 12px 10px 36px; color:var(--text); font-family:'Outfit',sans-serif; font-size:13px; outline:none; transition:border-color 0.2s; }
  .search-input::placeholder { color:var(--text3); }
  .search-input:focus { border-color:var(--acc); }
  .nav-section { display:flex; flex-direction:column; gap:3px; }
  .nav-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--text3); padding:0 8px 8px; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; cursor:pointer; font-size:13px; color:var(--text2); transition:all 0.15s; border:1px solid transparent; }
  .nav-item:hover { background:var(--surface3); color:var(--text); }
  .nav-item.active { background:var(--acc-dim); color:var(--acc); border-color:color-mix(in srgb,var(--acc) 20%,transparent); }
  .nav-item .nav-icon { width:18px; text-align:center; }
  .nav-count { margin-left:auto; background:var(--surface3); color:var(--text3); font-size:11px; padding:1px 7px; border-radius:20px; font-family:'JetBrains Mono',monospace; }
  .nav-item.active .nav-count { background:var(--acc-dim); color:var(--acc); }
  .sidebar-footer { margin-top:auto; padding-top:16px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:8px; }
  .vault-stats { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
  .stat-card { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:9px 11px; }
  .stat-num { font-family:'JetBrains Mono',monospace; font-size:17px; color:var(--acc); font-weight:700; }
  .stat-label { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
  .sidebar-actions { display:flex; gap:6px; }

  /* ── AUTOLOCK BANNER ── */
  .autolock-banner { position:fixed; top:0; left:0; right:0; z-index:200; background:linear-gradient(90deg,var(--acc-dim),color-mix(in srgb,var(--acc) 8%,transparent)); border-bottom:1px solid color-mix(in srgb,var(--acc) 25%,transparent); padding:10px 20px; display:flex; align-items:center; gap:12px; font-size:13px; color:var(--acc); font-family:'JetBrains Mono',monospace; letter-spacing:1px; animation:slideDown 0.3s ease; }
  @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }
  .autolock-progress { flex:1; height:3px; background:var(--acc-dim); border-radius:2px; overflow:hidden; }
  .autolock-fill { height:100%; background:var(--acc); border-radius:2px; transition:width 1s linear; }

  /* ── CONTENT ── */
  .content { flex:1; padding:32px; overflow-y:auto; max-height:100vh; }
  .content-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .page-title { font-family:'DM Serif Display',serif; font-size:28px; color:var(--text); }
  .page-sub { font-size:13px; color:var(--text3); margin-top:2px; }
  .header-actions { display:flex; gap:10px; }

  /* ── ALERT CHIPS ── */
  .alert-row { display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
  .alert-chip { display:flex; align-items:center; gap:8px; padding:7px 13px; border-radius:8px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.15s; border:1px solid transparent; }
  .alert-chip.breach { background:color-mix(in srgb,var(--red) 10%,transparent); border-color:color-mix(in srgb,var(--red) 25%,transparent); color:var(--red); }
  .alert-chip.dupe   { background:color-mix(in srgb,var(--blue) 10%,transparent); border-color:color-mix(in srgb,var(--blue) 25%,transparent); color:var(--blue); }
  .alert-chip.old    { background:color-mix(in srgb,var(--orange) 10%,transparent); border-color:color-mix(in srgb,var(--orange) 25%,transparent); color:var(--orange); }

  /* ── PASSWORD CARDS ── */
  .pw-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }
  .pw-card { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius2); padding:18px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
  .pw-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--acc),var(--acc2)); transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .pw-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.15); }
  .pw-card:hover::before { transform:scaleX(1); }
  .pw-card.selected { border-color:var(--acc); background:var(--surface2); }
  .pw-card.selected::before { transform:scaleX(1); }
  .pw-card.has-breach { border-color:color-mix(in srgb,var(--red) 40%,transparent); }
  .pw-card.has-breach::before { background:var(--red); transform:scaleX(1); }
  .pw-card.has-dupe { border-color:color-mix(in srgb,var(--blue) 35%,transparent); }
  .pw-card.is-old { border-color:color-mix(in srgb,var(--orange) 35%,transparent); }
  .card-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
  .card-favicon { width:40px; height:40px; border-radius:10px; background:var(--surface3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; overflow:hidden; }
  .card-favicon img { width:100%; height:100%; object-fit:contain; }
  .card-meta { flex:1; min-width:0; }
  .card-name { font-size:14px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .card-url { font-size:11px; color:var(--text3); font-family:'JetBrains Mono',monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
  .card-badge { background:var(--surface3); border:1px solid var(--border); border-radius:20px; padding:2px 7px; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; flex-shrink:0; }
  .card-field { display:flex; align-items:center; gap:10px; padding:7px 0; border-top:1px solid var(--border); }
  .field-label { font-size:10px; color:var(--text3); width:50px; flex-shrink:0; text-transform:uppercase; letter-spacing:0.5px; }
  .field-val { font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--text2); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .field-actions { display:flex; gap:4px; opacity:0; transition:opacity 0.15s; }
  .pw-card:hover .field-actions, .pw-card.selected .field-actions { opacity:1; }
  .icon-btn { background:var(--surface3); border:none; color:var(--text2); width:26px; height:26px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; transition:all 0.15s; }
  .icon-btn:hover { background:var(--acc-dim); color:var(--acc); }
  .strength-bar { height:3px; border-radius:2px; background:var(--surface3); margin-top:10px; overflow:hidden; }
  .strength-fill { height:100%; border-radius:2px; transition:width 0.4s,background 0.4s; }
  .card-warnings { display:flex; gap:5px; margin-top:8px; flex-wrap:wrap; }
  .warn-badge { font-size:10px; padding:2px 7px; border-radius:12px; font-family:'JetBrains Mono',monospace; letter-spacing:0.5px; display:flex; align-items:center; gap:4px; }
  .warn-badge.breach { background:color-mix(in srgb,var(--red) 15%,transparent); color:var(--red); border:1px solid color-mix(in srgb,var(--red) 25%,transparent); }
  .warn-badge.dupe   { background:color-mix(in srgb,var(--blue) 15%,transparent); color:var(--blue); border:1px solid color-mix(in srgb,var(--blue) 25%,transparent); }
  .warn-badge.old    { background:color-mix(in srgb,var(--orange) 15%,transparent); color:var(--orange); border:1px solid color-mix(in srgb,var(--orange) 25%,transparent); }
  .warn-badge.checking { background:var(--surface3); color:var(--text3); border:1px solid var(--border); }

  /* ── CREDIT CARD ── */
  .cc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }
  .cc-card {
    border-radius:16px; padding:22px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;
    background:linear-gradient(135deg, var(--acc) 0%, var(--acc2) 100%);
    border:1px solid var(--border); min-height:170px; display:flex; flex-direction:column; justify-content:space-between;
    box-shadow: 0 8px 32px color-mix(in srgb,var(--acc) 25%,transparent);
  }
  .cc-card:hover { transform:translateY(-3px) scale(1.01); box-shadow:0 16px 48px color-mix(in srgb,var(--acc) 35%,transparent); }
  .cc-card.selected { outline:3px solid white; }
  .cc-card-shine { position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%); pointer-events:none; }
  .cc-chip { width:34px; height:26px; background:linear-gradient(135deg,#d4af6a,#b8943a); border-radius:5px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
  .cc-chip-lines { display:grid; grid-template-rows:1fr 1fr 1fr; gap:2px; width:60%; height:60%; }
  .cc-chip-line { background:rgba(0,0,0,0.2); border-radius:1px; }
  .cc-number { font-family:'JetBrains Mono',monospace; font-size:15px; color:rgba(255,255,255,0.95); letter-spacing:3px; margin-bottom:14px; }
  .cc-bottom { display:flex; justify-content:space-between; align-items:flex-end; }
  .cc-holder { font-size:12px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:1px; font-size:10px; }
  .cc-holder-name { font-size:13px; color:white; font-weight:600; letter-spacing:1px; margin-top:2px; }
  .cc-expiry-label { font-size:9px; color:rgba(255,255,255,0.6); letter-spacing:1px; text-align:right; }
  .cc-expiry { font-family:'JetBrains Mono',monospace; font-size:13px; color:white; font-weight:600; }
  .cc-network { font-size:22px; position:absolute; top:18px; right:18px; opacity:0.9; }
  .cc-actions { display:flex; gap:6px; margin-top:12px; }
  .cc-action-btn { background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); color:white; border-radius:7px; padding:6px 12px; font-size:11px; cursor:pointer; transition:all 0.15s; display:flex;align-items:center;gap:5px; font-family:'Outfit',sans-serif; }
  .cc-action-btn:hover { background:rgba(255,255,255,0.3); }
  .cc-expired { position:absolute; top:12px; left:12px; background:rgba(224,85,85,0.9); color:white; font-size:10px; padding:2px 8px; border-radius:12px; font-family:'JetBrains Mono',monospace; letter-spacing:1px; }

  /* ── MODALS ── */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(6px); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn 0.15s; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius2); width:100%; max-width:500px; max-height:90vh; overflow-y:auto; animation:slideUp 0.2s; box-shadow:0 24px 80px rgba(0,0,0,0.4); }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-header { padding:24px 24px 0; display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .modal-title { font-family:'DM Serif Display',serif; font-size:22px; color:var(--text); }
  .modal-close { background:var(--surface3); border:none; color:var(--text2); width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .modal-close:hover { background:color-mix(in srgb,var(--red) 15%,transparent); color:var(--red); }
  .modal-body { padding:0 24px 24px; display:flex; flex-direction:column; gap:16px; }
  .modal-footer { padding:16px 24px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; }
  .field-group { display:flex; flex-direction:column; gap:5px; }
  .field-group label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); }
  .field-input { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:11px 14px; color:var(--text); font-family:'Outfit',sans-serif; font-size:14px; outline:none; transition:all 0.2s; }
  .field-input:focus { border-color:var(--acc); box-shadow:0 0 0 3px var(--acc-dim); }
  .field-input.mono { font-family:'JetBrains Mono',monospace; font-size:13px; letter-spacing:1px; }
  .pw-input-wrap { position:relative; display:flex; align-items:center; }
  .pw-input-wrap .field-input { flex:1; padding-right:80px; }
  .pw-input-wrap .actions { position:absolute; right:8px; display:flex; gap:4px; }
  select.field-input { cursor:pointer; }
  textarea.field-input { resize:vertical; min-height:70px; }

  /* ── GENERATOR ── */
  .gen-section { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:14px; }
  .gen-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .gen-title { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); }
  .gen-pw { font-family:'JetBrains Mono',monospace; font-size:14px; color:var(--acc); background:var(--surface3); border:1px solid var(--border); border-radius:8px; padding:10px 12px; word-break:break-all; margin-bottom:12px; min-height:44px; display:flex; align-items:center; }
  .gen-options { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-bottom:12px; }
  .gen-check { display:flex; align-items:center; gap:7px; cursor:pointer; }
  .gen-check input { accent-color:var(--acc); width:13px; height:13px; }
  .gen-check span { font-size:12px; color:var(--text2); }
  .slider-wrap { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
  .slider-label { font-size:12px; color:var(--text3); white-space:nowrap; }
  input[type=range] { flex:1; accent-color:var(--acc); height:4px; }
  .slider-val { font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--acc); width:24px; text-align:right; }

  /* ── STRENGTH ── */
  .strength-indicator { display:flex; gap:4px; align-items:center; }
  .strength-seg { flex:1; height:4px; border-radius:2px; transition:background 0.3s; }
  .strength-text { font-size:11px; font-family:'JetBrains Mono',monospace; letter-spacing:1px; text-transform:uppercase; width:56px; text-align:right; }

  /* ── DETAIL PANEL ── */
  .detail-panel { position:fixed; right:0; top:0; bottom:0; width:360px; background:var(--surface); border-left:1px solid var(--border); padding:24px; overflow-y:auto; z-index:50; animation:slideIn 0.2s; }
  @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
  .detail-favicon { width:64px; height:64px; border-radius:16px; background:var(--surface2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:32px; margin-bottom:14px; overflow:hidden; }
  .detail-favicon img { width:100%; height:100%; object-fit:contain; }
  .detail-name { font-family:'DM Serif Display',serif; font-size:24px; color:var(--text); margin-bottom:3px; }
  .detail-url  { font-size:12px; color:var(--acc); font-family:'JetBrains Mono',monospace; margin-bottom:16px; }
  .detail-alerts { display:flex; flex-direction:column; gap:8px; margin-bottom:18px; }
  .detail-alert { padding:9px 13px; border-radius:8px; font-size:12px; line-height:1.5; }
  .detail-alert.breach { background:color-mix(in srgb,var(--red) 10%,transparent); border:1px solid color-mix(in srgb,var(--red) 25%,transparent); color:var(--red); }
  .detail-alert.dupe   { background:color-mix(in srgb,var(--blue) 10%,transparent); border:1px solid color-mix(in srgb,var(--blue) 25%,transparent); color:var(--blue); }
  .detail-alert.old    { background:color-mix(in srgb,var(--orange) 10%,transparent); border:1px solid color-mix(in srgb,var(--orange) 25%,transparent); color:var(--orange); }
  .detail-alert.safe   { background:color-mix(in srgb,var(--green) 8%,transparent); border:1px solid color-mix(in srgb,var(--green) 20%,transparent); color:var(--green); }
  .detail-section { margin-bottom:18px; }
  .detail-section-title { font-size:10px; text-transform:uppercase; letter-spacing:2px; color:var(--text3); margin-bottom:10px; padding-bottom:7px; border-bottom:1px solid var(--border); }
  .detail-row { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--border); }
  .detail-row-label { font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; }
  .detail-row-val { font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--text); display:flex; align-items:center; gap:8px; }

  /* ── TOAST ── */
  .copied-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--surface2); border:1px solid var(--acc); border-radius:8px; padding:10px 20px; font-size:13px; color:var(--acc); z-index:300; animation:toast 2.2s forwards; white-space:nowrap; }
  @keyframes toast { 0%{opacity:0;transform:translateX(-50%) translateY(10px)} 15%{opacity:1;transform:translateX(-50%) translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateX(-50%) translateY(-5px)} }

  .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 24px; gap:14px; text-align:center; }
  .empty-icon { font-size:44px; opacity:0.2; }
  .empty-title { font-size:18px; color:var(--text2); font-family:'DM Serif Display',serif; }
  .empty-sub { font-size:13px; color:var(--text3); max-width:280px; }

  /* ── VAULT CONFIRM ── */
  .confirm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); z-index:400; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn 0.15s; }
  .confirm-modal { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius2); width:100%; max-width:360px; padding:32px; animation:slideUp 0.2s; box-shadow:0 24px 80px rgba(0,0,0,0.5); text-align:center; }
  .confirm-icon { font-size:36px; margin-bottom:14px; }
  .confirm-title { font-family:'DM Serif Display',serif; font-size:22px; color:var(--text); margin-bottom:6px; }
  .confirm-sub { font-size:13px; color:var(--text3); margin-bottom:24px; line-height:1.5; }
  .confirm-input { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:12px 16px; color:var(--text); font-family:'JetBrains Mono',monospace; font-size:14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; letter-spacing:2px; margin-bottom:10px; text-align:center; }
  .confirm-input:focus { border-color:var(--acc); box-shadow:0 0 0 3px var(--acc-dim); }
  .confirm-input.shake { animation:shake 0.4s; border-color:var(--red); }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
  .confirm-actions { display:flex; gap:8px; margin-top:4px; }
  .confirm-hint { font-size:11px; color:var(--text3); margin-top:10px; }

  /* ── LOCKOUT SCREEN ── */
  .lockout-box { background:color-mix(in srgb,var(--red) 10%,transparent); border:1px solid color-mix(in srgb,var(--red) 30%,transparent); border-radius:var(--radius2); padding:24px; text-align:center; width:100%; max-width:360px; }
  .lockout-icon { font-size:32px; margin-bottom:10px; }
  .lockout-title { font-family:'DM Serif Display',serif; font-size:20px; color:var(--red); margin-bottom:6px; }
  .lockout-sub { font-size:13px; color:var(--text2); line-height:1.5; }
  .lockout-timer { font-family:'JetBrains Mono',monospace; font-size:36px; color:var(--red); margin:16px 0; font-weight:700; }
  .lockout-progress-track { height:4px; background:color-mix(in srgb,var(--red) 15%,transparent); border-radius:2px; overflow:hidden; margin-top:4px; }
  .lockout-progress-fill { height:100%; background:var(--red); border-radius:2px; transition:width 1s linear; }
  .attempts-row { display:flex; gap:6px; justify-content:center; margin-top:8px; }
  .attempt-dot { width:10px; height:10px; border-radius:50%; transition:background 0.3s; }

  /* ── SESSION HISTORY ── */
  .session-list { display:flex; flex-direction:column; gap:8px; }
  .session-item { background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:12px 14px; display:flex; align-items:flex-start; gap:12px; }
  .session-dot { width:8px; height:8px; border-radius:50%; background:var(--green); flex-shrink:0; margin-top:5px; }
  .session-dot.failed { background:var(--red); }
  .session-dot.locked { background:var(--orange); }
  .session-time { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--acc); margin-bottom:3px; }
  .session-detail { font-size:12px; color:var(--text2); }
  .session-badge { display:inline-flex; align-items:center; font-size:10px; padding:2px 7px; border-radius:12px; margin-top:4px; }
  .session-badge.success { background:color-mix(in srgb,var(--green) 12%,transparent); color:var(--green); border:1px solid color-mix(in srgb,var(--green) 25%,transparent); }
  .session-badge.failed  { background:color-mix(in srgb,var(--red) 12%,transparent); color:var(--red); border:1px solid color-mix(in srgb,var(--red) 25%,transparent); }
  .session-badge.locked  { background:color-mix(in srgb,var(--orange) 12%,transparent); color:var(--orange); border:1px solid color-mix(in srgb,var(--orange) 25%,transparent); }

  /* ── MOBILE TOP BAR ── */
  .mobile-topbar { display:none; position:fixed; top:0; left:0; right:0; z-index:150; height:56px; background:var(--surface); border-bottom:1px solid var(--border); align-items:center; justify-content:space-between; padding:0 16px; }
  .mobile-topbar-logo { display:flex; align-items:center; gap:10px; }
  .mobile-topbar-title { font-family:'DM Serif Display',serif; font-size:20px; color:var(--text); }
  .mobile-menu-btn { background:var(--surface2); border:1px solid var(--border); color:var(--text2); width:36px; height:36px; border-radius:9px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; }
  .mobile-add-btn { background:linear-gradient(135deg,var(--acc),var(--acc2)); border:none; color:var(--surface); width:36px; height:36px; border-radius:9px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; font-weight:bold; }

  /* ── MOBILE SIDEBAR DRAWER ── */
  .sidebar-backdrop { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:160; }
  .sidebar-backdrop.open { display:block; }

  /* ── MOBILE BOTTOM NAV ── */
  .mobile-bottomnav { display:none; position:fixed; bottom:0; left:0; right:0; z-index:150; height:64px; background:var(--surface); border-top:1px solid var(--border); align-items:center; justify-content:space-around; padding:0 8px; }
  .mobile-tab { display:flex; flex-direction:column; align-items:center; gap:3px; padding:8px 16px; border-radius:10px; cursor:pointer; transition:all 0.15s; border:none; background:transparent; color:var(--text3); flex:1; }
  .mobile-tab.active { color:var(--acc); }
  .mobile-tab-icon { font-size:20px; line-height:1; }
  .mobile-tab-label { font-size:10px; letter-spacing:0.5px; font-family:'Outfit',sans-serif; }

  /* ── RESPONSIVE BREAKPOINTS ── */
  @media (max-width: 768px) {
    .mobile-topbar { display:flex; }
    .mobile-bottomnav { display:flex; }

    /* Sidebar becomes a drawer */
    .sidebar {
      position:fixed; left:0; top:0; bottom:0; z-index:170;
      transform:translateX(-100%); transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);
      width:280px; min-height:100vh; padding-top:24px;
      box-shadow: 4px 0 32px rgba(0,0,0,0.3);
    }
    .sidebar.open { transform:translateX(0); }

    /* Main layout */
    .main { flex-direction:column; padding-top:56px; padding-bottom:64px; }
    .content { padding:16px; max-height:none; }
    .content-header { margin-bottom:16px; }
    .page-title { font-size:22px; }
    .header-actions { display:none; } /* replaced by topbar + button */

    /* Password grid — single column */
    .pw-grid { grid-template-columns:1fr; gap:10px; }
    .cc-grid { grid-template-columns:1fr; gap:10px; }

    /* Detail panel — full screen sheet */
    .detail-panel {
      position:fixed; inset:0; width:100%; border-left:none;
      border-top:1px solid var(--border); z-index:180;
      padding:16px; padding-top:60px;
      animation:slideUp 0.25s;
    }

    /* Settings panel — full screen */
    .settings-panel {
      position:fixed; inset:0; width:100%; border-left:none; z-index:180;
      padding:16px; padding-top:60px; animation:slideUp 0.25s;
    }

    /* Dashboard grid */
    .dash-grid { grid-template-columns:1fr; }
    .dash-card.span2 { grid-column:span 1; }
    .dash-card.span3 { grid-column:span 1; }

    /* Modal — full width */
    .overlay { padding:0; align-items:flex-end; }
    .modal { max-width:100%; border-radius:var(--radius2) var(--radius2) 0 0; max-height:92vh; }

    /* Autolock banner */
    .autolock-banner { font-size:11px; padding:8px 12px; }

    /* Cards — make action buttons wrap */
    .cc-actions { flex-wrap:wrap; }
    .cc-action-btn { flex:1; justify-content:center; min-width:80px; }

    /* Toast above bottom nav */
    .copied-toast { bottom:76px; }

    /* Field actions always visible on mobile (no hover) */
    .field-actions { opacity:1 !important; }

    /* Lock screen */
    .lock-screen { padding:24px 20px; gap:24px; }
    .lock-title { font-size:34px; }

    /* Vault door scene scale down */
    .vault-scene { width:220px; height:220px; }
    .vault-door-text { font-size:22px; bottom:60px; }
    .vault-door-subtext { font-size:8px; bottom:42px; }
    .vault-progress-wrap { bottom:12px; width:160px; }
  }

  @media (max-width: 400px) {
    .vault-scene { width:180px; height:180px; }
    .content { padding:12px; }
    .pw-card { padding:14px; }
  }

  /* ── DASHBOARD ── */
  .dash-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:24px; }
  .dash-card { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius2); padding:20px; }
  .dash-card.span2 { grid-column: span 2; }
  .dash-card.span3 { grid-column: span 3; }
  .dash-card-title { font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--text3); margin-bottom:16px; }
  .health-score { font-family:'DM Serif Display',serif; font-size:72px; line-height:1; }
  .health-label { font-size:13px; color:var(--text2); margin-top:6px; }
  .health-ring { position:relative; width:120px; height:120px; margin:0 auto 16px; }
  .health-ring svg { transform:rotate(-90deg); }
  .health-ring-text { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'DM Serif Display',serif; }
  .bar-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .bar-label { font-size:12px; color:var(--text2); width:60px; flex-shrink:0; }
  .bar-track { flex:1; height:8px; background:var(--surface3); border-radius:4px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:4px; transition:width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
  .bar-count { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text3); width:24px; text-align:right; }
  .checklist { display:flex; flex-direction:column; gap:10px; }
  .check-item { display:flex; align-items:flex-start; gap:12px; padding:12px; border-radius:10px; background:var(--surface2); border:1px solid var(--border); }
  .check-item.done { opacity:0.5; }
  .check-dot { width:20px; height:20px; border-radius:50%; border:2px solid var(--border2); flex-shrink:0; margin-top:1px; display:flex; align-items:center; justify-content:center; font-size:10px; }
  .check-dot.done { background:var(--green); border-color:var(--green); color:white; }
  .check-dot.warn { background:color-mix(in srgb,var(--red) 15%,transparent); border-color:var(--red); color:var(--red); }
  .check-text { font-size:13px; color:var(--text); line-height:1.4; }
  .check-sub { font-size:11px; color:var(--text3); margin-top:2px; }
  .cat-dots { display:flex; flex-wrap:wrap; gap:8px; }
  .cat-dot-item { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text2); }
  .cat-dot { width:10px; height:10px; border-radius:50%; }

  /* ── SETTINGS PANEL ── */
  .settings-panel { position:fixed; right:0; top:0; bottom:0; width:320px; background:var(--surface); border-left:1px solid var(--border); padding:24px; overflow-y:auto; z-index:60; animation:slideIn 0.2s; }
  .settings-section { margin-bottom:28px; }
  .settings-title { font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--text3); margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid var(--border); }
  .theme-row { display:flex; align-items:center; justify-content:space-between; }
  .toggle-wrap { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text2); }
  .toggle { position:relative; width:42px; height:24px; cursor:pointer; }
  .toggle input { opacity:0; width:0; height:0; }
  .toggle-track { position:absolute; inset:0; background:var(--surface3); border-radius:12px; transition:background 0.2s; border:1px solid var(--border2); }
  .toggle input:checked + .toggle-track { background:var(--acc); border-color:var(--acc); }
  .toggle-thumb { position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform 0.2s; box-shadow:0 1px 4px rgba(0,0,0,0.3); }
  .toggle input:checked ~ .toggle-thumb { transform:translateX(18px); }
  .accent-swatches { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .accent-swatch { padding:10px; border-radius:10px; cursor:pointer; border:2px solid transparent; transition:all 0.15s; display:flex; flex-direction:column; align-items:center; gap:6px; }
  .accent-swatch:hover { border-color:var(--border2); }
  .accent-swatch.active { border-color:var(--acc); background:var(--acc-dim); }
  .accent-dot { width:28px; height:28px; border-radius:50%; }
  .accent-name { font-size:11px; color:var(--text2); }
`;

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const CATEGORIES = [
  { id:"all",      label:"All Vaults",  icon:"⬡" },
  { id:"social",   label:"Social",      icon:"◉" },
  { id:"finance",  label:"Finance",     icon:"◈" },
  { id:"work",     label:"Work",        icon:"◧" },
  { id:"shopping", label:"Shopping",    icon:"◎" },
  { id:"dev",      label:"Developer",   icon:"◆" },
  { id:"other",    label:"Other",       icon:"◌" },
];
const AUTO_LOCK_SECONDS = 300;
const AGE_WARN_DAYS = 90;
const SPOKE_ANGLES = [0,45,90,135,180,225,270,315];
const VAULT_STEPS = ["INITIALIZING","VERIFYING KEY","DECRYPTING","ACCESS GRANTED"];

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function generatePassword(length=20,opts={}) {
  const { upper=true,lower=true,numbers=true,symbols=true } = opts;
  let chars="";
  if(upper)   chars+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if(lower)   chars+="abcdefghijklmnopqrstuvwxyz";
  if(numbers) chars+="0123456789";
  if(symbols) chars+="!@#$%^&*()-_=+[]{}|;:,.<>?";
  if(!chars)  chars="abcdefghijklmnopqrstuvwxyz";
  return Array.from({length},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
}
function getStrength(pw) {
  if(!pw) return {score:0,label:"—",color:"var(--text3)"};
  let s=0;
  if(pw.length>=8)s++;if(pw.length>=14)s++;if(pw.length>=20)s++;
  if(/[A-Z]/.test(pw))s++;if(/[a-z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;
  const lvl=s<=2?0:s<=4?1:s<=6?2:3;
  return [{score:1,label:"Weak",color:"var(--red)"},{score:2,label:"Fair",color:"var(--orange)"},{score:3,label:"Good",color:"#c9c44c"},{score:4,label:"Strong",color:"var(--green)"}][lvl];
}
function daysSince(d) { if(!d)return 0; return Math.floor((Date.now()-new Date(d).getTime())/(1000*60*60*24)); }
function getFaviconUrl(url) {
  if(!url) return null;
  const domain = url.replace(/^https?:\/\//,"").split("/")[0];
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
async function checkBreach(password) {
  try {
    const buf = await crypto.subtle.digest("SHA-1",new TextEncoder().encode(password));
    const hex = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
    const res = await fetch(`https://api.pwnedpasswords.com/range/${hex.slice(0,5)}`,{headers:{"Add-Padding":"true"}});
    if(!res.ok) return {status:"error"};
    const text = await res.text();
    const match = text.split("\n").find(l=>l.startsWith(hex.slice(5)));
    if(match) return {status:"breached",count:parseInt(match.split(":")[1])||1};
    return {status:"safe"};
  } catch { return {status:"error"}; }
}
function maskCC(num) {
  const d = num.replace(/\D/g,"");
  if(!d) return "•••• •••• •••• ••••";
  return d.replace(/(.{4})/g,"$1 ").trim().replace(/\d(?=.{5})/g,"•");
}
function isExpired(exp) {
  if(!exp) return false;
  const [m,y] = exp.split("/");
  if(!m||!y) return false;
  const expDate = new Date(2000+parseInt(y), parseInt(m)-1, 1);
  return expDate < new Date();
}
function ccNetwork(num) {
  const d = num?.replace(/\D/g,"") || "";
  if(d.startsWith("4")) return "💳 Visa";
  if(d.startsWith("5")) return "💳 MC";
  if(d.startsWith("3")) return "💳 Amex";
  return "💳";
}

const DEMO_ENTRIES = [
  {id:1,name:"GitHub",url:"github.com",username:"dev_user",password:"Gh!tHub_Secure99",category:"dev",notes:"Personal dev account",createdAt:"2024-01-15",updatedAt:"2024-01-15"},
  {id:2,name:"Gmail",url:"mail.google.com",username:"user@gmail.com",password:"password123",category:"social",notes:"",createdAt:"2023-08-01",updatedAt:"2023-08-01"},
  {id:3,name:"Chase Bank",url:"chase.com",username:"john.doe",password:"Ch@se_B@nk!2024#",category:"finance",notes:"Checking & savings",createdAt:"2024-03-10",updatedAt:"2024-03-10"},
  {id:4,name:"AWS Console",url:"console.aws.amazon.com",username:"admin@company.com",password:"Gh!tHub_Secure99",category:"dev",notes:"Production account",createdAt:"2024-04-05",updatedAt:"2024-04-05"},
  {id:5,name:"Netflix",url:"netflix.com",username:"user@gmail.com",password:"Netfl1x_F@m!ly24",category:"shopping",notes:"Family plan",createdAt:"2024-05-20",updatedAt:"2024-05-20"},
];
const DEMO_CARDS = [
  {id:"c1",name:"Chase Sapphire",number:"4532015112830366",holder:"John Doe",expiry:"09/27",cvv:"452",bank:"Chase",color:"gold"},
  {id:"c2",name:"Amex Platinum",number:"378282246310005",holder:"John Doe",expiry:"03/25",cvv:"1234",bank:"American Express",color:"emerald"},
];

// ─────────────────────────────────────────────
// LOCKOUT & SESSION HISTORY UTILS
// ─────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60; // 5 minutes in seconds

function getLockoutState() {
  try {
    const raw = localStorage.getItem("vault_lockout");
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (Date.now() > state.until) { localStorage.removeItem("vault_lockout"); return null; }
    return state;
  } catch { return null; }
}

function setLockoutState() {
  const until = Date.now() + LOCKOUT_DURATION * 1000;
  localStorage.setItem("vault_lockout", JSON.stringify({ until }));
  addSessionEvent("locked", "Vault locked after too many failed attempts");
}

function getFailedAttempts() { return parseInt(localStorage.getItem("vault_failed") || "0"); }
function incrementFailed() { const n = getFailedAttempts() + 1; localStorage.setItem("vault_failed", n); return n; }
function clearFailed() { localStorage.removeItem("vault_failed"); }

function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Unknown Browser";
}

function formatSessionTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) + " · " + d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
}

function getSessionHistory() {
  try { return JSON.parse(localStorage.getItem("vault_sessions") || "[]"); } catch { return []; }
}

function addSessionEvent(type, detail) {
  const sessions = getSessionHistory();
  sessions.unshift({ type, detail, ts: Date.now(), browser: getBrowserInfo() });
  if (sessions.length > 20) sessions.splice(20);
  localStorage.setItem("vault_sessions", JSON.stringify(sessions));
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
function VaultDoor({onDone}) {
  const [step,setStep]=useState(0);
  useEffect(()=>{
    const t=[setTimeout(()=>setStep(1),600),setTimeout(()=>setStep(2),1200),setTimeout(()=>setStep(3),1900),setTimeout(onDone,3400)];
    return()=>t.forEach(clearTimeout);
  },[onDone]);
  return (
    <div className="vault-door-overlay opening">
      <div className="vault-bg-lines"/>
      <div className="vault-scene">
        <div className="vault-ring vault-ring-1">
          <div className="vault-ring vault-ring-2">
            <div className="vault-ring vault-ring-3">
              <div className="vault-spokes">
                {SPOKE_ANGLES.map(a=><div key={a} className="vault-spoke" style={{transform:`translateX(-50%) rotate(${a}deg)`}}/>)}
              </div>
              <div className="vault-center">
                <div className="vault-lock-icon">🔓</div>
                <div className="vault-status-text">{VAULT_STEPS[step]}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="vault-flash"/>
      </div>
      <div className="vault-door-text">Vault</div>
      <div className="vault-door-subtext">SECURE PASSWORD MANAGER</div>
      <div className="vault-progress-wrap">
        <div className="vault-progress-track"><div className="vault-progress-fill"/></div>
        <div className="vault-progress-label">{VAULT_STEPS[step]}</div>
      </div>
    </div>
  );
}

function StrengthIndicator({password}) {
  const s=getStrength(password);
  return (
    <div style={{display:"flex",alignItems:"center",gap:"10px",marginTop:"8px"}}>
      <div className="strength-indicator" style={{flex:1}}>
        {[1,2,3,4].map(i=><div key={i} className="strength-seg" style={{background:i<=s.score?s.color:"var(--surface3)"}}/>)}
      </div>
      <span className="strength-text" style={{color:s.color}}>{s.label}</span>
    </div>
  );
}

function PasswordGenerator({onUse}) {
  const [length,setLength]=useState(20);
  const [opts,setOpts]=useState({upper:true,lower:true,numbers:true,symbols:true});
  const [pw,setPw]=useState(()=>generatePassword(20));
  const gen=useCallback(()=>setPw(generatePassword(length,opts)),[length,opts]);
  useEffect(()=>{gen();},[gen]);
  return (
    <div className="gen-section">
      <div className="gen-header"><span className="gen-title">Generator</span><button className="icon-btn" onClick={gen}>↺</button></div>
      <div className="gen-pw">{pw}</div>
      <div className="slider-wrap">
        <span className="slider-label">Length</span>
        <input type="range" min={8} max={64} value={length} onChange={e=>setLength(+e.target.value)}/>
        <span className="slider-val">{length}</span>
      </div>
      <div className="gen-options">
        {[["upper","A–Z"],["lower","a–z"],["numbers","0–9"],["symbols","!@#"]].map(([k,l])=>(
          <label key={k} className="gen-check">
            <input type="checkbox" checked={opts[k]} onChange={()=>setOpts(p=>({...p,[k]:!p[k]}))}/>
            <span>{l}</span>
          </label>
        ))}
      </div>
      <StrengthIndicator password={pw}/>
      <button className="btn-primary" style={{width:"100%",marginTop:"10px"}} onClick={()=>onUse(pw)}>Use This Password</button>
    </div>
  );
}

function FaviconImg({url,fallback,size=40}) {
  const [failed,setFailed]=useState(false);
  const src=getFaviconUrl(url);
  if(!src||failed) return <span style={{fontSize:size*0.45}}>{fallback||"🔑"}</span>;
  return <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setFailed(true)}/>;
}

function AddEditModal({entry,onSave,onClose}) {
  const isEdit=!!entry;
  const [form,setForm]=useState({name:entry?.name||"",url:entry?.url||"",username:entry?.username||"",password:entry?.password||"",category:entry?.category||"other",notes:entry?.notes||""});
  const [showPw,setShowPw]=useState(false);
  const [showGen,setShowGen]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=()=>{
    if(!form.name||!form.password)return;
    const now=new Date().toISOString().slice(0,10);
    onSave({...entry,...form,id:entry?.id||Date.now(),createdAt:entry?.createdAt||now,updatedAt:now});
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><span className="modal-title">{isEdit?"Edit Entry":"New Entry"}</span><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
            <div className="field-group" style={{gridColumn:"1/-1"}}><label>Site Name</label><input className="field-input" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. GitHub"/></div>
            <div className="field-group"><label>URL</label><input className="field-input mono" value={form.url} onChange={e=>set("url",e.target.value)} placeholder="github.com"/></div>
            <div className="field-group"><label>Category</label><select className="field-input" value={form.category} onChange={e=>set("category",e.target.value)}>{CATEGORIES.filter(c=>c.id!=="all").map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
            <div className="field-group" style={{gridColumn:"1/-1"}}><label>Username / Email</label><input className="field-input mono" value={form.username} onChange={e=>set("username",e.target.value)} placeholder="user@example.com"/></div>
            <div className="field-group" style={{gridColumn:"1/-1"}}>
              <label>Password</label>
              <div className="pw-input-wrap">
                <input className="field-input mono" type={showPw?"text":"password"} value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••••••"/>
                <div className="actions"><button className="icon-btn" onClick={()=>setShowPw(p=>!p)}>{showPw?"◌":"◉"}</button><button className="icon-btn" onClick={()=>setShowGen(p=>!p)}>⚡</button></div>
              </div>
              <StrengthIndicator password={form.password}/>
            </div>
            {showGen&&<div style={{gridColumn:"1/-1"}}><PasswordGenerator onUse={pw=>{set("password",pw);setShowGen(false);}}/></div>}
            <div className="field-group" style={{gridColumn:"1/-1"}}><label>Notes</label><textarea className="field-input" value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Optional notes..." rows={2}/></div>
          </div>
        </div>
        <div className="modal-footer"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave}>{isEdit?"Save Changes":"Add Entry"}</button></div>
      </div>
    </div>
  );
}

function AddEditCardModal({card,onSave,onClose}) {
  const isEdit=!!card;
  const [form,setForm]=useState({name:card?.name||"",number:card?.number||"",holder:card?.holder||"",expiry:card?.expiry||"",cvv:card?.cvv||"",bank:card?.bank||""});
  const [showCvv,setShowCvv]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=()=>{
    if(!form.name||!form.number)return;
    onSave({...card,...form,id:card?.id||"c"+Date.now()});
  };
  const formatNum=(v)=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp=(v)=>{
    const d=v.replace(/\D/g,"").slice(0,4);
    if(d.length>=2) return d.slice(0,2)+"/"+d.slice(2);
    return d;
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><span className="modal-title">{isEdit?"Edit Card":"Add Card"}</span><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
            <div className="field-group" style={{gridColumn:"1/-1"}}><label>Card Nickname</label><input className="field-input" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Chase Sapphire"/></div>
            <div className="field-group" style={{gridColumn:"1/-1"}}><label>Card Number</label><input className="field-input mono" value={formatNum(form.number)} onChange={e=>set("number",e.target.value.replace(/\s/g,""))} placeholder="1234 5678 9012 3456" maxLength={19}/></div>
            <div className="field-group" style={{gridColumn:"1/-1"}}><label>Cardholder Name</label><input className="field-input" value={form.holder} onChange={e=>set("holder",e.target.value)} placeholder="John Doe"/></div>
            <div className="field-group"><label>Expiry (MM/YY)</label><input className="field-input mono" value={form.expiry} onChange={e=>set("expiry",formatExp(e.target.value))} placeholder="09/27" maxLength={5}/></div>
            <div className="field-group">
              <label>CVV</label>
              <div className="pw-input-wrap">
                <input className="field-input mono" type={showCvv?"text":"password"} value={form.cvv} onChange={e=>set("cvv",e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="•••"/>
                <div className="actions"><button className="icon-btn" onClick={()=>setShowCvv(p=>!p)}>{showCvv?"◌":"◉"}</button></div>
              </div>
            </div>
            <div className="field-group" style={{gridColumn:"1/-1"}}><label>Bank / Issuer</label><input className="field-input" value={form.bank} onChange={e=>set("bank",e.target.value)} placeholder="Chase"/></div>
          </div>
        </div>
        <div className="modal-footer"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave}>{isEdit?"Save Card":"Add Card"}</button></div>
      </div>
    </div>
  );
}

function DetailPanel({entry,breachData,duplicates,requireAuth,onEdit,onDelete,onClose}) {
  const [showPw,setShowPw]=useState(false);
  const [toast,setToast]=useState(null);
  const copy=(val,label)=>{navigator.clipboard?.writeText(val).catch(()=>{});setToast(label+" copied!");setTimeout(()=>setToast(null),2200);};
  const safeCopy=(val,label,type)=>requireAuth(type,()=>copy(val,label));
  const safeReveal=()=>requireAuth("reveal",()=>setShowPw(p=>!p));
  const s=getStrength(entry.password);
  const age=daysSince(entry.updatedAt||entry.createdAt);
  const breach=breachData[entry.id];
  const isDupe=duplicates.has(entry.id);
  return (
    <div className="detail-panel">
      {toast&&<div className="copied-toast">✓ {toast}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"20px"}}>
        <button className="icon-btn" onClick={onClose} style={{fontSize:14}}>←</button>
        <div style={{display:"flex",gap:7}}>
          <button className="btn-ghost" onClick={onEdit} style={{fontSize:12,padding:"7px 13px"}}>Edit</button>
          <button className="btn-danger" onClick={onDelete} style={{fontSize:12,padding:"7px 13px"}}>Delete</button>
        </div>
      </div>
      <div className="detail-favicon"><FaviconImg url={entry.url} fallback="🔑" size={64}/></div>
      <div className="detail-name">{entry.name}</div>
      <div className="detail-url">{entry.url}</div>
      <div className="detail-alerts">
        {breach?.status==="checking"&&<div className="detail-alert" style={{background:"var(--surface2)",border:"1px solid var(--border)",color:"var(--text3)"}}>◌ Checking for breaches...</div>}
        {breach?.status==="breached"&&<div className="detail-alert breach">⚠ Found in {breach.count?.toLocaleString()} breach{breach.count>1?"es":""}. Change immediately.</div>}
        {breach?.status==="safe"&&<div className="detail-alert safe">✓ Not found in any known breaches.</div>}
        {isDupe&&<div className="detail-alert dupe">⚡ Password reused across multiple entries.</div>}
        {age>=AGE_WARN_DAYS&&<div className="detail-alert old">⏱ Password is {age} days old.</div>}
      </div>
      <div className="detail-section">
        <div className="detail-section-title">Credentials</div>
        <div className="detail-row">
          <div className="detail-row-label">Username</div>
          <div className="detail-row-val"><span style={{fontFamily:"JetBrains Mono",fontSize:12,maxWidth:170,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.username}</span><button className="icon-btn" onClick={()=>safeCopy(entry.username,"Username","copy_username")}>⎘</button></div>
        </div>
        <div className="detail-row">
          <div className="detail-row-label">Password</div>
          <div className="detail-row-val"><span style={{fontFamily:"JetBrains Mono",fontSize:12,letterSpacing:2}}>{showPw?entry.password:"•".repeat(Math.min(entry.password.length,16))}</span><button className="icon-btn" onClick={safeReveal}>{showPw?"◌":"◉"}</button><button className="icon-btn" onClick={()=>safeCopy(entry.password,"Password","copy_password")}>⎘</button></div>
        </div>
        <div style={{padding:"10px 0 4px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1}}>Strength</span><span style={{fontSize:11,fontFamily:"JetBrains Mono",color:s.color,textTransform:"uppercase",letterSpacing:1}}>{s.label}</span></div>
          <div className="strength-indicator">{[1,2,3,4].map(i=><div key={i} className="strength-seg" style={{background:i<=s.score?s.color:"var(--surface3)"}}/>)}</div>
        </div>
      </div>
      <div className="detail-section">
        <div className="detail-section-title">Info</div>
        <div className="detail-row"><div className="detail-row-label">Category</div><div className="detail-row-val" style={{fontFamily:"Outfit",fontSize:13}}>{CATEGORIES.find(c=>c.id===entry.category)?.label||"Other"}</div></div>
        <div className="detail-row"><div className="detail-row-label">Added</div><div className="detail-row-val" style={{fontFamily:"JetBrains Mono",fontSize:12}}>{entry.createdAt}</div></div>
        <div className="detail-row"><div className="detail-row-label">Age</div><div className="detail-row-val" style={{fontFamily:"JetBrains Mono",fontSize:12,color:age>=AGE_WARN_DAYS?"var(--orange)":"var(--text)"}}>{age}d</div></div>
      </div>
      {entry.notes&&<div className="detail-section"><div className="detail-section-title">Notes</div><p style={{fontSize:13,color:"var(--text2)",lineHeight:1.7}}>{entry.notes}</p></div>}
    </div>
  );
}

function CardDetailPanel({card,requireAuth,onEdit,onDelete,onClose}) {
  const [showCvv,setShowCvv]=useState(false);
  const [toast,setToast]=useState(null);
  const copy=(val,label)=>{navigator.clipboard?.writeText(val).catch(()=>{});setToast(label+" copied!");setTimeout(()=>setToast(null),2200);};
  const safeCopy=(val,label,type)=>requireAuth(type,()=>copy(val,label));
  const safeRevealCvv=()=>requireAuth("reveal",()=>setShowCvv(p=>!p));
  const exp=isExpired(card.expiry);
  return (
    <div className="detail-panel">
      {toast&&<div className="copied-toast">✓ {toast}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"20px"}}>
        <button className="icon-btn" onClick={onClose} style={{fontSize:14}}>←</button>
        <div style={{display:"flex",gap:7}}>
          <button className="btn-ghost" onClick={onEdit} style={{fontSize:12,padding:"7px 13px"}}>Edit</button>
          <button className="btn-danger" onClick={onDelete} style={{fontSize:12,padding:"7px 13px"}}>Delete</button>
        </div>
      </div>
      <div style={{fontSize:48,marginBottom:14}}>💳</div>
      <div className="detail-name">{card.name}</div>
      <div className="detail-url" style={{color:"var(--text2)"}}>{card.bank}</div>
      {exp&&<div style={{background:"color-mix(in srgb,var(--red) 10%,transparent)",border:"1px solid color-mix(in srgb,var(--red) 25%,transparent)",color:"var(--red)",padding:"9px 13px",borderRadius:8,fontSize:12,marginBottom:16}}>⚠ This card expired {card.expiry}. Update or remove it.</div>}
      <div className="detail-section">
        <div className="detail-section-title">Card Details</div>
        <div className="detail-row"><div className="detail-row-label">Number</div><div className="detail-row-val"><span style={{fontFamily:"JetBrains Mono",fontSize:12,letterSpacing:2}}>{maskCC(card.number)}</span><button className="icon-btn" onClick={()=>safeCopy(card.number,"Card number","copy_card")}>⎘</button></div></div>
        <div className="detail-row"><div className="detail-row-label">Holder</div><div className="detail-row-val" style={{fontFamily:"Outfit",fontSize:13}}>{card.holder}<button className="icon-btn" onClick={()=>safeCopy(card.holder,"Name","copy_username")}>⎘</button></div></div>
        <div className="detail-row"><div className="detail-row-label">Expiry</div><div className="detail-row-val" style={{color:exp?"var(--red)":"var(--text)"}}>{card.expiry}<button className="icon-btn" onClick={()=>safeCopy(card.expiry,"Expiry","copy_username")}>⎘</button></div></div>
        <div className="detail-row"><div className="detail-row-label">CVV</div><div className="detail-row-val"><span style={{fontFamily:"JetBrains Mono",fontSize:12,letterSpacing:2}}>{showCvv?card.cvv:"•".repeat(card.cvv?.length||3)}</span><button className="icon-btn" onClick={safeRevealCvv}>{showCvv?"◌":"◉"}</button><button className="icon-btn" onClick={()=>safeCopy(card.cvv,"CVV","copy_card")}>⎘</button></div></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────
const CAT_COLORS = ["var(--acc)","var(--green)","var(--blue)","var(--orange)","#9b6ee8","#e8507a","var(--text3)"];

function Dashboard({entries,breachData,duplicates}) {
  const total=entries.length||1;
  const strong=entries.filter(e=>getStrength(e.password).score===4).length;
  const good=entries.filter(e=>getStrength(e.password).score===3).length;
  const fair=entries.filter(e=>getStrength(e.password).score===2).length;
  const weak=entries.filter(e=>getStrength(e.password).score<=1).length;
  const breached=Object.values(breachData).filter(b=>b.status==="breached").length;
  const dupes=duplicates.size;
  const old=entries.filter(e=>daysSince(e.updatedAt||e.createdAt)>=AGE_WARN_DAYS).length;

  const score=Math.round(
    (strong/total)*40 +
    (1-breached/Math.max(total,1))*30 +
    (1-dupes/Math.max(total,1))*15 +
    (1-old/Math.max(total,1))*15
  );
  const scoreColor=score>=80?"var(--green)":score>=60?"var(--orange)":"var(--red)";
  const circumference=2*Math.PI*50;
  const dashOffset=circumference-(score/100)*circumference;

  const catCounts=CATEGORIES.filter(c=>c.id!=="all").map((c,i)=>({...c,count:entries.filter(e=>e.category===c.id).length,color:CAT_COLORS[i]})).filter(c=>c.count>0);

  const checks=[
    {label:"No breached passwords",sub:`${breached} of ${total} compromised`,done:breached===0,warn:breached>0},
    {label:"No reused passwords",sub:`${dupes} password${dupes!==1?"s":""} shared across entries`,done:dupes===0,warn:dupes>0},
    {label:"All passwords strong",sub:`${strong} of ${total} rated Strong`,done:strong===total,warn:weak>0},
    {label:"No aging passwords",sub:`${old} password${old!==1?"s":""} older than 90 days`,done:old===0,warn:old>0},
  ];

  return (
    <div>
      <div className="content-header">
        <div><div className="page-title">Security Dashboard</div><div className="page-sub">Vault health overview</div></div>
      </div>

      <div className="dash-grid">
        {/* Health score */}
        <div className="dash-card" style={{textAlign:"center"}}>
          <div className="dash-card-title">Vault Health</div>
          <div className="health-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface3)" strokeWidth="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease,stroke 0.3s"}}/>
            </svg>
            <div className="health-ring-text">
              <div style={{fontSize:28,fontFamily:"DM Serif Display,serif",color:scoreColor,fontWeight:"bold"}}>{score}</div>
              <div style={{fontSize:10,color:"var(--text3)",letterSpacing:1,textTransform:"uppercase"}}>/ 100</div>
            </div>
          </div>
          <div className="health-label" style={{color:scoreColor,fontWeight:600}}>{score>=80?"Excellent":score>=60?"Needs Work":"Critical"}</div>
        </div>

        {/* Strength breakdown */}
        <div className="dash-card">
          <div className="dash-card-title">Password Strength</div>
          {[["Strong",strong,"var(--green)"],["Good",good,"#c9c44c"],["Fair",fair,"var(--orange)"],["Weak",weak,"var(--red)"]].map(([l,c,col])=>(
            <div key={l} className="bar-row">
              <span className="bar-label">{l}</span>
              <div className="bar-track"><div className="bar-fill" style={{width:`${(c/Math.max(total,1))*100}%`,background:col}}/></div>
              <span className="bar-count">{c}</span>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="dash-card">
          <div className="dash-card-title">Threat Summary</div>
          {[
            {label:"Breached",val:breached,color:"var(--red)",icon:"⚠"},
            {label:"Reused",val:dupes,color:"var(--blue)",icon:"⚡"},
            {label:"Aging",val:old,color:"var(--orange)",icon:"⏱"},
            {label:"Total Entries",val:total,color:"var(--acc)",icon:"◉"},
          ].map(({label,val,color,icon})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:16}}>{icon}</span>
              <span style={{flex:1,fontSize:13,color:"var(--text2)"}}>{label}</span>
              <span style={{fontFamily:"JetBrains Mono",fontSize:15,fontWeight:700,color:val>0&&label!=="Total Entries"?color:"var(--text)"}}>{val}</span>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="dash-card">
          <div className="dash-card-title">By Category</div>
          <div className="cat-dots" style={{marginBottom:14}}>
            {catCounts.map(c=>(
              <div key={c.id} className="cat-dot-item">
                <div className="cat-dot" style={{background:c.color}}/>
                <span>{c.label} ({c.count})</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:3,height:12,borderRadius:6,overflow:"hidden"}}>
            {catCounts.map(c=>(
              <div key={c.id} style={{flex:c.count,background:c.color,transition:"flex 0.5s"}}/>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="dash-card span2">
          <div className="dash-card-title">Security Checklist</div>
          <div className="checklist">
            {checks.map(({label,sub,done,warn})=>(
              <div key={label} className={`check-item${done?" done":""}`}>
                <div className={`check-dot${done?" done":warn?" warn":""}`}>{done?"✓":warn?"!":""}</div>
                <div><div className="check-text">{label}</div><div className="check-sub">{sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS PANEL
// ─────────────────────────────────────────────
function SettingsPanel({accent,dark,onAccent,onToggleDark,onClose}) {
  const sessions = getSessionHistory();
  return (
    <div className="settings-panel">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <span style={{fontFamily:"DM Serif Display,serif",fontSize:22,color:"var(--text)"}}>Settings</span>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="settings-section">
        <div className="settings-title">Appearance</div>
        <div className="theme-row">
          <span style={{fontSize:13,color:"var(--text2)"}}>Dark Mode</span>
          <label className="toggle">
            <input type="checkbox" checked={dark} onChange={onToggleDark}/>
            <div className="toggle-track"/>
            <div className="toggle-thumb"/>
          </label>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-title">Accent Color</div>
        <div className="accent-swatches">
          {ACCENTS.map(a=>(
            <div key={a.id} className={`accent-swatch${accent===a.id?" active":""}`} onClick={()=>onAccent(a.id)}>
              <div className="accent-dot" style={{background:`linear-gradient(135deg,${a.a},${a.b})`}}/>
              <span className="accent-name">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-title">Preview</div>
        <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:10,padding:16,display:"flex",flexDirection:"column",gap:10}}>
          <button className="btn-primary" style={{fontSize:12,padding:"10px 16px"}}>Primary Button</button>
          <button className="btn-ghost" style={{fontSize:12,padding:"8px 14px"}}>Ghost Button</button>
          <div style={{height:4,borderRadius:2,background:`linear-gradient(90deg,var(--acc),var(--acc2))`}}/>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-title" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>Session History</span>
          <span style={{fontSize:10,color:"var(--text3)",fontFamily:"JetBrains Mono,monospace"}}>LAST {Math.min(sessions.length,20)}</span>
        </div>
        {sessions.length===0?(
          <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",padding:"20px 0"}}>No session history yet.</div>
        ):(
          <div className="session-list">
            {sessions.map((s,i)=>(
              <div key={i} className="session-item">
                <div className={`session-dot${s.type==="failed"?" failed":s.type==="locked"?" locked":""}`}/>
                <div>
                  <div className="session-time">{formatSessionTime(s.ts)}</div>
                  <div className="session-detail">{s.detail}</div>
                  <div style={{marginTop:5}}>
                    <span className={`session-badge ${s.type==="success"?"success":s.type==="locked"?"locked":"failed"}`}>
                      {s.type==="success"?"✓ Unlocked":s.type==="locked"?"🔒 Locked out":"✗ Failed attempt"}
                    </span>
                    <span style={{fontSize:10,color:"var(--text3)",marginLeft:6}}>{s.browser}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VAULT CONFIRM MODAL
// ─────────────────────────────────────────────
function VaultConfirm({ action, onConfirm, onCancel }) {
  const [pw, setPw] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const attempt = () => {
    const stored = localStorage.getItem("vaultmp");
    if (stored === btoa(pw)) {
      onConfirm();
    } else {
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const labels = {
    copy_password: "copy this password",
    copy_username: "copy this username",
    copy_card:     "copy this card detail",
    reveal:        "reveal this password",
    edit:          "edit this entry",
  };

  return (
    <div className="confirm-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-modal">
        <div className="confirm-icon">🔐</div>
        <div className="confirm-title">Confirm Identity</div>
        <div className="confirm-sub">Enter your vault password to {labels[action] || "continue"}.</div>
        <input
          ref={inputRef}
          className={`confirm-input${shake ? " shake" : ""}`}
          type="password"
          placeholder="Vault password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && attempt()}
        />
        <div className="confirm-actions">
          <button className="btn-ghost" style={{ flex: 1, padding: "10px" }} onClick={onCancel}>Cancel</button>
          <button className="btn-primary" style={{ flex: 2, padding: "10px" }} onClick={attempt}>Confirm →</button>
        </div>
        <div className="confirm-hint">This protects sensitive data from shoulder surfing.</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOCK SCREEN
// ─────────────────────────────────────────────
function LockScreen({onUnlock}) {
  const [mp,setMp]=useState("");
  const [confirm,setConfirm]=useState("");
  const [isNew,setIsNew]=useState(true);
  const [error,setError]=useState("");
  const [attempts,setAttempts]=useState(getFailedAttempts);
  const [lockout,setLockout2]=useState(getLockoutState);
  const [lockRemaining,setLockRemaining]=useState(0);

  useEffect(()=>{if(localStorage.getItem("vaultmp"))setIsNew(false);},[]);

  // Lockout countdown
  useEffect(()=>{
    if(!lockout)return;
    const tick=()=>{
      const secs=Math.max(0,Math.ceil((lockout.until-Date.now())/1000));
      setLockRemaining(secs);
      if(secs<=0){setLockout2(null);setAttempts(0);}
    };
    tick();
    const id=setInterval(tick,1000);
    return()=>clearInterval(id);
  },[lockout]);

  const handle=()=>{
    if(lockout)return;
    if(isNew){
      if(mp.length<6){setError("Master password must be at least 6 characters.");return;}
      if(mp!==confirm){setError("Passwords don't match.");return;}
      localStorage.setItem("vaultmp",btoa(mp));
      clearFailed();
      addSessionEvent("success","Vault created and unlocked");
      onUnlock();
    } else {
      if(localStorage.getItem("vaultmp")===btoa(mp)){
        clearFailed();
        addSessionEvent("success",`Unlocked via ${getBrowserInfo()}`);
        onUnlock();
      } else {
        const newCount=incrementFailed();
        setAttempts(newCount);
        addSessionEvent("failed",`Failed attempt ${newCount}/${MAX_ATTEMPTS}`);
        if(newCount>=MAX_ATTEMPTS){
          setLockoutState();
          setLockout2(getLockoutState());
          setError("");
        } else {
          setError(`Wrong password. ${MAX_ATTEMPTS-newCount} attempt${MAX_ATTEMPTS-newCount!==1?"s":""} remaining.`);
        }
        setMp("");
      }
    }
  };

  const lockoutPct=(lockRemaining/LOCKOUT_DURATION)*100;

  return (
    <div className="lock-screen">
      <div className="lock-icon">🔐</div>
      <div style={{textAlign:"center"}}>
        <div className="lock-title">Zentro</div>
        <div className="lock-sub">{isNew?"Create your Zentro":"Unlock your Zentro"}</div>
      </div>

      {lockout ? (
        <div className="lockout-box">
          <div className="lockout-icon">🚫</div>
          <div className="lockout-title">Vault Locked</div>
          <div className="lockout-sub">Too many failed attempts. Try again in:</div>
          <div className="lockout-timer">{String(Math.floor(lockRemaining/60)).padStart(2,"0")}:{String(lockRemaining%60).padStart(2,"0")}</div>
          <div className="lockout-progress-track"><div className="lockout-progress-fill" style={{width:`${lockoutPct}%`}}/></div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:10}}>This protects your vault from brute force attacks.</div>
        </div>
      ) : (
        <div className="lock-form">
          {error&&<div className="error-msg">{error}</div>}
          {!isNew&&attempts>0&&(
            <div className="attempts-row">
              {Array.from({length:MAX_ATTEMPTS}).map((_,i)=>(
                <div key={i} className="attempt-dot" style={{background:i<attempts?"var(--red)":"var(--surface3)",border:`1px solid ${i<attempts?"var(--red)":"var(--border2)"}`}}/>
              ))}
            </div>
          )}
          <input className="lock-input" type="password" placeholder={isNew?"Create master password":"Master password"} value={mp} onChange={e=>{setMp(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&(isNew?confirm&&handle():handle())} autoFocus/>
          {isNew&&<input className="lock-input" type="password" placeholder="Confirm master password" value={confirm} onChange={e=>{setConfirm(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handle()}/>}
          <button className="btn-primary" onClick={handle}>{isNew?"Create Vault →":"Unlock →"}</button>
          {!isNew&&<button className="btn-ghost" onClick={()=>{localStorage.clear();setIsNew(true);setMp("");setError("");setAttempts(0);}}>Reset vault</button>}
        </div>
      )}
    </div>
  );
}

function useAutoLock(onLock,enabled=true) {
  const [remaining,setRemaining]=useState(AUTO_LOCK_SECONDS);
  const timerRef=useRef(null);const countRef=useRef(null);
  const reset=useCallback(()=>{
    setRemaining(AUTO_LOCK_SECONDS);clearTimeout(timerRef.current);clearInterval(countRef.current);
    if(!enabled)return;
    timerRef.current=setTimeout(onLock,AUTO_LOCK_SECONDS*1000);
    countRef.current=setInterval(()=>setRemaining(r=>{if(r<=1){clearInterval(countRef.current);return 0;}return r-1;}),1000);
  },[onLock,enabled]);
  useEffect(()=>{
    if(!enabled)return;reset();
    const events=["mousemove","keydown","click","scroll","touchstart"];
    events.forEach(e=>window.addEventListener(e,reset,{passive:true}));
    return()=>{events.forEach(e=>window.removeEventListener(e,reset));clearTimeout(timerRef.current);clearInterval(countRef.current);};
  },[reset,enabled]);
  return remaining;
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function PasswordManager() {
  const [phase,setPhase]=useState("lock");
  const [page,setPage]=useState("vault"); // vault | cards | dashboard
  const [entries,setEntries]=useState([]);
  const [cards,setCards]=useState([]);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("all");
  const [selected,setSelected]=useState(null);
  const [selectedCard,setSelectedCard]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [showAddCard,setShowAddCard]=useState(false);
  const [editEntry,setEditEntry]=useState(null);
  const [editCard,setEditCard]=useState(null);
  const [toast,setToast]=useState(null);
  const [breachData,setBreachData]=useState({});
  const [showSettings,setShowSettings]=useState(false);
  const [pendingAction,setPendingAction]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  // Require vault password before sensitive action
  const requireAuth = useCallback((type, fn) => {
    setPendingAction({ type, fn });
  }, []);

  // Theme
  const [accent,setAccent]=useState(()=>localStorage.getItem("vault_accent")||"gold");
  const [dark,setDark]=useState(()=>localStorage.getItem("vault_dark")!=="false");

  const cssVars=buildCSSVars(accent,dark);

  useEffect(()=>{localStorage.setItem("vault_accent",accent);},[accent]);
  useEffect(()=>{localStorage.setItem("vault_dark",dark);},[dark]);

  // Load data
  useEffect(()=>{
    if(phase!=="app")return;
    const saved=localStorage.getItem("vault_entries");
    if(saved){try{setEntries(JSON.parse(saved));}catch{}}else setEntries(DEMO_ENTRIES);
    const savedCards=localStorage.getItem("vault_cards");
    if(savedCards){try{setCards(JSON.parse(savedCards));}catch{}}else setCards(DEMO_CARDS);
  },[phase]);

  // Breach checks
  useEffect(()=>{
    if(phase!=="app"||entries.length===0)return;
    entries.forEach(entry=>{
      if(breachData[entry.id])return;
      setBreachData(prev=>({...prev,[entry.id]:{status:"checking"}}));
      checkBreach(entry.password).then(result=>{setBreachData(prev=>({...prev,[entry.id]:result}));});
    });
  },[entries,phase]);

  const handleLock=useCallback(()=>{addSessionEvent("locked","Vault auto-locked due to inactivity");setPhase("lock");setSelected(null);setSelectedCard(null);setBreachData({});},[]);
  const remaining=useAutoLock(handleLock,phase==="app");
  const showWarning=remaining<=60&&phase==="app";

  const saveEntries=(e)=>{setEntries(e);localStorage.setItem("vault_entries",JSON.stringify(e));};
  const saveCards=(c)=>{setCards(c);localStorage.setItem("vault_cards",JSON.stringify(c));};
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2200);};

  const duplicates=(() => {
    const seen={};entries.forEach(e=>{if(!seen[e.password])seen[e.password]=[];seen[e.password].push(e.id);});
    const s=new Set();Object.values(seen).forEach(ids=>{if(ids.length>1)ids.forEach(id=>s.add(id));});return s;
  })();

  const filtered=entries.filter(e=>{
    const mc=category==="all"||e.category===category;
    const q=search.toLowerCase();
    const mq=!q||e.name.toLowerCase().includes(q)||e.url.toLowerCase().includes(q)||e.username.toLowerCase().includes(q);
    return mc&&mq;
  });
  const counts=CATEGORIES.reduce((acc,c)=>{acc[c.id]=c.id==="all"?entries.length:entries.filter(e=>e.category===c.id).length;return acc;},{});
  const breachCount=Object.values(breachData).filter(b=>b.status==="breached").length;
  const dupeCount=duplicates.size;
  const oldCount=entries.filter(e=>daysSince(e.updatedAt||e.createdAt)>=AGE_WARN_DAYS).length;
  const strongCount=entries.filter(e=>getStrength(e.password).score===4).length;
  const weakCount=entries.filter(e=>getStrength(e.password).score<=1).length;
  const expiredCards=cards.filter(c=>isExpired(c.expiry)).length;

  const handleSave=(entry)=>{
    const isEdit=entries.find(e=>e.id===entry.id);
    const updated=isEdit?entries.map(e=>e.id===entry.id?entry:e):[...entries,entry];
    saveEntries(updated);
    setBreachData(prev=>({...prev,[entry.id]:{status:"checking"}}));
    checkBreach(entry.password).then(r=>setBreachData(prev=>({...prev,[entry.id]:r})));
    setShowAdd(false);setEditEntry(null);setSelected(entry);
    showToast(isEdit?"Entry updated":"Entry added");
  };
  const handleDelete=(id)=>{saveEntries(entries.filter(e=>e.id!==id));setSelected(null);showToast("Entry deleted");};
  const handleSaveCard=(card)=>{
    const isEdit=cards.find(c=>c.id===card.id);
    const updated=isEdit?cards.map(c=>c.id===card.id?card:c):[...cards,card];
    saveCards(updated);setShowAddCard(false);setEditCard(null);setSelectedCard(card);
    showToast(isEdit?"Card updated":"Card added");
  };
  const handleDeleteCard=(id)=>{saveCards(cards.filter(c=>c.id!==id));setSelectedCard(null);showToast("Card deleted");};
  const handleCopy=(ev,val,label)=>{
    ev.stopPropagation();
    const isPassword = label.toLowerCase().includes("password") || label.toLowerCase().includes("cvv");
    const type = isPassword ? "copy_password" : "copy_username";
    requireAuth(type, ()=>{ navigator.clipboard?.writeText(val).catch(()=>{}); showToast(label+" copied!"); });
  };

  const hasPanel=selected||selectedCard||showSettings;

  // ── RENDER ──
  if(phase==="lock") return <div className="app dark" style={{["--acc"]:"#c9a84c",["--acc2"]:"#e8c96d",["--acc-dim"]:"rgba(201,168,76,0.15)",["--acc-glow"]:"rgba(201,168,76,0.08)",["--surface"]:"#111114",["--surface2"]:"#18181d",["--surface3"]:"#1f1f26",["--border"]:"#2a2a35",["--border2"]:"#363645",["--text"]:"#f0ede6",["--text2"]:"#9b9790",["--text3"]:"#5a5856",["--black"]:"#0a0a0b",["--red"]:"#e05555",["--green"]:"#4caf82",["--orange"]:"#d4874a",["--blue"]:"#5b8fe8",["--radius"]:"10px",["--radius2"]:"14px",["--page-bg"]:"#0a0a0b",["--card-bg"]:"#111114"}}><style>{BASE_STYLES}</style><LockScreen onUnlock={()=>setPhase("vault-door")}/></div>;
  if(phase==="vault-door") return <div className="app dark" style={{["--acc"]:"#c9a84c",["--acc2"]:"#e8c96d",["--acc-dim"]:"rgba(201,168,76,0.15)",["--acc-glow"]:"rgba(201,168,76,0.08)",["--surface"]:"#111114",["--surface2"]:"#18181d",["--surface3"]:"#1f1f26",["--border"]:"#2a2a35",["--text"]:"#f0ede6",["--text2"]:"#9b9790",["--text3"]:"#5a5856",["--black"]:"#0a0a0b",["--page-bg"]:"#0a0a0b",["--card-bg"]:"#111114"}}><style>{BASE_STYLES}</style><VaultDoor onDone={()=>setPhase("app")}/></div>;

  const dynamicStyle={};
  cssVars.split(";").forEach(v=>{const [k,val]=v.split(":");if(k&&val)dynamicStyle[k.trim()]=val.trim();});

  return (
    <div className={`app ${dark?"dark":"light"}`} style={dynamicStyle}>
      <style>{BASE_STYLES}</style>
      {toast&&<div className="copied-toast">✓ {toast}</div>}
      {showWarning&&(
        <div className="autolock-banner">
          <span>⏱</span><span>Auto-locking in {remaining}s</span>
          <div className="autolock-progress"><div className="autolock-fill" style={{width:`${(remaining/60)*100}%`}}/></div>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={()=>setSidebarOpen(p=>!p)}>☰</button>
        <div className="mobile-topbar-logo">
          <div className="logo-mark" style={{width:28,height:28,fontSize:14}}>🔐</div>
          <span className="mobile-topbar-title">Zentro</span>
        </div>
        <button className="mobile-add-btn" onClick={()=>page==="cards"?setShowAddCard(true):setShowAdd(true)}>+</button>
      </div>

      {/* SIDEBAR BACKDROP */}
      <div className={`sidebar-backdrop${sidebarOpen?" open":""}`} onClick={()=>setSidebarOpen(false)}/>

      <div className="main" style={{paddingTop:showWarning?41:0}}>
        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen?" open":""}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">🔐</div>
            <div><div className="logo-text">Zentro</div><div className="logo-ver">v4.0 · ENCRYPTED</div></div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search vault..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>

          <div className="nav-section">
            <div className="nav-label">Pages</div>
            <div className={`nav-item${page==="vault"?" active":""}`} onClick={()=>{setPage("vault");setSelected(null);setSelectedCard(null);setSidebarOpen(false);}}>
              <span className="nav-icon">◉</span><span>Passwords</span><span className="nav-count">{entries.length}</span>
            </div>
            <div className={`nav-item${page==="cards"?" active":""}`} onClick={()=>{setPage("cards");setSelected(null);setSidebarOpen(false);}}>
              <span className="nav-icon">◈</span><span>Cards</span>
              {expiredCards>0&&<span className="nav-count" style={{color:"var(--red)",background:"color-mix(in srgb,var(--red) 15%,transparent)"}}>{expiredCards} exp</span>}
              {expiredCards===0&&<span className="nav-count">{cards.length}</span>}
            </div>
            <div className={`nav-item${page==="dashboard"?" active":""}`} onClick={()=>{setPage("dashboard");setSelected(null);setSelectedCard(null);setSidebarOpen(false);}}>
              <span className="nav-icon">◆</span><span>Dashboard</span>
              {(breachCount+weakCount)>0&&<span className="nav-count" style={{color:"var(--red)",background:"color-mix(in srgb,var(--red) 15%,transparent)"}}>{breachCount+weakCount}</span>}
            </div>
          </div>

          {page==="vault"&&(
            <div className="nav-section">
              <div className="nav-label">Categories</div>
              {CATEGORIES.map(c=>(
                <div key={c.id} className={`nav-item${category===c.id?" active":""}`} onClick={()=>{setCategory(c.id);setSidebarOpen(false);}}>
                  <span className="nav-icon">{c.icon}</span><span>{c.label}</span>
                  {counts[c.id]>0&&<span className="nav-count">{counts[c.id]}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="sidebar-footer">
            <div className="vault-stats">
              <div className="stat-card"><div className="stat-num">{entries.length}</div><div className="stat-label">Entries</div></div>
              <div className="stat-card"><div className="stat-num" style={{color:"var(--green)"}}>{strongCount}</div><div className="stat-label">Strong</div></div>
              <div className="stat-card"><div className="stat-num" style={{color:breachCount>0?"var(--red)":"var(--text3)"}}>{breachCount}</div><div className="stat-label">Breached</div></div>
              <div className="stat-card"><div className="stat-num">{cards.length}</div><div className="stat-label">Cards</div></div>
            </div>
            <div className="sidebar-actions">
              <button className="btn-ghost" style={{fontSize:12,padding:"7px 10px",flex:1}} onClick={()=>{setShowSettings(p=>!p);setSelected(null);setSelectedCard(null);setSidebarOpen(false);}}>⚙ Settings</button>
              <button className="btn-ghost" style={{fontSize:12,padding:"7px 10px",flex:1}} onClick={()=>{addSessionEvent("locked","Vault manually locked");handleLock();}}>🔒 Lock</button>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="content" style={{marginRight:hasPanel?360:0,transition:"margin 0.25s"}}>

          {/* ── VAULT PAGE ── */}
          {page==="vault"&&(
            <>
              <div className="content-header">
                <div><div className="page-title">{CATEGORIES.find(c=>c.id===category)?.label}</div><div className="page-sub">{filtered.length} entr{filtered.length===1?"y":"ies"}{search?` matching "${search}"`:""}  </div></div>
                <div className="header-actions"><button className="btn-primary" onClick={()=>setShowAdd(true)}>+ New Entry</button></div>
              </div>
              {(breachCount>0||dupeCount>0||oldCount>0)&&(
                <div className="alert-row">
                  {breachCount>0&&<div className="alert-chip breach">⚠ {breachCount} breached</div>}
                  {dupeCount>0&&<div className="alert-chip dupe">⚡ {dupeCount} reused</div>}
                  {oldCount>0&&<div className="alert-chip old">⏱ {oldCount} aging</div>}
                </div>
              )}
              {filtered.length===0?(
                <div className="empty-state"><div className="empty-icon">◎</div><div className="empty-title">{search?"No results":"Vault is empty"}</div><div className="empty-sub">{search?"Try a different term.":"Add your first entry."}</div>{!search&&<button className="btn-primary" onClick={()=>setShowAdd(true)}>+ Add Entry</button>}</div>
              ):(
                <div className="pw-grid">
                  {filtered.map(e=>{
                    const s=getStrength(e.password);const breach=breachData[e.id];const isDupe=duplicates.has(e.id);
                    const age=daysSince(e.updatedAt||e.createdAt);const isOld=age>=AGE_WARN_DAYS;const isBreached=breach?.status==="breached";
                    return (
                      <div key={e.id} className={`pw-card${selected?.id===e.id?" selected":""}${isBreached?" has-breach":""}${isDupe?" has-dupe":""}${isOld&&!isBreached?" is-old":""}`} onClick={()=>{setSelected(selected?.id===e.id?null:e);setSelectedCard(null);setShowSettings(false);}}>
                        <div className="card-header">
                          <div className="card-favicon"><FaviconImg url={e.url} fallback="🔑" size={40}/></div>
                          <div className="card-meta"><div className="card-name">{e.name}</div><div className="card-url">{e.url}</div></div>
                          <div className="card-badge">{CATEGORIES.find(c=>c.id===e.category)?.label}</div>
                        </div>
                        <div className="card-field"><span className="field-label">User</span><span className="field-val">{e.username}</span><div className="field-actions"><button className="icon-btn" onClick={ev=>handleCopy(ev,e.username,"Username")}>⎘</button></div></div>
                        <div className="card-field"><span className="field-label">Pass</span><span className="field-val">{"•".repeat(Math.min(e.password.length,18))}</span><div className="field-actions"><button className="icon-btn" onClick={ev=>handleCopy(ev,e.password,"Password")}>⎘</button></div></div>
                        <div className="strength-bar"><div className="strength-fill" style={{width:`${s.score*25}%`,background:s.color}}/></div>
                        {(isBreached||isDupe||isOld||breach?.status==="checking")&&(
                          <div className="card-warnings">
                            {breach?.status==="checking"&&<span className="warn-badge checking">◌ checking</span>}
                            {isBreached&&<span className="warn-badge breach">⚠ breached</span>}
                            {isDupe&&<span className="warn-badge dupe">⚡ reused</span>}
                            {isOld&&<span className="warn-badge old">⏱ {age}d</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── CARDS PAGE ── */}
          {page==="cards"&&(
            <>
              <div className="content-header">
                <div><div className="page-title">Credit Cards</div><div className="page-sub">{cards.length} card{cards.length!==1?"s":""} stored{expiredCards>0?` · ${expiredCards} expired`:""}</div></div>
                <div className="header-actions"><button className="btn-primary" onClick={()=>setShowAddCard(true)}>+ Add Card</button></div>
              </div>
              {cards.length===0?(
                <div className="empty-state"><div className="empty-icon">💳</div><div className="empty-title">No cards yet</div><div className="empty-sub">Store your payment cards securely.</div><button className="btn-primary" onClick={()=>setShowAddCard(true)}>+ Add Card</button></div>
              ):(
                <div className="cc-grid">
                  {cards.map(card=>{
                    const exp=isExpired(card.expiry);
                    return (
                      <div key={card.id}>
                        <div className={`cc-card${selectedCard?.id===card.id?" selected":""}`} onClick={()=>{setSelectedCard(selectedCard?.id===card.id?null:card);setSelected(null);setShowSettings(false);}}>
                          <div className="cc-card-shine"/>
                          {exp&&<div className="cc-expired">EXPIRED</div>}
                          <div className="cc-network">{ccNetwork(card.number)}</div>
                          <div>
                            <div className="cc-chip"><div className="cc-chip-lines">{[0,1,2].map(i=><div key={i} className="cc-chip-line"/>)}</div></div>
                            <div className="cc-number">{maskCC(card.number)}</div>
                          </div>
                          <div className="cc-bottom">
                            <div><div className="cc-holder">Cardholder</div><div className="cc-holder-name">{card.holder}</div></div>
                            <div><div className="cc-expiry-label">EXPIRES</div><div className="cc-expiry" style={{color:exp?"#ffaaaa":"white"}}>{card.expiry}</div></div>
                          </div>
                        </div>
                        <div className="cc-actions">
                          <button className="cc-action-btn" style={{background:"var(--surface2)",borderColor:"var(--border)",color:"var(--text2)"}} onClick={ev=>handleCopy(ev,card.number,"Card number")}>⎘ Number</button>
                          <button className="cc-action-btn" style={{background:"var(--surface2)",borderColor:"var(--border)",color:"var(--text2)"}} onClick={ev=>handleCopy(ev,card.cvv,"CVV")}>⎘ CVV</button>
                          <button className="cc-action-btn" style={{background:"var(--surface2)",borderColor:"var(--border)",color:"var(--text2)"}} onClick={ev=>handleCopy(ev,card.expiry,"Expiry")}>⎘ Expiry</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── DASHBOARD PAGE ── */}
          {page==="dashboard"&&<Dashboard entries={entries} breachData={breachData} duplicates={duplicates}/>}
        </main>

        {/* PANELS */}
        {selected&&!showSettings&&<DetailPanel entry={selected} breachData={breachData} duplicates={duplicates} requireAuth={requireAuth} onClose={()=>setSelected(null)} onEdit={()=>{requireAuth("edit",()=>{setEditEntry(selected);setSelected(null);});}} onDelete={()=>handleDelete(selected.id)}/>}
        {selectedCard&&!showSettings&&<CardDetailPanel card={selectedCard} requireAuth={requireAuth} onClose={()=>setSelectedCard(null)} onEdit={()=>{requireAuth("edit",()=>{setEditCard(selectedCard);setSelectedCard(null);});}} onDelete={()=>handleDeleteCard(selectedCard.id)}/>}
        {showSettings&&<SettingsPanel accent={accent} dark={dark} onAccent={a=>{setAccent(a);}} onToggleDark={()=>setDark(p=>!p)} onClose={()=>setShowSettings(false)}/>}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottomnav">
        <button className={`mobile-tab${page==="vault"?" active":""}`} onClick={()=>{setPage("vault");setSelected(null);setSelectedCard(null);setShowSettings(false);}}>
          <span className="mobile-tab-icon">◉</span>
          <span className="mobile-tab-label">Passwords</span>
        </button>
        <button className={`mobile-tab${page==="cards"?" active":""}`} onClick={()=>{setPage("cards");setSelected(null);setShowSettings(false);}}>
          <span className="mobile-tab-icon">💳</span>
          <span className="mobile-tab-label">Cards</span>
        </button>
        <button className={`mobile-tab${page==="dashboard"?" active":""}`} onClick={()=>{setPage("dashboard");setSelected(null);setSelectedCard(null);setShowSettings(false);}}>
          <span className="mobile-tab-icon">◆</span>
          <span className="mobile-tab-label">Dashboard</span>
        </button>
        <button className={`mobile-tab${showSettings?" active":""}`} onClick={()=>{setShowSettings(p=>!p);setSelected(null);setSelectedCard(null);}}>
          <span className="mobile-tab-icon">⚙</span>
          <span className="mobile-tab-label">Settings</span>
        </button>
      </nav>

      {/* MODALS */}
      {(showAdd||editEntry)&&<AddEditModal entry={editEntry} onSave={handleSave} onClose={()=>{setShowAdd(false);setEditEntry(null);}}/>}
      {(showAddCard||editCard)&&<AddEditCardModal card={editCard} onSave={handleSaveCard} onClose={()=>{setShowAddCard(false);setEditCard(null);}}/>}
      {pendingAction&&<VaultConfirm action={pendingAction.type} onConfirm={()=>{pendingAction.fn();setPendingAction(null);}} onCancel={()=>setPendingAction(null)}/>}
    </div>
  );
}
