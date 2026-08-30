# Nova Verse Academy — Website

Official marketing website for **Nova Verse Academy** — an online programming academy focused on building practical technology skills through a structured, project-based learning journey.

**Brand slogan:** `Explore. Code. Create.`

**Live site:** https://nova-verse-nine.vercel.app/

---

## Current Website Goal

The website is designed primarily for parents and follows a simple conversion funnel:

**Website → WhatsApp → Sales / Support conversation → Enrollment**

WhatsApp is the main enrollment channel. The site intentionally does **not** use a pre-enrollment registration form, placement-test flow, free-assessment booking flow, or public pricing section.

---

## Learning Path

Nova Verse currently presents one connected learning journey divided into four branded levels:

| Level | Focus | Length |
|---|---|---:|
| **Explorer** | Computer fundamentals, logical thinking, algorithms, Scratch visual programming | 12 sessions |
| **Builder** | Python programming and a practical Python project | 12 sessions |
| **Creator** | HTML, CSS, VS Code, and introductory JavaScript concepts | 12 sessions |
| **Innovator** | AI concepts, prompting, AI tools, critical thinking, and responsible use | 12 sessions |

The complete path contains **48 sessions**, with a **final project at the end of every level**.

Scratch is the primary visual-programming platform used in the public positioning of Level 1.

---

## Learning Formats

The website currently presents two learning options:

- **Group Classes** — learning with a small group in an interactive, structured environment.
- **1-on-1 Classes** — individual sessions with more personalized attention and learning pace flexibility.

Each option has its own WhatsApp CTA and pre-filled message so parents can start the relevant conversation directly.

---

## Homepage Structure

The current Arabic homepage follows this order:

1. **Hero** — Nova Verse positioning, primary WhatsApp CTA, learning-path CTA, and key program stats.
2. **Why Nova Verse** — interactive card deck presenting the academy's main advantages.
3. **Learning Path** — Explorer → Builder → Creator → Innovator.
4. **Group vs 1-on-1** — learning-format comparison with direct WhatsApp CTAs.
5. **Parent FAQ** — answers to confirmed parent questions only.
6. **Final WhatsApp CTA** — direct enrollment conversation entry point.
7. **Footer**.

Testimonials are intentionally hidden until verified parent reviews are available.

---

## Parent FAQ Topics

The live FAQ currently covers:

- Whether previous programming experience is required.
- Whether the student needs a laptop or computer.
- Arabic vs English usage during lessons.
- Tasks and practice between sessions.
- The difference between Group and 1-on-1 learning.

Unconfirmed operational details such as exact pricing, exact group size, make-up-session policy, and scheduling rules should **not** be published until finalized.

---

## WhatsApp Integration

WhatsApp links are generated in:

```text
/js/main.js
```

The WhatsApp number is configured through:

```js
const WHATSAPP_NUMBER = "...";
```

Elements with the `data-whatsapp` attribute are automatically converted into `wa.me` links.

Section-specific messages can be configured using:

```html
data-whatsapp-message="..."
```

Current CTA categories include:

- Main enrollment inquiry
- Learning-path inquiry
- Group Classes inquiry
- 1-on-1 inquiry

WhatsApp buttons use the Nova Verse visual system while retaining a clear WhatsApp icon as a destination cue. A floating WhatsApp shortcut is also available across the main experience.

---

## Languages

The main website is **Arabic-first** and fully supports RTL layout.

An English homepage is available at:

```text
/en/index.html
```

The language switch in the header links between the Arabic and English homepages.

> Note: the English version currently covers the homepage. The other supporting pages are still primarily Arabic.

---

## Pages

```text
index.html                Arabic homepage
about.html                About Nova Verse
contact.html              Contact page
become-instructor.html    Instructor application page
en/index.html             English homepage
```

### About Page

The About page currently focuses on:

- Nova Verse mission
- Nova Verse vision
- Why the academy exists
- Learning philosophy and educational principles

