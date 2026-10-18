-- Cold-Call Assistant Database Schema
-- Target: Supabase PostgreSQL (or any standard PostgreSQL 14+ instance)

-- 1. Enable uuid-ossp or pgcrypto if needed for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create calls table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_name VARCHAR(255),
    prospect_company VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'ended_early')),
    current_stage_number INTEGER NOT NULL DEFAULT 1 CHECK (current_stage_number >= 1 AND current_stage_number <= 8),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create call_stage_results table
CREATE TABLE IF NOT EXISTS call_stage_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL CHECK (stage_number >= 1 AND stage_number <= 8),
    outcome VARCHAR(120) NOT NULL,
    prospect_words TEXT DEFAULT '',
    caller_notes TEXT DEFAULT '',
    ai_recommendation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_call_stage UNIQUE (call_id, stage_number)
);

-- 4. Create indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_stage_results_call_id ON call_stage_results(call_id);
CREATE INDEX IF NOT EXISTS idx_stage_results_stage ON call_stage_results(stage_number);

-- 5. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_calls_updated_at ON calls;
CREATE TRIGGER trg_calls_updated_at
    BEFORE UPDATE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_stage_results_updated_at ON call_stage_results;
CREATE TRIGGER trg_stage_results_updated_at
    BEFORE UPDATE ON call_stage_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS) Configuration
-- For MVP with backend service role key access:
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_stage_results ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by Express backend with SUPABASE_SERVICE_ROLE_KEY)
DROP POLICY IF EXISTS "Service role has full access to calls" ON calls;
CREATE POLICY "Service role has full access to calls"
    ON calls FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to stage results" ON call_stage_results;
CREATE POLICY "Service role has full access to stage results"
    ON call_stage_results FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Optional: Allow public read/write if using anon key directly without auth
-- Uncomment the following policies only if using anon public key instead of service role
-- CREATE POLICY "Anon read calls" ON calls FOR SELECT TO anon USING (true);
-- CREATE POLICY "Anon insert calls" ON calls FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Anon update calls" ON calls FOR UPDATE TO anon USING (true);
-- CREATE POLICY "Anon read stages" ON call_stage_results FOR SELECT TO anon USING (true);
-- CREATE POLICY "Anon write stages" ON call_stage_results FOR ALL TO anon USING (true) WITH CHECK (true);
