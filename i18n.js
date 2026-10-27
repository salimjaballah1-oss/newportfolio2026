/* ===================================================================
   Portfolio — Salim Jaballah — i18n (FR / EN)

   Le français reste la source de vérité directement dans le HTML :
   on met simplement en cache le contenu original de chaque élément
   marqué [data-i18n] au chargement, puis on bascule entre ce cache
   (FR) et le dictionnaire ci-dessous (EN). Pas de duplication du
   français à maintenir à deux endroits.
   =================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "portfolio-lang";

  var EN = {
    skip: "Skip to content",

    "nav.open": "Open menu",
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.apprenticeship": "Apprenticeship",
    "nav.projects": "Projects",
    "nav.e5": "E5 Path",
    "nav.contact": "Contact",

    "hero.eyebrow": "BTS SIO Student — SLAM track",
    "hero.title1": "Developer",
    "hero.title2": "& automation.",
    "hero.lead": "Currently in my 2<sup>nd</sup> year of BTS SIO (2027 class), on a work-study " +
      "program at <strong>Chazal</strong>, where I build internal tools and automations " +
      "for the marketing and IT departments.",
    "hero.cta1": "View my projects",
    "hero.cta2": "Download my CV",
    "hero.cta3": "Contact me",

    "about.title": "About",
    "about.parcoursSubtitle": "Background",
    "about.t1period": "Before the BTS",
    "about.t1text": "STI2D high school diploma, then a BUT MMI degree, which included web " +
      "development but within a curriculum that was too generalist and heavily focused on " +
      "creative/communication work. Thanks to a work-study opportunity, I joined the BTS SIO " +
      "program to specialize in pure computer science.",
    "about.t3period": "Since September 2026 · SIO2",
    "about.t2text": "1<sup>st</sup> year of BTS SIO at Lycée Louis Pergaud, already on a work-study " +
      "program at <strong>Chazal</strong> (2 weeks at the company / 3 weeks at school). Built " +
      "my first complete PHP web projects, including site-vitrine-BTSIO.",
    "about.t3text": "2<sup>nd</sup> year, on a work-study program at Chazal (2 weeks at the " +
      "company / 3 weeks at school), within the IT department of the Dole site.",
    "about.workSubtitle": "How I work",
    "about.trait1": "Curious — I like understanding how a tool works before reusing it.",
    "about.trait2": "Autonomous in my development work, with regular check-ins with my " +
      "apprenticeship supervisor.",
    "about.trait3": "Persistent when facing a bug or an unfamiliar technology.",
    "about.trait4": "Comfortable learning a new technology quickly when a project requires it.",
    "about.trait5": "Focused on solving concrete problems rather than theoretical ones.",
    "about.goalsSubtitle": "Goals",
    "about.goalsText": "After completing my BTS SIO, I want to continue in software " +
      "development and automation. I'm still deciding between further studies and entering " +
      "the workforce directly — this page will be updated as this plan becomes clearer.",

    "skills.title": "Skills",
    "skills.intro": "Technologies actually used across my projects — school, personal, or " +
      "work-study.",
    "skills.card1.title": "Web development",
    "skills.card1.ref": "site-vitrine-BTSIO, photo interface, catalog system and " +
      "ChazalGo CRM at Chazal",
    "skills.card2.title": "Automation & scripting",
    "skills.card2.ref": "Catalog pipeline (PDF → images → Firestore), image processing, " +
      "S3 → document management sync at Chazal",
    "skills.card3.title": "Databases",
    "skills.card3.tag1": "Firestore (NoSQL)",
    "skills.card3.tag2": "RLS rules",
    "skills.card3.ref": "site-vitrine-BTSIO (PostgreSQL on Supabase), ChazalGo CRM (Supabase, " +
      "RLS), catalog system and mobile apps (Firestore)",
    "skills.card4.title": "Cloud, APIs & AI",
    "skills.card4.tag1": "Generative AI (OpenRouter)",
    "skills.card4.ref": "Image storage and processing, catalog system, product visual " +
      "generation, API testing with Postman at Chazal",
    "skills.card5.title": "Security & best practices",
    "skills.card5.tag1": "Password hashing",
    "skills.card5.tag2": "Prepared statements",
    "skills.card5.tag3": "Data validation",
    "skills.card5.tag4": "XSS protection",
    "skills.card5.tag6": "Secrets kept out of code (.env)",
    "skills.card5.ref": "Implemented on site-vitrine-BTSIO (PDO, password_hash, htmlspecialchars) and " +
      "on Chazal's tools (API keys kept server-side, environment variables)",
    "skills.card6.title": "Tools & deployment",
    "skills.card6.ref": "Containerization and deployment of internal tools on Chazal's " +
      "intranet, Git versioning",
    "skills.card7.title": "Mobile",
    "skills.card7.ref": "Built the Les Halles app, maintenance and updates of the myChazal " +
      "sales app",

    "alt.title": "Apprenticeship at Chazal",
    "alt.role": "IT Developer Apprentice",
    "alt.subtitle": "IT department — Dole site · since September 2026",
    "alt.text": "I work within the IT department, alongside an IT manager, an ERP manager, " +
      "and a network administrator. I work directly with my apprenticeship supervisor as " +
      "well as with the marketing/communication and quality departments whenever they need " +
      "a tool or an update.",
    "alt.missionsSubtitle": "My responsibilities",
    "alt.mission1": "Building and improving internal web interfaces",
    "alt.mission2": "Automating repetitive tasks",
    "alt.mission3": "Retrieving and using data via APIs",
    "alt.mission4": "Managing and processing product images",
    "alt.mission5": "Designing tools to make the marketing team's work easier",
    "alt.mission6": "Improving existing tools based on user feedback",
    "alt.mission7": "Testing, fixing, and evolving applications",
    "alt.mission8": "Deploying and maintaining solutions (intranet, via Coolify)",
    "alt.mission9": "Integrating generative AI features for product visuals",
    "alt.mission10": "Building and maintaining mobile apps (FlutterFlow, Firebase)",
    "alt.mission11": "Testing APIs with Postman before integrating them",
    "alt.note": "Detailed professional achievements (product photo management, catalog " +
      "system, myChazal and Les Halles apps, ChazalGo CRM) are presented in the <a href=\"#projets\">Projects</a> section — without any " +
      "code or confidential data, in line with company policy.",

    "projects.title": "Projects & achievements",
    "projects.intro": "A selection of representative work, rather than an exhaustive list " +
      "of repositories.",
    "projects.captureSoon": "Screenshot coming soon",

    "badge.pro": "Work-study — Chazal",
    "badge.sio1": "BTS SIO Project — Year 1",

    "e5.title": "Professional path — E5 summary",
    "e5.intro": "Summary table linking each achievement to the BTS SIO reference-framework " +
      "skills actually used, and to the available evidence.",
    "e5.th1": "Achievement",
    "e5.th2": "BTS skills used",
    "e5.th3": "Available evidence",
    "e5.row1.realisation": "Product photo management (Chazal)",
    "e5.row1.competences": "Responding to incidents and support/change requests · " +
      "Providing users with an IT service · Working in project mode",
    "e5.row1.preuves": "Internal project report, Git history (over 80 commits), " +
      "screenshots, demo video, live demo possible during the oral defense",
    "e5.row2.realisation": "Product catalog system (Chazal)",
    "e5.row2.competences": "Developing the organization's online presence · Responding to " +
      "incidents and support/change requests · Providing users with an IT service",
    "e5.row6.realisation": "myChazal app (Chazal)",
    "e5.row6.competences": "Responding to incidents and support/change requests · " +
      "Providing users with an IT service",
    "e5.row6.preuves": "Functional explanations, screenshots — code not " +
      "shareable",
    "e5.row8.realisation": "Les Halles app (Chazal)",
    "e5.row8.competences": "Providing users with an IT service · Responding to incidents " +
      "and support/change requests",
    "e5.row8.preuves": "App screenshots and video, demo possible during the oral defense",
    "e5.row9.realisation": "ChazalGo CRM (Chazal)",
    "e5.row9.preuves": "Functional explanations, screenshots (data blurred), demo possible " +
      "during the oral defense — code not shareable",
    "e5.row2.preuves": "Functional explanations, screenshots and demo videos — code not " +
      "shareable",
    "e5.row3.competences": "Providing users with an IT service",
    "e5.rowGithub.preuves": "GitHub source code, screenshots",
    "e5.note": "Only the skills actually demonstrated by the content of each achievement " +
      "are listed here — none are added by mere assumption.",

    "certif.title": "Certifications",
    "certif.1": "EBIOS MOOC certificate",
    "certif.2": "Cyberini MOOC certificate",
    "certif.3": "Certificate — module 1",
    "certif.4": "Certificate — module 3",
    "certif.5": "Certificate — module 5",
    "certif.6": "ANSSI certificate",

    "contact.title": "Contact",
    "contact.intro": "Feel free to reach out with any questions about my background or my " +
      "projects.",

    "footer.text": "BTS SIO, SLAM track",

    "lightbox.dialogLabel": "Image preview",
    "lightbox.close": "Close",
    "lightbox.prev": "Previous image",
    "lightbox.next": "Next image"
  };

  // Les pages projet chargent avant ce fichier leur propre dictionnaire
  // anglais (projets/i18n-projets.js), fusionné ici avec le commun.
  var extra = window.PORTFOLIO_EN_EXTRA || {};
  Object.keys(extra).forEach(function (key) {
    EN[key] = extra[key];
  });

  var META_EN = {
    title: "Salim Jaballah — Developer & IT Apprentice (BTS SIO)",
    description: "Portfolio of Salim Jaballah, BTS SIO (SLAM) student on a work-study " +
      "program at Chazal. Development, automation, projects and career path.",
    ogDescription: "Development, automation and projects — BTS SIO (SLAM) path, " +
      "apprenticeship at Chazal.",
    locale: "en_US"
  };

  var META_FR = {
    title: document.title,
    description: null,
    ogDescription: null,
    locale: "fr_FR"
  };

  function applyLang(lang, textItems, altItems, ariaItems, buttons) {
    textItems.forEach(function (item) {
      if (lang === "fr") {
        item.el.innerHTML = item.fr;
      } else if (EN[item.key] !== undefined) {
        item.el.innerHTML = EN[item.key];
      }
    });

    altItems.forEach(function (item) {
      if (lang === "fr") {
        item.el.setAttribute("alt", item.fr);
      } else if (EN[item.key] !== undefined) {
        item.el.setAttribute("alt", EN[item.key]);
      }
    });

    ariaItems.forEach(function (item) {
      if (lang === "fr") {
        item.el.setAttribute("aria-label", item.fr);
      } else if (EN[item.key] !== undefined) {
        item.el.setAttribute("aria-label", EN[item.key]);
      }
    });

    var pageTitle = document.getElementById("pageTitle");
    var metaDescription = document.getElementById("metaDescription");
    var ogTitle = document.getElementById("ogTitle");
    var ogDescription = document.getElementById("ogDescription");
    var ogLocale = document.getElementById("ogLocale");

    if (pageTitle) pageTitle.textContent = lang === "fr" ? META_FR.title : META_EN.title;
    if (ogTitle) ogTitle.setAttribute("content", lang === "fr" ? META_FR.title : META_EN.title);
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        lang === "fr" ? META_FR.description : META_EN.description
      );
    }
    if (ogDescription) {
      ogDescription.setAttribute(
        "content",
        lang === "fr" ? META_FR.ogDescription : META_EN.ogDescription
      );
    }
    if (ogLocale) ogLocale.setAttribute("content", lang === "fr" ? META_FR.locale : META_EN.locale);

    document.documentElement.setAttribute("lang", lang);

    buttons.forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* stockage indisponible : la préférence ne sera juste pas mémorisée */
    }
  }

  function initI18n() {
    var textEls = document.querySelectorAll("[data-i18n]");
    var altEls = document.querySelectorAll("[data-i18n-alt]");
    var ariaEls = document.querySelectorAll("[data-i18n-aria]");
    var buttons = document.querySelectorAll(".lang-switch__btn");
    if (!textEls.length && !altEls.length && !ariaEls.length) return;

    // Cache le FR original AVANT toute bascule : c'est la source de verite,
    // on ne la duplique jamais en dur dans ce fichier.
    var textItems = [];
    textEls.forEach(function (el) {
      textItems.push({ el: el, key: el.getAttribute("data-i18n"), fr: el.innerHTML });
    });
    var altItems = [];
    altEls.forEach(function (el) {
      altItems.push({ el: el, key: el.getAttribute("data-i18n-alt"), fr: el.getAttribute("alt") });
    });
    var ariaItems = [];
    ariaEls.forEach(function (el) {
      ariaItems.push({ el: el, key: el.getAttribute("data-i18n-aria"), fr: el.getAttribute("aria-label") });
    });
    META_FR.description = document.getElementById("metaDescription")
      ? document.getElementById("metaDescription").getAttribute("content")
      : null;
    META_FR.ogDescription = document.getElementById("ogDescription")
      ? document.getElementById("ogDescription").getAttribute("content")
      : null;

    var initialLang = "fr";
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "fr" || saved === "en") initialLang = saved;
    } catch (e) {
      /* pas grave, on reste en FR par defaut */
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"), textItems, altItems, ariaItems, buttons);
      });
    });

    if (initialLang !== "fr") {
      applyLang(initialLang, textItems, altItems, ariaItems, buttons);
    } else {
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === "fr" ? "true" : "false");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initI18n);
})();
