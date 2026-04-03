/**
 * THE GRAND HERITAGE RESORT — script.js
 * Fixes: blur, mobile nav, tilt, gallery lightbox, scroll reveal
 * Pure JS, no heavy libraries, 60fps target
 */
(function () {
  'use strict';

  const qs  = (s, c = document) => c.querySelector(s);
  const qsa = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  /* ============================================================
     1. SCROLL PROGRESS BAR
     ============================================================ */
  function initProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (dh > 0 ? window.scrollY / dh * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ============================================================
     2. CUSTOM CURSOR (desktop only)
     ============================================================ */
  function initCursor() {
    if (window.innerWidth <= 768) return;
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = -200, my = -200, rx = -200, ry = -200;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function animRing() {
      rx = lerp(rx, mx, .16); ry = lerp(ry, my, .16);
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();
    qsa('a,button,[data-tilt],.room-card,.amen-card,.testi-card,.g-item,.sig-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  }

  /* ============================================================
     3. NAVBAR — scroll + mobile hamburger
     ============================================================ */
  function initNavbar() {
    const nav  = qs('#navbar');
    const ham  = qs('#hamburger');
    const mob  = qs('#mobileMenu');
    const cls  = qs('#mobileClose');
    if (!nav) return;

    // Scroll detection
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
    nav.classList.toggle('scrolled', window.scrollY > 80);

    // Hamburger toggle
    if (ham && mob) {
      ham.addEventListener('click', () => {
        const open = mob.classList.toggle('open');
        ham.classList.toggle('open', open);
        ham.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('menu-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
    }
    if (cls) {
      cls.addEventListener('click', closeMenu);
    }
    // Close on overlay click
    if (mob) {
      mob.addEventListener('click', e => {
        if (e.target === mob) closeMenu();
      });
    }

    function closeMenu() {
      mob && mob.classList.remove('open');
      ham && ham.classList.remove('open');
      ham && ham.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
    window.closeMobile = closeMenu;

    // Active link
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const map  = { 'index.html':'nav-home','stay.html':'nav-stay','experiences.html':'nav-exp','gallery.html':'nav-gallery','contact.html':'nav-contact' };
    const el   = qs('#' + (map[page] || 'nav-home'));
    if (el) el.classList.add('active');
  }

  /* ============================================================
     4. HERO PARALLAX — multi-layer, smooth, NO BLUR
     ============================================================ */
  function initHeroParallax() {
    const bg      = qs('.hero-bg');
    const overlay = qs('.hero-overlay');
    const content = qs('.hero-content');
    if (!bg) return;

    // FIX: remove any blur that was applied
    bg.style.filter = 'none';
    if (overlay) overlay.style.backdropFilter = 'none';
    if (content) {
      // Remove hero-glass element if present
      const glass = qs('.hero-glass');
      if (glass) glass.remove();
      content.style.backdropFilter = 'none';
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroH = qs('.hero')?.offsetHeight || window.innerHeight;
        if (bg)      bg.style.transform      = `scale(1.06) translateY(${y * 0.22}px)`;
        if (overlay) overlay.style.transform = `translateY(${y * 0.14}px)`;
        if (content) {
          content.style.transform = `translateY(${y * -0.07}px)`;
          content.style.opacity   = clamp(1 - y / (heroH * 0.52), 0, 1);
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  /* ============================================================
     5. HERO TEXT — staggered load animation
     ============================================================ */
  function initHeroLoad() {
    qsa('.hero-label,.hero-title,.hero-sub,.hero-btns,.scroll-ind').forEach((el, i) => {
      el.style.cssText += `opacity:0;transform:translateY(26px);transition:opacity .9s cubic-bezier(0.23,1,0.32,1),transform .9s cubic-bezier(0.23,1,0.32,1);transition-delay:${i * 0.17 + 0.05}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      }));
    });
  }

  /* ============================================================
     6. SCROLL REVEAL
     ============================================================ */
  function initScrollReveal() {
    const els = qsa('.sr,.sr-left,.sr-right,.fade-in,.fade-in-delay-1,.fade-in-delay-2');
    const io  = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          // Trigger section dividers
          qsa('.section-divider', e.target.parentElement || document).forEach(d => {
            if (d.classList.contains('animated')) return;
            const dr = d.getBoundingClientRect();
            if (dr.top < window.innerHeight) d.classList.add('animated');
          });
          // Heritage corners
          qsa('.heritage-corner', e.target.closest('.heritage-inner') || document).forEach(c => {
            c.classList.add('drawn');
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -55px 0px' });
    els.forEach(el => io.observe(el));

    // Also trigger dividers independently
    const dios = qsa('.section-divider');
    const dio  = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('animated'); dio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    dios.forEach(d => dio.observe(d));
  }

  /* ============================================================
     7. ROOM CARD STAGGER (scroll-triggered)
     ============================================================ */
  function initRoomStagger() {
    const cards = qsa('.room-card,.rooms-grid > *');
    if (!cards.length) return;
    cards.forEach((c, i) => {
      c.style.cssText += `opacity:0;transform:translateY(48px) scale(.97);transition:opacity .75s cubic-bezier(0.23,1,0.32,1),transform .75s cubic-bezier(0.23,1,0.32,1);transition-delay:${i * 0.1}s`;
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(c => io.observe(c));
  }

  /* ============================================================
     8. 3D TILT (mouse, desktop only)
     ============================================================ */
  function initTilt() {
    if (window.innerWidth <= 768) return;
    const CARDS = qsa('[data-tilt],.room-card,.amen-card,.testi-card,.sig-card,.tl-icon,.g-item');

    CARDS.forEach(card => {
      const MAX = parseFloat(card.dataset.tiltMax || 10);
      let raf;

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform .1s linear, box-shadow .4s';
      });
      card.addEventListener('mousemove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r  = card.getBoundingClientRect();
          const cx = r.left + r.width  / 2;
          const cy = r.top  + r.height / 2;
          const dx = (e.clientX - cx) / (r.width  / 2);
          const dy = (e.clientY - cy) / (r.height / 2);
          const rotY =  clamp(dx * MAX, -MAX, MAX);
          const rotX = -clamp(dy * MAX, -MAX, MAX);
          const sx   = clamp(dx * 18, -18, 18);
          const sy   = clamp(dy * 18, -18, 18) + 14;
          card.style.transform  = `perspective(950px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
          card.style.boxShadow  = `${sx}px ${sy}px 40px rgba(0,0,0,.3),0 0 0 1px rgba(212,175,55,.09)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        card.style.transition = 'transform .65s cubic-bezier(0.23,1,0.32,1),box-shadow .55s';
        card.style.transform  = 'perspective(950px) rotateX(0) rotateY(0) scale(1)';
        card.style.boxShadow  = '';
      });
    });
  }

  /* ============================================================
     9. BUTTON RIPPLE
     ============================================================ */
  function initRipple() {
    qsa('.btn-gold,.btn-outline,.btn-wa,.nav-cta').forEach(btn => {
      btn.addEventListener('click', e => {
        const r = document.createElement('span');
        r.className = 'btn-ripple';
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
        btn.style.overflow = 'hidden'; btn.style.position = 'relative';
        btn.appendChild(r);
        setTimeout(() => r.remove(), 700);
      });
    });
  }

  /* ============================================================
     10. SECTION PARALLAX (exp-section bg)
     ============================================================ */
  function initSectionParallax() {
    const secs = qsa('.exp-section,.parallax-section');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        secs.forEach(sec => {
          const r = sec.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          const prog = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          const bg   = sec.querySelector('.exp-bg,.parallax-bg');
          if (bg) bg.style.transform = `translateY(${clamp((prog - .5) * 55, -35, 35)}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  /* ============================================================
     11. GALLERY — filter + lightbox + scroll reveal + swipe
     ============================================================ */
  function initGallery() {
    /* ---- Filter ---- */
    const btns  = qsa('.filter-btn');
    const items = qsa('.g-item');
    if (btns.length) {
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.textContent.trim().toLowerCase();
          items.forEach((item, i) => {
            const icat = (item.dataset.category || '').toLowerCase();
            const show = cat === 'all' || icat === cat;
            item.style.transition = `opacity .4s, transform .4s`;
            if (show) {
              item.style.display = '';
              setTimeout(() => {
                item.style.opacity    = '1';
                item.style.transform  = '';
                item.style.pointerEvents = 'auto';
              }, 50);
            } else {
              item.style.opacity    = '0';
              item.style.transform  = 'scale(.88)';
              item.style.pointerEvents = 'none';
              setTimeout(() => {
                if (item.style.opacity === '0') item.style.display = 'none';
              }, 400);
            }
          });
        });
      });
    }

    /* ---- Scroll reveal stagger ---- */
    items.forEach((item, i) => {
      item.style.opacity   = '0';
      item.style.transform = 'translateY(40px) scale(.96)';
      item.style.transition= `opacity .7s cubic-bezier(0.23,1,0.32,1) ${i * 0.06}s,transform .7s cubic-bezier(0.23,1,0.32,1) ${i * 0.06}s`;
    });
    const gio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity   = '1';
          e.target.style.transform = '';
          gio.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach(item => gio.observe(item));

    /* ---- Lightbox ---- */
    const lb      = qs('#lightbox');
    const lbImg   = qs('#lightboxImg');
    const lbCap   = qs('#lightboxCaption');
    const lbClose = qs('#lightboxClose');
    const lbPrev  = qs('#lightboxPrev');
    const lbNext  = qs('#lightboxNext');
    if (!lb) return;

    let current = 0;
    const visibleItems = () => items.filter(i => parseFloat(i.style.opacity || 1) > 0.5);

    function openLb(idx) {
      const vis = visibleItems();
      current = ((idx % vis.length) + vis.length) % vis.length;
      const item = vis[current];
      const img  = item.querySelector('.g-img');
      const name = (item.querySelector('.g-overlay-name') || {}).textContent || '';
      const cat  = (item.querySelector('.g-overlay-cat')  || {}).textContent || '';

      // If it's an actual img element
      if (img && img.tagName === 'IMG') {
        if (lbImg) { lbImg.innerHTML = ''; const i = new Image(); i.src = img.src; i.style.cssText = 'max-width:90vw;max-height:82vh;object-fit:contain;'; lbImg.appendChild(i); }
      } else {
        // Placeholder — show the emoji/text
        if (lbImg) lbImg.innerHTML = img ? img.innerHTML : '';
      }
      if (lbCap) lbCap.textContent = name + (cat ? ' · ' + cat : '');
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    function navLb(dir) { openLb(current + dir); }

    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        const vis = visibleItems();
        const idx = vis.indexOf(item);
        openLb(idx >= 0 ? idx : i);
      });
    });
    lbClose && lbClose.addEventListener('click', closeLb);
    lbPrev  && lbPrev.addEventListener('click',  () => navLb(-1));
    lbNext  && lbNext.addEventListener('click',  () => navLb(+1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')    closeLb();
      if (e.key === 'ArrowLeft') navLb(-1);
      if (e.key === 'ArrowRight')navLb(+1);
    });

    // Touch swipe
    let touchX = 0;
    lb.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) navLb(dx < 0 ? 1 : -1);
    });
  }

  /* ============================================================
     12. COUNTER ANIMATION
     ============================================================ */
  function initCounters() {
    qsa('[data-count]').forEach(el => {
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur    = 1600;
        const start  = performance.now();
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * ease) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        io.disconnect();
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function boot() {
    initProgress();
    initCursor();
    initNavbar();
    initHeroParallax();
    initHeroLoad();
    initScrollReveal();
    initRoomStagger();
    initTilt();
    initRipple();
    initSectionParallax();
    initGallery();
    initCounters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
