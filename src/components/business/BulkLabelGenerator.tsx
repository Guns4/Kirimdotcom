'use client';

import { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { groupAndSortLabels, generateBulkLabelsPDF, generateManifestPDF, type LabelData } from '@/lib/bulk-label-generator';

interface BulkLabelGeneratorProps {
    optimizationId?: string;
    packages?: Array<{
        destination: string;
        weight: number;
        recommended: {
            courier: string;
            service: string;
            cost: number;
        };
    }>;
}

export default function BulkLabelGenerator({ optimizationId, packages }: BulkLabelGeneratorProps) {
    const [generating, setGenerating] = useState(false);

    if (!packages || packages.length === 0) {
        return null;
    }

    const handleGenerateLabels = async () => {
        setGenerating(true);
        try {
            // Convert packages to label data (mock tracking numbers)
            const labels: LabelData[] = packages.map((pkg, idx) => ({
                trackingNumber: `${pkg.recommended.courier}${Date.now()}${idx.toString().padStart(4, '0')}`,
                courier: pkg.recommended.courier,
                service: pkg.recommended.service,
                destination: pkg.destination,
                recipient: `Customer ${idx + 1}`, // Mock recipient
                weight: pkg.weight,
                cost: pkg.recommended.cost
            }));

            // Group and sort labels by courier
            const groupedLabels = groupAndSortLabels(labels);

            // Generate main labels PDF
            const labelsPDF = generateBulkLabelsPDF(groupedLabels);
            labelsPDF.save('bulk-shipping-labels.pdf');

            toast.success('Labels PDF generated!');

            // Also generate manifests
            groupedLabels.forEach(group => {
                const manifestPDF = generateManifestPDF(group);
                manifestPDF.save(`manifest-${group.courier}.pdf`);
            });

            toast.success(`${groupedLabels.length} manifest(s) generated!`);

        } catch (error: any) {
            toast.error('Failed to generate labels', { description: error.message });
        } finally {
            setGenerating(false);
        }
    };

    // Calculate courier breakdown
    const courierBreakdown = new Map<string, number>();
    packages.forEach(pkg => {
        const courier = pkg.recommended.courier;
        courierBreakdown.set(courier, (courierBreakdown.get(courier) || 0) + 1);
    });

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Printer className="h-5 w-5" />
                    Generate Bulk Labels
                </CardTitle>
                <CardDescription className="text-purple-700">
                    Create printable shipping labels and handover manifests
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-900 mb-2">Label Breakdown:</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Array.from(courierBreakdown.entries()).map(([courier, count]) => (
                            <div key={courier} className="bg-white rounded px-3 py-2 border border-purple-200">
                                <div className="text-xs text-gray-600">{courier}</div>
                                <div className="text-lg font-bold text-purple-900">{count}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-purple-900">Total Labels:</span>
                            <span className="text-2xl font-bold text-purple-900">{packages.length}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <Button
                        onClick={handleGenerateLabels}
                        disabled={generating}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="lg"
                    >
                        {generating ? (
                            <>Generating PDFs...</>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Generate Labels & Manifests
                            </>
                        )}
                    </Button>

                    <div className="text-xs text-purple-700 space-y-1">
                        <div className="flex items-start gap-2">
                            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>1 PDF with all labels (sorted by courier)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{courierBreakdown.size} manifest(s) for handover</span>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-purple-100/50 rounded-lg p-3 text-xs text-purple-800">
                    <div className="font-medium mb-1">📋 Warehouse Instructions:</div>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Print bulk labels PDF</li>
                        <li>Cut labels following page breaks</li>
                        <li>Labels are pre-sorted by courier</li>
                        <li>Print manifests for each courier</li>
                        <li>Get courier signature on manifest</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}
