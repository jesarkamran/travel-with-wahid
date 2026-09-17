// Single source of truth. Edit content here, not in the pages.
export const site = {
  name: 'Travel With Wahid',
  tagline: 'Exploring Pakistan & Beyond',
  bio: '✨ Exploring Pakistan & Beyond 🌍  📍 Islamabad — organizing student trips to the Northern Areas.',
  url: 'https://travelwithwahid.com', // EDIT: your domain
  city: 'Islamabad',
  phone: '+92 336 3202576',
  wa: 'https://wa.me/923363202576',
  waGroup: 'https://chat.whatsapp.com/GhAWT6pplhB7xk5o4RPT9F',
  instagram: 'https://www.instagram.com/travelwithwahid',
};

export const waLink = (msg) => `${site.wa}?text=${encodeURIComponent(msg)}`;

export const tours = [
  {
    slug: 'kalam-mahodand-lake',
    title: 'Kalam & Mahodand Lake',
    dates: '8–9 August',
    start: '2026-08-08',
    end: '2026-08-09',
    duration: '2 Days',
    price: 7999,
    img: 'kalam.jpg',
    region: 'Swat Valley · KPK',
    badge: null,
    blurb:
      'Swat Valley, Bahrain Bazaar, Blue Point and the jeep track up to Mahodand Lake — the classic weekend escape from Islamabad.',
    includes: ['Breakfast included', 'Jeep charges covered', '1 night accommodation'],
    stops: ['Swat Valley', 'Bahrain Bazaar', 'Blue Point', 'Mahodand Lake'],
    itinerary: [
      { day: 'Day 1', text: 'Night departure from Islamabad, breakfast en route, Swat Valley and a stop at Bahrain Bazaar. Blue Point in the afternoon, check in at Kalam by evening.' },
      { day: 'Day 2', text: 'Early jeep ride up to Mahodand Lake, time at the lake, then the drive back down to Islamabad the same night.' },
    ],
    excludes: ['Personal shopping', 'Entry tickets not listed above', 'Anything bought en route'],
  },
  {
    slug: 'fairy-meadows-nanga-parbat',
    title: 'Fairy Meadows & Nanga Parbat Base Camp',
    dates: '23–27 August',
    start: '2026-08-23',
    end: '2026-08-27',
    duration: '5 Days',
    price: 14999,
    img: 'fairy-meadows.jpg',
    region: 'Gilgit-Baltistan',
    badge: 'Holi Colors',
    blurb:
      'Four nights under the ninth highest mountain on earth, with the walk up to base camp and a Holi Colors evening at the meadows.',
    includes: ['Pickup & drop service', 'Full catering', '4 nights / 5 days'],
    stops: ['Fairy Meadows', 'Nanga Parbat Base Camp'],
    itinerary: [
      { day: 'Day 1', text: 'Departure from Islamabad on the Karakoram Highway towards Chilas.' },
      { day: 'Day 2', text: 'Jeep up the Raikot track, then the walk in to Fairy Meadows. Camp set up, Holi Colors evening.' },
      { day: 'Day 3', text: 'Full day trek to Nanga Parbat Base Camp and back to the meadows.' },
      { day: 'Day 4', text: 'Beyal camp and free time at the meadows, descent to the jeep point, drive south.' },
      { day: 'Day 5', text: 'Arrival back in Islamabad.' },
    ],
    excludes: ['Personal shopping', 'Porter charges for personal luggage', 'Anything bought en route'],
  },
];

export const destinations = [
  { n: '01', name: 'Kumrat Valley', region: 'Upper Dir · KPK', desc: 'Pine forest, river camps, Jahaz Banda.', img: 'kumrat.jpg', season: 'May – Sep' },
  { n: '02', name: 'Naran & Saif-ul-Malook', region: 'Kaghan Valley', desc: 'The lake everyone comes back for.', img: 'naran.jpg', season: 'Jun – Sep' },
  { n: '03', name: 'Chitral & Kalash', region: 'Chitral · KPK', desc: 'Lowari tunnel, Bumburet, living culture.', img: 'kalash.jpg', season: 'Apr – Oct' },
  { n: '04', name: 'Ganga Choti', region: 'Bagh · AJK', desc: 'A one-day summit hike in AJK.', img: 'ganga-choti.jpg', season: 'All year' },
];

// Home-page photo strip
export const gallery = [
  { img: 'mahodand.jpg', label: 'Mahodand Lake', place: 'Kalam' },
  { img: 'kumrat-river.jpg', label: 'River camp', place: 'Kumrat' },
  { img: 'nanga-parbat.jpg', label: 'Nanga Parbat', place: 'Gilgit-Baltistan' },
  { img: 'saiful-muluk.jpg', label: 'Saif-ul-Malook', place: 'Naran' },
  { img: 'kalash-people.jpg', label: 'Kalash valleys', place: 'Chitral' },
  { img: 'ganga-choti.jpg', label: 'Ganga Choti', place: 'Bagh, AJK' },
];

