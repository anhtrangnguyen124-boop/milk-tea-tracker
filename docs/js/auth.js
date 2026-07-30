// auth.js — reference copy from index.html

/* ============================================================
   Auth — Local Account + Animated Characters
   ============================================================ */
const DB_AUTH = 'auth_v1', DB_REMEMBER = 'auth_remember';
let authMouseX = 0, authMouseY = 0, authTyping = false, authBlinkTimers = [];
let resetCode = null, resetEmail = '';  // 密码重置流程状态
let authFocusTarget = 'none'; // 'none' | 'email' | 'password'
let isPurplePeeking = false, purplePeekTimer = null;
let isLookingAtEachOther = false, lookEachOtherTimer = null;

function loadAuth() {
  try {
    var raw = localStorage.getItem('auth_v1');
    if (!raw) return {users:{},activeUser:null};
    var d = JSON.parse(raw);
    // Migrate old single-user format to multi-user format
    if (d.email && !d.users) {
      var migrated = { users: {}, activeUser: d.isLoggedIn ? d.email : null };
      migrated.users[d.email] = d.password;
      localStorage.setItem('auth_v1', JSON.stringify(migrated));
      return migrated;
    }
    return d;
  } catch (e) { return {users:{},activeUser:null}; }
}
function saveAuth(d) { localStorage.setItem('auth_v1', JSON.stringify(d)); }
function getActiveUser() { var a = loadAuth(); return a.activeUser || null; }
function userKey(base) { var u = getActiveUser(); return u ? base + '_' + u : base; }

// ── Character Animation Engine ──
function initCharacters() {
  const stage = document.getElementById('auth-overlay');
  if (!stage) return;

  // Track mouse position
  stage.addEventListener('mousemove', (e) => { authMouseX = e.clientX; authMouseY = e.clientY; });

  // Set up blinking for characters with white eyes (purple + black)
  setupBlink('char-purple');
  setupBlink('char-black');

  // Start the animation loop
  requestAnimationFrame(animChars);

  // Hide swipe hints after first horizontal scroll
  const swipeContainer = stage.querySelector('.snap-x');
  if (swipeContainer) {
    let hintHidden = false;
    swipeContainer.addEventListener('scroll', () => {
      if (hintHidden) return;
      hintHidden = true;
      swipeContainer.querySelectorAll('.swipe-hint').forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s ease';
      });
    }, { once: false });
  }
}

function setupBlink(charId) {
  function schedule() {
    const delay = Math.random() * 4000 + 3000; // 3-7s
    const timer = setTimeout(() => {
      const el = document.getElementById(charId);
      if (!el) return;
      const eyes = el.querySelectorAll('.char-eye');
      eyes.forEach(eye => { eye.style.transform = 'scaleY(0.1)'; });
      setTimeout(() => {
        eyes.forEach(eye => { eye.style.transform = 'scaleY(1)'; });
        schedule();
      }, 150);
    }, delay);
    authBlinkTimers.push(timer);
  }
  schedule();
}

function calcFace(bodyId) {
  const body = document.getElementById(bodyId);
  if (!body) return { faceX: 0, faceY: 0 };
  const rect = body.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 3;
  const dx = authMouseX - cx;
  const dy = authMouseY - cy;
  return {
    faceX: Math.max(-15, Math.min(15, dx / 20)),
    faceY: Math.max(-10, Math.min(10, dy / 30)),
  };
}

