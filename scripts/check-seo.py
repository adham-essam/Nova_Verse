#!/usr/bin/env python3
"""Check static SEO contracts and all local link/asset/fragment targets. No dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
from collections import Counter
import json, re, sys, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://www.novaverseacademy.com'
PUBLIC={'index.html':'/','en/index.html':'/en/','about.html':'/about.html','en/about.html':'/en/about.html','contact.html':'/contact.html','en/contact.html':'/en/contact.html'}
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.tags=[];self.feed(text)
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)
 def get(self,tag,**attrs):return [a for t,a in self.tags if t==tag and all(a.get(k)==v for k,v in attrs.items())]
def local(path):
 p=ROOT/unquote(path.lstrip('/'))
 return p/'index.html' if path.endswith('/') else p
errors=[];count=0
parsed={str(p.relative_to(ROOT)):Page(p.read_text()) for p in ROOT.rglob('*.html') if '.git' not in p.parts}
def check(condition,message):
 global count
 count+=1
 if not condition:errors.append(message)
titles=[];descs=[]
for name,urlpath in PUBLIC.items():
 text=(ROOT/name).read_text();doc=parsed[name];url=ORIGIN+urlpath
 title=re.findall(r'<title>(.*?)</title>',text,re.S);titles.extend(title)
 description=doc.get('meta',name='description');descs.extend(a.get('content') for a in description)
 check(len(title)==1 and bool(title[0].strip()),name+': unique title')
 check(len(description)==1 and bool(description[0].get('content')),name+': description')
 check(len(doc.get('h1'))==1,name+': exactly one H1')
 check(doc.get('html')[0].get('lang')==('en' if name.startswith('en/') else 'ar'),name+': lang')
 check(doc.get('html')[0].get('dir')==('ltr' if name.startswith('en/') else 'rtl'),name+': direction')
 check(doc.get('link',rel='canonical')==[{'rel':'canonical','href':url}],name+': self canonical')
 check('noindex' not in doc.get('meta',name='robots')[0].get('content',''),name+': indexable')
 check(text.lower().index('charset=')<150,name+': early encoding')
 check(len(doc.get('main'))==1,name+': main landmark')
 check(bool(doc.get('a',href='#main-content')),name+': skip link')
 check(text.count('gtag("config", "G-5CK8XPB7XG"')==1,name+': analytics preserved')
 check('allow_google_signals: false' in text and 'allow_ad_personalization_signals: false' in text,name+': analytics privacy')
 alternates={a['hreflang']:a['href'] for a in doc.get('link',rel='alternate')}
 check(set(alternates)=={'ar','en','x-default'},name+': language cluster')
 for lang,target in alternates.items():
  f=local(urlsplit(target).path);key=str(f.relative_to(ROOT))
  check(key in PUBLIC,name+': alternate public target '+target)
  if key in PUBLIC:
   target_links=parsed[key].get('link',rel='alternate')
   check(any(a.get('href')==url for a in target_links),name+': reciprocal alternate '+target)
 for prop in ['og:title','og:description','og:locale','og:image','og:image:alt','og:site_name']:
  check(len(doc.get('meta',property=prop))==1,name+': '+prop)
 check(doc.get('meta',property='og:url')[0]['content']==url,name+': OG canonical')
 check(doc.get('meta',name='twitter:card')[0]['content']=='summary_large_image',name+': social card')
 schema=re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S)
 check(len(schema)==1,name+': one JSON-LD graph')
 for raw in schema:
  graph=json.loads(raw)['@graph'];nodes={n['@id']:n for n in graph}
  check(url+'#webpage' in nodes,name+': page schema identity')
  check(ORIGIN+'/#organization' in nodes,name+': organization identity')
  for n in graph:
   if n['@type']=='ItemList':
    check(n['numberOfItems']==4 and len(n['itemListElement'])==4,name+': four real courses')
    for item in n['itemListElement']:
     course=item['item'];fragment=urlsplit(course['url']).fragment
     check(bool(doc.get('article',id=fragment)),name+': visible course '+fragment)
     check(course['name'] in text and course['description'] in re.sub(r'\s+',' ',text),name+': course matches copy '+fragment)
 check(not doc.get('a',href='/become-instructor.html'),name+': recruitment remains unlisted')
 check('aggregateRating' not in text and 'LocalBusiness' not in text,name+': no invented ratings or location')
check(len(titles)==len(set(titles)),'Distinct titles across public pages')
check(len(descs)==len(set(descs)),'Distinct descriptions across public pages')
# Includes hidden page and custom error page; catches missing image dimensions, dead anchors, missing files.
for name,doc in parsed.items():
 source=ORIGIN+('/' if name=='index.html' else '/'+name)
 ids=[a['id'] for _,a in doc.tags if 'id' in a];check(len(ids)==len(set(ids)),name+': unique IDs')
 for tag,a in doc.tags:
  if tag=='img':
   check('alt' in a,name+': image alt')
   check('width' in a and 'height' in a,name+': image dimensions')
  if tag=='a' and 'data-whatsapp' in a:
   check(a.get('href','').startswith('https://wa.me/201501190654?text='),name+': WhatsApp without JS')
  target=a.get('src') if tag in ['img','script'] else a.get('href') if tag in ['a','link'] else None
  if not target or target=='#':continue
  url=urlsplit(urljoin(source,target))
  if url.netloc!='www.novaverseacademy.com':continue
  f=local(url.path)
  check(f.is_file(),name+': missing local target '+target)
  if url.fragment and f.suffix=='.html' and f.is_file():
   key=str(f.relative_to(ROOT));check(any(v.get('id')==url.fragment for _,v in parsed[key].tags),name+': missing fragment '+target)
check('noindex' in parsed['become-instructor.html'].get('meta',name='robots')[0]['content'],'Recruitment noindex')
check('noindex' in parsed['404.html'].get('meta',name='robots')[0]['content'],'404 noindex')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','x':'http://www.w3.org/1999/xhtml'}
tree=ET.parse(ROOT/'sitemap.xml');locs=[e.text for e in tree.findall('s:url/s:loc',ns)]
check(set(locs)=={ORIGIN+p for p in PUBLIC.values()},'Sitemap contains exactly canonical public pages')
for u in tree.findall('s:url',ns):check(len(u.findall('x:link',ns))==3,'Sitemap alternate cluster')
robots=(ROOT/'robots.txt').read_text();check('Disallow: /\n' not in robots,'Crawl enabled');check('Sitemap: '+ORIGIN+'/sitemap.xml' in robots,'Robots declares sitemap');check('become-instructor' not in robots,'Recruitment crawl allowed to see noindex')
config=json.loads((ROOT/'vercel.json').read_text());check('rewrites' not in config,'No soft-404 catch-all')
check(any(r.get('has')==[{'type':'host','value':'nova-verse-nine.vercel.app'}] and r.get('permanent') for r in config['redirects']),'Old production host permanent redirect')
check(all(r.get('permanent') for r in config['redirects']),'Permanent canonical redirects')
check((ROOT/'api/instructor-application.mjs').exists(),'Recruitment API retained')
if errors:
 print('\n'.join('FAIL: '+e for e in errors));print(f'{len(errors)} failures / {count} checks');sys.exit(1)
print(f'PASS: {count} SEO, internal-link, asset, schema, language, privacy and indexing checks across {len(PUBLIC)} public pages.')
