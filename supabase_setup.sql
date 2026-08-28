-- ===============================================================
-- NIRBHAYA SANCHAR — SYSTEM 2
-- SUPABASE DATABASE SETUP & REALTIME CONFIGURATION
-- ===============================================================

-- 1. Create system2_control table
CREATE TABLE IF NOT EXISTS public.system2_control (
    id INT PRIMARY KEY,
    scenario TEXT NOT NULL,
    risk_score NUMERIC NOT NULL,
    synthetic_probability NUMERIC NOT NULL,
    authenticity NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL,
    risk_level TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create system2_audit_log table for tracking scenario switches
CREATE TABLE IF NOT EXISTS public.system2_audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    device_session TEXT,
    previous_state TEXT,
    new_state TEXT,
    risk_score NUMERIC,
    action TEXT
);

-- 3. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.system2_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system2_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow public read & update access on system2_control
CREATE POLICY "Allow public read access on system2_control" 
    ON public.system2_control FOR SELECT USING (true);

CREATE POLICY "Allow public update access on system2_control" 
    ON public.system2_control FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert access on system2_control" 
    ON public.system2_control FOR INSERT WITH CHECK (true);

-- Allow public read & insert access on system2_audit_log
CREATE POLICY "Allow public read access on system2_audit_log" 
    ON public.system2_audit_log FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on system2_audit_log" 
    ON public.system2_audit_log FOR INSERT WITH CHECK (true);

-- 4. Seed initial single active row (id = 1)
INSERT INTO public.system2_control (
    id, scenario, risk_score, synthetic_probability, authenticity, confidence, risk_level, recommended_action, updated_at
) VALUES (
    1, 'LOW', 15, 15, 85, 92, 'LOW', 'CONTINUE', NOW()
) ON CONFLICT (id) DO UPDATE SET
    scenario = EXCLUDED.scenario,
    risk_score = EXCLUDED.risk_score,
    synthetic_probability = EXCLUDED.synthetic_probability,
    authenticity = EXCLUDED.authenticity,
    confidence = EXCLUDED.confidence,
    risk_level = EXCLUDED.risk_level,
    recommended_action = EXCLUDED.recommended_action,
    updated_at = NOW();

-- Seed initial audit log entry
INSERT INTO public.system2_audit_log (
    device_session, previous_state, new_state, risk_score, action
) VALUES (
    'INITIAL SETUP', 'NONE', 'LOW', 15, 'CONTINUE'
);

-- 5. Enable Realtime Replication for system2_control
ALTER PUBLICATION supabase_realtime ADD TABLE public.system2_control;
