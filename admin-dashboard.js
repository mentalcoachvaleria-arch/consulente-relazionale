/**
 * Admin Dashboard - Valeria Mental Coach
 * Gestione configurazione sito via Firebase Firestore
 * 
 * @requires firebase-config.js (auth, db, ADMIN_EMAILS)
 */

import { 
  auth, signOut, db, doc, getDoc, setDoc, 
  onAuthStateChanged, ADMIN_EMAILS 
} from './firebase-config.js';

// ===== DOM ELEMENTS =====
const loading = document.getElementById('loading');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const mobileToggle = document.getElementById('mobileToggle');
const logoutBtn = document.getElementById('logoutBtn');
const saveStatus = document.getElementById('saveStatus');
const saveAllBtn = document.getElementById('saveAllBtn');

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Color pickers - configurazione mappata agli ID HTML reali
const colorConfig = [
  { key: 'primary', htmlId: 'colorPrimary', textId: 'colorPrimaryText', previewId: 'previewPrimary' },
  { key: 'hover', htmlId: 'colorHover', textId: 'colorHoverText', previewId: 'previewHover' },
  { key: 'secondary', htmlId: 'colorSecondary', textId: 'colorSecondaryText', previewId: 'previewSecondary' },
  { key: 'bg', htmlId: 'colorBg', textId: 'colorBgText', previewId: 'previewBg' },
  { key: 'text', htmlId: 'colorText', textId: 'colorTextText', previewId: 'previewText' },
  { key: 'navbarBg', htmlId: 'navbarBg', textId: 'navbarBgText', previewId: 'previewNavbarBg' },
  { key: 'navbarText', htmlId: 'navbarText', textId: 'navbarTextText', previewId: 'previewNavbarText' },
  { key: 'footerBg', htmlId: 'footerBg', textId: 'footerBgText', previewId: 'previewFooterBg' },
  { key: 'footerText', htmlId: 'footerText', textId: 'footerTextText', previewId: 'previewFooterText' }
];

// Quiz builder
const profileTabs = document.querySelectorAll('.profile-tab');
const profileContents = document.querySelectorAll('.profile-content');

// Review form elements
const reviewStars = document.querySelectorAll('#reviewStars i');
const reviewFormTitle = document.getElementById('reviewFormTitle');
const reviewNameInput = document.getElementById('reviewName');
const reviewDateInput = document.getElementById('reviewDate');
const reviewTextInput = document.getElementById('reviewText');
const reviewEditIndexInput = document.getElementById('reviewEditIndex');

// ===== STATE =====
let hasChanges = false;
let configData = {};
let reviewsData = [];
let selectedRating = 0;

