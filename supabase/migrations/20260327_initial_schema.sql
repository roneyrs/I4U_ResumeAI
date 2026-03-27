-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  score NUMERIC(4, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente',
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  job_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now, but in production this should be restricted)
CREATE POLICY "Allow all access to authenticated users" ON candidates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create jobs table (optional, but useful for context)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to authenticated users" ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);
