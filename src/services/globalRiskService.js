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
 * Strictly queries database row id=1. No local storage overrides.
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
        console.error('[GLOBAL-RISK ERROR] Database fetch error:', error.message);
      }
      return null;
    }

    return data;
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] Fetch exception:', err.message || err);
    return null;
  }
}

/**
 * Update global risk scenario in Supabase system2_global_risk table (row id = 1)
 * Updates database row id=1 directly. Waits for DB response before returned.
 */
export async function updateGlobalRiskScenario(targetScenarioKey, updatedBy = 'Presenter') {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    return { success: false, error: 'Invalid scenario' };
  }

  const updatePayload = {
    id: 1,
    ...scenarioData,
    updated_by: updatedBy,
    updated_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured || !supabase) {
    console.warn('[GLOBAL-RISK ERROR] Cannot update database: Supabase unconfigured');
    return { success: false, error: 'Supabase unconfigured' };
  }

  try {
    console.log(`[GLOBAL-RISK] update started: ${targetScenarioKey}`);
    const { data, error } = await supabase
      .from('system2_global_risk')
      .upsert(updatePayload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[GLOBAL-RISK ERROR] Update failed:', error.message);
      return { success: false, error: error.message };
    }

    const updatedRow = Array.isArray(data) && data.length > 0 ? data[0] : updatePayload;
    console.log('[GLOBAL-RISK] update success:', updatedRow);

    // Asynchronously log to system2_audit_log
    supabase
      .from('system2_audit_log')
      .insert({
        previous_scenario: 'N/A',
        new_scenario: updatedRow.scenario,
        previous_score: 0,
        new_score: updatedRow.risk_score,
        action: updatedRow.recommended_action,
        updated_by: updatedBy,
        timestamp: new Date().toISOString()
      })
      .then(({ error: auditErr }) => {
        if (auditErr) console.warn('[GLOBAL-RISK] Audit log notice:', auditErr.message);
      });

    return { success: true, data: updatedRow };
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] Update exception:', err.message || err);
    return { success: false, error: err.message || 'Update failed' };
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
