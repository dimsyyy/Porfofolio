document.addEventListener("DOMContentLoaded", () => {
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];

  const setActiveLink = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.hash === `#${sectionId}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let scrollFrame = 0;
  const cancelScroll = () => cancelAnimationFrame(scrollFrame);
  window.addEventListener("wheel", cancelScroll, { passive: true });
  window.addEventListener("touchstart", cancelScroll, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape", "Tab"].includes(event.key)) cancelScroll();
  });

  const smoothScrollTo = (top) => {
    cancelScroll();
    const start = window.scrollY;
    const end = Math.min(top, Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
    // Explicit navigation uses a visible page-scroll transition, as requested.
    // Wheel, touch, or keyboard input can interrupt it at any point.
    const duration = Math.min(1400, Math.max(700, Math.abs(end - start) * 0.55));
    const startedAt = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo({ top: start + (end - start) * eased, behavior: "instant" });
      if (progress < 1) scrollFrame = requestAnimationFrame(step);
    };
    scrollFrame = requestAnimationFrame(step);
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;

      event.preventDefault();
      const header = document.querySelector(".site-header");
      const headerStyle = header ? window.getComputedStyle(header) : null;
      const offset = header
        ? header.offsetHeight + (parseFloat(headerStyle.top) || 0) + 24
        : 24;
      const top = link.hash === "#home"
        ? 0
        : Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);

      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
      setActiveLink(target.id);

      // Move keyboard focus without interrupting the scroll animation.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
      smoothScrollTo(top);
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) {
          setActiveLink(visibleSection.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const projectCards = [...document.querySelectorAll('.project-card')];
  const categories = ['web', 'web', 'web', 'visual', 'visual', 'web'];
  projectCards.forEach((card, index) => card.dataset.category = categories[index]);
  document.querySelector('.project-toolbar').hidden = false;
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let count = 0;
      projectCards.forEach(card => {
        card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
        card.classList.remove('filter-enter');
        if (!card.hidden) { count++; requestAnimationFrame(() => card.classList.add('filter-enter')); }
      });
      document.querySelector('.filter-result').textContent = `${count} karya ditampilkan`;
    });
  });
  const groups = [...document.querySelectorAll('.skill-group')];
  document.querySelector('.skill-filters').hidden = false;
  document.querySelectorAll('[data-skill]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-skill]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      groups.forEach((group, index) => group.hidden = button.dataset.skill !== 'all' && button.dataset.skill !== ['development', 'creative'][index]);
      document.querySelector('.skill-groups').classList.toggle('is-filtered', button.dataset.skill !== 'all');
    });
  });
  const progress = document.querySelector('.reading-progress');
  let queued = false;
  const updateProgress = () => {
    const length = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1, Math.max(0, window.scrollY / length)) : 0})`;
    queued = false;
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
});
