import { faqs, faqSchema } from '@/data/site';
import { PageHeader, Faq, Cta, Jsonld } from '@/components/ui';

export const metadata = {
  title: 'FAQ — Booking, Pricing & What to Pack',
  description: 'Where trips depart from, what the price includes, how to book a seat, and what to bring on a trip to the Northern Areas.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="Good to know" title="Questions, answered" sub="Anything not covered here — just message. Replies usually come the same day." />
      <section className="sec">
        <div className="wrap faq">
          <div className="reveal">
            <h2>Before you book</h2>
            <p className="sec__sub">The six things people ask most.</p>
          </div>
          <Faq list={faqs} />
        </div>
      </section>
      <Cta />
      <Jsonld data={faqSchema(faqs)} />
    </>
  );
}
