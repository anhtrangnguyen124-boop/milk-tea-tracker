// utils.js — reference copy from index.html

/* ============================================================
   Helpers
   ============================================================ */
function fmtDate(d) { const [, m, dd] = d.split('-'); return `${+m}月${+dd}日`; }
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-full text-sm font-medium z-[300] pointer-events-none text-white shadow-lg backdrop-blur-md transition-all duration-300 font-boba toast-in';
  el.style.background = type === 'warn' ? 'rgba(var(--shadow-rgb),0.92)' : 'rgba(55,65,81,0.9)';
  setTimeout(() => { el.classList.remove('toast-in'); el.classList.add('toast-out'); }, 2200);
}
