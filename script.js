'use strict';
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} }
};
const root = document.documentElement;
let lang = storage.get('lang') === 'en' ? 'en' : 'tr';
let theme = storage.get('theme') === 'dark' ? 'dark' : 'light';
let paused = storage.get('motion') === 'paused';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktopGallery = matchMedia('(min-width: 901px) and (min-height: 620px)');
const languageButton = document.getElementById('language');
const themeButton = document.getElementById('theme');
const motionButton = document.getElementById('motion');
const showcase = document.querySelector('.showcase');
const track = document.querySelector('.showcase-track');
const slides = [...document.querySelectorAll('.project-slide')];
const slideButtons = [...document.querySelectorAll('[data-slide]')];
const previousButton = document.getElementById('previous-project');
const nextButton = document.getElementById('next-project');
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const galleryProgress = document.querySelector('.gallery-progress>span');
const navLinks = [...document.querySelectorAll('.site-header nav a')];
const navigation = document.querySelector('.site-header nav');
const navIndicator = document.createElement('span');
navIndicator.className = 'nav-indicator';
navIndicator.setAttribute('aria-hidden','true');
navigation.append(navIndicator);
let navPreview = null;
function updateNavIndicator() {
  const target = navPreview || navLinks.find(link => link.hasAttribute('aria-current'));
  navIndicator.style.opacity = target ? '1' : '0';
  if (!target) return;
  const bounds = navigation.getBoundingClientRect();
  const item = target.getBoundingClientRect();
  navIndicator.style.width = `${item.width}px`;
  navIndicator.style.transform = `translateX(${item.left-bounds.left}px)`;
}
navLinks.forEach(link => {
  link.addEventListener('pointerenter', () => { navPreview = link; updateNavIndicator(); });
  link.addEventListener('focus', () => { navPreview = link; updateNavIndicator(); });
  link.addEventListener('click', () => { navPreview = null; });
});
navigation.addEventListener('pointerleave', () => { navPreview = null; updateNavIndicator(); });
navigation.addEventListener('focusout', () => { navPreview = null; updateNavIndicator(); });
new ResizeObserver(updateNavIndicator).observe(navigation);
const dialog = document.getElementById('project-dialog');
let activeProject = null;
let dialogTrigger = null;
let currentSlide = 0;
let travel = 0;
let horizontal = false;
let scheduled = false;
let galleryFrame = 0;
let galleryTarget = 0;
let galleryPosition = 0;
let galleryTime = 0;
let closingDialog = false;
const motionAnimations = new Set();
const archiveAccordions = new Map();
function animateElement(element, frames, options) {
  if (!motionEnabled()) return null;
  element.getAnimations().forEach(animation => animation.cancel());
  const animation = element.animate(frames, options);
  motionAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => motionAnimations.delete(animation));
  return animation;
}
function t(key) { return window.TRANSLATIONS[lang][key] || key; }
function motionEnabled() { return !paused && !reducedMotion.matches; }
function applyTheme() {
  root.dataset.theme = theme;
  themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
}
function updateCount() {
  const count = document.querySelectorAll('.project-row:not([hidden])').length;
  document.getElementById('filter-status').textContent = lang === 'tr' ? `${count} proje gösteriliyor` : `${count} projects shown`;
}
function applyMotion() {
  root.dataset.motion = motionEnabled() ? 'running' : 'paused';
  motionButton.setAttribute('aria-pressed', String(!motionEnabled()));
  motionButton.setAttribute('aria-label', t(motionEnabled() ? 'motion.pause' : 'motion.play'));
  motionButton.textContent = motionEnabled() ? 'Ⅱ' : '▷';
  motionButton.disabled = reducedMotion.matches;
  if (reducedMotion.matches) motionButton.setAttribute('aria-label', t('motion.system'));
  if (!motionEnabled()) {
    settleAccordions();
    motionAnimations.forEach(animation => animation.cancel());
  }
  configureGallery();
}
function applyLanguage() {
  root.lang = lang;
  document.title = t('meta.title');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(',').forEach(pair => { const [attribute, key] = pair.split(':'); el.setAttribute(attribute, t(key)); });
  });
  ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].forEach(selector => document.querySelector(selector)?.setAttribute('content', t('meta.description')));
  ['meta[property="og:title"]', 'meta[name="twitter:title"]'].forEach(selector => document.querySelector(selector)?.setAttribute('content', t('meta.title')));
  document.querySelector('meta[property="og:locale"]').content = lang === 'tr' ? 'tr_TR' : 'en_US';
  document.querySelector('meta[property="og:locale:alternate"]').content = lang === 'tr' ? 'en_US' : 'tr_TR';
  languageButton.textContent = lang === 'tr' ? 'EN' : 'TR';
  languageButton.setAttribute('aria-label', lang === 'tr' ? 'Switch to English' : 'Türkçeye geç');
  filterProjects(); applyMotion();
  if (activeProject) renderProject(activeProject);
}
languageButton.addEventListener('click', () => { lang = lang === 'tr' ? 'en' : 'tr'; storage.set('lang', lang); applyLanguage(); });
themeButton.addEventListener('click', () => { theme = theme === 'light' ? 'dark' : 'light'; storage.set('theme', theme); applyTheme(); });
motionButton.addEventListener('click', () => { paused = !paused; storage.set('motion', paused ? 'paused' : 'running'); applyMotion(); });
reducedMotion.addEventListener('change', applyMotion);
desktopGallery.addEventListener('change', configureGallery);

