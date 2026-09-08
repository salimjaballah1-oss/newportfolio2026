/* ===================================================================
   Portfolio — Salim Jaballah
   Aucune dépendance externe : loader, navigation mobile, révélation
   au scroll, et respect de prefers-reduced-motion.
   =================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Loader ---------- */
  function initLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;

    // On ne rejoue le loader qu'une fois par session, pour ne pas
    // gêner un jury qui recharge/navigue plusieurs fois sur le site.
    var alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem("portfolio-loader-seen") === "1";
    } catch (e) {
      /* stockage indisponible (navigation privée) : on rejoue le loader */
    }

    if (prefersReducedMotion || alreadySeen) {
      loader.classList.add("is-hidden");
      loader.setAttribute("hidden", "");
      return;
    }

    var letters = loader.querySelectorAll(".loader__name span");
    letters.forEach(function (letter, index) {
      letter.style.animationDelay = index * 0.02 + "s";
    });

    var totalDelay = letters.length * 20 + 500; // ms

    window.setTimeout(function () {
      loader.classList.add("is-hidden");
      window.setTimeout(function () {
        loader.setAttribute("hidden", "");
      }, 500);
      try {
        sessionStorage.setItem("portfolio-loader-seen", "1");
      } catch (e) {
        /* pas grave si indisponible */
      }
    }, totalDelay);
  }

  /* ---------- Navigation mobile ---------- */
  function initNavToggle() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Révélation au scroll ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ---------- Lien de nav actif selon la section visible ---------- */
  function initActiveNav() {
    var sections = document.querySelectorAll("main section[id]");
    var links = document.querySelectorAll(".site-nav a[href^='#']");
    if (!sections.length || !links.length || !("IntersectionObserver" in window)) {
      return;
    }

    var linkBySection = {};
    links.forEach(function (link) {
      linkBySection[link.getAttribute("href").slice(1)] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkBySection[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.removeAttribute("aria-current");
            });
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------- Année dans le footer ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoader();
    initNavToggle();
    initScrollReveal();
    initActiveNav();
    initYear();
  });
})();
