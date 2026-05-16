/* script.js */
(() => {
  "use strict";

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Loader */
  addEventListener("load", () => {
    setTimeout(() => $("#loader")?.classList.add("hide"), 700);
    document.body.classList.add("loaded");
  });

  /* Navbar + Mobile Menu */
  const navbar = $("#navbar");
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  const links = $$(".nav-links a");

  const setNav = () => navbar?.classList.toggle("scrolled", scrollY > 40);
  setNav();
  addEventListener("scroll", setNav, { passive: true });

  burger?.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  links.forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id?.startsWith("#")) {
        e.preventDefault();
        $(id)?.scrollIntoView({ behavior: "smooth" });
      }
      burger?.classList.remove("open");
      navLinks?.classList.remove("open");
    });
  });

  /* Active Nav */
  const sections = links
    .map(a => $(a.getAttribute("href")))
    .filter(Boolean);

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.remove("active"));
      $(`.nav-links a[href="#${entry.target.id}"]`)?.classList.add("active");
    });
  }, { threshold: 0.45 });

  sections.forEach(sec => navObserver.observe(sec));

  /* Custom Cursor */
  const cursor = $("#cursor");
  const dot = $("#cursorDot");
  let mx = innerWidth / 2, my = innerHeight / 2;
  let cx = mx, cy = my;

  if (cursor && dot && !matchMedia("(max-width:900px)").matches) {
    addEventListener("mousemove", e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    }, { passive: true });

    const animateCursor = () => {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();


    $$("a,button,.chip,.property-card,.agent-card,.cat,.faq-q,.vr-play").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });
  }

  /* Reveal Animations */
  const revealEls = $$(".reveal");
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: "0px 0px -50px 0px" });

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    revealObserver.observe(el);
  });

  /* Counters */
  const counters = $$("[data-count]");
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = +el.dataset.count;
      const duration = 1600;
      const start = performance.now();

      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        const value = Math.floor(target * eased);

        el.textContent =
          target >= 1000 ? value.toLocaleString() :
          el.parentElement?.querySelector("p")?.textContent.includes("%") ? `${value}` :
          value;

        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target >= 1000 ? target.toLocaleString() : target;
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.55 });

  counters.forEach(c => countObserver.observe(c));

  /* Property Filter */
  const chips = $$(".chip");
  const cards = $$(".property-card");

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filter = chip.dataset.filter;

      cards.forEach((card, i) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.style.transitionDelay = `${i * 45}ms`;
        card.style.opacity = show ? "1" : "0";
        card.style.transform = show ? "scale(1)" : "scale(.92)";
        card.style.pointerEvents = show ? "auto" : "none";

        setTimeout(() => {
          card.style.display = show ? "" : "none";
        }, show ? 0 : 280);
      });
    });
  });

  /* 3D Tilt Cards */
  if (!prefersReduced) {

    $$("[data-tilt]").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const rx = ((y / r.height) - 0.5) * -10;
        const ry = ((x / r.width) - 0.5) * 10;

        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* Magnetic Buttons */
  if (!prefersReduced) {

    $$(".btn-magnetic").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* Testimonials Slider */
  const track = $("#testiTrack");
  const dotsWrap = $("#testiDots");
  const slides = $$(".testi", track || document);
  let slide = 0;
  let testiTimer;

  const goSlide = i => {
    if (!track || !slides.length) return;
    slide = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${slide * 100}%)`;

    $$("#testiDots button").forEach((d, idx) => d.classList.toggle("active", idx === slide));
  };

  if (track && dotsWrap && slides.length) {
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Testimonial ${i + 1}`);
      b.addEventListener("click", () => {
        goSlide(i);
        restartTesti();
      });
      dotsWrap.appendChild(b);
    });

    const restartTesti = () => {
      clearInterval(testiTimer);
      testiTimer = setInterval(() => goSlide(slide + 1), 4500);
    };

    goSlide(0);
    restartTesti();

    track.parentElement?.addEventListener("mouseenter", () => clearInterval(testiTimer));
    track.parentElement?.addEventListener("mouseleave", restartTesti);
  }

  /* FAQ Accordion */

  $$(".faq-item").forEach(item => {
    const q = $(".faq-q", item);
    q?.addEventListener("click", () => {

      $$(".faq-item").forEach(i => i !== item && i.classList.remove("active"));
      item.classList.toggle("active");
    });
  });

  /* Particles Canvas */
  const canvas = $("#particles");
  const ctx = canvas?.getContext("2d");
  let particles = [];
  let w, h, dpr;

  const resize = () => {
    if (!canvas || !ctx) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(95, Math.floor(innerWidth / 18));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.45 + 0.15
    }));
  };

  const drawParticles = () => {
    if (!ctx || prefersReduced) return;

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    particles.forEach((p, i) => {
      p.x += p.vx + (mx - innerWidth / 2) * 0.00008;
      p.y += p.vy + (my - innerHeight / 2) * 0.00008;

      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.a})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(212,175,55,${(1 - dist / 120) * 0.12})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(drawParticles);
  };

  if (canvas && ctx) {
    resize();
    drawParticles();
    addEventListener("resize", resize);
  }

  /* Hero Parallax */
  const heroBg = $(".hero-bg");
  const heroGrid = $(".hero-grid");

  if (!prefersReduced) {
    addEventListener("mousemove", e => {
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      if (heroBg) heroBg.style.transform = `translate(${x}px,${y}px) scale(1.05)`;
      if (heroGrid) heroGrid.style.transform = `translate(${-x * 0.5}px,${-y * 0.5}px)`;
    }, { passive: true });

    addEventListener("scroll", () => {
      const y = scrollY * 0.18;
      $(".hero-content")?.style.setProperty("transform", `translateY(${y}px)`);
    }, { passive: true });
  }

  /* Buttons: useful actions */

  $$(".btn-primary, .btn-ghost, .vr-play").forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.textContent.toLowerCase();

      if (text.includes("explore")) $("#properties")?.scrollIntoView({ behavior: "smooth" });
      else if (text.includes("tour") || text.includes("▶")) $("#tour")?.scrollIntoView({ behavior: "smooth" });
      else if (text.includes("launch")) alert("Virtual tour launching soon.");
      else if (text.includes("send")) return;
      else if (text.includes("get started")) $("#contact")?.scrollIntoView({ behavior: "smooth" });
    });
  });


  $$(".btn-ghost-sm").forEach(btn => {
    btn.addEventListener("click", () => alert("Property details preview coming soon."));
  });

})();
