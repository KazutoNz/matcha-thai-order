
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.product_category AS ENUM ('drink', 'dessert');
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  customer_code TEXT NOT NULL UNIQUE,
  reward_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category product_category NOT NULL DEFAULT 'drink',
  order_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- order_items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  qty INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS: profiles
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS: user_roles
CREATE POLICY "user_roles_self_select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS: products (public read)
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: orders
CREATE POLICY "orders_self_select" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_self_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS: order_items
CREATE POLICY "order_items_self_select" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_self_insert" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := 'MM-' || lpad((floor(random() * 1000000))::int::text, 6, '0');
  INSERT INTO public.profiles (id, full_name, customer_code)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), new_code);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bump order_count + reward_points after order_items insert
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

-- Seed products
INSERT INTO public.products (name, price, category, order_count) VALUES
  ('มัทฉะ ลาเต้', 75, 'drink', 42),
  ('มัทฉะ แฟรปเป้', 85, 'drink', 38),
  ('มัทฉะ ชีสเค้ก', 120, 'dessert', 27),
  ('มัทฉะ ซอฟท์เสิร์ฟ', 65, 'dessert', 19),
  ('มัทฉะ โมจิ', 90, 'dessert', 14),
  ('มัทฉะ สมูทตี้โบว์ล', 95, 'drink', 12),
  ('มัทฉะ อเมริกาโน่', 70, 'drink', 9),
  ('มัทฉะ คาปูชิโน่', 78, 'drink', 7),
  ('มัทฉะ นมสดร้อน', 72, 'drink', 6),
  ('มัทฉะ คุกกี้แฟรปเป้', 88, 'drink', 5),
  ('มัทฉะ บราวนี่', 95, 'dessert', 4),
  ('มัทฉะ ทิรามิสุ', 115, 'dessert', 3);
