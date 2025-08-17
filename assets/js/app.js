/* =========================================================
   LUMI • app.js
   - Login com hash (SHA-256 + salt) via Web Crypto API
   - Sessão em localStorage
   - Redirecionamento por perfil (aluno/professor/encarregado/admin)
   - Tema (dark/light) com persistência
   - Dashboard: tabs com memória, exercício, chat com bolhas + persistência
   - Menu mobile
   NOTA: Demo apenas. Em produção, a validação é no servidor.
   ========================================================= */

/* ---------- Utils ---------- */
const enc = new TextEncoder();

const hexToBytes = (hex) =>
  new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));

const bytesToHex = (bytes) =>
  Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");

async function sha256(bytes) {
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(buf);
}

async function hashPassword(password, saltHex) {
  const salt = hexToBytes(saltHex);
  const pwd = enc.encode(password);
  // concat(salt + password)
  const input = new Uint8Array(salt.length + pwd.length);
  input.set(salt, 0);
  input.set(pwd, salt.length);
  const digest = await sha256(input);
  return bytesToHex(digest);
}

/* ---------- Demo users (hashes pré-calculados) ----------
   Emails & perfis:
   - aluno@escola.pt      / pass: Aluno123!     / role: "aluno"
   - professor@escola.pt  / pass: Prof123!      / role: "professor"
   - ee@escola.pt         / pass: EE123!        / role: "encarregado"
   - admin@escola.pt      / pass: Admin123!     / role: "admin"
   ------------------------------------------------------- */
const USERS = {
  "aluno@escola.pt": {
    role: "aluno",
    salt: "6e8f899efc33940e5f4e1c14c60ae307",
    hash: "ae5ce57f1b79551c8f4d507f79199d9a4993a4cccb3b3cf1733d428c210da1ad"
  },
  "professor@escola.pt": {
    role: "professor",
    salt: "2449634b15860c98598243be690c2d41",
    hash: "0896a9f4c48c89aacebc18dc975ea38832c2e97b49be1f102547fcbf48b6311f"
  },
  "ee@escola.pt": {
    role: "encarregado",
    salt: "2e55cf3348ba6671660499f086e05121",
    hash: "be37d38eaf0bf9c076056da56ca58da6b2b6ec5639e47b353d58cb8c3c2b77c1"
  },
  "admin@escola.pt": {
    role: "admin",
    salt: "8f1a50ff3ca9a264d1ec163d94137715",
    hash: "be34b1df97d0845df4593e1dff221473944ec1b4fdfc094d26b5c4194d2c594a"
  }
};

/* Para onde enviar cada perfil (ajusta os ficheiros conforme criares) */
const ROUTES = {
  aluno: "dashboard-aluno.html",
  professor: "dashboard-professor.html",
  encarregado: "dashboard-encarregado.html",
  admin: "dashboard-admin.html"
};

/* =========================================================
   Login / Sessão
   ========================================================= */
async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = (form.querySelector("#email")?.value || "").trim().toLowerCase();
  const password = form.querySelector("#password")?.value || "";
  const remember = form.querySelector("#remember")?.checked || false;
  const err = document.querySelector("#err");

  if (err) err.style.display = "none";

  // Utilizador existe?
  const u = USERS[email];
  if (!u) return showError("Credenciais inválidas.");

  // Compara hash(salt + password)
  const calc = await hashPassword(password, u.salt);
  if (calc !== u.hash) return showError("Credenciais inválidas.");

  // Guarda sessão (demo)
  const session = { email, role: u.role, ts: Date.now(), remember };
  localStorage.setItem("lumi_session", JSON.stringify(session));

  // Redireciona por perfil
  const dest = ROUTES[u.role] || "index.html";
  location.href = dest;
}

function showError(msg) {
  const el = document.querySelector("#err");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  } else {
    alert(msg);
  }
}

/* Proteção de páginas (dashboards) */
function requireAuth(allowedRoles = []) {
  try {
    const raw = localStorage.getItem("lumi_session");
    const session = raw ? JSON.parse(raw) : null;
    if (!session) throw new Error("no session");
    if (allowedRoles.length && !allowedRoles.includes(session.role)) {
      throw new Error("forbidden");
    }
    // (Opcional) Expirar sessão após X horas
    return session;
  } catch {
    location.href = "index.html#login";
  }
}

function logout() {
  localStorage.removeItem("lumi_session");
  location.href = "index.html";
}

/* =========================================================
   Tema (Dark/Light) — persistência no header
   Suporta IDs: #themeToggle e #toggle-theme
   ========================================================= */
