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
    try {
      const stored = localStorage.getItem('system2_global_risk_sync');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data) return parsed.data;
      }
    } catch (e) {}
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
        console.log('[SUPABASE POLL] Row id=1 missing, returning null for auto-upsert on write');
      } else {
        console.warn('[SUPABASE POLL WARNING]', error.message);
      }
      return null;
    }

    return data;
  } catch (err) {
    console.warn('[SUPABASE POLL EXCEPTION]', err.message || err);
    return null;
  }
}

/**
 * Update global risk scenario in Supabase system2_global_risk table (row id = 1)
 * Uses atomic upsert so row id=1 is created if missing or updated if present.
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

  // Broadcast to other local browser tabs/windows
  try {
    const syncObj = { type: 'SCENARIO_UPDATE', data: updatePayload, timestamp: Date.now() };
    localStorage.setItem('system2_global_risk_sync', JSON.stringify(syncObj));
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('system2_global_risk_channel');
      bc.postMessage(syncObj);
      bc.close();
    }
  } catch (e) {}

  if (!isSupabaseConfigured || !supabase) {
    console.log('[SUPABASE UPDATE] Unconfigured environment, local update executed:', targetScenarioKey);
    return { success: true, data: updatePayload };
  }

  try {
    console.log(`[SUPABASE UPDATE] Atomic UPSERT for scenario: ${targetScenarioKey}`);
    const { data, error } = await supabase
      .from('system2_global_risk')
      .upsert(updatePayload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[SUPABASE UPDATE ERROR]', error.message);
      return { success: false, error: error.message };
    }

    const updatedRow = Array.isArray(data) && data.length > 0 ? data[0] : updatePayload;
    console.log('[SUPABASE UPDATE SUCCESS]', updatedRow);

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
        if (auditErr) console.warn('[SUPABASE AUDIT WARNING]', auditErr.message);
      });

    return { success: true, data: updatedRow };
  } catch (err) {
    console.error('[SUPABASE UPDATE EXCEPTION]', err.message || err);
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
