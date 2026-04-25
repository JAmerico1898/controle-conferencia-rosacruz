# Design Spec — Hero Section: *Escola Espiritual da Rosacruz Áurea*

> Target audience for this document: **Claude Code**, building a Next.js app.
> Two artifacts will be produced: (1) a **HyperFrames** project that renders the hero animation to a deterministic MP4, and (2) a **Next.js hero section** that embeds that MP4 with a graceful poster fallback.

---

## 1. Overview

The hero section is the first thing visitors see when landing on the site for *Escola Espiritual da Rosacruz Áurea* — a transfiguristic gnostic school. Its purpose is contemplative and ceremonial, not commercial. The animation should feel slow, reverent, and luminous.

The animation has **three sequential acts** over **8 seconds**, then freezes on a static final state.

| Act | Time | What happens |
|-----|------|--------------|
| I — The Rose | 0.0 s → 3.0 s | A closed rose bud emerges from below, grows, and blooms into a full red rose centered in the frame. |
| II — The Symbol | 3.0 s → 6.0 s | The rose softens into the background. The Rosacruz Áurea sigil (circle + square + triangle + central point) appears gradually in pure shining gold over the rose. |
| III — The Title | 6.0 s → 8.0 s | The gold sigil fades down into a faint watermark behind the text. The title and subtitle fade in: **"Escola Espiritual da Rosacruz Áurea"** and **"Inscrição para Conferência"**. |
| Final state | 8.0 s onward | Static. Cream background, gold watermark sigil centered, gold title + subtitle in the foreground. |

There is **no CTA button**. The rest of the page provides the registration entry points.

---

## 2. Tech Stack

