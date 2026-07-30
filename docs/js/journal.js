// journal.js — reference copy from index.html

/* ============================================================
   Modal — Journal
   ============================================================ */
function renderMoodSelector() {
  const presetHTML = MOODS.map(m =>
    `<button class="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer font-boba text-xs ${journalMood === m.key ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}" onclick="selectJournalMood('${m.key}')">
      <span class="text-xl">${m.emoji}</span>
      <span>${m.label}</span>
    </button>`
  ).join('');

  const customBtn = `<button class="flex items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer font-boba text-xs ${journalMood === 'custom' ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}" onclick="selectJournalMood('custom')">
    <span>自定义</span>
  </button>`;

  const customInput = journalMood === 'custom'
    ? `<div class="mt-2 col-span-4"><input class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base text-gray-800 bg-white font-boba focus:border-accent-500 focus:ring-4 focus:ring-accent-100 outline-none transition-all duration-200" id="journal-modal-custom-mood" placeholder="输入你的心情..." value="${esc(journalCustomMood)}" oninput="journalCustomMood=this.value"></div>`
    : '';

  document.getElementById('journal-modal-moods').innerHTML = presetHTML + customBtn + customInput;
}

function selectJournalMood(key) {
  journalMood = key;
  if (key !== 'custom') journalCustomMood = '';
  renderMoodSelector();
}

function selectJournalPaper(paper, el) {
  journalPaper = paper;
  document.querySelectorAll('#journal-modal-papers .paper-option').forEach(o => {
    o.style.borderColor = '#EDE4DB';
    o.style.boxShadow = 'none';
  });
  el.style.borderColor = 'var(--accent-500)';
  el.style.boxShadow = '0 0 0 3px rgba(var(--shadow-rgb),0.12)';
}

function openJournalModal() {
  journalEditId = null;
  journalMood = 'happy';
  journalCustomMood = '';
  journalPaper = PAPERS[Math.floor(Math.random() * PAPERS.length)];
  document.getElementById('journal-modal-title').textContent = '写想法';
  document.getElementById('journal-modal-title-input').value = '';
  document.getElementById('journal-modal-content').value = '';
  document.getElementById('journal-modal-date').value = localDateStr();
  document.getElementById('journal-modal-content').classList.remove('border-red-400', 'ring-4', 'ring-red-100');
  renderMoodSelector();
  // Reset paper options
  document.querySelectorAll('#journal-modal-papers .paper-option').forEach(o => {
    o.style.borderColor = '#EDE4DB';
    o.style.boxShadow = 'none';
  });
  const paperEl = document.querySelector(`#journal-modal-papers .paper-option[data-paper="${journalPaper}"]`);
  if (paperEl) { paperEl.style.borderColor = '#D4687A'; paperEl.style.boxShadow = '0 0 0 3px rgba(var(--shadow-rgb),0.12)'; }
  document.getElementById('journal-modal-overlay').classList.add('flex');
  document.getElementById('journal-modal-overlay').classList.remove('hidden');
}

function closeJournalModal() {
  document.getElementById('journal-modal-overlay').classList.add('hidden');
  document.getElementById('journal-modal-overlay').classList.remove('flex');
  journalEditId = null;
}

function editJournalEntry(id) {
  const e = journalEntries.find(x => x.id === id);
  if (!e) return;
  journalEditId = id;
  journalMood = e.mood || 'happy';
  journalCustomMood = e.customMood || '';
  journalPaper = e.paper || 'grid';
  document.getElementById('journal-modal-title').textContent = '编辑想法';
  document.getElementById('journal-modal-title-input').value = e.title || '';
  document.getElementById('journal-modal-content').value = e.content;
  document.getElementById('journal-modal-date').value = e.date;
  document.getElementById('journal-modal-content').classList.remove('border-red-400', 'ring-4', 'ring-red-100');
  renderMoodSelector();
  document.querySelectorAll('#journal-modal-papers .paper-option').forEach(o => {
    o.style.borderColor = '#EDE4DB';
    o.style.boxShadow = 'none';
  });
  const paperEl = document.querySelector(`#journal-modal-papers .paper-option[data-paper="${journalPaper}"]`);
  if (paperEl) { paperEl.style.borderColor = '#D4687A'; paperEl.style.boxShadow = '0 0 0 3px rgba(var(--shadow-rgb),0.12)'; }
  document.getElementById('journal-modal-overlay').classList.add('flex');
  document.getElementById('journal-modal-overlay').classList.remove('hidden');
}

