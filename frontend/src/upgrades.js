/* ================================================
   upgrades.js — scroll animations · BA slider · sticky CTA
   Підключай перед </body>:  <script src="./upgrades.js" defer></script>
   ================================================ */

(function () {
  'use strict';

  /* ─── 1. SCROLL ANIMATIONS ──────────────────── */
  // Додай data-reveal="up|down|left|right|scale|fade" до будь-якого елемента
  // Необов'язково: data-delay="1..5" для stagger всередині секцій

  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // анімація одноразова, як на Apple
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => obs.observe(el));
  }

  /* ─── 2. BEFORE / AFTER SLIDER ──────────────── */
  // HTML структура:
  //
  // <div class="ba-slider" id="my-slider">
  //   <img class="ba-slider__after"  src="after.jpg"  alt="Після">
  //   <div class="ba-slider__before-wrap">
  //     <img class="ba-slider__before" src="before.jpg" alt="До">
  //   </div>
  //   <div class="ba-slider__line"></div>
  //   <div class="ba-slider__handle"></div>
  //   <span class="ba-slider__label ba-slider__label--before">До</span>
  //   <span class="ba-slider__label ba-slider__label--after">Після</span>
  // </div>

  function initBASliders() {
    document.querySelectorAll('.ba-slider').forEach((slider) => {
      const wrap   = slider.querySelector('.ba-slider__before-wrap');
      const line   = slider.querySelector('.ba-slider__line');
      const handle = slider.querySelector('.ba-slider__handle');
      if (!wrap) return;

      let isDragging = false;

      function setPosition(clientX) {
        const rect = slider.getBoundingClientRect();
        let pct = ((clientX - rect.left) / rect.width) * 100;
        pct = Math.max(2, Math.min(98, pct)); // обмеження 2-98%

        wrap.style.width      = pct + '%';
        line.style.left       = pct + '%';
        handle.style.left     = pct + '%';
      }

      // Mouse
      slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        setPosition(e.clientX);
        e.preventDefault();
      });
      window.addEventListener('mousemove', (e) => {
        if (isDragging) setPosition(e.clientX);
      });
      window.addEventListener('mouseup', () => { isDragging = false; });

      // Touch
      slider.addEventListener('touchstart', (e) => {
        isDragging = true;
        setPosition(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (isDragging) setPosition(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchend', () => { isDragging = false; });
    });
  }

  /* ─── 3. STICKY CTA ─────────────────────────── */
  // HTML:
  //
  // <div class="sticky-cta" id="sticky-cta">
  //   <a href="#contact" class="sticky-cta__btn">
  //     <span class="sticky-cta__dot"></span>
  //     Безкоштовна консультація
  //   </a>
  // </div>
  //
  // Кнопка з'являється після того, як користувач
  // проскролив більше одного екрану вниз.

  function initStickyCTA() {
    const cta = document.getElementById('sticky-cta');
    if (!cta) return;

    let ticking = false;

    function update() {
      const scrolled = window.scrollY > window.innerHeight * 0.8;
      cta.classList.toggle('sticky-cta--visible', scrolled);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update(); // перевірка при завантаженні
  }

  /* ─── INIT ───────────────────────────────────── */
  function init() {
    initReveal();
    initBASliders();
    initStickyCTA();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
