import { supabase, isSupabaseConfigured } from './supabase.js';

export const SCENARIOS = {
  LOW: {
    scenario: 'LOW',
    risk_score: 15,
    synthetic_probability: 15,
    authenticity: 85,
    confidence: 93,
    risk_level: 'LOW',
    recommended_action: 'CONTINUE'
  },
  MEDIUM: {
    scenario: 'MEDIUM',
    risk_score: 55,
    synthetic_probability: 55,
    authenticity: 45,
    confidence: 94,
    risk_level: 'MEDIUM',
    recommended_action: 'VERIFY'
  },
  HIGH: {
    scenario: 'HIGH',
    risk_score: 95,
    synthetic_probability: 95,
    authenticity: 5,
    confidence: 96,
    risk_level: 'HIGH',
    recommended_action: 'HOLD'
  }
};

/**
 * Fetch current system2_global_risk row (id = 1) from Supabase
 */
export async function fetchCurrentGlobalRisk() {
  if (!isSupabaseConfigured || !supabase) {
    console.log("[GLOBAL-RISK GET]", {
      success: false,
      scenario: undefined,
      error: 'Supabase unconfigured: VITE_SUPABASE_URL missing in Vercel settings'
    });
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("system2_global_risk")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    console.log("[GLOBAL-RISK GET]", {
      success: !error && Boolean(data),
      scenario: data?.scenario,
      error: error?.message
    });

    if (error) return null;
    return data;
  } catch (err) {
    console.error("[GLOBAL-RISK GET] Exception:", err.message || err);
    return null;
  }
}

/**
 * Update global risk scenario in Supabase system2_global_risk table (row id = 1)
 */
export async function updateGlobalRiskScenario(targetScenarioKey, updatedBy = 'Presenter') {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    return { success: false, error: 'Invalid scenario key' };
  }

  if (!isSupabaseConfigured || !supabase) {
    console.log("[GLOBAL-RISK UPDATE]", {
      success: false,
      scenario: undefined,
      error: 'Supabase unconfigured: Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Settings -> Environment Variables and redeploy.',
      code: 'UNCONFIGURED_ENV',
      details: 'Build-time VITE_* variables missing during Vite compilation',
      hint: 'Add variables in Vercel project settings and trigger a new deployment'
    });
    return {
      success: false,
      error: 'Supabase unconfigured: Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Settings and redeploy.'
    };
  }

  const updatePayload = {
    id: 1,
    ...scenarioData,
    updated_by: updatedBy,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from("system2_global_risk")
      .upsert(updatePayload, { onConflict: "id" })
      .select("*")
      .single();

    console.log("[GLOBAL-RISK UPDATE]", {
      success: !error && Boolean(data),
      scenario: data?.scenario,
      error: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });

    if (error) {
      return { success: false, error: error.message || 'Database write failed' };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[GLOBAL-RISK UPDATE] Exception:", {
      success: false,
      error: err.message || 'TypeError: Failed to fetch',
      name: err.name
    });
    return {
      success: false,
      error: err.message || 'TypeError: Failed to fetch (Check VITE_SUPABASE_URL in Vercel settings)'
    };
  }
}

/**
 * Fetch audit log records
 */
export async function fetchAuditLogs(limit = 20) {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('system2_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}
