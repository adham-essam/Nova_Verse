# Nova Verse Academy — Website

A fully responsive, production-ready marketing site for Nova Verse Academy, built with plain HTML, CSS, and vanilla JavaScript (no frameworks, no backend).

## Structure

```
/assets
  /images   → logo mark, hero illustration (SVG)
  /icons    → reserved for future icon assets (icons are currently inlined in HTML)
/css
  variables.css   → design tokens & both color themes
  base.css        → reset, typography, layout utilities
  header.css      → sticky nav
  components.css  → buttons, cards, forms, badges
  sections.css    → hero, trust, courses, footer, page-specific layout
  animations.css  → keyframes + scroll-reveal
  responsive.css  → breakpoints
/js
  main.js   → starfield canvas, nav, theme toggle, scroll reveal, WhatsApp links, forms
index.html
about.html
contact.html
become-instructor.html
```

## Before you launch

1. **WhatsApp number** — open `js/main.js` and replace the placeholder in:
   ```js
   const WHATSAPP_NUMBER = "201000000000";
   ```
   with your real number in international format, no `+` or leading `00`.

2. **Email & address** — replace the placeholder email (`info@novaverseacademy.com`) and address text in `contact.html` and the footers of all pages.

3. **Social links** — the Facebook / Instagram / LinkedIn / TikTok icons currently show "Coming Soon" and link to `#`. Update the `href` attributes once accounts exist, and remove the `social-soon` label.

4. **Testimonials** — a placeholder section is included in `index.html` (`#testimonials`). Replace it with real parent testimonials once available — do not launch with fabricated reviews.

5. **Form submission** — the instructor application form (`become-instructor.html`) currently only shows a confirmation message client-side (no backend). Wire it up to your email service, CRM, or a serverless endpoint before relying on it to collect real applications.

## Theming

The site ships with two themes driven entirely by CSS variables:

- **Deep Space** (default)
- **Premium Cosmic** — activated by setting `data-theme="premium"` on `<html>`

Visitors can switch themes using the toggle button in the header; their choice is remembered via `localStorage`.

## Notes

- Fully RTL, Arabic-first (`dir="rtl"`, `lang="ar"`), using the Cairo typeface via Google Fonts.
- Mobile-first responsive layout, semantic HTML, visible focus states, and `prefers-reduced-motion` support built in.
- All illustrations are original hand-built SVGs — no stock photography.