function animChars() {
  const pwInput = document.getElementById('auth-login-password');
  const pwValue = pwInput ? pwInput.value : '';
  const pwVisible = pwInput && pwInput.type === 'text' && pwValue.length > 0;
  const typingActive = authTyping || (pwValue.length > 0 && !pwVisible);
  const bodies = document.querySelectorAll('#characters-container .char-body');
  const allPupils = document.querySelectorAll('#characters-container .char-pupil, #characters-container .char-pupil-alone');

  // ── Compute mouse-based skew & face per character ──
  const bodySkews = {};
  const faces = {};
  bodies.forEach(body => {
    const rect = body.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    bodySkews[body.id] = Math.max(-6, Math.min(6, -(authMouseX - cx) / 120));
    faces[body.id] = calcFace(body.id);
  });

  // ── Default eye positions (used as base + face offset) ──
  const defaultEyes = {
    'char-purple':  { left: 45, top: 40,  pupilForce: null },
    'char-black':   { left: 26, top: 32,  pupilForce: null },
    'char-orange':  { left: 82, top: 90,  pupilForce: null, isPupilAlone: true },
    'char-yellow':  { left: 52, top: 40,  pupilForce: null, isPupilAlone: true, mouth: { left: 40, top: 88 } },
  };

  // ═══════════════════════════════════════════════════════════
  // State machine (priority order)
  // ═══════════════════════════════════════════════════════════
  const purple = document.getElementById('char-purple');
  const black = document.getElementById('char-black');

  if (pwVisible) {
    // ═══ Mode 1: Password VISIBLE → stand straight, eyes to side ═══
    bodies.forEach(body => {
      body.style.transformOrigin = 'bottom center';
      body.style.transform = 'skewX(0deg)';
      body.dataset.manualPose = '1';
    });
    if (purple) purple.style.height = '400px';
    // Eyes shift to the left side (looking away from password)
    setEyes('char-purple', 20, 35, true);
    setEyes('char-black', 10, 28, true);
    setEyes('char-orange', 50, 85, true);
    setEyes('char-yellow', 20, 35, true);
    setMouth('char-yellow', 10, 88, true);
    // Force pupils to look away (left)
    forceAllPupils(allPupils, -4, -4);
    // Purple peeking: change pupil forceLook direction
    if (isPurplePeeking) {
      forceCharPupils('char-purple', 4, 5);
    }
  } else if (isLookingAtEachOther) {
    // ═══ Mode 2: Looking at each other (800ms after focus) ═══
    bodies.forEach(body => {
      body.style.transformOrigin = 'bottom center';
      if (body.id === 'char-black') {
        body.style.transform = `skewX(${(bodySkews['char-black'] || 0) * 1.5 + 10}deg) translateX(20px)`;
        body.dataset.manualPose = '1';
      } else if (body.id === 'char-purple') {
        body.style.transform = `skewX(${bodySkews['char-purple'] || 0}deg)`;
        body.dataset.manualPose = '1';
      } else {
        body.style.transform = `skewX(${bodySkews[body.id] || 0}deg)`;
        body.dataset.manualPose = '';
      }
    });
    if (purple) purple.style.height = '400px';
    setEyes('char-purple', 55, 65, true);
    setEyes('char-black', 32, 12, true);
    setEyes('char-orange', 82 + faces['char-orange'].faceX, 90 + faces['char-orange'].faceY, false);
    setEyes('char-yellow', 52 + faces['char-yellow'].faceX, 40 + faces['char-yellow'].faceY, false);
    setMouth('char-yellow', 40 + faces['char-yellow'].faceX, 88 + faces['char-yellow'].faceY, false);
    forceCharPupils('char-purple', 3, 4);
    forceCharPupils('char-black', 0, -4);
    // Orange/yellow normal mouse tracking
    trackPupilByMouse('char-orange');
    trackPupilByMouse('char-yellow');
  } else if (typingActive) {
    // ═══ Mode 3: Typing → purple stretches + leans, black exaggerated lean ═══
    bodies.forEach(body => {
      body.style.transformOrigin = 'bottom center';
      if (body.id === 'char-purple') {
        body.style.height = '440px';
        body.style.transform = `skewX(${(bodySkews['char-purple'] || 0) - 12}deg) translateX(40px)`;
        body.dataset.manualPose = '1';
      } else if (body.id === 'char-black') {
        body.style.transform = `skewX(${(bodySkews['char-black'] || 0) * 1.5}deg)`;
        body.dataset.manualPose = '1';
      } else {
        body.style.transform = `skewX(${bodySkews[body.id] || 0}deg)`;
        body.dataset.manualPose = '';
      }
    });
    // Eyes follow face positions normally
    setEyes('char-purple', 45 + faces['char-purple'].faceX, 40 + faces['char-purple'].faceY, false);
    setEyes('char-black', 26 + faces['char-black'].faceX, 32 + faces['char-black'].faceY, false);
    setEyes('char-orange', 82 + faces['char-orange'].faceX, 90 + faces['char-orange'].faceY, false);
    setEyes('char-yellow', 52 + faces['char-yellow'].faceX, 40 + faces['char-yellow'].faceY, false);
    setMouth('char-yellow', 40 + faces['char-yellow'].faceX, 88 + faces['char-yellow'].faceY, false);
    // Normal mouse pupil tracking
    trackAllPupils(allPupils);
  } else {
    // ═══ Mode 4: Default — mouse-following skewX ═══
    bodies.forEach(body => {
      body.dataset.manualPose = '';
      body.style.transformOrigin = 'bottom center';
      body.style.transform = `skewX(${bodySkews[body.id] || 0}deg)`;
    });
    if (purple) purple.style.height = '400px';
    // Eyes follow face positions
    setEyes('char-purple', 45 + faces['char-purple'].faceX, 40 + faces['char-purple'].faceY, false);
    setEyes('char-black', 26 + faces['char-black'].faceX, 32 + faces['char-black'].faceY, false);
    setEyes('char-orange', 82 + faces['char-orange'].faceX, 90 + faces['char-orange'].faceY, false);
    setEyes('char-yellow', 52 + faces['char-yellow'].faceX, 40 + faces['char-yellow'].faceY, false);
    setMouth('char-yellow', 40 + faces['char-yellow'].faceX, 88 + faces['char-yellow'].faceY, false);
    // Normal mouse pupil tracking
    trackAllPupils(allPupils);
  }

  requestAnimationFrame(animChars);
}

