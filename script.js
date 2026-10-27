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

  /* ---------- Lien actif selon la section visible ----------
     Sert au menu de l'accueil et au sommaire des pages projet. */
  function watchSections(sections, links) {
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

  function initActiveNav() {
    watchSections(
      document.querySelectorAll("main section[id]"),
      document.querySelectorAll(".site-nav a[href^='#']")
    );
    watchSections(
      document.querySelectorAll(".detail-section[id]"),
      document.querySelectorAll(".detail-toc a[href^='#']")
    );
  }

  /* ---------- Année dans le footer ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Emplacements de captures ----------
     Chaque vignette pointe vers un fichier attendu (assets/projets/...).
     Tant que ce fichier n'existe pas, la vignette est retirée : le site
     reste propre en ligne. Avec ?captures dans l'URL, les emplacements
     manquants restent visibles avec le nom du fichier à déposer. Sur une
     page projet, la première capture disponible devient l'image principale ;
     sur l'accueil, chaque carte a sa propre image (.project__cover). */
  function whenSettled(img, callback) {
    if (img.complete && img.getAttribute("src")) {
      callback(img.naturalWidth > 0);
      return;
    }
    img.addEventListener("load", function () { callback(true); });
    img.addEventListener("error", function () { callback(false); });
  }

  function initShots() {
    var showSlots = /[?&]captures/.test(window.location.search);

    document.querySelectorAll(".project__cover").forEach(function (img) {
      whenSettled(img, function (ok) {
        if (!ok) {
          img.remove();
          return;
        }
        var media = img.closest(".project__media");
        var placeholder = media.querySelector("span");
        if (placeholder) placeholder.remove();
        img.classList.add("is-loaded");
        media.classList.add("project__media--shot");
      });
    });

    document.querySelectorAll(".project__thumbs").forEach(function (group) {
      var thumbs = group.querySelectorAll(".project__thumb");
      var scope = group.closest(".project, .detail") || document;
      var pending = thumbs.length;

      function finish() {
        var hasShots = !!group.querySelector(".project__thumb");
        if (!hasShots) group.hidden = true;
        var empty = scope.querySelector(".gallery__empty");
        if (empty) empty.hidden = hasShots;
        // Page projet sans aucune capture : pas de grand bloc « à venir » en tête
        var coverBlock = scope.querySelector(".detail-cover");
        if (coverBlock && !hasShots && !showSlots) coverBlock.hidden = true;

        var media = scope.querySelector(".project__media");
        var first = group.querySelector(".project__thumb.is-loaded img");
        if (!media || !first || media.querySelector("img")) return;
        var cover = document.createElement("img");
        cover.src = first.src;
        cover.alt = "";
        media.innerHTML = "";
        media.appendChild(cover);
        media.classList.add("project__media--shot");
        // Clic sur l'image principale = ouvre la galerie sur la première capture
        // (la vignette reste le point d'entrée clavier, l'image étant décorative).
        media.addEventListener("click", function () {
          first.closest(".project__thumb").click();
        });
      }

      if (!pending) finish();

      thumbs.forEach(function (btn) {
        var img = btn.querySelector("img");
        whenSettled(img, function (ok) {
          if (ok) {
            btn.classList.add("is-loaded");
          } else if (showSlots) {
            var label = document.createElement("span");
            label.className = "project__thumb-slot";
            label.textContent = img.getAttribute("alt") + " — " + img.getAttribute("src");
            btn.classList.add("project__thumb--missing");
            btn.disabled = true;
            btn.appendChild(label);
          } else {
            btn.remove();
          }
          pending--;
          if (!pending) finish();
        });
      });
    });
  }

  /* ---------- Lightbox (aperçu des captures projets) ----------
     Une seule lightbox partagée : n'importe quel groupe .project__thumbs
     de la page peut l'ouvrir, avec navigation (flèches, points, tactile,
     clavier) entre toutes les vignettes de son groupe. Fermeture par la
     croix, un clic hors de l'image, ou Échap — le focus revient ensuite
     sur la vignette cliquée pour ne pas perdre le clavier utilisateur. */
  function initLightbox() {
    var lightbox = document.getElementById("lightbox");
    var groups = document.querySelectorAll(".project__thumbs");
    if (!lightbox || !groups.length) return;

    var imgEl = lightbox.querySelector(".lightbox__img");
    var dotsWrap = lightbox.querySelector(".lightbox__dots");
    var statusEl = lightbox.querySelector(".lightbox__status");
    var captionEl = lightbox.querySelector(".lightbox__caption");
    var prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    var nextBtn = lightbox.querySelector(".lightbox__nav--next");
    var closeBtn = lightbox.querySelector(".lightbox__close");
    var closeEls = lightbox.querySelectorAll("[data-lightbox-close]");

    var images = [];
    var index = 0;
    var lastFocused = null;

    function renderDots() {
      dotsWrap.innerHTML = "";
      images.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "lightbox__dot";
        dot.setAttribute("aria-label", "Image " + (i + 1) + " / " + images.length);
        dot.addEventListener("click", function () {
          show(i);
        });
        dotsWrap.appendChild(dot);
      });
    }

    function show(i) {
      index = (i + images.length) % images.length;
      var item = images[index];
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      if (captionEl) captionEl.textContent = item.alt;

      Array.prototype.forEach.call(dotsWrap.children, function (dot, di) {
        var active = di === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });

      if (statusEl) {
        var isEn = document.documentElement.getAttribute("lang") === "en";
        statusEl.textContent = isEn
          ? "Image " + (index + 1) + " of " + images.length
          : "Image " + (index + 1) + " sur " + images.length;
      }
    }

    function onKeydown(event) {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        show(index - 1);
      } else if (event.key === "ArrowRight") {
        show(index + 1);
      }
    }

    function open(list, startIndex, trigger) {
      images = list;
      lastFocused = trigger || document.activeElement;
      renderDots();
      show(startIndex);
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      document.addEventListener("keydown", onKeydown);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    closeEls.forEach(function (el) {
      el.addEventListener("click", close);
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { show(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1); });

    // Balayage tactile basique sur l'image affichée.
    var touchStartX = null;
    imgEl.addEventListener("touchstart", function (event) {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });
    imgEl.addEventListener("touchend", function (event) {
      if (touchStartX === null) return;
      var delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) show(delta < 0 ? index + 1 : index - 1);
      touchStartX = null;
    });

    groups.forEach(function (group) {
      group.addEventListener("click", function (event) {
        var btn = event.target.closest(".project__thumb.is-loaded");
        if (!btn) return;
        // Relit les vignettes et src/alt au moment du clic : seules les
        // captures réellement présentes comptent, et l'alt suit la langue
        // active (l'i18n a pu le changer depuis le chargement de la page).
        var thumbs = Array.prototype.slice.call(group.querySelectorAll(".project__thumb.is-loaded"));
        var list = thumbs.map(function (b) {
          var img = b.querySelector("img");
          return { src: img.src, alt: img.alt };
        });
        open(list, thumbs.indexOf(btn), btn);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoader();
    initNavToggle();
    initScrollReveal();
    initActiveNav();
    initYear();
    initShots();
    initLightbox();
  });
})();