/* Native vertical scrolling drives a pinned horizontal track. No wheel interception. */
function configureGallery() {
  horizontal = desktopGallery.matches && motionEnabled();
  showcase.classList.toggle('is-horizontal', horizontal);
  travel = horizontal ? showcase.clientWidth * (slides.length - 1) : 0;
  showcase.style.setProperty('--travel', `${travel}px`);
  if (!horizontal) {
    cancelAnimationFrame(galleryFrame);
    galleryFrame = 0;
    galleryTime = 0;
    track.style.transform = '';
    slides.forEach(slide => slide.removeAttribute('style'));
    slides.forEach(slide => { slide.inert = false; slide.removeAttribute('aria-hidden'); });
  }
  if (horizontal) setSlide(currentSlide);
  scheduleScroll();
}
function setSlide(index) {
  currentSlide = index;
  slideButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  previousButton.disabled = index === 0;
  nextButton.disabled = index === slides.length - 1;
  if (horizontal) slides.forEach((slide, i) => {
    slide.inert = i !== index;
    // Inactive panels remain visible during movement but leave the keyboard/accessibility order.
    if (i !== index) slide.setAttribute('aria-hidden', 'true'); else slide.removeAttribute('aria-hidden');
  });
}
function goToSlide(index) {
  index = Math.max(0, Math.min(slides.length - 1, index));
  if (!horizontal) { slides[index].scrollIntoView({behavior:'auto',block:'start'}); return; }
  const start = showcase.getBoundingClientRect().top + scrollY - header.offsetHeight;
  window.scrollTo({top:start + index * travel / (slides.length - 1), behavior:'smooth'});
}
slideButtons.forEach(button => button.addEventListener('click', () => goToSlide(Number(button.dataset.slide))));
previousButton.addEventListener('click', () => goToSlide(currentSlide - 1));
nextButton.addEventListener('click', () => goToSlide(currentSlide + 1));
function updateScroll() {
  const range = root.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;

  if (horizontal) {
    const start = showcase.getBoundingClientRect().top + scrollY - header.offsetHeight;
    const fraction = Math.max(0,Math.min(1,(scrollY-start)/travel));
    const position = fraction * (slides.length-1);
    const segment = Math.floor(position);
    const phase = position-segment;
    const blend = Math.max(0,Math.min(1,(phase-.12)/.76));
    const eased = blend*blend*(3-2*blend);
    galleryTarget = Math.min(1,(segment+eased)/(slides.length-1));
    // Snap outside the pinned section; ease only while the gallery is on screen.
    if (scrollY < start || scrollY > start + travel) galleryPosition = fraction;
    if (!galleryFrame) galleryFrame = requestAnimationFrame(animateGallery);
  }
  let current = '';
  navLinks.forEach(link => { if (document.querySelector(link.hash).getBoundingClientRect().top <= 200) current = link.hash; });
  navLinks.forEach(link => { if (link.hash === current) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  updateNavIndicator();
  header.classList.toggle('is-scrolled', scrollY > 20);
  scheduled = false;
}
function paintGallery() {
  track.style.transform = `translate3d(${-galleryPosition*travel}px,0,0)`;
  galleryProgress.style.transform = `scaleX(${.25+galleryPosition*.75})`;
  const position = galleryPosition * (slides.length - 1);
  slides.forEach((slide, index) => {
    const distance = Math.max(-1, Math.min(1, index-position));
    const depth = Math.abs(distance);
    // Screen closes into a narrow frame; the next screen opens before its copy settles.
    slide.style.setProperty('--frame-top', `${depth*5}%`);
    slide.style.setProperty('--frame-bottom', `${depth*5}%`);
    slide.style.setProperty('--frame-left', `${Math.max(0,distance)*23}%`);
    slide.style.setProperty('--frame-right', `${Math.max(0,-distance)*23}%`);
    slide.style.setProperty('--frame-shift', `${distance*42}px`);
    slide.style.setProperty('--frame-scale', String(1-depth*.045));
    slide.style.setProperty('--picture-scale', String(1+depth*.12));
    slide.style.setProperty('--text-opacity', String(Math.max(0,1-depth*1.5)));
    slide.style.setProperty('--text-shift', `${distance*38}px`);
  });
  const nextIndex = Math.round(position);
  if (nextIndex !== currentSlide) setSlide(nextIndex);
}
function animateGallery(time) {
  galleryFrame = 0;
  if (!horizontal) return;
  const elapsed = galleryTime ? Math.min(time-galleryTime, 64) : 16;
  galleryTime = time;
  // Frame-rate independent easing: soft follow without changing native scroll behavior.
  galleryPosition += (galleryTarget-galleryPosition) * (1-Math.exp(-elapsed/65));
  if (Math.abs(galleryTarget-galleryPosition) < .00008) galleryPosition = galleryTarget;
  paintGallery();
  if (galleryPosition !== galleryTarget) galleryFrame = requestAnimationFrame(animateGallery);
  else galleryTime = 0;
}
function scheduleScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
window.addEventListener('scroll', scheduleScroll, {passive:true});
window.addEventListener('resize', configureGallery, {passive:true});

/* Full project details, clear external actions, previous/next and focus restoration. */
function renderProject(key) {
  const slide = slides.find(item => item.dataset.project === key);
  const archive = document.getElementById(`project-${key}`);
  document.getElementById('dialog-title').textContent = slide.querySelector('h3').textContent;
  document.getElementById('dialog-category').textContent = t(`category.${key}`);
  document.getElementById('dialog-description').textContent = t(`p.${key}`);
  document.getElementById('dialog-tech').textContent = slide.querySelector('.tech').textContent;
  const visual = slide.querySelector('.project-visual').firstElementChild.cloneNode(true);
  if (visual.tagName === 'IMG') visual.loading = 'eager';
  document.getElementById('dialog-visual').replaceChildren(visual);
  const links = [...archive.querySelectorAll('.project-links a')].map((link,i) => {
    const clone = link.cloneNode(true); clone.className = i === 0 ? 'button primary' : 'button secondary'; return clone;
  });
  document.getElementById('dialog-links').replaceChildren(...links);
  resetZoom();
  const index = slides.indexOf(slide);
  document.getElementById('dialog-count').textContent = `${String(index+1).padStart(2,'0')} / 04`;
  document.getElementById('dialog-prev').disabled = index === 0;
  document.getElementById('dialog-next').disabled = index === slides.length - 1;
}
document.querySelectorAll('[data-open-project]').forEach(button => button.addEventListener('click', () => {
  activeProject = button.dataset.openProject;
  dialogTrigger = button;
  renderProject(activeProject);
  dialog.showModal();
  document.body.classList.add('modal-open');
  animateElement(dialog, [
    {opacity:0, transform:'translateY(18px)'},
    {opacity:1, transform:'translateY(0)'}
  ], {duration:280, easing:'cubic-bezier(.2,.7,.2,1)'});
  animateDialogContent(1);

}));
function animateDialogContent(direction) {
  animateElement(document.getElementById('dialog-visual'), [
    {opacity:0, transform:`translateX(${direction*20}px)`},
    {opacity:1, transform:'translateX(0)'}
  ], {duration:320, easing:'cubic-bezier(.16,1,.3,1)'});
  document.querySelectorAll('.dialog-content> *').forEach((element,index) => {
    animateElement(element, [
      {opacity:0, transform:`translate(${direction*12}px,0px)`},
      {opacity:1, transform:'translate(0,0)'}
    ], {duration:280, delay:index*18, fill:'backwards', easing:'cubic-bezier(.16,1,.3,1)'});
  });
}
function changeDialog(direction) {
  const index = slides.findIndex(slide => slide.dataset.project === activeProject);
  const next = slides[index+direction];
  if (!next) return;
  activeProject = next.dataset.project;
  renderProject(activeProject);
  dialog.scrollTop = 0;
  animateDialogContent(direction);
}
document.getElementById('dialog-prev').addEventListener('click', () => changeDialog(-1));
document.getElementById('dialog-next').addEventListener('click', () => changeDialog(1));
async function closeProject() {
  if (closingDialog || !dialog.open) return;
  closingDialog = true;
  const exit = animateElement(dialog, [{opacity:1, transform:'translateY(0) scale(1)'},{opacity:0, transform:'translateY(10px)'}], {duration:180, easing:'ease-in'});
  if (exit) await exit.finished.catch(() => {});
  if (dialog.open) dialog.close();
  closingDialog = false;
}
dialog.querySelector('.dialog-close').addEventListener('click', closeProject);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeProject();
});
dialog.addEventListener('close', () => {
  motionAnimations.forEach(animation => { if (dialog.contains(animation.effect?.target)) animation.cancel(); });
  document.body.classList.remove('modal-open'); activeProject = null;
  dialogTrigger?.focus({preventScroll:true});
});

