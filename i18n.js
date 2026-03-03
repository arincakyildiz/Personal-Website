const translations = {
    tr: {
        nav: { logo: 'Portföy', about: 'Hakkımda', cv: 'CV', projects: 'Projeler', contact: 'İletişim' },
        hero: {
            badge: 'Yazılım Mühendisliği Öğrencisi',
            greeting: 'Merhaba, ben',
            name: 'Ahmet Arınç Akyıldız',
            desc: 'Yazılım mühendisliği alanında güvenilir ve sürdürülebilir çözümler üreten bir mühendis olmak için kendimi sürekli geliştiriyorum. İnovatif projelerde yer alıp, topluma fayda sağlayan çözümler geliştirmeyi hedefliyorum.',
            btnCv: 'CV İndir',
            btnProjects: 'Projeleri Gör',
            typingWelcome: 'Kodluyorum. Öğreniyorum.'
        },
        about: {
            title: 'Hakkımda',
            p1: 'Yazılım mühendisliği alanında kendimi sürekli geliştirerek güvenilir ve sürdürülebilir çözümler üreten bir mühendis olmayı hedefliyorum. Yenilikçi ve teknoloji odaklı yazılım projelerinde yer alarak topluma katkı sağlayan çözümler geliştirmek ve teknik ile profesyonel becerilerimi ilerletmek istiyorum.',
            eduLabel: 'Eğitim',
            eduUni: 'Doğu Akdeniz Üniversitesi',
            eduDegree: 'Yazılım Mühendisliği Lisans',
            eduDate: '2022 – Devam Ediyor',
            languagesLabel: 'Diller',
            langEnglish: 'İngilizce – B2 Orta-Üst Seviye',
            skillsLabel: 'Teknik Yetenekler',
            skillProg: 'Programlama Dilleri',
            skillFrontend: 'Frontend',
            skillBackend: 'Backend',
            skillDb: 'Veritabanı',
            skillTools: 'Araçlar'
        },
        cv: {
            title: 'Özgeçmiş',
            desc: "CV'mi indirerek eğitim, deneyim ve becerilerim hakkında detaylı bilgi edinebilirsiniz.",
            btn: 'CV İndir (PDF)',
            file: 'assets/cv_tr.pdf',
            filename: 'Ahmet_Arinc_Akyildiz_CV_TR.pdf'
        },
        projects: {
            title: 'Projelerim',
            proj1: { title: 'Roadnix', comment: '// Trafik eğitim platformu', name: '"Roadnix"', desc: '"Trafik işaretleri, quizler ve dikkat testleri içeren interaktif trafik eğitim platformu. React ve Vite ile geliştirildi."', tech: ['React', 'Vite'], link: 'GitHub\'a Git →', githubUrl: 'https://github.com/arincakyildiz/roadnix', terminal: ['$ npm run build', '✓ Built in 1.2s — 47 modules', '$ vite preview --port 4000'], branch: 'main', lang: 'React' },
            proj2: { title: 'Eventify-TRNC', comment: '// Belediye etkinlik yönetimi', name: '"Eventify-TRNC"', desc: '"Belediyeler için etkinlik oluşturma, yönetim ve bildirim sistemi sunan web platformu."', tech: ['JavaScript', 'Node.js'], link: 'GitHub\'a Git →', githubUrl: 'https://github.com/arincakyildiz/Eventify-TRNC', terminal: ['$ node server.js', '✓ Server listening on :3000', '$ npm test — 12 passed'], branch: 'develop', lang: 'JavaScript' },
            proj3: { title: 'Keyco', comment: '// Oyun kodu & hesap satış platformu', name: '"Keyco"', desc: '"Oyun kodları ve hesap satışları için filtreleme ve güvenli alışveriş süreçleri sunan e-ticaret platformu."', tech: ['JavaScript', 'Node.js'], link: 'GitHub\'a Git →', githubUrl: 'https://github.com/arincakyildiz/keyco', terminal: ['$ npm start', '✓ E-commerce server ready', '$ stripe webhooks listen'], branch: 'main', lang: 'JavaScript' },
            proj4: { title: 'Emu Rebook', comment: '// Kitap takas mobil uygulama', name: '"Emu Rebook"', desc: '"Öğrencilerin kitaplarını takas etmesine olanak tanıyan mobil uygulama. Flutter ile geliştirildi."', tech: ['Flutter', 'Dart'], link: 'GitHub\'a Git →', githubUrl: 'https://github.com/arincakyildiz/emurebook', terminal: ['$ flutter run', '✓ Running on Android SDK', '$ flutter build apk --release'], branch: 'feature/swap', lang: 'Dart' },
            proj5: { title: 'Tarihi Sanayi Köftecisi', comment: '// Restoran tanıtım sitesi', name: '"Tarihi Sanayi Köftecisi"', desc: '"Restoran menüsü ve iletişim bilgilerini sunan responsive tanıtım sitesi. HTML & CSS ile geliştirildi."', tech: ['HTML', 'CSS'], link: 'GitHub\'a Git →', githubUrl: 'https://github.com/arincakyildiz/tarihi-sanayi-koftecisi', terminal: ['$ open index.html', '✓ Site deployed to GitHub Pages', '$ lighthouse --view'], branch: 'main', lang: 'HTML' },
            contactScannerHint: 'Kartları sürükleyin — ortadaki çizgiden geçince iletişim bilgisi görünür'
        },
        contact: {
            title: 'İletişim',
            desc: 'Projeler, iş birlikleri veya merak ettikleriniz için benimle iletişime geçebilirsiniz.'
        },
        footer: '© 2025 — Ahmet Arınç Akyıldız',
            contactComment: '// contact — tıklayarak aç',
            pageTitle: 'Ahmet Arınç Akyıldız — Portföy'
    },
    en: {
        nav: { logo: 'Portfolio', about: 'About', cv: 'CV', projects: 'Projects', contact: 'Contact' },
        hero: {
            badge: 'Software Engineering Student',
            greeting: 'Hi, I\'m',
            name: 'Ahmet Arınç Akyıldız',
            desc: 'I aim to continuously improve myself in software engineering and become an engineer who produces reliable and sustainable solutions. I want to take part in innovative projects and develop impactful solutions for society.',
            btnCv: 'Download CV',
            btnProjects: 'View Projects',
            typingWelcome: 'I code. I learn.'
        },
        about: {
            title: 'About',
            p1: 'I aim to become an engineer who produces reliable and sustainable solutions by continuously developing myself in software engineering. I want to take part in innovative and technology-oriented software projects, develop solutions that contribute to society, and advance my technical and professional skills.',
            eduLabel: 'Education',
            eduUni: 'Eastern Mediterranean University',
            eduDegree: 'Bachelor of Software Engineering',
            eduDate: '2022 – Present',
            languagesLabel: 'Languages',
            langEnglish: 'English – B2 Upper-Intermediate',
            skillsLabel: 'Technical Skills',
            skillProg: 'Programming Languages',
            skillFrontend: 'Frontend',
            skillBackend: 'Backend',
            skillDb: 'Database',
            skillTools: 'Tools'
        },
        cv: {
            title: 'Resume',
            desc: 'Download my CV to learn more about my education, experience, and skills.',
            btn: 'Download CV (PDF)',
            file: 'assets/cv_en.pdf',
            filename: 'Ahmet_Arinc_Akyildiz_CV_EN.pdf'
        },
        projects: {
            title: 'Projects',
            proj1: { title: 'Roadnix', comment: '// Interactive traffic education platform', name: '"Roadnix"', desc: '"A modern traffic education platform including traffic signs, quizzes, and attention tests. Developed using React and Vite."', tech: ['React', 'Vite'], link: 'View on GitHub →', githubUrl: 'https://github.com/arincakyildiz/roadnix', terminal: ['$ npm run build', '✓ Built in 1.2s — 47 modules', '$ vite preview --port 4000'], branch: 'main', lang: 'React' },
            proj2: { title: 'Eventify-TRNC', comment: '// Municipal event management system', name: '"Eventify-TRNC"', desc: '"A web platform that provides event creation, management, and notification systems for municipalities."', tech: ['JavaScript', 'Node.js'], link: 'View on GitHub →', githubUrl: 'https://github.com/arincakyildiz/Eventify-TRNC', terminal: ['$ node server.js', '✓ Server listening on :3000', '$ npm test — 12 passed'], branch: 'develop', lang: 'JavaScript' },
            proj3: { title: 'Keyco', comment: '// Digital game code & account sales platform', name: '"Keyco"', desc: '"An e-commerce platform offering filtering and secure purchasing processes for game codes and account sales."', tech: ['JavaScript', 'Node.js'], link: 'View on GitHub →', githubUrl: 'https://github.com/arincakyildiz/keyco', terminal: ['$ npm start', '✓ E-commerce server ready', '$ stripe webhooks listen'], branch: 'main', lang: 'JavaScript' },
            proj4: { title: 'Emu Rebook', comment: '// Book exchange mobile app', name: '"Emu Rebook"', desc: '"A mobile application that allows students to exchange books. Developed using Flutter."', tech: ['Flutter', 'Dart'], link: 'View on GitHub →', githubUrl: 'https://github.com/arincakyildiz/emurebook', terminal: ['$ flutter run', '✓ Running on Android SDK', '$ flutter build apk --release'], branch: 'feature/swap', lang: 'Dart' },
            proj5: { title: 'Tarihi Sanayi Köftecisi', comment: '// Restaurant promotion website', name: '"Tarihi Sanayi Köftecisi"', desc: '"A responsive promotional website presenting the restaurant menu and contact information. Developed using HTML & CSS."', tech: ['HTML', 'CSS'], link: 'View on GitHub →', githubUrl: 'https://github.com/arincakyildiz/tarihi-sanayi-koftecisi', terminal: ['$ open index.html', '✓ Site deployed to GitHub Pages', '$ lighthouse --view'], branch: 'main', lang: 'HTML' },
            contactScannerHint: 'Drag the cards — contact info appears when they pass the center line'
        },
        contact: {
            title: 'Contact',
            desc: 'Feel free to reach out for projects, collaborations, or any questions.'
        },
        footer: '© 2025 — Ahmet Arınç Akyıldız',
            contactComment: '// contact — click to open',
            pageTitle: 'Ahmet Arınç Akyıldız — Portfolio'
    }
};
