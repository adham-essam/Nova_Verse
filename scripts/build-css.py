#!/usr/bin/env python3
"""Bundle CSS in its existing cascade order and update deterministic asset versions."""
from pathlib import Path
import hashlib,json,re,sys
ROOT=Path(__file__).resolve().parents[1]
SOURCES=['fonts.css','variables.css','base.css','header.css','components.css','sections.css','animations.css','responsive.css','faq.css']
def bundle():
 return '\n'.join('/* '+name+' */\n'+(ROOT/'css'/name).read_text().strip() for name in SOURCES)+'\n'
css=bundle();version=hashlib.sha256(css.encode()).hexdigest()[:12]
if '--check' in sys.argv:
 assert (ROOT/'css/site.css').read_text()==css,'CSS bundle is stale; run python scripts/build-css.py'
 print('PASS: CSS bundle matches source styles.');sys.exit(0)
(ROOT/'css/site.css').write_text(css)
fonts=json.loads((ROOT/'assets/fonts/manifest.json').read_text())
for p in ROOT.rglob('*.html'):
 t=p.read_text()
 t=re.sub(r'\s*<link\b[^>]*\brel="(?:stylesheet|preconnect|preload)"[^>]*>','',t,flags=re.S)
 subset='latin' if p.relative_to(ROOT).parts[0]=='en' else 'arabic'
 tags='\n    <link rel="preload" href="/assets/fonts/'+fonts[subset]+'" as="font" type="font/woff2" crossorigin>\n    <link rel="stylesheet" href="/css/site.css?v='+version+'">'
 t=t.replace('</head>',tags+'\n  </head>',1)
 p.write_text("\n".join(line.rstrip() for line in t.splitlines())+"\n")
print('Built /css/site.css?v='+version)
