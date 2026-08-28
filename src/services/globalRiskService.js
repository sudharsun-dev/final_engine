import { supabase, isSupabaseConfigured } from './supabase.js';

export const SCENARIOS = {
  LOW: {
    scenario: 'LOW',
    risk_score: 15,
    synthetic_probability: 15,
    authenticity: 85,
    confidence: 92,
    risk_level: 'LOW',
    recommended_action: 'CONTINUE'
  },
  MEDIUM: {
    scenario: 'MEDIUM',
    risk_score: 55,
    synthetic_probability: 55,
    authenticity: 45,
    confidence: 92,
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
    console.log('[SUPABASE FETCH] Unconfigured environment, returning local default state');
    return SCENARIOS.LOW;
  }

  try {
    console.log('[SUPABASE FETCH] SELECT * FROM public.system2_global_risk WHERE id = 1');
    const { data, error } = await supabase
      .from('system2_global_risk')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('[SUPABASE FETCH ERROR]', error);
      throw error;
    }

    console.log('[SUPABASE FETCH SUCCESS]', data);
    return data;
  } catch (err) {
    console.error('[SUPABASE FETCH ERROR] Failed to fetch row id=1:', err.message || err);
    return SCENARIOS.LOW;
  }
}

/**
 * Update global risk scenario in Supabase system2_global_risk table (row id = 1)
 */
export async function updateGlobalRiskScenario(targetScenarioKey, updatedBy = 'Presenter') {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    console.error(`[SUPABASE UPDATE ERROR] Invalid scenario key: ${targetScenarioKey}`);
    return { success: false, error: 'Invalid scenario' };
  }

  const updatePayload = {
    ...scenarioData,
    updated_by: updatedBy,
    updated_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured || !supabase) {
    console.log('[SUPABASE UPDATE] Unconfigured environment, simulated local update:', targetScenarioKey);
    return { success: true, data: updatePayload };
  }

  try {
    console.log(`[SUPABASE UPDATE] UPDATE public.system2_global_risk SET scenario='${targetScenarioKey}' WHERE id=1`);
    const { data, error } = await supabase
      .from('system2_global_risk')
      .update(updatePayload)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error('[SUPABASE UPDATE ERROR]', error);
      throw error;
    }

    console.log('[SUPABASE UPDATE SUCCESS]', data);

    // Write log entry to system2_audit_log asynchronously
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
        if (auditErr) console.warn('[SUPABASE UPDATE] Audit log notice:', auditErr.message);
      });

    return { success: true, data };
  } catch (err) {
    console.error('[SUPABASE UPDATE ERROR] Update failed:', err.message || err);
    return { success: false, error: err.message || err };
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
    console.error('[SUPABASE FETCH ERROR] Failed to fetch audit logs:', err.message || err);
    return [];
  }
}
