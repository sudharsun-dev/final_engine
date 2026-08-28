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
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('system2_global_risk')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[GLOBAL-RISK] Row id=1 missing in database table public.system2_global_risk');
      } else {
        console.error('[GLOBAL-RISK] FETCH FAILED', {
          error_message: error.message,
          error_code: error.code,
          error_details: error.details,
          error_hint: error.hint
        });
      }
      return null;
    }

    return data;
  } catch (err) {
    console.error('[GLOBAL-RISK] FETCH EXCEPTION', err.message || err);
    return null;
  }
}

/**
 * Update global risk scenario in Supabase system2_global_risk table (row id = 1)
 * Executes atomic upsert query: .upsert({...}, { onConflict: 'id' }).select().single()
 */
export async function updateGlobalRiskScenario(targetScenarioKey, updatedBy = 'Presenter') {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    return { success: false, error: 'Invalid scenario key' };
  }

  let urlOrigin = 'UNCONFIGURED';
  try {
    const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
    if (env.VITE_SUPABASE_URL) urlOrigin = new URL(env.VITE_SUPABASE_URL).origin;
  } catch (e) {}

  console.log('[GLOBAL-RISK]', {
    action: 'UPDATE',
    scenario: targetScenarioKey,
    supabase_url: urlOrigin,
    table: 'system2_global_risk'
  });

  if (!isSupabaseConfigured || !supabase) {
    console.error('[GLOBAL-RISK] UPDATE FAILED', {
      error_message: 'Supabase credentials missing in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)',
      error_code: 'UNCONFIGURED_ENV',
      error_details: 'Build-time environment variables not set in Vercel Settings',
      error_hint: 'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel project settings and rebuild.'
    });
    return {
      success: false,
      error: 'Supabase unconfigured: Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel settings.'
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
      .from('system2_global_risk')
      .upsert(updatePayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('[GLOBAL-RISK] UPDATE FAILED', {
        error_message: error.message,
        error_code: error.code,
        error_details: error.details,
        error_hint: error.hint
      });
      return { success: false, error: error.message || 'Database write failed' };
    }

    console.log('[GLOBAL-RISK] UPDATE SUCCESS', data);
    return { success: true, data };
  } catch (err) {
    console.error('[GLOBAL-RISK] UPDATE FAILED', {
      error_message: err.message || 'TypeError: Failed to fetch',
      error_code: 'FETCH_ERROR',
      error_details: err.name || 'Network/CORS/Configuration Error',
      error_hint: 'Verify VITE_SUPABASE_URL is valid and reachable from client browser.'
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
