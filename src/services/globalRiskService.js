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
 * Fetch initial system2_control row from Supabase
 */
export async function fetchCurrentControl() {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[GLOBAL-CONTROL] Supabase unconfigured, checking local storage for active state');
    try {
      const stored = localStorage.getItem('system2_control_local_sync');
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
    console.log('[SUPABASE] Connected');
    console.log('[GLOBAL-CONTROL] Fetching initial state...');

    const { data, error } = await supabase
      .from('system2_control')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Table exists but row 1 missing, initialize it
        console.log('[GLOBAL-CONTROL] Row 1 missing, inserting initial LOW state');
        await initializeDefaultRow();
        return SCENARIOS.LOW;
      }
      throw error;
    }

    console.log('[GLOBAL-CONTROL] Initial state loaded:', data);
    return data;
  } catch (err) {
    console.error('[GLOBAL-CONTROL ERROR] Error fetching current control:', err.message || err);
    return SCENARIOS.LOW;
  }
}

/**
 * Initialize row 1 if missing in Supabase
 */
async function initializeDefaultRow() {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const payload = { id: 1, ...SCENARIOS.LOW, updated_at: new Date().toISOString() };
    await supabase.from('system2_control').upsert(payload);
  } catch (err) {
    console.error('[GLOBAL-CONTROL ERROR] Failed to seed row 1:', err);
  }
}

/**
 * Update the global scenario in Supabase database (single row id=1)
 */
export async function setGlobalRiskScenario(targetScenarioKey, previousScenario = 'UNKNOWN') {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    console.error(`[GLOBAL-CONTROL ERROR] Invalid scenario key: ${targetScenarioKey}`);
    return { success: false, error: 'Invalid scenario' };
  }

  // Broadcast scenario update to all tabs/windows on same device
  try {
    const broadcastPayload = { type: 'SCENARIO_UPDATE', data: scenarioData, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('system2_control_channel');
        bc.postMessage(broadcastPayload);
        bc.close();
      }
      localStorage.setItem('system2_control_local_sync', JSON.stringify(broadcastPayload));
    }
  } catch (e) {
    console.warn('[GLOBAL-CONTROL] Local broadcast warning:', e);
  }

  if (!isSupabaseConfigured || !supabase) {
    console.log('[GLOBAL-CONTROL] Simulating scenario change locally & broadcasting to windows:', targetScenarioKey);
    return { success: true, data: { ...scenarioData, updated_at: new Date().toISOString() } };
  }

  try {
    console.log(`[GLOBAL-CONTROL] Updating scenario in database: ${targetScenarioKey}`);
    const updatePayload = {
      ...scenarioData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('system2_control')
      .update(updatePayload)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    console.log(`[GLOBAL-CONTROL] Database update succeeded. Scenario = ${data.scenario}, Risk Score = ${data.risk_score}`);

    // Record entry in system2_audit_log asynchronously
    supabase
      .from('system2_audit_log')
      .insert({
        device_session: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
        previous_state: previousScenario,
        new_state: data.scenario,
        risk_score: data.risk_score,
        action: data.recommended_action,
        timestamp: new Date().toISOString()
      })
      .then(({ error: auditErr }) => {
        if (auditErr) console.warn('[GLOBAL-CONTROL] Audit log write warning:', auditErr.message);
      });

    return { success: true, data };
  } catch (err) {
    console.error('[GLOBAL-CONTROL ERROR] Failed to update risk scenario in Supabase:', err.message || err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Fetch history from system2_audit_log table
 */
export async function fetchAuditLogs(limit = 20) {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('system2_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[GLOBAL-CONTROL ERROR] Failed to fetch audit logs:', err.message || err);
    return [];
  }
}
