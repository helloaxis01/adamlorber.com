(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncBrowserChrome(theme) {
    // Keep meta/theme-color for Chrome/Android; iOS 26 Safari ignores it and
    // samples the fixed header’s opaque background-color instead.
    var color = theme === 'light' ? '#efeee9' : '#1a1a19';
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    root.style.backgroundColor = color;
    if (document.body) document.body.style.backgroundColor = color;

    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.parentNode.removeChild(m);
    });
    var meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    document.head.appendChild(meta);

    // Nudge Safari to re-sample the top fixed header after a theme toggle.
    var header = document.querySelector('header');
    if (header) {
      header.style.backgroundColor = color;
      var y = window.scrollY || 0;
      header.style.transform = 'translateZ(0) translateY(0.1px)';
      void header.offsetHeight;
      header.style.transform = '';
      if (y) window.scrollTo(0, y);
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', theme); } catch (e) {}
    syncBrowserChrome(theme);
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
    var header = document.getElementById('siteHeader') || document.querySelector('header');
    if (open) {
      // Measure while the scrollbar is still visible, then lock + pad.
      var sb = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = sb ? sb + 'px' : '';
      if (header) header.style.paddingRight = sb ? sb + 'px' : '';
    } else {
      // Clear pad and overflow together so the scrollbar return doesn’t nudge layout.
      document.body.style.paddingRight = '';
      if (header) header.style.paddingRight = '';
      document.body.style.overflow = '';
    }
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
  var prioritized = false;
  document.querySelectorAll('img').forEach(function (img, i) {
    if (img.hasAttribute('loading')) return;
    var eager = img.closest('.hero, .p-hero, .stack, .stack-wrap, header');
    // First case-study hero frame after .p-hero
    var caseHero = img.closest('.p-image') && img.closest('main') &&
      img.closest('.p-image').previousElementSibling &&
      img.closest('.p-image').previousElementSibling.classList.contains('p-hero');
    if (eager || caseHero || i < 2) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('decoding', 'async');
      if (!prioritized && (caseHero || eager || i === 0)) {
        img.setAttribute('fetchpriority', 'high');
        prioritized = true;
      }
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

  // 2) Case-study reading progress (fixed under sticky header)
  var caseRoot = document.querySelector('main.p-page, main#top');
  var caseSections = document.querySelectorAll('.case-section');
  if (caseRoot && caseSections.length) {
    var progress = document.createElement('div');
    progress.className = 'read-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
    var headerForProgress = document.querySelector('header');
    if (headerForProgress) headerForProgress.classList.add('has-read-progress');
    function updateProgress() {
      syncHeaderOffset();
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

  // 4) View Transitions: CSS @view-transition { navigation: auto } in site.css

  // 5) Case media fade-in on scroll
  if (!prefersReducedMotion()) {
    var revealNodes = document.querySelectorAll(
      '.case-block.block-image, .case-block.block-carousel, .case-block.block-gif, .case-block.block-gif-centered, .stats'
    );
    if (revealNodes.length && 'IntersectionObserver' in window) {
      var mediaIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          mediaIo.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealNodes.forEach(function (el) {
        el.classList.add('media-reveal');
        mediaIo.observe(el);
      });
    }
  }

  // 6) Stats count-up when metrics enter view
  (function () {
    if (prefersReducedMotion()) return;
    var nums = document.querySelectorAll('.stats .stat .num');
    if (!nums.length || !('IntersectionObserver' in window)) return;

    function parseStat(text) {
      var raw = (text || '').replace(/\u00a0/g, ' ').trim();
      var m = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
      if (!m) return null;
      return { prefix: m[1], value: parseFloat(m[2]), suffix: m[3], decimals: (m[2].split('.')[1] || '').length };
    }

    // textContent drops <br>, gluing "Membership" + "Growth". Keep markup.
    function statPlainText(html) {
      return String(html || '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function animateNum(el) {
      var html = el.innerHTML;
      var parsed = parseStat(statPlainText(html));
      if (!parsed || !isFinite(parsed.value)) return;
      var numMatch = html.match(/(\d+(?:\.\d+)?)/);
      if (!numMatch) return;
      var template = html.replace(numMatch[1], '{{N}}');
      var start = performance.now();
      var dur = 900;
      function render(display) {
        el.innerHTML = template.split('{{N}}').join(display);
      }
      function frame(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        var current = parsed.value * eased;
        var display = parsed.decimals
          ? current.toFixed(parsed.decimals)
          : String(Math.round(current));
        render(display);
        if (t < 1) requestAnimationFrame(frame);
        else render(parsed.decimals ? parsed.value.toFixed(parsed.decimals) : String(Math.round(parsed.value)));
      }
      render(parsed.decimals ? (0).toFixed(parsed.decimals) : '0');
      requestAnimationFrame(frame);
    }

    var statsIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.num').forEach(animateNum);
        statsIo.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    document.querySelectorAll('.stats').forEach(function (stats) {
      statsIo.observe(stats);
    });
  })();

  // Quiet LA weather for footer place line — Encino / Valley coords
  // (downtown runs cooler; Valley matches where Adam actually is).
  // Fail silent → "Made in sunny Los Angeles." only (hide temp line).
  (function () {
    var nodes = document.querySelectorAll('[data-la-weather]');
    if (!nodes.length) return;

    var CACHE_KEY = 'al-la-weather-encino1';
    var CACHE_MS = 30 * 60 * 1000;
    // Encino, San Fernando Valley
    var LA_LAT = 34.1592;
    var LA_LON = -118.5013;

    function applyTemp(tempF) {
      if (typeof tempF !== 'number' || !isFinite(tempF)) return;
      var line = "It's about " + Math.round(tempF) + '\u00B0 right now.';
      nodes.forEach(function (el) {
        el.textContent = line;
        el.hidden = false;
      });
    }

    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && cached.t && (Date.now() - cached.t) < CACHE_MS && typeof cached.temp === 'number') {
        applyTemp(cached.temp);
        return;
      }
    } catch (e) {}

    var url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + LA_LAT
      + '&longitude=' + LA_LON
      + '&current=temperature_2m'
      + '&temperature_unit=fahrenheit'
      + '&timezone=America%2FLos_Angeles';

    fetch(url, { credentials: 'omit' })
      .then(function (res) { if (!res.ok) throw new Error('weather'); return res.json(); })
      .then(function (data) {
        var temp = data && data.current && data.current.temperature_2m;
        if (typeof temp !== 'number') return;
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), temp: temp }));
        } catch (e) {}
        applyTemp(temp);
      })
      .catch(function () { /* keep Made in sunny Los Angeles. only */ });
  })();
})();
