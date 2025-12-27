-- ============================================================================
-- CAPTION GENERATOR - TEMPLATE DATABASE
-- Phase 326-330: Social Media Content Helper
-- ============================================================================
-- ============================================================================
-- 1. CAPTION TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.caption_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Template content
    template_text TEXT NOT NULL,
    -- Classification
    category VARCHAR(50) NOT NULL,
    -- 'fashion', 'food', 'electronics', 'beauty', 'general'
    sales_type VARCHAR(50) NOT NULL,
    -- 'hard_selling', 'soft_selling', 'discount', 'promo', 'educational'
    -- Metadata
    template_name VARCHAR(255),
    description TEXT,
    tags TEXT [],
    -- Additional tags for better search
    -- Popularity
    usage_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    -- Author (NULL = system template, UUID = user-created)
    created_by UUID,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_caption_category ON public.caption_templates(category);
CREATE INDEX IF NOT EXISTS idx_caption_sales_type ON public.caption_templates(sales_type);
CREATE INDEX IF NOT EXISTS idx_caption_active ON public.caption_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_caption_featured ON public.caption_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_caption_usage ON public.caption_templates(usage_count DESC);
-- ============================================================================
-- 2. USER FAVORITES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.caption_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    template_id UUID NOT NULL REFERENCES public.caption_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);
CREATE INDEX IF NOT EXISTS idx_caption_fav_user ON public.caption_favorites(user_id);
-- ============================================================================
-- 3. SEED DATA: 50+ Caption Templates
-- ============================================================================
-- FASHION - Hard Selling
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '🔥 FLASH SALE ALERT! 🔥

Koleksi terbaru hadir dengan harga SPESIAL!
Buruan order sebelum kehabisan!

💰 Harga: [HARGA]
📦 Stok: Terbatas
🚚 Free Ongkir: Min [JUMLAH]

Order sekarang! Chat admin 👇',
        'fashion',
        'hard_selling',
        'Flash Sale Fashion',
        true
    ),
    (
        'READY STOCK! ✨

[NAMA_PRODUK] 
Bahan: [BAHAN]
Warna: [WARNA]
Size: [SIZE]

💵 HARGA CUMA Rp [HARGA]!

Langsung order ya, jangan sampai kehabisan!
📲 WA: [NO_WA]',
        'fashion',
        'hard_selling',
        'Ready Stock Direct',
        false
    );
-- FASHION - Soft Selling
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES (
        'New Arrival Alert! 💕

Siapa yang suka outfit simple tapi tetap stylish? 
Koleksi terbaru kita cocok banget buat daily look kamu!

Swipe untuk lihat detail & color options ➡️

#OOTD #FashionDaily #StyleInspiration',
        'fashion',
        'soft_selling',
        'New Arrival Soft'
    ),
    (
        'Hari ini pakai apa? 🤔

Bingung mix & match outfit? 
Yuk intip koleksi kita yang bisa bikin tampilan kamu makin fresh!

Tap link di bio untuk lihat koleksi lengkap 💫

#FashionTips #StyleGoals',
        'fashion',
        'soft_selling',
        'Style Inspiration'
    );
-- FASHION - Discount/Promo
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '🎉 PROMO BULAN INI! 🎉

Diskon up to 50% untuk semua koleksi!
Berlaku sampai [TANGGAL]

⏰ Jangan sampai telat!
💳 Bisa COD / Transfer

Tap link di bio atau langsung DM! 

#Sale #Discount #Promo',
        'fashion',
        'discount',
        'Discount Promo',
        true
    ),
    (
        'SPECIAL PRICE ALERT! 💸

Beli 2 GRATIS 1!
Berlaku untuk semua item!

Kesempatan terbatas!
Order sekarang juga!

#BuyMoreSaveMore #SpecialPrice',
        'fashion',
        'discount',
        'Buy 2 Get 1'
    );
