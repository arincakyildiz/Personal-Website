# Kişisel Web Sitesi — Ahmet Arınç Akyıldız

Yazılım mühendisliği öğrencisi için kişisel portfolio web sitesi.

## Özellikler

- **Hero** – İsim, unvan, CV ve Projeler butonları
- **Hakkımda** – Tanıtım metni ve istatistikler
- **CV İndir** – DOCX formatında CV indirme
- **Projeler** – Etkileşimli kod formatında proje listesi (sekmelerle geçiş)
- **Dark / Light mod** – Tema değiştirici
- **TR / EN** – Dil desteği

## Dosya Yapısı

```
personalwebsite/
├── index.html
├── styles.css
├── script.js
├── i18n.js
└── assets/
    ├── cv_tr.pdf   (Türkçe CV)
    └── cv_en.pdf   (İngilizce CV)
```

## Çalıştırma

```bash
cd personalwebsite
python -m http.server 3000
```

Ardından http://localhost:3000 adresine gidin.