export const faqs = [
  { q: 'Where do the trips start from?', a: 'Every trip departs from Islamabad. Pickup points are shared in the WhatsApp group a few days before departure, and pickup and drop are included on most packages.' },
  { q: 'What is included in the price?', a: 'Transport, accommodation, the meals listed on the tour page, and local jeep charges where the route needs them. Personal shopping, unlisted entry tickets and anything bought on the way are not included.' },
  { q: 'Do I need to be a student to join?', a: 'No. The trips are built around student budgets and university schedules, but everyone travelling in a respectful group setting is welcome.' },
  { q: 'How do I book a seat?', a: 'Message WhatsApp at +92 336 3202576 or join the group. Your seat is confirmed once the advance is paid — groups are small and they fill quickly.' },
  { q: 'Can families and solo female travellers join?', a: 'Yes. Families and solo travellers join regularly, and rooms are allocated separately for female travellers.' },
  { q: 'What should I pack?', a: 'A warm layer even in summer, comfortable shoes for jeep tracks and short hikes, a power bank, ID card, and any personal medication. A full list goes out in the group before departure.' },
];

// EDIT: replace with real reviews before launch
export const reviews = [
  { text: 'Everything was arranged before we even reached the pickup point. First time in the north and I never felt lost.', by: 'Student group · Kalam' },
  { text: 'The price on the poster was the price we paid. That alone is rare here.', by: 'Traveller · Fairy Meadows' },
  { text: 'Small group, good food, and someone who knew exactly when to leave to beat the traffic.', by: 'University society · Kumrat' },
];

export const orgSchema = {
  '@type': ['TravelAgency', 'LocalBusiness'],
  '@id': `${site.url}/#org`,
  name: site.name,
  description: `${site.tagline}. Organizing student trips to the Northern Areas from Islamabad.`,
  url: `${site.url}/`,
  telephone: site.phone.replace(/\s/g, ''),
  image: `${site.url}/img/og-cover.jpg`,
  logo: `${site.url}/favicon.svg`,
  priceRange: 'PKR 7,999 – PKR 14,999',
  areaServed: { '@type': 'Country', name: 'Pakistan' },
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: 'PK' },
  sameAs: [site.instagram, site.waGroup],
};

export const tripSchema = (t) => ({
  '@type': 'TouristTrip',
  name: t.title,
  description: t.blurb,
  url: `${site.url}/tours/${t.slug}/`,
  provider: { '@id': `${site.url}/#org` },
  itinerary: {
    '@type': 'ItemList',
    itemListElement: t.stops.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'TouristAttraction', name: s },
    })),
  },
  offers: {
    '@type': 'Offer',
    price: String(t.price),
    priceCurrency: 'PKR',
    availability: 'https://schema.org/InStock',
    url: `${site.url}/tours/${t.slug}/`,
  },
});

export const faqSchema = (list = faqs) => ({
  '@type': 'FAQPage',
  mainEntity: list.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

// Photo credits — all Creative Commons, commercial use permitted. Attribution is
// a licence condition: keep the credits block on /about if you keep these photos.
export const credits = [
  { file: 'hero.jpg', title: 'Nanga Parbat The Killer Mountain', by: 'Tahsin Anwar Ali', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=40616492' },
  { file: 'tours/kalam.jpg', title: 'Mahodand Lake, Kalam', by: 'Muhaddas', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=40255478' },
  { file: 'tours/fairy-meadows.jpg', title: 'Fairy Meadows & Nanga Parbat', by: 'Muhammad Awaab', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=40128735' },
  { file: 'tours/kumrat.jpg', title: 'Camping in Kumrat Valley', by: 'Abdur Rehman 1982', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=40453518' },
  { file: 'tours/naran.jpg', title: 'Saiful Muluk Lake, Naran', by: 'Eesha Tariq', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=58429771' },
  { file: 'tours/kalash.jpg', title: 'Kalash Valley, Chitral', by: 'Waleed0343', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=49084034' },
  { file: 'tours/ganga-choti.jpg', title: 'Ganga Choti', by: 'Minhalsherazi', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=58497270' },
  { file: 'tours/mahodand.jpg', title: 'Mahodand Lake, Kalam', by: 'Nadar Sian', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=58773413' },
  { file: 'tours/saiful-muluk.jpg', title: 'Saiful Muluk Lake, Naran', by: 'Nawabtanweer', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=48579838' },
  { file: 'tours/kalash-people.jpg', title: 'Kalash children in local dress, Chitral', by: 'Syed Fida Ali Shah Fidai', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=68727795' },
  { file: 'tours/kumrat-river.jpg', title: 'Kumrat Valley, Dir', by: 'Mafu75', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/w/index.php?curid=40490813' },
  { file: 'tours/nanga-parbat.jpg', title: 'Nanga Parbat', by: 'Guilhem Vellut', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/', source: 'https://www.flickr.com/photos/22539273@N00/55898931' },
];
