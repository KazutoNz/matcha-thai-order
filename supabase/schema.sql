-- ============================================================================
-- MatchaMew — consolidated baseline schema
--
-- รวม migration ทั้ง 9 ไฟล์ใน supabase/migrations/ ให้เป็นไฟล์เดียว
-- พร้อมปรับจุดที่โครงสร้างไม่สอดคล้องกับโค้ดแอป (ดูหัวข้อ "CHANGED" ในคอมเมนต์)
--
-- ใช้กับ Supabase project ที่ "ว่างเปล่า" เท่านั้น — วางทั้งไฟล์ใน SQL Editor แล้วกด Run
-- ถ้าจะรันซ้ำ ให้ Reset database ก่อน (ไฟล์นี้ไม่ได้ทำให้รันซ้ำได้)
-- ============================================================================


-- ============================================================================
-- 1. ENUMS
-- ============================================================================

-- CHANGED: เรียงค่าใหม่ตามลำดับที่เกิดขึ้นจริง
-- ของเดิมค่า confirmed/out_for_delivery/delivered ถูก ALTER TYPE ADD VALUE เพิ่มทีหลัง
-- เลยไปต่อท้าย cancelled ทำให้ ORDER BY status ได้ลำดับมั่ว
CREATE TYPE public.order_status AS ENUM (
  'pending',           -- รอร้านรับออเดอร์
  'confirmed',         -- ร้านยืนยันแล้ว
  'preparing',         -- กำลังทำ
  'ready',             -- ทำเสร็จ รอไรเดอร์มารับ
  'out_for_delivery',  -- ไรเดอร์รับงานแล้ว กำลังส่ง
  'delivered',         -- ส่งถึงลูกค้าแล้ว
  'completed',         -- ปิดออเดอร์
  'cancelled'          -- ยกเลิก
);

-- CHANGED: เรียงจากสิทธิ์น้อยไปมาก (เดิม admin, user แล้วค่อยเพิ่ม rider, manager ต่อท้าย)
CREATE TYPE public.app_role AS ENUM ('user', 'rider', 'manager', 'admin');

CREATE TYPE public.product_category AS ENUM ('drink', 'dessert');