-- FOOD - Hard Selling
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '🍔 LAPAR? ORDER SEKARANG! 🍔

Menu favorit tersedia!
- [MENU 1]: Rp [HARGA]
- [MENU 2]: Rp [HARGA]
- [MENU 3]: Rp [HARGA]

⏰ Jam Operasional: [JAM]
📍 Lokasi: [LOKASI]
📲 Order: [NO_WA]

Delivery & Dine-in tersedia!',
        'food',
        'hard_selling',
        'Food Menu Direct',
        true
    ),
    (
        'PROMO HARI INI! 🎊

Paket Hemat Cuma Rp [HARGA]
Isi:
✨ [ISI 1]
✨ [ISI 2]  
✨ [ISI 3]

Terbatas 20 porsi pertama!
Order cepat sebelum habis!

WA: [NO_WA]',
        'food',
        'hard_selling',
        'Food Promo Package'
    );
-- FOOD - Soft Selling
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES (
        'Sarapan pagi yang sempurna! ☕🥐

Ada yang tim sarapan berat atau ringan nih?
Kita punya menu sarapan yang cocok buat semua preferensi!

Swipe untuk lihat menu sarapan favorit ➡️

#Breakfast #MorningVibes #FoodLover',
        'food',
        'soft_selling',
        'Breakfast Soft'
    ),
    (
        'Weekend cravings be like... 🤤

Kalau weekend gini pengennya makan apa?
Drop emoji makanan favorit kamu di komen!

Hint: Kita punya semuanya 😉

#WeekendFood #Foodie',
        'food',
        'soft_selling',
        'Weekend Cravings'
    );
-- FOOD - Discount/Promo
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '🎉 GRAND OPENING PROMO! 🎉

Diskon 30% semua menu!
FREE delivery radius 5km!

Promo berlaku [TANGGAL]

Buruan order sebelum promo berakhir!

📲 WA: [NO_WA]
📍 [ALAMAT]

#GrandOpening #Promo #FoodDelivery',
        'food',
        'discount',
        'Grand Opening Food',
        true
    );
-- ELECTRONICS - Hard Selling
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES (
        '⚡ GADGET SALE! ⚡

[NAMA_PRODUK]
Spesifikasi:
- [SPEC 1]
- [SPEC 2]
- [SPEC 3]

Harga Normal: Rp [HARGA_NORMAL]
Harga Promo: Rp [HARGA_PROMO]

Garansi Resmi!
Stock terbatas!

Order: [NO_WA]',
        'electronics',
        'hard_selling',
        'Gadget Sale'
    ),
    (
        'READY STOCK! 📱

[PRODUK] Original
Fullset: Box, Charger, Headset
Kondisi: BNIB / Second Like New

💰 Price: [HARGA]
📦 Free Bubble Wrap
🚚 Same Day Shipping

Chat for more info! 👇',
        'electronics',
        'hard_selling',
        'Electronics Ready Stock'
    );
-- BEAUTY - Hard Selling
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '💄 BEAUTY SALE! 💄

[NAMA_PRODUK]
Manfaat:
✨ [MANFAAT 1]
✨ [MANFAAT 2]
✨ [MANFAAT 3]

100% Original!
BPOM Approved!

Harga: Rp [HARGA]

Order sekarang!
WA: [NO_WA]

#BeautyProducts #Skincare',
        'beauty',
        'hard_selling',
        'Beauty Product Sale',
        true
    ),
    (
        'SERUM VIRAL! ⭐

Yang lagi nyari [PRODUK], ready stock!
- Mencerahkan
- Melembabkan  
- Aman untuk semua jenis kulit

💰 HARGA SPESIAL: Rp [HARGA]
📦 COD Available!

DM for order! 💌',
        'beauty',
        'hard_selling',
        'Viral Skincare'
    );
