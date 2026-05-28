const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const servicesGrid = document.querySelector("[data-services-grid]");

if (servicesGrid && Array.isArray(window.servicesData)) {
  servicesGrid.innerHTML = window.servicesData
    .map(
      (service, index) => `
        <article class="service-card reveal" style="--service-index: ${index + 1}">
          <div class="service-card-media">
            <img src="${service.image}" alt="${service.alt}" loading="lazy" onerror="this.closest('.service-card').classList.add('is-media-missing'); this.remove();">
          </div>
          <div class="service-card-body">
            <div class="service-card-mark" aria-hidden="true">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <b>${service.tag}</b>
            </div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
          </div>
          <a class="service-card-link" href="#consultation" aria-label="Записаться: ${service.title}">Записаться</a>
        </article>
      `
    )
    .join("");
}

const revealItems = document.querySelectorAll(".reveal");
const beforeAfter = document.querySelector("[data-before-after]");
const form = document.querySelector(".lead-form");
const toast = document.querySelector("[data-toast]");
const splash = document.querySelector("[data-splash]");
const INTRO_KEY = "artTuningIntroViewed";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const finishIntro = () => {
  document.body.classList.remove("intro-pending");
  document.body.classList.add("intro-done");
  splash?.classList.add("is-hidden");

  if (window.location.hash) {
    const anchorTarget = document.querySelector(window.location.hash);
    anchorTarget?.classList.add("is-visible");
    if (anchorTarget) {
      window.scrollTo(0, Math.max(0, anchorTarget.offsetTop - 96));
    }
  }

  window.setTimeout(() => {
    splash?.remove();
  }, 1000);
};

if (splash) {
  let introViewed = false;

  try {
    introViewed = sessionStorage.getItem(INTRO_KEY) === "true";
  } catch (error) {
    introViewed = false;
  }

  if (prefersReducedMotion || introViewed || window.location.hash) {
    finishIntro();
  } else {
    try {
      sessionStorage.setItem(INTRO_KEY, "true");
    } catch (error) {
      // Continue with the intro even if browser storage is unavailable.
    }

    window.setTimeout(finishIntro, 3400);
  }
} else {
  document.body.classList.remove("intro-pending");
  document.body.classList.add("intro-done");
}

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const easeOutQuart = (value) => 1 - Math.pow(1 - value, 4);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target || prefersReducedMotion) {
      return;
    }

    event.preventDefault();

    const start = window.scrollY;
    const targetTop = target.getBoundingClientRect().top + start - 96;
    const distance = targetTop - start;
    const duration = Math.min(1200, Math.max(620, Math.abs(distance) * 0.55));
    const startedAt = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, start + distance * easeOutQuart(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  });
});

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const applyRevealStagger = () => {
  const groups = [
    ".trust .reveal",
    ".services-grid .reveal",
    ".all-services-grid .reveal",
    ".masonry .reveal",
    ".review-grid > *",
  ];

  groups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index * 80, 640)}ms`);
    });
  });
};

applyRevealStagger();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const parallaxItems = [
  { element: document.querySelector(".hero-video"), strength: 0.06, property: "--parallax-hero" },
  ...Array.from(document.querySelectorAll(".service img, .shot img")).map((element) => ({
    element,
    strength: -0.018,
    property: "--parallax-media",
  })),
].filter((item) => item.element);

let parallaxTicking = false;

const updateParallax = () => {
  parallaxTicking = false;

  if (prefersReducedMotion || window.innerWidth < 760) {
    parallaxItems.forEach(({ element, property }) => element.style.setProperty(property, "0"));
    return;
  }

  const viewportCenter = window.innerHeight / 2;

  parallaxItems.forEach(({ element, strength, property }) => {
    const rect = element.getBoundingClientRect();

    if (rect.bottom < -120 || rect.top > window.innerHeight + 120) {
      return;
    }

    const elementCenter = rect.top + rect.height / 2;
    const offset = (viewportCenter - elementCenter) * strength;
    element.style.setProperty(property, offset.toFixed(2));
  });
};

const requestParallax = () => {
  if (!parallaxTicking) {
    parallaxTicking = true;
    requestAnimationFrame(updateParallax);
  }
};

updateParallax();
window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", requestParallax);

if (beforeAfter) {
  const range = beforeAfter.querySelector("input");
  const afterWrap = beforeAfter.querySelector("[data-after-wrap]");
  const setSplit = (value) => {
    beforeAfter.style.setProperty("--split", `${value}%`);
    afterWrap.style.width = `${value}%`;
  };
  const syncCompareWidth = () => {
    beforeAfter.style.setProperty("--compare-width", `${beforeAfter.clientWidth}px`);
  };

  syncCompareWidth();
  setSplit(range?.value || 56);
  window.addEventListener("resize", syncCompareWidth);

  range?.addEventListener("input", (event) => {
    setSplit(event.target.value);
  });
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  toast?.classList.add("is-visible");
  window.setTimeout(() => toast?.classList.remove("is-visible"), 3200);
  form.reset();
});
