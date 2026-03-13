(function () {
  'use strict';

  /* ─── GITHUB REPO CONFIG ─── */
  var GH_OWNER  = 'ryoikitenkaai';
  var GH_REPO   = 'Journal';
  var GH_BRANCH = 'main';
  var GH_PATH   = 'journals.json';
  var GH_ACCESS_KEYS_PATH = 'access_keys.json';
  var GH_TOKEN_KEY = 'hwp_gh_token';

  function getToken()  { return localStorage.getItem(GH_TOKEN_KEY) || ''; }
  function saveToken(t){ localStorage.setItem(GH_TOKEN_KEY, t); }

  /* ─────────────────────────── DEFAULT DATA ─────────────────────────── */
  const DEFAULT_JOURNALS = [
    {
      id: 1, num: '01', badge: '★ Q1 Ranked',
      title: 'International Journal of Advances in Signal and Image Sciences',
      issn: '2457-0370',
      tags: ['Electronic Engineering', 'Computer Science', 'Biomedical Engineering', 'Management', 'Economics'],
      visitUrl: 'https://xlescience.org/index.php/IJASIS/FocusandScope',
      scopusUrl: 'https://www.scopus.com/sourceid/21101274775#tabs=2'
    },
    {
      id: 2, num: '02', badge: null,
      title: 'Architectural Image Studies',
      issn: '2184-8645',
      tags: ['Engineering', 'Architecture', 'Management'],
      visitUrl: 'https://journals.ap2.pt/index.php/ais',
      scopusUrl: 'https://www.scopus.com/sourceid/21101247624'
    },
    {
      id: 3, num: '03', badge: null,
      title: 'MSW Management',
      issn: '1053-7899',
      tags: ['Multidisciplinary', 'Scientific Work', 'Management'],
      visitUrl: 'https://mswmanagementj.com/index.php/home/about',
      scopusUrl: 'https://www.scopus.com/sourceid/5300152536#tabs=0'
    },
    {
      id: 4, num: '04', badge: null,
      title: 'Advances in Consumer Research',
      issn: '0098-9258',
      tags: ['Applied Psychology', 'Marketing', 'Economics', 'Consumer Behaviour', 'Management', 'Business'],
      visitUrl: 'https://acr-journal.com',
      scopusUrl: 'https://www.scopus.com/sourceid/11600153426#tabs=2'
    },
    {
      id: 5, num: '05', badge: null,
      title: 'European Journal of Clinical Pharmacy',
      issn: '2385-409X',
      tags: ['Pharmacy', 'Dentistry', 'Medicine', 'Medical'],
      visitUrl: 'https://farmclin.com',
      scopusUrl: 'https://www.scopus.com/sourceid/21100466202#tabs=0'
    },
    {
      id: 6, num: '06', badge: null,
      title: 'International Journal of Drug Delivery Technology',
      issn: '0975-4415',
      tags: ['Pharmacology', 'Toxicology', 'Pharmaceutics', 'Pharmaceutical Science', 'Dentistry'],
      visitUrl: 'https://ijddt.com/',
      scopusUrl: 'https://www.scopus.com/sourceid/20500195212'
    }
  ];

  const DEFAULT_ACCESS_KEYS = [
    { key: 'JOURNAL443', label: 'Default Access Key', created: '2026-03-11' }
  ];

  const ADMIN_PASSWORD = 'chotu';

  /* ─────────────────────────── STATE ─────────────────────────── */
  let isAdmin       = false;
  let editingId     = null;
  let journalsCache = null;
  let accessKeysCache = null;

  /* ─────────────────────────── SITE INIT ─────────────────────────── */
  const siteWrapper    = document.getElementById('siteWrapper');

  async function loadAccessKeys() {
    if (accessKeysCache) return JSON.parse(JSON.stringify(accessKeysCache));
    try {
      var res = await fetch('access_keys.json?t=' + Date.now());
      if (res.ok) {
        accessKeysCache = await res.json();
        return JSON.parse(JSON.stringify(accessKeysCache));
      }
    } catch(e) {}
    accessKeysCache = JSON.parse(JSON.stringify(DEFAULT_ACCESS_KEYS));
    return JSON.parse(JSON.stringify(accessKeysCache));
  }

  async function saveAccessKeys(data) {
    accessKeysCache = JSON.parse(JSON.stringify(data));
    var token = getToken();
    if (!token) {
      showToast('warning', '⚠ No token set — open Admin Panel and enter your GitHub token.');
      return;
    }
    var apiUrl = 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO + '/contents/' + GH_ACCESS_KEYS_PATH;
    var headers = {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
    showToast('saving', '⏳ Saving access keys…');
    try {
      var getRes = await fetch(apiUrl + '?ref=' + GH_BRANCH, { headers: headers });
      if (!getRes.ok) { var e1 = await getRes.json(); throw new Error(e1.message || getRes.status); }
      var fileInfo = await getRes.json();
      var content  = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      var putRes = await fetch(apiUrl, {
        method: 'PUT', headers: headers,
        body: JSON.stringify({
          message: 'update access_keys.json via admin',
          content: content,
          sha: fileInfo.sha,
          branch: GH_BRANCH
        })
      });
      if (!putRes.ok) { var e2 = await putRes.json(); throw new Error(e2.message || putRes.status); }
      showToast('ok', '✓ Access keys saved!');
    } catch(err) {
      showToast('error', '✗ Save failed: ' + err.message);
    }
  }

  async function initSite() {
    if (siteWrapper) {
      siteWrapper.removeAttribute('style');
    }
    await renderCards();
  }

  /* ─────────────────────────── LOAD JOURNALS ─────────────────────────── */
  async function loadJournals() {
    if (journalsCache) return JSON.parse(JSON.stringify(journalsCache));
    try {
      var res = await fetch('journals.json?t=' + Date.now());
      if (res.ok) {
        journalsCache = await res.json();
        return JSON.parse(JSON.stringify(journalsCache));
      }
    } catch(e) {}
    journalsCache = JSON.parse(JSON.stringify(DEFAULT_JOURNALS));
    return JSON.parse(JSON.stringify(journalsCache));
  }

  /* ─────────────────────────── SAVE JOURNALS ─────────────────────────── */
  async function saveJournals(data) {
    journalsCache = JSON.parse(JSON.stringify(data));
    var token = getToken();
    if (!token) {
      showToast('warning', '⚠ No token set — open Admin Panel and enter your GitHub token.');
      return;
    }
    var apiUrl = 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO + '/contents/' + GH_PATH;
    var headers = {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
    showToast('saving', '⏳ Saving to GitHub…');
    try {
      var getRes = await fetch(apiUrl + '?ref=' + GH_BRANCH, { headers: headers });
      if (!getRes.ok) { var e1 = await getRes.json(); throw new Error(e1.message || getRes.status); }
      var fileInfo = await getRes.json();
      var content  = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      var putRes = await fetch(apiUrl, {
        method: 'PUT', headers: headers,
        body: JSON.stringify({
          message: 'update journals.json via admin',
          content: content,
          sha: fileInfo.sha,
          branch: GH_BRANCH
        })
      });
      if (!putRes.ok) { var e2 = await putRes.json(); throw new Error(e2.message || putRes.status); }
      showToast('ok', '✓ Saved! All devices will see the change in ~1 minute.');
    } catch(err) {
      showToast('error', '✗ Save failed: ' + err.message);
    }
  }

  /* ─────────────────────────── TOAST ─────────────────────────── */
  function showToast(type, msg) {
    var el = document.getElementById('hwpToast');
    if (!el) return;
    el.textContent   = msg;
    el.className     = 'hwp-toast hwp-toast--' + type;
    el.style.display = 'block';
    if (type === 'ok') setTimeout(function(){ el.style.display='none'; }, 5000);
  }

  /* ─────────────────────────── RENDER CARDS ─────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Subject → faded SVG icon mapping */
  var SUBJECT_ICONS = {
    // Engineering / CS / Electronics
    engineering: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="28" stroke="currentColor" stroke-width="2.5"/><circle cx="60" cy="60" r="10" fill="currentColor" opacity="0.3"/><path d="M60 28V12M60 108V92M92 60h16M12 60h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M82.6 37.4l11.3-11.3M26.1 93.9l11.3-11.3M82.6 82.6l11.3 11.3M26.1 26.1l11.3 11.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="48" y="48" width="24" height="24" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>',
    computer: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="20" width="90" height="60" rx="8" stroke="currentColor" stroke-width="2.5"/><path d="M40 95h40M50 80v15M70 80v15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M35 45h15M35 55h25M35 65h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/><path d="M70 40l10 10-10 10M85 40l10 10-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/></svg>',
    architecture: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60 15L15 45v5h90v-5L60 15z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><rect x="25" y="50" width="10" height="45" stroke="currentColor" stroke-width="2"/><rect x="45" y="50" width="10" height="45" stroke="currentColor" stroke-width="2"/><rect x="65" y="50" width="10" height="45" stroke="currentColor" stroke-width="2"/><rect x="85" y="50" width="10" height="45" stroke="currentColor" stroke-width="2"/><path d="M10 95h100" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M10 100h100" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/><circle cx="60" cy="35" r="5" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>',
    management: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="25" width="80" height="70" rx="6" stroke="currentColor" stroke-width="2.5"/><path d="M20 42h80" stroke="currentColor" stroke-width="2"/><circle cx="33" cy="33" r="3" fill="currentColor" opacity="0.4"/><circle cx="44" cy="33" r="3" fill="currentColor" opacity="0.3"/><circle cx="55" cy="33" r="3" fill="currentColor" opacity="0.2"/><path d="M35 78V58M50 78V63M65 78V55M80 78V50" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity="0.5"/><path d="M35 58l15 5 15-8 15-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/></svg>',
    psychology: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60 105V70" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M60 20c-22 0-35 14-35 30s13 22 35 22 35-7 35-22S82 20 60 20z" stroke="currentColor" stroke-width="2.5"/><path d="M45 45c0-8 6-14 15-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/><path d="M50 55c5 5 15 5 20 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/><circle cx="48" cy="45" r="3" fill="currentColor" opacity="0.3"/><circle cx="72" cy="45" r="3" fill="currentColor" opacity="0.3"/><path d="M38 35c-5 5-5 15 0 20M82 35c5 5 5 15 0 20" stroke="currentColor" stroke-width="1.5" opacity="0.25"/></svg>',
    medicine: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="45" y="15" width="30" height="90" rx="15" stroke="currentColor" stroke-width="2.5"/><rect x="15" y="45" width="90" height="30" rx="15" stroke="currentColor" stroke-width="2.5"/><circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.15"/><path d="M60 40v40M40 60h40" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.25"/></svg>',
    pharmacy: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 30h40v10c0 22-8 35-20 50-12-15-20-28-20-50V30z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 30h40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M40 45h40" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><circle cx="55" cy="60" r="4" fill="currentColor" opacity="0.25"/><circle cx="65" cy="55" r="3" fill="currentColor" opacity="0.2"/><circle cx="58" cy="72" r="3" fill="currentColor" opacity="0.15"/><path d="M35 22h50M37 26h46" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/><path d="M60 90v15M55 105h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    science: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="60" rx="45" ry="18" stroke="currentColor" stroke-width="2" transform="rotate(0 60 60)"/><ellipse cx="60" cy="60" rx="45" ry="18" stroke="currentColor" stroke-width="2" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="45" ry="18" stroke="currentColor" stroke-width="2" transform="rotate(-60 60 60)"/><circle cx="60" cy="60" r="6" fill="currentColor" opacity="0.35"/></svg>',
    economics: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="42" stroke="currentColor" stroke-width="2.5"/><path d="M60 25v70" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/><path d="M70 42c-3-5-8-7-13-6s-12 6-10 14c2 7 15 8 18 14s1 14-7 16c-6 1-12-1-16-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    marketing: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25 85V50l35-25 35 25v35" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="55" r="12" stroke="currentColor" stroke-width="2"/><circle cx="60" cy="55" r="5" fill="currentColor" opacity="0.2"/><path d="M42 90c0-10 8-18 18-18s18 8 18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M80 35l15-10v40l-15-10" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity="0.4"/></svg>',
    business: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="45" width="70" height="50" rx="5" stroke="currentColor" stroke-width="2.5"/><path d="M45 45V35c0-5.5 4.5-10 10-10h10c5.5 0 10 4.5 10 10v10" stroke="currentColor" stroke-width="2.5"/><path d="M25 60h70" stroke="currentColor" stroke-width="2" opacity="0.3"/><rect x="50" y="55" width="20" height="12" rx="3" fill="currentColor" opacity="0.15"/></svg>',
    default: '<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60 15L20 40v5h80v-5L60 15z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="30" y="45" width="8" height="40" stroke="currentColor" stroke-width="1.5"/><rect x="56" y="45" width="8" height="40" stroke="currentColor" stroke-width="1.5"/><rect x="82" y="45" width="8" height="40" stroke="currentColor" stroke-width="1.5"/><path d="M15 85h90M15 90h90" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M45 55h-2v25h2zM75 55h-2v25h2z" fill="currentColor" opacity="0.2"/></svg>'
  };

  /* Subject → real photo URL mapping (Unsplash CDN, small 400px) */
  var SUBJECT_PHOTOS = {
    engineering:  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80&auto=format',
    computer:     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80&auto=format',
    architecture: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&q=80&auto=format',
    management:   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80&auto=format',
    psychology:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format',
    medicine:     'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80&auto=format',
    pharmacy:     'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80&auto=format',
    science:      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80&auto=format',
    economics:    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80&auto=format',
    marketing:    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80&auto=format',
    business:     'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80&auto=format',
    default:      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80&auto=format'
  };

  /* Determine which icon to use based on tags */
  function getSubjectIcon(tags) {
    if (!tags || !tags.length) return SUBJECT_ICONS.default;
    var joined = tags.join(' ').toLowerCase();
    if (/pharmacy|pharmaceutic|pharmacol|drug|toxicol/.test(joined)) return SUBJECT_ICONS.pharmacy;
    if (/medicine|medical|dentist|clinical/.test(joined)) return SUBJECT_ICONS.medicine;
    if (/psycholog|consumer|behaviour/.test(joined)) return SUBJECT_ICONS.psychology;
    if (/architect/.test(joined)) return SUBJECT_ICONS.architecture;
    if (/computer|software|signal|image/.test(joined)) return SUBJECT_ICONS.computer;
    if (/engineer|electronic|biomedical/.test(joined)) return SUBJECT_ICONS.engineering;
    if (/marketing/.test(joined)) return SUBJECT_ICONS.marketing;
    if (/business/.test(joined)) return SUBJECT_ICONS.business;
    if (/econom/.test(joined)) return SUBJECT_ICONS.economics;
    if (/management/.test(joined)) return SUBJECT_ICONS.management;
    if (/multidisciplin|scien/.test(joined)) return SUBJECT_ICONS.science;
    return SUBJECT_ICONS.default;
  }

  /* Determine which photo to use based on tags */
  function getSubjectPhoto(tags) {
    if (!tags || !tags.length) return SUBJECT_PHOTOS.default;
    var joined = tags.join(' ').toLowerCase();
    if (/pharmacy|pharmaceutic|pharmacol|drug|toxicol/.test(joined)) return SUBJECT_PHOTOS.pharmacy;
    if (/medicine|medical|dentist|clinical/.test(joined)) return SUBJECT_PHOTOS.medicine;
    if (/psycholog|consumer|behaviour/.test(joined)) return SUBJECT_PHOTOS.psychology;
    if (/architect/.test(joined)) return SUBJECT_PHOTOS.architecture;
    if (/computer|software|signal|image/.test(joined)) return SUBJECT_PHOTOS.computer;
    if (/engineer|electronic|biomedical/.test(joined)) return SUBJECT_PHOTOS.engineering;
    if (/marketing/.test(joined)) return SUBJECT_PHOTOS.marketing;
    if (/business/.test(joined)) return SUBJECT_PHOTOS.business;
    if (/econom/.test(joined)) return SUBJECT_PHOTOS.economics;
    if (/management/.test(joined)) return SUBJECT_PHOTOS.management;
    if (/multidisciplin|scien/.test(joined)) return SUBJECT_PHOTOS.science;
    return SUBJECT_PHOTOS.default;
  }

  async function renderCards() {
    const grid   = document.getElementById('journalsGrid');
    const addBtn = document.getElementById('adminAddBtn');
    if (!grid) return;

    const journals = await loadJournals();

    grid.innerHTML = journals.map(function (j, idx) {
      var delay = (idx * 0.07).toFixed(2) + 's';
      var subjectSvg = getSubjectIcon(j.tags);
      var subjectPhoto = getSubjectPhoto(j.tags);
      return `
        <article class="jcard${isAdmin ? ' jcard--admin' : ''}" data-id="${j.id}" style="animation-delay:${delay}">
          ${isAdmin ? `
          <div class="jcard__admin-bar">
            <button class="jadmin-btn jadmin-btn--edit" data-id="${j.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="jadmin-btn jadmin-btn--delete" data-id="${j.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              Delete
            </button>
          </div>` : ''}
          <div class="jcard__bg-photo" aria-hidden="true">
            <img src="${subjectPhoto}" alt="" loading="lazy" draggable="false">
          </div>
          <div class="jcard__subject-icon" aria-hidden="true">${subjectSvg}</div>
          <div class="jcard__num">${esc(j.num)}</div>
          <div class="jcard__top">
            ${j.badge ? `<span class="badge badge--q1">${esc(j.badge)}</span>` : ''}
            <h3 class="jcard__title">${esc(j.title)}</h3>
            <div class="jcard__issn">ISSN &nbsp;<strong>${esc(j.issn)}</strong></div>
          </div>
          <div class="jcard__body">
            <p class="tags-label">Subject Areas</p>
            <div class="tags">
              ${j.tags.map(function (t) { return `<span class="tag">${esc(t)}</span>`; }).join('')}
            </div>
          </div>
          <div class="jcard__footer">
            <a href="${esc(j.visitUrl)}" target="_blank" class="jbtn jbtn--gold">Visit Journal</a>
            <a href="${esc(j.scopusUrl)}" target="_blank" class="jbtn jbtn--outline">Scopus Profile</a>
          </div>
        </article>`;
    }).join('');

    /* attach edit / delete listeners */
    if (isAdmin) {
      grid.querySelectorAll('.jadmin-btn--edit').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          openEditModal(Number(btn.dataset.id));
        });
      });
      grid.querySelectorAll('.jadmin-btn--delete').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          deleteCard(Number(btn.dataset.id));
        });
      });
    }

    if (addBtn) addBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  }

  async function deleteCard(id) {
    if (!confirm('Delete this journal card? This cannot be undone.')) return;
    const journals = (await loadJournals()).filter(function (j) { return j.id !== id; });
    await saveJournals(journals);
    await renderCards();
  }

  /* ─────────────────────────── ACCESS KEYS MANAGEMENT (Admin) ─────────────────────────── */
  async function renderAccessKeys() {
    const list = document.getElementById('accessKeysList');
    if (!list) return;
    const keys = await loadAccessKeys();
    list.innerHTML = keys.map(function(k, i) {
      return `
        <div class="access-key-item">
          <div class="access-key-item__info">
            <span class="access-key-item__label">${esc(k.label)}</span>
            <span class="access-key-item__key">${esc(k.key)}</span>
          </div>
          <button class="access-key-item__delete" data-index="${i}" title="Delete key">✕</button>
        </div>`;
    }).join('');

    list.querySelectorAll('.access-key-item__delete').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        const idx = Number(btn.dataset.index);
        const keys = await loadAccessKeys();
        if (keys.length <= 1) {
          alert('Cannot delete the last access key. At least one key must exist.');
          return;
        }
        if (!confirm('Delete this access key? Users with this key will lose access.')) return;
        keys.splice(idx, 1);
        await saveAccessKeys(keys);
        renderAccessKeys();
      });
    });
  }

  function generateAccessKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = 'HWP-';
    for (let i = 0; i < 4; i++) key += chars[Math.floor(Math.random() * chars.length)];
    key += '-';
    for (let i = 0; i < 4; i++) key += chars[Math.floor(Math.random() * chars.length)];
    return key;
  }

  document.getElementById('addAccessKeyBtn').addEventListener('click', async function() {
    const labelInput = document.getElementById('newAccessKeyLabel');
    const label = labelInput.value.trim();
    if (!label) {
      alert('Please enter a label for the key (e.g. person\'s name).');
      return;
    }
    const newKey = generateAccessKey();
    const keys = await loadAccessKeys();
    keys.push({ key: newKey, label: label, created: new Date().toISOString().split('T')[0] });
    await saveAccessKeys(keys);
    labelInput.value = '';
    renderAccessKeys();
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(newKey);
      showToast('ok', '✓ New key generated & copied: ' + newKey);
    } catch(e) {
      showToast('ok', '✓ New key generated: ' + newKey);
    }
  });

  /* ─────────────────────────── ADMIN PANEL ─────────────────────────── */
  const adminTrigger      = document.getElementById('adminTrigger');
  const adminPanel        = document.getElementById('adminPanel');
  const adminOverlay      = document.getElementById('adminOverlay');
  const adminPanelClose   = document.getElementById('adminPanelClose');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const adminSubmit       = document.getElementById('adminSubmit');
  const adminError        = document.getElementById('adminError');
  const adminLoginBody    = document.getElementById('adminLoginBody');
  const adminLoggedInBody = document.getElementById('adminLoggedInBody');
  const adminLogout       = document.getElementById('adminLogout');

  function openAdminPanel() {
    if (isAdmin) {
      adminLoginBody.style.display    = 'none';
      adminLoggedInBody.style.display = 'block';
      renderAccessKeys();
    } else {
      adminLoginBody.style.display    = 'block';
      adminLoggedInBody.style.display = 'none';
    }
    adminPanel.classList.add('open');
    adminOverlay.classList.add('open');
    if (!isAdmin) setTimeout(function () { adminPasswordInput.focus(); }, 250);
  }

  function closeAdminPanel() {
    adminPanel.classList.remove('open');
    adminOverlay.classList.remove('open');
    adminError.textContent = '';
  }

  adminTrigger.addEventListener('click', openAdminPanel);
  adminPanelClose.addEventListener('click', closeAdminPanel);
  adminOverlay.addEventListener('click', closeAdminPanel);

  adminPasswordInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') adminSubmit.click();
  });

  adminSubmit.addEventListener('click', function () {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
      isAdmin = true;
      adminPasswordInput.value = '';
      adminError.textContent   = '';
      adminLoginBody.style.display    = 'none';
      adminLoggedInBody.style.display = 'block';
      adminTrigger.classList.add('admin-active');
      /* populate token field if already saved */
      var tf = document.getElementById('ghTokenInput');
      if (tf) tf.value = getToken();
      renderAccessKeys();
      renderCards();
    } else {
      adminError.textContent   = 'Incorrect password. Try again.';
      adminPasswordInput.value = '';
      adminPasswordInput.classList.add('shake');
      setTimeout(function () { adminPasswordInput.classList.remove('shake'); }, 600);
      adminPasswordInput.focus();
    }
  });

  adminLogout.addEventListener('click', function () {
    isAdmin = false;
    adminTrigger.classList.remove('admin-active');
    closeAdminPanel();
    renderCards();
  });

  /* ─────────────────────────── MODAL ─────────────────────────── */
  const adminModal        = document.getElementById('adminModal');
  const adminModalOverlay = document.getElementById('adminModalOverlay');
  const modalTitle        = document.getElementById('modalTitle');
  const modalClose        = document.getElementById('modalClose');
  const modalCancel       = document.getElementById('modalCancel');
  const modalSave         = document.getElementById('modalSave');
  const mNum     = document.getElementById('mNum');
  const mBadge   = document.getElementById('mBadge');
  const mTitle   = document.getElementById('mTitle');
  const mIssn    = document.getElementById('mIssn');
  const mTags    = document.getElementById('mTags');
  const mVisitUrl  = document.getElementById('mVisitUrl');
  const mScopusUrl = document.getElementById('mScopusUrl');

  async function openEditModal(id) {
    editingId = id;
    const journals = await loadJournals();
    const j = journals.find(function (x) { return x.id === id; });
    if (!j) return;
    modalTitle.textContent = 'Edit Journal';
    mNum.value     = j.num;
    mBadge.value   = j.badge || '';
    mTitle.value   = j.title;
    mIssn.value    = j.issn;
    mTags.value    = j.tags.join(', ');
    mVisitUrl.value  = j.visitUrl;
    mScopusUrl.value = j.scopusUrl;
    openModal();
  }

  function openAddModal() {
    editingId = null;
    modalTitle.textContent = 'Add Journal';
    mNum.value = mBadge.value = mTitle.value = mIssn.value = mTags.value = mVisitUrl.value = mScopusUrl.value = '';
    openModal();
  }

  function openModal() {
    adminModal.classList.add('open');
    adminModalOverlay.classList.add('open');
    setTimeout(function () { mTitle.focus(); }, 100);
  }

  function closeModal() {
    adminModal.classList.remove('open');
    adminModalOverlay.classList.remove('open');
  }

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  adminModalOverlay.addEventListener('click', closeModal);
  document.getElementById('adminAddBtn').addEventListener('click', openAddModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      closeAdminPanel();
    }
  });

  modalSave.addEventListener('click', async function () {
    const titleVal = mTitle.value.trim();
    const issnVal  = mIssn.value.trim();
    if (!titleVal || !issnVal) {
      alert('Journal Title and ISSN are required.');
      return;
    }

    const journals  = await loadJournals();
    const tagsArray = mTags.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean);

    if (editingId !== null) {
      const idx = journals.findIndex(function (j) { return j.id === editingId; });
      if (idx !== -1) {
        journals[idx] = Object.assign({}, journals[idx], {
          num:      mNum.value.trim() || journals[idx].num,
          badge:    mBadge.value.trim() || null,
          title:    titleVal,
          issn:     issnVal,
          tags:     tagsArray,
          visitUrl: mVisitUrl.value.trim(),
          scopusUrl: mScopusUrl.value.trim()
        });
      }
    } else {
      const autoNum = String(journals.length + 1).padStart(2, '0');
      journals.push({
        id:       Date.now(),
        num:      mNum.value.trim() || autoNum,
        badge:    mBadge.value.trim() || null,
        title:    titleVal,
        issn:     issnVal,
        tags:     tagsArray,
        visitUrl: mVisitUrl.value.trim(),
        scopusUrl: mScopusUrl.value.trim()
      });
    }

    closeModal();
    await saveJournals(journals);
    await renderCards();
  });

  /* ─────────────────────────── TOKEN SAVE BUTTON ─────────────────────────── */
  document.getElementById('ghTokenSave').addEventListener('click', function () {
    var val = document.getElementById('ghTokenInput').value.trim();
    if (!val) { alert('Please paste your GitHub token.'); return; }
    saveToken(val);
    this.textContent = '✓ Saved!';
    var btn = this;
    setTimeout(function(){ btn.textContent = 'Save Token'; }, 2000);
  });

  /* ─────────────────────────── NAVBAR SCROLL EFFECT ─────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  /* ─────────────────────────── MOBILE MENU ─────────────────────────── */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ─────────────────────────── INIT ─────────────────────────── */
  initSite();

})();