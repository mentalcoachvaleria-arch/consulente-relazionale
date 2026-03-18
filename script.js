// ============================================
// GLOBAL VARIABLES
// ============================================
let activeModal = null;
let contactFormTemplateId = 'template_86ls76q';
let quizCurrentStep = 0;
let quizScores = { A: 0, B: 0, C: 0, D: 0 };
let quizFinalProfile = '';
let quizFinalProfileTitle = '';
// ✅ VARIABILI PER CONTACT FORM STEP-BY-STEP
let contactCurrentStep = 1;
const contactTotalSteps = 8;

// ============================================
// SITE LOADER
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const siteLoader = document.getElementById('site-loader');
  const loaderProgressBar = document.getElementById('loader-progress-bar');
  const loaderPercentage = document.getElementById('loader-percentage');

  function simulateLoading() {
    if (!siteLoader) return;
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 60) {
        progress += Math.random() * 5 + 2;
      } else if (progress < 70) {
        progress += Math.random() * 3 + 1;
      } else {
        progress += Math.random() * 2 + 0.5;
      }
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          siteLoader.classList.add('hidden');
          setTimeout(() => {
            initScrollAnimations();
            siteLoader.style.display = 'none';
          }, 900);
        }, 500);
      }
      if (loaderProgressBar) loaderProgressBar.style.width = progress + '%';
      if (loaderPercentage) loaderPercentage.textContent = Math.round(progress) + '%';
    }, 100);
  }

  if (siteLoader) {
    simulateLoading();
  }

  // ============================================
  // NAVBAR SCROLL EFFECT
  // ============================================
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // ============================================
  // MOBILE MENU
  // ============================================
  const menuToggle = document.getElementById('menu-toggle');
  const menuCloseBtn = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('menu-overlay');

  function openMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  function closeMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  if (menuToggle) menuToggle.addEventListener('click', openMobileMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMobileMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMobileMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // ============================================
  // COACHING MODAL
  // ============================================
  const coachingModal = document.getElementById('coaching-modal');
  const modalContent = document.getElementById('modal-content');
  const modalCloseBtn = document.getElementById('modal-close');

  function openCoachingModal() {
    if (!coachingModal) return;
    const scrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
    document.body.classList.add('modal-open');
    document.body.style.top = `-${scrollY}px`;
    coachingModal.classList.add('active');
    activeModal = 'coaching-modal';
    document.addEventListener('keydown', handleEscapeKey);
    setTimeout(() => {
      const firstFocusable = modalContent?.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 100);
  }
  function closeCoachingModal() {
    if (!coachingModal) return;
    coachingModal.classList.remove('active');
    document.removeEventListener('keydown', handleEscapeKey);
    setTimeout(() => {
      const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) || 0);
      }
      document.documentElement.style.removeProperty('--scroll-y');
      if (activeModal === 'coaching-modal') {
        activeModal = null;
      }
    }, 400);
  }
  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (activeModal === 'coaching-modal') closeCoachingModal();
      else if (activeModal === 'contact-modal') closeContactModal();
      else if (activeModal === 'quiz-modal') closeQuizModal();
    }
  }

  // Coaching Modal Triggers
  document.querySelectorAll('.accordo-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCoachingModal();
    });
  });
  const accordiBtn = document.getElementById('AccordodiCoaching');
  if (accordiBtn) {
    accordiBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCoachingModal();
    });
  }
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCoachingModal);
  if (coachingModal) {
    coachingModal.addEventListener('click', (e) => {
      if (e.target === coachingModal) closeCoachingModal();
    });
  }

  // ============================================
  // CONTACT MODAL - STEP-BY-STEP LOGIC ✅
  // ============================================
  const readinessSlider = document.getElementById('readinessScale');
  const readinessValue = document.getElementById('readiness-value');
  if (readinessSlider && readinessValue) {
    readinessValue.textContent = `${readinessSlider.value}/10`;
    readinessSlider.addEventListener('input', (e) => {
      readinessValue.textContent = `${e.target.value}/10`;
    });
  }

  function initAltroInput(radioName, altroId, altroLabelId) {
    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    const altroInput = document.getElementById(altroId);
    const altroLabel = document.getElementById(altroLabelId);
    if (!altroInput || !altroLabel) return;
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'Altro') {
          altroInput.style.display = 'block';
          altroInput.required = true;
          setTimeout(() => altroInput.focus(), 100);
        } else {
          altroInput.style.display = 'none';
          altroInput.required = false;
          altroInput.value = '';
        }
      });
    });
  }

  function goToContactStep(step) {
    document.querySelectorAll('.contact-step').forEach(el => el.classList.remove('active'));
    const currentStepEl = document.querySelector(`.contact-step[data-step="${step}"]`);
    if (currentStepEl) currentStepEl.classList.add('active');
    const percent = Math.round((step / contactTotalSteps) * 100);
    const progressBar = document.getElementById('contact-progress-bar');
    const percentText = document.getElementById('contact-progress-percent');
    const stepLabel = document.getElementById('contact-step-label');
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;
    if (stepLabel) stepLabel.textContent = `Step ${step} di ${contactTotalSteps}`;
    const prevBtn = document.getElementById('contact-step-prev');
    const nextBtn = document.getElementById('contact-step-next');
    const submitBtn = document.getElementById('contact-submit-btn');
    if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'block';
    if (nextBtn) nextBtn.style.display = step === contactTotalSteps ? 'none' : 'block';
    if (submitBtn) submitBtn.style.display = step === contactTotalSteps ? 'block' : 'none';
    contactCurrentStep = step;
    if (window.innerWidth < 768) {
      document.getElementById('contact-modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function validateContactStep(step) {
    const currentStepEl = document.querySelector(`.contact-step[data-step="${step}"]`);
    if (!currentStepEl) return true;
    let isValid = true;
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      const errorId = `error-${field.name || field.id}`;
      const errorEl = document.getElementById(errorId);
      if (field.type === 'radio') {
        const groupName = field.name;
        const checked = document.querySelector(`input[name="${groupName}"]:checked`);
        if (!checked) {
          if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Seleziona un\'opzione'; }
          isValid = false;
        } else if (checked.value === 'Altro') {
          const altroInput = document.getElementById(`${groupName}_altro`);
          if (altroInput && !altroInput.value.trim()) {
            if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Specifica l\'opzione'; }
            isValid = false;
          }
        }
      } else if (field.type === 'checkbox') {
        if (!field.checked) {
          if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Devi accettare per continuare'; }
          isValid = false;
        }
      } else if (!field.value.trim()) {
        if (errorEl) errorEl.style.display = 'block';
        isValid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Email non valida'; }
        isValid = false;
      }
    });
    return isValid;
  }

  function buildContactFormSummary() {
    const lines = ['', ''];
    const questionMap = {
      'challenge': '❓ Qual è la tua sfida più grande in amore in questo momento?',
      'relationshipsStart': '❓ Ti capita spesso di sentire che le tue relazioni non partono mai veramente?',
      'triedSoFar': '❓ Cosa hai provato a fare finora per risolvere questa situazione?',
      'readinessScale': '❓ Da 1 a 10, quanto ti senti pronta/o a mettere in discussione i tuoi schemi?',
      'goals': '❓ Cosa speri di ottenere concretamente da questo percorso?',
      'discovery': '❓ Come sei venuta/o a conoscenza del mio lavoro?'
    };
    document.querySelectorAll('[data-label]').forEach(field => {
      const fieldId = field.id || field.name;
      const question = questionMap[fieldId] || field.getAttribute('data-label');
      let answer = '';
      if (field.type === 'radio') {
        if (field.checked) {
          answer = field.value;
          if (answer === 'Altro') {
            const altroId = `${field.name}_altro`;
            const altroVal = document.getElementById(altroId)?.value?.trim();
            if (altroVal) answer += `: ${altroVal}`;
          }
        } else {
          return;
        }
      } else if (field.type === 'checkbox') {
        answer = field.checked ? '✅ Accettato' : '❌ Non accettato';
      } else if (field.type === 'range') {
        answer = `${field.value}/10`;
      } else {
        answer = field.value.trim() || 'Non specificato';
      }
      if (answer) {
        lines.push(`${question}`);
        lines.push(`   ↳ ${answer}`);
        lines.push('');
      }
    });
    lines.push('');
    lines.push(`📅 Inviato il: ${new Date().toLocaleString('it-IT')}`);
    return lines.join('\n');
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    if (!validateContactStep(contactCurrentStep)) {
      const firstError = document.querySelector('.contact-step.active .input-error[style*="display: block"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const submitBtn = document.getElementById('contact-submit-btn');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Invio in corso...';
    submitBtn.disabled = true;

    const templateParams = {
      name: document.getElementById('contact-name')?.value?.trim() || 'Non specificato',
      email: document.getElementById('contact-email')?.value?.trim() || 'Non specificato',
      phone: document.getElementById('contact-phone')?.value?.trim() || 'Non specificato',
      result: buildContactFormSummary(),
      privacy: document.getElementById('contact-privacy')?.checked ? 'Accettato' : 'Non accettato',
      sent_from: window.location.href,
      date: new Date().toLocaleString('it-IT')
    };

    emailjs.send('service_wnyvmph', 'template_86ls76q', templateParams)
      .then(function(response) {
        console.log('✅ Email inviata!', response);
        document.getElementById('contact-form-content')?.classList.add('hidden');
        document.getElementById('contact-success')?.classList.add('visible');
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
        document.getElementById('contact-form')?.reset();
        goToContactStep(1);
        if (typeof fbq === 'function') fbq('track', 'Contact');
      })
      .catch(function(error) {
        console.error('❌ EmailJS Error:', error);
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
        alert('⚠️ Errore durante l\'invio. Riprova o scrivimi su WhatsApp: +39 345 840 7102');
      });
  }

  function initContactStepForm() {
    initAltroInput('relationshipsStart', 'relationshipsStart-altro', 'relationshipsStart-altro-label');
    initAltroInput('discovery', 'discovery-altro', 'discovery-altro-label');
    const nextBtn = document.getElementById('contact-step-next');
    const prevBtn = document.getElementById('contact-step-prev');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateContactStep(contactCurrentStep)) {
          goToContactStep(Math.min(contactCurrentStep + 1, contactTotalSteps));
        }
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToContactStep(Math.max(contactCurrentStep - 1, 1));
      });
    }
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleContactSubmit);
    }
    const originalReset = window.resetContactForm;
    window.resetContactForm = function() {
      if (originalReset) originalReset();
      goToContactStep(1);
      document.querySelectorAll('.input-error').forEach(el => el.style.display = 'none');
    };
    goToContactStep(1);
  }
  initContactStepForm();

  function openContactModal(templateId) {
    const modal = document.getElementById('contact-modal');
    if (!modal) { console.error('❌ Contact modal not found!'); return; }
    if (activeModal) {
      const currentModal = document.getElementById(activeModal);
      if (currentModal) {
        currentModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
      }
    }
    contactFormTemplateId = templateId || 'template_86ls76q';
    const scrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
    document.body.classList.add('modal-open');
    document.body.style.top = `-${scrollY}px`;
    modal.classList.add('active');
    activeModal = 'contact-modal';
    document.addEventListener('keydown', handleContactEscapeKey);
    resetContactForm();
    setTimeout(function() {
      const nameInput = document.getElementById('contact-name');
      if (nameInput) nameInput.focus();
    }, 100);
    console.log('✅ Contact modal opened');
  }
  function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.removeEventListener('keydown', handleContactEscapeKey);
    setTimeout(() => {
      const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      if (scrollY) { window.scrollTo(0, parseInt(scrollY) || 0); }
      document.documentElement.style.removeProperty('--scroll-y');
      if (activeModal === 'contact-modal') { activeModal = null; }
    }, 400);
  }
  function handleContactEscapeKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeContactModal(); }
  }
  function resetContactForm() {
    const form = document.getElementById('contact-form');
    const formContent = document.getElementById('contact-form-content');
    const successState = document.getElementById('contact-success');
    if (form) form.reset();
    if (formContent) formContent.classList.remove('hidden');
    if (successState) successState.classList.remove('visible');
    goToContactStep(1);
    const labels = document.querySelectorAll('#input-label-name, #input-label-email, #input-label-message');
    labels.forEach(function(label) { label.classList.remove('error'); });
  }

  const contactModalTriggers = ['Contattami','inziailtuoopercorso2','RichiediInformazioni2','RichiediInformazioni3','RichiediInformazioni','inziailtuoopercorso3','bntprenota','prenotabottoneconsulenza','inziailtuoopercorso4'];
  contactModalTriggers.forEach(function(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openContactModal('template_86ls76q');
        console.log('🎯 Contact modal opened from:', buttonId);
      });
    } else { console.warn('⚠️ Button not found:', buttonId); }
  });

  const mobileContattami = document.getElementById('mobile-Contattami');
  if (mobileContattami) {
    mobileContattami.addEventListener('click', function(e) {
      e.preventDefault();
      closeMobileMenu();
      setTimeout(() => { openContactModal('template_86ls76q'); }, 300);
    });
  }
  const coachingModalPrenotaBtn = document.getElementById('prenotabottoneconsulenza');
  if (coachingModalPrenotaBtn) {
    coachingModalPrenotaBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeCoachingModal();
      setTimeout(function() { openContactModal('template_86ls76q'); }, 400);
    });
  }
  const contactModalCloseBtn = document.getElementById('contact-modal-close');
  if (contactModalCloseBtn) { contactModalCloseBtn.addEventListener('click', closeContactModal); }
  const successCloseBtn = document.getElementById('success-close-btn');
  if (successCloseBtn) { successCloseBtn.addEventListener('click', closeContactModal); }
  const contactModal = document.getElementById('contact-modal');
  if (contactModal) {
    contactModal.addEventListener('click', function(e) {
      if (e.target === contactModal) { closeContactModal(); }
    });
  }
  console.log('✅ Contact Modal Step-by-Step loaded');

  // ============================================
  // QUIZ MODAL - ✅ VERSIONE AGGIORNATA
  // ============================================
  const quizQuestions = [
    { id: 1, text: "Quando ricevi un messaggio dalla persona che stai frequentando:", options: [
      { text: "Rispondo quasi subito: mi piace far sentire la mia presenza e disponibilità.", score: "A" },
      { text: "Rispondo con entusiasmo: ogni messaggio mi fa sognare un po' di più il nostro futuro.", score: "B" },
      { text: "Rispondo con calma: preferisco non sembrare troppo pressante e mantenere i miei spazi.", score: "C" },
      { text: "Controllo l'ora dell'ultimo accesso: cerco di capire quanto ci ha messo a scrivermi.", score: "D" }
    ]},
    { id: 2, text: "Ti propone un appuntamento, ma avevi già un impegno con un'amica:", options: [
      { text: "Cerco di spostare l'impegno con l'amica: non voglio perdere l'occasione di vederlo/a.", score: "A" },
      { text: "Accetto subito: l'adrenalina dell'incontro vince su tutto il resto.", score: "B" },
      { text: "Propongo un altro giorno: tengo molto alla mia routine e ai miei impegni precedenti.", score: "C" },
      { text: "Accetto, ma poi passo il tempo a chiedermi se l'ha fatto solo perché non aveva altro da fare.", score: "D" }
    ]},
    { id: 3, text: "Cosa cerchi di più in un partner?", options: [
      { text: "Qualcuno che sappia apprezzare tutto l'amore e le attenzioni che so dare.", score: "A" },
      { text: "Una connessione magica, di quelle che si leggono nei libri o si vedono nei film.", score: "B" },
      { text: "Una persona autonoma che rispetti la mia indipendenza senza troppe pretese.", score: "C" },
      { text: "Una presenza costante che mi faccia sentire al sicuro e mai in dubbio.", score: "D" }
    ]},
    { id: 4, text: "Durante i primi mesi, se sorge un piccolo malinteso:", options: [
      { text: "Chiedo scusa o cerco di 'lasciar passare': l'importante è che torni l'armonia il prima possibile.", score: "A" },
      { text: "Mi abbatto un po': temo che la 'scintilla' iniziale si stia già spegnendo.", score: "B" },
      { text: "Mi distacco per un paio di giorni: ho bisogno di riflettere da solo/a senza pressioni.", score: "C" },
      { text: "Ho bisogno di parlarne subito: bisogna chiarire all'istante.", score: "D" }
    ]},
    { id: 5, text: "Sabato sera ideale con il partner:", options: [
      { text: "'Decidi tu, a me va bene tutto ciò che rende felice te'.", score: "A" },
      { text: "Qualcosa di nuovo e speciale: ogni uscita deve essere un'esperienza indimenticabile.", score: "B" },
      { text: "Una serata tranquilla, ma magari ognuno legge il suo libro o fa le sue cose nella stessa stanza.", score: "C" },
      { text: "Fare qualcosa insieme dove possiamo parlare e sentirci davvero vicini.", score: "D" }
    ]},
    { id: 6, text: "Se il partner non ti scrive per un intero pomeriggio:", options: [
      { text: "Penso che sia molto impegnato e gli mando un messaggino dolce per fargli sapere che ci sono.", score: "A" },
      { text: "Inizio a chiedermi se sta scemando l'interesse dei primi tempi.", score: "B" },
      { text: "Non ci faccio quasi caso: anche io sono concentrato/a sulle mie attività.", score: "C" },
      { text: "Mi chiedo cosa stia facendo e perché non trovi nemmeno un minuto per un saluto.", score: "D" }
    ]},
    { id: 7, text: "Come ti descriveresti all'inizio di una storia?", options: [
      { text: "Molto generoso/a: amo prendermi cura dell'altro in ogni dettaglio.", score: "A" },
      { text: "Un sognatore/trice: mi lascio trasportare dalle emozioni senza freni.", score: "B" },
      { text: "Prudente: ci metto un po' a lasciarmi andare del tutto.", score: "C" },
      { text: "Attento/a: osservo ogni segnale per capire se posso fidarmi davvero.", score: "D" }
    ]},
    { id: 8, text: "Quando si parla di progetti futuri (anche piccoli):", options: [
      { text: "Mi adatto volentieri ai suoi sogni, sono felice di farne parte.", score: "A" },
      { text: "Adoro pianificare: immagino già i viaggi e le tappe importanti che faremo.", score: "B" },
      { text: "Preferisco vivere il presente, fare piani a lungo termine mi mette un po' d'ansia.", score: "C" },
      { text: "Cerco conferme sul fatto che saremo ancora insieme tra un anno.", score: "D" }
    ]},
    { id: 9, text: "In una relazione, qual è la tua paura più grande?", options: [
      { text: "Che l'altro smetta di aver bisogno di me o non apprezzi i miei sforzi.", score: "A" },
      { text: "Che la quotidianità diventi noiosa e si perda la passione.", score: "B" },
      { text: "Di sentirmi soffocare o di dover rinunciare alla mia libertà.", score: "C" },
      { text: "Di essere lasciato/a all'improvviso o tradito/a.", score: "D" }
    ]},
    { id: 10, text: "Cosa pensi dei tuoi 'errori' passati in amore?", options: [
      { text: "Forse ho dato troppo a persone che non lo meritavano.", score: "A" },
      { text: "Ho creduto troppo presto in storie che poi si sono rivelate diverse.", score: "B" },
      { text: "Forse ho tenuto le persone troppo a distanza per paura di soffrire.", score: "C" },
      { text: "Sono stato/a troppo attento/a ai dettagli, rovinando il clima con i miei dubbi.", score: "D" }
    ]}
  ];

  // ✅ QUIZ RESULTS ESPANSO CON TUTTI I DETTAGLI
  const quizResults = {
    A: {
      title: "L'Anima Generosa",
      subtitle: "Il 'Sempre Disponibile'",
      strengths: "• Empatia profonda: senti i bisogni dell'altro prima ancora che vengano espressi\n• Affidabilità: sei una roccia, la tua presenza è costante e rassicurante\n• Generosità emotiva: chi sta con te si sente inizialmente molto coccolato e al centro del mondo",
      weaknesses: "• Difficoltà nei confini: fai fatica a dire 'no' per paura di deludere o creare conflitto\n• Scomparsa del sé: tendi a mettere i tuoi hobby, amici e bisogni in secondo piano\n• Resentimento silenzioso: accumuli stanchezza nel 'dare sempre' e, quando non ricevi la stessa dedizione, finisci per chiuderti o esplodere",
      impact: "🔹 In Frequentazione: essere 'troppo disponibile' toglie quel pizzico di mistero e di conquista. L'altro potrebbe iniziare a darti per scontato.\n\n🔹 In Relazione: si crea uno squilibrio di potere. Tu diventi il 'genitore' o l'assistente, e il partner smette di vederti come un compagno alla pari. Questo spegne l'attrazione e ti lascia con un senso di vuoto.",
      advice: "La tua disponibilità è un dono prezioso, ma non è una moneta di scambio per ottenere amore. Imparare a farsi attendere e a coltivare i propri spazi non ti rende meno 'buona/o', ma ti rende incredibilmente più magnetica/o. Ricorda: chi ti ama davvero vuole vedere la tua luce, non la tua ombra che lo segue ovunque."
    },
    B: {
      title: "L'Idealista Sognatore",
      subtitle: "Il 'Velocista dell'Amore'",
      strengths: "• Entusiasmo contagioso: porti gioia e vitalità in ogni nuova conoscenza\n• Ottimismo sentimentale: nonostante le delusioni, continui a credere nel grande amore\n• Capacità di sognare: sai progettare, immaginare e creare connessioni emotive profonde in pochissimo tempo",
      weaknesses: "• Aspettative altissime: cerchi la 'perfezione' o il segnale del destino, rischiando di rimanere deluso non appena emerge un difetto\n• Cecità selettiva: nella fretta di vivere il sogno, tendi a ignorare i segnali d'allarme (red flags)\n• Difficoltà con la routine: quando finisce l'euforia iniziale, la quotidianità ti sembra una sconfitta",
      impact: "🔹 In Frequentazione: tendi a 'bruciare le tappe'. Spesso spaventi l'altro con un'intensità eccessiva troppo presto, oppure ti innamori di una versione idealizzata della persona.\n\n🔹 In Relazione: appena subentrano i primi problemi reali o la noia, senti che la magia è finita. Invece di costruire un amore solido, rischi di cercare altrove quella scarica di adrenalina.",
      advice: "Sognare in grande è il tuo dono, ma un amore che dura ha bisogno di radici, non solo di ali. Impara a goderti la lentezza: conoscere qualcuno per chi è davvero (con i suoi difetti) è molto più gratificante che amare un'immagine perfetta. Ricorda: la vera magia non è il colpo di fulmine, ma restare quando la luce si fa più fioca."
    },
    C: {
      title: "L'Indipendente Solitario",
      subtitle: "La 'Fortezza Inespugnabile'",
      strengths: "• Autonomia: sei una persona solida e centrata, non cerchi un partner perché 'ti manca un pezzo'\n• Razionalità: sai gestire le crisi con lucidità, senza lasciarti travolgere dai drammi emotivi\n• Rispetto degli spazi: non soffochi mai il partner e rispetti profondamente la sua individualità",
      weaknesses: "• Paura della vulnerabilità: mostrare le tue fragilità ti fa sentire debole o in pericolo\n• Barriere emotive: quando senti che l'intimità sta diventando 'troppa', tendi a ritirarti o a diventare freddo/a\n• Difficoltà di impegno: l'idea di fare progetti a lungo termine ti fa sentire un senso di claustrofobia",
      impact: "🔹 In Frequentazione: all'inizio risulti affascinante e misterioso/a, ma non appena l'altro cerca di fare un passo avanti, tu ne fai due indietro. Questo crea insicurezza nel partner.\n\n🔹 In Relazione: tendi a vivere come 'un single in coppia'. Escludi il partner dalle tue decisioni, facendolo sentire un estraneo. Questo muro impedisce la vera connessione.",
      advice: "L'indipendenza è una virtù, ma l'autosufficienza estrema è spesso una corazza per non soffrire. Ricorda che permettere a qualcuno di avvicinarsi non significa perdere la tua libertà, ma raddoppiare la tua forza. Prova a condividere un piccolo timore: scoprirai che la vera libertà sta nel poter essere te stessa/o, anche insieme a un altro."
    },
    D: {
      title: "Il Ricercatore di Sicurezza",
      subtitle: "Il 'Vigile del Cuore'",
      strengths: "• Profonda lealtà: quando ti fidi, sei un partner di una fedeltà incrollabile\n• Attenzione ai dettagli: non ti sfugge nulla, sai cogliere un cambiamento d'umore nel partner\n• Desiderio di condivisione: credi nel valore della coppia come squadra, 'noi' viene prima di 'io'",
      weaknesses: "• Bisogno di rassicurazione: se il partner non ti dà conferme costanti, entri subito in stato di allerta\n• Sovrappensiero (Overthinking): analizzi ogni virgola, ogni silenzio, cercando significati nascosti che spesso non esistono\n• Paura dell'abbandono: il timore che le cose possano finire ti impedisce di goderti il presente",
      impact: "🔹 In Frequentazione: il tuo bisogno di sapere 'cosa siamo' troppo presto può mettere pressione all'altro. Se percepisci un minimo distacco, potresti reagire con chiusura o eccessiva richiesta di attenzioni.\n\n🔹 In Relazione: la tua ansia diventa un terzo incomodo. Il partner può sentirsi sotto esame o responsabile della tua felicità, finendo per sentirsi soffocare.",
      advice: "La sicurezza che cerchi all'esterno, negli occhi dell'altro, è una luce che devi prima accendere dentro di te. Imparare a tollerare l'incertezza non significa esporsi al pericolo, ma iniziare a fidarsi della propria capacità di gestire qualsiasi cosa accada. Ricorda: l'amore è un salto nel vuoto, ma se ti fidi delle tue ali, il vuoto non fa più paura."
    }
  };

  // ✅ BOZZE DI RISPOSTA PERSONALIZZATE PER OGNI PROFILO
  const replyDrafts = {
    A: `Ciao {{name}},

ho letto con attenzione il tuo profilo: "L'Anima Generosa".

Quello che emerge è una persona con un cuore enorme, capace di amare con generosità e dedizione. Questo è un dono prezioso, ma come hai visto, a volte rischia di portarti a dimenticare te stessa/o.

Il lavoro che possiamo fare insieme:
• Imparare a dire "no" senza sensi di colpa
• Riconnetterti con i tuoi bisogni e i tuoi spazi
• Trasformare la tua disponibilità in un atto di scelta, non di dovere

Se ti riconosci in questo percorso, rispondimi pure a questa mail o scrivimi su WhatsApp per fissare una chiacchierata conoscitiva (senza impegno).

Con affetto,
Valeria Moretti
Consulente Relazionale`,

    B: `Ciao {{name}},

il tuo profilo è "L'Idealista Sognatore" – e si sente tutta la tua capacità di vivere l'amore con intensità e passione.

Il tuo entusiasmo è contagioso, ma a volte la fretta di vivere il sogno può portarti a correre più veloce della realtà.

Il lavoro che possiamo fare insieme:
• Imparare a goderti la lentezza della conoscenza autentica
• Riconoscere i segnali reali senza filtrarli attraverso l'idealizzazione
• Costruire un amore che duri oltre la fase dell'innamoramento

Se senti che questo percorso fa per te, rispondimi pure o scrivimi su WhatsApp per una chiacchierata conoscitiva gratuita.

Con affetto,
Valeria Moretti
Consulente Relazionale`,

    C: `Ciao {{name}},

dal tuo quiz emerge il profilo de "L'Indipendente Solitario": una persona forte, autonoma, che non ha bisogno di nessuno per sentirsi completa.

Questa è una grande risorsa, ma in amore a volte la corazza dell'autosufficienza può tenere a distanza proprio chi vorrebbe avvicinarsi.

Il lavoro che possiamo fare insieme:
• Esplorare la differenza tra indipendenza sana e paura della vulnerabilità
• Imparare a condividere piccoli passi di intimità senza sentirsi in pericolo
• Scoprire che la vera forza sta nel poter essere sé stessi, anche insieme

Se ti rispecchi in queste parole e vuoi approfondire, rispondimi pure o scrivimi su WhatsApp per fissare una chiamata conoscitiva.

Con affetto,
Valeria Moretti
Consulente Relazionale`,

    D: `Ciao {{name}},

il tuo profilo è "Il Ricercatore di Sicurezza": una persona leale, attenta, che crede nel valore della coppia come squadra.

La tua sensibilità è un dono, ma a volte il bisogno di certezze può trasformarsi in ansia che toglie leggerezza al rapporto.

Il lavoro che possiamo fare insieme:
• Imparare a tollerare l'incertezza senza entrare in allarme
• Spostare il focus dal "controllo esterno" alla "fiducia interna"
• Costruire una sicurezza che nasce da te, prima che dall'altro

Se senti che questo percorso può aiutarti, rispondimi pure o scrivimi su WhatsApp per una chiacchierata conoscitiva senza impegno.

Con affetto,
Valeria Moretti
Consulente Relazionale`
  };

  function openQuizModal() {
    const modal = document.getElementById('quiz-modal');
    if (!modal) { console.error('❌ Quiz modal not found!'); return; }
    if (activeModal) {
      const currentModal = document.getElementById(activeModal);
      if (currentModal) {
        currentModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
      }
    }
    const scrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
    document.body.classList.add('modal-open');
    document.body.style.top = `-${scrollY}px`;
    modal.classList.add('active');
    activeModal = 'quiz-modal';
    document.addEventListener('keydown', handleQuizEscapeKey);
    resetQuiz();
    setTimeout(function() {
      const firstQuestion = document.getElementById('quiz-question-text');
      if (firstQuestion) firstQuestion.focus();
    }, 100);
    console.log('✅ Quiz modal opened');
  }
  function closeQuizModal() {
    const modal = document.getElementById('quiz-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.removeEventListener('keydown', handleQuizEscapeKey);
    setTimeout(() => {
      const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      if (scrollY) { window.scrollTo(0, parseInt(scrollY) || 0); }
      document.documentElement.style.removeProperty('--scroll-y');
      if (activeModal === 'quiz-modal') { activeModal = null; }
    }, 400);
  }
  function handleQuizEscapeKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeQuizModal(); }
  }
  function resetQuiz() {
    quizCurrentStep = 0;
    quizScores = { A: 0, B: 0, C: 0, D: 0 };
    quizFinalProfile = '';
    quizFinalProfileTitle = '';
    const questionContainer = document.getElementById('quiz-question-container');
    const resultContainer = document.getElementById('quiz-result-container');
    const contactSection = document.getElementById('quiz-contact-section');
    const successState = document.getElementById('quiz-success');
    questionContainer.classList.remove('hidden');
    resultContainer.classList.remove('visible');
    if (contactSection) contactSection.classList.add('hidden');
    if (successState) successState.classList.remove('visible');
    renderQuizQuestion();
  }
  function renderQuizQuestion() {
    const question = quizQuestions[quizCurrentStep];
    if (!question) { showQuizResults(); return; }
    const progress = ((quizCurrentStep + 1) / quizQuestions.length) * 100;
    const progressBar = document.getElementById('quiz-progress-bar');
    const stepCounter = document.getElementById('quiz-step-counter');
    if (progressBar) progressBar.style.width = progress + '%';
    if (stepCounter) stepCounter.textContent = 'Domanda ' + (quizCurrentStep + 1) + ' di ' + quizQuestions.length;
    const questionText = document.getElementById('quiz-question-text');
    const optionsContainer = document.getElementById('quiz-options-container');
    if (questionText) questionText.textContent = question.text;
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      question.options.forEach(function(opt, index) {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = '<span class="quiz-option-text">' + opt.text + '</span><i class="fa-solid fa-chevron-right quiz-option-icon"></i>';
        btn.addEventListener('click', function() { handleQuizAnswer(opt.score); });
        optionsContainer.appendChild(btn);
      });
    }
  }
  function handleQuizAnswer(score) {
    quizScores[score]++;
    quizCurrentStep++;
    const container = document.getElementById('quiz-question-container');
    container.style.opacity = '0';
    setTimeout(function() {
      renderQuizQuestion();
      container.style.opacity = '1';
    }, 250);
  }
  function showQuizResults() {
    const questionContainer = document.getElementById('quiz-question-container');
    const resultContainer = document.getElementById('quiz-result-container');
    const contactSection = document.getElementById('quiz-contact-section');
    questionContainer.classList.add('hidden');
    resultContainer.classList.add('visible');
    let maxScore = 'A';
    for (let key in quizScores) {
      if (quizScores[key] > quizScores[maxScore]) { maxScore = key; }
    }
    quizFinalProfile = maxScore;
    const result = quizResults[maxScore];
    quizFinalProfileTitle = result.title;
    document.getElementById('quiz-result-title').textContent = result.title + ' - ' + result.subtitle;
    document.getElementById('quiz-result-description').textContent = result.description;
    if (contactSection) {
      contactSection.classList.remove('hidden');
      setTimeout(function() {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }
  function validateQuizContactForm() {
    let isValid = true;
    const name = document.getElementById('quiz-contact-name');
    const nameLabel = document.getElementById('quiz-input-label-name');
    const nameError = document.getElementById('quiz-error-name');
    if (!name.value.trim() || name.value.trim().length < 2) {
      nameLabel.classList.add('error');
      nameError.textContent = 'Inserisci un nome valido (min. 2 caratteri)';
      isValid = false;
    } else { nameLabel.classList.remove('error'); }
    const email = document.getElementById('quiz-contact-email');
    const emailLabel = document.getElementById('quiz-input-label-email');
    const emailError = document.getElementById('quiz-error-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      emailLabel.classList.add('error');
      emailError.textContent = 'Inserisci un\'email valida';
      isValid = false;
    } else { emailLabel.classList.remove('error'); }
    const message = document.getElementById('quiz-contact-message');
    const messageLabel = document.getElementById('quiz-input-label-message');
    const messageError = document.getElementById('quiz-error-message');
    if (!message.value.trim()) {
      messageLabel.classList.add('error');
      messageError.textContent = 'Descrivi brevemente la tua situazione';
      isValid = false;
    } else { messageLabel.classList.remove('error'); }
    const privacy = document.getElementById('quiz-contact-privacy');
    if (!privacy.checked) {
      alert('⚠️ Devi accettare la privacy policy per continuare');
      isValid = false;
    }
    return isValid;
  }

  // ✅ FUNZIONE AGGIORNATA: INVIO QUIZ CON RESULT + REPLY_DRAFT
  function handleQuizContactSubmit(e) {
    e.preventDefault();
    if (!validateQuizContactForm()) {
      const firstError = document.querySelector('#quiz-contact-section .error');
      if (firstError) {
        const firstInput = firstError.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
      }
      return;
    }
    const submitBtn = document.getElementById('quiz-submit-btn');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Invio in corso...';
    submitBtn.disabled = true;

    // ✅ Recupera il profilo completo
    const profile = quizResults[quizFinalProfile];

    // ✅ Costruisci il risultato formattato per {{result}}
    const resultContent = `🎯 ${profile.title} - ${profile.subtitle}

✨ I TUOI PUNTI DI FORZA
${profile.strengths}

⚠️ I TUOI PUNTI DI DEBOLEZZA
${profile.weaknesses}

🚩 PERCHÉ QUESTO INFLUISCE SULLE TUE STORIE
${profile.impact}

💡 IL CONSIGLIO DELLA TUA CONSULENTE
${profile.advice}`;

    // ✅ Seleziona la bozza di risposta in base al profilo
    const replyDraft = replyDrafts[quizFinalProfile] || replyDrafts.A;

    // ✅ Parametri per EmailJS
    const templateParams = {
      profile_score: quizFinalProfile,
      profile_title: `${profile.title} - ${profile.subtitle}`,
      result: resultContent,              // ✅ Analisi completa per {{result}}
      reply_draft: replyDraft,            // ✅ Bozza personalizzata per {{reply_draft}}
      name: document.getElementById('quiz-contact-name').value.trim(),
      email: document.getElementById('quiz-contact-email').value.trim(),
      phone: document.getElementById('quiz-contact-phone').value.trim() || 'Non specificato',
      message: document.getElementById('quiz-contact-message').value.trim(),
      privacy: 'Accettato',
      sent_from: window.location.href,
      date: new Date().toLocaleString('it-IT'),
      form_type: 'Quiz + Contatti'
    };

    emailjs.send('service_wnyvmph', 'template_wqnveql', templateParams)
      .then(function() {
        const contactSection = document.getElementById('quiz-contact-section');
        const successState = document.getElementById('quiz-success');
        if (contactSection) contactSection.classList.add('hidden');
        if (successState) successState.classList.add('visible');
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
        if (typeof fbq === 'function') fbq('track', 'Lead');
      })
      .catch(function(error) {
        console.error('❌ EmailJS Error:', error);
        alert('⚠️ Si è verificato un errore durante l\'invio. Riprova o scrivimi su WhatsApp.');
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
      });
  }

  const quizContactInputs = document.querySelectorAll('#quiz-contact-name, #quiz-contact-email, #quiz-contact-message');
  quizContactInputs.forEach(function(input) {
    input.addEventListener('input', function() {
      const label = document.getElementById('quiz-input-label-' + this.name);
      if (label && label.classList.contains('error') && this.validity.valid) {
        label.classList.remove('error');
      }
    });
    input.addEventListener('focus', function() {
      const label = document.getElementById('quiz-input-label-' + this.name);
      if (label) label.classList.remove('error');
    });
  });

  const quizBtn = document.getElementById('iniziatquiz');
  if (quizBtn) {
    quizBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openQuizModal();
      console.log('🧠 Quiz modal opened');
    });
  }
  const quizCloseBtn = document.getElementById('quiz-modal-close');
  if (quizCloseBtn) { quizCloseBtn.addEventListener('click', closeQuizModal); }
  const quizSuccessCloseBtn = document.getElementById('quiz-success-close-btn');
  if (quizSuccessCloseBtn) { quizSuccessCloseBtn.addEventListener('click', closeQuizModal); }
  const quizModal = document.getElementById('quiz-modal');
  if (quizModal) {
    quizModal.addEventListener('click', function(e) {
      if (e.target === quizModal) { closeQuizModal(); }
    });
  }
  const quizContactForm = document.getElementById('quiz-contact-form');
  if (quizContactForm) {
    quizContactForm.addEventListener('submit', handleQuizContactSubmit);
  }
  console.log('✅ Quiz Modal loaded');

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));
  }

  // ============================================
  // COUNTDOWN TIMER
  // ============================================
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    let time = 6 * 60 + 59;
    function updateCountdown() {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      countdownEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      if (time > 0) time--; else time = 6 * 60 + 59;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ============================================
  // IMAGE SLIDER
  // ============================================
  const sliderContainer = document.getElementById('image-slider');
  const slides = sliderContainer ? sliderContainer.querySelectorAll('.slide') : [];
  if (slides.length > 0) {
    let currentSlide = 1;
    function nextSlide() {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
      });
      currentSlide = (currentSlide + 1) % slides.length;
    }
    setInterval(nextSlide, 4000);
  }

  // ============================================
  // TESTIMONIALS CAROUSEL
  // ============================================
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('testimonials-dots');
  if (track && dotsContainer) {
    const testimonials = [
      { name: "Webnix It", text: "Valeria mi ha aiutato in alcune situazioni.. Di cui non posso specificare per motivi di privacy. Mi ha aiutato guidandomi a vedere le cose da prospettive diverse e a ragionare in modo nuovo.", time: "4 mesi fa" },
      { name: "crispa faus", text: "Ho avuto la fortuna di essere aiutato da Valeria, parlando con lei si capisce subito la sua competenza e la sua disponibilità. È una ragazza speciale la consiglio.", time: "4 mesi fa" },
      { name: "Marika Tasca", text: "Ero in un periodo molto buio della mia vita e lei mi ha aiutato a superare i mie momenti di difficoltà. É molto empatica, gentile e soprattutto sa di cosa hai bisogno.", time: "4 mesi fa" },
      { name: "Davide Semino", text: "Ottima coach, gentile, disponibile e comprensiva. Oltre a questo è una bellissima persona che ha a cuore il bene degli altri. Consigliata!", time: "4 mesi fa" },
      { name: "Noemi Giardina", text: "Se cerchi aiuto nel fare ordine con le tue problematiche o hai problemi da risolvere, Valeria è la persona giusta. Empatica, capace di metterti da subito a tuo agio, competente.", time: "4 mesi fa" },
      { name: "paola rizzato", text: "Bravissima, molto calma, ascolta e consiglia bene, viene naturale parlare con lei…ottima persona", time: "4 mesi fa" }
    ];
    function createTestimonialCard(data) {
      return `
<div class="testimonial-item">
<div class="testimonial-card-inner">
<div class="testimonial-stars">
<i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
</div>
<p class="testimonial-text">"${data.text}"</p>
<div class="testimonial-footer">
<div class="testimonial-author">
<h4 class="testimonial-name">${data.name}</h4>
<p class="testimonial-time">${data.time}</p>
</div>
<div class="testimonial-icon">
<i class="fa-brands fa-google"></i>
</div>
</div>
</div>
</div>`;
    }
    const allTestimonials = [...testimonials, ...testimonials];
    track.innerHTML = allTestimonials.map(createTestimonialCard).join('');
    dotsContainer.innerHTML = testimonials.map((_, index) =>
      `<button class="testimonial-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Vai alla recensione ${index + 1}"></button>`
    ).join('');
    dotsContainer.querySelectorAll('.testimonial-dot').forEach(dot => {
      dot.addEventListener('click', function() {
        dotsContainer.querySelectorAll('.testimonial-dot').forEach(d => d.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      }
    });
  });

  // ============================================
  // FAQ ACCORDION
  // ============================================
  document.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', function() {
      if (this.open) {
        document.querySelectorAll('details').forEach(other => {
          if (other !== this && other.open) other.open = false;
        });
      }
    });
  });

  // ============================================
  // COPY IBAN
  // ============================================
  const copyIbanBtn = document.getElementById('copy-iban');
  if (copyIbanBtn) {
    copyIbanBtn.addEventListener('click', function() {
      const iban = 'IT83E0338501601100080012640';
      navigator.clipboard.writeText(iban).then(() => {
        const originalHTML = copyIbanBtn.innerHTML;
        copyIbanBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        copyIbanBtn.classList.add('copied');
        setTimeout(() => {
          copyIbanBtn.innerHTML = originalHTML;
          copyIbanBtn.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Errore copia IBAN:', err);
        alert('IBAN: ' + iban);
      });
    });
  }

  console.log('🚀 Valeria Moretti Website v8.5 initialized');
});