// Default configuration structure
const defaultConfig = {
  general: {
    quizTitle: 'Scopri il tuo schema relazionale',
    pixelId: '',
    maintenanceMode: false
  },
  media: {
    carousel: ['https://example.com/fatto1.png', 'https://example.com/fatto2.png', 'https://example.com/fatto3.png'],
    studioImage: 'https://example.com/3-fatto.png',
    certifications: ['https://example.com/certificato1.jpg']
  },
  colors: {
    primary: '#591c2f', hover: '#451624', secondary: '#7FC8C8',
    bg: '#edddc8', text: '#2D2D2D',
    navbarBg: '#1c1c1c', navbarText: '#ffffff',
    footerBg: '#141414', footerText: '#a3a3a3'
  },
  quiz: {
    title: 'Test del Pattern Relazionale',
    questions: [{
      id: Date.now(),
      text: 'Quando ricevi un messaggio dalla persona che stai frequentando:',
      answers: [
        { text: 'Rispondo quasi subito, non vedo l\'ora di sentire la sua voce', profile: 'A' },
        { text: 'Controllo ma aspetto un po\' prima di rispondere', profile: 'B' }
      ]
    }],
    profiles: {
      A: { title: 'L\'Anima Generosa (Il "Sempre Disponibile")', description: 'Ti prendi cura degli altri con una naturalezza disarmante. La tua generosità è un dono prezioso, ma ricorda: per amare davvero gli altri, devi prima imparare ad amare te stesso.' },
      B: { title: 'Il Custode Silenzioso', description: 'Proteggi le tue emozioni come un tesoro prezioso. La tua forza sta nella riservatezza e nella capacità di osservazione.' },
      C: { title: 'Il Cercatore di Connessione', description: 'Desideri profondamente legami autentici e significativi. La tua sensibilità ti permette di creare connessioni intense.' },
      D: { title: 'L\'Indipendente Strategico', description: 'Valuti la tua autonomia e libertà sopra ogni cosa. La tua forza è l\'indipendenza.' }
    }
  },
  contact: {
    sidebarTitle: 'Il cambiamento inizia con una parola.',
    sidebarList: 'Ascolto attivo\nRiservatezza\nApproccio personalizzato\nSpazio non giudicante',
    fields: [
      { id: 'challenge', type: 'textarea', label: 'Qual è la sfida più grande che stai affrontando nelle relazioni? *', placeholder: 'Descrivi brevemente la tua situazione...', options: null, scaleMin: null, scaleMax: null },
      { id: 'readiness', type: 'scale', label: 'Quanto ti senti pronto/a a lavorare su te stesso/a? (1-10) *', placeholder: '', options: null, scaleMin: 'Per niente', scaleMax: 'Completamente' }
    ],
    successMessage: 'Grazie! Ti ricontatterò entro 24 ore. Nel frattempo, respira. 🌿'
  },
  social: {
    instagram: '', tiktok: '', youtube: '', telegram: '',
    whatsapp: 'https://wa.me/393458407102',
    email: 'mentalcoachvaleria@gmail.com',
    phone: '+39 345 840 7102',
    address: 'Valle Lomellina, Pavia (PV), Italia'
  },
  reviews: {
    list: [
      { name: 'Webnix It', rating: 5, date: '4 mesi fa', text: 'Un percorso trasformativo. Valeria ha una capacità unica di guidare con empatia e precisione.' },
      { name: 'Marika Tasca', rating: 4, date: '2 mesi fa', text: 'Finalmente ho capito i miei schemi relazionali. Consiglio vivamente!' }
    ]
  },
  meta: { updatedAt: null, updatedBy: null, version: '1.0' }
};

// Color presets for quick theming
const colorPresets = {
  original: { primary:'#591c2f', hover:'#451624', secondary:'#7FC8C8', bg:'#edddc8', text:'#2D2D2D', navbarBg:'#1c1c1c', navbarText:'#ffffff', footerBg:'#141414', footerText:'#a3a3a3' },
  ocean: { primary:'#0ea5e9', hover:'#0284c7', secondary:'#22d3ee', bg:'#f0f9ff', text:'#0c4a6e', navbarBg:'#0c4a6e', navbarText:'#ffffff', footerBg:'#082f49', footerText:'#bae6fd' },
  forest: { primary:'#166534', hover:'#14532d', secondary:'#84cc16', bg:'#f0fdf4', text:'#14532d', navbarBg:'#14532d', navbarText:'#ffffff', footerBg:'#052e16', footerText:'#86efac' },
  sunset: { primary:'#ea580c', hover:'#c2410c', secondary:'#fbbf24', bg:'#fffbeb', text:'#78350f', navbarBg:'#78350f', navbarText:'#ffffff', footerBg:'#451a03', footerText:'#fcd34d' },
  elegant: { primary:'#6d28d9', hover:'#5b21b6', secondary:'#a78bfa', bg:'#faf5ff', text:'#4c1d95', navbarBg:'#4c1d95', navbarText:'#ffffff', footerBg:'#2e1065', footerText:'#c4b5fd' },
  dark: { primary:'#3f3f46', hover:'#27272a', secondary:'#a1a1aa', bg:'#09090b', text:'#f4f4f5', navbarBg:'#18181b', navbarText:'#f4f4f5', footerBg:'#09090b', footerText:'#a1a1aa' },
  minimal: { primary:'#18181b', hover:'#09090b', secondary:'#71717a', bg:'#ffffff', text:'#18181b', navbarBg:'#ffffff', navbarText:'#18181b', footerBg:'#f4f4f5', footerText:'#52525b' },
  rose: { primary:'#be185d', hover:'#9d174d', secondary:'#f9a8d4', bg:'#fdf2f8', text:'#831843', navbarBg:'#831843', navbarText:'#ffffff', footerBg:'#500724', footerText:'#fbcfe8' }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  setupAuth();
  setupEventListeners();
  setupColorPickers();
  setupReviewStars();
});

// ===== AUTHENTICATION =====
function setupAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      window.location.href = 'admin-login.html';
      return;
    }
    if (loading) loading.classList.add('hidden');
    await loadConfig();
    populateAllForms();
    renderReviewsList();
    updateLivePreview();
  });
}

