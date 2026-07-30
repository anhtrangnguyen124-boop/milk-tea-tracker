// tracker.js — reference copy from index.html

/* ============================================================
   Tab Switching
   ============================================================ */
let currentTab = 'tracker';

function switchTab(tab) {
  if (tab === currentTab) return;
  currentTab = tab;
  // Toggle pages
  document.getElementById('page-tracker').classList.toggle('hidden', tab !== 'tracker');
  document.getElementById('page-journal').classList.toggle('hidden', tab !== 'journal');
  document.getElementById('page-job').classList.toggle('hidden', tab !== 'job');
  // Toggle tab buttons — text-only underline style
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.dataset.tab === tab) {
      b.style.color = 'var(--accent-500)';
      b.style.borderColor = 'var(--accent-500)';
    } else {
      b.style.color = '#B5A59A';
      b.style.borderColor = 'transparent';
    }
  });
  // Render journal if switching to it
  if (tab === 'journal') renderJournal();
  // Render job tracker if switching to it
  if (tab === 'job') renderJobAll();
}

/* ============================================================
   Drink Icons — Realistic Cup SVG System
   ============================================================ */
// Detect drink type from name keywords -> fallback to hash
function detectDrinkType(name) {
  var n = (name || '').toLowerCase();
  if (/抹茶|绿茶|青沫|抹|茶绿|煎茶|宇治|茉莉/.test(n)) return 'matcha';
  if (/芒果|橙|橘|柚|百香|葡萄|西柚|金橘|杨枝|甘露/.test(n)) return 'mango_fruit_tea';
  if (/草莓|莓|莓果|粉荔|樱花|桃桃|蜜桃|水蜜桃/.test(n)) return 'strawberry_milk';
  if (/咖啡|鸳鸯|拿铁|美式|摩卡|冷萃|浓缩|可可|朱古力/.test(n)) return 'coffee';
  if (/柠檬|青柠|清爽|茶王|清茶|四季|春茶|乌龙|铁观音|普洱|红茶|绿茶/.test(n)) return 'citrus_tea';
  // Hash fallback for consistent per-name mapping
  var h = 0;
  for (var i = 0; i < name.length; i++) { h = ((h << 5) - h) + name.charCodeAt(i); h |= 0; }
  var types = ['classic_milk_tea', 'matcha', 'mango_fruit_tea', 'strawberry_milk', 'coffee', 'citrus_tea'];
  return types[Math.abs(h) % types.length];
}

