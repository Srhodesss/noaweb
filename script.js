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
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    // Only animate while the field is still catching up to the cursor
    const loop = () => {
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      field.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) requestAnimationFrame(loop);
      else running = false;
    };
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 50;
      ty = (e.clientY / window.innerHeight - 0.5) * 50;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  /* ---------- Beta form: emails each signup to the team via FormSubmit ---------- */
  // The first live submission sends an activation email to this inbox; signups
  // are only forwarded once that link is clicked.
  const WAITLIST_ENDPOINT = "https://formsubmit.co/ajax/info@noawearable.com";
  const form = document.getElementById("betaForm");
  const msg = document.getElementById("formMsg");
  if (form) {
    const button = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      const email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "Please enter a valid email address.";
        form.email.focus();
        return;
      }
      // Honeypot: bots fill every field, people never see this one
      if (form._honey && form._honey.value) return;

      form.classList.add("is-sending");
      button.disabled = true;
      msg.textContent = "Adding you to the list…";
      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            email,
            _subject: "New Noa beta waitlist signup",
            _template: "table",
            _replyto: email,
            message: `${email} just joined the Noa beta waitlist.`,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) === "false") throw new Error(data.message || res.status);
        form.classList.add("is-done");
        msg.textContent = "You're on the list. We'll be in touch before beta opens.";
      } catch (err) {
        console.error("Waitlist signup failed:", err);
        msg.textContent = "Something went wrong. Please try again in a moment.";
        button.disabled = false;
      } finally {
        form.classList.remove("is-sending");
      }
    });
  }
})();