// ===== FIREBASE OPERATIONS =====
async function loadConfig() {
  try {
    const docRef = doc(db, 'config', 'site_config');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      configData = deepMerge(defaultConfig, docSnap.data());
    } else {
      configData = structuredClone(defaultConfig);
      await saveConfigToFirebase();
    }
    reviewsData = configData.reviews?.list || [];
  } catch (error) {
    console.error('❌ Errore caricamento configurazione:', error);
    configData = structuredClone(defaultConfig);
    reviewsData = [];
  }
}

async function saveConfigToFirebase() {
  try {
    configData.meta.updatedAt = new Date().toISOString();
    configData.meta.updatedBy = auth.currentUser?.email || 'unknown';
    await setDoc(doc(db, 'config', 'site_config'), configData);
    return true;
  } catch (error) {
    console.error('❌ Errore salvataggio configurazione:', error);
    throw error;
  }
}

// Deep merge utility for config objects
function deepMerge(target, source) {
  const output = { ...target };
  if (target && source && typeof target === 'object' && typeof source === 'object' && !Array.isArray(target) && !Array.isArray(source)) {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

// ===== UI EVENT LISTENERS =====
function setupEventListeners() {
  // Mobile sidebar toggle
  mobileToggle?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', toggleSidebar);
  
  // Tab navigation
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  // Profile tabs in Quiz section
  profileTabs.forEach(tab => {
    tab.addEventListener('click', () => switchProfile(tab.dataset.profile));
  });
  
  // Preset color buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
  
  // Reset colors button
  document.querySelector('[onclick="resetColors()"]')?.addEventListener('click', resetColors);
  
  // Toggle switches
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      this.classList.toggle('active');
      const label = this.closest('.toggle-wrapper')?.querySelector('.toggle-label');
      if (label) label.textContent = this.classList.contains('active') ? 'Attivata' : 'Disattivata';
      markUnsaved();
    });
  });
  
  // Modals triggers
  document.getElementById('btnHelp')?.addEventListener('click', () => openModal('modalHelp'));
  document.getElementById('btnPreviewQuiz')?.addEventListener('click', () => openModal('modalQuizPreview'));
  document.getElementById('btnPreviewForm')?.addEventListener('click', () => openModal('modalFormPreview'));
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay')?.classList.remove('active'));
  });
  
  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlayEl => {
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) overlayEl.classList.remove('active');
    });
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
  });
  
  // Save buttons
  saveAllBtn?.addEventListener('click', saveAll);
  
  // Logout
  logoutBtn?.addEventListener('click', handleLogout);
  
  // Global form change detection
  document.addEventListener('input', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      markUnsaved();
    }
  });
  
  // Prevent close with unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

function toggleSidebar() {
  sidebar?.classList.toggle('active');
  overlay?.classList.toggle('active');
}

function switchTab(tabId) {
  navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  tabContents.forEach(tab => {
    tab.classList.toggle('hidden', tab.id !== `tab-${tabId}`);
    if (!tab.classList.contains('hidden')) tab.classList.add('animate-fade');
  });
  if (window.innerWidth < 768) {
    sidebar?.classList.remove('active');
    overlay?.classList.remove('active');
  }
  markUnsaved();
}

function switchProfile(profileId) {
  profileTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.profile === profileId));
  profileContents.forEach(content => {
    content.classList.toggle('active', content.id === `profile-${profileId}`);
    content.classList.toggle('hidden', content.id !== `profile-${profileId}`);
  });
}

// ===== COLOR PICKERS & PRESETS =====
function setupColorPickers() {
  colorConfig.forEach(cfg => {
    const colorInput = document.getElementById(cfg.htmlId);
    const textInput = document.getElementById(cfg.textId);
    const preview = document.getElementById(cfg.previewId);
    
    if (!colorInput || !textInput) return;
    
    const sync = (value) => {
      textInput.value = value;
      if (preview) preview.style.background = value;
      updateLivePreview();
    };
    
    colorInput.addEventListener('input', (e) => { sync(e.target.value); markUnsaved(); });
    textInput.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorInput.value = e.target.value;
        if (preview) preview.style.background = e.target.value;
      }
      markUnsaved();
    });
  });
}

