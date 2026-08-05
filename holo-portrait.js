/**
 * Holo portrait foil — JS module
 * Zero-permission only (never DeviceOrientation / DeviceMotion).
 *
 * data-holo-demo values:
 *   ambient | hover-tilt | css-scroll  → CSS only (JS no-ops)
 *   js-scroll                          → scroll-driven foil
 *   pointer                            → pointer foil, no 3D tilt
 *   full                               → pointer foil + 3D tilt
 *   (absent)                           → production auto stack
 */
(function () {
  "use strict";

  var CSS_ONLY = { ambient: 1, "hover-tilt": 1, "css-scroll": 1 };

  function supportsViewTimeline() {
    try {
      return !!(window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()"));
    } catch (e) {
      return false;
    }
  }

  function initHoloPortrait(root) {
    var photo = root;
    if (!photo || photo.nodeType !== 1) {
      photo = document.querySelector("[data-holo]");
    }
    if (!photo || photo.dataset.holoReady === "1") return;
    photo.dataset.holoReady = "1";

    var demo = photo.getAttribute("data-holo-demo") || "";
    if (CSS_ONLY[demo]) {
      photo.dataset.holoMotion = "css-only:" + demo;
      return;
    }

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    var allowTilt = demo === "full" || demo === "";
    var forceJsScroll = demo === "js-scroll";
    var pointerOnly = demo === "pointer" || demo === "full";
    var production = demo === "";

    var targetX = 42;
    var targetY = 28;
    var targetAngle = 125;
    var curX = 42;
    var curY = 28;
    var curAngle = 125;
    var pointerInside = false;
    var scrollDriving = false;
    var raf = 0;
    var scrollTicking = false;
    var coarse = window.matchMedia("(pointer: coarse)");
    var narrow = window.matchMedia("(max-width: 900px)");
    var cssScroll = supportsViewTimeline();

    function preferScroll() {
      return forceJsScroll || ((production || demo === "js-scroll") && (coarse.matches || narrow.matches));
    }

    function useJsScroll() {
      if (forceJsScroll) return true;
      if (pointerOnly && !production) return false;
      return preferScroll() && !cssScroll;
    }

    function usePointer() {
      if (demo === "js-scroll") return false;
      if (pointerOnly || production) return true;
      return false;
    }

    function setVars() {
      photo.style.setProperty("--bg-x", curX.toFixed(2) + "%");
      photo.style.setProperty("--bg-y", curY.toFixed(2) + "%");
      photo.style.setProperty("--angle", curAngle.toFixed(2) + "deg");
      /* Map X into foil band travel so pointer motion is obvious */
      photo.style.setProperty("--foil-pos", curX.toFixed(2) + "%");
    }

    function setTilt(nx, ny) {
      if (!allowTilt) return;
      var ry = (nx - 0.5) * 12;
      var rx = (0.5 - ny) * 9;
      photo.style.setProperty("--rx", rx.toFixed(2) + "deg");
      photo.style.setProperty("--ry", ry.toFixed(2) + "deg");
    }

    function clearTilt() {
      photo.style.setProperty("--rx", "0deg");
      photo.style.setProperty("--ry", "0deg");
    }

    function setDriven(on) {
      photo.classList.toggle("is-holo-driven", on);
      if (!on) {
        photo.style.removeProperty("--bg-x");
        photo.style.removeProperty("--bg-y");
        photo.style.removeProperty("--angle");
        photo.style.removeProperty("--foil-pos");
      }
    }

    function tick() {
      raf = 0;
      if (!pointerInside && !scrollDriving) return;
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      curAngle += (targetAngle - curAngle) * 0.12;
      setVars();
      if (
        Math.abs(targetX - curX) > 0.05 ||
        Math.abs(targetY - curY) > 0.05 ||
        Math.abs(targetAngle - curAngle) > 0.05
      ) {
        raf = requestAnimationFrame(tick);
      }
    }

    function kick() {
      setDriven(true);
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function releaseIfIdle() {
      if (pointerInside || scrollDriving) return;
      setDriven(false);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function onPointer(e) {
      if (!usePointer()) return;
      var rect = photo.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var clientX = e.clientX;
      var clientY = e.clientY;
      if ((clientX == null || clientY == null) && e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      if (clientX == null || clientY == null) return;

      var nx = (clientX - rect.left) / rect.width;
      var ny = (clientY - rect.top) / rect.height;
      nx = Math.min(1, Math.max(0, nx));
      ny = Math.min(1, Math.max(0, ny));
      targetX = nx * 100;
      targetY = ny * 100;
      targetAngle = 90 + nx * 70 + ny * 25;
      setTilt(nx, ny);
      kick();
    }

    function scrollRoot() {
      var scroller = photo.closest("[data-holo-scroll]");
      return scroller || window;
    }

    function updateFromScroll() {
      scrollTicking = false;
      if (pointerInside || !useJsScroll()) {
        scrollDriving = false;
        releaseIfIdle();
        return;
      }

      var rect = photo.getBoundingClientRect();
      var root = scrollRoot();
      var vh = root === window
        ? window.innerHeight || 1
        : root.clientHeight || 1;
      var center = rect.top + rect.height * 0.5;
      if (root !== window) {
        var rootRect = root.getBoundingClientRect();
        center = rect.top - rootRect.top + rect.height * 0.5;
      }
      var progress = 1 - center / (vh + rect.height * 0.35);
      progress = Math.min(1, Math.max(0, progress));

      var inView = root === window
        ? rect.bottom > 0 && rect.top < vh
        : rect.bottom > root.getBoundingClientRect().top &&
          rect.top < root.getBoundingClientRect().bottom;

      scrollDriving = inView;
      if (!inView) {
        releaseIfIdle();
        return;
      }

      targetX = 22 + progress * 56;
      targetY = 18 + (1 - progress) * 48;
      targetAngle = 105 + progress * 70;
      photo.classList.toggle("is-holo-active", progress > 0.25 && progress < 0.85);
      kick();
    }

    function onScroll() {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateFromScroll);
      }
    }

    if (usePointer()) {
      photo.addEventListener("pointerenter", function (e) {
        pointerInside = true;
        scrollDriving = false;
        photo.classList.add("is-holo-active");
        onPointer(e);
      });
      photo.addEventListener("pointermove", onPointer);
      photo.addEventListener("pointerleave", function () {
        pointerInside = false;
        photo.classList.remove("is-holo-active");
        clearTilt();
        if (useJsScroll()) onScroll();
        else releaseIfIdle();
      });
      photo.addEventListener("touchend", clearTilt, { passive: true });
      photo.addEventListener("touchcancel", clearTilt, { passive: true });
      photo.addEventListener("touchmove", onPointer, { passive: true });
    }

    if (useJsScroll()) {
      var root = scrollRoot();
      root.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }

    photo.dataset.holoMotion = demo
      ? demo
      : cssScroll && preferScroll()
        ? "css-view-timeline"
        : useJsScroll()
          ? "js-scroll"
          : "css-ambient+pointer";

    reduce.addEventListener("change", function () {
      if (reduce.matches) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        setDriven(false);
        clearTilt();
        photo.classList.remove("is-holo-active");
      } else if (useJsScroll()) {
        onScroll();
      }
    });
  }

  function initAll() {
    document.querySelectorAll("[data-holo]").forEach(function (el) {
      initHoloPortrait(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.initHoloPortrait = initHoloPortrait;
})();
