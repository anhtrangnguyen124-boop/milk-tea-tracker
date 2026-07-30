// job-tracker.js — reference copy from index.html

   Event Delegation — 收藏 / 编辑 / 删除
   ============================================================ */
console.log('[DELEGATION] 正在注册点击监听...');
document.addEventListener('click', function(e) {
  // 防止文本节点没有 closest 方法
  var el = e.target && e.target.nodeType === 1 ? e.target : e.target.parentElement;
  if (!el) return;
  var btn = el.closest('button[data-action]');
  if (!btn) return;
  console.log('[DELEGATION] 捕获按钮点击:', btn.dataset.action, btn.dataset.id);
  e.stopPropagation();
  var id = Number(btn.dataset.id);
  var act = btn.dataset.action;
  if (act === 'pin')    { console.log('[DELEGATION] → togPin');    togPin(id); }
  if (act === 'edit')   { console.log('[DELEGATION] → editEntry'); editEntry(id); }
  if (act === 'delete') { console.log('[DELEGATION] → delEntry');  delEntry(id); }
});
console.log('[DELEGATION] 注册完成');

/* ============================================================
   Job Tracker — 投递驿站 Core Logic
   ============================================================ */

// ── Constants ──────────────────────────────────────────
var JOB_STATUSES = [
  { key: 'wishlist',   label: '待投递' },
  { key: 'applied',    label: '已投递' },
  { key: 'assessment', label: '笔试/测评' },
  { key: 'interview',  label: '面试中' },
  { key: 'offer',      label: 'Offer' },
  { key: 'rejected',   label: '已拒' }
];

var JOB_CHANNELS = ['官网', '内推', 'Boss直聘', 'LinkedIn', '猎头', '其他'];
var JOB_INDUSTRIES = ['互联网', '金融', '教育', '医疗', '房地产', '零售', '制造业', '汽车', '游戏', 'AI/大模型', '新能源', '娱乐', '快消', '物流'];

var AVATAR_COLORS = [
  '#E87888','#6BA8D8','#5BA88C','#D4A830','#9B7EC4',
  '#E8927C','#5C9EA8','#C4865A','#7BA0C8','#A88C5A',
  '#D4869A','#5C8EA0','#C4926A','#8888B8','#B89868'
];

// ── State ──────────────────────────────────────────────
var jobEntries = [];
var jobCurrentTab = 'overview';
var jobEditId = null;
var jobPanelStatus = 'applied';
var jobPanelChannel = '';
var jobPanelIndustry = '';
var batchMode = false;
var selectedJobIds = new Set();
var pendingJdImages = [];  // base64 strings waiting to be saved

var reviewEntries = [];
var reviewEditId = null;
var reviewStars = 0;
var reviewRound = '一面';

