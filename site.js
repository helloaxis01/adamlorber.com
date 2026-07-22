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

  document.querySelectorAll('.email-copy').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var email = el.getAttribute('data-email') || 'hello@adamlorber.com';
      var status = el.querySelector('.email-copy-status');
      function confirm() {
        el.classList.add('is-copied');
        if (status) status.textContent = 'Copied';
        clearTimeout(el._copyTimer);
        el._copyTimer = setTimeout(function () {
          el.classList.remove('is-copied');
          if (status) status.textContent = '';
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(confirm).catch(function () {
          window.location.href = 'mailto:' + email;
        });
      } else {
        window.location.href = 'mailto:' + email;
      }
    });
  });

  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    function setMenuOpen(open) {
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      setMenuOpen(!menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href') || '';
        var hash = '';
        if (href.charAt(0) === '#') hash = href.slice(1);
        else {
          try {
            var u = new URL(href, window.location.href);
            if (u.pathname.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '') && u.hash) {
              hash = u.hash.slice(1);
            }
          } catch (err) {}
        }
        setMenuOpen(false);
        if (!hash) return;
        var target = document.getElementById(hash);
        if (!target) return;
        e.preventDefault();
        // Wait for menu close / overflow unlock, then scroll under the fixed header
        requestAnimationFrame(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', '#' + hash);
          else window.location.hash = hash;
        });
      });
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
