# Nova Verse Academy: SEO implementation and launch checklist

Primary origin: **https://www.novaverseacademy.com**. Last implementation review: **2026-10-25**.

## Implemented in source

- Six indexable, server-rendered static HTML pages, arranged as three Arabic/English pairs.
- Distinct search titles and descriptions reflecting the actual kids' coding offer.
- Self-referencing absolute canonical URLs; Arabic and English remain separate canonical pages.
- Reciprocal `ar`, `en`, and `x-default` language annotations in HTML and sitemap.
- Canonical-only XML sitemap with all six public URLs. No arbitrary last-modified dates or priority claims.
- Crawlable robots.txt with sitemap discovery. CSS, JS and images remain crawlable.
- Permanent 308 redirects for the legacy production host, apex hostname and explicit index aliases. Paths and query strings are retained by Vercel. Existing `.html` supporting-page URLs are retained.
- No automatic language redirect based on cookies, IP or browser language.
- JSON-LD: EducationalOrganization, WebSite, WebPage, AboutPage, ContactPage, BreadcrumbList and four Course entities in an ItemList on each homepage. Course descriptions come from the visible cards.
- Real page fragments identify all four courses. No invented address, ratings, reviews, prices, accreditations or social profiles.
- Open Graph and Twitter metadata on all public pages with a 1200 × 630 PNG sharing card derived from the existing logo, a raster organization logo, PNG favicon, ICO fallback and Apple touch icon.
- Recruitment page excluded from sitemap/navigation and given HTML and HTTP `noindex, nofollow, nosnippet`. It is deliberately not blocked in robots.txt, so crawlers can read the noindex rule. This controls search indexing, not access permissions.
- API response noindex header; existing secret recipient and application flow retained.
- Custom 404 page and no catch-all rewrite, so nonexistent URLs retain a real HTTP 404.
- Canonical internal links, equivalent-page language switches and a faithful English About translation.
- WhatsApp links work directly in HTML without JavaScript. Existing click-event tracking is retained.
- Content visible by default without JavaScript. Below-fold reveal animation is progressive enhancement.
- Explicit image dimensions and high fetch priority for the hero illustration.
- Background canvas pauses in hidden tabs, honors reduced motion and caps star density.
- Placeholder social icons are informational spans instead of dead `href="#"` links.
- Encoding is declared before analytics; public pages have language/direction, viewport and a skip link.
- Developer docs and check scripts excluded from Vercel deployment using `.vercelignore`.

## Canonical URL and search intent map

| Arabic | English | Intent |
| --- | --- | --- |
| `/` | `/en/` | Online coding and AI classes for kids; تعليم البرمجة للأطفال أونلاين |
| `/about.html` | `/en/about.html` | Academy identity, mission and teaching approach |
| `/contact.html` | `/en/contact.html` | Enrollment and learning-path enquiries via WhatsApp |

The four levels remain Explorer, Builder, Creator and Innovator. Do not publish age restrictions, prices, lesson length, refund policies or new promises without an explicit content decision. Keep the learning path connected; do not generate near-duplicate city/keyword doorway pages.

## Verification

Run from the repository root:

```bash
python scripts/check-seo.py
node --check js/main.js
node --check api/instructor-application.mjs
git diff --check
```

The SEO check validates metadata, canonical/hreflang reciprocity, sitemap membership, local asset/link/fragment targets, course descriptions against visible copy, image dimensions, analytics privacy flags, hidden-page exclusions and redirect configuration. It does not replace Google URL Inspection, the Rich Results Test or real mobile field metrics.

After Vercel publication, check live HTTP statuses and returned HTML; redirects are hosting behavior and cannot be proved by a plain static preview. Test old host, apex, `/index.html`, `/en/index.html`, `/en`, all six canonical URLs, robots, sitemap, image URLs, hidden-page response headers and a unique nonexistent URL. Verify a UTM query survives the legacy-host redirect. Recruitment testing is read-only; do not submit fabricated applications.

## Account setup still requiring authenticated access

These are account actions, not changes that can be completed just by shipping HTML.

1. **Google Search Console:** add the Domain property `novaverseacademy.com` under the academy's intended owner account. Complete DNS TXT verification if requested. Add only the TXT record Google gives you; preserve Vercel, Workspace MX, SPF, DKIM and DMARC records.
2. Submit `https://www.novaverseacademy.com/sitemap.xml` in Sitemaps. Confirm Google reports Success. Do not repeatedly resubmit unchanged URLs.
3. Inspect the Arabic and English homepages, run Test Live URL, review crawling/indexing eligibility, rendered page, selected canonical and available resources, then request indexing once for important new/changed URLs.
4. If the old `nova-verse-nine.vercel.app` URL-prefix property is owned and had indexed URLs, verify the new property and use Google's Change of Address workflow when available/applicable. The permanent redirects and new sitemap remain necessary regardless.
5. Check Security Issues and Manual Actions. Monitor Page Indexing, Sitemaps and search Performance for the new domain. A new domain may initially have no impressions or field data.
6. Link Search Console with the existing GA4 property under Admin → Product links → Search Console links if the same account has the needed permissions. Confirm the web stream website URL uses the new primary domain. Do not create a duplicate GA4 property or replace measurement ID `G-5CK8XPB7XG`.
7. In GA4, verify organic acquisition and `whatsapp_click` in Realtime/DebugView; mark the intended event as a key event if desired. A WhatsApp click measures an outbound enquiry attempt, not a completed enrollment.
8. **Bing Webmaster Tools:** import the verified Search Console property when offered, or verify the domain directly. Submit the same canonical sitemap and inspect the homepage.
9. Update owned social-profile website fields and ad destinations to the primary domain. No social account URLs were supplied, so no guessed profiles or `sameAs` markup were added.

## Performance and rich-result validation

- Run PageSpeed Insights for mobile and desktop after the production deployment. Address measured failures instead of guessing at a perfect score.
- Use the Rich Results Test and Schema Markup Validator on production URLs. Valid JSON alone is not proof of rich-result eligibility. Availability and display depend on Google's current feature support and policies.
- Review real Core Web Vitals when enough field data exists. Do not claim LCP/INP/CLS compliance from image dimensions or a single lab run.
- The online-only academy has no verified in-person service location, so no physical LocalBusiness address or Google Maps listing is fabricated.
- Google determines crawling, indexing, snippets and ranking. Technical checks cannot guarantee indexing, first position or 100/100 scores.

## Maintenance

When adding or moving a public page, update its canonical, both language annotations and their return links, the sitemap, internal navigation and this intent map. Exclude drafts, error/status pages and recruitment content. Keep structured data synchronized with visible information. Keep the old-domain redirects for at least a year, preferably indefinitely. Continue evaluating search queries and enquiries before expanding content.

Primary references:

- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://vercel.com/docs/project-configuration/vercel-json