-- ============================================================================
-- 2. TABLES
-- ============================================================================

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  customer_code   TEXT NOT NULL UNIQUE,
  reward_points   INT NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  avatar_url      TEXT,
  birthday        DATE,
  default_address TEXT,
  default_phone   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    product_category NOT NULL DEFAULT 'drink',
  image_url   TEXT,                                        -- รูปหลัก
  images      TEXT[] NOT NULL DEFAULT '{}'::TEXT[],        -- แกลเลอรี
  variants    JSONB NOT NULL DEFAULT '[]'::JSONB,          -- [{ name, price_delta }]
  order_count INT NOT NULL DEFAULT 0 CHECK (order_count >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- CHANGED: เดิมเป็น uuid ลอย ๆ ไม่มี FK — ถ้าลบ user ทิ้ง rider_id จะชี้ไปที่ไม่มีอยู่จริง
  rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  total    NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status   order_status NOT NULL DEFAULT 'pending',

  -- CHANGED (สำคัญที่สุด): 5 คอลัมน์นี้ไม่เคยมีในฐานข้อมูลเดิม
  -- หน้า Checkout ให้ลูกค้ากรอกชื่อ/เบอร์/ที่อยู่/วิธีจ่ายเงิน และบังคับว่าต้องกรอกครบ
  -- แต่ตอน insert ส่งไปแค่ user_id, total, status — ข้อมูลที่อยู่จัดส่งถูกทิ้งทั้งหมด
  -- ไรเดอร์เลยไม่มีทางรู้ว่าต้องเอาของไปส่งที่ไหน
  --
  -- เก็บเป็น "snapshot ณ เวลาสั่ง" ไม่ใช่อ่านจาก profiles ตอนแสดงผล
  -- เพราะถ้าลูกค้าแก้ที่อยู่ในโปรไฟล์ทีหลัง ออเดอร์เก่าต้องยังเป็นที่อยู่เดิมที่ส่งไปแล้ว
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  payment_method   TEXT NOT NULL DEFAULT 'cash'
                   CHECK (payment_method IN ('cash', 'card', 'promptpay')),
  note             TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- CHANGED: เพิ่มมาเพื่อรู้ว่าสถานะถูกเปลี่ยนล่าสุดเมื่อไหร่ (มี trigger เซ็ตให้อัตโนมัติ)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  -- CHANGED: ระบุ ON DELETE RESTRICT ให้ชัด (ของเดิมไม่ได้เขียน ซึ่งค่าเริ่มต้นก็คือ RESTRICT)
  -- หมายความว่า MCP tool `delete_product` จะลบสินค้าที่เคยมีคนสั่งไม่ได้ — ตั้งใจให้เป็นแบบนั้น
  -- เพราะถ้าลบได้ ประวัติออเดอร์เก่าจะพัง ถ้าอยากซ่อนสินค้าให้เพิ่มคอลัมน์ is_available แทน
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,

  qty        INT NOT NULL DEFAULT 1 CHECK (qty > 0),
  price      NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  sweetness  TEXT,
  toppings   TEXT[] NOT NULL DEFAULT '{}'::TEXT[]
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. INDEXES
-- CHANGED: ของเดิมมีแค่ idx_orders_rider_id ตัวเดียว
-- คอลัมน์ที่เหลือถูก filter อยู่ตลอดในหน้า Orders / Dashboard / Rider
-- ============================================================================

CREATE INDEX idx_orders_user_id        ON public.orders(user_id);
CREATE INDEX idx_orders_rider_id       ON public.orders(rider_id);
CREATE INDEX idx_orders_status         ON public.orders(status);
CREATE INDEX idx_orders_created_at     ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id  ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_user_roles_user_id    ON public.user_roles(user_id);


-- ============================================================================
-- 4. ROLE HELPER
-- SECURITY DEFINER เพื่อให้ policy เรียกอ่าน user_roles ได้โดยไม่ติด RLS ของตัวเอง
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;


-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- ---- profiles ----
CREATE POLICY "profiles_self_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CHANGED: manager อ่านโปรไฟล์ลูกค้าได้ (อ่านอย่างเดียว)
-- เดิมมีแค่ admin — manager เลยเปิดหน้าจัดการออเดอร์แล้วไม่เห็นชื่อลูกค้าเลย
-- rider ไม่ต้องให้สิทธิ์ตรงนี้ เพราะได้ชื่อ/เบอร์/ที่อยู่จากตาราง orders อยู่แล้ว
CREATE POLICY "profiles_manager_select" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- ---- user_roles ----
CREATE POLICY "user_roles_self_select" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---- products ----
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "products_manager_all" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- ---- orders ----
CREATE POLICY "orders_self_select" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_self_insert" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "orders_manager_all" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- CHANGED: จำกัดให้ไรเดอร์เห็นเฉพาะงานที่ "ยังไม่มีคนรับ และพร้อมส่งแล้ว"
-- ของเดิมเงื่อนไขเป็น (rider_id = auth.uid() OR rider_id IS NULL) เฉย ๆ
-- แปลว่าไรเดอร์เห็นออเดอร์ทุกใบตั้งแต่ลูกค้าเพิ่งกดสั่ง รวมถึงใบที่ยกเลิกไปแล้ว
CREATE POLICY "orders_rider_select" ON public.orders
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rider')
    AND (
      rider_id = auth.uid()
      OR (rider_id IS NULL AND status = 'ready')
    )
  );

-- CHANGED: เพิ่ม WITH CHECK — ไรเดอร์กดรับงานได้เฉพาะการ "รับเป็นของตัวเอง"
-- ของเดิมไม่มี WITH CHECK ไรเดอร์จึงยัด rider_id เป็นของคนอื่นได้
CREATE POLICY "orders_rider_update" ON public.orders
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'rider')
    AND (
      rider_id = auth.uid()
      OR (rider_id IS NULL AND status = 'ready')
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'rider')
    AND rider_id = auth.uid()
  );

-- ---- order_items ----
CREATE POLICY "order_items_self_select" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "order_items_self_insert" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "order_items_manager_all" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "order_items_rider_select" ON public.order_items
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rider')
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.rider_id = auth.uid() OR (o.rider_id IS NULL AND o.status = 'ready'))
    )
  );


-- ============================================================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================================================

