# Travel With Wahid — Next.js site

Next 15 App Router, **static export**. `npm run build` writes plain HTML into `out/`
— including `out/index.html` — so it hosts anywhere (Netlify, Cloudflare Pages,
GitHub Pages, cPanel, plain nginx). No server, no Node runtime needed.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # -> out/
npm run preview    # serve the built out/ folder
```

## Pages

| Route | File |
|---|---|
| `/` | `app/page.js` |
| `/tours` | `app/tours/page.js` |
| `/tours/[slug]` | `app/tours/[slug]/page.js` — one static page per tour |
| `/destinations` | `app/destinations/page.js` |
| `/about` | `app/about/page.js` |
| `/faq` | `app/faq/page.js` |
| `/contact` | `app/contact/page.js` |
| 404 | `app/not-found.js` |

`sitemap.xml` and `robots.txt` are generated from `app/sitemap.js` / `app/robots.js`.

## Editing content

**All content lives in `data/site.js`.** Tours, destinations, FAQs, reviews, phone
number, links. Add an object to `tours` and a new page, card, sitemap entry and
`TouristTrip` schema all appear on the next build — no page edits.

Before launch:
1. `site.url` in `data/site.js` → your real domain.
2. Photos: `public/img/` ships with Creative Commons shots of the actual valleys,
   credited on `/about` (a licence condition — keep that block, or replace the
   photos and drop it). Swap in your own trip photos keeping the same filenames.
   A missing file falls back to a gradient, so nothing ever breaks.
3. Replace the placeholder `reviews` in `data/site.js` with real ones.

## SEO

Metadata API (canonical per page, OG, Twitter cards, keywords, robots), JSON-LD for
`TravelAgency` + `WebSite` sitewide and `TouristTrip` + `Offer` + `BreadcrumbList` +
`FAQPage` + `ItemList` per page, generated sitemap and robots, semantic headings,
skip link, `aria-current` nav, reduced-motion support, self-hosted fonts via
`next/font` (no render-blocking Google request).

## Deploy

Any static host. Upload `out/`. On Cloudflare Pages / Netlify: build `npm run build`,
output directory `out`. Then submit `sitemap.xml` in Google Search Console.
