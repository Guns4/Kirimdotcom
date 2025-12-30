import { Suspense } from 'react';
import BioPageView from '@/components/bio/BioPageView';

interface BioPageProps {
    params: { username: string };
}

export async function generateMetadata({ params }: BioPageProps) {
    const username = params.username;
    return {
        title: `@${username} | Bio Link - CekKirim`,
        description: `Lihat profil dan link dari @${username}`,
    };
}

export default function BioPage({ params }: BioPageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-pulse text-white">Loading...</div>
            </div>
        }>
            <BioPageView username={params.username} />
        </Suspense>
    );
}
