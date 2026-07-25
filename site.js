(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', theme); } catch (e) {}
    if (btn) {
      btn.dataset.theme = theme;
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      var label = btn.querySelector('.theme-toggle-label');
      if (label) label.textContent = theme === 'light' ? 'Dark' : 'Light';
    }
  }

  var saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch (e) {}
  applyTheme(saved === 'light' ? 'light' : 'dark');

  if (btn) {
    btn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  }

  document.querySelectorAll('[data-email-reveal]').forEach(function (root) {
    var slot = root.querySelector('.email-slot');
    var toggle = root.querySelector('.email-toggle');
    var address = root.querySelector('.email-address');
    if (!slot || !toggle || !address) return;

    function setOpen(open) {
      slot.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      address.setAttribute('aria-hidden', open ? 'false' : 'true');
      address.tabIndex = open ? 0 : -1;
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!slot.classList.contains('is-open'));
    });

    address.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && slot.classList.contains('is-open')) setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (slot.classList.contains('is-open') && !slot.contains(e.target)) setOpen(false);
    });
  });

  function headerOffset() {
    var header = document.querySelector('header');
    return header ? Math.ceil(header.getBoundingClientRect().height) : 84;
  }

  function syncHeaderOffset() {
    root.style.setProperty('--header-offset', headerOffset() + 'px');
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function scrollToId(hash, smooth) {
    var target = document.getElementById(hash);
    if (!target) return false;
    syncHeaderOffset();
    // Studies section starts at its top rule; CSS padding-top (gutter) creates air above the label.
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({
      top: Math.max(0, top),
      behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto'
    });
    return true;
  }

  function hashFromHref(href) {
    if (!href) return '';
    if (href.charAt(0) === '#') return href.slice(1);
    try {
      var u = new URL(href, window.location.href);
      var here = window.location.pathname.replace(/\/$/, '') || '/';
      var there = u.pathname.replace(/\/$/, '') || '/';
      // Same page, or links like index.html#contact from index.html /
      var onIndex = /(^|\/)(index\.html)?$/.test(here);
      var toIndex = /(^|\/)(index\.html)?$/.test(there);
      if (u.hash && (there === here || (onIndex && toIndex))) return u.hash.slice(1);
    } catch (err) {}
    return '';
  }

  syncHeaderOffset();
  window.addEventListener('resize', syncHeaderOffset);

  // In-page anchors (menu, footer, etc.)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var hash = hashFromHref(a.getAttribute('href'));
    if (!hash || !document.getElementById(hash)) return;
    e.preventDefault();
    if (menu && menu.classList.contains('open')) setMenuOpen(false);
    requestAnimationFrame(function () {
      scrollToId(hash, true);
      if (history.replaceState) history.replaceState(null, '', '#' + hash);
      else window.location.hash = hash;
    });
  });

  // Arrive with a hash (from another page or refresh)
  if (window.location.hash.length > 1) {
    var initial = window.location.hash.slice(1);
    window.setTimeout(function () { scrollToId(initial, false); }, 0);
  }

  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('menu');
  function setMenuOpen(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (burger && menu) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      setMenuOpen(!menu.classList.contains('open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setMenuOpen(false);
    });
    var logo = document.querySelector('header .logo');
    if (logo) {
      logo.addEventListener('click', function () { setMenuOpen(false); });
    }
  }

  // Lazy-load below-the-fold images; keep early/hero images eager.
  document.querySelectorAll('img').forEach(function (img, i) {
    if (img.hasAttribute('loading')) return;
    var eager = img.closest('.hero, .p-hero, .stack, .stack-wrap, header');
    if (eager || i < 2) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('decoding', 'async');
      return;
    }
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  /* ---------- Launch interactions ---------- */

  // 1) Carousel keyboard: ← / → while hovered or focused
  var activeCarousel = null;
  document.querySelectorAll('.block-carousel, .ba-carousel').forEach(function (carousel) {
    if (!carousel.hasAttribute('tabindex')) carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('aria-label', carousel.getAttribute('aria-label') || 'Image gallery');
    function activate() { activeCarousel = carousel; }
    function deactivate() { if (activeCarousel === carousel) activeCarousel = null; }
    carousel.addEventListener('mouseenter', activate);
    carousel.addEventListener('mouseleave', deactivate);
    carousel.addEventListener('focusin', activate);
    carousel.addEventListener('focusout', function (e) {
      if (!carousel.contains(e.relatedTarget)) deactivate();
    });
  });
  document.addEventListener('keydown', function (e) {
    if (!activeCarousel) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    var btn = activeCarousel.querySelector(
      e.key === 'ArrowLeft' ? '.carousel-prev' : '.carousel-next'
    );
    if (!btn) return;
    e.preventDefault();
    btn.click();
  });

  // 2) Case-study reading progress
  var caseRoot = document.querySelector('main.p-page, main#top');
  var caseSections = document.querySelectorAll('.case-section');
  if (caseRoot && caseSections.length) {
    var progress = document.createElement('div');
    progress.className = 'read-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
    function updateProgress() {
      var rect = caseRoot.getBoundingClientRect();
      var total = Math.max(1, caseRoot.scrollHeight - window.innerHeight);
      var scrolled = Math.min(total, Math.max(0, -rect.top));
      progress.style.width = ((scrolled / total) * 100).toFixed(2) + '%';
    }
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  // 3) Hover prefetch for internal project / study links
  var prefetched = Object.create(null);
  function prefetchHref(href) {
    if (!href || prefetched[href]) return;
    try {
      var u = new URL(href, window.location.href);
      if (u.origin !== window.location.origin) return;
      if (u.pathname === window.location.pathname) return;
    } catch (err) { return; }
    prefetched[href] = true;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  }
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0) return;
    if (/^(https?:)?\/\//i.test(href) && href.indexOf(window.location.origin) !== 0) return;
    a.addEventListener('pointerenter', function () { prefetchHref(a.href); }, { passive: true });
    a.addEventListener('focus', function () { prefetchHref(a.href); });
  });

  // 4) View Transitions for same-origin navigations (when supported)
  if (document.startViewTransition && !prefersReducedMotion()) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var url;
      try { url = new URL(a.href, window.location.href); }
      catch (err) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      e.preventDefault();
      document.startViewTransition(function () {
        window.location.href = url.href;
      });
    });
  }

  // 5) Selected Work cursor peek (home, desktop)
  var workList = document.querySelector('.work-list');
  if (workList && window.matchMedia && window.matchMedia('(min-width:901px)').matches && !prefersReducedMotion()) {
    var peek = document.createElement('div');
    peek.className = 'work-peek';
    peek.setAttribute('aria-hidden', 'true');
    var peekImg = document.createElement('img');
    peekImg.alt = '';
    peek.appendChild(peekImg);
    document.body.appendChild(peek);
    var peekRaf = 0;
    var peekX = 0;
    var peekY = 0;
    function placePeek() {
      peekRaf = 0;
      var w = peek.offsetWidth || 220;
      var h = peek.offsetHeight || 140;
      var x = Math.min(window.innerWidth - w - 16, peekX + 18);
      var y = Math.min(window.innerHeight - h - 16, peekY + 18);
      peek.style.setProperty('--peek-x', x + 'px');
      peek.style.setProperty('--peek-y', y + 'px');
    }
    workList.querySelectorAll('a.work-item').forEach(function (item) {
      var mediaImg = item.querySelector('.work-media img');
      if (!mediaImg) return;
      item.addEventListener('pointerenter', function () {
        peekImg.src = mediaImg.currentSrc || mediaImg.src;
        peek.classList.add('is-on');
      });
      item.addEventListener('pointerleave', function () {
        peek.classList.remove('is-on');
      });
      item.addEventListener('pointermove', function (e) {
        peekX = e.clientX;
        peekY = e.clientY;
        if (!peekRaf) peekRaf = requestAnimationFrame(placePeek);
      });
    });
  }
})();
