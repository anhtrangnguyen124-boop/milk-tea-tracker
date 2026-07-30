// theme.js — reference copy from index.html

/* ============================================================
   Theme System — Dynamic Color Palette Generation
   ============================================================ */

// --- Color utility functions ---

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}

function buildBodyGradient(h) {
  return 'linear-gradient(160deg, '
    + hslToHex((h - 12 + 360) % 360, 8, 98) + ' 0%, '
    + hslToHex((h - 4 + 360) % 360, 6, 97) + ' 30%, '
    + hslToHex(h, 10, 97) + ' 60%, '
    + hslToHex((h + 8) % 360, 7, 98) + ' 100%)';
}

function generatePalette(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  const isDark = l < 25;
  const isLight = l > 85;
  const isGray = s < 5;
  const effS = isGray ? 8 : s;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  let accent500 = hex;
  let baseL = l;

  if (isLight) {
    // Push accent-500 darker so text remains readable
    accent500 = hslToHex(h, effS * 1.2, clamp(l - 10, 50, 75));
    baseL = clamp(l - 10, 50, 75);
  }

  const result = {
    body: buildBodyGradient(h),
    dot: accent500,
    '--accent-50': hslToHex(h, effS * 0.3, 96),
    '--accent-100': hslToHex(h, effS * 0.5, 92),
    '--accent-200': hslToHex(h, effS * 0.7, 82),
    '--accent-300': hslToHex(h, effS * 0.85, 72),
    '--accent-400': hslToHex(h, effS, clamp(baseL + 8, 50, 80)),
    '--accent-500': accent500,
    '--accent-600': hslToHex(h, effS, clamp(baseL - 10, 20, 55)),
    '--accent-700': hslToHex(h, effS * 0.9, clamp(baseL - 20, 12, 40)),
    '--accent-800': hslToHex(h, effS * 0.8, clamp(baseL - 28, 8, 30)),
    '--accent-900': hslToHex(h, effS * 0.6, clamp(baseL - 35, 4, 25)),
    '--glow-color': hslToHex(h, effS * 0.7, 88),
    '--shadow-rgb': r + ',' + g + ',' + b,
  };

  // Dark color adjustments
  if (isDark) {
    result['--accent-50'] = hslToHex(h, effS * 0.5, 94);
    result['--accent-100'] = hslToHex(h, effS * 0.6, 88);
    result['--accent-900'] = hslToHex(h, effS * 0.4, clamp(baseL - 25, 3, 12));
  }

  return result;
}

// --- System color picker ---
var pickerHue = 0;
var pickerSat = 100;
var pickerLit = 50;
var pickerDragging = false;
var pickerDragTarget = null;

// Preview mode: set CSS vars + body WITHOUT saving or updating presets
function applyThemePreview(hex) {
  var p = generatePalette(hex);
  document.body.style.background = p.body;
  document.body.style.backgroundAttachment = 'fixed';
  var root = document.documentElement;
  Object.keys(p).forEach(function(k) {
    if (k.indexOf('--') === 0) root.style.setProperty(k, p[k]);
  });
}

function drawSLPanel() {
  var canvas = document.getElementById('picker-sl-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  // Draw white-to-hue horizontal gradient
  var gradH = ctx.createLinearGradient(0, 0, w, 0);
  gradH.addColorStop(0, '#ffffff');
  gradH.addColorStop(1, hslToHex(pickerHue, 100, 50));
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, w, h);
  // Overlay: transparent-to-black vertical gradient (bottom = black)
  var gradV = ctx.createLinearGradient(0, 0, 0, h);
  gradV.addColorStop(0, 'rgba(0,0,0,0)');
  gradV.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = gradV;
  ctx.fillRect(0, 0, w, h);
  // Overlay: white-to-transparent vertical gradient (top = white)
  var gradW = ctx.createLinearGradient(0, 0, 0, h);
  gradW.addColorStop(0, 'rgba(255,255,255,1)');
  gradW.addColorStop(0.5, 'rgba(255,255,255,0)');
  gradW.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradW;
  ctx.fillRect(0, 0, w, h);
}

