'use strict';

/* =========================================================
   DÁTA
   ========================================================= */
const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE = {
  saved: 'jobstudent.saved',
  profile: 'jobstudent.profile',
  apps: 'jobstudent.applications'
};

// level: 0 = bez skúseností, 1 = do 1 roka, 2 = viac ako 1 rok
const JOBS = [
  {
    id: 1, title: 'Junior IT Support špecialista', company: 'TechSolutions', location: 'Žilina',
    salary: 7, type: 'Brigáda', remote: false, level: 0, daysAgo: 1, color: '#1d4ed8',
    keywords: ['it', 'podpora', 'helpdesk', 'počítače', 'hardvér'],
    summary: 'Pomôžte kolegom s každodennými IT problémami – od hardvéru až po nastavenie používateľských účtov.',
    description: 'Hľadáme študenta informatiky alebo príbuzného odboru, ktorý nám pomôže s podporou používateľov v našej kancelárii. Práca je flexibilná a ideálna popri štúdiu.',
    responsibilities: ['Riešenie požiadaviek používateľov cez ticketový systém', 'Inštalácia a konfigurácia počítačov a periférií', 'Správa používateľských účtov a prístupov'],
    requirements: ['Študent informatiky alebo príbuzného odboru', 'Základná znalosť Windows a počítačových sietí', 'Komunikatívnosť a ochota učiť sa'],
    benefits: ['Flexibilný rozvrh podľa skúškového obdobia', 'Mentor z radov skúsených administrátorov', 'Možnosť neskoršieho plného úväzku']
  },
  {
    id: 2, title: 'Administratívny pracovník', company: 'OfficePlus', location: 'Bratislava',
    salary: 8, type: 'Čiastočný úväzok', remote: false, level: 1, daysAgo: 2, color: '#0e7490',
    keywords: ['administratíva', 'kancelária', 'excel', 'office', 'dokumenty'],
    summary: 'Podpora tímu pri spracovaní dokumentov, e-mailovej komunikácii a vedení evidencie.',
    description: 'Pre našu pobočku v Bratislave hľadáme organizovaného študenta na 20 hodín týždenne. Získate prax v prostredí medzinárodnej kancelárie.',
    responsibilities: ['Spracovanie a archivácia dokumentov', 'Evidencia údajov v Exceli', 'Komunikácia s klientmi e-mailom a telefonicky'],
    requirements: ['Znalosť MS Office (najmä Excel)', 'Pozornosť na detail', 'Slovenčina a základy angličtiny'],
    benefits: ['Príspevok na stravu', 'Moderná kancelária v centre mesta', 'Pružný pracovný čas']
  },
  {
    id: 3, title: 'Pomocník v sklade', company: 'Logistics SK', location: 'Martin',
    salary: 6.5, type: 'Brigáda', remote: false, level: 0, daysAgo: 3, color: '#b45309',
    keywords: ['sklad', 'logistika', 'balenie', 'manuálna práca'],
    summary: 'Príjem, balenie a expedícia tovaru v modernom logistickom centre. Víkendové aj týždenné zmeny.',
    description: 'Brigáda vhodná pre študentov, ktorí si chcú privyrobiť popri škole. Zmeny si môžete vyberať podľa svojho rozvrhu.',
    responsibilities: ['Príjem a kontrola tovaru', 'Balenie a príprava zásielok', 'Udržiavanie poriadku v sklade'],
    requirements: ['Fyzická zdatnosť', 'Spoľahlivosť a zodpovednosť', 'Skúsenosti nie sú potrebné'],
    benefits: ['Výber zmien podľa rozvrhu', 'Doprava z Martina zabezpečená', 'Týždenné vyplácanie mzdy']
  },
  {
    id: 4, title: 'Stážista – webový vývoj', company: 'PixelWorks', location: 'Košice',
    salary: 5, type: 'Stáž', remote: true, level: 0, daysAgo: 5, color: '#7c3aed',
    keywords: ['web', 'html', 'css', 'javascript', 'programovanie', 'frontend'],
    summary: 'Naučte sa vývoj webových aplikácií v reálnom tíme pod vedením skúsených programátorov.',
    description: 'Trojmesačná stáž pre študentov, ktorí chcú získať prvé skúsenosti s tvorbou webov. Môžete pracovať aj na diaľku.',
    responsibilities: ['Tvorba komponentov v HTML, CSS a JavaScripte', 'Oprava chýb v existujúcich projektoch', 'Účasť na code review a stand-upoch'],
    requirements: ['Základy HTML, CSS a JavaScriptu', 'Záujem o frontend vývoj', 'Ochota učiť sa nové veci'],
    benefits: ['Mentoring a pravidelná spätná väzba', 'Práca na diaľku alebo v kancelárii', 'Potvrdenie o praxi pre univerzitu']
  },
  {
    id: 5, title: 'Zákaznícka podpora (home office)', company: 'HelpLine', location: 'Bratislava',
    salary: 7.5, type: 'Čiastočný úväzok', remote: true, level: 1, daysAgo: 4, color: '#0f766e',
    keywords: ['zákazníci', 'telefón', 'chat', 'home office', 'podpora'],
    summary: 'Odpovedajte zákazníkom cez chat a e-mail z pohodlia domova. Zaškolenie zabezpečíme.',
    description: 'Hľadáme komunikatívnych študentov na pozíciu operátora zákazníckej podpory. Práca je na diaľku, stačí notebook a internet.',
    responsibilities: ['Odpovede na otázky zákazníkov cez chat a e-mail', 'Riešenie reklamácií a objednávok', 'Aktualizácia znalostnej databázy'],
    requirements: ['Dobrá slovenčina a angličtina', 'Trpezlivosť a empatia', 'Vlastný notebook a pripojenie na internet'],
    benefits: ['Práca z domu', 'Platené zaškolenie', 'Bonusy za spokojnosť zákazníkov']
  },
  {
    id: 6, title: 'Marketingový stážista', company: 'BrandBoost', location: 'Žilina',
    salary: 5.5, type: 'Stáž', remote: true, level: 0, daysAgo: 6, color: '#be185d',
    keywords: ['marketing', 'sociálne siete', 'obsah', 'canva', 'copywriting'],
    summary: 'Tvorba obsahu pre sociálne siete a podpora kampaní pre slovenské značky.',
    description: 'Pridajte sa k mladému marketingovému tímu v Žiline. Naučíte sa plánovať obsah, písať texty a vyhodnocovať kampane.',
    responsibilities: ['Príprava príspevkov na sociálne siete', 'Písanie textov a newsletterov', 'Základná analýza výsledkov kampaní'],
    requirements: ['Kreativita a cit pre jazyk', 'Základy práce s Canvou alebo podobným nástrojom', 'Záujem o marketing'],
    benefits: ['Portfólio reálnych projektov', 'Hybridný režim práce', 'Možnosť zamestnania po stáži']
  },
  {
    id: 7, title: 'Čašník / servírka', company: 'Café Univerzita', location: 'Nitra',
    salary: 6, type: 'Brigáda', remote: false, level: 0, daysAgo: 7, color: '#4d7c0f',
    keywords: ['gastro', 'obsluha', 'kaviareň', 'víkend', 'čašník'],
    summary: 'Obsluha hostí v študentskej kaviarni. Príjemný kolektív, prepitné a flexibilné zmeny.',
    description: 'Kaviareň neďaleko kampusu hľadá šikovných študentov na víkendové a podvečerné zmeny.',
    responsibilities: ['Obsluha hostí a príjem objednávok', 'Príprava kávy a nápojov', 'Udržiavanie čistoty prevádzky'],
    requirements: ['Príjemné vystupovanie', 'Spoľahlivosť', 'Skúsenosti nie sú potrebné'],
    benefits: ['Prepitné navyše', 'Káva a občerstvenie zadarmo', 'Zľava pre študentov']
  },
  {
    id: 8, title: 'Junior dátový analytik', company: 'DataNest', location: 'Bratislava',
    salary: 11, type: 'Plný úväzok', remote: true, level: 2, daysAgo: 9, color: '#1e3a8a',
    keywords: ['dáta', 'sql', 'python', 'analytika', 'excel', 'reporty'],
    summary: 'Analyzujte dáta, pripravujte reporty a pomáhajte tímu robiť lepšie rozhodnutia.',
    description: 'Ideálne pre absolventov a študentov posledných ročníkov, ktorí už majú nejaké skúsenosti s dátami a chcú rásť v analytickom tíme.',
    responsibilities: ['Písanie SQL dopytov', 'Tvorba reportov a dashboardov', 'Spolupráca s produktovým tímom'],
    requirements: ['Znalosť SQL a Excelu', 'Základy Pythonu výhodou', 'Viac ako rok praxe alebo projektov s dátami'],
    benefits: ['Hybridná práca', 'Vzdelávací rozpočet', 'Stravné a dovolenka navyše']
  }
];
JOBS.forEach(job => { job.posted = new Date(Date.now() - job.daysAgo * DAY_MS); });