-- สร้าง profile + ให้ role 'user' อัตโนมัติเมื่อมีคนสมัครใหม่
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- CHANGED: เดิมสุ่มเลข 6 หลักครั้งเดียว ถ้าซ้ำกับที่มีอยู่จะติด UNIQUE
  -- แล้วการสมัครสมาชิกของคนนั้นล้มทั้งรายการ — วนสุ่มใหม่จนกว่าจะได้เลขที่ว่าง
  LOOP
    new_code := 'MM-' || lpad((floor(random() * 1000000))::INT::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE customer_code = new_code);
  END LOOP;

  INSERT INTO public.profiles (id, full_name, customer_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    new_code
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- นับยอดสั่งของสินค้า ใช้ทำอันดับขายดีในแดชบอร์ด
CREATE OR REPLACE FUNCTION public.bump_product_order_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.products SET order_count = order_count + NEW.qty WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_order_count
AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.bump_product_order_count();


-- แต้มสะสม +10 ต่อ 1 ออเดอร์
CREATE OR REPLACE FUNCTION public.bump_reward_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET reward_points = reward_points + 10 WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_reward_points
AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.bump_reward_points();


-- CHANGED: ใหม่ทั้งอัน — อัปเดต updated_at ทุกครั้งที่แถวถูกแก้
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_touch_updated_at
BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ฟังก์ชันทั้งหมดข้างบนถูกเรียกผ่าน trigger เท่านั้น ไม่ควรให้ client เรียกตรง
REVOKE EXECUTE ON FUNCTION public.handle_new_user()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_product_order_count()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_reward_points()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at()          FROM PUBLIC, anon, authenticated;


-- ============================================================================
-- 7. STORAGE
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ---- product-images ----
CREATE POLICY "Product images public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- CHANGED: เพิ่ม manager เข้าไปทุก policy
-- เดิมให้เฉพาะ admin ทั้งที่ manager แก้ตาราง products ได้ — อัปโหลดรูปสินค้าเลยพัง
CREATE POLICY "Staff upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

CREATE POLICY "Staff update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

CREATE POLICY "Staff delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

-- ---- avatars ---- (แต่ละคนแก้ได้เฉพาะโฟลเดอร์ที่ชื่อตรงกับ user id ของตัวเอง)
CREATE POLICY "Avatars public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);


-- ============================================================================
-- 8. REALTIME
-- REPLICA IDENTITY FULL ทำให้ payload ของ event มีค่าเดิมก่อนแก้มาด้วย
-- ============================================================================

ALTER TABLE public.orders      REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.orders';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;


-- ============================================================================
-- 9. SEED — เมนูตั้งต้น
-- ============================================================================

INSERT INTO public.products (name, price, category, order_count) VALUES
  ('มัทฉะ ลาเต้',          75,  'drink',   42),
  ('มัทฉะ แฟรปเป้',        85,  'drink',   38),
  ('มัทฉะ ชีสเค้ก',        120, 'dessert', 27),
  ('มัทฉะ ซอฟท์เสิร์ฟ',     65,  'dessert', 19),
  ('มัทฉะ โมจิ',           90,  'dessert', 14),
  ('มัทฉะ สมูทตี้โบว์ล',    95,  'drink',   12),
  ('มัทฉะ อเมริกาโน่',      70,  'drink',   9),
  ('มัทฉะ คาปูชิโน่',       78,  'drink',   7),
  ('มัทฉะ นมสดร้อน',       72,  'drink',   6),
  ('มัทฉะ คุกกี้แฟรปเป้',   88,  'drink',   5),
  ('มัทฉะ บราวนี่',         95,  'dessert', 4),
  ('มัทฉะ ทิรามิสุ',        115, 'dessert', 3);


-- ============================================================================
-- หลังรันเสร็จ: ตั้ง admin คนแรกด้วยตัวเอง
-- (สมัครสมาชิกผ่านหน้าเว็บก่อน แล้วค่อยรันบรรทัดล่างนี้ใน SQL Editor)
--
--   INSERT INTO public.user_roles (user_id, role)
--   SELECT id, 'admin' FROM auth.users WHERE email = 'อีเมลของคุณ'
--   ON CONFLICT (user_id, role) DO NOTHING;
-- ============================================================================
