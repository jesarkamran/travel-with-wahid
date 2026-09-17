import './globals.css';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Fab, Jsonld } from '@/components/ui';
import { site, orgSchema } from '@/data/site';

const display = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--f-display', display: 'swap' });
const body = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body', display: 'swap' });

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Student Trips to Pakistan's Northern Areas`,
    template: `%s · ${site.name}`,
  },
  description:
    'Budget student trips from Islamabad to Kalam, Fairy Meadows, Naran, Kumrat, Chitral & Kalash. Transport, stay and meals sorted. Kalam from PKR 7,999 — book on WhatsApp.',
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
    description: `${site.tagline}. Affordable, well-run group trips from Islamabad to the north. Kalam from PKR 7,999.`,
    images: [{ url: '/img/og-cover.jpg', width: 1200, height: 630, alt: 'Snow peaks above an alpine lake in northern Pakistan' }],
  },
  twitter: { card: 'summary_large_image', title: site.name, description: `${site.tagline}. Group trips from Islamabad.`, images: ['/img/og-cover.jpg'] },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  manifest: '/site.webmanifest',
  other: { 'geo.region': 'PK-IS', 'geo.placename': site.city },
};

export const viewport = { themeColor: '#0C1B22' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Fab />
        <Jsonld data={[orgSchema, { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name, publisher: { '@id': `${site.url}/#org` }, inLanguage: 'en' }]} />
      </body>
    </html>
  );
}
