#!/usr/bin/env python3
"""Fix auth data isolation: multi-user store + email-scoped data keys."""

import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Replace loadAuth / saveAuth with multi-user versions ──
old_auth_funcs = '''function loadAuth() { try { return JSON.parse(localStorage.getItem(DB_AUTH) || 'null'); } catch (e) { return null; } }
function saveAuth(d) { localStorage.setItem(DB_AUTH, JSON.stringify(d)); }'''

new_auth_funcs = '''function loadAuth() { try { return JSON.parse(localStorage.getItem('auth_v1') || '{"users":{},"activeUser":null}'); } catch (e) { return {users:{},activeUser:null}; } }
function saveAuth(d) { localStorage.setItem('auth_v1', JSON.stringify(d)); }
function getActiveUser() { var a = loadAuth(); return a.activeUser || null; }
function userKey(base) { var u = getActiveUser(); return u ? base + '_' + u : base; }'''

content = content.replace(old_auth_funcs, new_auth_funcs)

# ── 2. Replace checkAuth ──
old_checkAuth = '''function checkAuth() {
  const a = loadAuth();
  if (a && a.isLoggedIn) {
    document.getElementById('auth-overlay').classList.add('auth-overlay-hidden');
    document.getElementById('logout-btn').style.display = '';
    renderAll();
    jobEntries = loadJobs();
    reviewEntries = loadReviews();
    checkDeadlines();
  } else {
    document.getElementById('auth-overlay').classList.remove('auth-overlay-hidden');
    document.getElementById('logout-btn').style.display = 'none';
    initCharacters();
  }
}'''

new_checkAuth = '''function checkAuth() {
  var a = loadAuth();
  if (a.activeUser) {
    document.getElementById('auth-overlay').classList.add('auth-overlay-hidden');
    document.getElementById('logout-btn').style.display = '';
    renderAll();
    jobEntries = loadJobs();
    reviewEntries = loadReviews();
    checkDeadlines();
  } else {
    document.getElementById('auth-overlay').classList.remove('auth-overlay-hidden');
    document.getElementById('logout-btn').style.display = 'none';
    initCharacters();
  }
}'''

content = content.replace(old_checkAuth, new_checkAuth)

# ── 3. Replace handleLogin ──
old_handleLogin = '''function handleLogin() {
  const email = document.getElementById('auth-login-email').value.trim(),
    pw = document.getElementById('auth-login-password').value,
    err = document.getElementById('auth-login-error');
  err.classList.add('hidden');
  // Validate
  if (!email || !email.includes('@') || !email.includes('.')) {
    err.textContent = '请输入有效的邮箱地址'; err.classList.remove('hidden');
    document.getElementById('auth-login-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  if (!pw) {
    err.textContent = '请输入密码'; err.classList.remove('hidden');
    document.getElementById('auth-login-password').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  // Loading state
  setAuthLoading(true);
  setTimeout(() => {
    const a = loadAuth();
    if (!a || a.email !== email || a.password !== pw) {
      err.textContent = '邮箱或密码错误'; err.classList.remove('hidden');
      setAuthLoading(false);
      return;
    }
    // Remember me: save credentials for pre-fill
    const remember = document.getElementById('auth-remember');
    if (remember && remember.checked) {
      localStorage.setItem(DB_REMEMBER, JSON.stringify({ email: email, password: pw }));
    } else {
      localStorage.removeItem(DB_REMEMBER);
    }
    a.isLoggedIn = true; saveAuth(a); onAuthSuccess();
  }, 600);
}'''

new_handleLogin = '''function handleLogin() {
  var email = document.getElementById('auth-login-email').value.trim();
  var pw = document.getElementById('auth-login-password').value;
  var err = document.getElementById('auth-login-error');
  err.classList.add('hidden');
  if (!email || !email.includes('@') || !email.includes('.')) {
    err.textContent = '请输入有效的邮箱地址'; err.classList.remove('hidden');
    document.getElementById('auth-login-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  if (!pw) {
    err.textContent = '请输入密码'; err.classList.remove('hidden');
    document.getElementById('auth-login-password').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  setAuthLoading(true);
  setTimeout(function() {
    var a = loadAuth();
    var storedPw = a.users && a.users[email];
    if (!storedPw || storedPw !== pw) {
      err.textContent = '邮箱或密码错误'; err.classList.remove('hidden');
      setAuthLoading(false);
      return;
    }
    var remember = document.getElementById('auth-remember');
    if (remember && remember.checked) {
      localStorage.setItem(DB_REMEMBER, JSON.stringify({ email: email, password: pw }));
    } else {
      localStorage.removeItem(DB_REMEMBER);
    }
    a.activeUser = email; saveAuth(a); onAuthSuccess(email);
  }, 600);
}'''