// Unified realistic drink icon SVG generator
// Returns an inline SVG string with viewBox 0 0 100 100
// Pass the full entry object (optional) for toppings/ice detection
function getDrinkIcon(name, entry) {
  var type = detectDrinkType(name || '');
  var e = entry || {};

  // Feature detection from entry fields
  var hasPearls = (e.toppings && e.toppings.indexOf('珍珠') >= 0) || type === 'classic_milk_tea';
  var hasIce = (e.ice && e.ice !== '热') || false;
  if (!e.ice && (type === 'matcha' || type === 'mango_fruit_tea' || type === 'coffee' || type === 'citrus_tea')) hasIce = true;
  var hasMilkCap = (e.toppings && e.toppings.indexOf('奶盖') >= 0) || type === 'strawberry_milk';

  var colors = {
    classic_milk_tea: { liquid: '#C8956A', liquid2: '#D4A57A', lid: '#F5F0E8' },
    matcha:           { liquid: '#8B9E6B', liquid2: '#9BB27B', lid: '#F2F6EC' },
    mango_fruit_tea:  { liquid: '#F0A830', liquid2: '#F5B840', lid: '#FFF8F0' },
    strawberry_milk:  { liquid: '#F0A0B8', liquid2: '#F5B5C8', lid: '#FFF2F6' },
    coffee:           { liquid: '#7B5230', liquid2: '#8B6240', lid: '#F5F0E8' },
    citrus_tea:       { liquid: '#C5D888', liquid2: '#D8E8A0', lid: '#F8FFF0' },
  };
  var c = colors[type];

  var s = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';

  // Straw behind cup
  s += '<line x1="64" y1="12" x2="62" y2="34" stroke="rgba(130,115,100,0.35)" stroke-width="2.2" stroke-linecap="round"/>';

  // Cup body — semi-transparent plastic
  s += '<path d="M23 35 L27.5 90 Q27.5 93 31 93 L69 93 Q72.5 93 72.5 90 L77 35 Z" fill="rgba(255,255,255,0.28)"/>';

  // Liquid fill
  var lTop = hasMilkCap ? 58 : 53;
  s += '<path d="M' + (24.2) + ' ' + lTop + ' L28 90 Q28 92.5 31 92.5 L69 92.5 Q72 92.5 72 90 L' + (75.8) + ' ' + lTop + ' Z" fill="' + c.liquid + '" opacity="0.88"/>';
  s += '<path d="M' + (24.2) + ' ' + lTop + ' L28 90 Q28 92.5 31 92.5 L69 92.5 Q72 92.5 72 90 L' + (75.8) + ' ' + lTop + ' Z" fill="' + c.liquid2 + '" opacity="0.35"/>';

  // Ice cubes
  if (hasIce) {
    s += '<rect x="34" y="60" width="9" height="8" rx="2.5" fill="rgba(255,255,255,0.72)" stroke="rgba(180,205,230,0.5)" stroke-width="0.7"/>';
    s += '<rect x="55" y="65" width="9" height="8" rx="2.5" fill="rgba(255,255,255,0.65)" stroke="rgba(180,205,230,0.45)" stroke-width="0.7"/>';
    s += '<rect x="44" y="76" width="8" height="7" rx="2.5" fill="rgba(255,255,255,0.58)" stroke="rgba(180,205,230,0.4)" stroke-width="0.6"/>';
  }

  // Boba pearls
  if (hasPearls) {
    s += '<circle cx="37" cy="85" r="3.2" fill="#3D2B1F" opacity="0.82"/>';
    s += '<circle cx="49" cy="87" r="3.2" fill="#3D2B1F" opacity="0.78"/>';
    s += '<circle cx="44" cy="82" r="2.8" fill="#3D2B1F" opacity="0.72"/>';
    s += '<circle cx="59" cy="85" r="3.2" fill="#3D2B1F" opacity="0.82"/>';
    s += '<circle cx="63" cy="81" r="2.8" fill="#3D2B1F" opacity="0.7"/>';
    s += '<circle cx="54" cy="83" r="2.8" fill="#3D2B1F" opacity="0.68"/>';
  }

  // Lemon slice (citrus_tea)
  if (type === 'citrus_tea') {
    s += '<circle cx="48" cy="70" r="7" fill="#FFFAC0" stroke="#E0C040" stroke-width="0.9" opacity="0.92"/>';
    s += '<circle cx="48" cy="70" r="4.5" fill="none" stroke="#E0C040" stroke-width="0.5" opacity="0.5"/>';
    for (var si = 0; si < 6; si++) {
      var ang = si * Math.PI / 3;
      s += '<line x1="48" y1="70" x2="' + (48+4.5*Math.cos(ang)).toFixed(1) + '" y2="' + (70+4.5*Math.sin(ang)).toFixed(1) + '" stroke="#E0C040" stroke-width="0.5" opacity="0.45"/>';
    }
  }

  // Fruit pieces (mango_fruit_tea)
  if (type === 'mango_fruit_tea') {
    s += '<rect x="35" y="66" width="5.5" height="4.5" rx="1.8" fill="#F8C050" opacity="0.88"/>';
    s += '<rect x="57" y="70" width="5" height="4" rx="1.5" fill="#F8C050" opacity="0.82"/>';
    s += '<rect x="48" y="78" width="4.5" height="4" rx="1.5" fill="#F0A830" opacity="0.78"/>';
    s += '<rect x="61" y="80" width="4" height="3.5" rx="1.5" fill="#F8C050" opacity="0.72"/>';
  }

  // Milk cap foam layer
  if (hasMilkCap) {
    s += '<path d="M23.5 55 Q23.5 48 50 48 Q76.5 48 76.5 55 L76.5 61 Q76.5 67 50 67 Q23.5 67 23.5 61 Z" fill="#FFF8F5" opacity="0.88"/>';
    s += '<ellipse cx="50" cy="51" rx="25" ry="4.5" fill="#FFFDFA" opacity="0.72"/>';
    // Foam bubbles
    s += '<circle cx="38" cy="54" r="1.5" fill="rgba(255,255,255,0.55)"/>';
    s += '<circle cx="55" cy="56" r="1.8" fill="rgba(255,255,255,0.5)"/>';
    s += '<circle cx="62" cy="53" r="1.2" fill="rgba(255,255,255,0.5)"/>';
  }

  // Cup outline (glass stroke)
  s += '<path d="M23 35 L27.5 90 Q27.5 93 31 93 L69 93 Q72.5 93 72.5 90 L77 35 Z" fill="none" stroke="rgba(130,110,100,0.32)" stroke-width="1.6" stroke-linejoin="round"/>';

  // Lid
  s += '<ellipse cx="50" cy="35" rx="27" ry="5.5" fill="' + c.lid + '" stroke="rgba(130,110,100,0.32)" stroke-width="1.6"/>';
  s += '<rect x="23" y="31" width="54" height="8" rx="3.5" fill="' + c.lid + '" stroke="rgba(130,110,100,0.32)" stroke-width="1.6"/>';

  // Straw front
  s += '<line x1="64" y1="12" x2="62" y2="34" stroke="rgba(130,115,100,0.32)" stroke-width="1.8" stroke-linecap="round"/>';
  s += '<line x1="64" y1="12" x2="62" y2="34" stroke="rgba(255,255,255,0.42)" stroke-width="0.7" stroke-linecap="round"/>';

  s += '</svg>';
  return s;
}

// Legacy compatibility — returns SVG string directly
function pickIcon(n) { return getDrinkIcon(n); }
const THEMES = ['orange', 'peach', 'matcha', 'taro', 'sea'];
const TCOLORS = { orange: '#D4687A', peach: '#E8A0A0', matcha: '#8FB88F', taro: '#C0B0E0', sea: '#90C0D8' };
function randTheme() { return THEMES[Math.floor(Math.random() * THEMES.length)]; }

/* ============================================================
   Daily Quote
   ============================================================ */
const QUOTES = [
  { text: '今日宜：加份波霸，快乐爆炸', emoji: '💥' },
  { text: '生活苦短，全糖加满', emoji: '🍬' },
  { text: '奶茶一杯，快乐起飞', emoji: '✨' },
  { text: '喝完这杯，我就是最甜的崽', emoji: '🧋' },
  { text: '三分糖刚好，七分甜也妙', emoji: '🌸' },
  { text: '今天也是被奶茶治愈的一天', emoji: '💕' },
  { text: '奶茶在手，天下我有', emoji: '👑' },
  { text: '好喝到冒泡泡', emoji: '🫧' },
  { text: '没有一杯奶茶解决不了的烦恼', emoji: '🍵' },
  { text: '如果有，那就两杯', emoji: '☕' },
  { text: '今日份的甜，奶茶来承包', emoji: '🧁' },
  { text: '吸一口珍珠，嚼一口快乐', emoji: '😋' },
  { text: '奶茶是成年人的奶嘴', emoji: '👶' },
  { text: '糖分即正义', emoji: '⚡' },
  { text: '这杯敬自由，那杯敬明天', emoji: '🥂' },
  { text: '减肥是明天的事', emoji: '🤫' },
  { text: '奶茶配电影，快乐加倍', emoji: '🎬' },
  { text: '一口下去，烦恼清零', emoji: '🔄' },
  { text: '我的血液里流的是奶茶', emoji: '🩸' },
  { text: '喝奶茶不需要理由', emoji: '🤷' },
  { text: '奶茶是疲惫生活里的温柔', emoji: '🌙' },
  { text: '喝完继续搬砖', emoji: '🧱' },
  { text: '波霸波霸，啵啵啵', emoji: '💋' },
  { text: '奶盖是奶茶的灵魂', emoji: '👻' },
  { text: '一杯敬朝阳，一杯敬月光', emoji: '🌅' },
  { text: '甜度刚好，心情刚好', emoji: '🎯' },
  { text: '奶茶是快乐水，不接受反驳', emoji: '🥤' },
  { text: '与其庸人自扰，不如奶茶喝饱', emoji: '🧘' },
  { text: '今日糖分已充值', emoji: '🔋' },
  { text: '喝杯奶茶压压惊', emoji: '😌' },
  { text: '世上无难事，只要有奶茶', emoji: '🏔️' },
  { text: '奶茶是社交的润滑剂', emoji: '🤝' },
  { text: '一杯奶茶的时间，治愈整个世界', emoji: '⏳' },
  { text: '今日奶茶KPI：已完成', emoji: '✅' },
  { text: '没有什么比奶茶更懂我', emoji: '🎈' },
  { text: '喝奶茶的女生运气不会太差', emoji: '🍀' },
  { text: '甜蜜的负担，我愿意', emoji: '💝' },
  { text: '奶茶是对自己最好的犒劳', emoji: '🏆' },
  { text: '每一口都是幸福的味道', emoji: '😊' },
  { text: '快乐就是奶茶加冰', emoji: '🧊' },
];
let quoteIdx = Math.floor(Date.now() / 86400000) % QUOTES.length;
function nextQuote() { quoteIdx = (quoteIdx + 1) % QUOTES.length; updateQuote(); }
function updateQuote() {
  const q = QUOTES[quoteIdx];
  document.getElementById('quote-text').textContent = q.text;
}
updateQuote();

