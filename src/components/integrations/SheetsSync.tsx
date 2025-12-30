'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Loader2, Check } from 'lucide-react';
import { syncToSheets } from '@/app/actions/gsheets';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function SheetsSync() {
  const [sheetId, setSheetId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await syncToSheets(sheetId);
      if (res?.success) {
        toast.success(`Synced ${(res as any).count} rows!`);
      } else {
        toast.warning('Sync Simulation', { description: res?.message });
      }
    } catch (e) {
      toast.error('Sync failed');
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Sync to Sheets
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Sheets Sync</DialogTitle>
          <DialogDescription>
            Maximize reporting. Enter your Spreadsheet ID.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Spreadsheet ID</label>
            <Input
              placeholder="e.g. 1BxiMVs0XRA5nFMdKbBdB_..."
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Found in your Google Sheet URL.
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={loading || !sheetId}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Sync Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
