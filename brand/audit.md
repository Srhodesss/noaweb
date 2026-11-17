# Noa site audit (Phase 1)

Date: 17 November 2026. Screenshots are in `brand/audit/`, at 1440px and 390px for the home page and the privacy page.

## Stack

- A static site: `index.html`, `privacy.html`, `styles.css` and `script.js`. There is no framework, bundler or build step.
- Hosted on Vercel. `api/waitlist.js` is a serverless function that validates each sign-up and forwards it to a Google Apps Script (`apps-script/Code.gs`) that writes to the team Google Sheet.
- Locally the site runs with any static server. `/api/waitlist` only runs on Vercel, so for local testing the form needs a stub.

## Current colours

| Token | Hex | Use | Contrast on bg |
|---|---|---|---|
| `--bg` | #f4f2ee | Page background, theme-color | |
| `--ink` | #141414 | Text | 16.5:1 |
| `--ink-2` | #5f5c57 | Body copy | 5.95:1 (passes AA) |
| `--ink-3` | #9b978f | Muted text, footer, "Until now…" | **2.6:1 (fails AA at every size)** |
| `--signal` | #e2542b | Dot, focus, gradients | 3.39:1 (large text only) |
| `--signal-ink` | #b73b18 | Small red text | 5.14:1 (passes) |
| button | #ea6c45 with #141414 text | Primary button | 5.9:1 (passes) |
| `--mist` / `--blush` | #bfd5ec / #f2c3ad | Background orbs | |
| gradients | #b8361a → #e2542b → #ea8a3a | Italic headline words | |

A warm sepia film-grain layer is multiplied over the whole page, which warms it further.

## Current type

- **Helvetica Neue**, self-hosted from `fonts/` (14 OTF/TTF files, 5 of them loaded). The fallback stack ends in Arial.
- **Licence risk:** Helvetica Neue is a commercial Monotype/Linotype typeface. Desktop OTFs served on the web need a separate web licence. Unless the team holds one, these files should be removed from the public repo and the live site. The type change in Phase 3 fixes this.
- Headlines are set in Light 300 with tight negative tracking. No tabular numerals are used anywhere.

## Components

Fixed nav (the "noa" text logo and a "Beta · Q2 2027" pill) · hero (team line, H1, subhead, waitlist form) · "why" statement · tech section (label and three columns) · tagline · FAQ (4 `<details>`) · footer. Supporting layers: animated gradient orbs, morphing "liquid glass" panes, animated grain and scroll reveals.

Waitlist form: an email field, an athlete/coach/both radio group styled as chips, a consent checkbox, a honeypot, a live status message, and a thank-you state with an optional survey link. The button stays disabled until all fields are valid. It reads `?role=` and UTM parameters, which are used for attribution. This logic stays as it is.

## Patterns from the avoid list

| Pattern | Where |
|---|---|
| Warm beige/off-white background | `--bg #f4f2ee`, theme-color, scrolled nav `rgba(244,242,238,.7)`, sepia grain |
| Italic accent word in headline | Hero "*ready.*" (italic with gradient text); tagline "*where performance is key.*" (italic with gradient) |
| Small uppercase eyebrow labels | "THE TECHNOLOGY" (`.label`), "BRAIN", "BRAIN + BODY", "PREDICTION" (`.col__tag`), "SCROLL" (`.hero__more`) |
| Three-up card row | The technology section (`.cols`, EEG / fNIRS+PPG / ML) |
| Pill-shaped elements | Nav beta badge, form shell, both buttons, role chips (all `border-radius: 999px`) |
| Glowing orbs, blue mesh gradient | `.field` with 4 drifting blush/blue orbs, plus `.glass` morphing frosted panes and the pulsing "ping" dot |
| Thin decorative line | 22px rule before the hero team line (`.hero__team::before`) |
| Numbered counters, neon brain graphics, particles, monospace | None found |
| Inflated copy | None found ("unlock", "seamless" and similar don't appear) |

## Copy and claims issues

- **"Until now, nothing listened to both."** This is the unsupported first claim. Proposed: "Nothing built for athletes listens to both."
- **Explaining how, not what:** "using machine learning to predict" (hero and meta description), the "ML" column, "read from the ear", and "sit in/around the ear" (FAQ). Sensor names (EEG/fNIRS/PPG) say *what* Noa measures, so they're acceptable, but placement and algorithm wording should go.
- **Em dash** in the page `<title>`: "Noa — Recovery & readiness…".
- **Audience order:** the meta description says "Built first for elite sport", and the tagline leads with clubs. Your stated first audience is serious amateurs who already wear a Whoop or Oura. Nothing on the page speaks to them yet, for example how Noa differs from what's already on their wrist.
- **Coaches** appear only as a radio option and in the tagline.

## Rubric gaps (beyond the avoid list)

- **Navigation:** there are no nav links at all. A visitor can't jump to "how it works", "for coaches" or "join". This is the clearest gap against "navigation that takes target visitors quickly to key information".
- **No product or athlete imagery**, and no example of the readiness score itself, even though the score is the product's core output.
- No favicon and no Open Graph/social preview tags.
- Mobile works: the form stacks cleanly. The hero's empty lower half on desktop is filled only by the orbs.

## Mood board

**`brand/mood/` is not in the repository.** I haven't seen any of the images. Please add them (or commit the folder) before Phase 2, since the accent red and the grading depend on them.

## Reference sites (inspo / Awwwards MCP)

I installed the inspo MCP server at user scope, but it only loads when Claude Code restarts, so its tools aren't available in this session. This environment's network also blocks general browsing. If you restart the session, I'll pull 6 to 8 references with it. I've chosen not to list references from memory without checking them.

## Tooling notes

- agent-browser is installed. Its own Chrome download was blocked by the network, so it runs on the preinstalled Chromium (`AGENT_BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium`).
- The `cook` skill was cloned to `.claude/skills/cook`. It is untracked, and I won't commit it unless you ask.
