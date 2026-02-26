import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;500;700&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black: #0a0a0b; --surface: #111114; --surface2: #18181d; --surface3: #1f1f26;
    --border: #2a2a35; --border2: #363645;
    --gold: #c9a84c; --gold2: #e8c96d; --gold-dim: rgba(201,168,76,0.15); --gold-glow: rgba(201,168,76,0.08);
    --text: #f0ede6; --text2: #9b9790; --text3: #5a5856;
    --red: #e05555; --green: #4caf82; --blue: #5b8fe8; --orange: #d4874a;
    --radius: 10px; --radius2: 14px;
  }
  body { background: var(--black); color: var(--text); font-family: 'Outfit', sans-serif; }
  .app {
    min-height: 100vh; background: var(--black);
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.04) 0%, transparent 70%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.015) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.015) 40px);
  }

  /* ── VAULT DOOR ANIMATION ── */
  .vault-door-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: #05050a;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .vault-door-overlay.opening { animation: vaultFadeOut 0.6s 2.8s forwards; }
  @keyframes vaultFadeOut { to { opacity: 0; pointer-events: none; } }

  .vault-bg-lines {
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(201,168,76,0.04) 60px),
      repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(201,168,76,0.04) 60px);
  }
  .vault-scene { position: relative; width: 300px; height: 300px; }

  /* Outer ring */
  .vault-ring {
    position: absolute; border-radius: 50%; border: 3px solid var(--gold);
    display: flex; align-items: center; justify-content: center;
  }
  .vault-ring-1 { inset: 0; box-shadow: 0 0 60px rgba(201,168,76,0.3), inset 0 0 40px rgba(201,168,76,0.05); animation: ringPulse 1.5s ease-in-out infinite; }
  .vault-ring-2 { inset: 20px; border-color: rgba(201,168,76,0.4); animation: ringRotate 4s linear infinite; }
  .vault-ring-3 { inset: 40px; border-color: rgba(201,168,76,0.2); animation: ringRotate 3s linear infinite reverse; }
  @keyframes ringPulse { 0%,100%{box-shadow:0 0 60px rgba(201,168,76,0.3),inset 0 0 40px rgba(201,168,76,0.05);} 50%{box-shadow:0 0 100px rgba(201,168,76,0.5),inset 0 0 60px rgba(201,168,76,0.1);} }
  @keyframes ringRotate { to { transform: rotate(360deg); } }

  /* Notches on ring-2 */
  .vault-ring-2::before, .vault-ring-2::after {
    content: ''; position: absolute; width: 8px; height: 8px;
    background: var(--gold); border-radius: 50%;
  }
  .vault-ring-2::before { top: -4px; left: 50%; transform: translateX(-50%); }
  .vault-ring-2::after  { bottom: -4px; left: 50%; transform: translateX(-50%); }

  .vault-center {
    position: absolute; inset: 60px; border-radius: 50%;
    background: radial-gradient(circle, #1a1600 0%, #0a0a0b 100%);
    border: 2px solid rgba(201,168,76,0.5);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 6px;
  }
  .vault-lock-icon { font-size: 44px; animation: lockBounce 0.5s 2s forwards; }
  @keyframes lockBounce { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
  .vault-status-text {
    font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--gold); opacity: 0;
    animation: fadeInText 0.4s 0.5s forwards;
  }
  @keyframes fadeInText { to { opacity: 1; } }

  /* Spokes */
  .vault-spokes { position: absolute; inset: 40px; border-radius: 50%; animation: ringRotate 8s linear infinite; }
  .vault-spoke {
    position: absolute; width: 2px; background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.4), transparent);
    left: 50%; transform-origin: bottom center;
    height: 50%; bottom: 50%;
  }

  /* unlock flash */
  .vault-flash {
    position: absolute; inset: 0; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.6) 0%, transparent 70%);
    opacity: 0; animation: unlockFlash 0.4s 2.1s forwards;
  }
  @keyframes unlockFlash { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }

  .vault-door-text {
    position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
    font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--gold);
    letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    opacity: 0; animation: fadeInText 0.6s 0.3s forwards;
  }
  .vault-door-subtext {
    position: absolute; bottom: 58px; left: 50%; transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text3);
    letter-spacing: 3px; text-transform: uppercase; white-space: nowrap;
    opacity: 0; animation: fadeInText 0.6s 0.6s forwards;
  }

  /* Progress bar */
  .vault-progress-wrap {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    width: 200px;
  }
  .vault-progress-track { height: 2px; background: rgba(201,168,76,0.15); border-radius: 1px; overflow: hidden; }
  .vault-progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold2)); border-radius: 1px; animation: progressFill 2s ease-out forwards; }
  @keyframes progressFill { from{width:0} to{width:100%} }
  .vault-progress-label { font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--text3); letter-spacing:2px; text-align:center; margin-top:6px; animation: progressLabel 2s steps(1) forwards; }

  /* ── LOCK SCREEN ── */
  .lock-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:32px; padding:24px; }
  .lock-icon { width:80px; height:80px; border:2px solid var(--gold); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow:0 0 40px rgba(201,168,76,0.2),inset 0 0 20px rgba(201,168,76,0.05); animation:pulse 3s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{box-shadow:0 0 40px rgba(201,168,76,0.2),inset 0 0 20px rgba(201,168,76,0.05)} 50%{box-shadow:0 0 60px rgba(201,168,76,0.35),inset 0 0 30px rgba(201,168,76,0.1)} }
  .lock-title { font-family:'DM Serif Display',serif; font-size:42px; color:var(--text); letter-spacing:-0.5px; text-align:center; }
  .lock-sub { color:var(--text2); font-size:14px; letter-spacing:2px; text-transform:uppercase; }
  .lock-form { display:flex; flex-direction:column; gap:16px; width:100%; max-width:360px; }
  .lock-input { background:var(--surface2); border:1px solid var(--border2); border-radius:var(--radius); padding:14px 18px; color:var(--text); font-family:'JetBrains Mono',monospace; font-size:15px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; letter-spacing:2px; }
  .lock-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }

  /* ── BUTTONS ── */
  .btn-primary { background:linear-gradient(135deg,var(--gold) 0%,var(--gold2) 100%); color:#1a1500; border:none; border-radius:var(--radius); padding:14px 24px; font-family:'Outfit',sans-serif; font-weight:600; font-size:14px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:opacity 0.2s,transform 0.1s; }
  .btn-primary:hover { opacity:0.9; transform:translateY(-1px); }
  .btn-primary:active { transform:translateY(0); }
  .btn-ghost { background:transparent; border:1px solid var(--border2); color:var(--text2); border-radius:var(--radius); padding:10px 16px; font-family:'Outfit',sans-serif; font-size:13px; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
  .btn-ghost:hover { border-color:var(--gold); color:var(--gold); }
  .btn-danger { background:rgba(224,85,85,0.15); border:1px solid rgba(224,85,85,0.3); color:var(--red); border-radius:var(--radius); padding:10px 16px; font-family:'Outfit',sans-serif; font-size:13px; cursor:pointer; transition:all 0.15s; }
  .btn-danger:hover { background:rgba(224,85,85,0.25); }
  .error-msg { color:var(--red); font-size:13px; text-align:center; padding:10px; background:rgba(224,85,85,0.1); border-radius:8px; border:1px solid rgba(224,85,85,0.2); }

  /* ── LAYOUT ── */
  .main { display:flex; min-height:100vh; }
  .sidebar { width:280px; min-height:100vh; padding:28px 20px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; gap:24px; flex-shrink:0; }
  .sidebar-logo { display:flex; align-items:center; gap:12px; padding:0 4px; }
  .logo-mark { width:36px; height:36px; background:linear-gradient(135deg,var(--gold),var(--gold2)); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; }
  .logo-text { font-family:'DM Serif Display',serif; font-size:20px; color:var(--text); }
  .logo-ver { font-size:10px; color:var(--text3); font-family:'JetBrains Mono',monospace; letter-spacing:1px; }
  .search-wrap { position:relative; }
  .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text3); font-size:14px; }
  .search-input { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:10px 12px 10px 36px; color:var(--text); font-family:'Outfit',sans-serif; font-size:13px; outline:none; transition:border-color 0.2s; }
  .search-input::placeholder { color:var(--text3); }
  .search-input:focus { border-color:var(--gold); }
  .nav-section { display:flex; flex-direction:column; gap:4px; }
  .nav-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--text3); padding:0 8px 8px; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; cursor:pointer; font-size:13px; color:var(--text2); transition:all 0.15s; border:1px solid transparent; }
  .nav-item:hover { background:var(--surface3); color:var(--text); }
  .nav-item.active { background:var(--gold-dim); color:var(--gold); border-color:rgba(201,168,76,0.2); }
  .nav-item .nav-icon { width:18px; text-align:center; }
  .nav-count { margin-left:auto; background:var(--surface3); color:var(--text3); font-size:11px; padding:1px 7px; border-radius:20px; font-family:'JetBrains Mono',monospace; }
  .nav-item.active .nav-count { background:rgba(201,168,76,0.2); color:var(--gold); }
  .sidebar-footer { margin-top:auto; padding-top:20px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:8px; }
  .vault-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .stat-card { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:10px 12px; }
  .stat-num { font-family:'JetBrains Mono',monospace; font-size:18px; color:var(--gold); font-weight:700; }
  .stat-label { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }

  /* ── AUTO-LOCK BANNER ── */
  .autolock-banner {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    background: linear-gradient(90deg, rgba(201,168,76,0.15), rgba(201,168,76,0.08));
    border-bottom: 1px solid rgba(201,168,76,0.25);
    padding: 10px 20px; display: flex; align-items: center; gap: 12px;
    font-size: 13px; color: var(--gold);
    font-family: 'JetBrains Mono', monospace; letter-spacing: 1px;
    animation: slideDown 0.3s ease;
  }
  @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }
  .autolock-progress { flex:1; height:3px; background:rgba(201,168,76,0.15); border-radius:2px; overflow:hidden; }
  .autolock-fill { height:100%; background:var(--gold); border-radius:2px; transition:width 1s linear; }

  /* ── CONTENT ── */
  .content { flex:1; padding:32px; overflow-y:auto; }
  .content-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
  .page-title { font-family:'DM Serif Display',serif; font-size:30px; color:var(--text); }
  .page-sub { font-size:13px; color:var(--text3); margin-top:2px; }
  .header-actions { display:flex; gap:10px; }

  /* ── ALERT BANNERS ── */
  .alert-row { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
  .alert-chip {
    display: flex; align-items: center; gap: 8px; padding: 8px 14px;
    border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; border: 1px solid transparent;
  }
  .alert-chip.breach { background:rgba(224,85,85,0.1); border-color:rgba(224,85,85,0.25); color:var(--red); }
  .alert-chip.breach:hover { background:rgba(224,85,85,0.18); }
  .alert-chip.dupe { background:rgba(91,143,232,0.1); border-color:rgba(91,143,232,0.25); color:var(--blue); }
  .alert-chip.dupe:hover { background:rgba(91,143,232,0.18); }
  .alert-chip.old { background:rgba(212,135,74,0.1); border-color:rgba(212,135,74,0.25); color:var(--orange); }
  .alert-chip.old:hover { background:rgba(212,135,74,0.18); }

  /* ── PASSWORD CARDS ── */
  .pw-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
  .pw-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius2); padding:20px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
  .pw-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--gold),var(--gold2)); transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .pw-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.4); }
  .pw-card:hover::before { transform:scaleX(1); }
  .pw-card.selected { border-color:var(--gold); background:var(--surface2); }
  .pw-card.selected::before { transform:scaleX(1); }
  .pw-card.has-breach { border-color:rgba(224,85,85,0.4); }
  .pw-card.has-breach::before { background:var(--red); transform:scaleX(1); }
  .pw-card.has-dupe { border-color:rgba(91,143,232,0.35); }
  .pw-card.is-old { border-color:rgba(212,135,74,0.35); }

  .card-header { display:flex; align-items:flex-start; gap:14px; margin-bottom:16px; }
  .card-favicon { width:42px; height:42px; border-radius:10px; background:var(--surface3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; overflow:hidden; }
  .card-favicon img { width:100%; height:100%; object-fit:contain; border-radius:8px; }
  .card-meta { flex:1; min-width:0; }
  .card-name { font-size:15px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .card-url { font-size:12px; color:var(--text3); font-family:'JetBrains Mono',monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
  .card-badge { background:var(--surface3); border:1px solid var(--border); border-radius:20px; padding:2px 8px; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; flex-shrink:0; }

  .card-field { display:flex; align-items:center; gap:10px; padding:8px 0; border-top:1px solid var(--border); }
  .field-label { font-size:11px; color:var(--text3); width:60px; flex-shrink:0; text-transform:uppercase; letter-spacing:0.5px; }
  .field-val { font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--text2); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .field-actions { display:flex; gap:4px; opacity:0; transition:opacity 0.15s; }
  .pw-card:hover .field-actions, .pw-card.selected .field-actions { opacity:1; }
  .icon-btn { background:var(--surface3); border:none; color:var(--text2); width:26px; height:26px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; transition:all 0.15s; }
  .icon-btn:hover { background:var(--gold-dim); color:var(--gold); }
  .strength-bar { height:3px; border-radius:2px; background:var(--surface3); margin-top:12px; overflow:hidden; }
  .strength-fill { height:100%; border-radius:2px; transition:width 0.4s,background 0.4s; }

  /* Warning badges on cards */
  .card-warnings { display:flex; gap:5px; margin-top:8px; flex-wrap:wrap; }
  .warn-badge { font-size:10px; padding:2px 7px; border-radius:12px; font-family:'JetBrains Mono',monospace; letter-spacing:0.5px; display:flex; align-items:center; gap:4px; }
  .warn-badge.breach { background:rgba(224,85,85,0.15); color:var(--red); border:1px solid rgba(224,85,85,0.25); }
  .warn-badge.dupe { background:rgba(91,143,232,0.15); color:var(--blue); border:1px solid rgba(91,143,232,0.25); }
  .warn-badge.old { background:rgba(212,135,74,0.15); color:var(--orange); border:1px solid rgba(212,135,74,0.25); }
  .warn-badge.checking { background:var(--surface3); color:var(--text3); border:1px solid var(--border); }

  /* ── MODALS ── */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn 0.15s; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius2); width:100%; max-width:500px; max-height:90vh; overflow-y:auto; animation:slideUp 0.2s; box-shadow:0 24px 80px rgba(0,0,0,0.6); }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-header { padding:24px 24px 0; display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .modal-title { font-family:'DM Serif Display',serif; font-size:24px; color:var(--text); }
  .modal-close { background:var(--surface3); border:none; color:var(--text2); width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .modal-close:hover { background:rgba(224,85,85,0.15); color:var(--red); }
  .modal-body { padding:0 24px 24px; display:flex; flex-direction:column; gap:18px; }
  .modal-footer { padding:16px 24px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; }

  .field-group { display:flex; flex-direction:column; gap:6px; }
  .field-group label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); }
  .field-input { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:11px 14px; color:var(--text); font-family:'Outfit',sans-serif; font-size:14px; outline:none; transition:all 0.2s; }
  .field-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
  .field-input.mono { font-family:'JetBrains Mono',monospace; font-size:13px; letter-spacing:1px; }
  .pw-input-wrap { position:relative; display:flex; align-items:center; }
  .pw-input-wrap .field-input { flex:1; padding-right:80px; }
  .pw-input-wrap .actions { position:absolute; right:8px; display:flex; gap:4px; }

  /* ── GENERATOR ── */
  .gen-section { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:16px; }
  .gen-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .gen-title { font-size:12px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); }
  .gen-pw { font-family:'JetBrains Mono',monospace; font-size:15px; color:var(--gold); background:var(--surface3); border:1px solid var(--border); border-radius:8px; padding:12px 14px; word-break:break-all; margin-bottom:14px; min-height:48px; display:flex; align-items:center; }
  .gen-options { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }
  .gen-check { display:flex; align-items:center; gap:8px; cursor:pointer; }
  .gen-check input { accent-color:var(--gold); width:14px; height:14px; }
  .gen-check span { font-size:12px; color:var(--text2); }
  .slider-wrap { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .slider-label { font-size:12px; color:var(--text3); white-space:nowrap; }
  input[type=range] { flex:1; accent-color:var(--gold); height:4px; }
  .slider-val { font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--gold); width:24px; text-align:right; }

  /* ── STRENGTH ── */
  .strength-indicator { display:flex; gap:4px; align-items:center; }
  .strength-seg { flex:1; height:4px; border-radius:2px; transition:background 0.3s; }
  .strength-text { font-size:11px; font-family:'JetBrains Mono',monospace; letter-spacing:1px; text-transform:uppercase; width:60px; text-align:right; }

  /* ── DETAIL PANEL ── */
  .detail-panel { position:fixed; right:0; top:0; bottom:0; width:380px; background:var(--surface); border-left:1px solid var(--border); padding:28px; overflow-y:auto; z-index:50; animation:slideIn 0.2s; }
  @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
  .detail-favicon { width:72px; height:72px; border-radius:16px; background:var(--surface2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:36px; margin-bottom:16px; overflow:hidden; }
  .detail-favicon img { width:100%; height:100%; object-fit:contain; }
  .detail-name { font-family:'DM Serif Display',serif; font-size:26px; color:var(--text); margin-bottom:4px; }
  .detail-url { font-size:12px; color:var(--gold); font-family:'JetBrains Mono',monospace; margin-bottom:16px; }
  .detail-alerts { display:flex; flex-direction:column; gap:8px; margin-bottom:20px; }
  .detail-alert { padding:10px 14px; border-radius:8px; font-size:12px; line-height:1.5; }
  .detail-alert.breach { background:rgba(224,85,85,0.1); border:1px solid rgba(224,85,85,0.25); color:var(--red); }
  .detail-alert.dupe { background:rgba(91,143,232,0.1); border:1px solid rgba(91,143,232,0.25); color:var(--blue); }
  .detail-alert.old { background:rgba(212,135,74,0.1); border:1px solid rgba(212,135,74,0.25); color:var(--orange); }
  .detail-section { margin-bottom:20px; }
  .detail-section-title { font-size:10px; text-transform:uppercase; letter-spacing:2px; color:var(--text3); margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border); }
  .detail-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); }
  .detail-row-label { font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; }
  .detail-row-val { font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--text); display:flex; align-items:center; gap:8px; }

  /* ── TOAST ── */
  .copied-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--surface2); border:1px solid var(--gold); border-radius:8px; padding:10px 20px; font-size:13px; color:var(--gold); z-index:300; animation:toast 2.2s forwards; white-space:nowrap; }
  @keyframes toast { 0%{opacity:0;transform:translateX(-50%) translateY(10px)} 15%{opacity:1;transform:translateX(-50%) translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateX(-50%) translateY(-5px)} }

  .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; gap:16px; text-align:center; }
  .empty-icon { font-size:48px; opacity:0.2; }
  .empty-title { font-size:18px; color:var(--text2); font-family:'DM Serif Display',serif; }
  .empty-sub { font-size:13px; color:var(--text3); max-width:300px; }

  select.field-input { cursor:pointer; }
  textarea.field-input { resize:vertical; min-height:80px; }