function saveJournalEntry() {
  const contentEl = document.getElementById('journal-modal-content'),
    content = contentEl.value.trim();
  if (!content) {
    contentEl.classList.add('border-red-400', 'ring-4', 'ring-red-100');
    toast('请输入内容', 'warn');
    return;
  }
  contentEl.classList.remove('border-red-400', 'ring-4', 'ring-red-100');
  const title = document.getElementById('journal-modal-title-input').value.trim() || null,
    date = document.getElementById('journal-modal-date').value;
  if (journalEditId) {
    const e = journalEntries.find(x => x.id === journalEditId);
    if (!e) return;
    e.title = title; e.content = content; e.date = date;
    e.mood = journalMood; e.customMood = journalMood === 'custom' ? journalCustomMood.trim() : null;
    e.paper = journalPaper; e.updatedAt = Date.now();
    svJournal(journalEntries); toast('想法已更新', 'info');
  } else {
    journalEntries.push({
      id: Date.now(), title, content, date,
      mood: journalMood, customMood: journalMood === 'custom' ? journalCustomMood.trim() : null,
      paper: journalPaper,
      createdAt: Date.now(), updatedAt: Date.now()
    });
    svJournal(journalEntries); toast('新想法已记录！', 'info');
  }
  closeJournalModal();
  renderJournal();
}

function delJournalEntry(id) {
  if (!confirm('确定删除这条想法吗？')) return;
  journalEntries = journalEntries.filter(e => e.id !== id);
  svJournal(journalEntries);
  renderJournal();
  toast('已删除', 'info');
}

/* ============================================================
   Render — Journal (Timeline Layout)
   ============================================================ */
let journalExpandedCards = new Set();
function toggleJournalCard(id) {
  if (journalExpandedCards.has(id)) {
    journalExpandedCards.delete(id);
  } else {
    journalExpandedCards.add(id);
  }
  // Re-render just this card's content
  const cardEl = document.querySelector(`.timeline-card[data-id="${id}"]`);
  if (!cardEl) return;
  const entry = journalEntries.find(e => e.id === id);
  if (!entry) return;
  const contentEl = cardEl.querySelector('.timeline-card-content');
  const hintEl = cardEl.querySelector('.timeline-card-hint');
  if (contentEl) {
    if (journalExpandedCards.has(id)) {
      contentEl.classList.remove('line-clamp-2');
    } else {
      contentEl.classList.add('line-clamp-2');
    }
  }
  if (hintEl) {
    if (entry.content.length > 80) {
      hintEl.textContent = journalExpandedCards.has(id) ? '点击收起' : '点击展开全文';
      hintEl.style.display = '';
    }
  }
}

function formatMonthLabel(ym) {
  const [y, m] = ym.split('-');
  return `${y}年${parseInt(m, 10)}月`;
}

