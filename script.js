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
const JOBS = [];
const DEFAULT_PROFILE = {name:'',email:'',university:'',field:'',bio:'',skills:[],experience:[]};
const ACCOUNT_KEY = 'jobstudent.v2.accounts';
const SESSION_KEY = 'jobstudent.v2.session';
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
const fmtSalary = n => n == null ? 'Mzda v inzeráte' : fmtNum(n) + ' €/hod.';
const fmtDate = d => d ? new Date(d).toLocaleDateString('sk-SK') : 'neuvedené';
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
let accounts = load(ACCOUNT_KEY, {});
let active = sessionStorage.getItem(SESSION_KEY);
if (!active || !Object.hasOwn(accounts, active)) active = null;
let saved = [], profile = {...DEFAULT_PROFILE}, applications = [];
function activate(email) {
  active = email;
  if (email) sessionStorage.setItem(SESSION_KEY,email); else sessionStorage.removeItem(SESSION_KEY);
  const a = email ? accounts[email] : null;
  profile = a ? a.profile : {...DEFAULT_PROFILE}; saved = a ? a.saved : []; applications = a ? a.applications : [];
  $('.nav-actions').innerHTML = email ? '<button class="btn btn-outline" id="logout">Odhlásiť sa</button>' : '<a class="btn btn-outline" href="#/login">Prihlásiť sa</a><a class="btn btn-primary" href="#/register">Registrácia</a>';
}
function saveAccount() { if(active) { Object.assign(accounts[active],{profile,saved,applications}); persist(ACCOUNT_KEY,accounts); } }
async function passwordHash(password,salt) {
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const hash = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:600000,hash:'SHA-256'},key,256);
  return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
}
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
    if (f.minSalary > 0 && (job.salary == null || job.salary < f.minSalary)) return false;
    if (f.remote && !job.remote) return false;
    if (f.level !== '' && (job.level == null || job.level > Number(f.level))) return false;
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
  if (!active) { location.hash = "#/login"; toast("Najprv sa prihláste."); return; }
  const wasSaved = saved.includes(id);
  saved = wasSaved ? saved.filter(x => x !== id) : [...saved, id];
  saveAccount();
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
      <li>🗓️ Pridané: ${fmtDate(job.posted)} </li>
    </ul>
    <a class="btn btn-primary btn-lg" href="${esc(job.url)}" target="_blank" rel="noopener noreferrer">Reagovať na Profesia.sk</a>
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
  saveAccount();
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
  saveAccount();
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
async function handleRegisterSubmit(e) {
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
  const key = email.value.trim().toLowerCase();
  if (Object.hasOwn(accounts,key)) return showAlert(alertBox,'error','Tento e-mail už má účet.');
  try {
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
    accounts[key] = {salt,hash:await passwordHash(pass.value,salt),profile:{...DEFAULT_PROFILE,name:$('#regName').value.trim() || key.split('@')[0],email:key},saved:[],applications:[]};
    persist(ACCOUNT_KEY,accounts); activate(key); e.target.reset(); location.hash='#/profile';
  } catch { showAlert(alertBox,'error','Použite HTTPS alebo localhost.'); }

}

async function handleLoginSubmit(e) {
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
  const key = email.value.trim().toLowerCase();
  try {
    const a = Object.hasOwn(accounts,key) ? accounts[key] : null;
    if (!a || await passwordHash(pass.value,a.salt) !== a.hash) return showAlert(alertBox,'error','Nesprávny e-mail alebo heslo.');
    activate(key); e.target.reset(); location.hash='#/profile';
  } catch { showAlert(alertBox,'error','Prihlásenie sa nepodarilo.'); }

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
  if (name === 'profile' && !active) { location.hash = '#/login'; return; }
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
    if (e.target.closest('#logout')) { activate(null); location.hash='#/'; renderJobs(); return; }
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
activate(active);
populateRegions();
bindEvents();
renderJobs();
route();
async function loadOffers() {
  const status = $('#feedStatus');
  try {
    const r = await fetch('./jobs.json', {cache:'no-store'}); if(!r.ok) throw Error();
    const data = await r.json();
    const allowed = /^(https:\/\/)(www\.)?profesia\.sk\/praca\//i;
    JOBS.splice(0,JOBS.length,...data.jobs.filter(j=>allowed.test(j.url)&&/student|brigad|staz|internship|trainee/.test(norm(j.title))).map(j=>({...j,color:'#1d4ed8',keywords:[],summary:'Zdroj: Profesia.sk',description:'Podrobné informácie nájdete v pôvodnom inzeráte.',responsibilities:[],requirements:[],benefits:[],daysAgo:j.posted?Math.max(0,Math.floor((Date.now()-Date.parse(j.posted))/DAY_MS)):9999})));
    $('#region').innerHTML='<option value="">Všetky lokality</option>'; populateRegions(); renderJobs(); route();
    status.textContent=JOBS.length ? 'Zdroj: Profesia.sk • posledný import: '+fmtDate(data.updated) : 'Import zatiaľ neobsahuje študentské ponuky. Aktuálne ponuky nájdete priamo na Profesii.';
  } catch { status.textContent='Import nie je dostupný. Aktuálne ponuky nájdete priamo na Profesii.'; }
}
loadOffers();
