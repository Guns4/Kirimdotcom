'use client';

import { useState, useEffect } from 'react';
import { PosLayout } from '@/components/agent/PosLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Calculator, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  weight: number;
  price: number;
}

export default function AgentPosPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', weight: '', price: '' });
  const [transaction, setTransaction] = useState<any>(null);

  const checkState = () => {
    if (!process.browser) return;
    // Basic check to remind user about HTTPS
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      toast.warning('Web Bluetooth requires HTTPS', {
        description:
          'Please use localhost or deploy to HTTPS for printer features.',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    checkState();
  }, []);

  const addItem = () => {
    if (!newItem.name || !newItem.weight || !newItem.price) {
      toast.error('Please fill all item fields');
      return;
    }

    const item: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      weight: parseFloat(newItem.weight),
      price: parseFloat(newItem.price),
    };

    setItems([...items, item]);
    setNewItem({ name: '', weight: '', price: '' });
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.weight * item.price, 0);
  };

  const handleProcessTransaction = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const total = calculateTotal();
    const trxId = `TRX-${Math.floor(Math.random() * 1000000)}`;
    const date = new Date().toLocaleString('id-ID'); // Use local format

    const trxData = {
      id: trxId,
      date: date,
      agentName: 'Agent Lokasi A', // Helper/Mock
      items: items,
      total: total,
    };

    setTransaction(trxData);
    toast.success(`Transaction ${trxId} Processed!`, {
      description: 'You can now print the receipt.',
    });
  };

  const handleNewTransaction = () => {
    setItems([]);
    setTransaction(null);
    toast.info('Ready for new transaction');
  };

  return (
    <PosLayout>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Transaction Input */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Order</CardTitle>
              <CardDescription>
                Enter package details provided by customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="item-name">Item Name / Service</Label>
                  <Input
                    id="item-name"
                    placeholder="e.g. Regular Shipping"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-weight">Weight (kg)</Label>
                  <Input
                    id="item-weight"
                    type="number"
                    placeholder="1.5"
                    value={newItem.weight}
                    onChange={(e) =>
                      setNewItem({ ...newItem, weight: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Price/kg (Rp)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    placeholder="10000"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button className="w-full md:w-auto" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Price/kg</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No items in cart
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.weight} kg</TableCell>
                        <TableCell>
                          Rp {item.price.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp{' '}
                          {(item.weight * item.price).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end items-center gap-4">
                <div className="text-lg font-bold">
                  Total: Rp {calculateTotal().toLocaleString('id-ID')}
                </div>
                <Button
                  size="lg"
                  onClick={handleProcessTransaction}
                  disabled={items.length === 0 || !!transaction}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions & Printer */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Receipt
              </CardTitle>
              <CardDescription>
                Print receipt manually after transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transaction ? (
                <div className="space-y-3 text-sm">
                  <div className="border-b pb-2">
                    <p className="font-bold">Transaction: {transaction.id}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="space-y-1">
                    {transaction.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span>{item.name} ({item.weight}kg)</span>
                        <span>Rp {(item.weight * item.price).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
                  </div>
                  <Button className="w-full" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Complete a transaction to generate receipt
                </p>
              )}
            </CardContent>
          </Card>

          {transaction && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">
                  Transaction Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-green-700">
                  <p>
                    <strong>ID:</strong> {transaction.id}
                  </p>
                  <p>
                    <strong>Total:</strong> Rp{' '}
                    {transaction.total.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs mt-2">Ready to print receipt.</p>

                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleNewTransaction}
                  >
                    Start New Transaction
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PosLayout>
  );
}
