import { useState, useCallback } from 'react';
import { Printer, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { printerService } from '@/lib/printer-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface ReceiptPrinterProps {
  onPrint?: () => void;
  transactionData?: any; // Pass data to print when ready
}

export function ReceiptPrinter({ transactionData }: ReceiptPrinterProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await printerService.connect();
      setIsConnected(true);
      toast.success('Printer connected successfully');
    } catch (error: any) {
      toast.error('Failed to connect printer', {
        description: error.message,
      });
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await printerService.disconnect();
      setIsConnected(false);
      toast.info('Printer disconnected');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrintTest = async () => {
    if (!isConnected) {
      toast.error('Printer not connected');
      return;
    }

    setIsPrinting(true);
    try {
      await printerService.printText('TEST PRINT SUCCESS', 'CENTER');
      await printerService.printText(
        '--------------------------------',
        'CENTER'
      );
      await printerService.feed(2);
      await printerService.cut();
      toast.success('Test print sent');
    } catch (error: any) {
      toast.error('Print failed', { description: error.message });
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintReceipt = async () => {
    if (!transactionData) return;

    setIsPrinting(true);
    try {
      await printerService.printReceipt(transactionData);
      toast.success('Receipt printed');
    } catch (error: any) {
      toast.error('Print failed', { description: error.message });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Receipt Printer</span>
          {isConnected ? (
            <span className="text-green-500 flex items-center text-xs gap-1">
              <CheckCircle size={14} /> Connected
            </span>
          ) : (
            <span className="text-zinc-500 flex items-center text-xs gap-1">
              <XCircle size={14} /> Disconnected
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!isConnected ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" /> Connect Bluetooth Printer
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handlePrintTest}
                disabled={isPrinting}
              >
                Test Print
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>

            {transactionData && (
              <Button
                size="sm"
                className="w-full"
                onClick={handlePrintReceipt}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                Print Last Receipt
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
