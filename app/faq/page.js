import { faqs, faqSchema, site } from '@/data/site';
import { Faq, Close } from '@/components/ui';
import { Jsonld } from '@/components/fmt';

export const metadata = {
  title: 'Questions',
  description:
    'Where the van leaves from, what a seat covers, how to hold one, whether altitude matters at 4,600 m, and what to pack for the Pakistani north.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="kicker rise rise-1">Before you book</p>
          <h1 className="rise rise-2">Questions people ask</h1>
          <p className="lede rise rise-3">
            If it is not here, message {site.phone}. Replies usually land the same day.
          </p>
        </div>
      </section>

      <section className="sec sec--flush">
        <div className="wrap wrap--narrow">
          <Faq list={faqs} />
        </div>
      </section>

      <Close />
      <Jsonld data={faqSchema(faqs)} />
    </>
  );
}
