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

const apiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_API_BASE_URL : '';

/**
 * GET current global risk state (via VITE_API_BASE_URL or direct Supabase)
 */
export async function fetchCurrentGlobalRisk() {
  console.log('[GLOBAL-RISK] GET started');

  // Option A: Custom Backend API if VITE_API_BASE_URL is defined
  if (apiBaseUrl) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/system2/global-risk`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        const bodyText = await res.text();
        console.error('[GLOBAL-RISK ERROR] GET failed:', { status: res.status, body: bodyText });
        return null;
      }
      const data = await res.json();
      console.log('[GLOBAL-RISK] GET success:', data);
      return data;
    } catch (err) {
      console.error('[GLOBAL-RISK ERROR] GET fetch exception:', err.message || err);
      return null;
    }
  }

  // Option B: Direct Supabase REST query on public.system2_global_risk (row id = 1)
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
      console.error('[GLOBAL-RISK ERROR] Supabase GET query failed:', error.message);
      return null;
    }

    console.log('[GLOBAL-RISK] GET success:', data);
    return data;
  } catch (err) {
    console.error('[GLOBAL-RISK ERROR] Supabase GET exception:', err.message || err);
    return null;
  }
}

/**
 * POST / UPDATE global risk scenario (row id = 1)
 */
export async function updateGlobalRiskScenario(targetScenarioKey, updatedBy = 'Presenter') {
  const scenarioData = SCENARIOS[targetScenarioKey];
  if (!scenarioData) {
    console.error(`[GLOBAL-RISK ERROR] Invalid scenario key: ${targetScenarioKey}`);
    return { success: false, error: 'Invalid scenario' };
  }

  console.log(`[GLOBAL-RISK] POST started: ${targetScenarioKey}`);

  // Option A: Custom Backend API if VITE_API_BASE_URL is defined
  if (apiBaseUrl) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/system2/global-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ scenario: targetScenarioKey })
      });
      if (!res.ok) {
        const bodyText = await res.text();
        console.error('[GLOBAL-RISK ERROR] POST failed:', { status: res.status, body: bodyText });
        return { success: false, error: `HTTP ${res.status}: ${bodyText}` };
      }
      const data = await res.json();
      console.log('[GLOBAL-RISK] POST success:', data);
      return { success: true, data };
    } catch (err) {
      console.error('[GLOBAL-RISK ERROR] POST exception:', err.message || err);
      return { success: false, error: err.message || 'POST failed' };
    }
  }

  // Option B: Direct Supabase REST update on public.system2_global_risk (row id = 1)
  if (!isSupabaseConfigured || !supabase) {
    console.error('[GLOBAL-RISK ERROR] Cannot update database: Supabase unconfigured');
    return { success: false, error: 'Supabase unconfigured' };
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
      .select();

    if (error) {
      console.error('[GLOBAL-RISK ERROR] Supabase update failed:', error.message);
      return { success: false, error: error.message };
    }

    const updatedRow = Array.isArray(data) && data.length > 0 ? data[0] : updatePayload;
    console.log('[GLOBAL-RISK] POST success:', updatedRow);

    // Write log entry to system2_audit_log asynchronously
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
    console.error('[GLOBAL-RISK ERROR] Supabase update exception:', err.message || err);
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
