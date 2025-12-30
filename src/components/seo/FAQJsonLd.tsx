import faqData from '@/data/general-faq.json';
import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  data?: FAQItem[];
}

export default function FAQJsonLd({ data = faqData }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  );
}
