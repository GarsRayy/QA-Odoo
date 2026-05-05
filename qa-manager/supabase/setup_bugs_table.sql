-- ============================================
-- Verify & Setup bugs table with RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- Create bugs table if not exists (match existing schema)
CREATE TABLE IF NOT EXISTS public.bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  screenshot_url TEXT,
  reported_by TEXT DEFAULT 'Garis Rayya Rabbani',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (safe for existing table)
DO $$ BEGIN
  ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS reported_by TEXT DEFAULT 'Garis Rayya Rabbani';
  ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bugs_status ON public.bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON public.bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_created_at ON public.bugs(created_at DESC);

-- Enable RLS
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read bugs" ON public.bugs;
DROP POLICY IF EXISTS "Allow public insert bugs" ON public.bugs;
DROP POLICY IF EXISTS "Allow public update bugs" ON public.bugs;
DROP POLICY IF EXISTS "Allow public delete bugs" ON public.bugs;

-- Create RLS policies
CREATE POLICY "Allow public read bugs" ON public.bugs FOR SELECT USING (true);
CREATE POLICY "Allow public insert bugs" ON public.bugs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bugs" ON public.bugs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete bugs" ON public.bugs FOR DELETE USING (true);

-- Enable Realtime (ignore error if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bugs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
