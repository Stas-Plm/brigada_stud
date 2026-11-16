# JobStudent.sk
Otvorte priečinok vo VS Code a spustite Live Server alebo `python -m http.server 8000` a http://localhost:8000. Na GitHub Pages použite koreň repozitára.

Účty sú lokálny prototyp: údaje sú v localStorage, relácia v sessionStorage, heslá majú PBKDF2 hash so soľou. Nejde o serverové zabezpečenie ani synchronizáciu medzi zariadeniami. Nepoužívajte reálne heslá.

Import: požiadajte o partnerský RSS/XML export na https://www.profesia.sk/partneri. Nastavte jeho URL ako repository secret PROFESIA_FEED_URL (Settings > Secrets and variables > Actions). V Actions spustite Aktualizácia ponúk. Workflow sa následne pokúša o import každých 6 hodín. Formát exportu treba overiť a prípadne prispôsobiť import_jobs.py; bez schváleného feedu sa ponuky automaticky nezobrazia. Zatiaľ je dostupný priamy odkaz na brigády. Filter je konzervatívny podľa názvu ponuky, nie záruka vhodnosti. Reakcia na ponuku prebieha na Profesii. Ak je GitHub Pages nasadený z vetvy, automatické commity cez GITHUB_TOKEN nemusia spustiť nové nasadenie; nastavte vlastný Pages deployment workflow alebo ručne nasadzujte aktualizovaný súbor.
