import { about, block } from '@/data/site';
import About from '@/components/About';

export const metadata = {
  title: 'About',
  description: block(about, 'description')[0]?.text,
  alternates: { canonical: '/about' },
};

export default function Page() {
  return <About />;
}
