'use client';

import { useState } from 'react';
import {
  Upload,
  Download,
  TrendingDown,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { generateCSVTemplate } from '@/lib/route-optimizer';

interface OptimizationResult {
  id: string;
  packages: Array<{
    destination: string;
    weight: number;
    recommended: {
      courier: string;
      service: string;
      cost: number;
      etd: string;
    };
    savings: number;
  }>;
  singleCourierCost: number;
  singleCourierName: string;
  optimizedCost: number;
  totalSavings: number;
  savingsPercentage: number;
}

export default function RouteOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [criteria, setCriteria] = useState<'CHEAPEST' | 'FASTEST' | 'BALANCED'>(
    'CHEAPEST'
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleOptimize = async () => {
    if (!file) {
      toast.error('Please select a CSV file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('criteria', criteria);

      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Optimization failed');
      }

      setResult(data.optimization);
      toast.success('Optimization completed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-shipment-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Bulk Shipment Data
          </CardTitle>
          <CardDescription>
            Upload CSV file dengan data pengiriman massal Anda untuk mendapatkan
            rekomendasi kurir termurah.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={downloadTemplate} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Template CSV
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {file ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">
                    ✓ {file.name}
                  </p>
                  <p className="text-xs text-gray-500">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Click to upload CSV</p>
                  <p className="text-xs text-gray-500">
                    Format: Destination, Weight, City, Province
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Optimization Criteria</label>
            <div className="flex gap-2">
              <Button
                variant={criteria === 'CHEAPEST' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCriteria('CHEAPEST')}
              >
                💰 Termurah
              </Button>
              <Button
                variant={criteria === 'FASTEST' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCriteria('FASTEST')}
              >
                ⚡ Tercepat
              </Button>
              <Button
                variant={criteria === 'BALANCED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCriteria('BALANCED')}
              >
                ⚖️ Balanced
              </Button>
            </div>
          </div>

          <Button
            onClick={handleOptimize}
            disabled={!file || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>Optimizing...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Routes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Savings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-sm text-red-600 mb-1">
                  Jika Pakai {result.singleCourierName} Semua
                </div>
                <div className="text-2xl font-bold text-red-700">
                  Rp {result.singleCourierCost.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-sm text-green-600 mb-1">
                  Dengan Optimasi CekKirim
                </div>
                <div className="text-2xl font-bold text-green-700">
                  Rp {result.optimizedCost.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Total Penghematan
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  Rp {result.totalSavings.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  ({result.savingsPercentage.toFixed(1)}% lebih murah!)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Per Paket</CardTitle>
              <CardDescription>
                Showing {result.packages.length} optimized shipments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Berat</TableHead>
                      <TableHead>Kurir Terbaik</TableHead>
                      <TableHead>Biaya</TableHead>
                      <TableHead>ETD</TableHead>
                      <TableHead className="text-right">Hemat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.packages.map((pkg, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          {pkg.destination}
                        </TableCell>
                        <TableCell>{pkg.weight} kg</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {pkg.recommended.courier}
                          </span>
                        </TableCell>
                        <TableCell>
                          Rp {pkg.recommended.cost.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{pkg.recommended.etd}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          +Rp {pkg.savings.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