// ── Helpers ──
function setEyes(charId, left, top, force) {
  const char = document.getElementById(charId);
  if (!char) return;
  const eyesDiv = char.querySelector('.char-eyes');
  if (!eyesDiv) return;
  // If force=true, skip transition for instant reposition
  if (force) eyesDiv.style.transition = 'none';
  else eyesDiv.style.transition = '';
  eyesDiv.style.left = left + 'px';
  eyesDiv.style.top = top + 'px';
  // Ensure both eyes visible
  eyesDiv.querySelectorAll('.char-eye, .char-pupil-alone').forEach(el => { el.style.opacity = '1'; });
}

function setMouth(charId, left, top, force) {
  const char = document.getElementById(charId);
  if (!char) return;
  const mouth = char.querySelector('.char-mouth');
  if (!mouth) return;
  if (force) mouth.style.transition = 'none';
  else mouth.style.transition = '';
  mouth.style.left = left + 'px';
  mouth.style.top = top + 'px';
  mouth.style.opacity = force ? '0' : '1';
}

function forceAllPupils(pupils, tx, ty) {
  pupils.forEach(p => { p.style.transform = `translate(${tx}px, ${ty}px)`; });
}

function forceCharPupils(charId, tx, ty) {
  const char = document.getElementById(charId);
  if (!char) return;
  char.querySelectorAll('.char-pupil, .char-pupil-alone').forEach(p => {
    p.style.transform = `translate(${tx}px, ${ty}px)`;
  });
}

function trackPupilByMouse(charId) {
  const char = document.getElementById(charId);
  if (!char) return;
  char.querySelectorAll('.char-pupil, .char-pupil-alone').forEach(pupil => {
    const rect = pupil.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dx = authMouseX - cx, dy = authMouseY - cy;
    const maxDist = pupil.classList.contains('char-pupil-alone') ? 5 : 4;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
    const angle = Math.atan2(dy, dx);
    pupil.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
  });
}

function trackAllPupils(pupils) {
  pupils.forEach(pupil => {
    const rect = pupil.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dx = authMouseX - cx, dy = authMouseY - cy;
    const maxDist = pupil.classList.contains('char-pupil-alone') ? 5 : 4;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
    const angle = Math.atan2(dy, dx);
    pupil.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
  });
}