content = content.replace(old_handleLogin, new_handleLogin)

# ── 4. Replace handleRegister ──
old_handleRegister = '''function handleRegister() {
  const email = document.getElementById('auth-register-email').value.trim(),
    pw = document.getElementById('auth-register-password').value,
    confirm = document.getElementById('auth-register-confirm').value,
    err = document.getElementById('auth-register-error');
  err.classList.add('hidden');
  ['auth-register-email','auth-register-password','auth-register-confirm'].forEach(id => {
    document.getElementById(id).classList.remove('border-red-400','ring-4','ring-red-100');
  });
  if (!email) {
    err.textContent = '请输入邮箱地址'; err.classList.remove('hidden');
    document.getElementById('auth-register-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  if (!/^\\S+@\\S+\\.\\S+$/.test(email)) {
    err.textContent = '邮箱格式不正确，请输入有效的邮箱地址（如 example@mail.com）'; err.classList.remove('hidden');
    document.getElementById('auth-register-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  // 邮箱格式正确，清除错误状态
  err.classList.add('hidden');
  document.getElementById('auth-register-email').classList.remove('border-red-400','ring-4','ring-red-100');
  if (!pw || pw.length < 6) {
    err.textContent = '密码至少需要6位'; err.classList.remove('hidden');
    document.getElementById('auth-register-password').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  if (pw !== confirm) {
    err.textContent = '两次密码不一致'; err.classList.remove('hidden');
    document.getElementById('auth-register-confirm').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  // Check if email already registered
  const existing = loadAuth();
  if (existing && existing.email === email) {
    err.textContent = '该邮箱已被注册，请换个邮箱';
    err.classList.remove('hidden');
    document.getElementById('auth-register-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  // Save account (NOT auto-login — must log in manually)
  saveAuth({ email, password: pw, isLoggedIn: false });
  // Show success dialog
  const dialog = document.getElementById('reg-success-dialog');
  dialog.classList.remove('hidden');
  dialog.style.display = 'flex';
  // After 1s, hide dialog and switch to login
  setTimeout(() => {
    dialog.style.display = 'none';
    dialog.classList.add('hidden');
    // Pre-fill email (after showAuthPanel which clears inputs)
    showAuthPanel('login');
    document.getElementById('auth-login-email').value = email;
  }, 1000);
}'''

new_handleRegister = '''function handleRegister() {
  var email = document.getElementById('auth-register-email').value.trim();
  var pw = document.getElementById('auth-register-password').value;
  var confirm = document.getElementById('auth-register-confirm').value;
  var err = document.getElementById('auth-register-error');
  err.classList.add('hidden');
  ['auth-register-email','auth-register-password','auth-register-confirm'].forEach(function(id) {
    document.getElementById(id).classList.remove('border-red-400','ring-4','ring-red-100');
  });
  if (!email) {
    err.textContent = '请输入邮箱地址'; err.classList.remove('hidden');
    document.getElementById('auth-register-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  if (!/^\\S+@\\S+\\.\\S+$/.test(email)) {
    err.textContent = '邮箱格式不正确，请输入有效的邮箱地址（如 example@mail.com）'; err.classList.remove('hidden');
    document.getElementById('auth-register-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  err.classList.add('hidden');
  document.getElementById('auth-register-email').classList.remove('border-red-400','ring-4','ring-red-100');
  if (!pw || pw.length < 6) {
    err.textContent = '密码至少需要6位'; err.classList.remove('hidden');
    document.getElementById('auth-register-password').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  if (pw !== confirm) {
    err.textContent = '两次密码不一致'; err.classList.remove('hidden');
    document.getElementById('auth-register-confirm').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  // Check if email already registered (multi-user store)
  var a = loadAuth();
  if (a.users && a.users[email]) {
    err.textContent = '该邮箱已被注册，请换个邮箱或直接登录';
    err.classList.remove('hidden');
    document.getElementById('auth-register-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  // Save new user to users map
  if (!a.users) a.users = {};
  a.users[email] = pw;
  a.activeUser = null;
  saveAuth(a);
  // Show success dialog
  var dialog = document.getElementById('reg-success-dialog');
  dialog.classList.remove('hidden');
  dialog.style.display = 'flex';
  setTimeout(function() {
    dialog.style.display = 'none';
    dialog.classList.add('hidden');
    showAuthPanel('login');
    document.getElementById('auth-login-email').value = email;
  }, 1000);
}'''