- **Animation rendering:** [HyperFrames](https://github.com/hyperframes/hyperframes) (HTML/CSS/JS → deterministic MP4 via headless Chrome + FFmpeg).
- **Web framework:** Next.js (App Router, latest stable).
- **Styling:** Tailwind CSS (preferred) or plain CSS modules.
- **Asset:** the user-provided `rosacruz.png` (gold sigil on transparent background).

> **Why this split:** HyperFrames produces a frame-accurate MP4 we control completely (no jank, no library mismatches at runtime). Next.js then just plays that MP4 — fast, cacheable, and works on every device.

---

## 3. Project Structure

```
project-root/
├── hero-render/                  # HyperFrames project — renders the MP4
│   ├── package.json
│   ├── hyperframes.config.js
│   ├── src/
│   │   ├── index.html            # The HTML composition (timeline)
│   │   ├── styles.css
│   │   ├── animation.js          # GSAP/CSS keyframe orchestration
│   │   └── assets/
│   │       └── rosacruz.png      # Copied from /public/rosacruz.png
│   └── output/
│       └── hero.mp4              # Final render — copied to web app's /public/video/
│
└── web/                          # Next.js app
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx              # Renders <Hero />
    │   └── globals.css
    ├── components/
    │   └── Hero.tsx              # The hero section component
    ├── public/
    │   ├── video/
    │   │   ├── hero.mp4          # The HyperFrames output
    │   │   └── hero-poster.jpg   # Last frame of the video, used as poster
    │   └── rosacruz.png
    └── package.json
```

---

## 4. Visual Design Tokens

These tokens MUST be used consistently in **both** the HyperFrames composition and the Next.js component, so the static final state of the video matches the surrounding page seamlessly.

```css
/* Background */
--hero-bg:        #FAF7F0;   /* warm cream / off-white */

/* Gold palette (sigil + title) */
--gold-primary:   #C9A227;   /* main shining gold (matches the sigil PNG) */
--gold-light:     #E8D27A;   /* highlight for shimmer/sheen */
--gold-deep:      #8C6A1A;   /* shadow side / subtitle accent */
--gold-watermark: rgba(201, 162, 39, 0.18);  /* faint sigil behind text */

/* Rose */
--rose-red:       #B0202E;   /* deep, slightly cool red — not crimson */
--rose-deep:      #6E0F18;   /* shadowed petals */
--rose-stem:      #3F5A2A;   /* muted forest green */
--rose-leaf:      #547237;
```

**Typography**
- Title: a refined serif — `"Cormorant Garamond"` or `"Cinzel"` (use Cinzel for added gravitas), weight 500–600, letter-spacing slightly open (~0.04em).
- Subtitle: same family, lighter weight (300–400), smaller, uppercase tracking optional.
- All text rendered in tones drawn from the gold palette — title in `--gold-primary`, subtitle in `--gold-deep` for hierarchy.

**Layout**
- Hero fills the viewport: `min-height: 100vh; width: 100vw;`.
- Content is vertically and horizontally centered.
- Video should `object-fit: cover` to fill, but the composition is designed for **16:9** at **1920×1080** with safe-area centered.

---

## 5. HyperFrames Composition (`hero-render/`)

### 5.1 Setup

```bash
cd hero-render
npx hyperframes init .
npm install gsap
# Copy /public/rosacruz.png → src/assets/rosacruz.png
```

### 5.2 Render config (`hyperframes.config.js`)

- Resolution: **1920 × 1080**
- Frame rate: **30 fps** (sufficient for slow, contemplative motion; keeps file size small)
- Duration: **8.0 s** (240 frames)
- Output: `output/hero.mp4`
- Codec: H.264, yuv420p, CRF ~20 (high quality), web-optimized (`-movflags +faststart`)
- Background color of the page: `#FAF7F0` (the cream — never let pure white or transparent leak through).

### 5.3 Timeline — `src/index.html` + `src/animation.js`

The composition is a single full-bleed `<div class="stage">` containing three layered groups, each absolutely positioned and centered:

1. **`#rose`** — an inline SVG of a rose (bud → bloom). Built as SVG so we can animate petals individually.
2. **`#sigil`** — the `rosacruz.png` image, centered, sized to ~38% of stage height.
3. **`#text`** — the title + subtitle, centered.

#### Act I — The Rose (0.0 s → 3.0 s)

The rose is **drawn in SVG** (not raster) so the bloom can be animated convincingly. The SVG should contain:

- A short stem (`<path>` for the stalk + 2 small leaves).
- A bud made of **5 outer petals** + **5 inner petals** + a tight center cluster.
- All petals share `transform-origin` at the base of the bud so they can rotate/scale outward like a real bloom.

Animation (use GSAP timeline for frame-accuracy under HyperFrames):

| Time | Element | Effect |
|------|---------|--------|
| 0.0 → 0.6 s | `#rose` group | Rises from `translateY(40px)` + `scale(0.2)` + `opacity 0` to `translateY(0)` + `scale(0.4)` + `opacity 1`. Easing: `power2.out`. The bud is now visible, small, closed. |
| 0.6 → 1.2 s | `#rose` group | Continues growing: `scale(0.4) → scale(0.85)`. Stem lengthens slightly (animate `pathLength` or `scaleY` on the stem). |
| 1.2 → 2.4 s | Outer petals | Each outer petal rotates outward (`rotate: 0 → ±25–35°`, staggered by 0.05s) and slightly scales up. The bud "opens." |
| 1.5 → 2.6 s | Inner petals | Same pattern, slightly smaller rotation, staggered after outer petals start. |
| 2.0 → 3.0 s | Whole `#rose` | Final settle: gentle `scale(0.85) → scale(1.0)`, subtle color deepening from `--rose-deep` to `--rose-red` on the petal fills (animate CSS variable or `fill` directly). A very slight `filter: drop-shadow` builds in. |

By 3.0 s the rose is fully bloomed, centered, vibrant red, with a soft shadow.

#### Act II — The Symbol (3.0 s → 6.0 s)

| Time | Element | Effect |
|------|---------|--------|
| 3.0 → 4.0 s | `#rose` | `opacity: 1 → 0.35`, `filter: blur(0) → blur(2px)`. The rose recedes — still present but no longer the protagonist. |
| 3.2 → 5.2 s | `#sigil` | Appears via a **stroke-draw illusion**. The PNG is solid, so we fake the "drawn in gold" feel using: `opacity: 0 → 1` AND `clip-path: inset(50% 50% 50% 50%) → inset(0 0 0 0)` revealing from center outward, AND `filter: brightness(1.6) → brightness(1.0)` so it starts "too bright" then settles into its true gold. |
| 4.5 → 6.0 s | `#sigil` | A **shine sweep**: a subtle diagonal gradient highlight travels across the sigil once (use a pseudo-element with `mix-blend-mode: overlay` + a moving linear gradient, or animate `filter: drop-shadow` color from `--gold-light` to `--gold-primary`). |
| 5.5 → 6.0 s | `#sigil` | Settles to its full, calm, golden state. |

By 6.0 s the sigil is fully present, centered, in pure shining gold, with the rose still faintly visible behind it.

#### Act III — The Title (6.0 s → 8.0 s)

| Time | Element | Effect |
|------|---------|--------|
| 6.0 → 7.0 s | `#sigil` | Fades to watermark: `opacity: 1 → 0.18`, `filter: brightness(1) → brightness(0.9)`. Stays centered, becomes a backdrop. |
| 6.0 → 7.0 s | `#rose` | Fades out completely: `opacity: 0.35 → 0`. |
| 6.5 → 7.5 s | Title | Fades in: `opacity: 0 → 1`, `translateY(12px) → translateY(0)`. Color: `--gold-primary`. Easing: `power2.out`. |
| 7.0 → 8.0 s | Subtitle | Fades in: `opacity: 0 → 1`, `translateY(8px) → translateY(0)`. Color: `--gold-deep`. Slight delay after title. |
| 8.0 s | Final freeze | All values held. The video ends here. |

#### Final frame composition (held for the last frame)

```
┌──────────────────────────────────────────────────┐
│                                                  │
│              [faint gold sigil watermark]        │
│                                                  │
│      Escola Espiritual da Rosacruz Áurea         │  ← --gold-primary, serif, large
│           Inscrição para Conferência             │  ← --gold-deep, lighter, smaller
│                                                  │
└──────────────────────────────────────────────────┘
                  Background: --hero-bg (cream)
```

### 5.4 HTML skeleton (`src/index.html`)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="stage">
    <svg id="rose" viewBox="-100 -100 200 200">
      <!-- Stem + leaves group -->
      <g id="stem"> ... </g>
      <!-- Outer petals (5) -->
      <g id="petals-outer">
        <path class="petal-outer" d="..."/>
        <!-- ×5, each with rotation offset 72° -->
      </g>
      <!-- Inner petals (5) -->
      <g id="petals-inner"> ... </g>
      <!-- Center -->
      <circle id="rose-center" r="6" fill="var(--rose-deep)"/>
    </svg>

    <img id="sigil" src="assets/rosacruz.png" alt="" />

    <div id="text">
      <h1 class="title">Escola Espiritual da Rosacruz Áurea</h1>
      <p class="subtitle">Inscrição para Conferência</p>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script src="animation.js"></script>
</body>
</html>
```

### 5.5 Render command

```bash
npx hyperframes render --duration 8 --fps 30 --width 1920 --height 1080 --output output/hero.mp4
```

After rendering:
- Copy `output/hero.mp4` → `web/public/video/hero.mp4`.
- Extract the last frame as `hero-poster.jpg` (HyperFrames typically supports this; otherwise use FFmpeg: `ffmpeg -sseof -0.1 -i hero.mp4 -vframes 1 -q:v 2 hero-poster.jpg`).

---

## 6. Next.js Hero Component (`web/`)

### 6.1 `components/Hero.tsx`

```tsx
"use client";

export default function Hero() {
  return (
    <section className="hero">
      <video
        className="hero__video"
        src="/video/hero.mp4"
        poster="/video/hero-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        // NOT looped — animation ends on the static final frame
      />
      {/* Optional: an HTML overlay duplicating the final-state title.
          Renders immediately, before the video reaches its end,
          ensuring text is selectable, accessible, and SEO-readable.
          Hidden visually until the video reaches ~7s, OR shown always
          if reduced-motion is preferred. */}
      <div className="hero__a11y-overlay" aria-hidden="false">
        <h1>Escola Espiritual da Rosacruz Áurea</h1>
        <p>Inscrição para Conferência</p>
      </div>
    </section>
  );
}
```

### 6.2 Styling

```css
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  background: var(--hero-bg, #FAF7F0);
  overflow: hidden;
}

.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Visually-hidden but accessible — content is also baked into the video */
.hero__a11y-overlay {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

/* Reduced-motion: skip the video entirely, show static layout */
@media (prefers-reduced-motion: reduce) {
  .hero__video { display: none; }
  .hero__a11y-overlay {
    position: static;
    width: auto; height: auto; clip: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background:
      url('/rosacruz.png') center/auto 38% no-repeat,
      var(--hero-bg);
    background-blend-mode: luminosity;
    opacity: 1;
  }
  .hero__a11y-overlay h1 {
    font-family: 'Cinzel', serif;
    color: var(--gold-primary, #C9A227);
    font-size: clamp(1.8rem, 4vw, 3.5rem);
  }
  .hero__a11y-overlay p {
    font-family: 'Cinzel', serif;
    color: var(--gold-deep, #8C6A1A);
    font-size: clamp(1rem, 2vw, 1.4rem);
  }
}
```

### 6.3 Behavior requirements

- **Autoplay must be muted + `playsInline`** — required by Safari/iOS for autoplay to succeed.
- **Do NOT loop.** The video ends on its final static frame and stays there; that final frame IS the hero's resting state.
- The poster image (`hero-poster.jpg`) is the last frame, so even before the video starts (or if it fails to load), the user sees the correct final composition.
- Respect `prefers-reduced-motion`: skip video, render the same final composition statically with HTML/CSS.
- The page below the hero should scroll naturally — the hero is one viewport tall, no fancy scroll-jacking.

---

## 7. Quality bar / acceptance criteria

The hero passes review when:

1. The MP4 plays smoothly on first paint with no flash of unstyled content (cream background appears immediately while the video loads).
2. The rose visibly **grows from a bud and opens** — not just a fade-in. Petal motion is the centerpiece of Act I.
3. The sigil appears in a way that feels **drawn in gold**, not pasted. Center-outward reveal + a subtle shine sweep is the minimum.
4. The final frame shows: cream background, faint gold sigil watermark behind, gold title and subtitle in front. No rose visible.
5. Title and subtitle text is **selectable and present in the DOM** (via the a11y overlay), even though it's also baked into the video.
6. `prefers-reduced-motion` users get the static final-state composition — never the animation.
7. Total page weight added by the hero: **MP4 under 2.5 MB** (8 s, 1080p, CRF 20 should land around 1.5–2 MB). If larger, lower the bitrate before lowering visual quality.
8. The static final state of the video, the poster image, and the reduced-motion CSS layout are **visually indistinguishable** from each other.

---

## 8. Build order (suggested)

1. Scaffold both folders (`hero-render/` and `web/`). Copy `rosacruz.png` into both.
2. Build the **static final frame first** in plain HTML/CSS inside `hero-render/src/` — get the cream + gold watermark + title looking exactly right with no animation. This is your visual target.
3. Add Act III animation (text fade-in) — easiest to verify.
4. Add Act II (sigil reveal).
5. Add Act I (rose bloom) — most complex, save for last.
6. Render with HyperFrames, inspect the MP4, iterate.
7. Build the Next.js side, drop in the MP4 and poster, verify autoplay and reduced-motion paths.

---

## 9. Notes & open considerations

- The provided `rosacruz.png` is a square raster image with the gold sigil on a near-white background. In Act II, ensure the sigil renders cleanly on the cream background — if there's any white halo, either pre-process the PNG to a transparent background, or apply `mix-blend-mode: multiply` so the white disappears against the cream.
- If `mix-blend-mode: multiply` darkens the gold too much, the better fix is to remove the white background from the PNG (one-time asset prep) and render it on transparency.
- The rose SVG can be hand-crafted, but it's also acceptable to start from a public-domain rose SVG (e.g. from SVG Repo) and animate its existing petal paths — as long as the bloom motion reads clearly.