function updatePickerCursors() {
  var slWrap = document.getElementById('picker-sl-wrap');
  var slCursor = document.getElementById('picker-sl-cursor');
  var hueWrap = document.getElementById('picker-hue-wrap');
  var hueCursor = document.getElementById('picker-hue-cursor');
  if (slWrap && slCursor) {
    slCursor.style.left = pickerSat + '%';
    slCursor.style.top = (100 - pickerLit) + '%';
  }
  if (hueWrap && hueCursor) {
    hueCursor.style.top = (pickerHue / 360 * 100) + '%';
  }
}

function pickerColorFromPos(slX, slY, slW, slH) {
  pickerSat = Math.round(Math.max(0, Math.min(100, slX / slW * 100)));
  pickerLit = Math.round(Math.max(0, Math.min(100, 100 - (slY / slH * 100))));
  return hslToHex(pickerHue, pickerSat, pickerLit);
}

function updatePickerPreview(hex) {
  var preview = document.getElementById('picker-preview');
  var hexDisp = document.getElementById('picker-hex-display');
  if (preview) preview.style.background = hex;
  if (hexDisp) hexDisp.textContent = hex.replace('#', '').toUpperCase();
}

function pickerGetCurrentHex() {
  return hslToHex(pickerHue, pickerSat, pickerLit);
}

function setupSLPanel() {
  var wrap = document.getElementById('picker-sl-wrap');
  if (!wrap) return;

  function getHexFromEvent(e) {
    var rect = wrap.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return pickerColorFromPos(x, y, rect.width, rect.height);
  }

  wrap.addEventListener('mousedown', function(e) {
    pickerDragging = true;
    pickerDragTarget = 'sl';
    var hex = getHexFromEvent(e);
    updatePickerPreview(hex);
    updatePickerCursors();
    applyThemePreview(hex);
  });

  document.addEventListener('mousemove', function(e) {
    if (!pickerDragging || pickerDragTarget !== 'sl' || !paletteOpen) return;
    var hex = getHexFromEvent(e);
    updatePickerPreview(hex);
    updatePickerCursors();
    applyThemePreview(hex);
  });

  document.addEventListener('mouseup', function() {
    pickerDragging = false;
  });
}

function setupHueSlider() {
  var wrap = document.getElementById('picker-hue-wrap');
  if (!wrap) return;

  function getHueFromEvent(e) {
    var rect = wrap.getBoundingClientRect();
    var y = e.clientY - rect.top;
    return Math.round(Math.max(0, Math.min(360, y / rect.height * 360)));
  }

  wrap.addEventListener('mousedown', function(e) {
    pickerDragging = true;
    pickerDragTarget = 'hue';
    pickerHue = getHueFromEvent(e);
    drawSLPanel();
    var hex = pickerGetCurrentHex();
    updatePickerPreview(hex);
    updatePickerCursors();
    applyThemePreview(hex);
  });

  document.addEventListener('mousemove', function(e) {
    if (!pickerDragging || pickerDragTarget !== 'hue' || !paletteOpen) return;
    pickerHue = getHueFromEvent(e);
    drawSLPanel();
    var hex = pickerGetCurrentHex();
    updatePickerPreview(hex);
    updatePickerCursors();
    applyThemePreview(hex);
  });
}

// --- Theme application ---

const PRESET_COLORS = [
  { hex: '#D4687A', name: '暖橘' },
  { hex: '#5BA88C', name: '薄荷' },
  { hex: '#9B7EC4', name: '薰衣草' },
  { hex: '#6BA8D8', name: '天空' },
  { hex: '#D4A830', name: '暖阳' },
];