const DEFAULT_PROFILE = {
  name: 'Jana Kováčová',
  email: 'jana.kovacova@example.sk',
  university: 'Žilinská univerzita v Žiline',
  field: 'Informatika',
  bio: 'Študentka 2. ročníka informatiky. Hľadám brigády a stáže, kde sa môžem učiť a zároveň pomáhať tímu.',
  skills: ['HTML a CSS', 'JavaScript', 'Angličtina B2', 'Tímová práca'],
  experience: ['Brigádnička – Café Univerzita (leto 2025)', 'Tútorka programovania – FRI UNIZA (2025)']
};

const sampleApplications = () => [
  { title: 'Pomocník v sklade', company: 'Logistics SK', date: new Date(Date.now() - 12 * DAY_MS).toISOString(), status: 'Prijatá' },
  { title: 'Administratívny pracovník', company: 'OfficePlus', date: new Date(Date.now() - 5 * DAY_MS).toISOString(), status: 'V posudzovaní' }
];

/* =========================================================
   POMOCNÉ FUNKCIE
   ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Odstráni diakritiku a veľké písmená, aby "zilina" našlo "Žilina"
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const fmtNum = n => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const fmtSalary = n => fmtNum(n) + ' €/hod.';
const fmtDate = d => new Date(d).toLocaleDateString('sk-SK');
const agoText = days => (days === 0 ? 'dnes' : days === 1 ? 'včera' : `pred ${days} dňami`);
const orEmpty = s => esc(s) || '<span class="muted">Nevyplnené</span>';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* úložisko nie je dostupné */ }
}

