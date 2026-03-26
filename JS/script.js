// ==========================================
// INITIALIZE — todo dentro de DOMContentLoaded
// ✅ lucide.createIcons() movido aquí porque el script ahora es `defer`
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initExpandableCards();
  initSmoothScroll();
  initScrollAnimations();
  initNavbarScroll();
  initMobileMenu();
  initModal();
  initPageTransition();
  initFlipStats();
  initCountUp();
  initMapaScrollRotate();
  initPlanCards(); // ✅ AÑADIDO: activa la animación de entrada de las plan-cards

  if (window.matchMedia('(min-width: 769px)').matches) {
    initParallax();
  }
});

// ==========================================
// PANTALLA AZUL DE TRANSICIÓN
// ==========================================
function initPageTransition() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  const barFill = overlay.querySelector('.transition-bar-fill');

  const ENTER_DURATION = 260;
  const VISIBLE_HOLD = 300;
  const LEAVE_DURATION = 240;

  let isAnimating = false;

  // ✅ Delegación de eventos: 1 solo listener en vez de N listeners
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a.nav-link[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href === '#' || isAnimating) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    isAnimating = true;

    overlay.classList.remove('is-leaving');
    overlay.classList.add('is-entering');

    setTimeout(() => {
      window.scrollTo({ top: target.offsetTop - 64, behavior: 'instant' });
      document.getElementById('navMenu')?.classList.remove('active');
      document.getElementById('navToggle')?.classList.remove('active');
    }, ENTER_DURATION + VISIBLE_HOLD);

    setTimeout(() => {
      overlay.classList.remove('is-entering');
      overlay.classList.add('is-leaving');
      if (barFill) barFill.style.transition = 'none';

      setTimeout(() => {
        overlay.classList.remove('is-leaving');
        if (barFill) {
          barFill.style.transition = '';
          barFill.style.width = '0%';
        }
        isAnimating = false;
      }, LEAVE_DURATION);
    }, ENTER_DURATION + VISIBLE_HOLD + 20);
  });
}

// ==========================================
// EXPANDABLE CARDS (About Section)
// ✅ Usa aria-expanded + hidden para accesibilidad correcta
// ✅ 1 solo listener delegado, sin clonación de nodos
// ==========================================
function initExpandableCards() {
  if (window.__expandableCardsDelegated) return;
  window.__expandableCardsDelegated = true;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-expand');
    if (!btn) return;

    const card = btn.closest('[data-expandable]');
    if (!card) return;

    const details = card.querySelector('.card-details');
    if (!details) return;

    e.preventDefault();

    const isExpanded = details.classList.contains('show');

    // Cierra todos
    document.querySelectorAll('[data-expandable]').forEach((c) => {
      const b = c.querySelector('.btn-expand');
      const d = c.querySelector('.card-details');
      if (b) {
        b.setAttribute('aria-expanded', 'false');
        b.innerHTML = 'Ver más <i data-lucide="chevron-down" aria-hidden="true"></i>';
        b.classList.remove('expanded');
      }
      if (d) d.classList.remove('show');
    });

    // Abre el actual si estaba cerrado
    if (!isExpanded) {
      btn.setAttribute('aria-expanded', 'true');
      btn.innerHTML = 'Ver menos <i data-lucide="chevron-down" aria-hidden="true"></i>';
      btn.classList.add('expanded');
      details.classList.add('show');
    }

    lucide.createIcons();
  });
}

// ==========================================
// SMOOTH SCROLL (links sin clase .nav-link)
// ==========================================
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]:not(.nav-link)');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) window.scrollTo({ top: target.offsetTop - 64, behavior: 'smooth' });
  });
}

// ==========================================
// SCROLL ANIMATIONS (Intersection Observer)
// ✅ unobserve después de animar (evita trabajo innecesario)
// ==========================================
function initScrollAnimations() {
  // ✅ Respeta prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target); // ✅ deja de observar tras animar
        }
      });
    },
    { threshold: 0.05, rootMargin: '-20px' }
  );

  const animatedSelectors = [
    '.about-card',
    '.stat-card',
    '.methodology-card',
    '.profile-card',
    '.plan-card',
    '.impact-card',
    '.why-item',
  ];

  document.querySelectorAll(animatedSelectors.join(', ')).forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    const d = index * 0.03;
    el.style.transition = `opacity 0.35s ease ${d}s, transform 0.35s ease ${d}s`;
    observer.observe(el);
  });
}

// ==========================================
// PLAN CARDS — Animación de entrada por dirección
// ✅ AÑADIDO: Las .plan-card de #services necesitan la clase
//    .is-visible para hacerse visibles (sin esto quedan opacity:0)
// ==========================================
function initPlanCards() {
  const cards = document.querySelectorAll('.section-services .plan-card');
  if (!cards.length) return;

  // Respeta prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach(card => card.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      // Usamos un pequeño delay escalonado para que entren una por una
      const visible = entries.filter(e => e.isIntersecting);
      visible.forEach((entry, i) => {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }, i * 120);
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach(card => observer.observe(card));
}

