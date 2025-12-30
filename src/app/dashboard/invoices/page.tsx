'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getInvoices,
  createInvoice,
  deleteInvoice,
} from '@/app/actions/invoices';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoiceTemplate } from '@/components/invoices/InvoiceTemplate';
import { Plus, Download, Trash, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State (Simplified for demo)
  const [formData, setFormData] = useState({
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    customer_name: '',
    items: [{ description: 'Jasa Pengiriman', quantity: 1, price: 0 }],
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    const data = await getInvoices();
    setInvoices(data);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    try {
      const res = await createInvoice(formData);
      if (res.success) {
        toast.success('Invoice created!');
        setIsCreating(false);
        loadInvoices();
      }
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? (
            'Cancel'
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> New Invoice
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Create Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Invoice Number"
              value={formData.invoice_number}
              onChange={(e) =>
                setFormData({ ...formData, invoice_number: e.target.value })
              }
            />
            <Input
              placeholder="Customer Name"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
            />
            {/* Simplified Item Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Description"
                value={formData.items[0].description}
                onChange={(e) => {
                  const newItems = [...formData.items];
                  newItems[0].description = e.target.value;
                  setFormData({ ...formData, items: newItems });
                }}
              />
              <Input
                type="number"
                placeholder="Price"
                value={formData.items[0].price}
                onChange={(e) => {
                  const newItems = [...formData.items];
                  newItems[0].price = Number(e.target.value);
                  setFormData({ ...formData, items: newItems });
                }}
              />
            </div>
            <Button onClick={handleSubmit}>Save Invoice</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="Belum ada Invoice"
          description="Buat invoice pertama Anda untuk pelanggan."
          icon={FileText}
          action={{ label: 'Buat Invoice', onClick: () => setIsCreating(true) }}
        />
      ) : (
        <div className="grid gap-4">
          {invoices.map((inv) => (
            <Card
              key={inv.id}
              className="flex flex-row items-center justify-between p-4 bg-white/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{inv.invoice_number}</h3>
                  <p className="text-sm text-gray-500">
                    {inv.customer_name} • Rp{' '}
                    {Number(inv.total_amount).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Download PDF Button */}
                <PDFDownloadLink
                  document={<InvoiceTemplate invoice={inv} />}
                  fileName={`invoice-${inv.invoice_number}.pdf`}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? (
                      'Loading...'
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> PDF
                      </>
                    )
                  }
                </PDFDownloadLink>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    if (confirm('Delete invoice?')) {
                      await deleteInvoice(inv.id);
                      loadInvoices();
                    }
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
