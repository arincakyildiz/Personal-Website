'use strict';

const storage={
  get(key){try{return localStorage.getItem(key)}catch{return null}},
  set(key,value){try{localStorage.setItem(key,value)}catch{}}
};

const root=document.documentElement;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let lang=storage.get('lang')==='en'?'en':'tr';
let theme=storage.get('theme')==='dark'?'dark':'light';
let paused=storage.get('motion')==='paused';
let activeCase=null;
let caseTrigger=null;

const languageButton=document.getElementById('language');
const themeButton=document.getElementById('theme');
const motionButton=document.getElementById('motion');
const themeValue=document.getElementById('theme-value');
const motionValue=document.getElementById('motion-value');
const settingsToggle=document.getElementById('settings-toggle');
const settingsPanel=document.getElementById('settings-panel');
const header=document.querySelector('.site-header');
const progress=document.querySelector('.scroll-line span');
const navLinks=[...document.querySelectorAll('.site-header nav a')];
const dialog=document.getElementById('case-dialog');
const caseOrder=['kanyolda','sinaru','perfiai','keyco'];

const CASE_STUDIES={
  kanyolda:{
    title:'KanYolda',image:'assets/projects/kanyolda.jpg',alt:{tr:'KanYolda web ve mobil ürün ekranı',en:'KanYolda web and mobile product screen'},
    category:{tr:'Mobil ürün · Web platformu',en:'Mobile product · Web platform'},
    summary:{tr:'Kan ihtiyacı olanları uygun donörlerle konum, kan grubu ve aciliyet üzerinden buluşturan uçtan uca ürün.',en:'An end-to-end product matching urgent blood needs with suitable donors by location, blood type and priority.'},
    facts:{tr:[['Rol','Ürün ve yazılım geliştirme'],['Yıl','2026'],['Platform','Mobil + Web'],['Altyapı','Next.js · React Native · Firebase']],en:[['Role','Product and software development'],['Year','2026'],['Platform','Mobile + Web'],['Stack','Next.js · React Native · Firebase']]},
    problem:{tr:'Acil kan ihtiyacında ilanların dağınık kanallarda paylaşılması, uygun donöre ulaşmayı yavaşlatıyor. Kullanıcının hem yakınındaki ihtiyacı görmesi hem de güvenli biçimde iletişim kurabilmesi gerekiyordu.',en:'During urgent blood needs, requests are spread across disconnected channels. The product needed to help people find nearby requests and communicate safely.'},
    approach:{tr:'İlan, eşleştirme, konum, bildirim ve sohbet akışlarını tek ürün modeli altında topladım. Mobil deneyimi donörün hızlı aksiyon almasına; web ve yönetim tarafını ise ilanların doğrulanması ve yönetilmesine göre kurguladım.',en:'I brought requests, matching, location, notifications and chat into one product model. Mobile supports fast donor action, while web and admin flows focus on request verification and management.'},
    result:{tr:'Şehir ve kan grubuna göre otomatik eşleştirme yapan, acil bildirim gönderen, harita ve sohbet özellikleri bulunan mobil/web platformu ortaya çıktı.',en:'The result is a mobile and web platform with city and blood-type matching, urgent notifications, map features and chat.'},
    decisions:{tr:['Mobil ve web istemcilerinde ortak Firebase veri modeli','Acil ilanlar için kan grubu ve konum temelli eşleştirme','Bildirim, sohbet ve harita akışlarının aynı kullanıcı yolculuğunda birleşmesi','Yönetim panelinde ilan ve kullanıcı denetimi'],en:['Shared Firebase data model across mobile and web','Blood-type and location matching for urgent requests','Notifications, chat and map within one user journey','Request and user moderation in the admin panel']},
    links:[{type:'live',href:'https://www.kanyolda.com.tr/'}]
  },
  sinaru:{
    title:'Sinaru',image:'assets/projects/sinaru.jpg',alt:{tr:'Sinaru çevrimdışı bilgi asistanı ekranı',en:'Sinaru offline knowledge assistant screen'},
    category:{tr:'Yerel yapay zekâ · RAG',en:'Local artificial intelligence · RAG'},
    summary:{tr:'Belgeleri cihaz üzerinde indeksleyen, semantik olarak arayan ve cevabı kullandığı kaynaklarla birlikte veren çevrimdışı asistan.',en:'An offline assistant that indexes documents on-device, searches them semantically and returns answers with the sources it used.'},
    facts:{tr:[['Rol','Mimari, backend ve arayüz'],['Yıl','2026'],['Çalışma','%100 yerel'],['Altyapı','Node.js · Foundry Local · SQLite']],en:[['Role','Architecture, backend and interface'],['Year','2026'],['Runtime','100% local'],['Stack','Node.js · Foundry Local · SQLite']]},
    problem:{tr:'Hassas veya kurumsal belgeler bulut tabanlı yapay zekâ servislerine gönderilmeden aranmalı ve soru-cevap için kullanılmalıydı. Üretilen cevabın hangi metne dayandığı da görünür olmalıydı.',en:'Sensitive documents needed to be searched and queried without sending them to cloud AI services. The source text behind every generated answer also had to stay visible.'},
    approach:{tr:'Belgeleri parçalayıp yerel embedding modeliyle 1024 boyutlu vektörlere dönüştürdüm. Vektörleri SQLite içinde saklayıp kosinüs benzerliğiyle aradım; en ilgili parçaları yerel dil modeline bağlam olarak verip cevabı SSE ile akıttım.',en:'I chunked documents, converted them into 1024-dimensional vectors with a local embedding model, stored them in SQLite, searched by cosine similarity and streamed grounded answers over SSE.'},
    result:{tr:'Doküman yükleme, sohbet geçmişi, kaynak kartları, istatistikler, komut paleti ve TR/EN desteği olan, internet olmadan çalışan bir RAG ürünü oluştu.',en:'The result is an offline RAG product with document upload, conversation history, source cards, analytics, a command palette and TR/EN support.'},
    decisions:{tr:['Foundry Local ile cihaz üstünde model çalıştırma','Embedding vektörlerini aynı SQLite tablosunda BLOB olarak saklama','Kaynak parçasını ve güven skorunu cevap yanında gösterme','Yanıtı SSE ile gerçek zamanlı aktarma','Ağ veya model gerektirmeyen kapsamlı test seti'],en:['On-device inference with Foundry Local','Embedding vectors stored as BLOBs in SQLite','Source chunks and relevance scores shown beside answers','Real-time response streaming over SSE','Comprehensive tests that require no network or model']},
    links:[{type:'code',href:'https://github.com/arincakyildiz/RAG-Application-with-Foundry-Local'}]
  },
  perfiai:{
    title:'PerfiAI',image:'assets/projects/perfiai.png',alt:{tr:'PerfiAI marka görseli',en:'PerfiAI brand visual'},
    category:{tr:'Anlamsal arama · Öneri sistemi',en:'Semantic search · Recommendation system'},
    summary:{tr:'Kullanıcının doğal dille tarif ettiği kokuyu 3.592 parfümlük katalogda anlamsal benzerlik üzerinden arayan öneri sistemi.',en:'A recommendation system that searches a 3,592-fragrance catalogue through semantic similarity to a natural-language description.'},
    facts:{tr:[['Rol','Full-stack ve AI entegrasyonu'],['Yıl','2026'],['Katalog','3.592 parfüm'],['Altyapı','Next.js · FastAPI · SentenceTransformers']],en:[['Role','Full-stack and AI integration'],['Year','2026'],['Catalogue','3,592 fragrances'],['Stack','Next.js · FastAPI · SentenceTransformers']]},
    problem:{tr:'Parfüm filtreleri genellikle marka, fiyat veya nota göre çalışıyor. Kullanıcı ise çoğu zaman “odunsu, sıcak ve geceye uygun” gibi doğal bir tarifle arama yapıyor.',en:'Fragrance filters usually operate by brand, price or notes, while users often search with descriptions such as “woody, warm and suitable for evenings”.'},
    approach:{tr:'Parfümlerin nota piramitlerini ve açıklamalarını ortak bir metin temsiline dönüştürüp embedding ürettim. Kullanıcı sorgusunu aynı uzaya taşıyarak benzerlik puanı, eşleşme gerekçesi ve alternatif sonuçlar oluşturdum.',en:'I converted fragrance note pyramids and descriptions into a shared text representation, generated embeddings and mapped each query into the same space to produce scored matches and explanations.'},
    result:{tr:'Doğal dil araması, iki öneri modu, açıklanabilir eşleşme, üyelik, favori, puan ve yorum akışlarını birleştiren parfüm keşif ürünü ortaya çıktı.',en:'The result combines natural-language search, two recommendation modes, explainable matches, accounts, favourites, ratings and reviews.'},
    decisions:{tr:['3.592 ürünlük katalog için önceden hesaplanan embeddingler','Hızlı sezgisel arama ve daha derin anlamsal arama seçenekleri','Sonuç puanının yanında eşleşme gerekçesi gösterimi','Web uygulaması ile Python öneri servisinin ayrılması'],en:['Precomputed embeddings for a 3,592-item catalogue','Fast heuristic and deeper semantic search modes','Explanations shown beside similarity scores','Separation of the web application and Python recommendation service']},
    links:[{type:'profile',href:'https://github.com/arincakyildiz'}]
  },
  keyco:{
    title:'Keyco',image:'assets/projects/keyco.jpg',alt:{tr:'Keyco e-ticaret ürün ekranı',en:'Keyco e-commerce product screen'},
    category:{tr:'E-ticaret · Web uygulaması',en:'E-commerce · Web application'},
    summary:{tr:'Oyun kodları ve dijital ürünler için keşif, kategori, hesap ve satın alma akışlarını bir araya getiren e-ticaret uygulaması.',en:'An e-commerce application bringing together discovery, category, account and purchase flows for game keys and digital products.'},
    facts:{tr:[['Rol','Full-stack geliştirme'],['Yıl','2025'],['Platform','Web'],['Altyapı','React · Node.js · Firebase']],en:[['Role','Full-stack development'],['Year','2025'],['Platform','Web'],['Stack','React · Node.js · Firebase']]},
    problem:{tr:'Farklı oyun platformlarındaki dijital ürünlerin hızlı bulunması, kategori ve platforma göre filtrelenmesi ve güvenli bir satın alma akışına taşınması gerekiyordu.',en:'Digital products across gaming platforms needed to be easy to discover, filter by category and platform, and move through a clear purchase flow.'},
    approach:{tr:'Kataloğu platform ve kategori etrafında düzenledim; arama, filtreleme, üyelik ve ödeme adımlarını tek kullanıcı yolculuğu içinde kurdum. Yönetim tarafında ürün ve sipariş verileri için ayrı akışlar tasarladım.',en:'I structured the catalogue around platforms and categories, then connected search, filtering, accounts and payment into one user journey, with separate product and order management flows.'},
    result:{tr:'Dijital ürün keşfi, hesap yönetimi ve ödeme entegrasyonlarını destekleyen, iki dilli ve farklı ekranlara uyumlu bir mağaza deneyimi oluştu.',en:'The result is a responsive, bilingual store experience supporting digital product discovery, account management and payment integrations.'},
    decisions:{tr:['Platform ve kategori bazlı ürün taksonomisi','Arama ve filtre durumunun tek ürün listesinde birleşmesi','Üyelik ve sipariş akışlarında Firebase kullanımı','TR/EN dil ve tema tercihinin kalıcı saklanması'],en:['Platform and category-based product taxonomy','Search and filter state combined in one catalogue','Firebase for account and order flows','Persistent TR/EN language and theme preferences']},
    links:[{type:'live',href:'https://keyco.vercel.app'},{type:'code',href:'https://github.com/arincakyildiz/keyco'}]
  }
};