/* Animate native details in both directions, retaining keyboard/no-JS behavior. */
function finishAccordion(row, state) {
  state.heightAnimation?.cancel();
  state.contentAnimation?.cancel();
  state.heightAnimation = null;
  state.contentAnimation = null;
  row.open = state.expanded;
  row.style.removeProperty('height');
  row.style.removeProperty('overflow');
  row.removeAttribute('data-animating');
  state.content.inert = !state.expanded;
  scheduleScroll();
}
function settleAccordions() {
  archiveAccordions.forEach((state,row) => {
    if (state.heightAnimation) finishAccordion(row,state);
  });
}
function toggleAccordion(row, state) {
  // Read the displayed geometry before cancellation, so reversal never jumps.
  const startHeight = row.getBoundingClientRect().height;
  const contentStyle = getComputedStyle(state.content);
  const startOpacity = row.open ? contentStyle.opacity : '0';
  const startTransform = row.open ? contentStyle.transform : 'translateY(-6px)';
  state.heightAnimation?.cancel();
  state.contentAnimation?.cancel();
  state.expanded = !state.expanded;
  state.summary.setAttribute('aria-expanded', String(state.expanded));
  row.dataset.expanded = String(state.expanded);
  state.content.inert = !state.expanded;
  if (!motionEnabled() || row.hidden) { finishAccordion(row,state); return; }
  row.open = true;
  row.style.height = 'auto';
  const expandedHeight = row.getBoundingClientRect().height;
  const rowStyle = getComputedStyle(row);
  const closedHeight = state.summary.getBoundingClientRect().height + parseFloat(rowStyle.borderTopWidth) + parseFloat(rowStyle.borderBottomWidth);
  const endHeight = state.expanded ? expandedHeight : closedHeight;
  const duration = Math.max(170, Math.min(420, 220 + Math.abs(endHeight-startHeight)*.8));
  row.style.height = `${startHeight}px`;
  row.style.overflow = 'hidden';
  row.dataset.animating = 'true';
  const heightAnimation = row.animate([{height:`${startHeight}px`},{height:`${endHeight}px`}], {
    duration, easing:'cubic-bezier(.22,.75,.2,1)', fill:'forwards'
  });
  state.heightAnimation = heightAnimation;
  state.contentAnimation = state.content.animate([
    {opacity:startOpacity,transform:startTransform},
    {opacity:state.expanded ? 1 : 0, transform:state.expanded ? 'translateY(0)' : 'translateY(-6px)'}
  ], {duration:state.expanded ? duration*.85 : duration*.65, easing:'ease-out',fill:'forwards'});
  heightAnimation.onfinish = () => {
    if (state.heightAnimation === heightAnimation) finishAccordion(row,state);
  };
}
document.querySelectorAll('.project-row').forEach((row,index) => {
  const summary = row.querySelector('summary');
  const content = row.querySelector('.project-detail');
  content.id = `archive-content-${index}`;
  summary.setAttribute('aria-controls',content.id);
  summary.setAttribute('aria-expanded',String(row.open));
  row.dataset.expanded = String(row.open);
  const state = {summary,content,expanded:row.open,heightAnimation:null,contentAnimation:null};
  content.inert = !row.open;
  archiveAccordions.set(row,state);
  summary.addEventListener('click', event => {
    event.preventDefault();
    toggleAccordion(row,state);
  });
});
window.addEventListener('resize',settleAccordions,{passive:true});

