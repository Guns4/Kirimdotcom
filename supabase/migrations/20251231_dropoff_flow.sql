-- Drop-off Flow Schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agent_dropoffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    status TEXT DEFAULT 'AT_AGENT', -- AT_AGENT, PICKED_UP
    courier_name TEXT,
    courier_signature_url TEXT,
    handover_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for searching receipts
CREATE INDEX IF NOT EXISTS idx_agent_dropoffs_receipt ON agent_dropoffs(receipt_number);
CREATE INDEX IF NOT EXISTS idx_agent_dropoffs_agent ON agent_dropoffs(agent_id);

-- RLS
ALTER TABLE agent_dropoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own dropoffs"
ON agent_dropoffs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM agents 
    WHERE id = agent_dropoffs.agent_id 
    AND user_id = auth.uid()
  )
);
