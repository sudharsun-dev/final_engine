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
 * Fetch initial system2_global_risk row (id = 1) from Supabase
 */
export async function fetchCurrentGlobalRisk() {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[GLOBAL-RISK] Supabase unconfigured, checking local storage for active state');
    try {
      const stored = localStorage.getItem('system2_global_risk_sync');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data) {
          return parsed.data;
        }
      }
    } catch (e) {}
    return SCENARIOS.LOW;
  }

  try {
    console.log('[GLOBAL-RISK] Fetching initial state from system2_global_risk...');
    const { data, error } = await supabase
      .from('system2_global_risk')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[GLOBAL-RISK] Row 1 missing in system2_global_risk, seeding LOW state');
        await initializeDefaultRow();
        return SCENARIOS.LOW;
      }
      throw error;
    }

    console.log('[GLOBAL-RISK] Initial state loaded:', data);
    return data;
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] Error fetching global risk:', err.message || err);
    return SCENARIOS.LOW;
  }
}

/**
 * Initialize default row 1 in system2_global_risk if missing
 */
async function initializeDefaultRow() {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const payload = { id: 1, ...SCENARIOS.LOW, updated_by: 'System Init', updated_at: new Date().toISOString() };
    await supabase.from('system2_global_risk').upsert(payload);
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] Seeding row 1 failed:', err);
  }
}

/**
 * Update global risk scenario in Supabase system2_global_risk table (row id = 1)
 */
export async function updateGlobalRiskScenario(targetScenarioKey, updatedBy = 'Presenter', previousState = {}) {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    console.error(`[GLOBAL-RISK ERROR] Invalid scenario key: ${targetScenarioKey}`);
    return { success: false, error: 'Invalid scenario' };
  }

  const updatePayload = {
    ...scenarioData,
    updated_by: updatedBy,
    updated_at: new Date().toISOString()
  };

  // Broadcast to other tabs/windows on local machine if offline
  try {
    const syncData = { type: 'SCENARIO_UPDATE', data: updatePayload, timestamp: Date.now() };
    localStorage.setItem('system2_global_risk_sync', JSON.stringify(syncData));
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('system2_global_risk_channel');
      bc.postMessage(syncData);
      bc.close();
    }
  } catch (e) {}

  if (!isSupabaseConfigured || !supabase) {
    console.log('[GLOBAL-RISK] Database update simulated locally:', targetScenarioKey);
    return { success: true, data: updatePayload };
  }

  try {
    console.log(`[GLOBAL-RISK] Updating database row id=1 to scenario: ${targetScenarioKey}`);
    const { data, error } = await supabase
      .from('system2_global_risk')
      .update(updatePayload)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    console.log('[GLOBAL-RISK] Database update successful:', data);

    // Audit log entry write
    supabase
      .from('system2_audit_log')
      .insert({
        previous_scenario: previousState.scenario || 'LOW',
        new_scenario: data.scenario,
        previous_score: previousState.risk_score || 15,
        new_score: data.risk_score,
        action: data.recommended_action,
        updated_by: updatedBy,
        timestamp: new Date().toISOString()
      })
      .then(({ error: auditErr }) => {
        if (auditErr) console.warn('[GLOBAL-RISK] Audit log write warning:', auditErr.message);
      });

    return { success: true, data };
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] Database update failed:', err.message || err);
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
    console.error('[GLOBAL-RISK ERROR] Failed to fetch audit logs:', err.message || err);
    return [];
  }
}
