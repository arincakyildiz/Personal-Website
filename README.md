# Ahmet Arınç Akyıldız — Personal portfolio

A responsive TR/EN portfolio built with HTML, CSS and JavaScript. No build step or external JavaScript dependencies.

## Preview

Run `python -m http.server 3000 --bind 127.0.0.1`, then open http://127.0.0.1:3000.

## Design and interactions

- Name-based navigation and locally hosted Manrope typography; no custom monogram
- Desktop project showcase: native downward scrolling moves four project panels horizontally with staged image reveals, subtle image depth and sequenced copy, plus steady reading intervals
- Direct project selection and previous/next navigation
- Vertical project layout on mobile, short screens and when motion is disabled
- Project detail dialogs with screenshots, descriptions, technologies and external links; short opening/closing transitions and directional project changes
- Native Escape/focus handling, persistent language/theme/motion preferences
- Searchable archive with combined text/category filters and empty-state reset
- Animated archive disclosures with reversible height transitions and keyboard/reduced-motion support
- Enlarged project screenshots, email clipboard action with success/failure feedback
- Experience, education and current CV downloads

## Files

- `index.html`: page content and metadata
- `styles.css`: themes, responsive layouts and showcase styles
- `script.js`: scroll mapping, dialogs, preferences and archive filters
- `i18n.js`: Turkish and English copy
- `assets/projects/`: real website screenshots; see `SOURCES.md`
- `assets/fonts/`: self-hosted Manrope fonts and `OFL.txt` license
- `assets/cv-tr.pdf`, `assets/cv-en.pdf`: current CVs

`.codex-preview/` contains local preview scripts and QA artifacts and is excluded from version control. Deploy the static files using the existing hosting setup.

## License

MIT for the website — see LICENSE. Manrope uses the SIL Open Font License included with the font files.