It intentionally avoids unverified testimonials, social-media placeholders, and free-trial messaging.

### Become an Instructor

The instructor application form collects:

- Full name
- Email
- Phone number
- Years of experience
- Specialization
- CV upload

The form currently submits through **FormSubmit** to the academy's configured recruitment inbox. The receiving email is intentionally not displayed publicly on the marketing pages.

---

## Tech Stack

The website intentionally uses a lightweight stack with no front-end framework:

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **SVG illustrations/assets**
- **Google Fonts — Cairo**
- **Vercel** for deployment
- **FormSubmit** for instructor applications

No backend is required for the public marketing website.

---

## Project Structure

```text
Nova_Verse/
│
├── assets/
│   ├── images/              Logo, hero artwork, and visual assets
│   └── icons/               Reserved icon assets
│
├── css/
│   ├── variables.css        Design tokens and CSS variables
│   ├── base.css             Reset, typography, containers, shared layout
│   ├── header.css           Sticky navigation and mobile menu
│   ├── components.css       Buttons, cards, badges, forms, WhatsApp UI
│   ├── sections.css         Hero and section-specific layouts
│   ├── faq.css              Parent FAQ styles
│   ├── animations.css       Motion and reveal effects
│   └── responsive.css       Responsive breakpoints
│
├── js/
│   └── main.js              WhatsApp links, navigation, starfield, reveals,
│                            Why Nova Verse card deck, and shared interactions
│
├── en/
│   └── index.html           English homepage
│
├── index.html               Arabic homepage
├── about.html
├── contact.html
├── become-instructor.html
└── README.md
```

---

## Design System

The visual identity follows a **premium cosmic / deep-space** direction:

- Deep navy backgrounds
- Blue, violet, and cyan gradients
- Subtle teal accents around WhatsApp CTAs
- Glass-like surfaces used selectively
- Stars, orbital elements, and cosmic lighting
- Cairo typography for Arabic readability
- Rounded cards and buttons
- Responsive RTL-first layout

Colors and major design values are managed through CSS variables in:

```text
/css/variables.css
```

The website no longer exposes a public theme-switching control; the language switch is prioritized in the navigation instead.

---

## JavaScript Responsibilities

`js/main.js` currently handles:

- WhatsApp URL generation and section-specific messages
- WhatsApp CTA icon injection
- Sticky-header scroll state
- Mobile navigation toggle
- Scroll-reveal animations
- Interactive **Why Nova Verse** card deck
- Animated starfield canvas
- Instructor CV filename display

The Learning Path itself is intentionally presented as a structured four-level section rather than a swipe card deck.

---

## Content Rules

When updating the website, keep the following product decisions consistent:

- Do **not** publish a fixed age restriction in the public marketing copy unless the academy strategy changes.
- Do **not** add a free-trial CTA.
- Do **not** add pricing until pricing is finalized for publication.
- Do **not** publish exact group sizes, scheduling rules, or make-up policies unless officially confirmed.
- Do **not** add fake testimonials.
- Keep **WhatsApp as the primary enrollment conversion path**.
- Keep Level 1 focused publicly on **computer fundamentals + logical thinking + algorithms + Scratch**.
- Keep the four Nova Verse identities: **Explorer, Builder, Creator, Innovator**.
- Keep a final project in every level.

---

## Local Development

No build process is required.

Clone the repository and open the project with any static web server.

For example with VS Code Live Server, open:

```text
index.html
```

Or with Python:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

---

## Deployment

The project is deployed as a static website on **Vercel**.

Changes pushed to the connected production branch are deployed automatically by Vercel.

---

## Current Status

The site is actively being refined. Current priorities are:

- Parent trust and clarity
- Strong mobile and desktop responsiveness
- Consistent Arabic / English presentation
- Clear WhatsApp conversion cues without breaking the Nova Verse visual identity
- Maintaining a premium, professional appearance rather than a childish or template-like coding-school aesthetic

---

**Nova Verse Academy**  
**Explore. Code. Create.**
