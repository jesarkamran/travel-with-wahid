import { site, tours } from '@/data/site';

export const dynamic = 'force-static';

export default function sitemap() {
  const now = new Date();
  const pages = ['', '/tours', '/destinations', '/about', '/faq', '/contact'];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}/`.replace(/\/\/$/, '/'), lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.8 })),
    ...tours.map((t) => ({ url: `${site.url}/tours/${t.slug}/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 })),
  ];
}