// ── Data Layer ─────────────────────────────────────────
function loadJobs() {
  try { var r = localStorage.getItem(userKey('job_v1')); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function saveJobs(a) { localStorage.setItem(userKey('job_v1'), JSON.stringify(a)); }
function loadReviews() {
  try { var r = localStorage.getItem(userKey('job_review_v1')); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function saveReviews(a) { localStorage.setItem(userKey('job_review_v1'), JSON.stringify(a)); }

// ── Sub-tab Switching ──────────────────────────────────
function switchJobTab(tab) {
  if (tab === jobCurrentTab) return;
  jobCurrentTab = tab;
  document.getElementById('job-overview').classList.toggle('hidden', tab !== 'overview');
  document.getElementById('job-kanban').classList.toggle('hidden', tab !== 'kanban');
  document.getElementById('job-review').classList.toggle('hidden', tab !== 'review');
  document.querySelectorAll('.job-tab-btn').forEach(function(b) {
    if (b.dataset.jobtab === tab) {
      b.style.background = 'var(--accent-500)'; b.style.color = '#fff';
    } else {
      b.style.background = 'transparent'; b.style.color = '#9B8E84';
    }
  });
  if (tab === 'overview') renderJobOverview();
  if (tab === 'kanban') { renderJobKanban(); renderJobCharts(); }
  if (tab === 'review') renderReviewList();
}

// ── Panel: Job Add/Edit ─────────────────────────────────
function openJobPanel(id) {
  jobEditId = id || null;
  jobPanelStatus = 'applied';
  jobPanelChannel = '';
  pendingJdImages = [];
  var panel = document.getElementById('job-panel-overlay');
  var title = document.getElementById('job-panel-title');
  var saveBtn = document.getElementById('job-save-btn');
  var delBtn = document.getElementById('job-delete-btn');
  if (id) {
    var job = jobEntries.find(function(j) { return j.id === id; });
    if (!job) return;
    title.textContent = '编辑投递';
    saveBtn.textContent = '更新';
    delBtn.style.display = '';
    document.getElementById('job-company').value = job.company || '';
    document.getElementById('job-position').value = job.position || '';
    document.getElementById('job-date').value = job.date || '';
    document.getElementById('job-jdcontent').value = job.jdContent || '';
    document.getElementById('job-applyurl').value = job.applyUrl || '';
    document.getElementById('job-salary').value = job.salary || '';
    document.getElementById('job-deadline').value = job.deadline || '';
    document.getElementById('job-notes').value = job.notes || '';
    pendingJdImages = (job.jdImages || []).slice();
    renderJdImagePreviews();
    jobPanelStatus = job.status;
    jobPanelChannel = job.channel || '';
    jobPanelIndustry = job.industry || '';
  } else {
    title.textContent = '添加投递';
    saveBtn.textContent = '保存';
    delBtn.style.display = 'none';
    document.getElementById('job-company').value = '';
    document.getElementById('job-position').value = '';
    document.getElementById('job-date').value = new Date().toISOString().slice(0,10);
    document.getElementById('job-jdcontent').value = '';
    document.getElementById('job-applyurl').value = '';
    document.getElementById('job-salary').value = '';
    document.getElementById('job-deadline').value = '';
    document.getElementById('job-notes').value = '';
    pendingJdImages = [];
    renderJdImagePreviews();
    jobPanelStatus = 'applied';
    jobPanelChannel = '';
    jobPanelIndustry = '';
  }
  renderStatusPills();
  renderChannelPills();
  renderIndustryPills();
  panel.classList.remove('hidden');
}

function closeJobPanel() {
  document.getElementById('job-panel-overlay').classList.add('hidden');
  jobEditId = null;
}

function saveJob() {
  var company = document.getElementById('job-company').value.trim();
  var position = document.getElementById('job-position').value.trim();
  if (!company || !position) { showJobToast('请填写公司名称和岗位名称'); return; }
  var data = {
    id: jobEditId || Date.now(),
    company: company,
    position: position,
    date: document.getElementById('job-date').value || new Date().toISOString().slice(0,10),
    status: jobPanelStatus,
    channel: jobPanelChannel || '',
    industry: jobPanelIndustry || document.getElementById('job-industry-custom').value.trim(),
    jdContent: document.getElementById('job-jdcontent').value.trim(),
    jdImages: pendingJdImages.slice(),
    applyUrl: document.getElementById('job-applyurl').value.trim(),
    salary: document.getElementById('job-salary').value.trim(),
    deadline: document.getElementById('job-deadline').value,
    notes: document.getElementById('job-notes').value.trim(),
    createdAt: jobEditId ? (jobEntries.find(function(j){return j.id===jobEditId})||{}).createdAt || Date.now() : Date.now(),
    updatedAt: Date.now()
  };
  if (jobEditId) {
    var idx = jobEntries.findIndex(function(j) { return j.id === jobEditId; });
    if (idx >= 0) jobEntries[idx] = data;
  } else {
    jobEntries.unshift(data);
  }
  saveJobs(jobEntries);
  closeJobPanel();
  renderJobAll();
  showJobToast('投递记录已保存');
}

function deleteJob() {
  if (!jobEditId) return;
  if (!confirm('确定删除这条投递记录吗？')) return;
  jobEntries = jobEntries.filter(function(j) { return j.id !== jobEditId; });
  saveJobs(jobEntries);
  closeJobPanel();
  renderJobAll();
  showJobToast('投递记录已删除');
}

function activityDeleteJob(id) {
  if (!confirm('确定删除这条投递记录吗？')) return;
  jobEntries = jobEntries.filter(function(j) { return j.id !== id; });
  saveJobs(jobEntries);
  renderJobAll();
  showJobToast('投递记录已删除');
}

function renderStatusPills() {
  var c = document.getElementById('job-status-pills');
  if (!c) return;
  c.innerHTML = JOB_STATUSES.map(function(s) {
    var sel = jobPanelStatus === s.key ? 'selected' : '';
    return '<button class="pill-option ' + sel + '" onclick="jobPanelStatus=\'' + s.key + '\';renderStatusPills();">' + s.label + '</button>';
  }).join('');
}

function renderChannelPills() {
  var c = document.getElementById('job-channel-pills');
  if (!c) return;
  c.innerHTML = JOB_CHANNELS.map(function(ch) {
    var sel = jobPanelChannel === ch ? 'selected' : '';
    return '<button class="pill-option ' + sel + '" onclick="jobPanelChannel=\'' + ch + '\';renderChannelPills();">' + ch + '</button>';
  }).join('');
}

function renderIndustryPills() {
  var c = document.getElementById('job-industry-pills');
  if (!c) return;
  c.innerHTML = JOB_INDUSTRIES.map(function(ind) {
    var sel = jobPanelIndustry === ind ? 'selected' : '';
    return '<button class="pill-option ' + sel + '" onclick="jobPanelIndustry=\'' + ind + '\';renderIndustryPills();document.getElementById(\'job-industry-custom\').value=\'\';">' + ind + '</button>';
  }).join('');
}

// ── JD Images ───────────────────────────────────────────
function handleJobJdImages(files) {
  if (!files || !files.length) return;
  Array.from(files).forEach(function(f) {
    if (f.size > 20 * 1024 * 1024) { showJobToast('图片不能超过 20MB'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      pendingJdImages.push(e.target.result);
      renderJdImagePreviews();
    };
    reader.readAsDataURL(f);
  });
  // Reset input so re-upload of same file works
  document.getElementById('job-jdimages-input').value = '';
}

function renderJdImagePreviews() {
  var container = document.getElementById('job-jdimages-preview');
  if (!container) return;
  if (!pendingJdImages.length) { container.innerHTML = ''; return; }
  container.innerHTML = pendingJdImages.map(function(img, i) {
    return '<div class="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">' +
      '<img src="' + img + '" class="w-full h-full object-cover" alt="JD截图">' +
      '<button class="absolute top-0 right-0 w-5 h-5 bg-red-500/80 text-white text-[10px] rounded-bl-lg flex items-center justify-center cursor-pointer border-none hover:bg-red-600 transition-colors" onclick="event.stopPropagation();removeJdImage(' + i + ')" title="删除">×</button></div>';
  }).join('');
}

function removeJdImage(idx) {
  pendingJdImages.splice(idx, 1);
  renderJdImagePreviews();
}

// ── Batch Operations ─────────────────────────────────────
function toggleBatchMode() {
  batchMode = !batchMode;
  selectedJobIds = new Set();
  var btn = document.getElementById('job-batch-btn');
  var delBtn = document.getElementById('job-batch-del-btn');
  if (batchMode) {
    btn.textContent = '取消选择';
    btn.style.color = 'var(--accent-500)';
    btn.style.borderColor = 'var(--accent-300)';
    if (delBtn) delBtn.style.display = '';
  } else {
    btn.textContent = '批量选择';
    btn.style.color = '';
    btn.style.borderColor = '';
    if (delBtn) delBtn.style.display = 'none';
  }
  document.getElementById('batch-check-all').checked = false;
  renderJobTable();
}

function toggleSelectAll() {
  var checked = document.getElementById('batch-check-all').checked;
  var allJobs = jobEntries.slice().sort(function(a,b) { return b.updatedAt - a.updatedAt; });
  if (checked) {
    allJobs.forEach(function(j) { selectedJobIds.add(j.id); });
  } else {
    selectedJobIds = new Set();
  }
  renderJobTable();
}

function toggleSelectJob(id, checked) {
  if (checked) { selectedJobIds.add(id); }
  else { selectedJobIds.delete(id); }
  // Update batch count
  var countEl = document.getElementById('job-batch-count');
  if (countEl) countEl.textContent = selectedJobIds.size;
}

function renderBatchToolbar() {
  var btn = document.getElementById('job-batch-btn');
  if (!batchMode) return;
  btn.textContent = '取消选择';
  btn.style.color = 'var(--accent-500)';
  btn.style.borderColor = 'var(--accent-300)';
}

function batchDeleteJobs() {
  if (selectedJobIds.size === 0) { showJobToast('请先选择要删除的记录'); return; }
  var count = selectedJobIds.size;
  if (!confirm('确定删除选中的 ' + count + ' 条投递记录吗？此操作不可撤销。')) return;
  jobEntries = jobEntries.filter(function(j) { return !selectedJobIds.has(j.id); });
  saveJobs(jobEntries);
  selectedJobIds = new Set();
  showJobToast('已删除 ' + count + ' 条记录');
  // Exit batch mode
  batchMode = false;
  var batchBtn = document.getElementById('job-batch-btn');
  var delBtn = document.getElementById('job-batch-del-btn');
  if (batchBtn) { batchBtn.textContent = '批量选择'; batchBtn.style.color = ''; batchBtn.style.borderColor = ''; }
  if (delBtn) delBtn.style.display = 'none';
  renderJobAll();
}

// ── Export ───────────────────────────────────────────────
function exportJobTable() {
  var allJobs = jobEntries.slice().sort(function(a,b) { return b.updatedAt - a.updatedAt; });
  if (!allJobs.length) { showJobToast('暂无数据可导出'); return; }
  var si, displayDate;
  // CSV header
  var headers = ['公司', '岗位', '状态', '投递日期', '渠道', '行业', '薪资', '截止日期', 'JD内容', '投递链接', '备注'];
  var rows = [headers.map(escCsv).join(',')];
  allJobs.forEach(function(j) {
    si = JOB_STATUSES.find(function(s) { return s.key === j.status; });
    displayDate = j.date || '';
    if (displayDate) { var dp = displayDate.split('-'); displayDate = dp[1] + '月' + dp[2] + '日'; }
    rows.push([
      escCsv(j.company),
      escCsv(j.position),
      escCsv(si ? si.label : j.status),
      escCsv(displayDate),
      escCsv(j.channel || ''),
      escCsv(j.industry || ''),
      escCsv(j.salary || ''),
      escCsv(j.deadline || ''),
      escCsv(j.jdContent || j.jdUrl || ''),  // backward compat: also check old jdUrl
      escCsv(j.applyUrl || ''),
      escCsv(j.notes || '')
    ].join(','));
  });
  var bom = '﻿';
  var blob = new Blob([bom + rows.join('\n')], {type: 'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '投递汇总_' + new Date().toISOString().slice(0,10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showJobToast('导出成功');
}

function escCsv(str) {
  str = String(str || '');
  if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ── Render: Master ──────────────────────────────────────
function renderJobAll() {
  jobEntries = loadJobs();
  reviewEntries = loadReviews();
  if (jobCurrentTab === 'overview') renderJobOverview();
  else if (jobCurrentTab === 'kanban') { renderJobKanban(); renderJobCharts(); }
  else if (jobCurrentTab === 'review') renderReviewList();
  checkDeadlines();
}

// ── Render: Overview ────────────────────────────────────
function renderJobOverview() {
  renderJobStats();
  renderJobTable();
}

function renderJobStats() {
  var row = document.getElementById('job-stats-row');
  if (!row) return;
  var total = jobEntries.filter(function(j) { return j.status !== 'wishlist'; }).length;
  var interviewing = jobEntries.filter(function(j) { return j.status === 'interview'; }).length;
  var offers = jobEntries.filter(function(j) { return j.status === 'offer'; }).length;
  var now = new Date(); now.setHours(0,0,0,0);
  var d3 = new Date(now.getTime() + 3*86400000);
  var urgentCount = jobEntries.filter(function(j) {
    if (!j.deadline || j.status === 'rejected' || j.status === 'offer') return false;
    var dl = new Date(j.deadline + 'T00:00:00');
    return dl >= now && dl <= d3;
  }).length;

  var cards = [
    { label: '已投递', value: total, icon: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' },
    { label: '面试中', value: interviewing, icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { label: '已 Offer', value: offers, icon: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 22V8c0-2 2-4 2-4s2 2 2 4v14"/>' },
    { label: '将截止', value: urgentCount, icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', urgent: urgentCount > 0 }
  ];

  row.innerHTML = cards.map(function(c) {
    var strokeColor = c.urgent ? '#ef4444' : 'var(--accent-500)';
    return '<div class="stat-mini-card">' +
      '<div class="flex items-center gap-2 mb-2">' +
        '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="' + strokeColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + c.icon + '</svg>' +
        '<span class="text-[11px] text-gray-400 font-boba">' + c.label + '</span>' +
      '</div>' +
      '<div class="flex items-center gap-2"><span class="text-2xl font-bold text-gray-800 font-boba">' + c.value + '</span></div>' +
    '</div>';
  }).join('');
}

function renderJobTable() {
  var tbody = document.getElementById('job-table-body');
  var countEl = document.getElementById('job-table-count');
  if (!tbody) return;

  // Show/hide batch columns
  var batchCols = document.querySelectorAll('.batch-col');
  var batchTh = document.getElementById('batch-check-all-th');
  var batchDelBtn = document.getElementById('job-batch-del-btn');
  var displayStyle = batchMode ? '' : 'none';
  batchCols.forEach(function(el) { el.style.display = displayStyle; });
  if (batchTh) batchTh.style.display = displayStyle;
  if (batchDelBtn) batchDelBtn.style.display = batchMode ? '' : 'none';

  var allJobs = jobEntries.slice().sort(function(a,b) { return b.updatedAt - a.updatedAt; });
  if (countEl) countEl.textContent = allJobs.length + ' 条记录';

  // Update batch count
  var batchCountEl = document.getElementById('job-batch-count');
  if (batchCountEl) batchCountEl.textContent = selectedJobIds.size;

  if (allJobs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" class="text-center py-10 text-xs text-gray-400">暂无投递记录，开始记录你的第一份投递吧</td></tr>';
    return;
  }

  var now = new Date(); now.setHours(0,0,0,0);
  var d3 = new Date(now.getTime() + 3*86400000);

  tbody.innerHTML = allJobs.map(function(j) {
    var si = JOB_STATUSES.find(function(s) { return s.key === j.status; });
    var displayDate = j.date || '';
    if (displayDate) { var dp = displayDate.split('-'); displayDate = dp[1] + '月' + dp[2] + '日'; }

    // Deadline urgency
    var deadlineHtml = j.deadline || '';
    if (j.deadline) {
      var dl = new Date(j.deadline + 'T00:00:00');
      var dlUrgent = dl >= now && dl <= d3 && j.status !== 'rejected' && j.status !== 'offer';
      var dlp = j.deadline.split('-');
      deadlineHtml = '<span class="' + (dlUrgent ? 'text-red-500 font-bold' : 'text-gray-500') + '">' + dlp[1] + '月' + dlp[2] + '日' + (dlUrgent ? ' ⏰' : '') + '</span>';
    }

    // JD content display
    var jdContent = j.jdContent || j.jdUrl || '';  // backward compat
    var jdDisplay = '-';
    if (jdContent || (j.jdImages && j.jdImages.length)) {
      jdDisplay = (jdContent ? escHtml(jdContent).slice(0, 30) + (jdContent.length > 30 ? '...' : '') : '') +
        (j.jdImages && j.jdImages.length ? ' <span class="text-[10px]">📷' + j.jdImages.length + '</span>' : '');
    }

    // Apply URL display
    var applyUrlHtml = j.applyUrl ? '<a href="' + escHtml(j.applyUrl) + '" target="_blank" class="text-blue-500 hover:underline" onclick="event.stopPropagation();" title="' + escHtml(j.applyUrl) + '">🔗</a>' : '<span class="text-gray-300">-</span>';

    // Status badge color
    var statusColors = { wishlist:'#9CA3AF', applied:'#6BA8D8', assessment:'#E8927C', interview:'#D4687A', offer:'#5BA88C', rejected:'#9CA3AF' };
    var statusBg = statusColors[j.status] || '#9CA3AF';

    // Batch checkbox
    var isChecked = selectedJobIds.has(j.id);
    var batchCheckboxHtml = '<td class="batch-col px-2 py-2.5 text-center" style="display:' + (batchMode ? '' : 'none') + ';">' +
      '<input type="checkbox" class="w-3.5 h-3.5 rounded cursor-pointer batch-checkbox" data-id="' + j.id + '"' + (isChecked ? ' checked' : '') + ' onclick="event.stopPropagation();toggleSelectJob(' + j.id + ',this.checked)" style="accent-color:var(--accent-500);"></td>';

    return '<tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-100 cursor-pointer" onclick="' + (batchMode ? 'event.stopPropagation();var cb=this.querySelector(\'.batch-checkbox\');if(cb){cb.checked=!cb.checked;toggleSelectJob(' + j.id + ',cb.checked)}' : 'openJobPanel(' + j.id + ')') + '">' +
      batchCheckboxHtml +
      '<td class="px-4 py-2.5 whitespace-nowrap"><span class="font-bold text-gray-800 text-[11px]">' + escHtml(j.company) + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap"><span class="text-gray-700 text-[11px]">' + escHtml(j.position) + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap"><span class="text-[10px] px-2 py-0.5 rounded-full text-white font-medium" style="background:' + statusBg + '">' + (si ? si.label : j.status) + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap"><span class="text-gray-500 text-[11px]">' + displayDate + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap"><span class="text-gray-500 text-[11px]">' + (j.channel ? escHtml(j.channel) : '-') + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap"><span class="text-gray-500 text-[11px]">' + (j.industry ? escHtml(j.industry) : '-') + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap"><span class="text-gray-500 text-[11px]">' + (j.salary ? escHtml(j.salary) : '-') + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap">' + (deadlineHtml || '<span class="text-gray-300">-</span>') + '</td>' +
      '<td class="px-4 py-2.5 max-w-[120px]"><span class="text-gray-400 text-[10px] truncate block" style="max-width:120px;">' + jdDisplay + '</span></td>' +
      '<td class="px-4 py-2.5 whitespace-nowrap">' + applyUrlHtml + '</td>' +
      '<td class="px-4 py-2.5 max-w-[100px]"><span class="text-gray-400 text-[10px] truncate block" style="max-width:100px;">' + (j.notes ? escHtml(j.notes).slice(0,40) + (j.notes.length > 40 ? '...' : '') : '-') + '</span></td>' +
      '<td class="px-3 py-2.5 whitespace-nowrap text-center"><div class="flex items-center justify-center gap-0.5">' +
        '<button class="p-1 rounded-lg text-gray-400 hover:text-accent-500 transition-colors cursor-pointer border-none bg-transparent" onclick="event.stopPropagation();openJobPanel(' + j.id + ')" title="编辑"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
        '<button class="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent" onclick="event.stopPropagation();activityDeleteJob(' + j.id + ')" title="删除"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-.867 12.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.995-1.858L5 6h14z"/></svg></button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
}

// ── Deadline Checker ────────────────────────────────────
function checkDeadlines() {
  var now = new Date(); now.setHours(0,0,0,0);
  var d1 = new Date(now.getTime() + 1*86400000);
  var urgent = jobEntries.filter(function(j) {
    if (!j.deadline || j.status === 'rejected' || j.status === 'offer') return false;
    var dl = new Date(j.deadline + 'T00:00:00');
    return dl >= now && dl <= d1;
  });
  urgent.forEach(function(j) {
    var dl = new Date(j.deadline + 'T00:00:00');
    var diffDays = Math.ceil((dl - now) / 86400000);
    showJobToast('⚠ ' + j.company + ' · ' + j.position + ' 笔试/测评 ' + (diffDays === 0 ? '今天截止' : '明天截止'));
  });
}

// ── Render: Kanban ─────────────────────────────────────
function renderJobKanban() {
  var container = document.getElementById('kanban-container');
  if (!container) return;
  container.innerHTML = JOB_STATUSES.map(function(s) {
    var cards = jobEntries.filter(function(j) { return j.status === s.key; });
    var cardsHtml = cards.map(function(j) {
      return renderKanbanCard(j);
    }).join('');
    return '<div class="kanban-col flex flex-col gap-2" data-status="' + s.key + '">' +
      '<div class="flex items-center gap-1.5 px-1 mb-1"><span class="text-xs font-bold text-gray-500 font-boba">' + s.label + '</span><span class="text-[10px] text-gray-400 bg-white/50 px-1.5 py-0.5 rounded-full">' + cards.length + '</span></div>' +
      '<div class="kanban-drop-zone flex flex-col gap-1.5 min-h-[60px] rounded-2xl p-1.5 transition-colors duration-150" style="background:rgba(255,255,255,0.25);border:1px dashed rgba(0,0,0,0.06);" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event,\'' + s.key + '\')">' +
        (cardsHtml || '<p class="text-[10px] text-gray-300 text-center py-3">拖拽卡片到此处</p>') +
      '</div></div>';
  }).join('');
}

function renderKanbanCard(j) {
  var avatarColor = AVATAR_COLORS[Math.abs(hashStr(j.company)) % AVATAR_COLORS.length];
  var initial = (j.company || '?').charAt(0);
  var hasDeadline = j.deadline && j.status === 'assessment';
  var dlUrgent = false;
  if (hasDeadline) {
    var now = new Date(); now.setHours(0,0,0,0);
    var d3 = new Date(now.getTime() + 3*86400000);
    var dl = new Date(j.deadline + 'T00:00:00');
    dlUrgent = dl >= now && dl <= d3;
  }
  return '<div class="job-card group" draggable="true" onclick="openJobPanel(' + j.id + ')" ' +
    'ondragstart="handleDragStart(event,' + j.id + ')" ondragend="handleDragEnd(event)" ' +
    'data-job-id="' + j.id + '">' +
    '<div class="flex items-start gap-2.5">' +
      '<div class="job-avatar" style="background:' + avatarColor + ';">' + escHtml(initial) + '</div>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="text-xs font-bold text-gray-800 font-boba truncate">' + escHtml(j.company) + '</div>' +
        '<div class="text-[11px] text-gray-600 truncate mt-0.5">' + escHtml(j.position) + '</div>' +
        '<div class="flex items-center gap-1.5 mt-1.5 flex-wrap">' +
          (j.channel ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/60 text-gray-500">' + escHtml(j.channel) + '</span>' : '') +
          (j.industry ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-50)] text-[var(--accent-600)] font-medium">' + escHtml(j.industry) + '</span>' : '') +
          '<span class="text-[9px] text-gray-400">' + getTimeAgo(j.updatedAt) + '</span>' +
        '</div>' +
        (j.notes ? '<div class="text-[10px] text-gray-400 mt-1 truncate">' + escHtml(j.notes) + '</div>' : '') +
      '</div>' +
    '</div>' +
    (dlUrgent ? '<div class="flex items-center gap-1 mt-2 pt-1.5 border-t border-gray-100"><span class="deadline-dot"></span><span class="text-[9px] text-red-500 font-bold">' + j.deadline + ' 截止</span></div>' : '') +
  '</div>';
}

// ── Drag & Drop ─────────────────────────────────────────
var dragJobId = null;
function handleDragStart(e, jobId) {
  dragJobId = jobId;
  e.target.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(jobId));
}
function handleDragEnd(e) {
  e.target.style.opacity = '1';
  dragJobId = null;
  document.querySelectorAll('.kanban-drop-zone').forEach(function(z) { z.style.background = ''; z.style.borderColor = ''; });
}
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.style.background = 'rgba(var(--shadow-rgb),0.08)';
  e.currentTarget.style.borderColor = 'var(--accent-500)';
}
function handleDragLeave(e) {
  e.currentTarget.style.background = '';
  e.currentTarget.style.borderColor = '';
}
function handleDrop(e, newStatus) {
  e.preventDefault();
  e.currentTarget.style.background = '';
  e.currentTarget.style.borderColor = '';
  var jobId = dragJobId || Number(e.dataTransfer.getData('text/plain'));
  if (!jobId) return;
  var job = jobEntries.find(function(j) { return j.id === jobId; });
  if (!job || job.status === newStatus) return;
  job.status = newStatus;
  job.updatedAt = Date.now();
  saveJobs(jobEntries);
  renderJobKanban();
  renderJobCharts();
}

// ── Charts ────────────────────────────────────────────────
function renderJobCharts() {
  renderStatusBarChart();
  renderChannelPieChart();
  renderIndustryPieChart();
  renderTimelineChart();
}

function renderStatusBarChart() {
  var container = document.getElementById('chart-status-bars');
  if (!container) return;
  var maxCount = 0;
  JOB_STATUSES.forEach(function(s) {
    var cnt = jobEntries.filter(function(j) { return j.status === s.key; }).length;
    if (cnt > maxCount) maxCount = cnt;
  });
  if (maxCount === 0) { container.innerHTML = '<p class="text-xs text-gray-400 text-center py-6">暂无数据</p>'; return; }
  var barColors = ['#E8C4CA', '#F0B8C0', '#D4687A', '#B85263', '#5BA88C', '#9CA3AF'];
  container.innerHTML = JOB_STATUSES.map(function(s, i) {
    var cnt = jobEntries.filter(function(j) { return j.status === s.key; }).length;
    var pct = maxCount > 0 ? Math.round(cnt / maxCount * 100) : 0;
    return '<div class="flex items-center gap-2"><span class="text-[10px] text-gray-500 w-14 text-right flex-shrink-0 font-boba">' + s.label + '</span>' +
      '<div class="flex-1 h-5 bg-white/40 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-500" style="width:' + pct + '%;background:' + barColors[i] + ';"></div></div>' +
      '<span class="text-[11px] font-bold text-gray-700 w-6 flex-shrink-0">' + cnt + '</span></div>';
  }).join('');
}

function renderChannelPieChart() {
  var container = document.getElementById('chart-channel-pie');
  if (!container) return;
  var counts = {};
  jobEntries.forEach(function(j) {
    var ch = j.channel || '未知';
    counts[ch] = (counts[ch] || 0) + 1;
  });
  var total = Object.values(counts).reduce(function(a,b){return a+b;},0);
  if (total === 0) { container.innerHTML = '<p class="text-xs text-gray-400 text-center py-6">暂无数据</p>'; return; }

  var pieColors = ['var(--accent-500)','#5BA88C','#9B7EC4','#6BA8D8','#D4A830','#E8927C','#5C9EA8','#C4865A'];
  var entries = Object.entries(counts).sort(function(a,b){return b[1]-a[1];});
  var cx = 90, cy = 90, r = 65, strokeW = 28;

  // Build SVG donut chart with legend
  var svgParts = [];
  var cumulativePercent = 0;
  var circumference = 2 * Math.PI * (r - strokeW/2);
  entries.forEach(function(e, i) {
    var percent = e[1] / total;
    var dashLen = circumference * percent;
    var dashOffset = circumference * cumulativePercent;
    cumulativePercent += percent;
    svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - strokeW/2) + '" fill="none" stroke="' + pieColors[i % pieColors.length] + '" stroke-width="' + strokeW + '" stroke-dasharray="' + dashLen.toFixed(1) + ' ' + (circumference - dashLen).toFixed(1) + '" stroke-dashoffset="-' + dashOffset.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>');
  });
  // Center text
  svgParts.push('<text x="' + cx + '" y="' + (cy-4) + '" text-anchor="middle" class="font-boba" fill="#333" font-size="14" font-weight="700">' + total + '</text>');
  svgParts.push('<text x="' + cx + '" y="' + (cy+14) + '" text-anchor="middle" class="font-boba" fill="#999" font-size="10">总投递</text>');

  // Legend
  var legendHtml = entries.map(function(e, i) {
    var pct = Math.round(e[1]/total*100);
    return '<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:' + pieColors[i%pieColors.length] + ';"></span><span class="text-[10px] text-gray-500 font-boba">' + escHtml(e[0]) + ' ' + pct + '%</span></div>';
  }).join('');

  container.innerHTML = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
    '<svg viewBox="0 0 180 180" width="180" height="180">' + svgParts.join('') + '</svg>' +
    '<div class="space-y-1.5">' + legendHtml + '</div></div>';
}

function renderIndustryPieChart() {
  var container = document.getElementById('chart-industry-pie');
  if (!container) return;
  var counts = {};
  jobEntries.forEach(function(j) {
    var ind = j.industry || '未知';
    counts[ind] = (counts[ind] || 0) + 1;
  });
  var total = Object.values(counts).reduce(function(a,b){return a+b;},0);
  if (total === 0) { container.innerHTML = '<p class="text-xs text-gray-400 text-center py-6">暂无数据</p>'; return; }

  var pieColors = ['#5BA88C','#9B7EC4','#6BA8D8','#D4A830','#E8927C','#5C9EA8','#C4865A','var(--accent-500)','#E87888','#7BA0C8'];
  var entries = Object.entries(counts).sort(function(a,b){return b[1]-a[1];});
  var cx = 90, cy = 90, r = 65, strokeW = 28;

  var svgParts = [];
  var cumulativePercent = 0;
  var circumference = 2 * Math.PI * (r - strokeW/2);
  entries.forEach(function(e, i) {
    var percent = e[1] / total;
    var dashLen = circumference * percent;
    var dashOffset = circumference * cumulativePercent;
    cumulativePercent += percent;
    svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - strokeW/2) + '" fill="none" stroke="' + pieColors[i % pieColors.length] + '" stroke-width="' + strokeW + '" stroke-dasharray="' + dashLen.toFixed(1) + ' ' + (circumference - dashLen).toFixed(1) + '" stroke-dashoffset="-' + dashOffset.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>');
  });
  svgParts.push('<text x="' + cx + '" y="' + (cy-4) + '" text-anchor="middle" class="font-boba" fill="#333" font-size="14" font-weight="700">' + total + '</text>');
  svgParts.push('<text x="' + cx + '" y="' + (cy+14) + '" text-anchor="middle" class="font-boba" fill="#999" font-size="10">总投递</text>');

  var legendHtml = entries.map(function(e, i) {
    var pct = Math.round(e[1]/total*100);
    return '<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:' + pieColors[i%pieColors.length] + ';"></span><span class="text-[10px] text-gray-500 font-boba">' + escHtml(e[0]) + ' ' + pct + '%</span></div>';
  }).join('');

  container.innerHTML = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
    '<svg viewBox="0 0 180 180" width="180" height="180">' + svgParts.join('') + '</svg>' +
    '<div class="space-y-1.5">' + legendHtml + '</div></div>';
}

function renderTimelineChart() {
  var container = document.getElementById('chart-timeline');
  if (!container) return;

  // Group by month
  var monthCounts = {};
  jobEntries.forEach(function(j) {
    var ym = j.date ? j.date.slice(0,7) : '未知';
    monthCounts[ym] = (monthCounts[ym] || 0) + 1;
  });

  // Always generate 6 complete months (current + previous 5)
  var now = new Date();
  var months = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    months.push(ym);
  }

  var maxCount = Math.max.apply(null, months.map(function(ym) { return monthCounts[ym] || 0; })) || 1;
  // Round max to nice number
  var niceMax = Math.ceil(maxCount / 4) * 4;
  if (maxCount <= 1) niceMax = Math.max(4, maxCount * 4);

  var barW = 36, gap = 24, totalW = months.length * (barW + gap) + 50;
  var chartH = 150, padT = 16, padB = 28, padL = 40, padR = 20;
  var totalH = chartH + padT + padB;
  var plotH = chartH - padT;

  // Y-axis ticks
  var yTicks = [0, Math.round(niceMax/2), niceMax];
  var yAxisHtml = yTicks.map(function(v) {
    var y = padT + plotH - (v / niceMax) * plotH;
    return '<line x1="' + padL + '" y1="' + y + '" x2="' + totalW + '" y2="' + y + '" stroke="#eee" stroke-width="1"/>' +
      '<text x="' + (padL - 6) + '" y="' + (y + 4) + '" text-anchor="end" fill="#9CA3AF" font-size="9" font-family="inherit">' + v + '</text>';
  }).join('');

  // Bars
  var barsHtml = months.map(function(ym, i) {
    var cnt = monthCounts[ym] || 0;
    var barH = Math.max(4, (cnt / niceMax) * plotH);
    var x = padL + i * (barW + gap);
    var y = padT + plotH - barH;
    var level = Math.min(600, 200 + Math.round((cnt / niceMax) * 400) / 100 * 100);
    return '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="4" fill="var(--accent-' + level + ')" opacity="0.85">' +
      '<title>' + ym + ': ' + cnt + '条</title></rect>';
  }).join('');

  // Line overlay
  var linePoints = months.map(function(ym, i) {
    var cnt = monthCounts[ym] || 0;
    var x = padL + i * (barW + gap) + barW/2;
    var y = padT + plotH - (cnt / niceMax) * plotH;
    return x.toFixed(1) + ',' + y.toFixed(1);
  });

  var linePath = linePoints.length > 1
    ? '<polyline points="' + linePoints.join(' ') + '" fill="none" stroke="var(--accent-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>'
    : '';

  // Data dots on the line
  var dotsHtml = months.map(function(ym, i) {
    var cnt = monthCounts[ym] || 0;
    var x = padL + i * (barW + gap) + barW/2;
    var y = padT + plotH - (cnt / niceMax) * plotH;
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5" fill="white" stroke="var(--accent-600)" stroke-width="2"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + (y - 8) + '" text-anchor="middle" fill="#555" font-size="9" font-weight="700" font-family="inherit">' + cnt + '</text>';
  }).join('');

  // X-axis labels
  var xLabelsHtml = months.map(function(ym, i) {
    var x = padL + i * (barW + gap) + barW/2;
    var label = parseInt(ym.slice(5), 10) + '月';
    return '<text x="' + x + '" y="' + (padT + chartH + 16) + '" text-anchor="middle" fill="#9CA3AF" font-size="9" font-family="inherit">' + label + '</text>';
  }).join('');

  // X-axis line
  var xAxisLine = '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (padL + months.length * (barW + gap)) + '" y2="' + (padT + plotH) + '" stroke="#ddd" stroke-width="1"/>';

  var svg = '<svg viewBox="0 0 ' + totalW + ' ' + totalH + '" width="' + totalW + '" height="' + totalH + '" xmlns="http://www.w3.org/2000/svg">' +
    yAxisHtml + xAxisLine + barsHtml + linePath + dotsHtml + xLabelsHtml + '</svg>';

  container.innerHTML = '<div style="overflow-x:auto;padding:4px 0;min-height:160px;">' + svg + '</div>';
}

// ── Render: Review List ─────────────────────────────────
var REVIEW_ROUNDS = ['一面', '二面', '三面', 'HR面', '群面', '其他'];

function renderReviewList() {
  var list = document.getElementById('review-list');
  if (!list) return;
  reviewEntries = loadReviews();
  if (reviewEntries.length === 0) {
    list.innerHTML = '<p class="text-xs text-gray-400 text-center py-10">暂无面试复盘记录</p>';
    return;
  }
  var sorted = reviewEntries.slice().sort(function(a,b) { return b.updatedAt - a.updatedAt; });
  list.innerHTML = sorted.map(function(r) {
    var job = jobEntries.find(function(j) { return j.id === r.jobId; });
    var jobLabel = job ? (job.company + ' · ' + job.position) : '未知投递';
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      starsHtml += '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="' + (i <= (r.rating||0) ? 'var(--accent-500)' : 'none') + '" stroke="' + (i <= (r.rating||0) ? 'var(--accent-500)' : '#d1d5db') + '" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    return '<div class="module-card group cursor-pointer hover:shadow-md transition-all duration-200" onclick="openReviewPanel(' + r.id + ')">' +
      '<div class="flex items-start justify-between mb-2">' +
        '<div class="flex-1 min-w-0">' +
          '<div class="text-sm font-bold text-gray-800 font-boba truncate">' + escHtml(jobLabel) + '</div>' +
          '<div class="flex items-center gap-2 mt-1">' +
            '<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-50)] text-[var(--accent-600)] font-bold">' + escHtml(r.round || '面试') + '</span>' +
            '<span class="text-[10px] text-gray-400">' + (r.date || '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="flex items-center gap-0.5 flex-shrink-0 ml-2">' + starsHtml + '</div>' +
      '</div>' +
      (r.summary ? '<div class="text-xs text-gray-500 line-clamp-2 mt-2">' + escHtml(r.summary) + '</div>' : '') +
      (r.questions ? '<div class="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1"><svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span class="line-clamp-1">' + escHtml(r.questions.slice(0,80)) + (r.questions.length > 80 ? '...' : '') + '</span></div>' : '') +
    '</div>';
  }).join('');
}

// ── Review Panel ────────────────────────────────────────
function openReviewPanel(id) {
  reviewEditId = id || null;
  reviewStars = 0;
  reviewRound = '一面';
  var panel = document.getElementById('review-panel-overlay');
  var title = document.getElementById('review-panel-title');
  var saveBtn = document.getElementById('review-save-btn');
  var delBtn = document.getElementById('review-delete-btn');

  renderReviewJobSelect();

  if (id) {
    var rev = reviewEntries.find(function(r) { return r.id === id; });
    if (!rev) return;
    title.textContent = '编辑复盘';
    saveBtn.textContent = '更新';
    delBtn.style.display = '';
    document.getElementById('review-job-id').value = rev.jobId || '';
    document.getElementById('review-date').value = rev.date || '';
    document.getElementById('review-questions').value = rev.questions || '';
    document.getElementById('review-summary').value = rev.summary || '';
    reviewStars = rev.rating || 0;
    reviewNumericScore = rev.numericScore || 0;
    reviewRound = rev.round || '一面';
  } else {
    title.textContent = '添加复盘';
    saveBtn.textContent = '保存';
    delBtn.style.display = 'none';
    document.getElementById('review-job-id').value = '';
    document.getElementById('review-date').value = new Date().toISOString().slice(0,10);
    document.getElementById('review-questions').value = '';
    document.getElementById('review-summary').value = '';
    reviewStars = 0;
    reviewRound = '一面';
  }
  renderReviewRoundPills();
  renderReviewStars();
  var scoreNumEl = document.getElementById('review-score-num');
  if (scoreNumEl) { scoreNumEl.value = reviewNumericScore > 0 ? reviewNumericScore : ''; }
  panel.classList.remove('hidden');
}

function closeReviewPanel() {
  document.getElementById('review-panel-overlay').classList.add('hidden');
  reviewEditId = null;
}

function saveReview() {
  var jobId = Number(document.getElementById('review-job-id').value);
  if (!jobId) { showJobToast('请选择关联的投递记录'); return; }
  var data = {
    id: reviewEditId || Date.now(),
    jobId: jobId,
    round: reviewRound,
    date: document.getElementById('review-date').value || new Date().toISOString().slice(0,10),
    rating: reviewStars,
    numericScore: reviewNumericScore || null,
    questions: document.getElementById('review-questions').value.trim(),
    summary: document.getElementById('review-summary').value.trim(),
    createdAt: reviewEditId ? (reviewEntries.find(function(r){return r.id===reviewEditId})||{}).createdAt || Date.now() : Date.now(),
    updatedAt: Date.now()
  };
  if (reviewEditId) {
    var idx = reviewEntries.findIndex(function(r) { return r.id === reviewEditId; });
    if (idx >= 0) reviewEntries[idx] = data;
  } else {
    reviewEntries.unshift(data);
  }
  saveReviews(reviewEntries);
  closeReviewPanel();
  renderReviewList();
  showJobToast('面试复盘已保存');
}

function deleteReview() {
  if (!reviewEditId) return;
  if (!confirm('确定删除这条复盘记录吗？')) return;
  reviewEntries = reviewEntries.filter(function(r) { return r.id !== reviewEditId; });
  saveReviews(reviewEntries);
  closeReviewPanel();
  renderReviewList();
  showJobToast('复盘记录已删除');
}

function renderReviewJobSelect() {
  var sel = document.getElementById('review-job-id');
  if (!sel) return;
  jobEntries = loadJobs();
  var opts = '<option value="">-- 选择投递记录 --</option>';
  jobEntries.forEach(function(j) {
    var selected = reviewEditId && reviewEntries.find(function(r){return r.id===reviewEditId}) && j.id === (reviewEntries.find(function(r){return r.id===reviewEditId})||{}).jobId ? ' selected' : '';
    opts += '<option value="' + j.id + '"' + selected + '>' + j.company + ' · ' + j.position + '</option>';
  });
  sel.innerHTML = opts;
}

function renderReviewRoundPills() {
  var c = document.getElementById('review-round-pills');
  if (!c) return;
  c.innerHTML = REVIEW_ROUNDS.map(function(r) {
    var sel = reviewRound === r ? 'selected' : '';
    return '<button class="pill-option ' + sel + '" onclick="reviewRound=\'' + r + '\';renderReviewRoundPills();">' + r + '</button>';
  }).join('');
}

function renderReviewStars() {
  var c = document.getElementById('review-stars');
  if (!c) return;
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += '<svg class="w-6 h-6 cursor-pointer transition-transform duration-150 hover:scale-110" viewBox="0 0 24 24" fill="' + (i <= reviewStars ? 'var(--accent-500)' : 'none') + '" stroke="' + (i <= reviewStars ? 'var(--accent-500)' : '#d1d5db') + '" stroke-width="2" onclick="reviewStars=' + i + ';reviewNumericScore=0;renderReviewStars();document.getElementById("review-score-num").value="";"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  c.innerHTML = html;
}

var reviewNumericScore = 0;
function reviewScoreNumInput() {
  var numEl = document.getElementById('review-score-num');
  var val = parseInt(numEl.value, 10);
  if (!isNaN(val) && val >= 0 && val <= 100) {
    reviewNumericScore = val;
    reviewStars = Math.round(val / 20);
    renderReviewStars();
  } else if (numEl.value === '') {
    reviewNumericScore = 0;
  }
}

// ── Helpers ─────────────────────────────────────────────
function hashStr(s) {
  if (!s) return 0;
  var h = 0;
  for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getTimeAgo(ts) {
  var diff = Date.now() - ts;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff/60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff/3600000) + '小时前';
  if (diff < 604800000) return Math.floor(diff/86400000) + '天前';
  return Math.floor(diff/604800000) + '周前';
}

function showJobToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-full text-sm font-medium z-[300] pointer-events-none text-white shadow-lg backdrop-blur-md transition-all duration-300 font-boba toast-in';
  t.style.background = 'rgba(55,65,81,0.9)';
  clearTimeout(t._jt);
  t._jt = setTimeout(function() { t.classList.remove('toast-in'); t.classList.add('toast-out'); }, 2500);
}

/* ============================================================
   Init