function applyThemeFromHex(hex) {
  const p = generatePalette(hex);
  document.body.style.background = p.body;
  document.body.style.backgroundAttachment = 'fixed';
  var root = document.documentElement;
  Object.keys(p).forEach(function(k) {
    if (k.indexOf('--') === 0) root.style.setProperty(k, p[k]);
  });
  // Update preset dot highlights
  var dots = document.querySelectorAll('#bg-theme-switcher .bg-dot[data-hex]');
  dots.forEach(function(d) {
    var isActive = (d.dataset.hex || '').toUpperCase() === hex.toUpperCase();
    d.style.borderColor = isActive ? p.dot : 'transparent';
    d.style.boxShadow = isActive ? '0 0 0 3px ' + p.dot + '26' : 'none';
  });
  // Palette trigger stays as rainbow wheel — no override
  localStorage.setItem('bg_theme', hex);
}

// --- Palette popup logic ---

var paletteOriginalHex = '#D4687A';
var paletteOpen = false;

function openPalette() {
  paletteOriginalHex = localStorage.getItem('bg_theme') || '#D4687A';
  paletteOpen = true;
  var popup = document.getElementById('palette-popup');
  if (!popup) return;

  // Parse current color to set picker state
  var currentHex = paletteOriginalHex;
  var hsl = rgbToHsl(hexToRgb(currentHex).r, hexToRgb(currentHex).g, hexToRgb(currentHex).b);
  pickerHue = Math.round(hsl.h);
  pickerSat = Math.round(hsl.s);
  pickerLit = Math.round(hsl.l);

  // Draw SL panel for current hue
  drawSLPanel();
  updatePickerCursors();
  updatePickerPreview(currentHex);

  // Show popup
  popup.style.display = 'flex';
}

function confirmPalette() {
  var hex = pickerGetCurrentHex();
  paletteOpen = false;
  pickerDragging = false;
  pickerDragTarget = null;
  var popup = document.getElementById('palette-popup');
  if (popup) popup.style.display = 'none';
  applyThemeFromHex(hex);
}

function closePalette(revert) {
  paletteOpen = false;
  pickerDragging = false;
  pickerDragTarget = null;
  var popup = document.getElementById('palette-popup');
  if (popup) popup.style.display = 'none';
  // Always revert to original color on close/cancel
  if (paletteOriginalHex) {
    applyThemeFromHex(paletteOriginalHex);
  }
}

// --- Initialization ---

(function initTheme() {
  var saved = localStorage.getItem('bg_theme');
  if (saved && /^#[0-9a-fA-F]{6}$/.test(saved)) {
    applyThemeFromHex(saved);
  } else {
    // Backward compatibility: old theme name → hex
    var nameToHex = {
      warm: '#D4687A', mint: '#5BA88C', lavender: '#9B7EC4',
      sky: '#6BA8D8', sunshine: '#D4A830'
    };
    applyThemeFromHex(nameToHex[saved] || '#D4687A');
  }
})();

// Attach preset click handlers
document.querySelectorAll('#bg-theme-switcher .bg-dot[data-hex]').forEach(function(d) {
  d.addEventListener('click', function() {
    applyThemeFromHex(this.dataset.hex);
  });
});

// Palette trigger
var paletteTrigger = document.getElementById('palette-trigger');
if (paletteTrigger) {
  paletteTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    if (paletteOpen) { closePalette(true); }
    else { openPalette(); }
  });
}

// Close palette on backdrop click
var palettePopup = document.getElementById('palette-popup');
if (palettePopup) {
  palettePopup.addEventListener('click', function(e) {
    if (e.target === palettePopup) { closePalette(true); }
  });
}

// Initialize system color picker components
setupSLPanel();
setupHueSlider();

// Close palette on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && paletteOpen) { closePalette(true); }
});

// Close button inside palette panel
var paletteCloseBtn = document.getElementById('palette-close');
if (paletteCloseBtn) {
  paletteCloseBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closePalette(true);
  });
}

// Confirm button — save current picker color
var confirmBtn = document.getElementById('picker-confirm-btn');
if (confirmBtn) {
  confirmBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    confirmPalette();
  });
}