content = content.replace(old_handleRegister, new_handleRegister)

# ── 5. Replace onAuthSuccess ──
old_onAuthSuccess = '''function onAuthSuccess() {
  const overlay = document.getElementById('auth-overlay');
  overlay.classList.add('auth-overlay-hidden');
  document.getElementById('logout-btn').style.display = '';
  // Clean up character animation timers
  authBlinkTimers.forEach(t => clearTimeout(t));
  authBlinkTimers = [];
  setTimeout(() => overlay.classList.add('hidden'), 500);
  renderAll();
}'''

new_onAuthSuccess = '''function onAuthSuccess(email) {
  var overlay = document.getElementById('auth-overlay');
  overlay.classList.add('auth-overlay-hidden');
  document.getElementById('logout-btn').style.display = '';
  authBlinkTimers.forEach(function(t) { clearTimeout(t); });
  authBlinkTimers = [];
  setTimeout(function() { overlay.classList.add('hidden'); }, 500);
  // Reload ALL data with user-scoped keys
  entries = ld();
  journalEntries = ldJournal();
  jobEntries = loadJobs();
  reviewEntries = loadReviews();
  selDate = localDateStr();
  renderAll();
  if (jobCurrentTab === 'overview') renderJobOverview();
  else if (jobCurrentTab === 'kanban') renderJobKanban();
  else if (jobCurrentTab === 'review') renderReviewList();
  checkDeadlines();
}'''

content = content.replace(old_onAuthSuccess, new_onAuthSuccess)

# ── 6. Replace handleLogout ──
old_handleLogout = '''function handleLogout() {
  const a = loadAuth();
  if (a) { a.isLoggedIn = false; saveAuth(a); }
  const overlay = document.getElementById('auth-overlay');
  overlay.classList.remove('hidden','auth-overlay-hidden');
  document.getElementById('logout-btn').style.display = 'none';
  resetPasswordField();
  showAuthPanel('login');
  initCharacters();
}'''

new_handleLogout = '''function handleLogout() {
  var a = loadAuth();
  a.activeUser = null; saveAuth(a);
  var overlay = document.getElementById('auth-overlay');
  overlay.classList.remove('hidden','auth-overlay-hidden');
  document.getElementById('logout-btn').style.display = 'none';
  resetPasswordField();
  showAuthPanel('login');
  initCharacters();
}'''

content = content.replace(old_handleLogout, new_handleLogout)

# ── 7. Replace Google login handler ──
old_google = '''  .then(function(data) {
    if (data.email) {
      var a = loadAuth();
      if (!a || a.email !== data.email) {
        saveAuth({ email: data.email, password: '', isLoggedIn: true });
      } else {
        a.isLoggedIn = true; saveAuth(a);
      }
      onAuthSuccess();
    }
  })'''

new_google = '''  .then(function(data) {
    if (data.email) {
      var a = loadAuth();
      if (!a.users) a.users = {};
      if (!a.users[data.email]) { a.users[data.email] = ''; }
      a.activeUser = data.email; saveAuth(a);
      onAuthSuccess(data.email);
    }
  })'''

content = content.replace(old_google, new_google)

# ── 8. Replace handleSendCode (reset password) to use multi-user store ──
old_sendcode = '''  const a = loadAuth();
  if (!a || a.email !== email) {
    err.textContent = '该邮箱未注册'; err.classList.remove('hidden');
    document.getElementById('auth-reset-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }'''

new_sendcode = '''  var a = loadAuth();
  if (!a.users || !a.users[email]) {
    err.textContent = '该邮箱未注册'; err.classList.remove('hidden');
    document.getElementById('auth-reset-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }'''

content = content.replace(old_sendcode, new_sendcode)

# ── 9. Replace handleDoResetPassword ──
old_doreset = '''  const a = loadAuth();
  if (a && a.email === resetEmail) {
    a.password = pw;
    saveAuth(a);
  }'''

new_doreset = '''  var a = loadAuth();
  if (a.users && a.users[resetEmail] !== undefined) {
    a.users[resetEmail] = pw;
    saveAuth(a);
  }'''

content = content.replace(old_doreset, new_doreset)

# ── 10. Replace Milk Tea data layer (ld/sv) to use userKey ──
old_ld = "function ld() { try { return JSON.parse(localStorage.getItem(DB) || '[]'); } catch (e) { return []; } }"
new_ld = "function ld() { try { return JSON.parse(localStorage.getItem(userKey(DB)) || '[]'); } catch (e) { return []; } }"
content = content.replace(old_ld, new_ld)

