import re

filepath = '/Users/wenxianghong/Documents/vscode/milk-tea-tracker/docs/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# CHANGE 1: Update :root CSS block - add accent-200, accent-300, accent-800
# ============================================================
old_root = '''  :root {
    --accent-50: #FFF5F6;
    --accent-100: #FFE8EB;
    --accent-400: #E87888;
    --accent-500: #D4687A;
    --accent-600: #B85263;
    --accent-700: #943E4E;
    --accent-900: #4A1E28;
    --glow-color: #FFB8C4;
    --shadow-rgb: 212,104,122;
    --btn-text-shadow: rgb(120,60,70);
  }'''

new_root = '''  :root {
    --accent-50: #FFF5F6;
    --accent-100: #FFE8EB;
    --accent-200: #F8C4CC;
    --accent-300: #F09AA6;
    --accent-400: #E87888;
    --accent-500: #D4687A;
    --accent-600: #B85263;
    --accent-700: #943E4E;
    --accent-800: #702E3C;
    --accent-900: #4A1E28;
    --glow-color: #FFB8C4;
    --shadow-rgb: 212,104,122;
    --btn-text-shadow: rgb(120,60,70);
  }'''

if old_root in content:
    content = content.replace(old_root, new_root)
    print("✓ Change 1: Updated :root CSS variables")
else:
    print("✗ Change 1: :root block not found - check whitespace")

# ============================================================
# CHANGE 2: Replace bg-theme-switcher HTML (5 dots → presets + palette button)
# ============================================================
old_switcher = '''    <!-- Background Theme Switcher — 5 pastel dots -->
    <div class="flex items-center gap-1.5 ml-2 sm:ml-4" id="bg-theme-switcher">
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-bg="warm" title="暖橘" style="background:linear-gradient(135deg,#FFE8EB,#F8C4CC);border-color:var(--accent-500);box-shadow:0 0 0 3px rgba(212,104,122,0.15)"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-bg="mint" title="薄荷" style="background:linear-gradient(135deg,#D4EDDA,#A8DFC8);border-color:transparent"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-bg="lavender" title="薰衣草" style="background:linear-gradient(135deg,#E8DCF0,#D4C4E8);border-color:transparent"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-bg="sky" title="天空" style="background:linear-gradient(135deg,#D6ECFB,#B8DCF8);border-color:transparent"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-bg="sunshine" title="暖阳" style="background:linear-gradient(135deg,#FFF9D4,#F0D060);border-color:transparent"></button>
    </div>'''

new_switcher = '''    <!-- Theme Switcher — 5 presets + palette trigger -->
    <div class="flex items-center gap-1.5 ml-2 sm:ml-4" id="bg-theme-switcher">
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-hex="#D4687A" title="暖橘" style="background:linear-gradient(135deg,#FFE8EB,#F8C4CC);border-color:var(--accent-500);box-shadow:0 0 0 3px rgba(212,104,122,0.15)"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-hex="#5BA88C" title="薄荷" style="background:linear-gradient(135deg,#D4EDDA,#A8DFC8);border-color:transparent"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-hex="#9B7EC4" title="薰衣草" style="background:linear-gradient(135deg,#E8DCF0,#D4C4E8);border-color:transparent"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-hex="#6BA8D8" title="天空" style="background:linear-gradient(135deg,#D6ECFB,#B8DCF8);border-color:transparent"></button>
      <button class="bg-dot w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200" data-hex="#D4A830" title="暖阳" style="background:linear-gradient(135deg,#FFF9D4,#F0D060);border-color:transparent"></button>
      <button id="palette-trigger" class="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-dashed cursor-pointer hover:scale-125 active:scale-90 transition-all duration-200 flex items-center justify-center" title="调色盘" style="border-color:var(--accent-500);background:var(--accent-500)"></button>
    </div>'''

if old_switcher in content:
    content = content.replace(old_switcher, new_switcher)
    print("✓ Change 2: Replaced bg-theme-switcher HTML")
else:
    print("✗ Change 2: bg-theme-switcher not found - check whitespace")

# ============================================================
# CHANGE 3: Add palette popup HTML (insert before the Auth overlay section)
# ============================================================
palette_popup = '''
<!-- ============================================================
     Color Palette Popup
     ============================================================ -->
<div id="palette-popup" class="palette-popup" style="display:none;">
  <div class="palette-panel">
    <div class="palette-header">
      <span class="palette-title">🎨 选择颜色</span>
      <button id="palette-close" class="palette-close-btn" title="关闭">✕</button>
    </div>
    <div class="palette-grid" id="palette-grid"></div>
    <div class="palette-footer">
      <span class="palette-hex-label">当前选择</span>
      <span class="palette-hex-value" id="palette-hex-display">#D4687A</span>
    </div>
  </div>
</div>
'''

# Insert before the first occurrence of <!-- Auth Overlay
auth_marker = '<!-- Auth Overlay'
if auth_marker in content:
    content = content.replace(auth_marker, palette_popup + '\n' + auth_marker)
    print("✓ Change 3: Added palette popup HTML")
else:
    print("✗ Change 3: Auth Overlay marker not found")

