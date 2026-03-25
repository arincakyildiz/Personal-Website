// ========== Tüm etkileşimler DOM hazır olduğunda ve translations yüklüyse çalışır ==========
function init() {
    const html = document.documentElement;

    // ========== THEME (Dark / Light) ==========
    const themeToggle = document.querySelector('.theme-toggle');
    const initTheme = () => {
        const saved = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (systemDark ? 'dark' : 'light');
        html.setAttribute('data-theme', theme);
    };
    themeToggle?.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
    initTheme();

    // ========== LANGUAGE (TR / EN) ==========
    const langOptions = document.querySelectorAll('.lang-option');
    const getNested = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);

    let translationsAppliedBefore = false;
    const applyTranslations = (lang) => {
        if (typeof translations === 'undefined') return;
        const t = translations[lang];
        if (!t) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getNested(t, key);
            if (value !== undefined) el.textContent = value;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = getNested(t, key);
            if (value !== undefined) el.setAttribute('placeholder', value);
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const value = getNested(t, key);
            if (value !== undefined) el.setAttribute('aria-label', value);
        });
        html.lang = lang === 'tr' ? 'tr' : 'en';
        if (t.pageTitle) document.title = t.pageTitle;
        // CV indirme: dile göre doğru dosya (TR: Ahmet Arınç Akyıldız CV.pdf, EN: cv_en.pdf)
        if (t.cv?.file) {
            document.querySelectorAll('.cv-download-link').forEach(link => {
                link.href = t.cv.file;
                link.setAttribute('download', t.cv.filename || 'CV.pdf');
            });
        }
        // Yazma animasyonu: karakter sayısına göre genişlik ve imleç gecikmesi
        const typingEl = document.querySelector('.typing-text');
        const heroTyping = document.querySelector('.hero-typing');
        if (typingEl && heroTyping) {
            const len = typingEl.textContent.length;
            heroTyping.style.setProperty('--typing-len', len);
            heroTyping.style.setProperty('--typing-duration', (0.4 + len * 0.11) + 's');
            heroTyping.style.setProperty('--typing-cursor-delay', (0.4 + len * 0.12) + 's');
            if (translationsAppliedBefore) typingEl.style.width = len + 'ch';
        }
        translationsAppliedBefore = true;
        document.dispatchEvent(new CustomEvent('langchange'));
    };

    langOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            localStorage.setItem('lang', lang);
            langOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyTranslations(lang);
        });
    });

    const initLang = () => {
        const saved = localStorage.getItem('lang') || 'tr';
        langOptions.forEach(b => b.classList.toggle('active', b.dataset.lang === saved));
        applyTranslations(saved);
    };
    initLang();

    const projectBlock = document.querySelector('.project-code-block');
    const viewButtons = document.querySelectorAll('.project-view-btn');
    const projectDrawerToggle = document.getElementById('projectDrawerToggle');
    const editorTabsEl = document.getElementById('editorTabs');
    const editorMainEl = document.getElementById('projectCodePanel');
    const projectSearchInput = document.getElementById('projectSearchInput');
    const projectSearchClear = document.getElementById('projectSearchClear');
    const applyProjectView = (view) => {
        if (!projectBlock) return;
        const nextView = view === 'code' ? 'code' : 'glass';
        projectBlock.classList.toggle('view-code', nextView === 'code');
        projectBlock.classList.toggle('view-glass', nextView === 'glass');
        viewButtons.forEach((btn) => {
            const active = btn.dataset.view === nextView;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        localStorage.setItem('projectView', nextView);
    };

    const initProjectView = () => {
        const saved = localStorage.getItem('projectView') || 'glass';
        applyProjectView(saved);
    };

    viewButtons.forEach((btn) => {
        btn.addEventListener('click', () => applyProjectView(btn.dataset.view));
    });
    initProjectView();

    const isMobileProjects = () => window.matchMedia('(max-width: 768px)').matches;
    const closeProjectDrawer = () => {
        if (!projectBlock) return;
        projectBlock.classList.remove('tabs-open');
        projectDrawerToggle?.setAttribute('aria-expanded', 'false');
    };
    const openProjectDrawer = () => {
        if (!projectBlock) return;
        projectBlock.classList.add('tabs-opening');
        projectBlock.classList.add('tabs-open');
        projectDrawerToggle?.setAttribute('aria-expanded', 'true');
        setTimeout(() => projectBlock.classList.remove('tabs-opening'), 320);
    };
    const syncProjectDrawerMetrics = () => {
        if (!projectBlock || !editorMainEl || !editorTabsEl || !isMobileProjects()) return;
        projectBlock.style.setProperty('--tabs-top', `${editorMainEl.offsetTop}px`);
        projectBlock.style.setProperty('--tabs-height', `calc(100% - ${editorMainEl.offsetTop}px)`);
    };
    const filterProjectTabs = (query) => {
        const q = (query || '').trim().toLowerCase();
        if (projectSearchClear) projectSearchClear.classList.toggle('visible', q.length > 0);
        document.querySelectorAll('.editor-tab').forEach((tab) => {
            const visible = !q || tab.textContent.toLowerCase().includes(q);
            tab.classList.toggle('tab-hidden', !visible);
        });
    };

    projectDrawerToggle?.addEventListener('click', () => {
        if (!isMobileProjects()) return;
        const open = projectBlock?.classList.contains('tabs-open');
        if (open) closeProjectDrawer();
        else {
            syncProjectDrawerMetrics();
            openProjectDrawer();
            projectSearchInput?.focus();
        }
    });
    projectSearchInput?.addEventListener('input', () => {
        filterProjectTabs(projectSearchInput.value);
    });
    projectSearchClear?.addEventListener('click', () => {
        if (!projectSearchInput) return;
        projectSearchInput.value = '';
        filterProjectTabs('');
        projectSearchInput.focus();
    });
    window.addEventListener('resize', () => {
        if (isMobileProjects()) syncProjectDrawerMetrics();
        else closeProjectDrawer();
    });
    document.addEventListener('click', (e) => {
        if (!isMobileProjects() || !projectBlock?.classList.contains('tabs-open')) return;
        const target = e.target;
        if (target instanceof Element && !target.closest('#editorTabs') && !target.closest('#projectDrawerToggle')) {
            closeProjectDrawer();
        }
    });
    syncProjectDrawerMetrics();
    filterProjectTabs('');

    const skillsCard = document.getElementById('skillsCard');
    if (skillsCard) {
        skillsCard.querySelectorAll('.skill-chip').forEach((chip, i) => {
            chip.style.setProperty('--skill-i', String(i));
        });
        const skillsIo = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        skillsCard.classList.add('skills-in-view');
                        obs.unobserve(skillsCard);
                    }
                });
            },
            { root: null, threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
        );
        skillsIo.observe(skillsCard);
    }

    // ========== SMOOTH SCROLL (About, CV, Projects) ==========
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        if (link.id === 'editorLink' || link.id === 'editorDemoLink') return;
        const href = link.getAttribute('href');
        if (href === '#') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                document.querySelector('.nav-links')?.classList.remove('open');
                document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
            });
            return;
        }
        link.addEventListener('click', (e) => {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (href === '#icerik' && typeof target.focus === 'function') {
                    target.focus({ preventScroll: true });
                }
            }
            document.querySelector('.nav-links')?.classList.remove('open');
            document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
        });
    });

    // ========== MOBILE MENU ==========
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle?.addEventListener('click', () => {
        const open = navLinks?.classList.toggle('open');
        menuToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // ========== SCROLL REVEAL ==========
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const revealPoint = window.innerHeight - 150;
        revealElements.forEach((el) => {
            if (el.getBoundingClientRect().top < revealPoint) {
                el.style.transitionDelay = '0s';
                el.classList.add('visible');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // ========== NAVBAR SCROLL ==========
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 30);
    });

    // ========== PROJECT EDITOR TABS ==========
    let currentProjectId = '1';

    function getLineType(html) {
        if (html.includes('class="comment"')) return 'comment';
        if (html.includes('class="keyword"')) return 'keyword';
        if (html.includes('class="string"')) return 'string';
        if (!html || html === '&nbsp;') return 'empty';
        return 'default';
    }

    function renderProject(id, animate) {
        const lang = html.lang === 'tr' ? 'tr' : 'en';
        const t = typeof translations !== 'undefined' ? translations[lang] : null;
        const proj = t?.projects?.['proj' + id];
        if (!proj) return;

        const name = (proj.name || '').replace(/"/g, '');
        const desc = (proj.desc || '').replace(/"/g, '');

        const lines = [
            `<span class="comment">${proj.comment || '// Project'}</span>`,
            ``,
            `<span class="keyword">const</span> project = {`,
            `  name: <span class="string">"${name}"</span>,`,
            `  description: <span class="string">"${desc}"</span>,`,
            `  tech: [${(proj.tech || []).map(t => `<span class="string">"${t}"</span>`).join(', ')}],`,
            `  repo: <span class="string">"github.com/arincakyildiz"</span>`,
            `};`,
            ``,
            `<span class="keyword">export default</span> project;`,
        ];

        const codeEl = document.getElementById('editorCode');
        const lineNumEl = document.getElementById('editorLineNumbers');
        const filenameEl = document.getElementById('editorFilename');
        const linkEl = document.getElementById('editorLink');
        const demoLinkEl = document.getElementById('editorDemoLink');
        const summaryEl = document.getElementById('projectSummary');
        const panelEl = document.getElementById('projectCodePanel');
        const minimapEl = document.getElementById('editorMinimap');
        const terminalEl = document.getElementById('editorTerminal');
        const branchEl = document.getElementById('statusBranch');
        const commitsEl = document.getElementById('statusCommits');
        const langEl = document.getElementById('statusLang');

        if (codeEl) {
            if (animate) codeEl.classList.add('typing');
            codeEl.innerHTML = lines
                .map((l, i) => `<span class="code-line" data-line="${i + 1}">${l || '&nbsp;'}</span>`)
                .join('');

            if (animate) {
                const codeLines = codeEl.querySelectorAll('.code-line');
                codeLines.forEach((el, i) => {
                    setTimeout(() => el.classList.add('typed'), 60 * (i + 1));
                });
                setTimeout(() => codeEl.classList.remove('typing'), 60 * lines.length + 200);
            }

            codeEl.querySelectorAll('.code-line').forEach(el => {
                el.addEventListener('mouseenter', () => el.classList.add('highlight'));
                el.addEventListener('mouseleave', () => el.classList.remove('highlight'));
            });
        }

        if (lineNumEl) {
            lineNumEl.textContent = lines.map((_, i) => i + 1).join('\n');
        }

        if (minimapEl) {
            minimapEl.innerHTML = lines.map(l => {
                const type = getLineType(l);
                return `<div class="minimap-line mm-${type}"></div>`;
            }).join('');
        }

        if (terminalEl && proj.terminal) {
            terminalEl.innerHTML = proj.terminal.map(line => {
                if (line.startsWith('$')) {
                    return `<span class="terminal-line"><span class="term-prompt">$</span>${line.slice(1)}</span>`;
                }
                return `<span class="terminal-line"><span class="term-success">${line}</span></span>`;
            }).join('');

            if (animate) {
                const termLines = terminalEl.querySelectorAll('.terminal-line');
                const codeDelay = 60 * lines.length;
                termLines.forEach((el, i) => {
                    setTimeout(() => el.classList.add('typed'), codeDelay + 150 * (i + 1));
                });
            } else {
                terminalEl.querySelectorAll('.terminal-line').forEach(el => el.classList.add('typed'));
            }
        }

        if (filenameEl) filenameEl.textContent = name.toLowerCase().replace(/\s+/g, '-') + '.js';
        const pt = t?.projects;
        if (summaryEl) summaryEl.textContent = proj.summary || '';

        if (demoLinkEl && pt) {
            const demo = (proj.demoUrl || '').trim();
            if (demo) {
                demoLinkEl.href = demo;
                demoLinkEl.textContent = pt.demoCta || 'Demo';
                demoLinkEl.classList.remove('is-hidden');
                demoLinkEl.removeAttribute('aria-hidden');
            } else {
                demoLinkEl.removeAttribute('href');
                demoLinkEl.textContent = '';
                demoLinkEl.classList.add('is-hidden');
                demoLinkEl.setAttribute('aria-hidden', 'true');
            }
        }
        if (linkEl && pt) {
            linkEl.textContent = pt.sourceCta || 'GitHub';
            linkEl.href = proj.githubUrl || 'https://github.com/arincakyildiz';
        }
        if (panelEl) panelEl.setAttribute('aria-labelledby', 'tab-project-' + id);
        if (branchEl) branchEl.textContent = proj.branch || 'main';
        if (commitsEl) commitsEl.textContent = Math.floor(Math.random() * 5 + 1) + ' commits ahead';
        if (langEl) langEl.textContent = proj.lang || 'JavaScript';
    }

    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.editor-tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            currentProjectId = tab.dataset.project;
            renderProject(currentProjectId, true);
            closeProjectDrawer();
        });
    });

    renderProject(currentProjectId, false);

    document.addEventListener('langchange', () => {
        renderProject(currentProjectId, false);
        const lang = html.lang === 'tr' ? 'tr' : 'en';
        const t = typeof translations !== 'undefined' ? translations[lang] : null;
        document.querySelectorAll('.editor-tab').forEach(tab => {
            const proj = t?.projects?.['proj' + tab.dataset.project];
            if (proj?.title) tab.textContent = proj.title;
        });
        syncProjectDrawerMetrics();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
