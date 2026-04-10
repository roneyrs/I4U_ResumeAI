-- Ensure all required columns exist in the candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS score NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Em Análise';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS analysis TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_years TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS attention_areas TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS job_description TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