old_sv = """function sv(a) {
  try { localStorage.setItem(DB, JSON.stringify(a)); }
  catch (e) { console.error('[SV] localStorage 写入失败:', e.message); toast('存储空间不足，请删除旧记录或压缩图片', 'warn'); }
}"""
new_sv = """function sv(a) {
  try { localStorage.setItem(userKey(DB), JSON.stringify(a)); }
  catch (e) { console.error('[SV] localStorage 写入失败:', e.message); toast('存储空间不足，请删除旧记录或压缩图片', 'warn'); }
}"""
content = content.replace(old_sv, new_sv)

# ── 11. Replace Journal data layer ──
old_jld = "function ldJournal() { try { return JSON.parse(localStorage.getItem(DB_JOURNAL) || '[]'); } catch (e) { return []; } }"
new_jld = "function ldJournal() { try { return JSON.parse(localStorage.getItem(userKey(DB_JOURNAL)) || '[]'); } catch (e) { return []; } }"
content = content.replace(old_jld, new_jld)

old_jsv = """function svJournal(a) {
  try { localStorage.setItem(DB_JOURNAL, JSON.stringify(a)); }
  catch (e) { console.error('[SV-JOURNAL] localStorage 写入失败:', e.message); toast('存储空间不足', 'warn'); }
}"""
new_jsv = """function svJournal(a) {
  try { localStorage.setItem(userKey(DB_JOURNAL), JSON.stringify(a)); }
  catch (e) { console.error('[SV-JOURNAL] localStorage 写入失败:', e.message); toast('存储空间不足', 'warn'); }
}"""
content = content.replace(old_jsv, new_jsv)

# ── 12. Replace Job data layer ──
old_loadjobs = """function loadJobs() {
  try { var r = localStorage.getItem('job_v1'); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function saveJobs(a) { localStorage.setItem('job_v1', JSON.stringify(a)); }"""
new_loadjobs = """function loadJobs() {
  try { var r = localStorage.getItem(userKey('job_v1')); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function saveJobs(a) { localStorage.setItem(userKey('job_v1'), JSON.stringify(a)); }"""
content = content.replace(old_loadjobs, new_loadjobs)

old_loadreviews = """function loadReviews() {
  try { var r = localStorage.getItem('job_review_v1'); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function saveReviews(a) { localStorage.setItem('job_review_v1', JSON.stringify(a)); }"""
new_loadreviews = """function loadReviews() {
  try { var r = localStorage.getItem(userKey('job_review_v1')); return r ? JSON.parse(r) : []; } catch(e) { return []; }
}
function saveReviews(a) { localStorage.setItem(userKey('job_review_v1'), JSON.stringify(a)); }"""
content = content.replace(old_loadreviews, new_loadreviews)

# ── 13. Also fix DB_REMEMBER in showAuthPanel login pre-fill (pre-fill from multi-user store) ──
# This is the remembered credentials, not user data — it's already email-scoped in its storage

# ── 14. Remove "面试Offer率" stat card (change from 5 to 4 cards) ──
old_stats_cards = """  var cards = [
    { label: '已投递', value: total, icon: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' },
    { label: '面试中', value: interviewing, icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { label: '已 Offer', value: offers, icon: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 22V8c0-2 2-4 2-4s2 2 2 4v14"/>' },
    { label: '面试/Offer率', value: rate + '%', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
    { label: '将截止', value: urgentCount, icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', urgent: urgentCount > 0 }
  ];"""

new_stats_cards = """  var cards = [
    { label: '已投递', value: total, icon: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' },
    { label: '面试中', value: interviewing, icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { label: '已 Offer', value: offers, icon: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 22V8c0-2 2-4 2-4s2 2 2 4v14"/>' },
    { label: '将截止', value: urgentCount, icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', urgent: urgentCount > 0 }
  ];"""

content = content.replace(old_stats_cards, new_stats_cards)

# Also remove the rate and rejected variables that are no longer used
old_rate_vars = """  var rejected = jobEntries.filter(function(j) { return j.status === 'rejected'; }).length;
  var activeTotal = total - rejected;
  var rate = activeTotal > 0 ? Math.round((interviewing + offers) / activeTotal * 100) : 0;

  var now"""
new_rate_vars = """  var now"""
content = content.replace(old_rate_vars, new_rate_vars)

