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
    themeToggle?.addEventListener('click', (e) => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';

        if (document.startViewTransition) {
            const x = e.clientX ?? window.innerWidth / 2;
            const y = e.clientY ?? window.innerHeight / 2;
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const transition = document.startViewTransition(() => {
                html.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
            });

            transition.ready.then(() => {
                document.documentElement.animate(
                    [
                        { clipPath: `circle(0px at ${x}px ${y}px)` },
                        { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
                    ],
                    {
                        duration: 550,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            });
        } else {
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        }
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
    const drawerHintKey = 'projectDrawerHintSeen';
    const closeProjectDrawer = () => {
        if (!projectBlock) return;
        projectBlock.classList.remove('tabs-open');
        projectDrawerToggle?.setAttribute('aria-expanded', 'false');
    };
    const openProjectDrawer = () => {
        if (!projectBlock) return;
        projectBlock.classList.add('tabs-opening');
        projectBlock.classList.add('tabs-open');
        projectBlock.classList.remove('drawer-hint-active');
        projectDrawerToggle?.setAttribute('aria-expanded', 'true');
        localStorage.setItem(drawerHintKey, '1');
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
    if (isMobileProjects() && !localStorage.getItem(drawerHintKey)) {
        projectBlock?.classList.add('drawer-hint-active');
    }

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

        const shortDesc = desc.length > 52 ? desc.slice(0, 52) + '…"' : desc + '"';
        const lines = [
            `<span class="comment">${proj.comment || '// Project'}</span>`,
            ``,
            `<span class="keyword">const</span> project = {`,
            `  name: <span class="string">"${name}"</span>,`,
            `  desc: <span class="string">"${shortDesc}</span>,`,
            `  tech: [${(proj.tech || []).map(t => `<span class="string">"${t}"</span>`).join(', ')}],`,
            `  repo: <span class="string">"github.com/arincakyildiz"</span>,`,
            `  status: <span class="string">"${proj.branch || 'main'}"</span>`,
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
        renderMonthLabels(cachedContribWeeks);
        updateContribTotal();

        // Update tooltips dynamically on language change
        if (cachedContribWeeks) {
            const boxes = document.querySelectorAll('#contribGrid .contrib-box');
            let idx = 0;
            cachedContribWeeks.forEach(week => {
                week.forEach(day => {
                    const dayEl = boxes[idx++];
                    if (dayEl) {
                        const count = day.contributionCount;
                        const dateStr = day.date;
                        dayEl.title = html.lang === 'en'
                            ? `${count} contribution${count === 1 ? '' : 's'} on ${dateStr}`
                            : `${dateStr} tarihinde ${count} katkı`;
                    }
                });
            });
        }
    });

    // ========== CONTRIBUTION HEATMAP ==========
    let totalContribs = 0;
    let cachedContribWeeks = null;

    function updateContribTotal() {
        const totalEl = document.getElementById('contribTotal');
        if (!totalEl) return;
        const lang = html.lang === 'tr' ? 'tr' : 'en';
        const t = typeof translations !== 'undefined' ? translations[lang] : null;
        const tpl = t?.about?.contribTotal || '';
        totalEl.textContent = tpl.replace('{n}', totalContribs);
    }

    const CONTRIB_WEEKS = 52;
    const CONTRIB_CELL  = 14; // 11px box + 3px gap

    function renderMonthLabels(weeksData) {
        const monthsEl = document.getElementById('contribMonths');
        if (!monthsEl) return;

        const lang = html.lang === 'tr' ? 'tr' : 'en';
        const namesEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const namesTr = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
        const names = lang === 'en' ? namesEn : namesTr;

        monthsEl.innerHTML = '';
        let prevMonth = -1;

        if (weeksData && Array.isArray(weeksData)) {
            weeksData.forEach((week, w) => {
                const firstDay = week.find(d => d.date);
                if (!firstDay) return;
                const d = new Date(firstDay.date);
                const m = d.getMonth();
                if (m !== prevMonth) {
                    prevMonth = m;
                    const lbl = document.createElement('span');
                    lbl.className = 'contrib-month-label';
                    lbl.textContent = names[m];
                    lbl.style.left = w * CONTRIB_CELL + 'px';
                    monthsEl.appendChild(lbl);
                }
            });
        } else {
            // Fallback: LCG logic
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() - CONTRIB_WEEKS * 7 + 1);
            start.setDate(start.getDate() - start.getDay()); // align to Sunday

            for (let w = 0; w < CONTRIB_WEEKS; w++) {
                const d = new Date(start);
                d.setDate(start.getDate() + w * 7);
                const m = d.getMonth();
                if (m !== prevMonth) {
                    prevMonth = m;
                    const lbl = document.createElement('span');
                    lbl.className = 'contrib-month-label';
                    lbl.textContent = names[m];
                    lbl.style.left = w * CONTRIB_CELL + 'px';
                    monthsEl.appendChild(lbl);
                }
            }
        }
    }

    async function generateContribGrid() {
        const grid = document.getElementById('contribGrid');
        if (!grid) return;

        try {
            // Try to fetch real data from community proxy API
            const res = await fetch('https://github-contributions-api.deno.dev/arincakyildiz.json');
            if (!res.ok) throw new Error('API request failed');
            const data = await res.json();
            if (!data || !Array.isArray(data.contributions)) throw new Error('Invalid data format');

            // Cache data for language change rendering
            cachedContribWeeks = data.contributions;

            totalContribs = 0;
            grid.innerHTML = '';

            cachedContribWeeks.forEach(week => {
                const weekEl = document.createElement('div');
                weekEl.className = 'contrib-week';

                week.forEach(day => {
                    const dayEl = document.createElement('span');
                    let level = 0;
                    switch (day.contributionLevel) {
                        case 'FIRST_QUARTILE': level = 1; break;
                        case 'SECOND_QUARTILE': level = 2; break;
                        case 'THIRD_QUARTILE': level = 3; break;
                        case 'FOURTH_QUARTILE': level = 4; break;
                        default: level = 0;
                    }

                    dayEl.className = `contrib-box level-${level}`;
                    dayEl.setAttribute('aria-hidden', 'true');

                    const count = day.contributionCount;
                    const dateStr = day.date;
                    const tooltipText = html.lang === 'en' 
                        ? `${count} contribution${count === 1 ? '' : 's'} on ${dateStr}`
                        : `${dateStr} tarihinde ${count} katkı`;
                    dayEl.title = tooltipText;

                    totalContribs += count;
                    weekEl.appendChild(dayEl);
                });

                grid.appendChild(weekEl);
            });

            renderMonthLabels(cachedContribWeeks);
            updateContribTotal();

        } catch (error) {
            console.warn('Failed to fetch GitHub contributions, falling back to LCG:', error);
            cachedContribWeeks = null;
            generateFallbackContribGrid();
        }
    }

    function generateFallbackContribGrid() {
        const grid = document.getElementById('contribGrid');
        if (!grid) return;

        // Deterministic LCG pseudo-random for consistent display
        let seed = 20240315;
        const rand = () => {
            seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
            return seed / 0x7fffffff;
        };

        totalContribs = 0;
        grid.innerHTML = '';

        for (let w = 0; w < CONTRIB_WEEKS; w++) {
            const weekEl = document.createElement('div');
            weekEl.className = 'contrib-week';
            const recencyBoost = (w / CONTRIB_WEEKS) * 0.25;

            for (let d = 0; d < 7; d++) {
                const dayEl = document.createElement('span');
                const isWeekend = d === 0 || d === 6;
                const activeProb = (isWeekend ? 0.32 : 0.62) + recencyBoost;
                const r = rand();
                let level = 0;

                if (r < activeProb) {
                    const intensity = rand();
                    if (intensity < 0.12) level = 4;
                    else if (intensity < 0.3) level = 3;
                    else if (intensity < 0.6) level = 2;
                    else level = 1;
                }

                dayEl.className = `contrib-box level-${level}`;
                dayEl.setAttribute('aria-hidden', 'true');
                if (level > 0) totalContribs += level;
                weekEl.appendChild(dayEl);
            }

            grid.appendChild(weekEl);
        }

        renderMonthLabels(null);
        updateContribTotal();
    }

    generateContribGrid();

    // ========== TYPEWRITER ==========
    (function initTypewriter() {
        const el     = document.querySelector('.typing-text');
        const cursor = document.querySelector('.typing-cursor');
        if (!el) return;

        const phrasesTr = [
            'Kodluyorum. Öğreniyorum.',
            'Tasarlıyorum. İnşa ediyorum.',
            'Sorunları çözüyorum.',
            'Her gün daha iyiye.'
        ];
        const phrasesEn = [
            'I code. I learn.',
            'I design. I build.',
            'I solve problems.',
            'Getting better every day.'
        ];

        let phraseIdx = 0;
        let charIdx   = 0;
        let deleting  = false;
        let timer     = null;

        const getLang    = () => html.lang === 'en' ? 'en' : 'tr';
        const getPhrases = () => getLang() === 'en' ? phrasesEn : phrasesTr;

        function tick() {
            const phrases = getPhrases();
            const phrase  = phrases[phraseIdx % phrases.length];

            charIdx = deleting
                ? Math.max(0, charIdx - 1)
                : Math.min(phrase.length, charIdx + 1);

            el.textContent = phrase.substring(0, charIdx);

            let delay = deleting ? 42 : 82;

            if (!deleting && charIdx === phrase.length) {
                delay    = 2000;
                deleting = true;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                phraseIdx++;
                delay = 380;
            }

            timer = setTimeout(tick, delay);
        }

        // Start after a short delay so loader doesn't mask the animation
        timer = setTimeout(tick, 700);

        document.addEventListener('langchange', () => {
            clearTimeout(timer);
            el.textContent = '';
            charIdx  = 0;
            deleting = false;
            phraseIdx = 0;
            timer = setTimeout(tick, 200);
        });
    })();

    // ========== CARD GLOW & 3D TILT EFFECT ==========
    document.querySelectorAll('.card-glow').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', `-999px`);
            card.style.setProperty('--mouse-y', `-999px`);
        });
    });

    const add3DTilt = (selector) => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mousemove', e => {
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const xc = rect.width / 2;
                const yc = rect.height / 2;

                const angleX = -(y - yc) / yc * 8;
                const angleY = (x - xc) / xc * 8;

                el.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-5px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    };
    add3DTilt('.tilt-3d');

    // ========== MAGNETIC BUTTONS ==========
    const makeMagnetic = (selector) => {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('mousemove', e => {
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - (rect.width / 2);
                const y = e.clientY - rect.top - (rect.height / 2);
                btn.style.transition = 'none';
                btn.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
                btn.style.transform = 'translate3d(0, 0, 0)';
            });
        });
    };
    makeMagnetic('.hero-buttons .btn');

    // ========== INTERACTIVE MOCK TERMINAL ANIMATION ==========
    let termAnimationTimeout = null;
    const runTerminalAnimation = (lines) => {
        const terminalEl = document.getElementById('editorTerminal');
        if (!terminalEl) return;

        // Clear existing timeouts
        if (termAnimationTimeout) clearTimeout(termAnimationTimeout);
        terminalEl.innerHTML = '';

        let lineIdx = 0;
        const printNextLine = () => {
            if (lineIdx >= lines.length) return;
            const line = lines[lineIdx];
            
            const lineEl = document.createElement('span');
            lineEl.className = 'terminal-line';
            
            if (line.startsWith('$')) {
                lineEl.innerHTML = `<span class="term-prompt">$</span>`;
                terminalEl.appendChild(lineEl);
                
                const cmdText = line.slice(1);
                let charIdx = 0;
                const typeChar = () => {
                    if (charIdx < cmdText.length) {
                        lineEl.innerHTML += cmdText[charIdx++];
                        termAnimationTimeout = setTimeout(typeChar, 35);
                    } else {
                        lineEl.classList.add('typed');
                        lineIdx++;
                        termAnimationTimeout = setTimeout(printNextLine, 200);
                    }
                };
                typeChar();
            } else {
                lineEl.innerHTML = `<span class="term-success">${line}</span>`;
                terminalEl.appendChild(lineEl);
                setTimeout(() => lineEl.classList.add('typed'), 40);
                lineIdx++;
                termAnimationTimeout = setTimeout(printNextLine, 150);
            }
        };
        printNextLine();
    };

    // Attach click listeners to terminal quick-run buttons
    document.getElementById('btnTerminalRun')?.addEventListener('click', () => {
        const lang = html.lang === 'tr' ? 'tr' : 'en';
        const t = typeof translations !== 'undefined' ? translations[lang] : null;
        const proj = t?.projects?.['proj' + currentProjectId];
        if (proj?.terminal) {
            runTerminalAnimation(proj.terminal);
        }
    });

    document.getElementById('btnTerminalTest')?.addEventListener('click', () => {
        const isTr = html.lang === 'tr';
        const testLines = isTr 
            ? [
                '$ npm run test',
                '🔍 Test dosyaları taranıyor...',
                'RUNS  src/index.test.js',
                '✓  src/index.test.js — 12 test başarıyla tamamlandı (0.84s)',
                'PASS  Tüm testler başarıyla koşuldu!'
              ]
            : [
                '$ npm run test',
                '🔍 Searching for test suites...',
                'RUNS  src/index.test.js',
                '✓  src/index.test.js — 12 tests passed successfully (0.84s)',
                'PASS  All test suites passed!'
              ];
        runTerminalAnimation(testLines);
    });

    document.getElementById('btnTerminalBuild')?.addEventListener('click', () => {
        const isTr = html.lang === 'tr';
        const buildLines = isTr
            ? [
                '$ npm run build',
                '📦 Paketleyici başlatılıyor (Vite)...',
                '✓ Dosyalar optimize ediliyor...',
                '✓ Build başarıyla tamamlandı! (dist/ klasörü hazır - 1.25s)'
              ]
            : [
                '$ npm run build',
                '📦 Initializing bundler (Vite)...',
                '✓ Optimizing build assets...',
                '✓ Production build generated successfully! (dist/ folder ready - 1.25s)'
              ];
        runTerminalAnimation(buildLines);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
