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
    var toggle = root.querySelector('.email-toggle');
    var panel = root.querySelector('.email-panel');
    var copyBtn = root.querySelector('.email-panel-copy');
    var email = root.getAttribute('data-email') || 'hello@adamlorber.com';
    if (!toggle || !panel || !copyBtn) return;

    function setOpen(open) {
      panel.hidden = !open;
      panel.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) {
        clearTimeout(copyBtn._copyTimer);
        copyBtn.classList.remove('is-copied');
        copyBtn.textContent = 'Copy';
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(panel.hidden);
    });

    copyBtn.addEventListener('click', function () {
      function confirmCopied() {
        copyBtn.classList.add('is-copied');
        copyBtn.textContent = 'Copied';
        clearTimeout(copyBtn._copyTimer);
        copyBtn._copyTimer = setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          copyBtn.textContent = 'Copy';
        }, 1600);
      }

      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = email;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
        if (ok) confirmCopied();
        else window.location.href = 'mailto:' + email;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(confirmCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!panel.hidden && !root.contains(e.target)) setOpen(false);
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
})();
