#!/usr/bin/env python3
"""Idempotently link css/theme.css (with correct relative path) after the last shared stylesheet link in every HTML page."""
import re, pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
pat = re.compile(r'^([ \t]*)<link[^>]*href="((?:\.\./)*|/)?css/(?:styles|homepage|tool-common)\.css"[^>]*>[ \t]*$', re.M)
n = 0
for f in sorted(root.rglob('*.html')):
    if 'node_modules' in f.parts or f.name.startswith('google'): continue
    s = f.read_text(encoding='utf-8')
    if 'css/theme.css' in s: continue
    ms = list(pat.finditer(s))
    if not ms: print('skip (no shared css):', f.relative_to(root)); continue
    m = ms[-1]
    prefix = m.group(2) or ''
    tag = f'\n{m.group(1)}<link rel="stylesheet" href="{prefix}css/theme.css">'
    f.write_text(s[:m.end()] + tag + s[m.end():], encoding='utf-8'); n += 1
print('linked', n, 'pages')