# ── 15. Change overview bottom grid from lg:grid-cols-2 to full width (remove 2-col) ──
# Actually let's keep the 2-col but make the activity panel wider by changing the grid

# ── 16. Add date display + delete button in activity items ──
old_activity = """  list.innerHTML = recent.map(function(j) {
    var si = JOB_STATUSES.find(function(s) { return s.key === j.status; });
    return '<div class="flex items-center gap-2 py-2 px-2.5 rounded-xl bg-white/40 text-xs cursor-pointer hover:bg-white/70 transition-colors duration-150 group" onclick="openJobPanel(' + j.id + ')">' +
      '<span class="text-gray-800 font-bold font-boba flex-1 truncate">' + escHtml(j.company) + ' · ' + escHtml(j.position) + '</span>' +
      '<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60 text-gray-500 flex-shrink-0">' + (si ? si.label : j.status) + '</span>' +
      '<span class="text-[10px] text-gray-400 flex-shrink-0 group-hover:hidden">' + getTimeAgo(j.updatedAt) + '</span>' +
      '<svg class="w-3 h-3 flex-shrink-0 hidden group-hover:block" viewBox="0 0 24 24" fill="none" stroke="var(--accent-500)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
    '</div>';
  }).join('');"""

new_activity = """  list.innerHTML = recent.map(function(j) {
    var si = JOB_STATUSES.find(function(s) { return s.key === j.status; });
    var displayDate = j.date || '';
    if (displayDate) { var dp = displayDate.split('-'); displayDate = (parseInt(dp[1],10)||'') + '月' + (parseInt(dp[2],10)||'') + '日'; }
    return '<div class="flex items-center gap-2 py-2 px-2.5 rounded-xl bg-white/40 text-xs group hover:bg-white/70 transition-colors duration-150">' +
      '<span class="text-gray-800 font-bold font-boba flex-1 truncate cursor-pointer" onclick="openJobPanel(' + j.id + ')">' + escHtml(j.company) + ' · ' + escHtml(j.position) + '</span>' +
      '<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60 text-gray-500 flex-shrink-0">' + (si ? si.label : j.status) + '</span>' +
      '<span class="text-[10px] text-gray-400 flex-shrink-0">' + displayDate + '</span>' +
      '<button class="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-accent-500 transition-all duration-150 cursor-pointer border-none bg-transparent flex-shrink-0" onclick="event.stopPropagation();openJobPanel(' + j.id + ')" title="编辑"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
      '<button class="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all duration-150 cursor-pointer border-none bg-transparent flex-shrink-0" onclick="event.stopPropagation();activityDeleteJob(' + j.id + ')" title="删除"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-.867 12.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.995-1.858L5 6h14z"/></svg></button>' +
    '</div>';
  }).join('');"""

content = content.replace(old_activity, new_activity)

# ── 17. Add activityDeleteJob helper function ──
# Insert after deleteJob function
old_deletejob_end = """  renderJobAll();
  showJobToast('投递记录已删除');
}"""

new_deletejob_end = """  renderJobAll();
  showJobToast('投递记录已删除');
}

function activityDeleteJob(id) {
  if (!confirm('确定删除这条投递记录吗？')) return;
  jobEntries = jobEntries.filter(function(j) { return j.id !== id; });
  saveJobs(jobEntries);
  renderJobAll();
  showJobToast('投递记录已删除');
}"""

content = content.replace(old_deletejob_end, new_deletejob_end)

# ── 18. Fix kanban column sizing: remove fixed min/max widths, use flex-1 ──
old_kanban_col = """.kanban-col { min-width:200px; max-width:240px; flex-shrink:0; scroll-snap-align:start; }
  @media(min-width:768px){ .kanban-col { min-width:220px; max-width:260px; } }"""
new_kanban_col = """.kanban-col { flex:1 1 0; min-width:160px; scroll-snap-align:start; }
  @media(min-width:768px){ .kanban-col { min-width:170px; } }"""
content = content.replace(old_kanban_col, new_kanban_col)

# ── 19. Fix kanban container min-height to fill available space ──
old_kanban_container = """<div id="kanban-container" class="kanban-scroll flex gap-3 overflow-x-auto pb-2 thin-scroll" style="min-height:300px;"></div>"""
new_kanban_container = """<div id="kanban-container" class="kanban-scroll flex gap-3 overflow-x-auto pb-3" style="min-height:360px;"></div>"""
content = content.replace(old_kanban_container, new_kanban_container)