function setupTheme() {
  const btn = document.getElementById("themeToggle") || document.getElementById("toggle-theme");
  // classe inicial a partir do storage (default: dark)
  const saved = localStorage.getItem("lumi_theme"); // 'dark' | 'light'
  if (saved === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.add("dark-mode");
  }

  const renderBtn = () => {
    if (!btn) return;
    const isLight = document.body.classList.contains("light-mode");
    btn.textContent = isLight ? "☀️ Light" : "🌙 Dark";
    btn.setAttribute("aria-pressed", String(isLight));
    const pref = document.getElementById("prefModo");
    if (pref) pref.textContent = isLight ? "Light" : "Dark";
  };
  renderBtn();

  if (btn) {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      document.body.classList.toggle("dark-mode");
      const isLight = document.body.classList.contains("light-mode");
      localStorage.setItem("lumi_theme", isLight ? "light" : "dark");
      renderBtn();
    });
  }
}

/* =========================================================
   Dashboard do Aluno
   - Tabs com estado activo + memória
   - Exercício do dia
   - Chat com bolhas + persistência no localStorage por utilizador
   - Relatório simples
   ========================================================= */

/* Tabs */
function initDashboard() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".tab-content");
  if (!tabButtons.length || !sections.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      // activa visualmente
      tabButtons.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      // mostra conteúdo
      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(tab)?.classList.add("active");
      // memoriza
      localStorage.setItem("lumi_last_tab", tab);
    });
  });

  // repõe última tab (default: overview se existir, senão progresso)
  const last = localStorage.getItem("lumi_last_tab");
  const fallback = document.getElementById("overview") ? "overview" : "progresso";
  const target = last && document.getElementById(last) ? last : fallback;
  document.querySelector(`.tab-btn[data-tab="${target}"]`)?.click();

  // carregar chat do storage
  chatLoadFromStorage();
}

/* Exercício simples (12 × (3 + 2) = 60) */
function checkExercicio() {
  const val = document.getElementById("resposta")?.value;
  const fb = document.getElementById("feedbackExercicio");
  if (!fb) return;
  if (parseInt(val, 10) === 60) {
    fb.textContent = "✅ Correto! Boa!";
    fb.style.color = "var(--brand)";
  } else {
    fb.textContent = "❌ Errado. Tenta outra vez.";
    fb.style.color = "#ef4444";
  }
}

/* Chat — persistência por utilizador */
let chatHistory = [];

function chatStorageKey() {
  try {
    const s = JSON.parse(localStorage.getItem("lumi_session"));
    return `lumi_chat_${s?.email || "anon"}`;
  } catch {
    return "lumi_chat_anon";
  }
}

function chatLoadFromStorage() {
  try {
    const raw = localStorage.getItem(chatStorageKey());
    chatHistory = raw ? JSON.parse(raw) : [];
    renderChat();
  } catch {
    chatHistory = [];
  }
}

function chatSaveToStorage() {
  try {
    localStorage.setItem(chatStorageKey(), JSON.stringify(chatHistory));
  } catch {}
}

function sendMsg() {
  const input = document.getElementById("chatMsg");
  const box = document.getElementById("chatBox");
  if (!input?.value.trim() || !box) return;

  const you = { who: "you", text: input.value.trim(), ts: new Date().toISOString() };
  chatHistory.push(you);
  chatSaveToStorage();
  renderChat();
  input.value = "";

  // resposta demo (eco)
  setTimeout(() => {
    const bot = { who: "bot", text: "Recebido! 👍 Continuamos amanhã às 9h.", ts: new Date().toISOString() };
    chatHistory.push(bot);
    chatSaveToStorage();
    renderChat();
  }, 600);
}

function renderChat() {
  const box = document.getElementById("chatBox");
  if (!box) return;
  box.innerHTML = chatHistory.map(m =>
    `<div class="msg ${m.who}">
       <div>${escapeHTML(m.text)}</div>
       <time>${new Date(m.ts).toLocaleTimeString()}</time>
     </div>`
  ).join("");
  box.scrollTop = box.scrollHeight;
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[ch]);
}

/* Relatório fake */
function gerarRelatorio() {
  const session = JSON.parse(localStorage.getItem("lumi_session") || "{}");
  const nome = (session.email || "aluno@escola.pt").split("@")[0];
  const nomeFmt = nome.charAt(0).toUpperCase() + nome.slice(1);

  const data = `=== Relatório Diário ===
Aluno: ${nomeFmt}
Data: ${new Date().toLocaleDateString()}

Progresso:
- Matemática: 72%
- Português: 85%
- História: 63%

Último exercício: Matemática (12 × (3 + 2)) — ${document.getElementById("feedbackExercicio")?.textContent || "pendente"}
Projetos: Sustentabilidade, Robótica
`;
  const el = document.getElementById("relatorioBox");
  if (el) el.textContent = data;
}

/* =========================================================
   Menu mobile
   ========================================================= */
function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("is-open"));
}

/* =========================================================
   Boot
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupMobileMenu();

  // Login
  const loginForm = document.querySelector("#loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);

  // Expor helpers globais (para HTML)
  window.LUMI = {
    requireAuth,
    logout,
    initDashboard,
    checkExercicio,
    sendMsg,
    gerarRelatorio
  };
});
