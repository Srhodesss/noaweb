(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav: frosted background once scrolled ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll (staggered within a parent) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const counts = new Map();
  reveals.forEach((el) => {
    const i = counts.get(el.parentElement) || 0;
    el.style.setProperty("--d", `${i * 0.09}s`);
    counts.set(el.parentElement, i + 1);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((el) => io.observe(el));

  /* ---------- Gradient field drifts gently with the cursor ---------- */
  const field = document.querySelector(".field");
  if (field && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 50;
      ty = (e.clientY / window.innerHeight - 0.5) * 50;
    });
    const loop = () => {
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      field.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Beta form (front-end only — wire to your waitlist service) ---------- */
  const form = document.getElementById("betaForm");
  const msg = document.getElementById("formMsg");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "Please enter a valid email address.";
        form.email.focus();
        return;
      }
      // TODO: POST `email` to your waitlist endpoint (Formspree, Loops, Mailchimp, Supabase…).
      form.classList.add("is-done");
      msg.textContent = "You're on the list. We'll be in touch before beta opens.";
    });
  }
})();
