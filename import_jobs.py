import os, json, re, hashlib, unicodedata, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, quote
from html import unescape

def clean(s):
    return ' '.join(unescape(re.sub(r'<[^>]*>', ' ', str(s or ''))).split())
def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if not unicodedata.combining(c))
def convert(j):
    title, snippet, kind = map(clean, (j.get('title'), j.get('snippet'), j.get('type')))
    t, k = norm(title), norm(kind)
    if re.search(r'plny uvazok|full.time', k): return None
    if re.search(r'staz|internship|intern\b|trainee', t+' '+k): typ='Stáž'
    elif re.search(r'brigad|na dohodu', t+' '+k): typ='Brigáda'
    elif re.search(r'ciastocny|skrat(en|eny)|part.time', k+' '+t): typ='Čiastočný úväzok'
    elif re.search(r'student|popri studiu', t) or re.search(r'vhodn\w* pre student|popri studiu|student\w* vysok', norm(snippet)): typ='Pre študentov'
    else: return None
    url=str(j.get('link') or ''); u=urlparse(url)
    if not title or u.scheme!='https' or not u.hostname or not (u.hostname=='jooble.org' or u.hostname.endswith('.jooble.org')): return None
    wage=clean(j.get('salary')); m=re.search(r'(\d+(?:[,.]\d+)?)\s*(?:EUR|€)?\s*(?:/|za|per)\s*(?:hod|hour|h\b)',wage,re.I)
    posted=None
    try: posted=datetime.fromisoformat(str(j.get('updated')).replace('Z','+00:00')).isoformat()
    except ValueError: pass
    ident=str(j.get('id') or url)
    return dict(id=int(hashlib.sha256(ident.encode()).hexdigest()[:12],16),title=title,url=url,company=clean(j.get('company')) or 'Zamestnávateľ v inzeráte',location=clean(j.get('location')) or 'Lokalita v inzeráte',salary=float(m[1].replace(',','.')) if m else None,salaryText=wage,type=typ,remote=bool(re.search(r'home office|praca z domu|remote',t+' '+k)),level=None,posted=posted,summary=snippet or 'Podrobnosti nájdete v pôvodnom inzeráte.',source=clean(j.get('source')))

def main():
    key=os.environ.get('JOOBLE_API_KEY','').strip()
    if not key: raise SystemExit('Chýba JOOBLE_API_KEY. Nastavte GitHub Actions secret.')
    jobs={}
    for keyword in ('brigáda','študent','stáž','skrátený úväzok','čiastočný úväzok','internship'):
        for page in (1,2):
            payload=dict(keywords=keyword,location='Slovensko',page=page,ResultOnPage=50)
            req=urllib.request.Request('https://sk.jooble.org/api/'+quote(key,safe=''),data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Accept':'application/json'},method='POST')
            try:
                with urllib.request.urlopen(req,timeout=35) as r: data=json.load(r)
            except urllib.error.HTTPError as e: raise SystemExit(f'Jooble API: HTTP {e.code}; pôvodné ponuky zachované.') from None
            except Exception: raise SystemExit('Jooble API nedostupné; pôvodné ponuky zachované.') from None
            if not isinstance(data.get('jobs'),list): raise SystemExit('Neočakávaná odpoveď API.')
            for item in data['jobs']:
                job=convert(item)
                if job: jobs[job['id']]=job
            if not data['jobs'] or data.get('totalCount',100)<=page*50: break
    out=Path(__file__).with_name('jobs.json'); tmp=out.with_suffix('.tmp')
    tmp.write_text(json.dumps(dict(updated=datetime.now(timezone.utc).isoformat(),jobs=list(jobs.values())),ensure_ascii=False,indent=2),encoding='utf-8'); tmp.replace(out)
    print(f'Importované ponuky: {len(jobs)}')
if __name__=='__main__': main()
