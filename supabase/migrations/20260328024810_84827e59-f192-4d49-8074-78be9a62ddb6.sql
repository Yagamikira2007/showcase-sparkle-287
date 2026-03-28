
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

INSERT INTO public.categories (name) VALUES ('Electronics'), ('Accessories'), ('Clothing'), ('Home & Living'), ('Sports'), ('Books');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  price NUMERIC,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN NOT NULL DEFAULT false,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  social_telegram TEXT,
  social_whatsapp TEXT,
  social_messenger TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

INSERT INTO public.products (name, description, category, price, images, featured, in_stock, social_telegram, social_whatsapp, social_messenger) VALUES
  ('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality sound.', 'Electronics', 349, ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'], true, true, 'https://t.me/admin', 'https://wa.me/1234567890', 'https://m.me/admin'),
  ('Minimalist Leather Watch', 'Hand-crafted Italian leather strap with Swiss movement.', 'Accessories', 195, ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'], true, true, 'https://t.me/admin', 'https://wa.me/1234567890', 'https://m.me/admin'),
  ('Smart Home Speaker', '360-degree room-filling sound with built-in voice assistant.', 'Electronics', 129, ARRAY['https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&q=80'], false, true, 'https://t.me/admin', 'https://wa.me/1234567890', NULL),
  ('Organic Cotton Hoodie', 'Sustainably sourced organic cotton, relaxed fit.', 'Clothing', 89, ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80'], false, true, NULL, 'https://wa.me/1234567890', NULL),
  ('Ceramic Pour-Over Set', 'Artisan-crafted ceramic dripper with thermal carafe.', 'Home & Living', 68, ARRAY['https://images.unsplash.com/photo-1517256064527-9d228fee26d0?w=600&q=80'], true, false, 'https://t.me/admin', NULL, 'https://m.me/admin'),
  ('Titanium Water Bottle', 'Ultra-lightweight titanium construction.', 'Sports', 55, ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'], false, true, NULL, 'https://wa.me/1234567890', NULL);