/* Archive filters and section entrances. */
let selectedFilter = 'all';
const projectSearch = document.getElementById('project-search');
function normalizeSearch(value) {
  return value.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
}
function filterProjects() {
  settleAccordions();
  let entranceIndex = 0;
  const terms = normalizeSearch(projectSearch.value).trim().split(/\s+/).filter(Boolean);
  document.querySelectorAll('.project-row').forEach(row => {
    const categoryMatches = selectedFilter === 'all' || row.dataset.category === selectedFilter;
    const searchText = normalizeSearch(row.textContent);
    const wasHidden = row.hidden;
    row.hidden = !categoryMatches || !terms.every(term => searchText.includes(term));
    if (wasHidden && !row.hidden) animateElement(row,
      [{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:280,delay:Math.min(entranceIndex++ * 25,150),fill:'backwards',easing:'ease-out'});
  });
  document.getElementById('search-empty').hidden = !!document.querySelector('.project-row:not([hidden])');
  updateCount(); scheduleScroll();
}
projectSearch.addEventListener('input', filterProjects);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  selectedFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  filterProjects();
}));
document.getElementById('search-reset').addEventListener('click', () => {
  projectSearch.value = ''; selectedFilter = 'all';
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
  filterProjects(); projectSearch.focus();
});
const zoomButton = document.getElementById('project-zoom');
function resetZoom() {
  dialog.classList.remove('is-zoomed');
  zoomButton.setAttribute('aria-pressed','false');
  zoomButton.textContent = t('dialog.zoom');
  zoomButton.hidden = !document.querySelector('#dialog-visual>img');
}
zoomButton.addEventListener('click', () => {
  const zoomed = dialog.classList.toggle('is-zoomed');
  zoomButton.setAttribute('aria-pressed', String(zoomed));
  zoomButton.textContent = t(zoomed ? 'dialog.restore' : 'dialog.zoom');
});
document.getElementById('copy-email').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText('ahmetarincakyildiz@gmail.com');
    status.textContent = t('contact.copied');
  } catch { status.textContent = t('contact.copyFailed'); }
});
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    entry.target.querySelectorAll('h2,.eyebrow').forEach((element,index) => animateElement(element,
      [{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:550,delay:index*70,fill:'backwards',easing:'cubic-bezier(.2,.75,.2,1)'}));
    revealObserver.unobserve(entry.target);
  }
}), {threshold:.08});
document.querySelectorAll('.showcase-heading,.section-heading,.archive-heading,.about-grid>div,.experience-row,.toolbox,.contact-inner').forEach(el => {
  el.classList.add('reveal-ready'); revealObserver.observe(el);
});
// Vertical layouts get substantial but one-time, staggered project entrances.
const projectEntranceObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || horizontal) return;
    const slide = entry.target;
    animateElement(slide.querySelector('.project-visual'), [
      {opacity:0, transform:`translateY(24px)`},
      {opacity:1, transform:'translateY(0)'}
    ], {duration:450, easing:'cubic-bezier(.16,1,.3,1)'});
    slide.querySelectorAll('.project-copy>*').forEach((element,i) => animateElement(element,
      [{opacity:0, transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:350, delay:i*25, fill:'backwards', easing:'cubic-bezier(.16,1,.3,1)'}));
    projectEntranceObserver.unobserve(slide);
  });
}, {threshold:.15});
slides.forEach(slide => projectEntranceObserver.observe(slide));
document.getElementById('year').textContent = new Date().getFullYear();
applyTheme(); applyLanguage(); setSlide(0);
document.fonts.ready.then(() => { configureGallery(); updateNavIndicator(); });
// One-time page entrance, with readable content as the unanimated fallback.
[...document.querySelectorAll('.name-link,.site-header nav a,.controls')].forEach((element,index) => {
  animateElement(element,[{opacity:0,transform:'translateY(-7px)'},{opacity:1,transform:'translateY(0)'}],
    {duration:350,delay:index*35,fill:'backwards',easing:'ease-out'});
});
document.querySelectorAll('.hero-intro,.hero h1>span,.hero-description,.hero-actions,.hero-preview').forEach((element,index) => {
  animateElement(element,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],
    {duration:620,delay:80+index*65,fill:'backwards',easing:'cubic-bezier(.2,.75,.2,1)'});
});