function formatDateWeekday(ds) {
  const d = new Date(ds);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd} ${weekdays[d.getDay()]}`;
}

function renderJournal() {
  const list = document.getElementById('journal-list'),
    empty = document.getElementById('journal-empty');

  // Remove old timeline body for clean rebuild
  const oldBody = list.querySelector('.journal-timeline-body');
  if (oldBody) oldBody.remove();
  list.querySelectorAll('.journal-card, .journal-month-section').forEach(el => el.remove());

  if (!journalEntries.length) {
    empty.style.display = '';
    var jEmptyPen = document.getElementById('journal-empty-pen');
    if (jEmptyPen) { jEmptyPen.innerHTML = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="75" r="3" fill="var(--accent-400)" opacity="0.25"/><circle cx="68" cy="80" r="2" fill="var(--accent-400)" opacity="0.2"/><circle cx="25" cy="85" r="1.5" fill="var(--accent-400)" opacity="0.15"/><path d="M36 12 L40 75 Q40 79 44 81 L56 81 Q60 79 60 75 L64 12 Z" fill="var(--accent-500)" opacity="0.9"/><path d="M42 18 L44 73 Q44 78 47 80 L50 80 Q48 78 48 73 L46 18 Z" fill="rgba(255,255,255,0.22)"/><rect x="38" y="20" width="24" height="4" rx="1.5" fill="#D4AF37" opacity="0.82"/><rect x="39" y="68" width="22" height="3" rx="1" fill="#D4AF37" opacity="0.72"/><path d="M40 81 L50 97 L60 81 Z" fill="#D4AF37" opacity="0.9"/><line x1="50" y1="81" x2="50" y2="94" stroke="var(--accent-700)" stroke-width="0.8" opacity="0.55"/><circle cx="50" cy="84" r="1.5" fill="var(--accent-700)" opacity="0.3"/><ellipse cx="50" cy="96" rx="3" ry="4" fill="var(--accent-600)" opacity="0.65"/><path d="M56 16 L64 14 L64 48" fill="none" stroke="var(--accent-700)" stroke-width="2.2" stroke-linecap="round" opacity="0.45"/></svg>'; }
    return;
  }

  empty.style.display = 'none';

  // Group by month, sorted descending
  const sorted = [...journalEntries].sort((a, b) => b.createdAt - a.createdAt);
  const monthGroups = new Map();
  sorted.forEach(e => {
    const ym = e.date.slice(0, 7);
    if (!monthGroups.has(ym)) monthGroups.set(ym, []);
    monthGroups.get(ym).push(e);
  });

  const months = Array.from(monthGroups.keys()).sort().reverse();

  // Build continuous timeline — all months in one scroll
  let html = '<div class="journal-timeline-body">';
  html += '<div class="relative pl-8">';
  html += '<div class="absolute left-[19px] top-2 bottom-2 w-px bg-gray-200"></div>';

  months.forEach((ym, monthIdx) => {
    const monthEntries = monthGroups.get(ym) || [];
    const isLastMonth = monthIdx === months.length - 1;

    // Month header
    html += '<div class="mb-1 pt-1' + (monthIdx > 0 ? ' mt-5' : '') + '">';
    html += '<div class="relative">';
    html += '<span class="text-[11px] font-bold text-gray-500 tracking-widest bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200 font-boba">';
    html += formatMonthLabel(ym) + ' · ' + monthEntries.length + '条</span>';
    html += '</div></div>';

    // Month entries
    monthEntries.forEach((e, idx) => {
    const mood = MOODS.find(m => m.key === e.mood);
    const isCustom = e.mood === 'custom';
    const moodDisplay = isCustom
      ? `<span class="text-xs text-gray-500 font-medium bg-gray-50/60 px-2 py-0.5 rounded-full font-boba">${esc(e.customMood || '自定义')}</span>`
      : `<span class="text-base leading-none" title="${(mood || MOODS[0]).label}">${(mood || MOODS[0]).emoji}</span>`;
    const isExpanded = journalExpandedCards.has(e.id);
    const contentLong = e.content.length > 80;
    const paperClass = e.paper ? ` paper-${e.paper}` : '';

    html += `<div class="relative pb-3 last:pb-1">`;
    // Timeline dot
    html += `<div class="absolute left-[-19px] top-5 w-2.5 h-2.5 rounded-full border-2 z-10 ${idx === 0 ? 'bg-accent-500 border-accent-500' : 'bg-white border-gray-300'}"></div>`;
    // Connector line
    html += `<div class="absolute left-[-19px] top-[22px] w-[19px] h-px bg-gray-200"></div>`;

    // Card with paper texture class
    html += `<div class="timeline-card journal-card bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_2px_12px_rgba(212,104,122,0.02)] p-4 group hover:shadow-md hover:border-white/70 transition-all duration-300${paperClass}" data-id="${e.id}" onclick="toggleJournalCard(${e.id})">`;

    // Header row: date + title
    html += `<div class="flex items-center gap-2.5 mb-2">`;
    html += `<span class="text-xs text-gray-400 font-medium whitespace-nowrap font-boba">${formatDateWeekday(e.date)}</span>`;
    if (e.title) {
      html += `<h3 class="font-bold text-gray-800 text-sm tracking-wide truncate flex-1 font-boba">${esc(e.title)}</h3>`;
    } else {
      html += `<span class="text-xs text-gray-300 italic flex-1 font-boba">无标题</span>`;
    }
    // Edit / Delete buttons
    html += `<div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">`;
    html += `<button class="p-1 rounded-lg text-gray-400 hover:text-accent-500 transition-colors cursor-pointer border-none bg-transparent" onclick="event.stopPropagation();editJournalEntry(${e.id})" title="编辑"><svg class="w-3.5 h-3.5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pencil body -->
      <path d="M28 85 L34 20 Q35 14 38 12 L62 12 Q65 14 66 20 L72 85 Z" fill="var(--accent-100)" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- Pencil body highlight -->
      <path d="M36 25 L38 80 Q38 82 40 83 L42 83 Q41 82 40 80 L38 25 Z" fill="rgba(255,255,255,0.5)"/>
      <!-- Colored band -->
      <rect x="31" y="78" width="38" height="5" rx="2" fill="var(--accent-500)" opacity="0.7"/>
      <!-- Wood cone (sharpened part) -->
      <path d="M35 12 L38 2 Q38 0 41 0 L59 0 Q62 0 62 2 L65 12 Z" fill="#E8C88A" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- Graphite tip -->
      <path d="M41 0 L50 10 L59 0 Z" fill="#4A4A4A"/>
      <!-- Graphite point -->
      <circle cx="50" cy="10" r="1.2" fill="#4A4A4A"/>
    </svg></button>`;
    html += `<button class="p-1 rounded-lg text-gray-400 hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent" onclick="event.stopPropagation();delJournalEntry(${e.id})" title="删除"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-.867 12.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.995-1.858L5 6h14z"/></svg></button>`;
    html += `</div></div>`;

    // Content
    html += `<div class="timeline-card-content text-sm text-gray-600 font-boba leading-relaxed whitespace-pre-wrap${isExpanded ? '' : ' line-clamp-2'}">${esc(e.content)}</div>`;

    // Bottom row: expand hint (left) + mood (right)
    html += `<div class="flex items-end justify-between mt-2">`;
    html += `<div>`;
    if (contentLong) {
      html += `<span class="timeline-card-hint text-[10px] text-gray-400 font-boba">${isExpanded ? '点击收起' : '点击展开全文'}</span>`;
    }
    html += `</div>`;
    html += moodDisplay;
    html += `</div>`;

    html += `</div></div>`;
  }); // close monthEntries.forEach
  }); // close months.forEach

  html += '</div>'; // close relative pl-8
  html += '</div>'; // close journal-timeline-body

  list.insertAdjacentHTML('beforeend', html);
}
