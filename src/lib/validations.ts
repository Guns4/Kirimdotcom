import { z } from 'zod';

/**
 * Zod Validation Schemas
 * All form validations with Indonesian error messages
 */

// ============================================
// Common Field Schemas
// ============================================

export const emailSchema = z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter');

export const passwordSchema = z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password maksimal 100 karakter')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[0-9]/, 'Password harus mengandung angka');

export const phoneSchema = z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon tidak valid')
    .transform((val) => {
        // Normalize to +62 format
        if (val.startsWith('0')) return '+62' + val.slice(1);
        if (val.startsWith('62')) return '+' + val;
        return val;
    });

export const nameSchema = z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-zA-Z\s'-]+$/, 'Nama hanya boleh huruf, spasi, dan tanda hubung');

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password wajib diisi'),
});

export const registerSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
        fullName: nameSchema,
        phone: phoneSchema.optional(),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: 'Anda harus menyetujui syarat dan ketentuan',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password tidak cocok',
        path: ['confirmPassword'],
    });

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password tidak cocok',
        path: ['confirmPassword'],
    });

// ============================================
// Tracking Schemas
// ============================================

export const trackingSchema = z.object({
    awb: z
        .string()
        .min(1, 'Nomor resi wajib diisi')
        .min(8, 'Nomor resi minimal 8 karakter')
        .max(50, 'Nomor resi maksimal 50 karakter')
        .regex(/^[A-Za-z0-9-]+$/, 'Nomor resi hanya boleh huruf, angka, dan strip'),
    courier: z.string().optional(),
});

export const bulkTrackingSchema = z.object({
    awbList: z
        .string()
        .min(1, 'Daftar resi wajib diisi')
        .transform((val) => val.split('\n').map((s) => s.trim()).filter(Boolean))
        .refine((arr) => arr.length > 0, { message: 'Minimal 1 resi' })
        .refine((arr) => arr.length <= 50, { message: 'Maksimal 50 resi' }),
});

// ============================================
// Shipping Schemas
// ============================================

export const addressSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    address: z.string().min(10, 'Alamat minimal 10 karakter').max(500, 'Alamat maksimal 500 karakter'),
    city: z.string().min(1, 'Kota wajib dipilih'),
    province: z.string().min(1, 'Provinsi wajib dipilih'),
    postalCode: z.string().regex(/^[0-9]{5}$/, 'Kode pos harus 5 digit').optional(),
});

export const bookingSchema = z.object({
    sender: addressSchema,
    receiver: addressSchema,
    weight: z.number().min(1, 'Berat minimal 1 gram').max(50000, 'Berat maksimal 50 kg'),
    courier: z.string().min(1, 'Kurir wajib dipilih'),
    service: z.string().min(1, 'Layanan wajib dipilih'),
    description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
});

// ============================================
// Product Schemas
// ============================================

export const productSchema = z.object({
    name: z.string().min(1, 'Nama produk wajib diisi').max(255, 'Nama maksimal 255 karakter'),
    sku: z.string().max(100, 'SKU maksimal 100 karakter').optional(),
    description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter').optional(),
    costPrice: z.number().min(0, 'Harga beli tidak boleh negatif'),
    sellingPrice: z.number().min(0, 'Harga jual tidak boleh negatif'),
    weight: z.number().min(0, 'Berat tidak boleh negatif').optional(),
    stock: z.number().int().min(0, 'Stok tidak boleh negatif').optional(),
    category: z.string().max(100, 'Kategori maksimal 100 karakter').optional(),
});

// ============================================
// Invoice Schemas
// ============================================

export const invoiceItemSchema = z.object({
    name: z.string().min(1, 'Nama item wajib diisi'),
    quantity: z.number().int().min(1, 'Quantity minimal 1'),
    price: z.number().min(0, 'Harga tidak boleh negatif'),
});

export const invoiceSchema = z.object({
    customerName: nameSchema,
    customerEmail: emailSchema.optional(),
    customerPhone: phoneSchema.optional(),
    customerAddress: z.string().max(500, 'Alamat maksimal 500 karakter').optional(),
    items: z.array(invoiceItemSchema).min(1, 'Minimal 1 item'),
    tax: z.number().min(0).max(100, 'Tax maksimal 100%').optional(),
    discount: z.number().min(0, 'Diskon tidak boleh negatif').optional(),
    notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
    dueDate: z.string().optional(),
});

// ============================================
// Wallet Schemas
// ============================================

export const topupSchema = z.object({
    amount: z
        .number()
        .int('Jumlah harus bilangan bulat')
        .min(10000, 'Minimal top up Rp 10.000')
        .max(10000000, 'Maksimal top up Rp 10.000.000'),
    paymentMethod: z.string().min(1, 'Metode pembayaran wajib dipilih'),
});

export const withdrawSchema = z.object({
    amount: z
        .number()
        .int('Jumlah harus bilangan bulat')
        .min(50000, 'Minimal tarik tunai Rp 50.000'),
    bankName: z.string().min(1, 'Nama bank wajib diisi'),
    bankAccount: z.string().regex(/^[0-9]{10,16}$/, 'Nomor rekening 10-16 digit'),
    bankHolder: nameSchema,
});

// ============================================
// Support Schemas
// ============================================

export const ticketSchema = z.object({
    email: emailSchema,
    name: nameSchema.optional(),
    category: z.enum(['tracking', 'payment', 'account', 'technical', 'other']),
    subject: z.string().min(5, 'Subjek minimal 5 karakter').max(255, 'Subjek maksimal 255 karakter'),
    description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(5000, 'Deskripsi maksimal 5000 karakter'),
});

// ============================================
// Export Types
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TrackingInput = z.infer<typeof trackingSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type TopupInput = z.infer<typeof topupSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
