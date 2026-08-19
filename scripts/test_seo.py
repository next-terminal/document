#!/usr/bin/env python3
from pathlib import Path
import json,re,subprocess,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
errors=[]
config=(ROOT/'.vitepress/config.mts').read_text(encoding='utf-8')
for marker in ("hostname: 'https://docs.next-terminal.typesafe.cn'","transformHead","transformPageData","sitemap:"):
 if marker not in config: errors.append(f'config missing {marker}')
for rel,markers in {
 'index.md':('# Next Terminal Documentation','## Install and operate','/install/container-install'),
 'zh/index.md':('# Next Terminal 官方文档','## 安装与运维','/zh/install/container-install'),
}.items():
 body=(ROOT/rel).read_text(encoding='utf-8')
 for m in markers:
  if m not in body: errors.append(f'{rel} missing {m}')
 if 'http-equiv="refresh"' in body: errors.append(f'{rel} remains redirect-only')
public=ROOT/'public'
for name in ('robots.txt','llms.txt'):
 if not (public/name).exists(): errors.append(f'public/{name} missing')
if (public/'robots.txt').exists() and 'https://docs.next-terminal.typesafe.cn/sitemap.xml' not in (public/'robots.txt').read_text(): errors.append('docs robots sitemap wrong')
try:
 subprocess.run(['yarn','docs:build'],cwd=ROOT,check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=180)
 out=ROOT/'.vitepress/dist'
 sitemap=ET.parse(out/'sitemap.xml');ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
 urls=[n.text or '' for n in sitemap.getroot().findall('s:url/s:loc',ns)]
 if not urls or any(not u.startswith('https://docs.next-terminal.typesafe.cn/') for u in urls): errors.append('built sitemap host wrong')
 sitemap_urls=set(urls)
 for rel in ('index.html','zh/index.html','install/container-install.html','zh/install/container-install.html'):
  body=(out/rel).read_text(encoding='utf-8')
  canonical_match=re.search(r'<link rel="canonical" href="([^"]+)">',body)
  if not canonical_match:
   errors.append(f'{rel} canonical missing')
  elif canonical_match.group(1) not in sitemap_urls:
   errors.append(f'{rel} canonical not in sitemap: {canonical_match.group(1)}')
  if 'application/ld+json' not in body: errors.append(f'{rel} JSON-LD missing')
  for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',body,re.S):
   try: json.loads(block)
   except json.JSONDecodeError as e: errors.append(f'{rel} invalid JSON-LD: {e}')
except Exception as e: errors.append(f'docs build validation failed: {e}')
if errors:
 print('Docs checks failed:'); print('\n'.join('- '+e for e in errors));sys.exit(1)
print('Docs checks passed')
