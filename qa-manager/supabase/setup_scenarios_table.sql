-- Create the test_scenarios table
CREATE TABLE IF NOT EXISTS public.test_scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Happy Path',
    description TEXT,
    roles TEXT[] DEFAULT '{}',
    steps TEXT[] DEFAULT '{}',
    expected_result TEXT,
    file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.test_scenarios ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for QA management purposes)
-- You can restrict this later if needed.
CREATE POLICY "Allow all access to test_scenarios" 
ON public.test_scenarios 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_test_scenarios_updated_at
    BEFORE UPDATE ON public.test_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
