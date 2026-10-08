-- ==============================================================================
-- LeafBook Store - Supabase Database Schema & Migration Script
-- รันโค้ด SQL นี้ใน Supabase SQL Editor เพื่อสร้างตารางและเปิดใช้งานสิทธิ์ RLS สำหรับ anon key
-- ==============================================================================

-- 1. ตารางสินค้า (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'other',
    tags JSONB DEFAULT '["new"]'::jsonb,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    cover_image TEXT NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    file_type TEXT DEFAULT 'ZIP',
    file_size TEXT DEFAULT '0 MB',
    download_file_url TEXT,
    file_name TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    author TEXT DEFAULT 'LeafBook Creator',
    seller_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่มคอลัมน์ seller_email ในกรณีที่ตารางถูกสร้างไว้แล้ว
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_email TEXT;

-- 2. ตารางคำสั่งซื้อ (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    date TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    net_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    payment_method TEXT NOT NULL DEFAULT 'promptpay',
    customer_name TEXT,
    customer_email TEXT,
    download_expiry TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ตารางโปรไฟล์ผู้ใช้งานและลูกค้า (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    phone TEXT,
    bio TEXT,
    avatar TEXT,
    is_vip BOOLEAN DEFAULT FALSE,
    tier TEXT DEFAULT 'Member',
    stats JSONB DEFAULT '{"favoritesCount": 0, "ordersCount": 0, "rewardPoints": 50}'::jsonb,
    address JSONB,
    joined_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- อนุญาตให้ใช้งานผ่าน ANON KEY ได้อย่างสมบูรณ์แบบ
-- ==============================================================================

-- เปิด RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Products Policies: อ่าน, เพิ่ม, แก้ไข, ลบ ผ่าน anon key ได้
DROP POLICY IF EXISTS "Anon can view products" ON public.products;
CREATE POLICY "Anon can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon can insert products" ON public.products;
CREATE POLICY "Anon can insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update products" ON public.products;
CREATE POLICY "Anon can update products" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon can delete products" ON public.products;
CREATE POLICY "Anon can delete products" ON public.products FOR DELETE USING (true);

-- Orders Policies: อ่าน, เพิ่ม, แก้ไข ผ่าน anon key ได้
DROP POLICY IF EXISTS "Anon can view orders" ON public.orders;
CREATE POLICY "Anon can view orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon can insert orders" ON public.orders;
CREATE POLICY "Anon can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update orders" ON public.orders;
CREATE POLICY "Anon can update orders" ON public.orders FOR UPDATE USING (true);

-- Profiles Policies: อ่าน, เพิ่ม, แก้ไข, ลบ ผ่าน anon key ได้
DROP POLICY IF EXISTS "Anon can view profiles" ON public.profiles;
CREATE POLICY "Anon can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon can insert profiles" ON public.profiles;
CREATE POLICY "Anon can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update profiles" ON public.profiles;
CREATE POLICY "Anon can update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon can delete profiles" ON public.profiles;
CREATE POLICY "Anon can delete profiles" ON public.profiles FOR DELETE USING (true);

-- สร้าง Indexes เพื่อความรวดเร็วในการ Query
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- ข้อมูลเริ่มต้น (Seed Initial Products)
-- ==============================================================================

INSERT INTO public.products (
    id, title, slug, description, category, tags, price, original_price,
    cover_image, rating, review_count, file_type, file_size, download_file_url, file_name, features, author
) VALUES
(
    'prod-ebook-store-guide',
    'คู่มือพัฒนาระบบ E-Book Store (LeafBook) ฉบับสมบูรณ์',
    'ebook-store-guide',
    'เอกสารคู่มือสเปกและขั้นตอนการพัฒนาระบบร้านค้า E-Book Store ด้วย Next.js, Electron, Tailwind CSS และ Supabase',
    'ebook',
    '["recommended", "bestseller"]'::jsonb,
    199,
    390,
    '/covers/ebook-store-guide-cover.jpg',
    5.0,
    48,
    'DOCX + PDF',
    '1.4 MB',
    '/downloads/E-Book Store.docx',
    'E-Book Store.docx',
    '["ครอบคลุมทั้ง Web App & Desktop App", "อธิบายโครงสร้างระบบอย่างละเอียด", "พร้อมแนวทางเชื่อมต่อ Supabase & Stripe"]'::jsonb,
    'ทีมพัฒนา LeafBook'
),
(
    'prod-exercises-bundle',
    'ชุดแบบฝึกหัด Google Apps Script & Mini Projects (รวม 9 ชุด)',
    'gas-mini-projects-bundle',
    'รวมแบบฝึกหัดพัฒนา Web App ด้วย Google Apps Script และ Vibe Coding ตั้งแต่แบบฝึกหัดที่ 1 ถึง 7 และโปรเจกต์ 9.1, 9.2 ครบชุด',
    'software',
    '["recommended", "bestseller"]'::jsonb,
    399,
    890,
    '/covers/gas-bundle-cover.jpg',
    4.9,
    82,
    'ZIP (9 DOCX Files)',
    '2.6 MB',
    '/downloads/GAS_Exercises_Bundle.zip',
    'GAS_Exercises_Bundle.zip',
    '["ฟังก์ชันสรุปคะแนน & ทะเบียนคะแนน", "ระบบติดตามและตอบรับคำขอ", "Expense Tracker & ระบบรับคำขอ IT"]'::jsonb,
    'อาจารย์ผู้สอน'
),
(
    'prod-media-player-pro',
    'Media Player PRO - ซอร์สโค้ดโปรแกรมเล่นสื่อระดับพรีเมียม',
    'media-player-pro-code',
    'ซอร์สโค้ดเต็มระบบ Media Player PRO พัฒนาด้วยเทคโนโลยีเว็บและเดสก์ท็อป รองรับการเล่นไฟล์เสียง วิดีโอ และเพลย์ลิสต์',
    'software',
    '["recommended", "new"]'::jsonb,
    450,
    890,
    '/covers/media-player-code-cover.jpg',
    4.9,
    18,
    'ZIP (Source Code)',
    '4.2 MB',
    '/downloads/media-player-pro-source.zip',
    'media-player-pro-source.zip',
    '["UI ทันสมัยแบบ Glassmorphism", "ระบบ Equalizer & Audio FX", "รองรับ Windows, macOS, Web"]'::jsonb,
    'DevCraft Studio'
),
(
    'prod-taskmanager',
    'SQLite Task Manager PRO - ระบบจัดการงานพร้อมฐานข้อมูล',
    'sqlite-taskmanager-pro-code',
    'ซอร์สโค้ดระบบบริหารจัดการงานระดับมืออาชีพ พร้อมฐานข้อมูล SQLite ในตัว เหมาะสำหรับการทำงานเดสก์ท็อปและออฟไลน์',
    'software',
    '["recommended", "new"]'::jsonb,
    350,
    690,
    '/covers/taskmanager-code-cover.jpg',
    4.9,
    22,
    'ZIP (Source Code)',
    '3.8 MB',
    '/downloads/taskmanager-source.zip',
    'taskmanager-source.zip',
    '["ระบบ SQLite Database ในตัว", "แดชบอร์ดสรุปผลและรายงาน", "ระบบค้นหาและจัดหมวดหมู่งาน"]'::jsonb,
    'DataCore Solutions'
),
(
    'prod-tarot-app',
    'Tarot App - ระบบดูดวงไพ่ทาโรต์ดิจิทัลแบบโต้ตอบ',
    'tarot-app-code',
    'ซอร์สโค้ดเว็บและแอปพลิเคชันดูดวงไพ่ทาโรต์แบบอินเตอร์แอคทีฟ แอนิเมชันเปิดไพ่สมจริง พร้อมฐานข้อมูลคำทำนายครบ 78 ใบ',
    'software',
    '["new"]'::jsonb,
    390,
    750,
    '/covers/tarot-code-cover.jpg',
    4.8,
    15,
    'ZIP (Source Code)',
    '5.6 MB',
    '/downloads/tarot-app-source.zip',
    'tarot-app-source.zip',
    '["ไพ่ทาโรต์ครบ 78 ใบพร้อมคำทำนาย", "ระบบสุ่มและเปิดไพ่ 3 มิติ", "บันทึกประวัติการทำนาย"]'::jsonb,
    'Mystic Byte Studio'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cover_image = EXCLUDED.cover_image,
    download_file_url = EXCLUDED.download_file_url,
    file_name = EXCLUDED.file_name,
    updated_at = NOW();

-- ==============================================================================
-- 4. Supabase Storage Bucket สำหรับจัดเก็บไฟล์ E-Book / PDF
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- เปิดสิทธิ์ RLS ให้บุคคลทั่วไปและ anon สามารถอ่าน/ดาวน์โหลดไฟล์ E-Book ได้
DROP POLICY IF EXISTS "Public ebooks access" ON storage.objects;
CREATE POLICY "Public ebooks access" ON storage.objects
    FOR SELECT USING (bucket_id = 'ebooks');

-- เปิดสิทธิ์ให้อัปโหลดไฟล์ E-Book เข้า bucket 'ebooks' ได้
DROP POLICY IF EXISTS "Public ebooks insert" ON storage.objects;
CREATE POLICY "Public ebooks insert" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'ebooks');