/* ============================================================
   Pill Selectors (sweetness / ice / repurchase)
   ============================================================ */
function selectPill(el, group) {
  var container = document.getElementById('modal-' + group);
  container.querySelectorAll('.pill-option').forEach(function(p) { p.classList.remove('selected'); });
  el.classList.add('selected');
  if (group === 'sweetness') modalSweetness = el.dataset.val;
  else if (group === 'ice') modalIce = el.dataset.val;
  else if (group === 'repurchase') modalRepurchase = el.dataset.val;
}
function toggleTopping(el) {
  el.classList.toggle('selected');
  var val = el.dataset.val;
  var idx = modalToppings.indexOf(val);
  if (idx >= 0) modalToppings.splice(idx, 1);
  else modalToppings.push(val);
}
function resetPillGroup(groupId) {
  var el = document.getElementById(groupId);
  if (!el) return;
  el.querySelectorAll('.pill-option').forEach(function(p) { p.classList.remove('selected'); });
}
function setPillGroup(groupId, val) {
  resetPillGroup(groupId);
  if (!val) return;
  var el = document.getElementById(groupId);
  if (!el) return;
  var target = el.querySelector('.pill-option[data-val="' + val + '"]');
  if (target) target.classList.add('selected');
}
function setToppingPills(vals) {
  resetPillGroup('modal-toppings');
  if (!vals || !vals.length) return;
  var el = document.getElementById('modal-toppings');
  if (!el) return;
  vals.forEach(function(v) {
    var target = el.querySelector('.pill-option[data-val="' + v + '"]');
    if (target) target.classList.add('selected');
  });
}

/* ============================================================
   Image Upload
   ============================================================ */
const upZ = document.getElementById('upload-zone'),
  upI = document.getElementById('upload-input'),
  tL = document.getElementById('thumb-preview-list');
upZ.addEventListener('dragover', e => { e.preventDefault(); upZ.classList.add('border-accent-500', 'bg-accent-50'); });
upZ.addEventListener('dragleave', () => { upZ.classList.remove('border-accent-500', 'bg-accent-50'); });
upZ.addEventListener('drop', e => { e.preventDefault(); upZ.classList.remove('border-accent-500', 'bg-accent-50'); handleFiles(e.dataTransfer.files); });
function handleFiles(files) {
  if (!files || !files.length) return;
  var ok = ['image/jpeg', 'image/png', 'image/webp'];
  for (var fi = 0; fi < files.length; fi++) {
    var f = files[fi];
    if (pendingImgs.length + pendingUploads >= 9) { toast('最多9张', 'warn'); break; }
    if (ok.indexOf(f.type) === -1) { toast('不支持 ' + f.type, 'warn'); continue; }
    if (f.size > 20 * 1024 * 1024) { toast('单图≤20MB', 'warn'); continue; }
    pendingUploads++;
    pendingImgs.push({ dataUrl: null, uploading: true });
    renderThumbs();
    var idx = pendingImgs.length - 1;
    var reader = new FileReader();
    reader.onload = function(e) {
      // Canvas 压缩：最大 1200px，JPEG 0.7 品质
      compressImage(e.target.result, 1200, 0.7, function(compressed) {
        pendingImgs[idx] = { dataUrl: compressed };
        pendingUploads--;
        renderThumbs();
      }, function() {
        // 压缩失败，回退到原始 dataUrl（适用于小图/GIF）
        pendingImgs[idx] = { dataUrl: e.target.result };
        pendingUploads--;
        renderThumbs();
      });
    };
    reader.onerror = function() {
      pendingImgs.splice(idx, 1);
      pendingUploads--;
      renderThumbs();
      toast('图片读取失败', 'warn');
    };
    reader.readAsDataURL(f);
  }
  upI.value = '';
}

/* Canvas 图片压缩 */
function compressImage(dataUrl, maxSize, quality, onSuccess, onFallback) {
  var img = new Image();
  img.onload = function() {
    var w = img.width, h = img.height;
    if (w <= maxSize && h <= maxSize) {
      // 尺寸已足够小，直接回退（不压缩）
      onFallback();
      return;
    }
    // 等比缩放
    if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
    else       { w = Math.round(w * maxSize / h); h = maxSize; }
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    try {
      var compressed = canvas.toDataURL('image/jpeg', quality);
      onSuccess(compressed);
    } catch (e) {
      onFallback();
    }
  };
  img.onerror = function() { onFallback(); };
  img.src = dataUrl;
}
function renderThumbs() {
  tL.innerHTML = pendingImgs.map((x, i) => {
    if (x.uploading) {
      return `<div class="relative w-[62px] h-[62px] rounded-lg overflow-hidden border border-dashed border-accent-400 bg-accent-50 flex items-center justify-center"><div class="w-5 h-5 border-2 border-accent-400 border-t-transparent rounded-full animate-spin"></div></div>`;
    }
    return `<div class="relative w-[62px] h-[62px] rounded-lg overflow-hidden border border-gray-200"><img src="${x.dataUrl}" class="w-full h-full object-cover"><button class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 border-none text-white text-[10px] cursor-pointer flex items-center justify-center" onclick="removeImg(${i})">✕</button></div>`;
  }).join('');
}
function removeImg(i) {
  if (pendingImgs[i] && pendingImgs[i].uploading) pendingUploads--;
  pendingImgs.splice(i, 1);
  renderThumbs();
}

