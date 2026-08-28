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
 * Strictly queries database row id=1. No local storage or BroadcastChannel.
 */
export async function fetchCurrentGlobalRisk() {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[GLOBAL-RISK ERROR] Cannot fetch: Supabase unconfigured');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('system2_global_risk')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('[GLOBAL-RISK ERROR] GET failed:', error.message);
      return null;
    }

    console.log('[GLOBAL-RISK GET]', { success: true, scenario: data.scenario });
    return data;
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] GET exception:', err.message || err);
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

  if (!isSupabaseConfigured || !supabase) {
    console.error('[GLOBAL-RISK ERROR] Cannot update: Supabase unconfigured');
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
      console.error('[GLOBAL-RISK ERROR] UPDATE failed:', error.message);
      return { success: false, error: error.message || 'Database write failed' };
    }

    console.log('[GLOBAL-RISK UPDATE]', { scenario: data.scenario, success: true });
    return { success: true, data };
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] UPDATE exception:', err.message || err);
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
