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
 * Fetch current system2_global_risk row (id = 1) from Supabase database
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
      console.warn('[SUPABASE POLL WARNING] Fetch failed:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('[SUPABASE POLL WARNING] Exception during fetch:', err.message || err);
    return null;
  }
}

/**
 * Update global risk scenario in Supabase system2_global_risk table (row id = 1)
 */
export async function updateGlobalRiskScenario(targetScenarioKey, updatedBy = 'Presenter') {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    return { success: false, error: 'Invalid scenario' };
  }

  const updatePayload = {
    ...scenarioData,
    updated_by: updatedBy,
    updated_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: updatePayload };
  }

  try {
    const { data, error } = await supabase
      .from('system2_global_risk')
      .update(updatePayload)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error('[SUPABASE UPDATE ERROR]', error.message);
      return { success: false, error: error.message };
    }

    // Asynchronously insert log into system2_audit_log
    supabase
      .from('system2_audit_log')
      .insert({
        previous_scenario: 'N/A',
        new_scenario: data.scenario,
        previous_score: 0,
        new_score: data.risk_score,
        action: data.recommended_action,
        updated_by: updatedBy,
        timestamp: new Date().toISOString()
      })
      .then(({ error: auditErr }) => {
        if (auditErr) console.warn('[SUPABASE AUDIT WARNING]', auditErr.message);
      });

    return { success: true, data };
  } catch (err) {
    console.error('[SUPABASE UPDATE ERROR] Exception during update:', err.message || err);
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