function applyPreset(presetName) {
  const colors = colorPresets[presetName];
  if (!colors) return;
  
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === presetName);
  });
  
  colorConfig.forEach(cfg => {
    const value = colors[cfg.key];
    if (!value) return;
    const colorInput = document.getElementById(cfg.htmlId);
    const textInput = document.getElementById(cfg.textId);
    const preview = document.getElementById(cfg.previewId);
    if (colorInput) colorInput.value = value;
    if (textInput) textInput.value = value;
    if (preview) preview.style.background = value;
  });
  
  updateLivePreview();
  markUnsaved();
}

function resetColors() {
  applyPreset('original');
  markUnsaved();
}

function updateLivePreview() {
  const preview = document.getElementById('livePreview');
  if (!preview) return;
  
  const primary = document.getElementById('colorPrimaryText')?.value || '#591c2f';
  const bg = document.getElementById('colorBgText')?.value || '#edddc8';
  const text = document.getElementById('colorTextText')?.value || '#2D2D2D';
  
  preview.style.background = bg;
  preview.style.color = text;
  
  const previewTitle = preview.querySelector('#previewTitle');
  const previewBtn = preview.querySelector('#previewBtn');
  if (previewTitle) previewTitle.style.color = primary;
  if (previewBtn) previewBtn.style.background = primary;
}

// ===== REVIEW STARS =====
function setupReviewStars() {
  reviewStars.forEach(star => {
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.dataset.value);
      updateStarsDisplay();
    });
    star.addEventListener('mouseenter', function() {
      const val = parseInt(this.dataset.value);
      reviewStars.forEach((s, i) => s.classList.toggle('filled', i < val));
    });
    star.addEventListener('mouseleave', updateStarsDisplay);
  });
}

function updateStarsDisplay() {
  reviewStars.forEach((star, i) => {
    star.classList.toggle('filled', i < selectedRating);
    star.className = `fa-${i < selectedRating ? 'solid' : 'regular'} fa-star`;
  });
}

// ===== FORM POPULATION =====
function populateAllForms() {
  // General
  if (configData.general) {
    setValue('quizTitle', configData.general.quizTitle);
    setValue('pixelId', configData.general.pixelId);
    setToggle('maintenanceToggle', configData.general.maintenanceMode);
  }
  
  // Media
  renderCarouselList(configData.media?.carousel || []);
  setValue('studioImage', configData.media?.studioImage);
  renderCertList(configData.media?.certifications || []);
  
  // Colors
  if (configData.colors) {
    colorConfig.forEach(cfg => {
      const value = configData.colors[cfg.key];
      if (value) {
        const colorInput = document.getElementById(cfg.htmlId);
        const textInput = document.getElementById(cfg.textId);
        const preview = document.getElementById(cfg.previewId);
        if (colorInput) colorInput.value = value;
        if (textInput) textInput.value = value;
        if (preview) preview.style.background = value;
      }
    });
  }
  
  // Quiz
  if (configData.quiz) {
    setValue('quizMainTitle', configData.quiz.title);
    renderQuestionsList(configData.quiz.questions || []);
    
    ['A','B','C','D'].forEach(profile => {
      const data = configData.quiz.profiles?.[profile];
      if (data) {
        const container = document.getElementById(`profile-${profile}`);
        if (container) {
          const titleEl = container.querySelector('.profile-title');
          const descEl = container.querySelector('.profile-desc');
          if (titleEl) titleEl.value = data.title || '';
          if (descEl) descEl.value = data.description || '';
        }
      }
    });
  }
  
  // Contact
  if (configData.contact) {
    setValue('sidebarTitle', configData.contact.sidebarTitle);
    setValue('sidebarList', configData.contact.sidebarList);
    renderFormFieldsList(configData.contact.fields || []);
    setValue('formSuccessMsg', configData.contact.successMessage);
  }
  
  // Social
  if (configData.social) {
    setValue('instagram', configData.social.instagram);
    setValue('tiktok', configData.social.tiktok);
    setValue('youtube', configData.social.youtube);
    setValue('telegram', configData.social.telegram);
    setValue('whatsapp', configData.social.whatsapp);
    setValue('contactEmail', configData.social.email);
    setValue('contactPhone', configData.social.phone);
    setValue('contactAddress', configData.social.address);
  }
  
  // Reviews
  reviewsData = configData.reviews?.list || [];
  renderReviewsList();
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? '';
}

function setToggle(id, isActive) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle('active', !!isActive);
    const label = el.closest('.toggle-wrapper')?.querySelector('.toggle-label');
    if (label) label.textContent = isActive ? 'Attivata' : 'Disattivata';
  }
}