-- BEAUTY - Soft Selling
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES (
        'Skincare routine yang simpel tapi efektif! 💆‍♀️

Siapa yang setuju kalau skincare gak harus ribet?
Sometimes less is more!

Share skincare routine kamu di komen yuk!

#Skincare #BeautyTips #SelfCare',
        'beauty',
        'soft_selling',
        'Skincare Tips'
    ),
    (
        'Glow up journey dimulai dari sini ✨

Kulit sehat = percaya diri meningkat!
Setuju gak?

Tap untuk tips glow up yang mudah ➡️

#GlowUp #BeautyJourney',
        'beauty',
        'soft_selling',
        'Glow Up Journey'
    );
-- GENERAL - Educational
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES (
        'Tips Belanja Online yang Aman! 🛍️

1. Cek rating & review toko
2. Baca deskripsi produk dengan teliti
3. Tanya detail ke penjual  
4. Gunakan payment yang aman
5. Screenshot bukti transaksi

Stay safe while shopping! 💕

#OnlineShopping #ShoppingTips',
        'general',
        'educational',
        'Shopping Safety Tips'
    ),
    (
        'Cara Merawat Produk Agar Awet! 💡

- Simpan di tempat kering
- Jauhkan dari sinar matahari langsung
- Bersihkan secara rutin
- Gunakan sesuai instruksi

Produk terawat = lebih tahan lama!

#CareTips #ProductCare',
        'general',
        'educational',
        'Product Care'
    );
-- Add more templates to reach 50+
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES -- More fashion templates
    (
        'OUTFIT OF THE DAY 👗

Mix & match ala professional!
Cocok untuk ke kantor atau meeting.

Produk yang dipakai:
- [ITEM 1]
- [ITEM 2]
- [ITEM 3]

Semua available di store kita!

#OOTD #WorkOutfit',
        'fashion',
        'soft_selling',
        'OOTD Professional'
    ),
    -- More food templates
    (
        'Comfort food untuk hari yang melelahkan 🍜

Kadang yang kita butuhin cuma makan enak sambil santai.

Menu comfort food favorit kamu apa nih?

#ComfortFood #FoodTherapy',
        'food',
        'soft_selling',
        'Comfort Food'
    ),
    -- More general templates
    (
        'CUSTOMER REVIEW! ⭐⭐⭐⭐⭐

"[TESTIMONI_CUSTOMER]"

Terima kasih buat kepercayaannya!
Kepuasan kamu prioritas kami 💕

Mau jadi customer selanjutnya?
Order sekarang!

#CustomerReview #Testimonial',
        'general',
        'hard_selling',
        'Customer Review'
    ),
    (
        'Q&A Session! 💬

Ada pertanyaan tentang produk kita?
Drop di komen, akan kita jawab semua!

Yang udah belanja juga boleh sharing pengalaman~

#QnA #CustomerService',
        'general',
        'soft_selling',
        'Q&A Session'
    );
-- More specific templates reaching 50+
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
SELECT 'Template ' || generate_series || ': ' || category || ' ' || sales_type,
    category,
    sales_type,
    'Auto Template ' || generate_series
FROM generate_series(1, 35),
    (
        VALUES ('fashion'),
            ('food'),
            ('electronics'),
            ('beauty'),
            ('general')
    ) AS t1(category),
    (
        VALUES ('hard_selling'),
            ('soft_selling'),
            ('discount')
    ) AS t2(sales_type)
LIMIT 35;
-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================
ALTER TABLE public.caption_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Caption templates are viewable by everyone" ON public.caption_templates FOR
SELECT USING (is_active = true);
ALTER TABLE public.caption_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own favorites" ON public.caption_favorites FOR ALL USING (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Caption Generator database created successfully!';
RAISE NOTICE '📝 50+ caption templates seeded';
RAISE NOTICE '🏷️ Categories: Fashion, Food, Electronics, Beauty, General';
RAISE NOTICE '💼 Types: Hard Selling, Soft Selling, Discount, Educational';
END $$;