/* ============================================================
   Modal — Milk Tea
   ============================================================ */
function selectTheme(t, el) {
  modalTheme = t;
  document.querySelectorAll('#theme-selector .tdot').forEach(d => {
    d.classList.remove('selected');
    d.style.borderColor = 'transparent';
    d.style.boxShadow = 'none';
  });
  el.classList.add('selected');
  el.style.borderColor = 'var(--accent-500)';
  el.style.boxShadow = '0 0 0 5px rgba(var(--shadow-rgb),0.12)';
}
function renderStars(v) {
  modalR = v;
  document.getElementById('modal-stars').innerHTML = [1, 2, 3, 4, 5].map(s =>
    `<button class="bg-none border-none cursor-pointer text-3xl p-0.5 transition-all duration-200 ${s <= v ? 'text-accent-500' : 'text-gray-300'} hover:text-accent-500 hover:scale-110 active:scale-90" onclick="setRating(${s})">★</button>`
  ).join('');
}
function setRating(v) { modalR = v; renderStars(v); }
function openModal() {
  const today = localDateStr();
  if (selDate !== today) { toast('只能为今天添加记录哦 ~', 'warn'); return; }
  editId = null; modalTheme = 'orange'; modalR = 0; pendingImgs = []; pendingUploads = 0;
  modalSweetness = ''; modalIce = ''; modalToppings = []; modalRepurchase = '';
  document.getElementById('modal-title').textContent = '添加奶茶记录';
  ['modal-name', 'modal-brand', 'modal-comment'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('modal-price').value = '';
  document.getElementById('modal-date').value = selDate;
  document.getElementById('modal-name').classList.remove('border-red-400', 'ring-4', 'ring-red-100');
  document.getElementById('modal-save-text').textContent = '添加记录';
  resetPillGroup('modal-sweetness'); resetPillGroup('modal-ice');
  resetPillGroup('modal-toppings'); resetPillGroup('modal-repurchase');
  document.querySelectorAll('#theme-selector .tdot').forEach(d => {
    d.classList.remove('selected');
    d.style.borderColor = 'transparent';
    d.style.boxShadow = 'none';
  });
  const firstDot = document.querySelector('#theme-selector .tdot[data-theme="orange"]');
  if (firstDot) { firstDot.classList.add('selected'); firstDot.style.borderColor = 'var(--accent-500)'; firstDot.style.boxShadow = '0 0 0 5px rgba(var(--shadow-rgb),0.12)'; }
  renderStars(0); renderThumbs();
  document.getElementById('modal-overlay').classList.add('flex');
  document.getElementById('modal-overlay').classList.remove('hidden');
  console.log('[MODAL] 打开新增 Modal');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-overlay').classList.remove('flex');
  editId = null;
}
function editEntry(id) {
  // 类型安全：确保 id 是数字进行比较
  const numId = Number(id);
  if (Number.isNaN(numId)) { console.error('[EDIT] 无效 id:', id); return; }
  const e = entries.find(x => x.id === numId);
  if (!e) { console.warn('[EDIT] 未找到记录, id:', numId); return; }
  console.log('[EDIT] 打开编辑 Modal, entry:', e.name, 'id:', numId);
  editId = numId; modalR = e.rating || 0; modalTheme = e.theme || 'orange';
  modalSweetness = e.sweetness || ''; modalIce = e.ice || '';
  modalToppings = (e.toppings || []).slice(); modalRepurchase = e.repurchase || '';
  pendingImgs = (e.images || []).map(d => ({ dataUrl: d })); pendingUploads = 0;
  document.getElementById('modal-title').textContent = '编辑奶茶记录';
  document.getElementById('modal-name').value = e.name;
  document.getElementById('modal-brand').value = e.brand || '';
  document.getElementById('modal-date').value = e.date;
  document.getElementById('modal-comment').value = e.comment || '';
  document.getElementById('modal-price').value = e.price !== null && e.price !== undefined ? e.price : '';
  document.getElementById('modal-name').classList.remove('border-red-400', 'ring-4', 'ring-red-100');
  document.getElementById('modal-save-text').textContent = '保存修改';
  setPillGroup('modal-sweetness', modalSweetness);
  setPillGroup('modal-ice', modalIce);
  setToppingPills(modalToppings);
  setPillGroup('modal-repurchase', modalRepurchase);
  document.querySelectorAll('#theme-selector .tdot').forEach(d => {
    d.classList.remove('selected');
    d.style.borderColor = 'transparent';
    d.style.boxShadow = 'none';
  });
  const dot = document.querySelector(`#theme-selector .tdot[data-theme="${modalTheme}"]`);
  if (dot) { dot.classList.add('selected'); dot.style.borderColor = 'var(--accent-500)'; dot.style.boxShadow = '0 0 0 5px rgba(var(--shadow-rgb),0.12)'; }
  renderStars(modalR); renderThumbs();
  document.getElementById('modal-overlay').classList.add('flex');
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function saveEntry() {
  const nm = document.getElementById('modal-name'), name = nm.value.trim();
  if (!name) {
    nm.classList.add('border-red-400', 'ring-4', 'ring-red-100');
    toast('请输入奶茶名称', 'warn');
    return;
  }
  nm.classList.remove('border-red-400', 'ring-4', 'ring-red-100');
  const brand = document.getElementById('modal-brand').value.trim() || null,
    date = document.getElementById('modal-date').value,
    priceVal = document.getElementById('modal-price').value,
    price = priceVal !== '' ? +priceVal : null,
    comment = document.getElementById('modal-comment').value.trim() || null,
    // 只收集已完成上传的图片（dataUrl 不为 null），正在上传的自动跳过
    images = pendingImgs.map(function(i) { return i.dataUrl; }).filter(function(url) { return url != null; });
  if (!THEMES.includes(modalTheme)) modalTheme = randTheme();
  if (editId) {
    const numId = Number(editId);
    const e = entries.find(x => x.id === numId);
    if (!e) { console.error('[SAVE] 未找到待编辑记录, editId:', editId); return; }
    e.name = name; e.brand = brand; e.date = date; e.price = price; e.rating = modalR || null;
    e.comment = comment; e.theme = modalTheme; e.images = images; e.updatedAt = Date.now();
    e.sweetness = modalSweetness || null; e.ice = modalIce || null;
    e.toppings = modalToppings.length ? modalToppings.slice() : null;
    e.repurchase = modalRepurchase || null;
    sv(entries); toast('记录已更新', 'info');
    console.log('[SAVE] 已更新记录:', e.name, 'id:', e.id);
  } else {
    entries.push({
      id: Date.now(), name, brand, date, price, rating: modalR || null,
      comment, theme: modalTheme, images, isPinned: false,
      sweetness: modalSweetness || null, ice: modalIce || null,
      toppings: modalToppings.length ? modalToppings.slice() : null,
      repurchase: modalRepurchase || null,
      createdAt: Date.now(), updatedAt: Date.now()
    });
    sv(entries); toast('新奶茶记录已添加！', 'info');
    console.log('[SAVE] 已新增记录:', name);
  }
  selDate = date; closeModal(); renderAll(); editId = null;
  document.getElementById('modal-save-text').textContent = '添加记录';
}

/* ============================================================
   Render — Milk Tea
   ============================================================ */
function renderAll() { renderCal(); renderEntries(); renderYesterday(); renderPinned(); renderStats(); renderMonthlyReview(); }

/* ============================================================
   3D Tilt Card — vanilla JS mouse-tracking
   ============================================================ */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    // Skip if already initialized
    if (card.dataset.tiltReady) return;
    card.dataset.tiltReady = '1';

    const inner = card.querySelector('.tilt-card-inner');
    const glow = card.querySelector('.tilt-card-glow');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      const rotateX = ((y - h / 2) / (h / 2)) * -2;
      const rotateY = ((x - w / 2) / (w / 2)) * 2;

      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      if (glow) {
        const gx = (x / w) * 100;
        const gy = (y / h) * 100;
        glow.style.background = `radial-gradient(circle 100px at ${gx}% ${gy}%, rgba(var(--shadow-rgb),0.06), transparent 50%)`;
        glow.classList.add('active');
      }
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
      if (glow) glow.classList.remove('active');
    });
  });
}

