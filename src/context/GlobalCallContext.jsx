import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { useAuth, DEMO_PROFILES } from './AuthContext.jsx';
import { SCENARIOS } from '../services/globalRiskService.js';

export const GlobalCallContext = createContext(null);

export const GlobalCallProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isUpdatingCall, setIsUpdatingCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Apply call state to active call
  const applyCallState = useCallback((callRow) => {
    if (!callRow) {
      setActiveCall(null);
      setIncomingCall(null);
      return;
    }

    if (callRow.status === 'RINGING') {
      // Check if current user is receiver
      if (currentUser && callRow.receiver_id === currentUser.id && callRow.caller_id !== currentUser.id) {
        setIncomingCall(callRow);
      } else {
        setActiveCall(callRow);
      }
    } else if (callRow.status === 'ACTIVE') {
      setIncomingCall(null);
      setActiveCall(callRow);
    } else if (callRow.status === 'ENDED') {
      setActiveCall(null);
      setIncomingCall(null);
    }
  }, [currentUser]);

  // Call timer duration counter when call is ACTIVE
  useEffect(() => {
    let timer = null;
    if (activeCall && activeCall.status === 'ACTIVE') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCall?.status, activeCall?.call_id]);

  // Supabase Realtime Subscription for system2_calls table
  useEffect(() => {
    let channel = null;

    if (!isSupabaseConfigured || !supabase || !currentUser) {
      // Check local storage for active call in demo mode
      const storedCall = localStorage.getItem('system2_active_call');
      if (storedCall) {
        try {
          const parsed = JSON.parse(storedCall);
          if (parsed && parsed.status !== 'ENDED') {
            applyCallState(parsed);
          }
        } catch (e) {}
      }
      return;
    }

    // Subscribe to system2_calls realtime postgres_changes
    channel = supabase
      .channel('system2_calls_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system2_calls'
        },
        (payload) => {
          const newRow = payload.new;
          console.log('[CALL-REALTIME] Call table change received:', newRow);

          if (!newRow) return;

          // If event belongs to current user as caller or receiver or active call participant
          if (
            newRow.caller_id === currentUser.id ||
            newRow.receiver_id === currentUser.id ||
            (activeCall && activeCall.call_id === newRow.call_id)
          ) {
            applyCallState(newRow);
            if (newRow.status !== 'ENDED') {
              localStorage.setItem('system2_active_call', JSON.stringify(newRow));
            } else {
              localStorage.removeItem('system2_active_call');
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[CALL-REALTIME] Subscribed to system2_calls realtime events');
        }
      });

    // Also check for existing RINGING or ACTIVE call for current user
    const checkActiveCalls = async () => {
      try {
        const { data } = await supabase
          .from('system2_calls')
          .select('*')
          .or(`caller_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .in('status', ['RINGING', 'ACTIVE'])
          .order('started_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          console.log('[CALL-REALTIME] Found existing active call on load:', data[0]);
          applyCallState(data[0]);
        }
      } catch (err) {
        console.warn('[CALL-REALTIME] Check active calls warning:', err);
      }
    };

    checkActiveCalls();

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser, applyCallState, activeCall?.call_id]);

  // Initiate a new call
  const startCall = async (receiverProfile) => {
    if (!currentUser || !receiverProfile) return { success: false, error: 'Invalid participants' };

    const generatedCallId = `SYS2-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newCallData = {
      call_id: generatedCallId,
      caller_id: currentUser.id,
      caller_name: currentUser.full_name,
      receiver_id: receiverProfile.id,
      receiver_name: receiverProfile.full_name,
      status: 'RINGING',
      scenario: 'LOW',
      ...SCENARIOS.LOW,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('[CALL ENGINE] Starting call to:', receiverProfile.full_name, newCallData);

    // Optimistic UI state
    setActiveCall(newCallData);
    localStorage.setItem('system2_active_call', JSON.stringify(newCallData));

    // Local broadcast for multi-window demo
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('system2_call_broadcast');
        bc.postMessage({ type: 'CALL_STARTED', call: newCallData });
        bc.close();
      }
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('system2_calls')
          .insert({
            call_id: newCallData.call_id,
            caller_id: newCallData.caller_id,
            receiver_id: newCallData.receiver_id,
            status: 'RINGING',
            scenario: 'LOW',
            ...SCENARIOS.LOW,
            started_at: newCallData.started_at
          })
          .select()
          .single();

        if (error) throw error;
        setActiveCall(data);
      } catch (err) {
        console.error('[CALL ENGINE ERROR] Failed to start call in Supabase:', err);
      }
    }

    return { success: true, callId: generatedCallId };
  };

  // Accept an incoming call
  const acceptCall = async () => {
    const targetCall = incomingCall || activeCall;
    if (!targetCall) return;

    console.log('[CALL ENGINE] Accepting call:', targetCall.call_id);

    const updated = {
      ...targetCall,
      status: 'ACTIVE',
      updated_at: new Date().toISOString()
    };

    setIncomingCall(null);
    setActiveCall(updated);
    localStorage.setItem('system2_active_call', JSON.stringify(updated));

    // Local broadcast
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('system2_call_broadcast');
        bc.postMessage({ type: 'CALL_ACCEPTED', call: updated });
        bc.close();
      }
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('system2_calls')
          .update({ status: 'ACTIVE', updated_at: updated.updated_at })
          .eq('call_id', targetCall.call_id);
      } catch (err) {
        console.error('[CALL ENGINE ERROR] Failed to accept call in Supabase:', err);
      }
    }
  };

  // Decline or End an active call
  const endCall = async () => {
    const targetCall = activeCall || incomingCall;
    if (!targetCall) return;

    console.log('[CALL ENGINE] Ending call:', targetCall.call_id);

    const endedData = {
      ...targetCall,
      status: 'ENDED',
      ended_at: new Date().toISOString()
    };

    setActiveCall(null);
    setIncomingCall(null);
    localStorage.removeItem('system2_active_call');

    // Local broadcast
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('system2_call_broadcast');
        bc.postMessage({ type: 'CALL_ENDED', call: endedData });
        bc.close();
      }
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('system2_calls')
          .update({ status: 'ENDED', ended_at: endedData.ended_at })
          .eq('call_id', targetCall.call_id);
      } catch (err) {
        console.error('[CALL ENGINE ERROR] Failed to end call in Supabase:', err);
      }
    }
  };

  // Update scenario on active call
  const updateCallScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const currentCall = activeCall;
    const scenarioData = SCENARIOS[targetScenarioKey];

    const updatedCall = {
      ...(currentCall || { call_id: 'DEMO-CALL-SYS2', caller_id: currentUser?.id }),
      scenario: targetScenarioKey,
      ...scenarioData,
      updated_at: new Date().toISOString()
    };

    // 1. Optimistic instant local update
    setActiveCall(updatedCall);
    localStorage.setItem('system2_active_call', JSON.stringify(updatedCall));

    // Local broadcast
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('system2_call_broadcast');
        bc.postMessage({ type: 'SCENARIO_CHANGED', call: updatedCall });
        bc.close();
      }
    } catch (e) {}

    setIsUpdatingCall(true);

    if (isSupabaseConfigured && supabase && currentCall?.call_id) {
      try {
        await supabase
          .from('system2_calls')
          .update({
            scenario: targetScenarioKey,
            ...scenarioData,
            updated_at: updatedCall.updated_at
          })
          .eq('call_id', currentCall.call_id);

        // Insert audit log entry
        await supabase.from('system2_audit_log').insert({
          call_id: currentCall.call_id,
          user_name: currentUser?.full_name || 'System User',
          previous_state: currentCall.scenario || 'LOW',
          new_state: targetScenarioKey,
          risk_score: scenarioData.risk_score,
          action: scenarioData.recommended_action
        });
      } catch (err) {
        console.error('[CALL ENGINE ERROR] Failed to update call scenario in Supabase:', err);
      }
    }

    setIsUpdatingCall(false);
  };

  // BroadcastChannel listener for multi-window tab simulation
  useEffect(() => {
    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('system2_call_broadcast');
      bc.onmessage = (e) => {
        if (e.data && e.data.call) {
          console.log('[CALL-BROADCAST] Message received:', e.data);
          const call = e.data.call;
          if (e.data.type === 'CALL_STARTED') {
            if (currentUser && call.receiver_id === currentUser.id) {
              setIncomingCall(call);
            }
          } else if (e.data.type === 'CALL_ACCEPTED') {
            setActiveCall(call);
            setIncomingCall(null);
          } else if (e.data.type === 'CALL_ENDED') {
            setActiveCall(null);
            setIncomingCall(null);
          } else if (e.data.type === 'SCENARIO_CHANGED') {
            setActiveCall(call);
          }
        }
      };
    }
    return () => {
      if (bc) bc.close();
    };
  }, [currentUser]);

  // Derived active values (fallback to defaults if no active call)
  const currentScenario = activeCall?.scenario || 'LOW';
  const currentRiskScore = Number(activeCall?.risk_score) || 15;
  const currentSyntheticProbability = Number(activeCall?.synthetic_probability) || 15;
  const currentAuthenticity = Number(activeCall?.authenticity) || 85;
  const currentConfidence = Number(activeCall?.confidence) || 92;
  const currentRiskLevel = activeCall?.risk_level || 'LOW';
  const currentRecommendedAction = activeCall?.recommended_action || 'CONTINUE';

  const value = {
    activeCall,
    incomingCall,
    isCallActive: Boolean(activeCall && activeCall.status === 'ACTIVE'),
    isCallRinging: Boolean(activeCall && activeCall.status === 'RINGING'),
    callDuration,
    scenario: currentScenario,
    riskScore: currentRiskScore,
    syntheticProbability: currentSyntheticProbability,
    authenticity: currentAuthenticity,
    confidence: currentConfidence,
    riskLevel: currentRiskLevel,
    recommendedAction: currentRecommendedAction,
    isUpdatingCall,
    startCall,
    acceptCall,
    endCall,
    updateCallScenario
  };

  return <GlobalCallContext.Provider value={value}>{children}</GlobalCallContext.Provider>;
};

export const useGlobalCall = () => {
  const context = useContext(GlobalCallContext);
  if (!context) {
    throw new Error('useGlobalCall must be used within a GlobalCallProvider');
  }
  return context;
};
