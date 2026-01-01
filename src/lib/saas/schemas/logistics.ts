import { z } from 'zod';

// Skema Validasi Cek Ongkir
export const CostRequestSchema = z.object({
    origin: z.string().min(3, "Kode Origin minimal 3 karakter (ex: 'CGK')"),
    destination: z.string().min(3, "Kode Destination minimal 3 karakter (ex: 'BDO')"),
    weight: z.number()
        .int("Berat harus angka bulat (gram)")
        .positive("Berat harus lebih dari 0")
        .max(100000, "Berat maksimal per paket adalah 100kg (100.000g)"),
    courier: z.enum(['jne', 'sicepat', 'jnt', 'anteraja', 'all']).optional().default('all')
});

// Skema Validasi Tracking
export const TrackingRequestSchema = z.object({
    awb: z.string().min(5, "Nomor Resi terlalu pendek"),
    courier: z.string().min(3, "Kode kurir wajib diisi")
});