function renderStats() {
  const now = new Date(), m = now.getMonth(), y = now.getFullYear();
  const me = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const cupCount = me.length;
  const totalSpend = me.reduce((s, e) => s + (e.price || 0), 0);
  const dim = new Date(y, m + 1, 0).getDate();
  const weeks = Math.ceil(dim / 7) || 1;
  const weekAvg = Math.round(totalSpend / weeks);
  document.getElementById('month-total').textContent = cupCount;
  document.getElementById('week-avg').textContent = weekAvg;
  document.getElementById('total-spend').textContent = '¥' + totalSpend;
  // 动态更新柱状图 (scale: cups up to 30, weekAvg up to 300, totalSpend up to 600)
  const h1 = Math.max(2, Math.min(12, Math.round(cupCount / 30 * 12) || 2));
  const h2 = Math.max(2, Math.min(12, Math.round(weekAvg / 300 * 12) || 2));
  const h3 = Math.max(2, Math.min(12, Math.round(totalSpend / 600 * 12) || 2));
  const setBar = (id, h) => { const r = document.getElementById(id); if (r) { r.setAttribute('y', 14 - h); r.setAttribute('height', h); } };
  setBar('chart-bar1', h1);
  setBar('chart-bar2', h2);
  setBar('chart-bar3', h3);
}

function renderMonthlyReview() {
  const now = new Date(), m = now.getMonth(), y = now.getFullYear();
  const me = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const emptyEl = document.getElementById('monthly-review-empty');
  const dataEl = document.getElementById('monthly-review-data');
  if (!me.length) {
    emptyEl.style.display = '';
    dataEl.classList.add('hidden');
    return;
  }
  emptyEl.style.display = 'none';
  dataEl.classList.remove('hidden');

  // Most frequent brand
  const brandCount = {};
  me.forEach(e => { if (e.brand) { const b = e.brand.trim(); if (b) brandCount[b] = (brandCount[b] || 0) + 1; } });
  const topBrand = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0];
  var noData = '暂无';
  document.getElementById('review-brand').textContent = topBrand ? topBrand[0] + ' ' + topBrand[1] + '次' : noData;

  // Highest rated
  const rated = me.filter(e => e.rating && e.rating > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const best = rated[0];
  document.getElementById('review-best').textContent = best ? esc(best.name) + ' ★' + best.rating : noData;

  // Average price
  const priced = me.filter(e => e.price != null && e.price > 0);
  const avgPrice = priced.length ? Math.round(priced.reduce((s, e) => s + (e.price || 0), 0) / priced.length) : null;
  document.getElementById('review-avg-price').textContent = avgPrice != null ? '¥' + avgPrice : noData;

  // Repurchase count
  const repurchaseCount = me.filter(e => e.repurchase === '是').length;
  document.getElementById('review-repurchase').textContent = repurchaseCount > 0 ? repurchaseCount + ' 杯' : noData;

  // Most common sweetness
  const sweetnessCount = {};
  me.forEach(e => { if (e.sweetness) sweetnessCount[e.sweetness] = (sweetnessCount[e.sweetness] || 0) + 1; });
  const topSweetness = Object.entries(sweetnessCount).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('review-sweetness').textContent = topSweetness ? topSweetness[0] + ' ' + topSweetness[1] + '次' : noData;

  // Most common ice
  const iceCount = {};
  me.forEach(e => { if (e.ice) iceCount[e.ice] = (iceCount[e.ice] || 0) + 1; });
  const topIce = Object.entries(iceCount).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('review-ice').textContent = topIce ? topIce[0] + ' ' + topIce[1] + '次' : noData;
}

