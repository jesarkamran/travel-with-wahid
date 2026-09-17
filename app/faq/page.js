import { faqs, faqSchema, site } from '@/data/site';
import { Faq, Close, Jsonld } from '@/components/ui';

export const metadata = {
  title: 'Questions',
  description:
    'Where the van leaves from, what a seat covers, how to hold one, whether altitude matters at 4,600 m, and what to pack for the Pakistani north.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <>
      <section className="mast mistfield" style={{ paddingBottom: 'clamp(3rem,6vw,5rem)' }}>
        <div className="wrap">
          <p className="kicker rise rise-1">Before you book</p>
          <h1 className="rise rise-2">Questions people ask</h1>
          <p className="lede rise rise-3">
            If it is not here, message {site.phone}. Replies usually land the same day.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 'clamp(2.5rem,5vw,4rem)' }}>
        <div className="wrap" style={{ maxWidth: '54rem' }}>
          <Faq list={faqs} />
        </div>
      </section>

      <Close />
      <Jsonld data={faqSchema(faqs)} />
    </>
  );
}