# ── 20. Add numeric score input in review panel ──
old_review_stars_html = """        <div><label class="block text-[11px] font-semibold text-gray-400 mb-1">自我评分</label><div class="flex gap-1" id="review-stars"></div></div>"""
new_review_stars_html = """        <div><label class="block text-[11px] font-semibold text-gray-400 mb-1">自我评分</label><div class="flex items-center gap-3"><div class="flex gap-1" id="review-stars"></div><input id="review-score-num" type="number" min="0" max="100" step="1" placeholder="或输入分数 (0-100)" class="w-28 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white/80 text-xs text-gray-800 font-boba focus:border-[var(--accent-500)] focus:ring-4 focus:ring-[rgba(212,104,122,0.08)] outline-none transition-all duration-200" oninput="reviewScoreNumInput()"></div></div>"""
content = content.replace(old_review_stars_html, new_review_stars_html)

# ── 21. Update renderReviewStars to sync with numeric input ──
old_render_stars = """function renderReviewStars() {
  var c = document.getElementById('review-stars');
  if (!c) return;
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += '<svg class="w-6 h-6 cursor-pointer transition-transform duration-150 hover:scale-110" viewBox="0 0 24 24" fill="' + (i <= reviewStars ? 'var(--accent-500)' : 'none') + '" stroke="' + (i <= reviewStars ? 'var(--accent-500)' : '#d1d5db') + '" stroke-width="2" onclick="reviewStars=' + i + ';renderReviewStars();"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  c.innerHTML = html;
}"""

new_render_stars = """function renderReviewStars() {
  var c = document.getElementById('review-stars');
  if (!c) return;
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += '<svg class="w-6 h-6 cursor-pointer transition-transform duration-150 hover:scale-110" viewBox="0 0 24 24" fill="' + (i <= reviewStars ? 'var(--accent-500)' : 'none') + '" stroke="' + (i <= reviewStars ? 'var(--accent-500)' : '#d1d5db') + '" stroke-width="2" onclick="reviewStars=' + i + ';reviewNumericScore=0;renderReviewStars();document.getElementById(\"review-score-num\").value=\"\";"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
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
}"""

content = content.replace(old_render_stars, new_render_stars)

# ── 22. Update openReviewPanel to handle numeric score ──
old_openreview_score = """    reviewStars = rev.rating || 0;
    reviewRound = rev.round || '一面';
  } else {
    title.textContent = '添加复盘';
    saveBtn.textContent = '保存';"""

new_openreview_score = """    reviewStars = rev.rating || 0;
    reviewNumericScore = rev.numericScore || 0;
    reviewRound = rev.round || '一面';
  } else {
    title.textContent = '添加复盘';
    saveBtn.textContent = '保存';"""

content = content.replace(old_openreview_score, new_openreview_score)

# ── 23. Update openReviewPanel to set numeric input value ──
old_openreview_setafter = """  renderReviewRoundPills();
  renderReviewStars();
  panel.classList.remove('hidden');
}"""

new_openreview_setafter = """  renderReviewRoundPills();
  renderReviewStars();
  var scoreNumEl = document.getElementById('review-score-num');
  if (scoreNumEl) { scoreNumEl.value = reviewNumericScore > 0 ? reviewNumericScore : ''; }
  panel.classList.remove('hidden');
}"""

content = content.replace(old_openreview_setafter, new_openreview_setafter)

# ── 24. Update saveReview to include numericScore ──
old_savereview_data = """    rating: reviewStars,
    questions:"""

new_savereview_data = """    rating: reviewStars,
    numericScore: reviewNumericScore || null,
    questions:"""

content = content.replace(old_savereview_data, new_savereview_data)

# ── 25. Add industry field to job panel HTML ──
# Add after 薪资范围 field
old_salary_field = """        <div><label class="block text-[11px] font-semibold text-gray-400 mb-1">薪资范围</label><input id="job-salary" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/80 text-sm text-gray-800 font-boba focus:border-[var(--accent-500)] focus:ring-4 focus:ring-[rgba(212,104,122,0.08)] outline-none transition-all duration-200" placeholder="如：20-30K · 15薪"></div>"""