/* ============================================
📱 MOBILE HOVER EFFECTS (TAP INTERACTIONS)
============================================ */

// Funzione per aggiungere classe active al tap
function addMobileHoverEffect(selector) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('active');
            }, 300);
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.classList.remove('active');
        }, { passive: true });
    });
}

// Applica effetti hover mobile a tutti gli elementi interattivi
document.addEventListener('DOMContentLoaded', function() {
    // Problem items
    addMobileHoverEffect('.problem-item');
    
    // Benefit cards
    addMobileHoverEffect('.benefit-card');
    
    // Quiz cards
    addMobileHoverEffect('.quiz-card');
    
    // Service cards
    addMobileHoverEffect('.service-card');
    
    // FAQ items
    addMobileHoverEffect('.faq-item');
    
    // Video quote
    addMobileHoverEffect('.video-quote');
    
    // About quote
    addMobileHoverEffect('.about-quote');
    
    // Testimonial cards
    addMobileHoverEffect('.testimonial-card-inner');
    
    // Buttons
    addMobileHoverEffect('.btn-cta, .btn-cta-main, #Contattami, #iniziatquiz, #inziailtuoopercorso2, #inziailtuoopercorso3, #inziailtuoopercorso4, #RichiediInformazioni, #RichiediInformazioni2, #RichiediInformazioni3, #bntprenota, .btn-whatsapp, .btn-step-next, .btn-submit, #contact-submit-btn, #quiz-submit-btn');
    
    // Nav links
    addMobileHoverEffect('.nav-link, .mobile-links a, .btn-mobile');
    
    // Social icons
    addMobileHoverEffect('.socialContainer');
});