// ── Auth Input Focus/Blur (for character reactions) ──
function onAuthInputFocus(el) {
  authTyping = true;
  authFocusTarget = (el && el.type === 'email') ? 'email' : 'password';
  // Trigger "looking at each other" animation
  isLookingAtEachOther = true;
  clearTimeout(lookEachOtherTimer);
  lookEachOtherTimer = setTimeout(() => { isLookingAtEachOther = false; }, 800);
}
function onAuthInputBlur() {
  setTimeout(() => { authTyping = false; authFocusTarget = 'none'; }, 200);
}

// ── Password Toggle ──
function togglePwVisibility(btn) {
  const input = btn.parentElement.querySelector('input');
  const eyeOn = btn.querySelector('.auth-eye-on');
  const eyeOff = btn.querySelector('.auth-eye-off');
  if (!input) return;
  if (input.type === 'password') {
    // Show password
    input.type = 'text'; if (eyeOn) eyeOn.classList.add('hidden'); if (eyeOff) eyeOff.classList.remove('hidden');
    // Start purple peeking
    if (input.value.length > 0) schedulePurplePeek();
  } else {
    // Hide password
    input.type = 'password'; if (eyeOn) eyeOn.classList.remove('hidden'); if (eyeOff) eyeOff.classList.add('hidden');
    // Stop peeking if no other password is visible
    if (!isAnyPasswordVisible()) cancelPurplePeek();
  }
}

function isAnyPasswordVisible() {
  return Array.from(document.querySelectorAll('#auth-login-password, #auth-register-password, #auth-register-confirm')).some(
    input => input.type === 'text' && input.value.length > 0
  );
}

function schedulePurplePeek() {
  cancelPurplePeek();
  purplePeekTimer = setTimeout(() => {
    isPurplePeeking = true;
    setTimeout(() => {
      isPurplePeeking = false;
      // Re-schedule if ANY password field is still visible and has content
      if (isAnyPasswordVisible()) {
        schedulePurplePeek();
      }
    }, 800);
  }, Math.random() * 3000 + 2000);
}

function cancelPurplePeek() {
  if (purplePeekTimer) { clearTimeout(purplePeekTimer); purplePeekTimer = null; }
  isPurplePeeking = false;
}

function resetPasswordField() {
  // Reset all password inputs to hidden
  document.querySelectorAll('#auth-login-password, #auth-register-password, #auth-register-confirm').forEach(input => {
    input.type = 'password';
  });
  // Reset all eye icons to "eye-on" state
  document.querySelectorAll('.auth-eye-on').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('.auth-eye-off').forEach(el => el.classList.add('hidden'));
  cancelPurplePeek();
}

// ── Core Auth ──
function checkAuth() {
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
}

function showAuthPanel(mode) {
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isReset = mode === 'reset';
  document.getElementById('auth-panel-login').classList.toggle('hidden', !isLogin);
  document.getElementById('auth-panel-register').classList.toggle('hidden', !isRegister);
  document.getElementById('auth-panel-reset').classList.toggle('hidden', !isReset);
  document.getElementById('auth-title').textContent = isLogin ? '欢迎回来' : isRegister ? '创建账户' : '重置密码';
  // Reset password field to hidden + eye icon
  resetPasswordField();
  // Clear all inputs and errors
  ['auth-login-email','auth-login-password','auth-register-email','auth-register-password','auth-register-confirm','auth-reset-email','auth-reset-code','auth-reset-new-pw','auth-reset-confirm-pw'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
    if (el) { el.classList.remove('border-red-400','ring-4','ring-red-100'); }
  });
  document.getElementById('auth-login-error').classList.add('hidden');
  document.getElementById('auth-register-error').classList.add('hidden');
  const resetErr = document.getElementById('auth-reset-error'); if (resetErr) resetErr.classList.add('hidden');
  // Reset button state
  resetAuthBtn();
  // Pre-fill remembered credentials when showing login
  if (isLogin) {
    try {
      const remembered = JSON.parse(localStorage.getItem(DB_REMEMBER) || 'null');
      if (remembered && remembered.email) {
        document.getElementById('auth-login-email').value = remembered.email;
        document.getElementById('auth-login-password').value = remembered.password || '';
        document.getElementById('auth-remember').checked = true;
      }
    } catch(e) {}
  }
  // Reset password form: show step 1, hide steps 2/3, reset dots
  if (isReset) {
    document.getElementById('reset-step-1').classList.remove('hidden');
    document.getElementById('reset-step-2').classList.add('hidden');
    document.getElementById('reset-step-3').classList.add('hidden');
    updateResetStepDots(1);
    resetCode = null; resetEmail = '';
  }
  // Play animation on the newly visible panel
  const panelId = isLogin ? 'auth-panel-login' : isRegister ? 'auth-panel-register' : 'auth-panel-reset';
  const panel = document.getElementById(panelId);
  panel.classList.add('animate-auth-panel-in');
  panel.addEventListener('animationend', () => panel.classList.remove('animate-auth-panel-in'), { once: true });
}

