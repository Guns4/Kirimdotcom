export interface CaptionTemplate {
    id: string
    category: 'Soft Selling' | 'Hard Selling' | 'Follow Up' | 'Discount'
    label: string
    content: string
}

export const captionTemplates: CaptionTemplate[] = [
    {
        id: 'soft-1',
        category: 'Soft Selling',
        label: 'Sapaan Ramah',
        content: "Halo kak {customerName}! 👋\n\nMakasih ya udah ngelirik {productName} kami. Kalau ada yang bikin penasaran atau mau tanya detailnya, chat aja ya kak. Kami siap bantu kok! 😊"
    },
    {
        id: 'soft-2',
        category: 'Soft Selling',
        label: 'Edukasi Produk',
        content: "Kak {customerName}, tau gak sih kalau {productName} itu lagi hits banget? 🤔\n\nBanyak yang bilang ini ngebantu banget buat aktivitas sehari-hari. Coba deh cek detailnya dulu, siapa tau cocok buat kakak! ✨"
    },
    {
        id: 'hard-1',
        category: 'Hard Selling',
        label: 'Flash Sale Urgency',
        content: "⚠️ ALERT! Stok {productName} tinggal dikit banget kak {customerName}!\n\nJangan sampe kehabisan ya, karena restock-nya masih lama. Langsung checkout sekarang sebelum nyesel lho! 🚀"
    },
    {
        id: 'hard-2',
        category: 'Hard Selling',
        label: 'Best Seller',
        content: "🔥 BEST SELLER ALERT 🔥\n\nKak {customerName}, {productName} ini favorit banget bulan ini. Udah terjual ribuan pcs lho! Yakin mau nunggu nanti-nanti? Keburu abis kak! 😱"
    },
    {
        id: 'discount-1',
        category: 'Discount',
        label: 'Promo Akhir Bulan',
        content: "Halo kak {customerName}! Spesial akhir bulan nih, {productName} lagi diskon {discount}% lho! 🥳\n\nPromo cuma sampe hari {deadline} aja ya. Yuk, amanin stoknya sekarang biar makin hemat! 💰"
    },
    {
        id: 'discount-2',
        category: 'Discount',
        label: 'Flash Deal Terbatas',
        content: "⚡ FLASH DEAL {discount}% OFF ⚡\n\nKhusus buat kak {customerName} hari ini aja! Dapatkan {productName} dengan harga miring. Cuma berlaku sampai {deadline}. Sikat miring kak! 🏃‍♂️💨"
    },
    {
        id: 'follow-1',
        category: 'Follow Up',
        label: 'Ingatkan Checkout',
        content: "Siang kak {customerName}, aku liat {productName} nya masih di keranjang nih. 🛒\n\nSayang banget lho kalau kehabisan, soalnya stok rebutan. Mau aku bantu proses sekarang kak? 😊"
    },
    {
        id: 'follow-2',
        category: 'Follow Up',
        label: 'Menunggu Pembayaran',
        content: "Halo kak {customerName}, pesanan {productName} nya udah kami sisihkan ya. 📦\n\nDitunggu pembayarannya sebelum hari {deadline} biar bisa langsung kami kirim hari ini. Makasih kak! 🙏"
    }
]