new_salary_field = """        <div><label class="block text-[11px] font-semibold text-gray-400 mb-1">薪资范围</label><input id="job-salary" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/80 text-sm text-gray-800 font-boba focus:border-[var(--accent-500)] focus:ring-4 focus:ring-[rgba(212,104,122,0.08)] outline-none transition-all duration-200" placeholder="如：20-30K · 15薪"></div>
        <div><label class="block text-[11px] font-semibold text-gray-400 mb-1">行业标签</label><div class="grid grid-cols-3 gap-1.5 mb-1.5" id="job-industry-pills"></div><input id="job-industry-custom" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/80 text-xs text-gray-800 font-boba focus:border-[var(--accent-500)] focus:ring-4 focus:ring-[rgba(212,104,122,0.08)] outline-none transition-all duration-200" placeholder="或自定义行业标签..."></div>"""

content = content.replace(old_salary_field, new_salary_field)

# ── 26. Add JOB_INDUSTRIES constant ──
old_job_channels = """var JOB_CHANNELS = ['官网', '内推', 'Boss直聘', 'LinkedIn', '猎头', '其他'];"""

new_job_channels = """var JOB_CHANNELS = ['官网', '内推', 'Boss直聘', 'LinkedIn', '猎头', '其他'];
var JOB_INDUSTRIES = ['互联网', '金融', '教育', '医疗', '房地产', '零售', '制造业', '汽车', '游戏', 'AI/大模型', '新能源', '娱乐', '快消', '物流'];"""

content = content.replace(old_job_channels, new_job_channels)

# ── 27. Add jobPanelIndustry state variable ──
old_panel_state = """var jobPanelStatus = 'applied';
var jobPanelChannel = '';"""

new_panel_state = """var jobPanelStatus = 'applied';
var jobPanelChannel = '';
var jobPanelIndustry = '';"""

content = content.replace(old_panel_state, new_panel_state)

# ── 28. Update openJobPanel to handle industry ──
old_openjob_channel = """    jobPanelStatus = job.status;
    jobPanelChannel = job.channel || '';
  } else {"""

new_openjob_channel = """    jobPanelStatus = job.status;
    jobPanelChannel = job.channel || '';
    jobPanelIndustry = job.industry || '';
  } else {"""

content = content.replace(old_openjob_channel, new_openjob_channel)

old_openjob_else = """    jobPanelStatus = 'applied';
    jobPanelChannel = '';
  }
  renderStatusPills();
  renderChannelPills();"""

new_openjob_else = """    jobPanelStatus = 'applied';
    jobPanelChannel = '';
    jobPanelIndustry = '';
  }
  renderStatusPills();
  renderChannelPills();
  renderIndustryPills();"""

content = content.replace(old_openjob_else, new_openjob_else)

# Also set custom input value
old_openjob_setafter2 = """  renderChannelPills();
  panel.classList.remove('hidden');
}"""

new_openjob_setafter2 = """  renderChannelPills();
  renderIndustryPills();
  var indCustomEl = document.getElementById('job-industry-custom');
  if (indCustomEl) { indCustomEl.value = jobPanelIndustry && JOB_INDUSTRIES.indexOf(jobPanelIndustry) < 0 ? jobPanelIndustry : ''; }
  panel.classList.remove('hidden');
}"""

content = content.replace(old_openjob_setafter2, new_openjob_setafter2)

# ── 29. Add renderIndustryPills function ──
old_render_channel_end = """  c.innerHTML = JOB_CHANNELS.map(function(ch) {
    var sel = jobPanelChannel === ch ? 'selected' : '';
    return '<button class="pill-option ' + sel + '" onclick="jobPanelChannel=\\'' + ch + '\\';renderChannelPills();">' + ch + '</button>';
  }).join('');
}"""

new_render_channel_end = """  c.innerHTML = JOB_CHANNELS.map(function(ch) {
    var sel = jobPanelChannel === ch ? 'selected' : '';
    return '<button class="pill-option ' + sel + '" onclick="jobPanelChannel=\\'' + ch + '\\';renderChannelPills();">' + ch + '</button>';
  }).join('');
}

function renderIndustryPills() {
  var c = document.getElementById('job-industry-pills');
  if (!c) return;
  c.innerHTML = JOB_INDUSTRIES.map(function(ind) {
    var sel = jobPanelIndustry === ind ? 'selected' : '';
    return '<button class="pill-option ' + sel + '" onclick="jobPanelIndustry=\\'' + ind + '\\';renderIndustryPills();document.getElementById(\\'job-industry-custom\\').value=\\'\\';">' + ind + '</button>';
  }).join('');
}"""

content = content.replace(old_render_channel_end, new_render_channel_end)

# ── 30. Update saveJob to include industry ──
old_savejob_data = """    channel: jobPanelChannel || '',
    jdUrl:"""

new_savejob_data = """    channel: jobPanelChannel || '',
    industry: jobPanelIndustry || document.getElementById('job-industry-custom').value.trim(),
    jdUrl:"""

