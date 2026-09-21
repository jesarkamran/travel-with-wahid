// Content comes from data/site.json, which is generated from data/content.xlsx
// by `npm run content` (it runs automatically before dev and build, and only
// rebuilds when the workbook is newer than the json). Edit the workbook, not
// this file — only the derived helpers below belong here.
import data from "./site.json";

export const {
  site,
  nextDeparture,
  tours,
  steps,
  destinations,
  gallery,
  faqs,
  reviews,
  credits,
} = data;

export const waLink = (msg) => `${site.wa}?text=${encodeURIComponent(msg)}`;

export const orgSchema = {
  "@type": ["TravelAgency", "LocalBusiness"],
  "@id": `${site.url}/#org`,
  name: site.name,
  description: `${site.tagline}. Student trips to the Northern Areas of Pakistan, departing Islamabad.`,
  url: `${site.url}/`,
  telephone: site.phone.replace(/\s/g, ""),
  image: `${site.url}/img/og-cover.jpg`,
  logo: `${site.url}/logo.png`,
  priceRange: "PKR 7,999 – PKR 14,999",
  areaServed: { "@type": "Country", name: "Pakistan" },
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressCountry: "PK",
  },
  sameAs: [site.instagram, site.waGroup],
};

export const tripSchema = (t) => ({
  "@type": "TouristTrip",
  name: t.title,
  description: t.blurb,
  url: `${site.url}/tours/${t.slug}/`,
  provider: { "@id": `${site.url}/#org` },
  itinerary: {
    "@type": "ItemList",
    itemListElement: t.profile.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: s.name,
        elevation: `${s.m} m`,
      },
    })),
  },
  offers: {
    "@type": "Offer",
    price: String(t.price),
    priceCurrency: "PKR",
    availability: "https://schema.org/InStock",
    url: `${site.url}/tours/${t.slug}/`,
  },
});

export const faqSchema = (list = faqs) => ({
  "@type": "FAQPage",
  mainEntity: list.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
