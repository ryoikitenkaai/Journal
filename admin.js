(function () {
  'use strict';

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

  const ADMIN_PASSWORD = 'chotu';
  const STORAGE_KEY    = 'hwp_journals';

  /* ─────────────────────────── STATE ─────────────────────────── */
  let isAdmin    = false;
  let editingId  = null; // null = "add new" mode

  /* ─────────────────────────── STORAGE ─────────────────────────── */
  function loadJournals() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_JOURNALS));
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_JOURNALS));
    }
  }

  function saveJournals(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /* ─────────────────────────── RENDER CARDS ─────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCards() {
    const grid   = document.getElementById('journalsGrid');
    const addBtn = document.getElementById('adminAddBtn');
    if (!grid) return;

    const journals = loadJournals();

    grid.innerHTML = journals.map(function (j, idx) {
      const delay = (idx * 0.07).toFixed(2) + 's';
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

  function deleteCard(id) {
    if (!confirm('Delete this journal card? This cannot be undone.')) return;
    const journals = loadJournals().filter(function (j) { return j.id !== id; });
    saveJournals(journals);
    renderCards();
  }

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

  function openEditModal(id) {
    editingId = id;
    const journals = loadJournals();
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

  modalSave.addEventListener('click', function () {
    const titleVal = mTitle.value.trim();
    const issnVal  = mIssn.value.trim();
    if (!titleVal || !issnVal) {
      alert('Journal Title and ISSN are required.');
      return;
    }

    const journals  = loadJournals();
    const tagsArray = mTags.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean);

    if (editingId !== null) {
      /* EDIT */
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
      /* ADD */
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

    saveJournals(journals);
    closeModal();
    renderCards();
  });

  /* ─────────────────────────── INIT ─────────────────────────── */
  renderCards();

})();
