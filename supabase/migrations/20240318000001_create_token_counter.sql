-- Drop existing table if needed
DROP TABLE IF EXISTS token_counter CASCADE;

-- Create token_counter table
CREATE TABLE IF NOT EXISTS token_counter (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  last_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
DROP INDEX IF EXISTS idx_token_counter_date;
CREATE INDEX idx_token_counter_date ON token_counter(date);

-- Enable RLS
ALTER TABLE token_counter ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous users to read token_counter" ON token_counter;
DROP POLICY IF EXISTS "Allow anonymous users to insert token_counter" ON token_counter;
DROP POLICY IF EXISTS "Allow anonymous users to update token_counter" ON token_counter;
DROP POLICY IF EXISTS "Allow authenticated users to read token_counter" ON token_counter;
DROP POLICY IF EXISTS "Allow authenticated users to update token_counter" ON token_counter;

-- Allow anonymous users to read and update token_counter
CREATE POLICY "Allow anonymous users to read token_counter"
  ON token_counter FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous users to insert token_counter"
  ON token_counter FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update token_counter"
  ON token_counter FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admin) to read and update token_counter
CREATE POLICY "Allow authenticated users to read token_counter"
  ON token_counter FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update token_counter"
  ON token_counter FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true); 