`;

// ─────────────────────────────────────────────
// CONSTANTS & UTILS
// ─────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",      label: "All Vaults", icon: "⬡" },
  { id: "social",   label: "Social",     icon: "◉" },
  { id: "finance",  label: "Finance",    icon: "◈" },
  { id: "work",     label: "Work",       icon: "◧" },
  { id: "shopping", label: "Shopping",   icon: "◎" },
  { id: "dev",      label: "Developer",  icon: "◆" },
  { id: "other",    label: "Other",      icon: "◌" },
];

const AUTO_LOCK_SECONDS = 300; // 5 minutes
const AGE_WARN_DAYS = 90;

function generatePassword(length = 20, opts = {}) {
  const { upper = true, lower = true, numbers = true, symbols = true } = opts;
  let chars = "";
  if (upper)   chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower)   chars += "abcdefghijklmnopqrstuvwxyz";
  if (numbers) chars += "0123456789";
  if (symbols) chars += "!@#$%^&*()-_=+[]{}|;:,.<>?";
  if (!chars)  chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getStrength(pw) {
  if (!pw) return { score: 0, label: "—", color: "var(--text3)" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 14) score++;
  if (pw.length >= 20) score++;
  if (/[A-Z]/.test(pw))     score++;
  if (/[a-z]/.test(pw))     score++;
  if (/[0-9]/.test(pw))     score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const lvl = score <= 2 ? 0 : score <= 4 ? 1 : score <= 6 ? 2 : 3;
  return [
    { score: 1, label: "Weak",   color: "var(--red)"    },
    { score: 2, label: "Fair",   color: "var(--orange)" },
    { score: 3, label: "Good",   color: "#c9c44c"       },
    { score: 4, label: "Strong", color: "var(--green)"  },
  ][lvl];
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function getFaviconUrl(url) {
  if (!url) return null;
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

// HIBP k-anonymity password breach check
async function checkBreach(password) {
  try {
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("").toUpperCase();
    const prefix = hex.slice(0, 5);
    const suffix = hex.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" }
    });
    if (!res.ok) return { status: "error" };
    const text = await res.text();
    const match = text.split("\n").find(l => l.startsWith(suffix));
    if (match) {
      const count = parseInt(match.split(":")[1]) || 1;
      return { status: "breached", count };
    }
    return { status: "safe" };
  } catch {
    return { status: "error" };
  }
}

const DEMO_DATA = [
  { id: 1, name: "GitHub",     url: "github.com",               username: "dev_user",         password: "Gh!tHub_Secure99",  category: "dev",      notes: "Personal dev account", createdAt: "2024-01-15", updatedAt: "2024-01-15", favicon: "👾" },
  { id: 2, name: "Gmail",      url: "mail.google.com",           username: "user@gmail.com",   password: "password123",       category: "social",   notes: "",                     createdAt: "2023-08-01", updatedAt: "2023-08-01", favicon: "📧" },
  { id: 3, name: "Chase Bank", url: "chase.com",                 username: "john.doe",         password: "Ch@se_B@nk!2024#",  category: "finance",  notes: "Checking & savings",   createdAt: "2024-03-10", updatedAt: "2024-03-10", favicon: "🏦" },
  { id: 4, name: "AWS Console",url: "console.aws.amazon.com",    username: "admin@company.com",password: "Gh!tHub_Secure99",  category: "dev",      notes: "Production account",   createdAt: "2024-04-05", updatedAt: "2024-04-05", favicon: "☁" },
  { id: 5, name: "Netflix",    url: "netflix.com",               username: "user@gmail.com",   password: "Netfl1x_F@m!ly24",  category: "shopping", notes: "Family plan",          createdAt: "2024-05-20", updatedAt: "2024-05-20", favicon: "🎬" },
];

// ─────────────────────────────────────────────
// VAULT DOOR ANIMATION
// ─────────────────────────────────────────────
const SPOKE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const STEPS = ["INITIALIZING", "VERIFYING KEY", "DECRYPTING", "ACCESS GRANTED"];

function VaultDoor({ onDone }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1900),
      setTimeout(() => onDone(), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="vault-door-overlay opening">
      <div className="vault-bg-lines" />
      <div className="vault-scene">
        <div className="vault-ring vault-ring-1">
          <div className="vault-ring vault-ring-2">
            <div className="vault-ring vault-ring-3">
              <div className="vault-spokes">
                {SPOKE_ANGLES.map(a => (
                  <div key={a} className="vault-spoke" style={{ transform: `translateX(-50%) rotate(${a}deg)` }} />
                ))}
              </div>
              <div className="vault-center">
                <div className="vault-lock-icon">🔓</div>
                <div className="vault-status-text">{STEPS[step]}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="vault-flash" />
      </div>
      <div className="vault-door-text">Vault</div>
      <div className="vault-door-subtext">SECURE PASSWORD MANAGER</div>
      <div className="vault-progress-wrap">
        <div className="vault-progress-track">
          <div className="vault-progress-fill" />
        </div>
        <div className="vault-progress-label">{STEPS[step]}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STRENGTH INDICATOR
// ─────────────────────────────────────────────
function StrengthIndicator({ password }) {
  const s = getStrength(password);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginTop:"8px" }}>
      <div className="strength-indicator" style={{ flex:1 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="strength-seg" style={{ background: i <= s.score ? s.color : "var(--surface3)" }} />
        ))}
      </div>
      <span className="strength-text" style={{ color: s.color }}>{s.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// PASSWORD GENERATOR
// ─────────────────────────────────────────────
function PasswordGenerator({ onUse }) {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ upper:true, lower:true, numbers:true, symbols:true });
  const [pw, setPw] = useState(() => generatePassword(20));
  const gen = useCallback(() => setPw(generatePassword(length, opts)), [length, opts]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <div className="gen-section">
      <div className="gen-header">
        <span className="gen-title">Generator</span>
        <button className="icon-btn" onClick={gen}>↺</button>
      </div>
      <div className="gen-pw">{pw}</div>
      <div className="slider-wrap">
        <span className="slider-label">Length</span>
        <input type="range" min={8} max={64} value={length} onChange={e => setLength(+e.target.value)} />
        <span className="slider-val">{length}</span>
      </div>
      <div className="gen-options">
        {[["upper","A–Z"],["lower","a–z"],["numbers","0–9"],["symbols","!@#"]].map(([k,l]) => (
          <label key={k} className="gen-check">
            <input type="checkbox" checked={opts[k]} onChange={() => setOpts(p => ({ ...p, [k]: !p[k] }))} />
            <span>{l}</span>
          </label>
        ))}
      </div>
      <StrengthIndicator password={pw} />
      <button className="btn-primary" style={{ width:"100%", marginTop:"12px" }} onClick={() => onUse(pw)}>
        Use This Password
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// FAVICON IMAGE
// ─────────────────────────────────────────────
function FaviconImg({ url, fallback, size = 42 }) {
  const [failed, setFailed] = useState(false);
  const faviconUrl = getFaviconUrl(url);
  if (!faviconUrl || failed) {
    return <span style={{ fontSize: size * 0.5 }}>{fallback || "🔑"}</span>;
  }
  return (
    <img
      src={faviconUrl}
      alt=""
      style={{ width:"100%", height:"100%", objectFit:"contain" }}
      onError={() => setFailed(true)}
    />
  );
}

// ─────────────────────────────────────────────
// ADD/EDIT MODAL
// ─────────────────────────────────────────────
function AddEditModal({ entry, onSave, onClose }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    name: entry?.name || "", url: entry?.url || "",
    username: entry?.username || "", password: entry?.password || "",
    category: entry?.category || "other", notes: entry?.notes || "",
    favicon: entry?.favicon || "🔑",
  });
  const [showPw, setShowPw] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    if (!form.name || !form.password) return;
    const now = new Date().toISOString().slice(0, 10);
    onSave({ ...entry, ...form, id: entry?.id || Date.now(), createdAt: entry?.createdAt || now, updatedAt: now });
  };
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? "Edit Entry" : "New Entry"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
            <div className="field-group" style={{ gridColumn:"1/-1" }}>
              <label>Site Name</label>
              <input className="field-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. GitHub" />
            </div>
            <div className="field-group">
              <label>URL</label>
              <input className="field-input mono" value={form.url} onChange={e => set("url", e.target.value)} placeholder="github.com" />
            </div>
            <div className="field-group">
              <label>Category</label>
              <select className="field-input" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field-group" style={{ gridColumn:"1/-1" }}>
              <label>Username / Email</label>
              <input className="field-input mono" value={form.username} onChange={e => set("username", e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="field-group" style={{ gridColumn:"1/-1" }}>
              <label>Password</label>
              <div className="pw-input-wrap">
                <input className="field-input mono" type={showPw ? "text" : "password"} value={form.password}
                  onChange={e => set("password", e.target.value)} placeholder="••••••••••••" />
                <div className="actions">
                  <button className="icon-btn" onClick={() => setShowPw(p => !p)}>{showPw ? "◌" : "◉"}</button>
                  <button className="icon-btn" onClick={() => setShowGen(p => !p)}>⚡</button>
                </div>
              </div>
              <StrengthIndicator password={form.password} />
            </div>
            {showGen && (
              <div style={{ gridColumn:"1/-1" }}>
                <PasswordGenerator onUse={pw => { set("password", pw); setShowGen(false); }} />
              </div>
            )}
            <div className="field-group" style={{ gridColumn:"1/-1" }}>
              <label>Notes</label>
              <textarea className="field-input" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes..." rows={3} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>{isEdit ? "Save Changes" : "Add Entry"}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────
function DetailPanel({ entry, breachData, duplicates, onEdit, onDelete, onClose }) {
  const [showPw, setShowPw] = useState(false);
  const [toast, setToast] = useState(null);
  const copy = (val, label) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setToast(label + " copied!");
    setTimeout(() => setToast(null), 2200);
  };
  const s = getStrength(entry.password);
  const age = daysSince(entry.updatedAt || entry.createdAt);
  const breach = breachData[entry.id];
  const isDupe = duplicates.has(entry.id);

  return (
    <div className="detail-panel">
      {toast && <div className="copied-toast">✓ {toast}</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px" }}>
        <button className="icon-btn" onClick={onClose} style={{ fontSize:14 }}>←</button>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn-ghost" onClick={onEdit} style={{ fontSize:12, padding:"8px 14px" }}>Edit</button>
          <button className="btn-danger" onClick={onDelete} style={{ fontSize:12, padding:"8px 14px" }}>Delete</button>
        </div>
      </div>

      <div className="detail-favicon">
        <FaviconImg url={entry.url} fallback={entry.favicon} size={72} />
      </div>
      <div className="detail-name">{entry.name}</div>
      <div className="detail-url">{entry.url}</div>

      {/* Alerts */}
      <div className="detail-alerts">
        {breach?.status === "breached" && (
          <div className="detail-alert breach">
            ⚠ Password found in {breach.count.toLocaleString()} data breach{breach.count > 1 ? "es" : ""}. Change it immediately.
          </div>
        )}
        {breach?.status === "checking" && (
          <div className="detail-alert" style={{ background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text3)" }}>
            ◌ Checking for breaches...
          </div>
        )}
        {breach?.status === "safe" && (
          <div className="detail-alert" style={{ background:"rgba(76,175,130,0.08)", border:"1px solid rgba(76,175,130,0.2)", color:"var(--green)" }}>
            ✓ Password not found in any known breaches.
          </div>
        )}
        {isDupe && (
          <div className="detail-alert dupe">
            ⚡ This password is reused across multiple entries. Use unique passwords.
          </div>
        )}
        {age >= AGE_WARN_DAYS && (
          <div className="detail-alert old">
            ⏱ Password is {age} days old. Consider updating it.
          </div>
        )}
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Credentials</div>
        <div className="detail-row">
          <div className="detail-row-label">Username</div>
          <div className="detail-row-val">
            <span style={{ fontFamily:"JetBrains Mono", fontSize:12, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.username}</span>
            <button className="icon-btn" onClick={() => copy(entry.username, "Username")}>⎘</button>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-row-label">Password</div>
          <div className="detail-row-val">
            <span style={{ fontFamily:"JetBrains Mono", fontSize:12, letterSpacing:2 }}>
              {showPw ? entry.password : "•".repeat(Math.min(entry.password.length, 16))}
            </span>
            <button className="icon-btn" onClick={() => setShowPw(p => !p)}>{showPw ? "◌" : "◉"}</button>
            <button className="icon-btn" onClick={() => copy(entry.password, "Password")}>⎘</button>
          </div>
        </div>
        <div style={{ padding:"12px 0 4px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1 }}>Strength</span>
            <span style={{ fontSize:11, fontFamily:"JetBrains Mono", color:s.color, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</span>
          </div>
          <div className="strength-indicator">
            {[1,2,3,4].map(i => <div key={i} className="strength-seg" style={{ background: i <= s.score ? s.color : "var(--surface3)" }} />)}
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Info</div>
        <div className="detail-row">
          <div className="detail-row-label">Category</div>
          <div className="detail-row-val" style={{ fontFamily:"Outfit", fontSize:13 }}>{CATEGORIES.find(c => c.id === entry.category)?.label || "Other"}</div>
        </div>
        <div className="detail-row">
          <div className="detail-row-label">Added</div>
          <div className="detail-row-val" style={{ fontFamily:"JetBrains Mono", fontSize:12 }}>{entry.createdAt}</div>
        </div>
        <div className="detail-row">
          <div className="detail-row-label">Age</div>
          <div className="detail-row-val" style={{ fontFamily:"JetBrains Mono", fontSize:12, color: age >= AGE_WARN_DAYS ? "var(--orange)" : "var(--text)" }}>
            {age} days
          </div>
        </div>
      </div>

      {entry.notes && (
        <div className="detail-section">
          <div className="detail-section-title">Notes</div>
          <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7 }}>{entry.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// LOCK SCREEN
// ─────────────────────────────────────────────
function LockScreen({ onUnlock }) {
  const [mp, setMp] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("vaultmp")) setIsNew(false);
  }, []);

  const handle = () => {
    if (isNew) {
      if (mp.length < 6) { setError("Master password must be at least 6 characters."); return; }
      if (mp !== confirm) { setError("Passwords don't match."); return; }
      localStorage.setItem("vaultmp", btoa(mp));
      onUnlock();
    } else {
      if (localStorage.getItem("vaultmp") === btoa(mp)) onUnlock();
      else { setError("Incorrect master password."); setMp(""); }
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-icon">🔐</div>
      <div style={{ textAlign:"center" }}>
        <div className="lock-title">Vault</div>
        <div className="lock-sub">{isNew ? "Create your vault" : "Unlock your vault"}</div>
      </div>
      <div className="lock-form">
        {error && <div className="error-msg">{error}</div>}
        <input className="lock-input" type="password" placeholder={isNew ? "Create master password" : "Master password"}
          value={mp} onChange={e => { setMp(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && (isNew ? confirm && handle() : handle())} autoFocus />
        {isNew && (
          <input className="lock-input" type="password" placeholder="Confirm master password"
            value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handle()} />
        )}
        <button className="btn-primary" onClick={handle}>{isNew ? "Create Vault →" : "Unlock →"}</button>
        {!isNew && (
          <button className="btn-ghost" onClick={() => { localStorage.clear(); setIsNew(true); setMp(""); setError(""); }}>
            Reset vault
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AUTO-LOCK HOOK
// ─────────────────────────────────────────────
function useAutoLock(onLock, enabled = true) {
  const [remaining, setRemaining] = useState(AUTO_LOCK_SECONDS);
  const timerRef = useRef(null);
  const countRef = useRef(null);

  const reset = useCallback(() => {
    setRemaining(AUTO_LOCK_SECONDS);
    clearTimeout(timerRef.current);
    clearInterval(countRef.current);
    if (!enabled) return;
    timerRef.current = setTimeout(onLock, AUTO_LOCK_SECONDS * 1000);
    countRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(countRef.current); return 0; }
        return r - 1;
      });
    }, 1000);
  }, [onLock, enabled]);

  useEffect(() => {
    if (!enabled) return;
    reset();
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timerRef.current);
      clearInterval(countRef.current);
    };
  }, [reset, enabled]);

  return remaining;
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function PasswordManager() {
  const [phase, setPhase]       = useState("lock");   // lock | vault-door | app
  const [entries, setEntries]   = useState([]);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [toast, setToast]       = useState(null);
  const [breachData, setBreachData] = useState({});  // { [id]: { status, count } }

  // Load entries after unlock
  useEffect(() => {
    if (phase !== "app") return;
    const saved = localStorage.getItem("vault_entries");
    if (saved) { try { setEntries(JSON.parse(saved)); } catch {} }
    else setEntries(DEMO_DATA);
  }, [phase]);

  // Run breach checks whenever entries change
  useEffect(() => {
    if (phase !== "app" || entries.length === 0) return;
    entries.forEach(entry => {
      if (breachData[entry.id]) return; // already checked
      setBreachData(prev => ({ ...prev, [entry.id]: { status: "checking" } }));
      checkBreach(entry.password).then(result => {
        setBreachData(prev => ({ ...prev, [entry.id]: result }));
      });
    });
  }, [entries, phase]);

  // Auto-lock
  const handleLock = useCallback(() => {
    setPhase("lock");
    setSelected(null);
    setBreachData({});
  }, []);
  const remaining = useAutoLock(handleLock, phase === "app");
  const showWarning = remaining <= 60 && phase === "app";

  const save = (newEntries) => {
    setEntries(newEntries);
    localStorage.setItem("vault_entries", JSON.stringify(newEntries));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Compute duplicates: entries sharing a password
  const duplicates = (() => {
    const seen = {};
    entries.forEach(e => {
      if (!seen[e.password]) seen[e.password] = [];
      seen[e.password].push(e.id);
    });
    const dupeSet = new Set();
    Object.values(seen).forEach(ids => {
      if (ids.length > 1) ids.forEach(id => dupeSet.add(id));
    });
    return dupeSet;
  })();

  // Filtered list
  const filtered = entries.filter(e => {
    const matchCat = category === "all" || e.category === category;
    const q = search.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.url.toLowerCase().includes(q) || e.username.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = c.id === "all" ? entries.length : entries.filter(e => e.category === c.id).length;
    return acc;
  }, {});

  // Alert counts
  const breachCount = Object.values(breachData).filter(b => b.status === "breached").length;
  const dupeCount = duplicates.size;
  const oldCount = entries.filter(e => daysSince(e.updatedAt || e.createdAt) >= AGE_WARN_DAYS).length;

  const handleSave = (entry) => {
    const isEdit = entries.find(e => e.id === entry.id);
    const updated = isEdit ? entries.map(e => e.id === entry.id ? entry : e) : [...entries, entry];
    save(updated);
    // Re-check breach for updated entry
    setBreachData(prev => ({ ...prev, [entry.id]: { status: "checking" } }));
    checkBreach(entry.password).then(result => {
      setBreachData(prev => ({ ...prev, [entry.id]: result }));
    });
    setShowAdd(false);
    setEditEntry(null);
    setSelected(entry);
    showToast(isEdit ? "Entry updated" : "Entry added");
  };

  const handleDelete = (id) => {
    save(entries.filter(e => e.id !== id));
    setSelected(null);
    setBreachData(prev => { const n = { ...prev }; delete n[id]; return n; });
    showToast("Entry deleted");
  };

  const handleCopy = (ev, val, label) => {
    ev.stopPropagation();
    navigator.clipboard?.writeText(val).catch(() => {});
    showToast(label + " copied!");
  };

  const strongCount = entries.filter(e => getStrength(e.password).score === 4).length;
  const weakCount   = entries.filter(e => getStrength(e.password).score <= 1).length;

  // ── RENDER ──
  if (phase === "lock") return (
    <div className="app">
      <style>{styles}</style>
      <LockScreen onUnlock={() => setPhase("vault-door")} />
    </div>
  );

  if (phase === "vault-door") return (
    <div className="app">
      <style>{styles}</style>
      <VaultDoor onDone={() => setPhase("app")} />
    </div>
  );

  return (
    <div className="app">
      <style>{styles}</style>
      {toast && <div className="copied-toast">✓ {toast}</div>}

      {/* Auto-lock warning banner */}
      {showWarning && (
        <div className="autolock-banner">
          <span>⏱</span>
          <span>Auto-locking in {remaining}s</span>
          <div className="autolock-progress">
            <div className="autolock-fill" style={{ width: `${(remaining / 60) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="main" style={{ paddingTop: showWarning ? 41 : 0 }}>
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">🔐</div>
            <div>
              <div className="logo-text">Vault</div>
              <div className="logo-ver">v3.0 · ENCRYPTED</div>
            </div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search vault..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="nav-section">
            <div className="nav-label">Categories</div>
            {CATEGORIES.map(c => (
              <div key={c.id} className={`nav-item ${category === c.id ? "active" : ""}`} onClick={() => setCategory(c.id)}>
                <span className="nav-icon">{c.icon}</span>
                <span>{c.label}</span>
                {counts[c.id] > 0 && <span className="nav-count">{counts[c.id]}</span>}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="vault-stats">
              <div className="stat-card"><div className="stat-num">{entries.length}</div><div className="stat-label">Total</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color:"var(--green)" }}>{strongCount}</div><div className="stat-label">Strong</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color:"var(--red)" }}>{weakCount}</div><div className="stat-label">Weak</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: breachCount > 0 ? "var(--red)" : "var(--text3)" }}>{breachCount}</div><div className="stat-label">Breached</div></div>
            </div>
            <button className="btn-ghost" style={{ fontSize:12, padding:"8px 12px" }} onClick={handleLock}>
              🔒 Lock Vault
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="content" style={{ marginRight: selected ? 380 : 0, transition:"margin 0.25s" }}>
          <div className="content-header">
            <div>
              <div className="page-title">{CATEGORIES.find(c => c.id === category)?.label}</div>
              <div className="page-sub">
                {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
                {search ? ` matching "${search}"` : ""}
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={() => setShowAdd(true)}>+ New Entry</button>
            </div>
          </div>

          {/* Alert chips */}
          {(breachCount > 0 || dupeCount > 0 || oldCount > 0) && (
            <div className="alert-row">
              {breachCount > 0 && (
                <div className="alert-chip breach" onClick={() => setSearch("")}>
                  ⚠ {breachCount} breached password{breachCount > 1 ? "s" : ""}
                </div>
              )}
              {dupeCount > 0 && (
                <div className="alert-chip dupe">
                  ⚡ {dupeCount} reused password{dupeCount > 1 ? "s" : ""}
                </div>
              )}
              {oldCount > 0 && (
                <div className="alert-chip old">
                  ⏱ {oldCount} aging password{oldCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <div className="empty-title">{search ? "No results found" : "This vault is empty"}</div>
              <div className="empty-sub">{search ? "Try a different search term." : "Add your first entry to get started."}</div>
              {!search && <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Entry</button>}
            </div>
          ) : (
            <div className="pw-grid">
              {filtered.map(e => {
                const s = getStrength(e.password);
                const breach = breachData[e.id];
                const isDupe = duplicates.has(e.id);
                const age = daysSince(e.updatedAt || e.createdAt);
                const isOld = age >= AGE_WARN_DAYS;
                const isBreached = breach?.status === "breached";
                return (
                  <div
                    key={e.id}
                    className={`pw-card ${selected?.id === e.id ? "selected" : ""} ${isBreached ? "has-breach" : ""} ${isDupe ? "has-dupe" : ""} ${isOld && !isBreached ? "is-old" : ""}`}
                    onClick={() => setSelected(selected?.id === e.id ? null : e)}
                  >
                    <div className="card-header">
                      <div className="card-favicon">
                        <FaviconImg url={e.url} fallback={e.favicon} size={42} />
                      </div>
                      <div className="card-meta">
                        <div className="card-name">{e.name}</div>
                        <div className="card-url">{e.url}</div>
                      </div>
                      <div className="card-badge">{CATEGORIES.find(c => c.id === e.category)?.label}</div>
                    </div>
                    <div className="card-field">
                      <span className="field-label">User</span>
                      <span className="field-val">{e.username}</span>
                      <div className="field-actions">
                        <button className="icon-btn" onClick={ev => handleCopy(ev, e.username, "Username")}>⎘</button>
                      </div>
                    </div>
                    <div className="card-field">
                      <span className="field-label">Pass</span>
                      <span className="field-val">{"•".repeat(Math.min(e.password.length, 18))}</span>
                      <div className="field-actions">
                        <button className="icon-btn" onClick={ev => handleCopy(ev, e.password, "Password")}>⎘</button>
                      </div>
                    </div>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width:`${s.score * 25}%`, background:s.color }} />
                    </div>
                    {/* Warning badges */}
                    {(isBreached || isDupe || isOld || breach?.status === "checking") && (
                      <div className="card-warnings">
                        {breach?.status === "checking" && <span className="warn-badge checking">◌ checking breach</span>}
                        {isBreached && <span className="warn-badge breach">⚠ breached ×{breach.count?.toLocaleString()}</span>}
                        {isDupe && <span className="warn-badge dupe">⚡ reused</span>}
                        {isOld && <span className="warn-badge old">⏱ {age}d old</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* DETAIL PANEL */}
        {selected && (
          <DetailPanel
            entry={selected}
            breachData={breachData}
            duplicates={duplicates}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditEntry(selected); setSelected(null); }}
            onDelete={() => handleDelete(selected.id)}
          />
        )}
      </div>

      {/* MODALS */}
      {(showAdd || editEntry) && (
        <AddEditModal
          entry={editEntry}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditEntry(null); }}
        />
      )}
    </div>
  );
}