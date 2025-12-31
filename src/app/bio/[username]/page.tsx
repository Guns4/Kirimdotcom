import { getBioProfile, trackBioEvent } from '@/lib/bio-link';
import BioPageView from '@/components/bio/BioPageView';
import { notFound } from 'next/navigation';

export default async function BioPage({ params }: { params: { username: string } }) {
    const profile = await getBioProfile(params.username);

    if (!profile) {
        notFound();
    }

    // Server-side tracking (PageView)
    // Note: In Next.js App Router, this runs on server render.
    await trackBioEvent(profile.id, 'VIEW', {
        userAgent: 'server-side-detected', // Simplified
    });

    return <BioPageView profile={profile} />;
}
