"use strict";
/* ⚠️ अस्थायी: टोकन ब्राउज़र में दिखता है (कोई भी देख सकता है)। README देखें, बाद में functions में ले जाएँ। */
const CONFIG = {
  BOT_TOKEN: "PASTE_BOT_TOKEN_HERE",
  CHAT_ID: "PASTE_CHAT_ID_HERE",
  // अपने 5-6 बैनर की सीधी इमेज लिंक (https://...) यहाँ डालें
  BANNERS: ["PASTE_BANNER_1_URL", "PASTE_BANNER_2_URL", "PASTE_BANNER_3_URL", "PASTE_BANNER_4_URL", "PASTE_BANNER_5_URL", "PASTE_BANNER_6_URL"],
};
const enc = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const dec = (s) => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0))); };

const $ = (id) => document.getElementById(id);
const NAME_RE = /^[\p{L}\p{M}\p{N} .'-]{2,40}$/u;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let shareUrl = "", senderName = "", busy = false;

function show(id) { ["home", "wish"].forEach((s) => ($(s).hidden = s !== id)); window.scrollTo(0, 0); }
function setErr(id, t) { $(id).textContent = t || ""; }
function normPhone(v) {
  let d = v.replace(/[\s-]/g, "");
  d = d.replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/* ---------- Greeting ---------- */
function setBanner(i) {
  const img = $("banner"), u = CONFIG.BANNERS[i];
  img.hidden = true;
  if (!u || !/^https:\/\//.test(u)) return;
  img.onload = () => (img.hidden = false); img.onerror = () => (img.hidden = true); img.src = u;
}
function showGreeting(name, url, b) {
  senderName = name; shareUrl = url; setBanner(b);
  $("msg").textContent = `${name} की ओर से आपको और आपके परिवार को दीपावली की हार्दिक शुभकामनाएँ!`;
  $("invalid").hidden = true; $("reveal").hidden = true; $("light").hidden = false;
  $("wish").classList.remove("on"); $("status").textContent = "";
  show("wish");
}
function lightUp() {
  $("light").hidden = true; $("wish").classList.add("on"); $("reveal").hidden = false;
  if (!reduced) { burst(); setTimeout(burst, 700); setTimeout(burst, 1500); }
  if (soundOn) bell();
}

/* ---------- Form ---------- */
async function sendTelegram(name, phone, url) {
  if (!CONFIG.BOT_TOKEN.includes(":")) return false; // not configured
  const ist = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const text = `🪔 नई दिवाली विश\nनाम: ${name}\nमोबाइल: ${phone}\nसमय (IST): ${ist}\nलिंक: ${url}`;
  const c = new AbortController(); const t = setTimeout(() => c.abort(), 8000);
  try {
    const r = await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`, {
      method: "POST", signal: c.signal, headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: CONFIG.CHAT_ID, text, disable_web_page_preview: true }),
    });
    return r.ok;
  } catch { return false; } finally { clearTimeout(t); }
}
$("form").addEventListener("submit", async (e) => {
  e.preventDefault(); if (busy) return;
  ["name-err", "phone-err", "consent-err", "form-err"].forEach((i) => setErr(i));
  const name = $("name").value.trim().replace(/\s+/g, " ");
  const phone = normPhone($("phone").value);
  let ok = true;
  if (!NAME_RE.test(name)) { setErr("name-err", "कृपया 2–40 अक्षरों का सही नाम लिखें।"); ok = false; }
  if (!phone) { setErr("phone-err", "कृपया 10 अंकों का सही भारतीय मोबाइल नंबर लिखें (6–9 से शुरू)।"); ok = false; }
  if (!$("consent").checked) { setErr("consent-err", "आगे बढ़ने के लिए सहमति ज़रूरी है।"); ok = false; }
  if (!ok) return;
  busy = true; const b = $("create"); b.disabled = true; b.textContent = "विश बन रही है…";
  try {
    const b = Math.floor(Math.random() * CONFIG.BANNERS.length);
    const q = `?w=${enc(name)}&b=${b}`, url = location.origin + "/" + q;
    sendTelegram(name, phone, url); // non-blocking; details never logged
    history.replaceState(null, "", "/" + q);
    $("form").reset(); showGreeting(name, url, b); lightUp();
  } catch (err) { setErr("form-err", err.message); }
  finally { busy = false; b.disabled = false; b.textContent = "मेरी दिवाली विश बनाएं"; }
});

/* ---------- Buttons ---------- */
$("light").onclick = lightUp;
$("wa").onclick = () => {
  const t = `दीपावली पर आपके लिए एक खास शुभकामना आई है! 🪔 देखें, ${senderName} ने आपके लिए क्या भेजा है: ${shareUrl}`;
  window.open("https://wa.me/?text=" + encodeURIComponent(t), "_blank", "noopener");
};
$("copy").onclick = async () => {
  try { await navigator.clipboard.writeText(shareUrl); $("status").textContent = "लिंक कॉपी हो गया ✓"; }
  catch { window.prompt("लिंक कॉपी करें:", shareUrl); }
};
const goHome = () => { history.replaceState(null, "", "/"); show("home"); $("name").focus(); };
$("mine").onclick = goHome; $("new").onclick = goHome;

/* ---------- Sound (after user gesture only) ---------- */
let soundOn = false, ac;
function bell() {
  if (!ac) return;
  [523, 659, 784].forEach((f, i) => {
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.25;
    o.frequency.value = f; o.type = "sine"; g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.15, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 1.5);
  });
}
$("sound").onclick = () => {
  soundOn = !soundOn; ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  $("sound").setAttribute("aria-pressed", soundOn); $("sound").textContent = soundOn ? "🔔" : "🔇";
  $("sound").setAttribute("aria-label", soundOn ? "ध्वनि बंद करें" : "ध्वनि चालू करें");
  if (soundOn) { ac.resume(); bell(); }
};

/* ---------- Particles & fireworks ---------- */
const cv = $("fx"), cx = cv.getContext("2d"); let W, H, parts = [], fw = [];
function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener("resize", size); size();
if (!reduced) for (let i = 0; i < 28; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .6, v: Math.random() * .3 + .1 });
function burst() {
  const x = W * (.2 + Math.random() * .6), y = H * (.15 + Math.random() * .3), h = Math.random() * 40 + 25;
  for (let i = 0; i < 36; i++) { const a = (i / 36) * 6.283, s = 1.5 + Math.random() * 2.5; fw.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, h }); }
}
function frame() {
  cx.clearRect(0, 0, W, H);
  cx.fillStyle = "rgba(255,215,122,.7)";
  parts.forEach((p) => { p.y -= p.v; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); });
  fw = fw.filter((p) => p.l > 0);
  fw.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .04; p.l -= .014; cx.fillStyle = `hsla(${p.h},100%,65%,${p.l})`; cx.fillRect(p.x, p.y, 2.5, 2.5); });
  requestAnimationFrame(frame);
}
if (!reduced) frame();

/* ---------- Init ---------- */
const qs = new URLSearchParams(location.search);
if (qs.has("w")) {
  let nm = null;
  try { nm = dec(qs.get("w")); } catch {}
  if (nm && NAME_RE.test(nm)) {
    const b = Number(qs.get("b")) || 0;
    showGreeting(nm, location.href, b >= 0 && b < CONFIG.BANNERS.length ? b : 0);
  } else { show("wish"); $("light").hidden = true; $("invalid").hidden = false; }
}