// ==========================================
// NAVBAR SCROLL EFFECT
// ✅ Usa requestAnimationFrame para no saturar el hilo principal
// ==========================================
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 100) {
            navbar.style.background = 'rgba(27, 32, 82, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
          } else {
            navbar.style.background = 'rgba(27, 32, 82, 0.92)';
            navbar.style.boxShadow = 'none';
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
}

// ==========================================
// MENÚ MÓVIL (HAMBURGUESA)
// ==========================================
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('active');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
  });
}

// ==========================================
// MODAL DE CONTACTO
// ✅ Gestión de foco para accesibilidad (focus trap básico)
// ==========================================
function initModal() {
  const modal = document.getElementById('contact-modal');
  const openBtn = document.getElementById('btnOpenModal');
  const closeBtn = modal?.querySelector('.modal-close');
  if (!modal || !openBtn || !closeBtn) return;

  const openModal = () => {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
    closeBtn.focus(); // ✅ mueve el foco al modal al abrirlo
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    openBtn.focus(); // ✅ devuelve el foco al botón que lo abrió
  };

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

// ==========================================
// PARALLAX SUTIL EN EL HERO
// ✅ requestAnimationFrame para suavizar + solo en desktop
// ==========================================
function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let ticking = false;

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          hero.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
}


function initFlipStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  // Hacer cada card "clickeable" + accesible por teclado
  grid.querySelectorAll('[data-flip]').forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');
  });

  const setFlipped = (card, flipped) => {
    card.classList.toggle('is-flipped', flipped);
    card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  };

  const closeAll = () => {
    grid.querySelectorAll('[data-flip].is-flipped').forEach((c) => setFlipped(c, false));
  };

  // Click: alterna flip (si clickeas en "Volver", vuelve al frente)
  grid.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.flip-close');
    if (closeBtn) {
      const card = closeBtn.closest('[data-flip]');
      if (card) setFlipped(card, false);
      return;
    }

    const card = e.target.closest('[data-flip]');
    if (!card) return;

    // Evita togglear si seleccionas texto en el back
    if (window.getSelection && String(window.getSelection()).length > 0) return;

    const willFlip = !card.classList.contains('is-flipped');

    // ✅ Opcional: solo 1 tarjeta abierta a la vez (recomendado)
    closeAll();

    setFlipped(card, willFlip);
  });

  // Teclado: Enter/Espacio alterna, Escape cierra
  grid.addEventListener('keydown', (e) => {
    const card = e.target.closest('[data-flip]');
    if (!card) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const willFlip = !card.classList.contains('is-flipped');

      // ✅ solo 1 abierta a la vez
      closeAll();

      setFlipped(card, willFlip);
    }

    if (e.key === 'Escape') {
      setFlipped(card, false);
      card.blur();
    }
  });

  // Cerrar si haces click fuera del grid
  document.addEventListener('click', (e) => {
    if (e.target.closest('#statsGrid [data-flip]')) return;
    closeAll();
  });
}

// ==========================================
// COUNT UP ANIMATION — Respeta prefijo/sufijo
// ==========================================
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const duration = 2000;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const getAffix = (el) => {
    const raw = el.textContent.trim();

    // Busca si el símbolo está antes o después del número
    const match = raw.match(/^([^0-9]*)[\d,]+([^0-9]*)$/);

    return {
      prefix: match ? match[1] : '',
      suffix: match ? match[2] : ''
    };
  };

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const { prefix, suffix } = getAffix(el);
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const value    = Math.floor(eased * target);

      el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(counter => observer.observe(counter));
}

function initMapaScrollRotate(){

  const mapa = document.querySelector('.paises-nombres');
  const section = document.querySelector('.section-methodology');

  if(!mapa || !section) return;

  let ticking = false;

  window.addEventListener('scroll', () => {

    if(!ticking){

      requestAnimationFrame(() => {

        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;

        // SOLO cuando la sección está visible
        if(sectionTop < windowHeight && sectionBottom > 0){

          const progress = (windowHeight - sectionTop) / (windowHeight + rect.height);

          const rotation = progress * 360;

          mapa.style.transform =
              `translateX(var(--textX)) scale(var(--textScale)) rotate(${rotation}deg)`;

        }

        ticking = false;

      });

      ticking = true;

    }

  }, { passive:true });

}

let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let carousel = document.querySelector('.carousel');
let listHTML = document.querySelector('.carousel .list');
let seeMoreButtons = document.querySelectorAll('.seeMore');
let backButton = document.getElementById('back');

nextButton.onclick = function(){
    showSlider('next');
}
prevButton.onclick = function(){
    showSlider('prev');
}
let unAcceppClick;
const showSlider = (type) => {
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';

    carousel.classList.remove('next', 'prev');
    let items = document.querySelectorAll('.carousel .list .item');
    if(type === 'next'){
        listHTML.appendChild(items[0]);
        carousel.classList.add('next');
    }else{
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add('prev');
    }
    clearTimeout(unAcceppClick);
    unAcceppClick = setTimeout(()=>{
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
    }, 2000)
}
seeMoreButtons.forEach((button) => {
    button.onclick = function(){
        carousel.classList.remove('next', 'prev');
        carousel.classList.add('showDetail');
    }
});
backButton.onclick = function(){
    carousel.classList.remove('showDetail');
}

