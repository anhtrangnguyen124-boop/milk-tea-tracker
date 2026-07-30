#!/usr/bin/env python3
"""Rebuild index.html as a complete standalone file with all inline CSS/JS."""
import re, os

BASE = os.path.dirname(os.path.abspath(__file__))

# Read all CSS files
css_parts = []
for f in ['css/theme.css', 'css/components.css', 'css/auth.css', 'css/job.css']:
    with open(os.path.join(BASE, f)) as fp:
        c = fp.read()
        c = re.sub(r'/\* [a-z-]+\.css .*? \*/\n*', '', c)
        css_parts.append(c.strip())
combined_css = '\n'.join(css_parts)

# Read all JS files that exist
js_files = ['js/utils.js', 'js/data.js', 'js/theme.js', 'js/tracker.js', 'js/journal.js', 'js/auth.js']
js_parts = []
for f in js_files:
    fpath = os.path.join(BASE, f)
    if os.path.exists(fpath):
        with open(fpath) as fp:
            c = fp.read()
            c = re.sub(r'// [a-z-]+\.js .*?\n\n', '', c)
            js_parts.append(c.strip())

# Add job-tracker JS if it exists
jt_path = os.path.join(BASE, 'js/job-tracker.js')
if os.path.exists(jt_path):
    with open(jt_path) as fp:
        c = fp.read()
        c = re.sub(r'// [a-z-]+\.js .*?\n\n', '', c)
        js_parts.append(c.strip())

combined_js = '\n'.join(js_parts)

# Read current index.html
with open(os.path.join(BASE, 'index.html')) as f:
    lines = f.read().split('\n')

# Rebuild: keep the HTML structure, replace CSS links with inline <style>,
# replace JS links with inline <script>
new_lines = []
in_css_block = False
in_js_block = False
skip_inline = False

for i, line in enumerate(lines):
    # ── Handle CSS link block ──
    if 'Modular CSS' in line:
        in_css_block = True
        continue
    if in_css_block and '<link rel="stylesheet" href="css/' in line:
        continue
    if in_css_block and ('</head>' in line or '<body' in line):
        new_lines.append('<style>')
        for cl in combined_css.split('\n'):
            new_lines.append(cl)
        new_lines.append('</style>')
        in_css_block = False
        new_lines.append(line)
        continue

    # ── Handle JS link block ──
    if ('Order matters' in line and 'utils' in line) or ('JavaScript — Modular' in line and 'external' in line):
        in_js_block = True
        continue
    if in_js_block and '<script src="js/' in line:
        continue
    if in_js_block and '<script>' in line and 'Init' in lines[i-1] if i > 0 else False:
        skip_inline = True
        continue
    if skip_inline:
        if '</script>' in line:
            skip_inline = False
        continue
    if in_js_block and ('</body>' in line):
        # Insert inline JS
        new_lines.append('<script>')
        for jl in combined_js.split('\n'):
            new_lines.append(jl)
        new_lines.append('')
        new_lines.append('/* ============================================================')
        new_lines.append('   Init')
        new_lines.append('   ============================================================ */')
        new_lines.append('renderStars(0);')
        new_lines.append('checkAuth();')
        new_lines.append('</script>')
        in_js_block = False
        new_lines.append(line)
        continue

    new_lines.append(line)

output = '\n'.join(new_lines)
with open(os.path.join(BASE, 'index.html'), 'w') as f:
    f.write(output)

print("Done: %d lines" % len(new_lines))
