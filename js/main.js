document.addEventListener('DOMContentLoaded', () => {

  /* loader */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('is-hidden'), 350);
  });

  /* nav scroll state */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navLinks.style.cssText = open
      ? 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:rgba(7,26,46,.97);padding:24px 32px;gap:18px;backdrop-filter:blur(14px)'
      : '';
  });
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navLinks.style.cssText = '';
  }));

  /* parallax hero layers */
  const parallaxEls = document.querySelectorAll('[data-speed]');
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

  function applyScrollParallax() {
    if (reduceMotion) return;
    const y = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.2;
      el.style.transform = `translate3d(${targetX * speed * 40}px, ${y * speed * -0.25 + targetY * speed * 40}px, 0)`;
    });
  }
  document.addEventListener('scroll', applyScrollParallax, { passive: true });

  if (isFinePointer && !reduceMotion) {
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    });
    (function raf() {
      targetX += (mouseX - targetX) * 0.06;
      targetY += (mouseY - targetY) * 0.06;
      applyScrollParallax();
      requestAnimationFrame(raf);
    })();
  } else {
    applyScrollParallax();
  }

  /* scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* counters */
  const counters = document.querySelectorAll('.stat__num');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimal || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => countIO.observe(el));

  /* footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll progress bar ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateProgress() {
    if (!scrollProgress) return;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- cursor spotlight (reveals hidden grid) ---------- */
  const spotlight = document.getElementById('spotlight');
  if (spotlight && isFinePointer && !reduceMotion) {
    const root = document.documentElement;
    window.addEventListener('mousemove', (e) => {
      root.style.setProperty('--sx', e.clientX + 'px');
      root.style.setProperty('--sy', e.clientY + 'px');
      const overDark = e.target.closest('.hero, .values, .location');
      spotlight.classList.toggle('is-active', !!overDark);
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll('.btn--lg').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${(mx * 0.25).toFixed(1)}px, ${(my * 0.35).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- scramble / decode text ---------- */
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&+';
  function scrambleText(el, finalText, duration) {
    const chars = finalText.split('');
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const revealCount = Math.floor(progress * chars.length);
      let out = '';
      for (let i = 0; i < chars.length; i++) {
        if (i < revealCount || chars[i] === ' ') out += chars[i];
        else out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
      }
      el.textContent = out;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }

  if (!reduceMotion) {
    document.querySelectorAll('.scramble').forEach(el => { el.dataset.text = el.textContent; });
    const scrambleIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scrambleText(entry.target, entry.target.dataset.text, 650);
          scrambleIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.scramble').forEach(el => scrambleIO.observe(el));

    if (isFinePointer) {
      document.querySelectorAll('.nav__links a').forEach(el => {
        el.dataset.text = el.textContent;
        el.addEventListener('mouseenter', () => scrambleText(el, el.dataset.text, 380));
      });
    }
  }

  /* ---------- custom cursor ---------- */
  const cursorRing = document.getElementById('cursorRing');
  const cursorDot = document.getElementById('cursorDot');
  if (isFinePointer && !reduceMotion && cursorRing && cursorDot) {
    document.body.classList.add('has-cursor-fx');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    cursorDot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    });

    document.querySelectorAll('a, button, .service-card, .value-card, .partner-card, .hero__scroll').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
    });

    (function cursorLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(cursorLoop);
    })();
  }

  /* ---------- 3D tilt-on-hover cards ---------- */
  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll('.partner-card, .value-card, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => { el.style.transition = 'none'; });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateZ(12px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .6s var(--ease)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- hero 3D logo stage ---------- */
  const heroSection = document.querySelector('.hero');
  const stage = document.getElementById('stage3d');
  const scene = document.getElementById('scene3d');
  const stageHint = document.getElementById('stageHint');

  if (heroSection && stage && scene) {
    if (reduceMotion) {
      scene.style.transform = 'rotateX(0deg) rotateY(0deg)';
    } else {
      let tmx = 0, tmy = 0, smx = 0, smy = 0, autoT = 0, hintHidden = false;

      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        tmx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        tmy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        if (!hintHidden) { stageHint?.classList.add('is-hidden'); hintHidden = true; }
      });
      heroSection.addEventListener('mouseleave', () => { tmx = 0; tmy = 0; });
      heroSection.addEventListener('touchstart', () => {
        if (!hintHidden) { stageHint?.classList.add('is-hidden'); hintHidden = true; }
      }, { passive: true });

      (function tiltLoop() {
        smx += (tmx - smx) * 0.06;
        smy += (tmy - smy) * 0.06;
        autoT += 0.005;
        const autoRotY = Math.sin(autoT) * 7;
        const rotY = smx * 24 + autoRotY;
        const rotX = -smy * 16;
        scene.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        requestAnimationFrame(tiltLoop);
      })();

      function stageScrollTransform() {
        const rect = heroSection.getBoundingClientRect();
        const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
        const scale = 1 - progress * 0.55;
        const rotY = progress * 260;
        const translateY = progress * -70;
        stage.style.transform = `translateY(${translateY}px) scale(${scale}) rotateY(${rotY}deg)`;
        stage.style.opacity = String(Math.max(1 - progress * 1.2, 0));
      }
      document.addEventListener('scroll', stageScrollTransform, { passive: true });
      stageScrollTransform();
    }
  }

  /* ---------- service request modal ---------- */
  const modal = document.getElementById('serviceModal');
  const modalTitle = document.getElementById('modalTitle');
  const serviceForm = document.getElementById('serviceForm');
  const svcNameInput = document.getElementById('svcName');
  const svcDescInput = document.getElementById('svcDesc');
  let currentService = '';

  function openServiceModal(name) {
    currentService = name;
    modalTitle.textContent = name;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => svcNameInput?.focus(), 300);
  }
  function closeServiceModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    serviceForm.reset();
  }

  document.querySelectorAll('.service-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    const name = card.dataset.service || card.querySelector('h3')?.textContent.trim() || 'Serviço';
    card.addEventListener('click', () => openServiceModal(name));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openServiceModal(name); }
    });
  });

  modal?.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeServiceModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeServiceModal();
  });

  serviceForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = svcNameInput.value.trim();
    const descricao = svcDescInput.value.trim();
    const msg = `Olá! Meu nome é ${nome}.\nTenho interesse em: ${currentService}.\n\nO que preciso: ${descricao}`;
    window.open(`https://wa.me/5562999589437?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    closeServiceModal();
  });

});
