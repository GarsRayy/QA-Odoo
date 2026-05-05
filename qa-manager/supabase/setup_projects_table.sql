-- ============================================
-- Setup projects table with odoo_url & RLS
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'Active',   -- 'Active', 'On_Hold', 'Completed'
  odoo_url    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add odoo_url column if table already exists from old schema
DO $$ BEGIN
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS odoo_url TEXT;
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Seed default projects if table is empty
INSERT INTO public.projects (name, description, status, odoo_url)
SELECT 'LPPM ITERA Odoo 19', 'ERP Tata Kelola Kerjasama dan Pengabdian Masyarakat LPPM ITERA', 'Active', 'https://edu-pusatpengabdianlppm.odoo.com'
WHERE NOT EXISTS (SELECT 1 FROM public.projects LIMIT 1);

INSERT INTO public.projects (name, description, status, odoo_url)
SELECT 'Odoo Sales Module', 'Standard Odoo Sales, Quotation, Delivery & Invoicing Flow', 'Active', 'https://edu-pusatpengabdianlppm.odoo.com'
WHERE (SELECT COUNT(*) FROM public.projects) < 2;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read projects"   ON public.projects;
DROP POLICY IF EXISTS "Allow public insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public delete projects" ON public.projects;

CREATE POLICY "Allow public read projects"   ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete projects" ON public.projects FOR DELETE USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_projects_updated_at();

-- Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
