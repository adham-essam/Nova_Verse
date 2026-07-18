/* ==========================================================================
   Nova Verse Academy — main.js
   Vanilla JS only. No dependencies.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Config — replace with real values before launch
  --------------------------------------------------------------------- */
  const WHATSAPP_NUMBER = "201501190654"; // placeholder, no leading 00 or +
  const WHATSAPP_DEFAULT_MESSAGE = "مرحبًا، أرغب في حجز حصة تجريبية مجانية لطفلي في Nova Verse Academy.";

  function buildWhatsAppLink(message) {
    const text = encodeURIComponent(message || WHATSAPP_DEFAULT_MESSAGE);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  }

  /* ---------------------------------------------------------------------
     Wire up every element with [data-whatsapp] to open WhatsApp
  --------------------------------------------------------------------- */
  function initWhatsAppLinks() {
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      const customMsg = el.getAttribute("data-whatsapp-message");
      el.setAttribute("href", buildWhatsAppLink(customMsg));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });
  }

  /* ---------------------------------------------------------------------
     Sticky header state
  --------------------------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------------- */
  function initNavToggle() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Theme toggle — swaps data-theme on <html>, remembers choice
  --------------------------------------------------------------------- */
  function initThemeToggle() {
    const toggle = document.querySelector(".theme-toggle");
    const root = document.documentElement;
    const STORAGE_KEY = "nova-verse-theme";

    const saved = getStoredTheme(STORAGE_KEY);
    if (saved) root.setAttribute("data-theme", saved);

    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "premium" ? "premium" : "default";
      const next = current === "premium" ? "default" : "premium";
      if (next === "default") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "premium");
      }
      setStoredTheme(STORAGE_KEY, next);
    });
  }

  function getStoredTheme(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function setStoredTheme(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* noop */ }
  }

  /* ---------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
  --------------------------------------------------------------------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach((t) => observer.observe(t));
  }

  /* ---------------------------------------------------------------------
     Starfield canvas — light, dependency-free ambient background
  --------------------------------------------------------------------- */
  function initStarfield() {
    const canvas = document.querySelector(".starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let stars = [];
    let shootingStars = [];
    let width, height, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function buildStars() {
      const density = Math.floor((width * height) / 9000);
      stars = new Array(density).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        baseOpacity: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    }

    function maybeSpawnShootingStar() {
      if (prefersReducedMotion) return;
      if (Math.random() < 0.004 && shootingStars.length < 2) {
        const startX = Math.random() * width * 0.6;
        shootingStars.push({
          x: startX,
          y: Math.random() * height * 0.3,
          len: 90 + Math.random() * 60,
          speed: 7 + Math.random() * 3,
          life: 1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // static / twinkling stars
      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed;
        const op = prefersReducedMotion
          ? s.baseOpacity
          : s.baseOpacity * (0.6 + 0.4 * Math.sin(s.twinklePhase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }

      // shooting stars
      maybeSpawnShootingStar();
      shootingStars.forEach((sh) => {
        const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.len, sh.y - sh.len * 0.35);
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.len, sh.y - sh.len * 0.35);
        ctx.stroke();
        sh.x += sh.speed;
        sh.y += sh.speed * 0.35;
        sh.life -= 0.012;
      });
      shootingStars = shootingStars.filter((sh) => sh.life > 0 && sh.x < width + 100);

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
  }

  /* ---------------------------------------------------------------------
     Form handling (client-side only, no backend)
  --------------------------------------------------------------------- */
  function initForms() {
    document.querySelectorAll("form[data-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const feedback = form.querySelector("[data-form-feedback]");
        if (feedback) {
          feedback.textContent = "تم استلام طلبك بنجاح، سنتواصل معك قريبًا.";
          feedback.hidden = false;
        }
        form.reset();
      });
    });

    document.querySelectorAll(".file-upload input[type='file']").forEach((input) => {
      const label = input.closest(".file-upload").querySelector("[data-file-label]");
      input.addEventListener("change", () => {
        if (label) {
          label.textContent = input.files.length ? input.files[0].name : "اسحب الملف هنا أو اضغط للاختيار";
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Active nav link based on current page
  --------------------------------------------------------------------- */
  function initActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("is-active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initWhatsAppLinks();
    initHeaderScroll();
    initNavToggle();
    initThemeToggle();
    initScrollReveal();
    initStarfield();
    initForms();
    initActiveNav();
  });
})();
