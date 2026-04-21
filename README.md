# Kişisel Web Sitesi — Ahmet Arınç Akyıldız

Yazılım mühendisliği öğrencisi için kişisel portfolio web sitesi.

## Özellikler

- **Hero** – İsim, unvan, CV ve Projeler butonları
- **Hakkımda** – Tanıtım metni ve istatistikler
- **CV İndir** – Türkçe ve İngilizce PDF CV indirme
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
    ├── Ahmet Arınç Akyıldız CV.pdf           (Türkçe CV)
    └── Ahmet Arınç Akyıldız CV English.pdf   (İngilizce CV)
```

## Çalıştırma

```bash
cd personalwebsite
python -m http.server 3000
```

Ardından http://localhost:3000 adresine gidin.

Canlı sitede görmek için:

- Prod: https://www.arincakyildiz.com.tr/

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