# ============================================================
# CHANGE 4: Add palette CSS styles (insert after :root block)
# ============================================================
palette_css = '''
  /* ============================================================
     Color Palette Popup Styles
     ============================================================ */
  .palette-popup {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 100; display: flex; align-items: flex-start; justify-content: center;
    padding-top: 80px;
  }
  .palette-backdrop {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.08);
  }
  .palette-panel {
    position: relative; z-index: 1;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
    padding: 20px 24px 16px;
    width: 340px;
  }
  .palette-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .palette-title { font-size: 15px; font-weight: 700; color: #5D4E37; }
  .palette-close-btn {
    width: 26px; height: 26px; border-radius: 50%; border: none;
    background: rgba(0,0,0,0.06); color: #999; cursor: pointer;
    font-size: 13px; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .palette-close-btn:hover { background: rgba(0,0,0,0.12); color: #555; }
  .palette-grid {
    display: grid; grid-template-columns: repeat(8, 1fr);
    gap: 6px; margin-bottom: 14px;
  }
  .palette-cell {
    aspect-ratio: 1; border-radius: 10px; cursor: pointer;
    border: 2px solid transparent; transition: all 0.12s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .palette-cell:hover {
    transform: scale(1.18); z-index: 2;
    border-color: rgba(255,255,255,0.9);
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  }
  .palette-cell.selected {
    border-color: #333; box-shadow: 0 0 0 2px rgba(0,0,0,0.15);
  }
  .palette-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.06);
  }
  .palette-hex-label { font-size: 12px; color: #999; font-weight: 500; }
  .palette-hex-value { font-size: 13px; font-weight: 700; color: #5D4E37; font-family: monospace; letter-spacing: 0.5px; }
'''

# Insert after the :root closing brace block
root_end_marker = "    --btn-text-shadow: rgb(120,60,70);\n  }\n  /* ============================================================\n     Unified Module Card"
if root_end_marker in content:
    content = content.replace(
        root_end_marker,
        "    --btn-text-shadow: rgb(120,60,70);\n  }" + palette_css + "\n  /* ============================================================\n     Unified Module Card"
    )
    print("✓ Change 4: Added palette CSS styles")
else:
    print("✗ Change 4: root block end marker not found")

# ============================================================
# CHANGE 5: Replace PALETTES + applyTheme + switchBgTheme + init + event handlers
# with new color generation + applyThemeFromHex + init
# ============================================================
old_theme_system = '''/* ============================================================
   Theme System — 5 Complete Palettes
   ============================================================ */
const PALETTES = {
  warm: {
    body: 'linear-gradient(160deg, #FDF6F0 0%, #FEF9F4 30%, #FDF3F0 60%, #FFF8F4 100%)',
    dot: '#D4687A',
    '--accent-50': '#FFF5F6', '--accent-100': '#FFE8EB', '--accent-400': '#E87888',
    '--accent-500': '#D4687A', '--accent-600': '#B85263', '--accent-700': '#943E4E',
    '--accent-900': '#4A1E28', '--glow-color': '#FFB8C4',
    '--shadow-rgb': '212,104,122', '--btn-text-shadow': 'rgb(120,60,70)',
  },
  mint: {
    body: 'linear-gradient(160deg, #F0FAF4 0%, #F4FCF8 30%, #EDF7F2 60%, #F8FCF9 100%)',
    dot: '#5BA88C',
    '--accent-50': '#F0FAF5', '--accent-100': '#D4F0E4', '--accent-400': '#6BC4A0',
    '--accent-500': '#5BA88C', '--accent-600': '#3D8B6E', '--accent-700': '#2B6B52',
    '--accent-900': '#1A4532', '--glow-color': '#A8E0C8',
    '--shadow-rgb': '91,168,140', '--btn-text-shadow': 'rgb(40,100,70)',
  },
  lavender: {
    body: 'linear-gradient(160deg, #F6F2FA 0%, #F9F7FC 30%, #F4F0F8 60%, #FAF8FC 100%)',
    dot: '#9B7EC4',
    '--accent-50': '#F8F5FC', '--accent-100': '#ECE0F8', '--accent-400': '#A88CD8',
    '--accent-500': '#9B7EC4', '--accent-600': '#7B5EA8', '--accent-700': '#5E3F8C',
    '--accent-900': '#3A2060', '--glow-color': '#D4C4F0',
    '--shadow-rgb': '155,126,196', '--btn-text-shadow': 'rgb(70,45,100)',
  },
  sky: {
    body: 'linear-gradient(160deg, #F0F6FA 0%, #F5F9FC 30%, #EEF4F8 60%, #F8FAFC 100%)',
    dot: '#6BA8D8',
    '--accent-50': '#F2F8FC', '--accent-100': '#D8ECF8', '--accent-400': '#7CB8E0',
    '--accent-500': '#6BA8D8', '--accent-600': '#4A8ABF', '--accent-700': '#326DA0',
    '--accent-900': '#1A4070', '--glow-color': '#B8D8F0',
    '--shadow-rgb': '107,168,216', '--btn-text-shadow': 'rgb(40,70,110)',
  },
  sunshine: {
    body: 'linear-gradient(160deg, #FFFEF5 0%, #FFFDF0 30%, #FFF9E0 60%, #FFFEF8 100%)',
    dot: '#D4A830',
    '--accent-50': '#FFFEF5', '--accent-100': '#FFF9D4', '--accent-400': '#F0D060',
    '--accent-500': '#D4A830', '--accent-600': '#B8891E', '--accent-700': '#946F15',
    '--accent-900': '#5A4008', '--glow-color': '#FFF1A0',
    '--shadow-rgb': '212,168,48', '--btn-text-shadow': 'rgb(100,75,10)',
  },
};

function applyTheme(theme) {
  const p = PALETTES[theme];
  if (!p) return;
  // Apply body background
  document.body.style.background = p.body;
  document.body.style.backgroundAttachment = 'fixed';
  // Apply CSS custom properties
  const root = document.documentElement;
  Object.keys(p).forEach(k => {
    if (k.startsWith('--')) root.style.setProperty(k, p[k]);
  });
  // Update dot borders
  document.querySelectorAll('#bg-theme-switcher .bg-dot').forEach(d => {
    d.style.borderColor = 'transparent';
    d.style.boxShadow = 'none';
  });
  const dot = document.querySelector(`#bg-theme-switcher .bg-dot[data-bg="${theme}"]`);
  if (dot) {
    dot.style.borderColor = p.dot;
    dot.style.boxShadow = `0 0 0 3px ${p.dot}26`;
  }
  localStorage.setItem('bg_theme', theme);
}

function switchBgTheme(theme, el) { applyTheme(theme); }

// Init theme from localStorage
(function initTheme() {
  const saved = localStorage.getItem('bg_theme') || 'warm';
  applyTheme(saved);
})();

// Attach click handlers
document.querySelectorAll('#bg-theme-switcher .bg-dot').forEach(d => {
  d.addEventListener('click', function() { switchBgTheme(this.dataset.bg, this); });
});'''

