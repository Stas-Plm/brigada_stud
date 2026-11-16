import os, json, re, hashlib, urllib.request, xml.etree.ElementTree as ET, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from email.utils import parsedate_to_datetime

def norm(s): return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if not unicodedata.combining(c))
def val(item,*names):
    for name in names:
        for child in item:
            if child.tag.split('}')[-1].lower()==name and child.text: return child.text.strip()
    return ''
url=os.environ.get('PROFESIA_FEED_URL','')
if not url: raise SystemExit('Nastavte PROFESIA_FEED_URL na schválený partnerský RSS/XML export.')
with urllib.request.urlopen(url,timeout=30) as response: root=ET.fromstring(response.read())
items=[x for x in root.iter() if x.tag.split('}')[-1].lower() in ('item','job','offer','entry')]
if not items: raise SystemExit('Export nemá rozpoznané položky; overte formát s Profesiou.')
jobs={}
for item in items:
    title=val(item,'title','name'); link=val(item,'link','url'); u=urlparse(link)
    if u.scheme!='https' or u.hostname not in ('www.profesia.sk','profesia.sk') or not u.path.startswith('/praca/'): continue
    t=norm(title)
    if not re.search(r'student|brigad|staz|internship|trainee',t): continue
    id=int(hashlib.sha256(link.encode()).hexdigest()[:12],16)
    posted=val(item,'pubdate','published','date'); date=None
    try: date=parsedate_to_datetime(posted).isoformat()
    except Exception:
        try: date=datetime.fromisoformat(posted.replace('Z','+00:00')).isoformat()
        except ValueError: pass
    wage=val(item,'salary','wage'); m=re.search(r'(\d+(?:[,.]\d+)?)\s*(?:EUR|€)\s*/\s*(?:hod|h\b)',wage,re.I)
    jobs[id]={'id':id,'title':title,'url':link,'company':val(item,'company','employer') or 'Zamestnávateľ na Profesii','location':val(item,'location','city','region') or 'Lokalita v inzeráte','salary':float(m[1].replace(',','.')) if m else None,'type':'Stáž' if re.search(r'staz|internship|trainee',t) else 'Brigáda' if 'brigad' in t else 'Pre študentov','remote':bool(re.search(r'home office|praca z domu|remote',norm(title+' '+val(item,'location')))),'level':None,'posted':date}
Path('jobs.json').write_text(json.dumps({'updated':datetime.now(timezone.utc).isoformat(),'jobs':list(jobs.values())},ensure_ascii=False,indent=2),encoding='utf-8')
