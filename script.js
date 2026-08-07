'use strict';

/* ---------- Tema (koyu / açık) ---------- */
const themeBtn = document.querySelector('[data-theme-btn]');
const themeIcon = document.querySelector('[data-theme-icon]');

let theme = localStorage.getItem('theme') === 'light' ? 'light' : 'dark';

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  themeIcon.setAttribute('href', theme === 'dark' ? '#i-sun' : '#i-moon');
}

themeBtn.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  applyTheme();
});

applyTheme();

/* ---------- Dil (TR / EN) ---------- */
const CV_FILES = { tr: 'assets/cv-tr.pdf', en: 'assets/cv-en.pdf' };

const langBtn = document.querySelector('[data-lang-btn]');
const langLabel = document.querySelector('[data-lang-label]');
const cvLink = document.querySelector('[data-cv-link]');
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');
const sidebarBtnText = document.querySelector('[data-sidebar-btn-text]');

let lang = localStorage.getItem('lang') === 'en' ? 'en' : 'tr';

function t(key) {
  const dict = window.TRANSLATIONS[lang] || {};
  return dict[key];
}

function applyTranslations() {
  document.documentElement.lang = lang;
  document.title = t('meta.title');

  const metaDescription = t('meta.description');
  document.querySelector('meta[name="description"]').setAttribute('content', metaDescription);
  document.querySelector('meta[property="og:title"]').setAttribute('content', t('meta.title'));
  document.querySelector('meta[property="og:description"]').setAttribute('content', metaDescription);
  document.querySelector('meta[name="twitter:title"]').setAttribute('content', t('meta.title'));
  document.querySelector('meta[name="twitter:description"]').setAttribute('content', metaDescription);
  document.querySelector('meta[property="og:locale"]').setAttribute('content', lang === 'tr' ? 'tr_TR' : 'en_US');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (value) el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':');
      const value = t(key.trim());
      if (value) el.setAttribute(attr.trim(), value);
    });
  });

  langLabel.textContent = lang === 'tr' ? 'EN' : 'TR';
  cvLink.setAttribute('href', CV_FILES[lang]);

  // Sidebar butonu açık/kapalı durumuna göre farklı metin kullanır
  updateSidebarBtnText();
}

function setLang(next) {
  lang = next;
  localStorage.setItem('lang', lang);
  applyTranslations();
}

langBtn.addEventListener('click', () => setLang(lang === 'tr' ? 'en' : 'tr'));

/* ---------- Sidebar aç/kapa (mobil) ---------- */
function updateSidebarBtnText() {
  const open = sidebar.classList.contains('active');
  sidebarBtnText.textContent = open ? t('side.hideInfo') : t('side.showInfo');
  sidebarBtn.setAttribute('aria-expanded', String(open));
}

sidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  updateSidebarBtnText();
});

/* ---------- Sayfa (sekme) değiştirme ---------- */
const navLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const target = link.dataset.navLink;

    pages.forEach((page) => page.classList.toggle('active', page.dataset.page === target));
    navLinks.forEach((l) => l.classList.toggle('active', l === link));

    window.scrollTo({ top: 0, behavior: 'smooth' });
    observeReveals(document.querySelector(`[data-page="${target}"]`), true);
  });
});

/* ---------- Proje filtreleme ---------- */
const filterBtns = document.querySelectorAll('[data-filter-btn]');
const filterItems = document.querySelectorAll('[data-filter-item]');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.filterBtn;

    filterItems.forEach((item) => {
      item.classList.toggle('active', value === 'all' || item.dataset.category === value);
    });
    filterBtns.forEach((b) => b.classList.toggle('active', b === btn));

    observeReveals(document.querySelector('.project-list'), true);
  });
});

/* ---------- Scroll ile beliren öğeler ---------- */
document.querySelectorAll('[data-reveal-item] .project-card').forEach((el) => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    // Yeni görünür olan öğede geçişin atlanmaması için bir kare bekle
    requestAnimationFrame(() => entry.target.classList.add('is-visible'));
  });
}, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });

// Sekmeler display:none olduğu için her sekme açılışında yeniden gözlemlenir
function observeReveals(scope, replay = false) {
  if (replay) {
    scope.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.unobserve(el);
      el.classList.remove('is-visible');
    });
  }

  const items = scope.querySelectorAll('.reveal:not(.is-visible)');
  const fastSelector = '.project-list, .skills-list';

  items.forEach((el, i) => {
    const step = el.closest(fastSelector) ? 60 : 140;
    el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * step}ms`);
  });

  // display:none -> block geçişinden sonra tarayıcının ilk stili hesaplamasını bekle
  requestAnimationFrame(() => {
    items.forEach((el) => revealObserver.observe(el));
  });
}

/* ---------- Kart üzerinde imleç takibi (hover vurgusu) ---------- */
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (finePointer && !reducedMotion) {
  const projectList = document.querySelector('.project-list');

  projectList.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.project-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
}

/* ---------- Başlangıç ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
applyTranslations();
observeReveals(document.querySelector('[data-page="hakkimda"]'));
