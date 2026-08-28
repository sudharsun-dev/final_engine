-- ===============================================================
-- NIRBHAYA SANCHAR — SYSTEM 2
-- GLOBAL RISK PRESENTATION DATABASE SETUP & REALTIME CONFIGURATION
-- ===============================================================

-- 1. Create system2_global_risk table (Single active row id=1)
CREATE TABLE IF NOT EXISTS public.system2_global_risk (
    id INT PRIMARY KEY,
    scenario TEXT NOT NULL DEFAULT 'LOW',
    risk_score NUMERIC NOT NULL DEFAULT 15,
    synthetic_probability NUMERIC NOT NULL DEFAULT 15,
    authenticity NUMERIC NOT NULL DEFAULT 85,
    confidence NUMERIC NOT NULL DEFAULT 92,
    risk_level TEXT NOT NULL DEFAULT 'LOW',
    recommended_action TEXT NOT NULL DEFAULT 'CONTINUE',
    updated_by TEXT DEFAULT 'Presenter',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create system2_audit_log table for tracking presenter state transitions
CREATE TABLE IF NOT EXISTS public.system2_audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    previous_scenario TEXT,
    new_scenario TEXT,
    previous_score NUMERIC,
    new_score NUMERIC,
    action TEXT,
    updated_by TEXT DEFAULT 'Presenter'
);

-- 3. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.system2_global_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system2_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on system2_global_risk" 
    ON public.system2_global_risk FOR SELECT USING (true);

CREATE POLICY "Allow public update access on system2_global_risk" 
    ON public.system2_global_risk FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert access on system2_global_risk" 
    ON public.system2_global_risk FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on system2_audit_log" 
    ON public.system2_audit_log FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on system2_audit_log" 
    ON public.system2_audit_log FOR INSERT WITH CHECK (true);

-- 4. Seed initial active row (id = 1)
INSERT INTO public.system2_global_risk (
    id, scenario, risk_score, synthetic_probability, authenticity, confidence, risk_level, recommended_action, updated_by, updated_at
) VALUES (
    1, 'LOW', 15, 15, 85, 92, 'LOW', 'CONTINUE', 'System Init', NOW()
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- 5. Enable Realtime Replication for system2_global_risk
ALTER PUBLICATION supabase_realtime ADD TABLE public.system2_global_risk;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system2_audit_log;