function t(key){return window.TRANSLATIONS[lang]?.[key]??key}
function motionEnabled(){return !paused&&!reducedMotion.matches}

function applyLanguage(){
  root.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(element=>{element.textContent=t(element.dataset.i18n)});
  document.querySelectorAll('[data-i18n-html]').forEach(element=>{element.innerHTML=t(element.dataset.i18nHtml)});
  document.querySelectorAll('[data-i18n-attr]').forEach(element=>{
    element.dataset.i18nAttr.split(',').forEach(pair=>{const [attribute,key]=pair.split(':');element.setAttribute(attribute,t(key))});
  });
  languageButton.textContent=lang==='tr'?'EN':'TR';
  languageButton.setAttribute('aria-label',lang==='tr'?'Switch to English':'Türkçeye geç');
  document.getElementById('hero-cv-link').href=lang==='tr'?'assets/cv-tr.pdf':'assets/cv-en.pdf';
  document.title=lang==='tr'?'Ahmet Arınç Akyıldız — Yazılım Mühendisi':'Ahmet Arınç Akyıldız — Software Engineer';
  updateSettingsLabels();
  if(activeCase)renderCase(activeCase);
}

function updateSettingsLabels(){
  themeValue.textContent=t(theme==='dark'?'settings.dark':'settings.light');
  motionValue.textContent=t(motionEnabled()?'settings.on':'settings.off');
}

