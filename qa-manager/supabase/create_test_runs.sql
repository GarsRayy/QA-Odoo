-- ============================================
-- Create test_runs table for QA Management System
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'passed', 'failed', 'pending'
  duration_ms INTEGER,
  error_message TEXT,
  screenshot_path TEXT,
  video_path TEXT,
  executed_by TEXT DEFAULT 'Tendik LPPM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_runs_test_case_id ON test_runs(test_case_id);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

-- Allow anon key to SELECT (read data from dashboard)
CREATE POLICY "Allow public read access on test_runs"
  ON test_runs
  FOR SELECT
  USING (true);

-- Allow anon key to INSERT (API route writes test results)
CREATE POLICY "Allow public insert access on test_runs"
  ON test_runs
  FOR INSERT
  WITH CHECK (true);

-- Allow anon key to UPDATE (in case we need to update status)
CREATE POLICY "Allow public update access on test_runs"
  ON test_runs
  FOR UPDATE
  USING (true);

-- Allow anon key to DELETE (for cleanup)
CREATE POLICY "Allow public delete access on test_runs"
  ON test_runs
  FOR DELETE
  USING (true);

-- ============================================
-- Enable Realtime for live dashboard updates
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE test_runs;
