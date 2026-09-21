import './globals.css';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Jsonld } from '@/components/fmt';
import StickyBook from '@/components/StickyBook';
import { SmoothScroll } from '@/components/motion';
import { themeScript } from '@/components/ThemeToggle';
import { seasonScript } from '@/components/seasons';
import { site, orgSchema } from '@/data/site';

// A variable serif with an optical-size axis: it opens up and stays sturdy at
// card size, and sharpens into a high-contrast display face at hero size.
const display = Fraunces({
  subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz', 'SOFT'],
  variable: '--f-display', display: 'swap',
});
// Plus Jakarta Sans underneath it — clean at badge size, steady in the dark.
const body = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--f-body', display: 'swap' });

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Student Trips to Pakistan's Northern Areas`,
    template: `%s — ${site.name}`,
  },
  description:
    'Student trips from Islamabad to Arang Kel and the Neelum valley, Kumrat, Naran, Chitral and Kalash. Van, beds and food sorted. Two days to Arang Kel from PKR 7,999.',
  applicationName: site.name,
  authors: [{ name: site.name }],
  keywords: ['northern areas tour', 'student trips Pakistan', 'Islamabad tour company', 'Arang Kel trip', 'Neelum valley tour', 'Kumrat', 'Naran', 'Kalash valley'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_PK',
    url: '/',
    title: `${site.name} — Student Trips to Pakistan's Northern Areas`,
    description: 'From Islamabad at 540 m to the meadow at Arang Kel at 2,743 m. Small vans, fixed prices, student dates.',
    images: [{ url: '/img/og-cover.jpg', width: 1200, height: 630, alt: 'Snow peaks above an alpine lake in northern Pakistan' }],
  },
  twitter: { card: 'summary_large_image', title: site.name, description: `${site.tagline}. Group trips from Islamabad.`, images: ['/img/og-cover.jpg'] },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  manifest: '/site.webmanifest',
  other: { 'geo.region': 'PK-IS', 'geo.placename': site.city },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A110D' },
    { media: '(prefers-color-scheme: light)', color: '#EDF0EC' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: seasonScript }} />
      </head>
      {/* Extensions such as Grammarly stamp attributes onto <body> before React
          hydrates. This silences only that attribute diff on this one tag —
          mismatches anywhere inside the page are still reported. */}
      <body suppressHydrationWarning>
        <a className="skip" href="#main">Skip to content</a>
        <SmoothScroll />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <StickyBook />
        <Jsonld data={[orgSchema, { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name, publisher: { '@id': `${site.url}/#org` }, inLanguage: 'en' }]} />
      </body>
    </html>
  );
}
