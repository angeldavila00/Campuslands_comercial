// ==========================================
// INITIALIZE — todo dentro de DOMContentLoaded
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
  initCountUp();
  initMapaScrollRotate();
  initAboutSlider();
  initFlipCards();
  initContactAnimation();
  initCarousel(); // ✅ FIX #2: movido dentro de DOMContentLoaded como función propia

  if (window.matchMedia('(min-width: 769px)').matches) {
    initParallax();
  }
});



// ==========================================
// EXPANDABLE CARDS (About Section)
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
// ==========================================
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
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
    '.impact-card',
    '.why-item',
    // '.plan-card' eliminado — ya no existe en el DOM. FIX #4
  ];

  document.querySelectorAll(animatedSelectors.join(', ')).forEach((el, index) => {
    // Las cards dentro del slider tienen su propia visibilidad — excluirlas
    // evita que queden en opacity:0 cuando el observer no las "ve" (están
    // clippeadas por overflow:hidden del slider y fuera del viewport).
    if (el.closest('.cards-slider')) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    const d = index * 0.03;
    el.style.transition = `opacity 0.35s ease ${d}s, transform 0.35s ease ${d}s`;
    observer.observe(el);
  });
}

// ==========================================
// NAVBAR SCROLL EFFECT
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
            navbar.style.background = 'rgba(94, 58, 226, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
          } else {
            navbar.style.background = 'rgba(94, 58, 226, 0.92)';
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
  // FIX #5: #navOverlay no existe en el HTML — el código ya usa ?. así que no
  // rompe, pero el overlay no funciona. Para activarlo añade al HTML justo
  // antes de </body>: <div id="navOverlay" class="nav-overlay"></div>
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('active');
    toggle.classList.remove('active');
    overlay?.classList.remove('active');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('active');
    toggle.classList.toggle('active');
    overlay?.classList.toggle('active');
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  overlay?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// ==========================================
// MODAL DE CONTACTO
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
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    openBtn.focus();
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

// ==========================================
// COUNT UP ANIMATION
// ==========================================
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const duration = 2000;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const getAffix = (el) => {
    const raw = el.textContent.trim();
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
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = Math.floor(eased * target);

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

// ==========================================
// MAPA SCROLL ROTATE
// ==========================================
function initMapaScrollRotate() {
  const mapa = document.querySelector('.paises-nombres');
  const section = document.querySelector('.section-methodology');

  if (!mapa || !section) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          const rotation = 180 + (progress * 360);
          mapa.style.transform =
            `translateX(var(--textX)) scale(var(--textScale)) rotate(${rotation}deg)`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ==========================================
// ABOUT CARDS SLIDER — drag mouse + touch
// ==========================================
function initAboutSlider() {
  const slider = document.querySelector('.cards-slider');
  const track = document.querySelector('.cards-track');
  const dotsContainer = document.querySelector('.cards-dots');
  if (!slider || !track) return;

  // FIX #1: las cards del slider fueron excluidas de initScrollAnimations
  // (que las dejaba en opacity:0 cuando el observer no las detectaba por
  // estar clippeadas). Aquí las garantizamos visibles desde el inicio.
  track.querySelectorAll('.about-card').forEach(card => {
    card.style.opacity = '1';
    card.style.transform = '';
    card.style.transition = '';
  });

  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let currentIndex = 0;

  // Ancho de una card + gap
  const getCardWidth = () => {
    const card = track.querySelector('.about-card');
    return card ? card.offsetWidth + 16 : 0; // 16px = 1rem gap
  };

  // FIX #2: calcula cuántas cards caben y así el índice máximo real.
  // Antes se clampeaba a total-1, lo que permitía posiciones con huecos vacíos.
  const getMaxIndex = () => {
    const cardW = getCardWidth();
    const visibleCount = cardW > 0
      ? Math.max(1, Math.floor(slider.offsetWidth / cardW))
      : 1;
    const total = track.querySelectorAll('.about-card').length;
    return Math.max(0, total - visibleCount);
  };

  // Regenera los dots según el número real de páginas
  const buildDots = () => {
    if (!dotsContainer) return;
    const maxIndex = getMaxIndex();
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('span');
      dot.className = 'cards-dot' + (i === currentIndex ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  };

  const syncDots = () => {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.cards-dot').forEach((d, i) =>
      d.classList.toggle('active', i === currentIndex)
    );
  };

  const goTo = (index) => {
    currentIndex = Math.max(0, Math.min(index, getMaxIndex()));
    track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
    syncDots();
  };

  // Construye dots iniciales
  buildDots();

  // Mouse drag
  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    track.style.transition = 'none';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    track.style.transform =
      `translateX(calc(-${currentIndex * getCardWidth()}px + ${currentX}px))`;
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    if (currentX < -60) goTo(currentIndex + 1);
    else if (currentX > 60) goTo(currentIndex - 1);
    else goTo(currentIndex);
    currentX = 0;
  });

  // Touch
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    track.style.transition = 'none';
  }, { passive: true });
  slider.addEventListener('touchmove', (e) => {
    currentX = e.touches[0].clientX - startX;
    track.style.transform =
      `translateX(calc(-${currentIndex * getCardWidth()}px + ${currentX}px))`;
  }, { passive: true });
  slider.addEventListener('touchend', () => {
    track.style.transition = '';
    if (currentX < -60) goTo(currentIndex + 1);
    else if (currentX > 60) goTo(currentIndex - 1);
    else goTo(currentIndex);
    currentX = 0;
  });

  // Recalcula en resize (cambia el nº de cards visibles y por tanto los dots)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
      track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
      buildDots();
    }, 150);
  });
}

// ==========================================
// FLIP CARDS — Click/tap para móvil
// ==========================================
function initFlipCards() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.flip-card[data-flip]');
    if (!card) return;

    const isFlipped = card.classList.contains('is-flipped');

    // Cierra todas las demás
    document.querySelectorAll('.flip-card[data-flip].is-flipped').forEach(c => {
      if (c !== card) c.classList.remove('is-flipped');
    });

    // Alterna la actual
    card.classList.toggle('is-flipped', !isFlipped);
  });
}

// ==========================================
// CARRUSEL DE SERVICIOS
// FIX #2: extraído a función e inicializado dentro de DOMContentLoaded
// ==========================================
function initCarousel() {
  const nextButton = document.getElementById('next');
  const prevButton = document.getElementById('prev');
  const carousel = document.querySelector('.carousel');
  const listHTML = document.querySelector('.carousel .list');

  // Salida segura si el carrusel no está en la página
  if (!nextButton || !prevButton || !carousel || !listHTML) return;

  let unAcceptClick;

  const showSlider = (type) => {
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';

    carousel.classList.remove('next', 'prev');
    const items = document.querySelectorAll('.carousel .list .item');

    if (type === 'next') {
      listHTML.appendChild(items[0]);
      carousel.classList.add('next');
    } else {
      listHTML.prepend(items[items.length - 1]);
      carousel.classList.add('prev');
    }

    clearTimeout(unAcceptClick);
    unAcceptClick = setTimeout(() => {
      nextButton.style.pointerEvents = 'auto';
      prevButton.style.pointerEvents = 'auto';
    }, 700);
  };

  nextButton.addEventListener('click', () => showSlider('next'));
  prevButton.addEventListener('click', () => showSlider('prev'));

  // Click en imagen también avanza el carrusel
  document.querySelectorAll('.carousel .list .item img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => showSlider('next'));
  });
}

function initContactAnimation() {
  const card = document.querySelector('.contact-card');
  if (!card) return;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) card.classList.add('is-visible');
  }, { threshold: 0.1 }).observe(card);
}