function applyTheme(){
  root.dataset.theme=theme;
  document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#171815':'#f3f0e8';
  updateSettingsLabels();
}

function applyMotion(){
  root.dataset.motion=motionEnabled()?'running':'paused';
  motionButton.disabled=reducedMotion.matches;
  updateSettingsLabels();
  if(!motionEnabled())document.querySelectorAll('.reveal').forEach(element=>element.classList.add('is-visible'));
}

languageButton.addEventListener('click',()=>{lang=lang==='tr'?'en':'tr';storage.set('lang',lang);applyLanguage()});
themeButton.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';storage.set('theme',theme);applyTheme()});
motionButton.addEventListener('click',()=>{paused=!paused;storage.set('motion',paused?'paused':'running');applyMotion()});
reducedMotion.addEventListener('change',applyMotion);

function closeSettings(){settingsPanel.hidden=true;settingsToggle.setAttribute('aria-expanded','false')}
settingsToggle.addEventListener('click',event=>{
  event.stopPropagation();
  settingsPanel.hidden=!settingsPanel.hidden;
  settingsToggle.setAttribute('aria-expanded',String(!settingsPanel.hidden));
});
settingsPanel.addEventListener('click',event=>event.stopPropagation());
document.addEventListener('click',closeSettings);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!settingsPanel.hidden)closeSettings()});