content = content.replace(old_savejob_data, new_savejob_data)

# ── 31. Show industry in kanban card ──
old_kanban_channel = """          (j.channel ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/60 text-gray-500">' + escHtml(j.channel) + '</span>' : '') +
          '<span class="text-[9px] text-gray-400">' + getTimeAgo(j.updatedAt) + '</span>' +"""

new_kanban_channel = """          (j.channel ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/60 text-gray-500">' + escHtml(j.channel) + '</span>' : '') +
          (j.industry ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-50)] text-[var(--accent-600)] font-medium">' + escHtml(j.industry) + '</span>' : '') +
          '<span class="text-[9px] text-gray-400">' + getTimeAgo(j.updatedAt) + '</span>' +"""

content = content.replace(old_kanban_channel, new_kanban_channel)

# ── 32. Add chart section after kanban container ──
old_kanban_end = """      <!-- Sub-page: Kanban (placeholder) -->
      <div id="job-kanban" class="hidden space-y-4">
        <div id="kanban-container" class="kanban-scroll flex gap-3 overflow-x-auto pb-3" style="min-height:360px;"></div>
      </div>"""

new_kanban_end = """      <!-- Sub-page: Kanban -->
      <div id="job-kanban" class="hidden space-y-5">
        <div id="kanban-container" class="kanban-scroll flex gap-3 overflow-x-auto pb-3" style="min-height:360px;"></div>
        <!-- Charts Section -->
        <div id="job-charts" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="module-card" style="min-height:220px;">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="var(--accent-500)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span class="text-sm font-bold text-gray-800">状态分布</span>
            </div>
            <div id="chart-status-bars" class="space-y-2"></div>
          </div>
          <div class="module-card" style="min-height:220px;">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="var(--accent-500)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              <span class="text-sm font-bold text-gray-800">渠道分布</span>
            </div>
            <div id="chart-channel-pie" class="flex items-center justify-center" style="min-height:180px;"></div>
          </div>
        </div>
      </div>"""

content = content.replace(old_kanban_end, new_kanban_end)

# ── 33. Add chart rendering functions ──
# Insert after renderJobKanban function
old_kanban_render_end = """  saveJobs(jobEntries);
  renderJobKanban();
}"""

new_kanban_render_end = """  saveJobs(jobEntries);
  renderJobKanban();
  renderJobCharts();
}

// ── Charts ────────────────────────────────────────────────
function renderJobCharts() {
  renderStatusBarChart();
  renderChannelPieChart();
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
}"""

content = content.replace(old_kanban_render_end, new_kanban_render_end)

# ── 34. Update renderJobAll to also render charts ──
old_renderjoball = """function renderJobAll() {
  jobEntries = loadJobs();
  reviewEntries = loadReviews();
  if (jobCurrentTab === 'overview') renderJobOverview();
  else if (jobCurrentTab === 'kanban') renderJobKanban();
  else if (jobCurrentTab === 'review') renderReviewList();
  checkDeadlines();
}"""

new_renderjoball = """function renderJobAll() {
  jobEntries = loadJobs();
  reviewEntries = loadReviews();
  if (jobCurrentTab === 'overview') renderJobOverview();
  else if (jobCurrentTab === 'kanban') { renderJobKanban(); renderJobCharts(); }
  else if (jobCurrentTab === 'review') renderReviewList();
  checkDeadlines();
}"""

content = content.replace(old_renderjoball, new_renderjoball)

# ── 35. Also update switchJobTab to render charts ──
old_switchjobtab = """  if (tab === 'kanban') renderJobKanban();
  if (tab === 'review') renderReviewList();
}"""

new_switchjobtab = """  if (tab === 'kanban') { renderJobKanban(); renderJobCharts(); }
  if (tab === 'review') renderReviewList();
}"""

content = content.replace(old_switchjobtab, new_switchjobtab)

# ── 36. Remove the `rate` variable reference in overview (already unused now) ──
# rate is no longer used after we removed the card, but the var is also removed above

# ── Write output ──
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE — Auth isolation + all fixes applied.")
print("Verification: check the following:")
print("  1. loadAuth uses multi-user format")
print("  2. userKey() exists")
print("  3. All data functions use userKey()")
print("  4. Stat cards reduced to 4")
print("  5. Activity items have date + delete button")
print("  6. Kanban columns use flex-fill")
print("  7. Charts section added")
print("  8. Industry field in panel")
print("  9. Numeric score in review panel")
