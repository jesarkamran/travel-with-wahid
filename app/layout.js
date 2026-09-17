import './globals.css';
import { Cormorant_Garamond, Karla } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Jsonld } from '@/components/ui';
import { site, orgSchema } from '@/data/site';

// A delicate high-contrast serif, set light and large — the calm voice.
const display = Cormorant_Garamond({
  subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'],
  variable: '--f-display', display: 'swap',
});
// Karla is warm and quiet underneath it, and holds up at small sizes.
const body = Karla({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-body', display: 'swap' });

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Student Trips to Pakistan's Northern Areas`,
    template: `%s — ${site.name}`,
  },
  description:
    'Student trips from Islamabad to Kalam, Fairy Meadows, Naran, Kumrat, Chitral and Kalash. Van, beds and food sorted. Two days to Mahodand from PKR 7,999.',
  applicationName: site.name,
  authors: [{ name: site.name }],
  keywords: ['northern areas tour', 'student trips Pakistan', 'Islamabad tour company', 'Kalam tour package', 'Fairy Meadows trip', 'Kumrat', 'Naran', 'Kalash valley'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_PK',
    url: '/',
    title: `${site.name} — Student Trips to Pakistan's Northern Areas`,
    description: 'From Islamabad at 540 m to Nanga Parbat Base Camp at 4,600 m. Small vans, fixed prices, student dates.',
    images: [{ url: '/img/og-cover.jpg', width: 1200, height: 630, alt: 'Snow peaks above an alpine lake in northern Pakistan' }],
  },
  twitter: { card: 'summary_large_image', title: site.name, description: `${site.tagline}. Group trips from Islamabad.`, images: ['/img/og-cover.jpg'] },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  manifest: '/site.webmanifest',
  other: { 'geo.region': 'PK-IS', 'geo.placename': site.city },
};

export const viewport = { themeColor: '#EDF0EC' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Jsonld data={[orgSchema, { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name, publisher: { '@id': `${site.url}/#org` }, inLanguage: 'en' }]} />
      </body>
    </html>
  );
}