/* =========================================================
   STAV
   ========================================================= */
let saved = load(STORAGE.saved, []);
let profile = Object.assign({}, DEFAULT_PROFILE, load(STORAGE.profile, {}));
let applications = load(STORAGE.apps, null) || sampleApplications();
let currentJob = null;

const nav = $('#mainNav');
const navToggle = $('.nav-toggle');

const BOOKMARK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';

/* =========================================================
   OZNÁMENIA, ALERTY A VALIDÁCIA
   ========================================================= */
let toastTimer;
function toast(message) {
  const t = $('#toast');
  t.textContent = message;
  t.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2600);
}

function showAlert(el, type, message) {
  el.className = 'alert alert-' + type;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.textContent = message;
  el.hidden = false;
}

function setError(input, message) {
  const err = document.getElementById(input.id + '-error');
  if (!err) return;
  err.textContent = message || '';
  err.hidden = !message;
  input.classList.toggle('is-invalid', Boolean(message));
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function clearErrors(form) {
  $$('input, textarea', form).forEach(el => setError(el, ''));
}

// Zbiera chyby formulára a po skončení zaostrí prvé chybné pole
function validator() {
  let first = null;
  return {
    check(input, message) {
      setError(input, message || '');
      if (message && !first) first = input;
    },
    finish() {
      if (first) first.focus();
      return !first;
    }
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ]{9,16}$/;
const emailError = v => (!v.trim() ? 'Zadajte e-mail.' : !EMAIL_RE.test(v.trim()) ? 'Zadajte platný e-mail (napr. meno@domena.sk).' : '');

// Chybové hlásenie zmizne, keď používateľ začne pole opravovať
['input', 'change'].forEach(evt => document.addEventListener(evt, e => {
  if (e.target.classList && e.target.classList.contains('is-invalid')) setError(e.target, '');
}));

/* =========================================================
   STRANA 1: HĽADANIE A FILTROVANIE
   ========================================================= */
function getFilters() {
  return {
    query: norm($('#q').value.trim()),
    place: norm($('#place').value.trim()),
    types: $$('input[name="type"]:checked').map(i => i.value),
    region: $('#region').value,
    minSalary: Number($('#salary').value),
    remote: $('#remote').checked,
    level: $('input[name="level"]:checked').value,
    sort: $('#sort').value
  };
}

function relevance(job, words) {
  let score = 0;
  words.forEach(w => {
    if (norm(job.title).includes(w)) score += 3;
    if (job.keywords.some(k => norm(k).includes(w))) score += 2;
    if (norm(job.company).includes(w)) score += 2;
    if (norm(job.summary + ' ' + job.description).includes(w)) score += 1;
  });
  return score;
}

function jobCardHTML(job) {
  return `
    <article class="job-card">
      <div class="logo" style="--logo:${job.color}" aria-hidden="true">${esc(initials(job.company))}</div>
      <div class="job-card__body">
        <h3 class="job-card__title">${esc(job.title)}</h3>
        <p class="job-card__company">${esc(job.company)}</p>
        <ul class="meta">
          <li>📍 ${esc(job.location)}</li>
          <li>💶 ${fmtSalary(job.salary)}</li>
          <li><span class="badge">${esc(job.type)}</span></li>
          ${job.remote ? '<li><span class="badge badge-green">Práca z domu</span></li>' : ''}
        </ul>
        <p class="job-card__summary">${esc(job.summary)}</p>
      </div>
      <div class="job-card__actions">
        <button type="button" class="bookmark" data-save-id="${job.id}" data-title="${esc(job.title)}" aria-pressed="false">${BOOKMARK_SVG}</button>
        <a class="btn btn-primary" href="#/job/${job.id}">Detail ponuky</a>
      </div>
    </article>`;
}

function renderJobs() {
  const f = getFilters();
  const words = f.query.split(/\s+/).filter(Boolean);

  $('#salaryValue').textContent = f.minSalary > 0 ? 'od ' + fmtSalary(f.minSalary) : 'bez obmedzenia';

  let list = JOBS.filter(job => {
    const haystack = norm([job.title, job.company, job.location, job.summary, job.description, job.keywords.join(' ')].join(' '));
    if (!words.every(w => haystack.includes(w))) return false;
    if (f.place && !norm(job.location).includes(f.place)) return false;
    if (f.region && job.location !== f.region) return false;
    if (f.types.length && !f.types.includes(job.type)) return false;
    if (job.salary < f.minSalary) return false;
    if (f.remote && !job.remote) return false;
    if (f.level !== '' && job.level > Number(f.level)) return false;
    return true;
  });

  if (f.sort === 'salary') list.sort((a, b) => b.salary - a.salary || a.daysAgo - b.daysAgo);
  else if (f.sort === 'newest') list.sort((a, b) => a.daysAgo - b.daysAgo);
  else list.sort((a, b) => relevance(b, words) - relevance(a, words) || a.id - b.id);

  $('#resultCount').innerHTML = `Počet dostupných ponúk: <strong>${list.length}</strong>`;
  $('#jobList').innerHTML = list.map(jobCardHTML).join('');
  $('#emptyState').hidden = list.length > 0;
  refreshBookmarks();
}

function resetFilters() {
  $('#searchForm').reset();
  $('#filtersForm').reset();
  $('#sort').value = 'relevance';
  renderJobs();
}

function populateRegions() {
  const cities = [...new Set(JOBS.map(j => j.location))].sort((a, b) => a.localeCompare(b, 'sk'));
  $('#region').insertAdjacentHTML('beforeend', cities.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join(''));
}

/* =========================================================
   ZÁLOŽKY (ULOŽENÉ PONUKY)
   ========================================================= */
function refreshBookmarks() {
  $$('[data-save-id]').forEach(btn => {
    const on = saved.includes(Number(btn.dataset.saveId));
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', (on ? 'Odstrániť z uložených: ' : 'Uložiť ponuku: ') + btn.dataset.title);
    btn.title = on ? 'Odstrániť z uložených' : 'Uložiť ponuku';
  });
}

function toggleSaved(id) {
  const wasSaved = saved.includes(id);
  saved = wasSaved ? saved.filter(x => x !== id) : [...saved, id];
  persist(STORAGE.saved, saved);
  toast(wasSaved ? 'Ponuka bola odstránená z uložených.' : 'Ponuka bola uložená.');
  if (!$('#page-profile').hidden) renderSavedJobs();
  refreshBookmarks();
}

/* =========================================================
   STRANA 2: DETAIL PONUKY
   ========================================================= */
function relatedJobs(job) {
  return JOBS.filter(j => j.id !== job.id)
    .map(j => ({ j, score: (j.type === job.type ? 2 : 0) + (j.location === job.location ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || a.j.id - b.j.id)
    .slice(0, 4)
    .map(x => x.j);
}

function renderDetail(id) {
  const job = JOBS.find(j => j.id === id);
  currentJob = job || null;

  // Pri každom otvorení detailu sa formulár žiadosti vráti do pôvodného stavu
  $('#applySection').hidden = true;
  $('#applyAlert').hidden = true;
  $('#applyForm').reset();
  clearErrors($('#applyForm'));

  const related = job ? relatedJobs(job) : JOBS.slice(0, 4);
  $('#relatedList').innerHTML = related.map(j => `
    <li><a href="#/job/${j.id}"><strong>${esc(j.title)}</strong><span>${esc(j.company)} · ${fmtSalary(j.salary)}</span></a></li>`).join('');

  if (!job) {
    $('#jobDetail').innerHTML = `
      <h1>Ponuka sa nenašla</h1>
      <p>Táto ponuka neexistuje alebo už nie je dostupná.</p>
      <a class="btn btn-primary" href="#/">Späť na ponuky</a>`;
    return null;
  }

  const list = items => `<ul class="check-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
  $('#jobDetail').innerHTML = `
    <div class="detail-head">
      <div class="logo logo-lg" style="--logo:${job.color}" aria-hidden="true">${esc(initials(job.company))}</div>
      <div class="detail-head__text">
        <h1>${esc(job.title)}</h1>
        <p class="job-card__company">${esc(job.company)}</p>
      </div>
      <button type="button" class="bookmark" data-save-id="${job.id}" data-title="${esc(job.title)}" aria-pressed="false">${BOOKMARK_SVG}</button>
    </div>
    <ul class="meta meta-lg">
      <li>📍 ${esc(job.location)}</li>
      <li>💶 ${fmtSalary(job.salary)}</li>
      <li><span class="badge">${esc(job.type)}</span></li>
      ${job.remote ? '<li><span class="badge badge-green">Možnosť práce z domu</span></li>' : ''}
      <li>🗓️ Pridané: ${fmtDate(job.posted)} (${agoText(job.daysAgo)})</li>
    </ul>
    <button type="button" class="btn btn-primary btn-lg" data-apply aria-controls="applySection" aria-expanded="false">Mám záujem o túto ponuku</button>
    <h2>Popis pozície</h2>
    <p>${esc(job.description)}</p>
    <h2>Hlavné povinnosti</h2>${list(job.responsibilities)}
    <h2>Požiadavky</h2>${list(job.requirements)}
    <h2>Benefity</h2>${list(job.benefits)}`;
  return job;
}

function openApplyForm() {
  if (!currentJob) return;
  $('#applyJobName').textContent = `${currentJob.title} · ${currentJob.company}`;
  if (!$('#applyName').value) $('#applyName').value = profile.name || '';
  if (!$('#applyEmail').value) $('#applyEmail').value = profile.email || '';
  $('#applySection').hidden = false;
  const btn = $('[data-apply]');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  $('#applySection').scrollIntoView();
  $('#applyName').focus({ preventScroll: true });
}

function handleApplySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = $('#applyName'), email = $('#applyEmail'), phone = $('#applyPhone'), cv = $('#applyCv');
  const alertBox = $('#applyAlert');
  alertBox.hidden = true;

  const v = validator();
  v.check(name, name.value.trim() ? '' : 'Zadajte meno a priezvisko.');
  v.check(email, emailError(email.value));
  v.check(phone, phone.value.trim() && !PHONE_RE.test(phone.value.trim()) ? 'Zadajte platné telefónne číslo (napr. +421 900 123 456).' : '');
  const file = cv.files[0];
  v.check(cv, !file ? 'Nahrajte svoje CV (PDF alebo Word).'
    : !/\.(pdf|docx?)$/i.test(file.name) ? 'CV musí byť vo formáte PDF, DOC alebo DOCX.'
    : file.size > 5 * 1024 * 1024 ? 'Súbor je príliš veľký (maximum je 5 MB).' : '');

  if (!v.finish()) {
    showAlert(alertBox, 'error', 'Skontrolujte prosím zvýraznené polia a skúste to znova.');
    return;
  }

  applications.unshift({ title: currentJob.title, company: currentJob.company, date: new Date().toISOString(), status: 'Odoslaná (ukážka)' });
  persist(STORAGE.apps, applications);
  form.reset();
  showAlert(alertBox, 'success', 'Ďakujeme! Formulár je v poriadku. Pozor: ide len o frontendovú ukážku, žiadosť sa zamestnávateľovi neodoslala.');
}

/* =========================================================
   STRANA 3: PROFIL
   ========================================================= */
function renderProfile() {
  const p = profile;
  $('#profileView').innerHTML = `
    <div class="avatar" aria-hidden="true">${esc(initials(p.name))}</div>
    <h2 class="profile-name">${esc(p.name)}</h2>
    <p class="muted">${esc(p.email)}</p>
    <dl class="profile-facts">
      <dt>Univerzita</dt><dd>${orEmpty(p.university)}</dd>
      <dt>Študijný odbor</dt><dd>${orEmpty(p.field)}</dd>
    </dl>
    <h3>O mne</h3>
    <p>${orEmpty(p.bio)}</p>
    <h3>Zručnosti</h3>
    ${p.skills.length ? `<ul class="chips">${p.skills.map(s => `<li class="chip">${esc(s)}</li>`).join('')}</ul>` : '<p class="muted">Nevyplnené</p>'}
    <h3>Pracovné skúsenosti</h3>
    ${p.experience.length ? `<ul class="exp-list">${p.experience.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="muted">Nevyplnené</p>'}`;
}

function openProfileEdit() {
  $('#pName').value = profile.name;
  $('#pEmail').value = profile.email;
  $('#pUni').value = profile.university;
  $('#pField').value = profile.field;
  $('#pBio').value = profile.bio;
  $('#pSkills').value = profile.skills.join(', ');
  $('#pExp').value = profile.experience.join('\n');
  clearErrors($('#profileForm'));
  $('#profileEdit').hidden = false;
  $('#editProfileBtn').setAttribute('aria-expanded', 'true');
  $('#profileEdit').scrollIntoView();
  $('#pName').focus({ preventScroll: true });
}

function closeProfileEdit() {
  $('#profileEdit').hidden = true;
  $('#editProfileBtn').setAttribute('aria-expanded', 'false');
}

function handleProfileSubmit(e) {
  e.preventDefault();
  const name = $('#pName'), email = $('#pEmail');
  const v = validator();
  v.check(name, name.value.trim() ? '' : 'Zadajte meno a priezvisko.');
  v.check(email, emailError(email.value));
  if (!v.finish()) return;

  const lines = text => text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  profile = {
    name: name.value.trim(),
    email: email.value.trim(),
    university: $('#pUni').value.trim(),
    field: $('#pField').value.trim(),
    bio: $('#pBio').value.trim(),
    skills: $('#pSkills').value.split(',').map(s => s.trim()).filter(Boolean),
    experience: lines($('#pExp').value)
  };
  persist(STORAGE.profile, profile);
  renderProfile();
  closeProfileEdit();
  $('#editProfileBtn').focus();
  toast('Profil bol uložený.');
}

function renderSavedJobs() {
  const jobs = JOBS.filter(j => saved.includes(j.id));
  const box = $('#savedList');
  if (!jobs.length) {
    box.innerHTML = `
      <div class="empty">
        <div class="empty__icon" aria-hidden="true">🔖</div>
        <p>Zatiaľ nemáte uložené žiadne ponuky. Kliknite na ikonu záložky pri ponuke, ktorá vás zaujala, a nájdete ju tu.</p>
        <a class="btn btn-primary" href="#/">Prezrieť ponuky</a>
      </div>`;
    return;
  }
  box.innerHTML = jobs.map(job => `
    <div class="mini-job">
      <div class="logo logo-sm" style="--logo:${job.color}" aria-hidden="true">${esc(initials(job.company))}</div>
      <div>
        <h3>${esc(job.title)}</h3>
        <p>${esc(job.company)} · ${esc(job.location)} · ${fmtSalary(job.salary)}</p>
      </div>
      <div class="mini-job__actions">
        <a class="btn btn-outline" href="#/job/${job.id}">Detail ponuky</a>
        <button type="button" class="bookmark" data-save-id="${job.id}" data-title="${esc(job.title)}" aria-pressed="true">${BOOKMARK_SVG}</button>
      </div>
    </div>`).join('');
  refreshBookmarks();
}

function renderApplications() {
  const box = $('#appsList');
  if (!applications.length) {
    box.innerHTML = '<p class="muted">Zatiaľ ste neodoslali žiadne žiadosti.</p>';
    return;
  }
  box.innerHTML = applications.map(a => `
    <div class="mini-job">
      <div class="logo logo-sm" style="--logo:var(--navy)" aria-hidden="true">${esc(initials(a.company))}</div>
      <div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.company)} · odoslané ${fmtDate(a.date)}</p>
      </div>
      <span class="badge ${a.status === 'Prijatá' ? 'badge-green' : a.status === 'V posudzovaní' ? 'badge-amber' : ''} app-status">${esc(a.status)}</span>
    </div>`).join('');
}

/* =========================================================
   STRANA 4: REGISTRÁCIA A PRIHLÁSENIE (len ukážka)
   ========================================================= */
function handleRegisterSubmit(e) {
  e.preventDefault();
  const email = $('#regEmail'), pass = $('#regPassword'), pass2 = $('#regPassword2'), terms = $('#regTerms');
  const alertBox = $('#registerAlert');
  alertBox.hidden = true;

  const v = validator();
  v.check(email, emailError(email.value));
  v.check(pass, !pass.value ? 'Zadajte heslo.' : pass.value.length < 8 ? 'Heslo musí mať aspoň 8 znakov.' : '');
  v.check(pass2, !pass2.value ? 'Zopakujte heslo.' : pass2.value !== pass.value ? 'Heslá sa nezhodujú.' : '');
  v.check(terms, terms.checked ? '' : 'Pred vytvorením účtu musíte súhlasiť s podmienkami používania.');

  if (!v.finish()) {
    showAlert(alertBox, 'error', 'Skontrolujte prosím zvýraznené polia.');
    return;
  }
  e.target.reset(); // heslo sa nikam neukladá
  showAlert(alertBox, 'success', 'Registrácia prebehla úspešne (ukážka). Účet sa nevytvoril a údaje sa nikam neodoslali ani neuložili.');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = $('#loginEmail'), pass = $('#loginPassword');
  const alertBox = $('#loginAlert');
  alertBox.hidden = true;

  const v = validator();
  v.check(email, emailError(email.value));
  v.check(pass, pass.value ? '' : 'Zadajte heslo.');

  if (!v.finish()) {
    showAlert(alertBox, 'error', 'Skontrolujte prosím zvýraznené polia.');
    return;
  }
  e.target.reset();
  showAlert(alertBox, 'success', 'Údaje sú vo správnom formáte. Skutočné prihlásenie nie je implementované, ide len o ukážku.');
}

/* =========================================================
   NAVIGÁCIA (hash routing)
   ========================================================= */
function closeNav() {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const name = ['job', 'profile', 'register', 'login'].includes(parts[0]) ? parts[0] : 'jobs';
  const wantsSaved = name === 'profile' && parts[1] === 'saved';

  $$('.page').forEach(p => { p.hidden = p.id !== 'page-' + name; });
  closeNav();

  let title = 'JobStudent.sk – Brigády a stáže pre študentov';
  if (name === 'job') {
    const job = renderDetail(Number(parts[1]));
    title = (job ? job.title : 'Ponuka sa nenašla') + ' – JobStudent.sk';
  } else if (name === 'profile') {
    closeProfileEdit();
    renderProfile();
    renderSavedJobs();
    renderApplications();
    title = 'Môj profil – JobStudent.sk';
  } else if (name === 'register') {
    title = 'Registrácia – JobStudent.sk';
  } else if (name === 'login') {
    title = 'Prihlásenie – JobStudent.sk';
  }
  document.title = title;

  const activeKey = name === 'job' ? 'jobs' : wantsSaved ? 'saved' : name;
  $$('.site-nav [data-route]').forEach(a => {
    if (a.dataset.route === activeKey) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  if (wantsSaved) $('#savedSection').scrollIntoView();
  else window.scrollTo(0, 0);
  refreshBookmarks();
}

/* =========================================================
   UDALOSTI
   ========================================================= */
function bindEvents() {
  // Vyhľadávanie a filtre (výsledky sa prepočítavajú okamžite)
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); renderJobs(); $('#jobList').scrollIntoView({ block: 'start' }); });
  $('#searchForm').addEventListener('input', renderJobs);
  $('#filtersForm').addEventListener('input', renderJobs);
  $('#filtersForm').addEventListener('change', renderJobs);
  $('#filtersForm').addEventListener('submit', e => e.preventDefault());
  $('#sort').addEventListener('change', renderJobs);

  $('#filtersToggle').addEventListener('click', () => {
    const open = $('#filters').classList.toggle('is-open');
    $('#filtersToggle').setAttribute('aria-expanded', String(open));
    $('#filtersToggle').textContent = open ? 'Skryť filtre' : 'Zobraziť filtre';
  });

  // Delegované kliknutia (karty sa generujú dynamicky)
  document.addEventListener('click', e => {
    const saveBtn = e.target.closest('[data-save-id]');
    if (saveBtn) { toggleSaved(Number(saveBtn.dataset.saveId)); return; }
    if (e.target.closest('.js-reset')) { resetFilters(); return; }
    if (e.target.closest('[data-apply]')) { openApplyForm(); }
  });

  // Formuláre
  $('#applyForm').addEventListener('submit', handleApplySubmit);
  $('#profileForm').addEventListener('submit', handleProfileSubmit);
  $('#registerForm').addEventListener('submit', handleRegisterSubmit);
  $('#loginForm').addEventListener('submit', handleLoginSubmit);

  // Profil
  $('#editProfileBtn').addEventListener('click', () => {
    if ($('#profileEdit').hidden) openProfileEdit(); else closeProfileEdit();
  });
  $('#cancelEdit').addEventListener('click', () => { closeProfileEdit(); $('#editProfileBtn').focus(); });

  // Mobilné menu
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  window.addEventListener('hashchange', route);
}

/* =========================================================
   ŠTART
   ========================================================= */
populateRegions();
bindEvents();
renderJobs();
route();