CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC,
  type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