// ===== DYNAMIC LISTS RENDERERS =====
function renderCarouselList(items) {
  const container = document.getElementById('carouselList');
  if (!container) return;
  container.innerHTML = '';
  items.forEach(url => {
    const div = document.createElement('div');
    div.className = 'input-with-btn mb-2';
    div.innerHTML = `<input type="url" class="carousel-url" placeholder="https://..." value="${escapeHtml(url)}"><button class="btn btn-sm btn-outline" onclick="window.removeCarouselItem(this)"><i class="fa-solid fa-trash"></i></button>`;
    container.appendChild(div);
  });
}

function renderCertList(items) {
  const container = document.getElementById('certList');
  if (!container) return;
  container.innerHTML = '';
  items.forEach(url => {
    const div = document.createElement('div');
    div.className = 'input-with-btn mb-2';
    div.innerHTML = `<input type="url" class="cert-url" placeholder="https://..." value="${escapeHtml(url)}"><button class="btn btn-sm btn-outline" onclick="window.removeCertItem(this)"><i class="fa-solid fa-trash"></i></button>`;
    container.appendChild(div);
  });
}

function renderQuestionsList(questions) {
  const container = document.getElementById('questionsList');
  if (!container) return;
  container.innerHTML = '';
  
  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-card';
    div.innerHTML = `
      <div class="question-header">
        <span class="question-title">Domanda ${index + 1}</span>
        <button class="btn-delete" onclick="window.removeQuestion(this)"><i class="fa-solid fa-trash"></i> Elimina</button>
      </div>
      <div class="form-group mb-4">
        <label>Testo Domanda</label>
        <input type="text" class="question-text" value="${escapeHtml(q.text)}">
      </div>
      <label class="text-sm font-semibold mb-2">Opzioni di Risposta</label>
      <div class="answers-container">
        ${q.answers.map(a => `
          <div class="answer-row">
            <input type="text" class="answer-input" value="${escapeHtml(a.text)}">
            <select class="answer-select">
              ${['A','B','C','D'].map(p => `<option value="${p}" ${a.profile===p?'selected':''}>Profilo ${p}</option>`).join('')}
            </select>
            <button class="btn-delete" onclick="window.removeAnswer(this)"><i class="fa-solid fa-minus"></i></button>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-sm btn-outline mt-2" onclick="window.addAnswer(this)"><i class="fa-solid fa-plus"></i> Aggiungi Opzione</button>
    `;
    container.appendChild(div);
  });
}

function renderFormFieldsList(fields) {
  const container = document.getElementById('formFieldsList');
  if (!container) return;
  container.innerHTML = '';
  
  fields.forEach(field => {
    const div = document.createElement('div');
    div.className = 'formfield-card';
    div.innerHTML = `
      <div class="question-header">
        <span class="question-title">Campo: ${escapeHtml(field.label)}</span>
        <button class="btn-delete" onclick="window.removeFormField(this)"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>ID Campo (EmailJS)</label><input type="text" class="field-id" value="${field.id}"></div>
        <div class="form-group"><label>Tipo di Input</label><select class="field-type" onchange="window.toggleFieldOptions(this)"><option value="textarea" ${field.type==='textarea'?'selected':''}>Area di Testo</option><option value="radio" ${field.type==='radio'?'selected':''}>Scelta Singola</option><option value="scale" ${field.type==='scale'?'selected':''}>Scala 1-10</option></select></div>
      </div>
      <div class="form-group mt-2"><label>Testo della Domanda *</label><input type="text" class="field-label" value="${escapeHtml(field.label)}"></div>
      <div class="form-group"><label>Placeholder</label><input type="text" class="field-placeholder" value="${field.placeholder||''}"></div>
      ${field.type === 'scale' ? `<div class="form-grid mt-2"><div class="form-group"><label>Etichetta Min (1)</label><input type="text" class="scale-min" value="${field.scaleMin||''}"></div><div class="form-group"><label>Etichetta Max (10)</label><input type="text" class="scale-max" value="${field.scaleMax||''}"></div></div>` : ''}
    `;
    container.appendChild(div);
  });
}

function renderReviewsList() {
  const container = document.getElementById('reviewsList');
  if (!container) return;
  container.innerHTML = '';
  
  reviewsData.forEach((review, index) => {
    const starsHtml = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const div = document.createElement('div');
    div.className = 'review-card';
    div.innerHTML = `
      <div class="question-header">
        <div><span class="font-semibold">${escapeHtml(review.name)}</span><div class="stars">${starsHtml}</div></div>
        <div class="flex gap-2"><button class="btn-icon" onclick="window.openReviewForm(${index})" title="Modifica"><i class="fa-solid fa-pen"></i></button><button class="btn-delete" onclick="window.deleteReview(${index})" title="Elimina"><i class="fa-solid fa-trash"></i></button></div>
      </div>
      <p class="text-sm text-muted mb-2">${escapeHtml(review.date)}</p>
      <p class="text-secondary">"${escapeHtml(review.text)}"</p>
    `;
    container.appendChild(div);
  });
}

// ===== SAVE FUNCTIONS =====
function collectFormData(sectionId) {
  const data = {};
  
  switch(sectionId) {
    case 'general':
      data.general = {
        quizTitle: getValue('quizTitle'),
        pixelId: getValue('pixelId'),
        maintenanceMode: document.getElementById('maintenanceToggle')?.classList.contains('active') || false
      };
      break;
      
    case 'media':
      data.media = {
        carousel: Array.from(document.querySelectorAll('.carousel-url')).map(i => i.value).filter(v => v),
        studioImage: getValue('studioImage'),
        certifications: Array.from(document.querySelectorAll('.cert-url')).map(i => i.value).filter(v => v)
      };
      break;
      
    case 'colors':
      data.colors = {};
      colorConfig.forEach(cfg => {
        const textInput = document.getElementById(cfg.textId);
        if (textInput) data.colors[cfg.key] = textInput.value;
      });
      break;
      
    case 'quiz':
      data.quiz = {
        title: getValue('quizMainTitle'),
        questions: Array.from(document.querySelectorAll('.question-card')).map(card => ({
          id: Date.now() + Math.random(),
          text: card.querySelector('.question-text')?.value || '',
          answers: Array.from(card.querySelectorAll('.answer-row')).map(row => ({
            text: row.querySelector('.answer-input')?.value || '',
            profile: row.querySelector('.answer-select')?.value || 'A'
          }))
        })),
        profiles: {}
      };
      ['A','B','C','D'].forEach(p => {
        const container = document.getElementById(`profile-${p}`);
        if (container) {
          data.quiz.profiles[p] = {
            title: container.querySelector('.profile-title')?.value || '',
            description: container.querySelector('.profile-desc')?.value || ''
          };
        }
      });
      break;
      
    case 'contact':
      data.contact = {
        sidebarTitle: getValue('sidebarTitle'),
        sidebarList: getValue('sidebarList'),
        fields: Array.from(document.querySelectorAll('.formfield-card')).map(card => ({
          id: card.querySelector('.field-id')?.value || '',
          type: card.querySelector('.field-type')?.value || 'textarea',
          label: card.querySelector('.field-label')?.value || '',
          placeholder: card.querySelector('.field-placeholder')?.value || '',
          scaleMin: card.querySelector('.scale-min')?.value || null,
          scaleMax: card.querySelector('.scale-max')?.value || null
        })),
        successMessage: getValue('formSuccessMsg')
      };
      break;
      
    case 'social':
      data.social = {
        instagram: getValue('instagram'),
        tiktok: getValue('tiktok'),
        youtube: getValue('youtube'),
        telegram: getValue('telegram'),
        whatsapp: getValue('whatsapp'),
        email: getValue('contactEmail'),
        phone: getValue('contactPhone'),
        address: getValue('contactAddress')
      };
      break;
      
    case 'reviews':
      data.reviews = { list: reviewsData };
      break;
  }
  
  return data;
}

function getValue(id) {
  return document.getElementById(id)?.value || '';
}

async function saveSection(sectionId) {
  const btn = event?.currentTarget;
  const originalHtml = btn?.innerHTML;
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvataggio...';
  }
  
  try {
    const sectionData = collectFormData(sectionId);
    configData = deepMerge(configData, sectionData);
    await saveConfigToFirebase();
    
    if (sectionId === 'reviews') {
      reviewsData = configData.reviews?.list || [];
      renderReviewsList();
    }
    
    markSaved();
  } catch (error) {
    console.error(`Errore salvataggio sezione ${sectionId}:`, error);
    alert('⚠️ Errore durante il salvataggio. Riprova.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

async function saveAll() {
  saveStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvataggio in corso...';
  
  try {
    ['general','media','colors','quiz','contact','social','reviews'].forEach(section => {
      const sectionData = collectFormData(section);
      configData = deepMerge(configData, sectionData);
    });
    configData.reviews = { list: reviewsData };
    await saveConfigToFirebase();
    markSaved();
  } catch (error) {
    console.error('Errore salvataggio completo:', error);
    alert('⚠️ Errore durante il salvataggio. Riprova.');
  }
}

// ===== SAVE STATUS =====
function markUnsaved() {
  hasChanges = true;
  if (saveStatus) {
    saveStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Modifiche non salvate';
    saveStatus.className = 'save-status unsaved';
  }
}

function markSaved() {
  hasChanges = false;
  if (saveStatus) {
    saveStatus.innerHTML = '<i class="fa-solid fa-check"></i> Modifiche salvate!';
    saveStatus.className = 'save-status saved';
    setTimeout(() => {
      saveStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Nessuna modifica in sospeso';
      saveStatus.className = 'save-status';
    }, 3000);
  }
}

// ===== LOGOUT =====
async function handleLogout() {
  if (confirm('Vuoi davvero uscire dalla dashboard?')) {
    try {
      await signOut(auth);
      localStorage.removeItem('adminUser');
      window.location.href = 'admin-login.html';
    } catch (error) {
      console.error('Errore logout:', error);
    }
  }
}

// ===== MODALS =====
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

// ===== REVIEW FORM =====
window.openReviewForm = function(index = -1) {
  if (index >= 0 && reviewsData[index]) {
    reviewFormTitle.textContent = 'Modifica Recensione';
    reviewNameInput.value = reviewsData[index].name;
    reviewDateInput.value = reviewsData[index].date;
    reviewTextInput.value = reviewsData[index].text;
    selectedRating = reviewsData[index].rating;
    reviewEditIndexInput.value = index;
  } else {
    reviewFormTitle.textContent = 'Nuova Recensione';
    reviewNameInput.value = '';
    reviewDateInput.value = '';
    reviewTextInput.value = '';
    selectedRating = 0;
    reviewEditIndexInput.value = '-1';
  }
  updateStarsDisplay();
  openModal('modalReviewForm');
};

window.saveReview = function() {
  const name = reviewNameInput.value.trim();
  const text = reviewTextInput.value.trim();
  const date = reviewDateInput.value.trim() || 'Recente';
  const rating = selectedRating;
  const editIndex = parseInt(reviewEditIndexInput.value);
  
  if (!name || !text) {
    alert('⚠️ Compila nome e testo della recensione');
    return;
  }
  
  if (editIndex >= 0) {
    reviewsData[editIndex] = { name, rating, date, text };
  } else {
    reviewsData.push({ name, rating, date, text });
  }
  
  renderReviewsList();
  closeModal('modalReviewForm');
  markUnsaved();
};

window.deleteReview = function(index) {
  if (confirm('Eliminare questa recensione?')) {
    reviewsData.splice(index, 1);
    renderReviewsList();
    markUnsaved();
  }
};

// ===== DYNAMIC BUILDERS (Global functions for onclick) =====
window.addCarouselItem = function() {
  const container = document.getElementById('carouselList');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'input-with-btn mb-2';
  div.innerHTML = `<input type="url" class="carousel-url" placeholder="https://..."><button class="btn btn-sm btn-outline" onclick="window.removeCarouselItem(this)"><i class="fa-solid fa-trash"></i></button>`;
  container.appendChild(div);
  markUnsaved();
};

window.removeCarouselItem = function(btn) {
  btn.closest('.input-with-btn')?.remove();
  markUnsaved();
};

window.addCertItem = function() {
  const container = document.getElementById('certList');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'input-with-btn mb-2';
  div.innerHTML = `<input type="url" class="cert-url" placeholder="https://..."><button class="btn btn-sm btn-outline" onclick="window.removeCertItem(this)"><i class="fa-solid fa-trash"></i></button>`;
  container.appendChild(div);
  markUnsaved();
};

window.removeCertItem = function(btn) {
  btn.closest('.input-with-btn')?.remove();
  markUnsaved();
};

window.addQuestion = function() {
  const container = document.getElementById('questionsList');
  if (!container) return;
  const num = container.children.length + 1;
  const div = document.createElement('div');
  div.className = 'question-card';
  div.innerHTML = `
    <div class="question-header">
      <span class="question-title">Domanda ${num}</span>
      <button class="btn-delete" onclick="window.removeQuestion(this)"><i class="fa-solid fa-trash"></i> Elimina</button>
    </div>
    <div class="form-group mb-4">
      <label>Testo Domanda</label>
      <input type="text" class="question-text" placeholder="Scrivi la domanda...">
    </div>
    <label class="text-sm font-semibold mb-2">Opzioni di Risposta</label>
    <div class="answers-container">
      <div class="answer-row">
        <input type="text" class="answer-input" placeholder="Testo opzione...">
        <select class="answer-select">
          <option value="A">Profilo A</option><option value="B">Profilo B</option><option value="C">Profilo C</option><option value="D">Profilo D</option>
        </select>
        <button class="btn-delete" onclick="window.removeAnswer(this)"><i class="fa-solid fa-minus"></i></button>
      </div>
    </div>
    <button class="btn btn-sm btn-outline mt-2" onclick="window.addAnswer(this)"><i class="fa-solid fa-plus"></i> Aggiungi Opzione</button>
  `;
  container.appendChild(div);
  markUnsaved();
};

window.removeQuestion = function(btn) {
  btn.closest('.question-card')?.remove();
  markUnsaved();
};

window.addAnswer = function(btn) {
  const container = btn.previousElementSibling;
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'answer-row';
  div.innerHTML = `
    <input type="text" class="answer-input" placeholder="Testo opzione...">
    <select class="answer-select">
      <option value="A">Profilo A</option><option value="B">Profilo B</option><option value="C">Profilo C</option><option value="D">Profilo D</option>
    </select>
    <button class="btn-delete" onclick="window.removeAnswer(this)"><i class="fa-solid fa-minus"></i></button>
  `;
  container.appendChild(div);
  markUnsaved();
};

window.removeAnswer = function(btn) {
  btn.closest('.answer-row')?.remove();
  markUnsaved();
};

window.addFormField = function() {
  const container = document.getElementById('formFieldsList');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'formfield-card';
  div.innerHTML = `
    <div class="question-header">
      <span class="question-title">Nuovo Campo</span>
      <button class="btn-delete" onclick="window.removeFormField(this)"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group"><label>ID Campo (EmailJS)</label><input type="text" class="field-id" placeholder="es. my_field"></div>
      <div class="form-group"><label>Tipo di Input</label><select class="field-type" onchange="window.toggleFieldOptions(this)"><option value="textarea">Area di Testo</option><option value="radio">Scelta Singola</option><option value="scale">Scala 1-10</option></select></div>
    </div>
    <div class="form-group mt-2"><label>Testo della Domanda *</label><input type="text" class="field-label" placeholder="La domanda che vede l'utente..."></div>
    <div class="form-group"><label>Placeholder</label><input type="text" class="field-placeholder" placeholder="Suggerimento..."></div>
    <div class="options-container hidden"></div>
  `;
  container.appendChild(div);
  markUnsaved();
};

window.removeFormField = function(btn) {
  btn.closest('.formfield-card')?.remove();
  markUnsaved();
};

window.toggleFieldOptions = function(select) {
  const container = select.closest('.formfield-card')?.querySelector('.options-container');
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('hidden');
  
  if (select.value === 'radio') {
    container.classList.remove('hidden');
    container.innerHTML = `
      <label class="text-sm font-semibold mt-2">Opzioni</label>
      <div class="options-list">
        <div class="option-row"><input type="text" placeholder="Opzione 1"><button class="btn-delete" onclick="this.parentElement.remove()"><i class="fa-solid fa-minus"></i></button></div>
      </div>
      <button class="btn btn-sm btn-outline mt-1" onclick="window.addOption(this)">+ Aggiungi</button>
    `;
  } else if (select.value === 'scale') {
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="form-grid">
        <div class="form-group"><label>Etichetta Min (1)</label><input type="text" class="scale-min" value="Per niente"></div>
        <div class="form-group"><label>Etichetta Max (10)</label><input type="text" class="scale-max" value="Completamente"></div>
      </div>
    `;
  }
};

window.addOption = function(btn) {
  const list = btn.previousElementSibling;
  if (!list) return;
  const div = document.createElement('div');
  div.className = 'option-row';
  div.innerHTML = `<input type="text" placeholder="Nuova opzione"><button class="btn-delete" onclick="this.parentElement.remove()"><i class="fa-solid fa-minus"></i></button>`;
  list.appendChild(div);
};

// ===== UTILITIES =====
function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Expose utils for HTML onclick handlers
window.dashboardUtils = {
  markUnsaved,
  hasChanges: () => hasChanges,
  getConfig: () => configData
};

console.log('✅ Admin Dashboard JS loaded successfully');