# Ayush Kumar Panigrahi — Portfolio

Single-page developer portfolio. Vanilla HTML/CSS/JS + Three.js (hero 3D) + GSAP ScrollTrigger (scroll reveals). No build step — serve the folder and open `index.html`.

```bash
# any static server works; file:// won't load the ES-module hero scene in some browsers
npx serve .
```

## Design tokens

| Token | Hex | Role |
|---|---|---|
| Void | `#05070E` | Page base — deep space blue-black |
| Panel | `#0C1322` | Card surfaces (IDE-sidebar feel) |
| Trace | `#22304F` | Borders / circuit-trace lines |
| Phosphor | `#E8EDF7` | Primary text |
| Cursor Cyan | `#53C8FF` | Interactive accent |
| Ayu Amber | `#FFB454` | Signature accent (Ayu editor theme → "Ayush") |

Type: **Space Grotesk** (display) + **JetBrains Mono** (labels/code).

## Supabase (project `sjqonfzpasbsrzvljiid`)

- **Contact form** inserts into `public.contact_messages` with the anon key. RLS: anon can INSERT only; SELECT/UPDATE require an authenticated session.
- **Admin inbox** at `admin.html` — unlisted (no links to it), `noindex`, blocked in `robots.txt`. Real `signInWithPassword` login; includes a mark-read/unread toggle.
  - **One-time setup:** Supabase dashboard → Authentication → Users → *Add user* with Ayush's email + password. That account is the only admin; there is deliberately no signup form.
- **Certificates** load thumbnails from the public `portfolio-media` bucket, folders:
  `certs/cisco/`, `certs/credly/`, `certs/great-learning/`, `certs/hackerrank/`, `certs/infosys-springboard/`
  **Filename convention = the label**: title-case with hyphens for spaces, e.g. `CCNA-Introduction-to-Networks.pdf` displays as "CCNA Introduction to Networks" (extension stripped, hyphens → spaces — no name list in code). If a folder is empty or unreachable, the static name chips in `index.html` show instead.
- Only the **anon** key ships in `js/supa.js`. Never put the service-role key in any file here — this site has no server; RLS is the security boundary.

## Before shipping — swap these in

- [ ] `assets/ayush-hero.jpg` — the one real photo (hero ID card; a styled placeholder shows until it exists)
- [ ] `assets/Ayush_Kumar_Panigrahi_Resume.pdf` — resume for the two Download buttons
- [ ] Contact: phone number and LinkedIn URL (search `TODO` in `index.html`)
- [ ] Education: exact school + junior college names/years (marked `[port … from current site]`)
- [ ] Create the single admin auth user (see Supabase section above)
- [ ] Upload certificate files to `portfolio-media/certs/{issuer}/`

DevSync and RideVault show a repo button only, with no live link, because both are still in development (marked with the "In development" pill on their cards).

## Structure

- `index.html` — all content, anchor-nav sections (About / Skills / Experience / Projects / Contact)
- `admin.html` — private message inbox (login-gated; not linked from the public site)
- `robots.txt` — blocks `/admin` from crawlers
- `css/style.css` — tokens, layout, micro-interactions, responsive + reduced-motion rules
- `js/cursor.js` — custom dot+ring cursor (lerp/spring; off on touch & reduced motion)
- `js/background.js` — dependency-graph node field (cursor-reactive; static frame under reduced motion)
- `js/main.js` — GSAP scroll orchestration, tilt cards, nav, archive toggle
- `js/hero3d.js` — Three.js code-orbit wireframe sphere (CSS glyph fallback without WebGL)
- `js/supa.js` — shared Supabase client (anon key only)
- `js/contact.js` — contact form → `contact_messages`
- `js/lightbox.js` — shared lightbox (img/pdf/video; injects its own DOM)
- `js/certs.js` — lazy cert thumbnails from storage
- `js/gallery.js` — design-gallery grid renderer (images + hover-preview videos)
- `logo-designs.html`, `logo-animations.html`, `event-posters.html`, `promo-videos.html` — gallery pages fed by `portfolio-media` folders (`logos/`, `logo-animations/`, `event-posters/`, `event-promos/`); labels derive from filenames (hyphens/underscores → spaces)
- `js/admin.js` — admin login gate + inbox rendering
