
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can update site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert site_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete site_settings" ON public.site_settings FOR DELETE TO authenticated USING (true);

-- Add sort_order column to products for drag & drop
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('overlay_effect', '{"type": "none", "enabled": false}'::jsonb),
  ('site_branding', '{"title": "Showcase", "favicon_url": ""}'::jsonb),
  ('default_social_links', '{"telegram": "", "whatsapp": "", "messenger": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