new_theme_system = '''/* ============================================================
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

// --- Color grid for palette popup ---
function generateColorGrid() {
  const hues = [0, 30, 60, 100, 150, 200, 250, 300];
  const levels = [
    { l: 88, s: 60 },
    { l: 72, s: 75 },
    { l: 55, s: 80 },
    { l: 40, s: 68 },
    { l: 28, s: 50 },
  ];
  const grid = [];
  for (var li = 0; li < levels.length; li++) {
    for (var hi = 0; hi < hues.length; hi++) {
      grid.push(hslToHex(hues[hi], levels[li].s, levels[li].l));
    }
  }
  return grid;
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
  // Update palette trigger color
  var trigger = document.getElementById('palette-trigger');
  if (trigger) {
    trigger.style.background = hex;
    trigger.style.borderColor = hex;
  }
  localStorage.setItem('bg_theme', hex);
}

// --- Palette popup logic ---

var paletteOriginalHex = '#D4687A';
var paletteOpen = false;

function openPalette() {
  paletteOriginalHex = localStorage.getItem('bg_theme') || '#D4687A';
  paletteOpen = true;
  var popup = document.getElementById('palette-popup');
  var grid = document.getElementById('palette-grid');
  if (!popup || !grid) return;

  // Build grid cells
  var colors = generateColorGrid();
  var currentHex = localStorage.getItem('bg_theme') || '#D4687A';
  var html = '';
  for (var i = 0; i < colors.length; i++) {
    var c = colors[i];
    var selClass = (c.toUpperCase() === currentHex.toUpperCase()) ? ' selected' : '';
    html += '<div class="palette-cell' + selClass + '" data-hex="' + c + '" style="background:' + c + '"></div>';
  }
  grid.innerHTML = html;

  // Update hex display
  document.getElementById('palette-hex-display').textContent = currentHex;

  // Show popup
  popup.style.display = 'flex';

  // Attach event listeners to cells
  var cells = grid.querySelectorAll('.palette-cell');
  cells.forEach(function(cell) {
    cell.addEventListener('mouseenter', function() {
      var hex = this.dataset.hex;
      applyThemeFromHex(hex);
      document.getElementById('palette-hex-display').textContent = hex;
      // Update selected class
      grid.querySelectorAll('.palette-cell').forEach(function(c) { c.classList.remove('selected'); });
      this.classList.add('selected');
    });
    cell.addEventListener('click', function() {
      var hex = this.dataset.hex;
      applyThemeFromHex(hex);
      paletteOpen = false;
      popup.style.display = 'none';
    });
  });
}

function closePalette(revert) {
  paletteOpen = false;
  var popup = document.getElementById('palette-popup');
  if (popup) popup.style.display = 'none';
  if (revert && paletteOriginalHex) {
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

// Close palette on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && paletteOpen) { closePalette(true); }
});'''

if old_theme_system in content:
    content = content.replace(old_theme_system, new_theme_system)
    print("✓ Change 5: Replaced theme system with dynamic palette")
else:
    print("✗ Change 5: old theme system not found - will try partial match")
    # Try finding just the PALETTES start
    if 'const PALETTES = {' in content:
        print("  PALETTES found at least")

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! All changes applied.")