function renderCal() {
  const c = document.getElementById('calendar'),
    today = localDateStr(),
    fd = new Date(calY, calM, 1),
    ld2 = new Date(calY, calM + 1, 0),
    off = (fd.getDay() + 6) % 7,
    tot = ld2.getDate();
  const byD = {};
  entries.forEach(e => { if (!byD[e.date]) byD[e.date] = []; byD[e.date].push(e); });

  let h = `<div class="flex items-center justify-between mb-0.5 pb-0.5 border-b border-gray-100" style="height:44px">
    <h2 class="text-base sm:text-lg font-bold text-gray-800">${calY}年 ${calM + 1}月</h2>
    <div class="flex items-center gap-1.5">
      <button class="w-6 h-6 rounded-full border border-gray-200 bg-white text-gray-400 cursor-pointer text-sm flex items-center justify-center hover:bg-accent-50 hover:text-accent-500 hover:border-accent-500 active:scale-90 transition-all duration-200" onclick="chM(-1)">‹</button>
      <button class="w-6 h-6 rounded-full border border-gray-200 bg-white text-gray-400 cursor-pointer text-sm flex items-center justify-center hover:bg-accent-50 hover:text-accent-500 hover:border-accent-500 active:scale-90 transition-all duration-200" onclick="chM(1)">›</button>
    </div>
  </div>`;

  h += `<div class="grid grid-cols-7 mb-0.5">${['一', '二', '三', '四', '五', '六', '日'].map(d => `<div class="text-center text-[11px] font-semibold text-gray-400 py-0.5" style="height:28px;line-height:28px">${d}</div>`).join('')}</div>`;
  h += `<div class="grid grid-cols-7 gap-0.5">`;

  for (let i = 0; i < off; i++) h += `<div class="flex flex-col items-center justify-center rounded-xl text-gray-300 opacity-15" style="height:52px"></div>`;

  for (let d = 1; d <= tot; d++) {
    const ds = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      de = byD[ds],
      hasRecords = de && de.length;
    let cls = 'flex flex-col items-center justify-center rounded-xl border-2 cursor-pointer transition-all duration-200 font-medium relative';
    var cellStyle = ' style="height:52px"';
    if (ds === selDate) {
      cls += ' border-accent-400 bg-accent-50/70 text-accent-700 shadow-[0_2px_8px_rgba(var(--shadow-rgb),0.10)]';
    } else if (hasRecords) {
      cls += ' border-accent-300 bg-accent-50/60 text-accent-700 hover:bg-accent-100 hover:border-accent-400';
    } else {
      cls += ' border-transparent text-gray-700 hover:bg-accent-50 hover:border-accent-300';
    }
    if (ds === today) cls += ' font-bold';
    // 无记录的过去日期：置灰但可点击
    if (!hasRecords && dayDiff(ds) < 0) cls += ' opacity-25';
    // 无记录的未来日期：亮色但可点击

    const isToday = ds === today;
    const isSel = ds === selDate;

    h += `<div class="${cls}"${cellStyle} onclick="selDay('${ds}')">`;
    h += `<span class="text-sm sm:text-base">${d}</span>`;
    if (hasRecords) {
      h += getDrinkIcon(de[0].name, de[0]).replace('<svg', '<svg class="w-4 h-4 mt-0.5"');
    }
    if (isToday && !isSel) h += `<span class="absolute top-0.5 right-0.5 text-[9px] text-accent-500 font-bold">今</span>`;
    h += `</div>`;
  }
  h += `</div>`;
  c.innerHTML = h;
}

function dayDiff(ds) {
  const today = localDateStr();
  return new Date(ds) - new Date(today);
}

function renderEntries() {
  const fl = entries.filter(e => e.date === selDate).sort((a, b) => b.createdAt - a.createdAt),
    ct = document.getElementById('entries-container');
  const [, m, d] = selDate.split('-');
  const today = localDateStr();
  const isToday = selDate === today;
  const isPast = selDate < today;
  // Dynamic label
  document.getElementById('entry-date-label').textContent = isToday ? '今日奶茶' : `${+m}月${+d}日 奶茶记录`;
  document.getElementById('entry-count').textContent = `${fl.length} 杯`;
  // Show/hide add button
  const addBtn = document.getElementById('add-entry-btn');
  if (addBtn) addBtn.style.display = isToday ? '' : 'none';
  // Empty state text
  const emptyDiv = ct.querySelector('.flex.flex-col.items-center');
  const emptyTitle = emptyDiv ? emptyDiv.querySelector('.text-sm.font-bold') : null;
  const emptySub = emptyDiv ? emptyDiv.querySelector('.empty-subtitle') : null;
  if (emptyTitle) {
    if (!isToday && isPast) emptyTitle.textContent = '这天没有奶茶记录 ~';
    else if (!isToday && !isPast) emptyTitle.textContent = '还没到这天呢 ~';
    else emptyTitle.textContent = '今日暂无记录';
  }
  var emptyIcon = document.getElementById('empty-drink-icon');
  if (emptyIcon) { emptyIcon.innerHTML = getDrinkIcon('经典奶茶'); }
  if (emptySub) {
    if (!isToday && isPast) emptySub.textContent = '看看其他日期的记录吧';
    else if (!isToday && !isPast) emptySub.textContent = '等到那天再来记录吧';
    else emptySub.textContent = '点击上方按钮记录今天的第一杯奶茶吧';
  }
  ct.querySelectorAll('.tilt-card').forEach(el => el.remove());
  if (!fl.length) {
    ct.setAttribute('data-empty', 'true');
    if (emptyDiv) emptyDiv.style.display = '';
  } else {
    ct.setAttribute('data-empty', 'false');
    if (emptyDiv) emptyDiv.style.display = 'none';
    fl.forEach(e => {
      const card = document.createElement('div');
      card.className = 'tilt-card mb-2';
      card.innerHTML = cardHTML(e);
      ct.appendChild(card);
    });
    initTiltCards();
  }
}

