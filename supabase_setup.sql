-- ===============================================================
-- NIRBHAYA SANCHAR — SYSTEM 2
-- SUPABASE DATABASE SETUP & REALTIME REPLICATION CONFIGURATION
-- ===============================================================

-- 1. Create profiles table (associated with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    department TEXT DEFAULT 'Security Operations',
    role TEXT DEFAULT 'Security Analyst',
    status TEXT DEFAULT 'ONLINE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create system2_calls table (Call signaling & active call risk state)
CREATE TABLE IF NOT EXISTS public.system2_calls (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    call_id TEXT UNIQUE NOT NULL,
    caller_id UUID REFERENCES public.profiles(id),
    receiver_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'RINGING', -- RINGING, ACTIVE, ENDED
    scenario TEXT NOT NULL DEFAULT 'LOW',  -- LOW, MEDIUM, HIGH
    risk_score NUMERIC NOT NULL DEFAULT 15,
    synthetic_probability NUMERIC NOT NULL DEFAULT 15,
    authenticity NUMERIC NOT NULL DEFAULT 85,
    confidence NUMERIC NOT NULL DEFAULT 92,
    risk_level TEXT NOT NULL DEFAULT 'LOW',
    recommended_action TEXT NOT NULL DEFAULT 'CONTINUE',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 3. Create system2_control table (Single global active row fallback id=1)
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

-- 4. Create system2_audit_log table
CREATE TABLE IF NOT EXISTS public.system2_audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    call_id TEXT,
    device_session TEXT,
    user_name TEXT,
    previous_state TEXT,
    new_state TEXT,
    risk_score NUMERIC,
    action TEXT
);

-- 5. Enable Row Level Security (RLS) & Public Policies for Demo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system2_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system2_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system2_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write access on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on system2_calls" ON public.system2_calls FOR SELECT USING (true);
CREATE POLICY "Allow public write access on system2_calls" ON public.system2_calls FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on system2_control" ON public.system2_control FOR SELECT USING (true);
CREATE POLICY "Allow public write access on system2_control" ON public.system2_control FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on system2_audit_log" ON public.system2_audit_log FOR SELECT USING (true);
CREATE POLICY "Allow public write access on system2_audit_log" ON public.system2_audit_log FOR ALL USING (true) WITH CHECK (true);

-- 6. Seed initial demonstration profiles (Rahul Kumar, Muraari, Admin Analyst)
INSERT INTO public.profiles (
    id, full_name, username, email, phone, department, role, status
) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Rahul Kumar', 'rahul', 'rahul@example.com', '+91 98765 43210', 'Security Operations', 'Lead Officer', 'ONLINE'),
    ('22222222-2222-2222-2222-222222222222', 'Muraari', 'muraari', 'muraari@example.com', '+91 98123 45678', 'Fraud Investigation', 'Senior Analyst', 'ONLINE'),
    ('33333333-3333-3333-3333-333333333333', 'Priya Sharma', 'priya', 'priya@example.com', '+91 97111 22233', 'Cyber Threat Intelligence', 'Specialist', 'ONLINE')
ON CONFLICT (username) DO NOTHING;

-- Seed default system2_control row
INSERT INTO public.system2_control (
    id, scenario, risk_score, synthetic_probability, authenticity, confidence, risk_level, recommended_action, updated_at
) VALUES (
    1, 'LOW', 15, 15, 85, 92, 'LOW', 'CONTINUE', NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 7. Enable Realtime Replication on all System 2 tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system2_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system2_control;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system2_audit_log;
