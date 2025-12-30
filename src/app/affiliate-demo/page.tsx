import { AffiliateLinkedText } from '@/components/affiliate/AffiliateLinkedText';

export default function DemoPage() {
    const sample = "Paket berisi sepasang sepatu nike dan baju baru untuk lebaran, bonus tas cantik.";

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Affiliate Injector Demo</h1>
            <div className="border p-4 rounded-lg bg-card mb-4">
                <h2 className="text-gray-500 text-sm uppercase font-bold mb-2">Original Text</h2>
                <p>{sample}</p>
            </div>

            <div className="border p-4 rounded-lg bg-card">
                <h2 className="text-green-500 text-sm uppercase font-bold mb-2">Injected Text</h2>
                <p className="text-lg">
                    <AffiliateLinkedText text={sample} />
                </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Note: Words &apos;sepatu&apos;, &apos;baju&apos;, &apos;tas&apos; should be links.</p>
        </div>
    );
}
