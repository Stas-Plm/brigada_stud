# JobStudent.sk – Jooble

## Nasadenie na GitHub Pages
1. Získajte slovenský REST API kľúč na https://sk.jooble.org/api/about (príde e-mailom).
2. Nahraďte súbory v koreňovom priečinku svojho GitHub repozitára súbormi z archívu. Nahrajte aj skrytý priečinok `.github/workflows/`. Odstráňte pôvodný `.github/workflows/profesia.yml`, ak existuje. Predvolená vetva je v nastavení workflow `main`.
3. Settings > Secrets and variables > Actions > New repository secret. Name: JOOBLE_API_KEY; Secret: váš kľúč.
4. Settings > Pages > Build and deployment > Source: GitHub Actions.
5. Actions > JobStudent – Jooble a GitHub Pages > Run workflow > main > Run workflow.
6. Po úspešnom nasadení otvorte adresu v Settings > Pages. Import a nasadenie sa opakuje približne každých 6 hodín. Manuálne spustenie je tiež možné. Import používa najviac 12 požiadaviek na jedno spustenie; bezplatný limit podľa dokumentácie Jooble z 11.11.2026 je 100 denne. Pri chybe importu sa nové nasadenie nevykoná a predchádzajúca verejná verzia zostáva dostupná.

## Lokálne spustenie
Python 3.10+ a moderný prehliadač. Vo VS Code PowerShell nastavte `$env:JOOBLE_API_KEY = 'VAS_KLUC'`, potom `python import_jobs.py`, následne `Remove-Item Env:JOOBLE_API_KEY` a `python -m http.server 8000`. Otvorte http://localhost:8000. Alternatívne použite Live Server. Nezverejňujte kľúč v kóde ani v repozitári.

## Obmedzenia
- Import vyhľadáva brigády, stáže, skrátené úväzky a študentské ponuky na Slovensku; používa textové pravidlá, nie ručné overenie každej pozície. Nepokrýva všetky ponuky. Dátum je posledná aktualizácia podľa Jooble, nie dátum zverejnenia. Mzda sa zobrazuje v pôvodnom formáte a hodinový filter funguje iba pri rozpoznanej hodinovej mzde. Pracovné skúsenosti API spoľahlivo neuvádza.
- Žiadosti sa odosielajú cez pôvodný inzerát, nie cez JobStudent.
- Účty sú lokálny školský prototyp, uložený v prehliadači. Nepoužívajte skutočné heslá. Synchronizáciu medzi zariadeniami neposkytuje.
- Bez API kľúča nebudú dostupné živé výsledky. Dodaný jobs.json je prázdny, nie sú v ňom vymyslené ponuky.
- Dokumentácia: https://help.jooble.org/en/support/solutions/articles/60001448238. Dodržujte podmienky Jooble API.
