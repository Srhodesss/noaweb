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

  /* ---------- Register interest ---------- */
  // Posts to our own Vercel function (api/waitlist.js), which validates the
  // signup and stores it in the team Google Sheet.
  //
  // SURVEY_URL: paste the Tally survey link here once School ethics sign-off is
  // in. Leave it empty and the survey button stays hidden.
  const SURVEY_URL = "";
  const ENDPOINT = "/api/waitlist";

  const params = new URLSearchParams(window.location.search);
  const pick = (key) => (params.get(key) || "").slice(0, 100);
  // Where the visitor came from: UTM tags on links and ads, ?ref= on venue QR codes
  const source = {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    ref: pick("ref"),
  };

  const form = document.getElementById("betaForm");
  const msg = document.getElementById("formMsg");
  const thanks = document.getElementById("thanks");
  const surveyLink = document.getElementById("surveyLink");

  if (form) {
    const button = form.querySelector("button[type=submit]");
    const roles = ["athlete", "coach", "both"];

    // Pre-select the role when arriving from the survey (?role=athlete)
    const presetRole = params.get("role");
    if (roles.includes(presetRole)) {
      const radio = form.querySelector(`input[name=role][value=${presetRole}]`);
      if (radio) radio.checked = true;
    }

    const fail = (text, el) => {
      msg.textContent = text;
      msg.classList.add("is-error");
      if (el) el.focus();
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      msg.classList.remove("is-error");

      const email = form.email.value.trim();
      const roleInput = form.querySelector("input[name=role]:checked");
      const role = roleInput ? roleInput.value : "";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("Please enter a valid email address.", form.email);
      if (!role) return fail("Please choose athlete, coach or both.", form.querySelector("input[name=role]"));
      if (!form.consent.checked) return fail("Please tick the box so we can email you updates.", form.consent);

      form.classList.add("is-sending");
      button.disabled = true;
      msg.textContent = "Adding you to the list…";

      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            email,
            role,
            consent: true,
            company: form.company.value, // honeypot
            page: window.location.pathname,
            ...source,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);

        form.hidden = true;
        thanks.hidden = false;
        msg.textContent = "";
        if (data.duplicate) {
          thanks.querySelector(".thanks__title").textContent = "You're already on the list.";
        }
        if (SURVEY_URL) {
          const url = new URL(SURVEY_URL);
          url.searchParams.set("src", "waitlist");
          url.searchParams.set("role", role);
          surveyLink.href = url.toString();
          surveyLink.hidden = false;
        }
        thanks.focus();
      } catch (err) {
        console.error("Signup failed:", err);
        fail("Something went wrong. Please try again, or email info@noawearable.com.");
        button.disabled = false;
      } finally {
        form.classList.remove("is-sending");
      }
    });
  }
})();