function cardHTML(e) {
  const drinkSvg = getDrinkIcon(e.name, e);
  const stars = [1, 2, 3, 4, 5].map(s =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 ${s <= (e.rating || 0) ? 'star-filled' : 'star-empty'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  ).join('');
  const imgs = (e.images || []),
    thumbs = imgs.length ? `<div class="flex gap-1.5 flex-wrap mb-1">${imgs.map(u => `<img class="w-[52px] aspect-[4/3] rounded-lg object-cover border border-gray-200 cursor-pointer hover:scale-110 transition-transform duration-200" src="${u}" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>` : '';
  const bh = e.brand ? `<span class="font-semibold text-accent-500">${esc(e.brand)} · </span>` : '',
    ch = e.comment ? `<div class="text-xs text-gray-400 px-3 py-1 rounded-lg bg-gray-50 mt-1">💬 ${esc(e.comment)}</div>` : '';
  // Build attribute tags
  var attrTags = [];
  if (e.sweetness) attrTags.push('<span class="attr-tag bg-pink-50 text-pink-600 border border-pink-100">🍬 ' + esc(e.sweetness) + '</span>');
  if (e.ice) attrTags.push('<span class="attr-tag bg-blue-50 text-blue-600 border border-blue-100">🧊 ' + esc(e.ice) + '</span>');
  if (e.toppings && e.toppings.length) {
    e.toppings.forEach(function(t) { attrTags.push('<span class="attr-tag bg-amber-50 text-amber-600 border border-amber-100">' + esc(t) + '</span>'); });
  }
  if (e.repurchase === '是') attrTags.push('<span class="attr-tag bg-green-50 text-green-600 border border-green-100">想再喝</span>');
  else if (e.repurchase === '否') attrTags.push('<span class="attr-tag bg-gray-50 text-gray-500 border border-gray-200">不回购</span>');
  var tagsHTML = attrTags.length ? '<div class="flex flex-wrap gap-1">' + attrTags.join('') + '</div>' : '';
  const pinIcon = `<svg viewBox="0 0 24 24" fill="${e.isPinned ? '#f59e0b' : 'none'}" stroke="${e.isPinned ? '#f59e0b' : '#9ca3af'}" stroke-width="2" class="w-4 h-4 ${e.isPinned ? 'star-glow' : ''}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const delIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-.867 12.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.995-1.858L5 6h14z"/></svg>`;
  const pinnedStar = e.isPinned ? `<svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" class="w-3 h-3 star-glow flex-shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` : '';
  const isHighlight = (e.rating && e.rating >= 4) || e.repurchase === '是';
  const highlightStyle = isHighlight ? 'border-left:3px solid var(--accent-400);' : '';
  return `<div style="position:relative">
      <!-- ★ v2: 按钮在 tilt 变换范围外，确保可点击 -->
      <div class="absolute top-3 right-3 flex items-center gap-1.5" style="z-index:50">
        <button class="p-1 rounded-lg transition-colors duration-200 hover:bg-amber-50" style="cursor:pointer" onclick="event.stopPropagation();togPin(${e.id})" title="${e.isPinned ? '取消收藏' : '收藏'}">${pinIcon}</button>
        <button class="p-1 rounded-lg transition-colors duration-200 text-gray-400 hover:text-red-400 hover:bg-red-50" style="cursor:pointer" onclick="event.stopPropagation();delEntry(${e.id})" title="删除">${delIcon}</button>
      </div>
      <div class="absolute bottom-3 right-3" style="z-index:50">
        <button class="text-xs text-accent-500 hover:text-accent-700 hover:underline font-boba bg-transparent border-none px-1" style="cursor:pointer" onclick="event.stopPropagation();editEntry(${e.id})">编辑</button>
      </div>
      <div class="tilt-card-inner rounded-2xl">
        <div class="tilt-card-glow rounded-2xl"></div>
        <article class="entry-card tilt-card-content grid grid-cols-[48px_1fr] gap-3 p-3 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_2px_12px_rgba(212,104,122,0.02)] transition-shadow duration-300" style="${highlightStyle}" data-version="2">
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50">${drinkSvg}</div>
          <div class="flex flex-col gap-1 min-w-0">
            ${thumbs}
            <div class="text-sm font-bold text-gray-800 flex items-center gap-1.5">${bh}${esc(e.name)}${pinnedStar}</div>
            <div class="flex items-center gap-2"><div class="flex gap-0.5">${stars}</div>${e.price ? `<span class="text-xs text-gray-400">¥${e.price}</span>` : ''}</div>
            ${tagsHTML}
            ${ch}
            <div class="flex items-center mt-2 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">${fmtDate(e.date)}</span>
            </div>
          </div>
        </article>
      </div>
    </div>`;
}

function renderYesterday() {
  const today = localDateStr();
  const threeDaysAgo = localDateStr(new Date(Date.now() - 3 * 86400000));
  const fl = entries
    .filter(e => e.date >= threeDaysAgo && e.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    ct = document.getElementById('yesterday-container'),
    badge = document.getElementById('yesterday-count');
  badge.textContent = fl.length + ' 杯';
  ct.querySelectorAll('.yesterday-card').forEach(el => el.remove());
  // Update empty state text
  const emptyEl = ct.querySelector('.text-center');
  if (emptyEl) emptyEl.textContent = '近三天暂无记录，今天记得来一杯 ~';
  if (!fl.length) {
    ct.setAttribute('data-empty', 'true');
    if (emptyEl) emptyEl.style.display = '';
  } else {
    ct.setAttribute('data-empty', 'false');
    if (emptyEl) emptyEl.style.display = 'none';
    fl.forEach(e => {
      const drinkSvg = getDrinkIcon(e.name, e);
      const stars = [1, 2, 3, 4, 5].map(s =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-2.5 h-2.5 ${s <= (e.rating || 0) ? 'star-filled' : 'star-empty'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
      ).join('');
      const h = `<div class="yesterday-card flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 mb-1.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200" onclick="selDay('${e.date}')">
        <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-white">${drinkSvg}</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium text-gray-800 truncate">${e.brand ? esc(e.brand) + ' · ' : ''}${esc(e.name)}</div>
          <div class="text-[10px] text-gray-400">${e.price ? '¥' + e.price + ' · ' : ''}${fmtDate(e.date)}</div>
        </div>
        <div class="flex gap-0.5 flex-shrink-0">${stars}</div>
      </div>`;
      const el = document.createElement('div');
      el.innerHTML = h;
      ct.appendChild(el.firstElementChild);
    });
  }
}

function renderPinned() {
  const p = entries.filter(e => e.isPinned).sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.createdAt - b.createdAt),
    list = document.getElementById('pinned-list'),
    emp = document.getElementById('pinned-empty'),
    badge = document.getElementById('pinned-count');
  if (badge) badge.textContent = p.length ? p.length + ' 杯' : '';
  list.innerHTML = '';
  if (!p.length) {
    emp.style.display = '';
  } else {
    emp.style.display = 'none';
    list.innerHTML = p.map(e => {
      const drinkSvg = getDrinkIcon(e.name, e);
      const stars = [1, 2, 3, 4, 5].map(s =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-2 h-2 ${s <= (e.rating || 0) ? 'star-filled' : 'star-empty'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
      ).join('');
      return `<div class="flex items-center gap-2 px-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 mb-1 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200" style="height:46px" onclick="selDay('${e.date}')">
        <div class="w-6 h-6 flex items-center justify-center rounded-lg bg-white flex-shrink-0">${drinkSvg}</div>
        <span class="flex-1 text-xs font-medium text-gray-800 truncate">${e.brand ? esc(e.brand) + ' · ' : ''}${esc(e.name)}</span>
        <div class="flex gap-px flex-shrink-0">${stars}</div>
      </div>`;
    }).join('');
  }
}

/* ---- Calendar Nav ---- */
function selDay(d) { selDate = d; renderAll(); }
function goToday() {
  const n = new Date();
  selDate = localDateStr(n);
  calY = n.getFullYear();
  calM = n.getMonth();
  renderAll();
}
function chM(d) {
  calM += d;
  if (calM > 11) { calM = 0; calY++; }
  if (calM < 0) { calM = 11; calY--; }
  renderCal();
}

/* ---- Pin / Delete ---- */
function togPin(id) {
  const numId = Number(id);
  if (Number.isNaN(numId)) { console.error('[PIN] 无效 id:', id); return; }
  const e = entries.find(x => x.id === numId);
  if (!e) { console.warn('[PIN] 未找到记录, id:', numId); return; }
  e.isPinned = !e.isPinned; e.updatedAt = Date.now();
  sv(entries); renderAll();
  toast(e.isPinned ? '已收藏' : '已取消收藏', 'info');
  console.log('[PIN]', e.name, e.isPinned ? '→ 已收藏' : '→ 已取消收藏');
}
function delEntry(id) {
  const numId = Number(id);
  if (Number.isNaN(numId)) { console.error('[DELETE] 无效 id:', id); return; }
  const e = entries.find(x => x.id === numId);
  if (!e) { console.warn('[DELETE] 未找到记录, id:', numId); return; }
  console.log('[DELETE] 确认删除:', e.name, 'id:', numId);
  if (!confirm('确定删除「' + e.name + '」吗？')) { console.log('[DELETE] 用户取消'); return; }
  entries = entries.filter(x => x.id !== numId);
  sv(entries); renderAll();
  toast('已删除「' + e.name + '」', 'info');
  console.log('[DELETE] 已删除:', e.name);
}

/* ---- Search / Filter ---- */
function doSearch() {
  const t = document.getElementById('search-input').value.trim().toLowerCase(),
    b = document.getElementById('filter-brand').value.trim().toLowerCase(),
    f = document.getElementById('filter-from').value,
    to = document.getElementById('filter-to').value;
  document.getElementById('search-clear').classList.toggle('flex', !!(t || b || f || to));
  document.getElementById('search-clear').classList.toggle('hidden', !(t || b || f || to));
  if (!t && !b && !f && !to) { renderEntries(); return; }
  let fl = [...entries];
  if (t) fl = fl.filter(e => e.name.toLowerCase().includes(t) || (e.brand && e.brand.toLowerCase().includes(t)));
  if (b) fl = fl.filter(e => e.brand && e.brand.toLowerCase().includes(b));
  if (f) fl = fl.filter(e => e.date >= f);
  if (to) fl = fl.filter(e => e.date <= to);
  showResults(fl, t);
}
function showResults(r, term) {
  const ct = document.getElementById('entries-container');
  document.getElementById('entry-date-label').textContent = `搜索"${term || '全部'}"`;
  document.getElementById('entry-count').textContent = `${r.length} 条`;
  ct.querySelectorAll('.tilt-card').forEach(el => el.remove());
  if (!r.length) {
    ct.setAttribute('data-empty', 'true');
    const es = ct.querySelector('.flex.flex-col.items-center');
    es.style.display = '';
    es.querySelector('.text-sm.font-bold').textContent = '没有找到记录';
    es.querySelector('.empty-subtitle').textContent = '试试其他关键词吧';
    const btn = es.querySelector('button');
    if (btn) btn.style.display = 'none';
  } else {
    ct.setAttribute('data-empty', 'false');
    ct.querySelector('.flex.flex-col.items-center').style.display = 'none';
    r.sort((a, b) => b.createdAt - a.createdAt).forEach(e => {
      const card = document.createElement('div');
      card.className = 'tilt-card mb-2'; card.innerHTML = cardHTML(e);
      ct.appendChild(card);
    });
    initTiltCards();
  }
}
function clearSearch() {
  ['search-input', 'filter-brand', 'filter-from', 'filter-to'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('search-clear').classList.add('hidden');
  document.getElementById('search-clear').classList.remove('flex');
  renderAll();
}
function clearFilters() {
  ['filter-brand', 'filter-from', 'filter-to'].forEach(id => document.getElementById(id).value = '');
  doSearch();
}
function openFilter() {
  var panel = document.getElementById('filter-panel');
  panel.style.display = 'flex';
}
