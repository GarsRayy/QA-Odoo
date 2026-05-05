-- SQL Schema for QA Management System

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Cases table
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  code TEXT UNIQUE NOT NULL, -- e.g., HP-01, SO-03
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB, -- Array of steps
  expected_result TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution Logs table
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_code TEXT NOT NULL,
  status TEXT NOT NULL, -- 'passed', 'failed'
  error_message TEXT,
  screenshot_url TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bugs table
CREATE TABLE bugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
  status TEXT DEFAULT 'Open',
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Initial Projects
INSERT INTO projects (name, description) VALUES 
('LPPM ITERA Odoo 19', 'ERP for Research & Community Service Management'),
('Odoo Sales Module', 'Standard Odoo Sales & Invoicing Flow');