// Fix per iOS: previeni zoom su doppio tap
document.addEventListener('DOMContentLoaded', function() {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
});

/* ============================================
📜 CERTIFICATE TOGGLE FUNCTIONALITY
============================================ */
document.addEventListener('DOMContentLoaded', function() {
  const certBtn = document.querySelector('.btn-cert');
  const certContainer = document.getElementById('cert-image-container');
  const certOverlay = document.getElementById('cert-overlay');
  const certCloseBtn = document.getElementById('cert-close-btn');

  if (certBtn && certContainer) {
    
    // Toggle immagine al click sul pulsante
    certBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      certContainer.classList.toggle('active');
      certContainer.hidden = !certContainer.classList.contains('active');
      certContainer.setAttribute('aria-hidden', !certContainer.classList.contains('active'));
      
      // Prevenire scroll del body quando il modal è aperto
      document.body.style.overflow = certContainer.classList.contains('active') ? 'hidden' : '';
    });

    // Chiudi con il pulsante X
    if (certCloseBtn) {
      certCloseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        certContainer.classList.remove('active');
        certContainer.hidden = true;
        certContainer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    }

    // Chiudi cliccando sull'overlay (fuori dall'immagine)
    if (certOverlay) {
      certOverlay.addEventListener('click', function() {
        certContainer.classList.remove('active');
        certContainer.hidden = true;
        certContainer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    }

    // Chiudi con tasto ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && certContainer.classList.contains('active')) {
        certContainer.classList.remove('active');
        certContainer.hidden = true;
        certContainer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });

    // Prevenire chiusura cliccando dentro il box immagine
    const certBox = certContainer.querySelector('.cert-image-box');
    if (certBox) {
      certBox.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  }
});