function resetAuthBtn() {
  const btnText = document.getElementById('auth-login-btn-text');
  const spinner = document.getElementById('auth-login-spinner');
  if (btnText) btnText.textContent = '登录';
  if (spinner) spinner.remove();
}

function setAuthLoading(loading) {
  const btnText = document.getElementById('auth-login-btn-text');
  if (!btnText) return;
  if (loading) {
    btnText.innerHTML = '<span class="auth-spinner" id="auth-login-spinner"></span> 登录中...';
  } else {
    resetAuthBtn();
  }
}

function handleLogin() {
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
}

function handleRegister() {
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
  if (!/^\S+@\S+\.\S+$/.test(email)) {
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
}

// ── Forgot Password ──
function handleSendCode() {
  const email = document.getElementById('auth-reset-email').value.trim(),
    err = document.getElementById('auth-reset-error');
  err.classList.add('hidden');
  document.getElementById('auth-reset-email').classList.remove('border-red-400','ring-4','ring-red-100');
  if (!email) {
    err.textContent = '请输入邮箱地址'; err.classList.remove('hidden');
    document.getElementById('auth-reset-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  var a = loadAuth();
  if (!a.users || !a.users[email]) {
    err.textContent = '该邮箱未注册'; err.classList.remove('hidden');
    document.getElementById('auth-reset-email').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  // Generate 6-digit code and show via toast (simulate email sending)
  resetCode = String(Math.floor(100000 + Math.random() * 900000));
  resetEmail = email;
  toast('验证码：' + resetCode + '（模拟邮件发送）', 'info');
  document.getElementById('reset-step-1').classList.add('hidden');
  document.getElementById('reset-step-2').classList.remove('hidden');
  updateResetStepDots(2);
}

function handleVerifyCode() {
  const code = document.getElementById('auth-reset-code').value.trim(),
    err = document.getElementById('auth-reset-error');
  err.classList.add('hidden');
  if (!code || code !== resetCode) {
    err.textContent = '验证码错误'; err.classList.remove('hidden');
    document.getElementById('auth-reset-code').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  document.getElementById('reset-step-2').classList.add('hidden');
  document.getElementById('reset-step-3').classList.remove('hidden');
  updateResetStepDots(3);
}

function handleDoResetPassword() {
  const pw = document.getElementById('auth-reset-new-pw').value,
    confirm = document.getElementById('auth-reset-confirm-pw').value,
    err = document.getElementById('auth-reset-error');
  err.classList.add('hidden');
  if (!pw || pw.length < 6) {
    err.textContent = '新密码至少需要6位'; err.classList.remove('hidden');
    document.getElementById('auth-reset-new-pw').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  if (pw !== confirm) {
    err.textContent = '两次密码不一致'; err.classList.remove('hidden');
    document.getElementById('auth-reset-confirm-pw').classList.add('border-red-400','ring-4','ring-red-100');
    return;
  }
  var a = loadAuth();
  if (a.users && a.users[resetEmail] !== undefined) {
    a.users[resetEmail] = pw;
    saveAuth(a);
  }
  toast('密码已重置，请登录', 'info');
  showAuthPanel('login');
}

function updateResetStepDots(step) {
  for (var i = 1; i <= 3; i++) {
    var dot = document.getElementById('reset-dot-' + i);
    var line = i < 3 ? document.getElementById('reset-line-' + i) : null;
    if (dot) {
      dot.classList.toggle('bg-accent-500', i <= step);
      dot.classList.toggle('bg-gray-200', i > step);
    }
    if (line) {
      line.classList.toggle('bg-accent-500', i < step);
      line.classList.toggle('bg-gray-200', i >= step);
    }
  }
}

// ── Google OAuth Login ──
function handleGoogleLogin() {
  var params = new URLSearchParams({
    client_id: '841240826750-dcohtb63l2vbni4uuc1k14qm6crvu20t.apps.googleusercontent.com',
    redirect_uri: window.location.href.split(/[?#]/)[0],
    response_type: 'token',
    scope: 'email profile',
    prompt: 'select_account',
  });
  window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();
}

function handleGoogleCallback() {
  var hash = window.location.hash;
  if (!hash || hash.indexOf('access_token') === -1) return;
  var params = new URLSearchParams(hash.substring(1));
  var token = params.get('access_token');
  if (!token) return;
  // Fetch user info from Google
  fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.email) {
      var a = loadAuth();
      if (!a.users) a.users = {};
      if (!a.users[data.email]) { a.users[data.email] = ''; }
      a.activeUser = data.email; saveAuth(a);
      onAuthSuccess(data.email);
    }
  })
  .catch(function() {
    toast('Google 登录失败，请重试', 'warn');
  });
  // Clean URL
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

function onAuthSuccess(email) {
  var overlay = document.getElementById('auth-overlay');
  overlay.classList.add('auth-overlay-hidden');
  document.getElementById('logout-btn').style.display = '';
  authBlinkTimers.forEach(function(t) { clearTimeout(t); });
  authBlinkTimers = [];
  setTimeout(function() { overlay.classList.add('hidden'); }, 500);
  // Migrate old global data to user-scoped keys (one-time)
  migrateOldData(email);
  // Reload ALL data with user-scoped keys
  entries = ld();
  journalEntries = ldJournal();
  jobEntries = loadJobs();
  reviewEntries = loadReviews();
  selDate = localDateStr();
  renderAll();
  if (jobCurrentTab === 'overview') renderJobOverview();
  else if (jobCurrentTab === 'kanban') { renderJobKanban(); renderJobCharts(); }
  else if (jobCurrentTab === 'review') renderReviewList();
  checkDeadlines();
}

function migrateOldData(email) {
  var keys = ['milktea_v10', 'journal_v1', 'job_v1', 'job_review_v1'];
  keys.forEach(function(base) {
    var oldKey = base;
    var newKey = base + '_' + email;
    if (localStorage.getItem(oldKey) !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, localStorage.getItem(oldKey));
    }
  });
}

function handleLogout() {
  var a = loadAuth();
  a.activeUser = null; saveAuth(a);
  var overlay = document.getElementById('auth-overlay');
  overlay.classList.remove('hidden','auth-overlay-hidden');
  document.getElementById('logout-btn').style.display = 'none';
  resetPasswordField();
  showAuthPanel('login');
  initCharacters();
}

// Enter key support for auth inputs
document.addEventListener('DOMContentLoaded', () => {
  // Handle Google OAuth callback
  handleGoogleCallback();
  setTimeout(() => {
    document.querySelectorAll('#auth-overlay input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const inRegister = !document.getElementById('auth-panel-register').classList.contains('hidden');
          const inReset = !document.getElementById('auth-panel-reset').classList.contains('hidden');
          if (inRegister) handleRegister();
          else if (inReset) {
            if (!document.getElementById('reset-step-1').classList.contains('hidden')) handleSendCode();
            else if (!document.getElementById('reset-step-2').classList.contains('hidden')) handleVerifyCode();
            else if (!document.getElementById('reset-step-3').classList.contains('hidden')) handleDoResetPassword();
          }
          else handleLogin();
        }
      });
    });
  }, 200);
});