let scrollScheduled=false;
function updateScroll(){
  const range=root.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${range>0?scrollY/range:0})`;
  header.classList.toggle('is-scrolled',scrollY>14);
  let current='';
  navLinks.forEach(link=>{const section=document.querySelector(link.hash);if(section&&section.getBoundingClientRect().top<innerHeight*.34)current=link.hash});
  navLinks.forEach(link=>link.toggleAttribute('aria-current',link.hash===current));
  scrollScheduled=false;
}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  entry.target.classList.add('is-visible');
  revealObserver.unobserve(entry.target);
}),{threshold:.1,rootMargin:'0px 0px -5%'});
document.querySelectorAll('.section-intro,.project-copy,.project-media,.index-list,.index-preview,.about-statement,.about-detail,.experience-list article,.toolkit,.contact-grid>div').forEach((element,index)=>{
  element.classList.add('reveal');
  element.style.transitionDelay=`${Math.min(index%3,2)*55}ms`;
  revealObserver.observe(element);
});

const previewFrame=document.querySelector('.preview-frame');
const previewImage=document.getElementById('archive-preview-image');
const previewKind=document.getElementById('archive-preview-kind');
let previewTimer=0;
document.querySelectorAll('.index-row').forEach(row=>{
  row.addEventListener('pointerenter',()=>{
    clearTimeout(previewTimer);
    previewFrame.classList.add('is-changing');
    const next=row.dataset.preview;
    previewTimer=setTimeout(()=>{
      previewFrame.dataset.title=row.querySelector('strong').textContent;
      previewFrame.classList.toggle('no-image',!next);
      if(next)previewImage.src=next;
      previewKind.textContent=row.dataset.kind||'';
      previewFrame.classList.remove('is-changing');
    },150);
  });
});

function linkLabel(type){return type==='live'?t('project.live'):type==='code'?t('project.code'):t('project.profile')}
function renderCase(key){
  const data=CASE_STUDIES[key];
  const index=caseOrder.indexOf(key);
  document.getElementById('case-counter').textContent=`${String(index+1).padStart(2,'0')} / 04`;
  document.getElementById('case-category').textContent=data.category[lang];
  document.getElementById('case-title').textContent=data.title;
  document.getElementById('case-summary').textContent=data.summary[lang];
  const image=document.getElementById('case-image');
  image.src=data.image;image.alt=data.alt[lang];
  document.getElementById('case-facts').replaceChildren(...data.facts[lang].map(([label,value])=>{
    const item=document.createElement('div');
    const term=document.createElement('dt');term.textContent=label;
    const detail=document.createElement('dd');detail.textContent=value;
    item.append(term,detail);return item;
  }));
  document.getElementById('case-problem').textContent=data.problem[lang];
  document.getElementById('case-approach').textContent=data.approach[lang];
  document.getElementById('case-result').textContent=data.result[lang];
  document.getElementById('case-decisions').replaceChildren(...data.decisions[lang].map(text=>{const item=document.createElement('li');item.textContent=text;return item}));
  document.getElementById('case-actions').replaceChildren(...data.links.map((link,linkIndex)=>{
    const anchor=document.createElement('a');
    anchor.className=`action-link${linkIndex===0?' action-link-solid':''}`;
    anchor.href=link.href;anchor.target='_blank';anchor.rel='noopener';
    const label=document.createElement('span');label.textContent=linkLabel(link.type);
    const arrow=document.createElement('span');arrow.className='arrow';arrow.setAttribute('aria-hidden','true');
    anchor.append(label,arrow);return anchor;
  }));
  document.getElementById('case-prev').disabled=index===0;
  document.getElementById('case-next').disabled=index===caseOrder.length-1;
}

function openCase(key,trigger){
  activeCase=key;caseTrigger=trigger;renderCase(key);
  dialog.classList.remove('is-closing');dialog.classList.add('is-opening');
  dialog.showModal();document.body.classList.add('dialog-open');dialog.scrollTop=0;
  setTimeout(()=>dialog.classList.remove('is-opening'),600);
}

async function closeCase(){
  if(!dialog.open)return;
  if(motionEnabled()){
    dialog.classList.add('is-closing');
    await new Promise(resolve=>setTimeout(resolve,280));
  }
  dialog.close();dialog.classList.remove('is-closing');document.body.classList.remove('dialog-open');
  const trigger=caseTrigger;activeCase=null;caseTrigger=null;trigger?.focus({preventScroll:true});
}

document.querySelectorAll('[data-open-project]').forEach(trigger=>trigger.addEventListener('click',()=>openCase(trigger.dataset.openProject,trigger)));
dialog.querySelector('.case-close').addEventListener('click',closeCase);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeCase()});
document.getElementById('case-prev').addEventListener('click',()=>{
  const next=caseOrder[caseOrder.indexOf(activeCase)-1];if(next){activeCase=next;renderCase(next);dialog.scrollTo({top:0,behavior:motionEnabled()?'smooth':'auto'})}
});
document.getElementById('case-next').addEventListener('click',()=>{
  const next=caseOrder[caseOrder.indexOf(activeCase)+1];if(next){activeCase=next;renderCase(next);dialog.scrollTo({top:0,behavior:motionEnabled()?'smooth':'auto'})}
});

const copyStatus=document.getElementById('copy-status');
document.getElementById('copy-email').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText('ahmetarincakyildiz@gmail.com');copyStatus.textContent=t('contact.copied')}
  catch{copyStatus.textContent=t('contact.copyFailed')}
});

document.getElementById('year').textContent=new Date().getFullYear();
applyTheme();applyLanguage();applyMotion();updateScroll();

if(motionEnabled()){
  const intro=[...document.querySelectorAll('.status-line,.hero h1,.hero-description,.hero-actions,.hero-note,.hero-collage')];
  intro.forEach((element,index)=>element.animate([
    {opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}
  ],{duration:760,delay:80+index*75,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
}
