'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createOrder } from '@/app/actions/orders'
import { Plus } from 'lucide-react'

export function CreateOrderDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const data = {
            customer_name: formData.get('customer_name') as string,
            product_name: formData.get('product_name') as string,
            price: Number(formData.get('price')),
            resi_number: (formData.get('resi_number') as string) || null,
            courier: (formData.get('courier') as string) || null,
            status: (formData.get('status') as any) || 'Unpaid',
        }

        const res = await createOrder(data)
        setLoading(false)

        if (res.success) {
            toast.success('Order berhasil dibuat!')
            setOpen(false)
        } else {
            toast.error(res.error || 'Gagal membuat order')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Buat Order Baru</DialogTitle>
                    <DialogDescription>
                        Catat order manual di sini. Masukkan resi untuk auto-tracking.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer_name" className="text-right">
                                Pembeli
                            </Label>
                            <Input id="customer_name" name="customer_name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product_name" className="text-right">
                                Produk
                            </Label>
                            <Input id="product_name" name="product_name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Harga (Rp)
                            </Label>
                            <Input id="price" name="price" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="resi_number" className="text-right">
                                Resi
                            </Label>
                            <Input id="resi_number" name="resi_number" placeholder="Opsional" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="courier" className="text-right">
                                Kurir
                            </Label>
                            <Select name="courier">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Pilih Kurir" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jne">JNE</SelectItem>
                                    <SelectItem value="jnt">J&T</SelectItem>
                                    <SelectItem value="sicepat">SiCepat</SelectItem>
                                    <SelectItem value="anteraja">AnterAja</SelectItem>
                                    <SelectItem value="pos">POS Indonesia</SelectItem>
                                    <SelectItem value="ninja">Ninja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select name="status" defaultValue="Unpaid">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Unpaid">Belum Bayar</SelectItem>
                                    <SelectItem value="Paid">Sudah Bayar</SelectItem>
                                    <SelectItem value="Shipped">Dikirim</SelectItem>
                                    <SelectItem value="Done">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Order'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
