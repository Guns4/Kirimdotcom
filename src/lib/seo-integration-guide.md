# Integration Guide

To use the dynamic SEO generator, update your page component at \`src/app/cek-ongkir/[origin]/[destination]/page.tsx\`:

\`\`\`typescript
import { generateRouteMeta } from '@/lib/seo-generator';

type Props = {
  params: { origin: string; destination: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateRouteMeta(params.origin, params.destination);
}

export default function RoutePage({ params }: Props) {
  // Your page content
}
\`\`\`
