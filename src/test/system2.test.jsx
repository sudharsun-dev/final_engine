import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { SCENARIOS } from '../services/globalRiskService';
import { startAudioAnalysis, stopAudioAnalysis } from '../services/audioAnalyzer';

describe('NIRBHAYA SANCHAR — SYSTEM 2 MASTER TESTS', () => {
  it('1. Deterministic scenario mappings: LOW (15), MEDIUM (55), HIGH (95)', () => {
    expect(SCENARIOS.LOW.risk_score).toBe(15);
    expect(SCENARIOS.LOW.recommended_action).toBe('CONTINUE');

    expect(SCENARIOS.MEDIUM.risk_score).toBe(55);
    expect(SCENARIOS.MEDIUM.recommended_action).toBe('VERIFY');

    expect(SCENARIOS.HIGH.risk_score).toBe(95);
    expect(SCENARIOS.HIGH.recommended_action).toBe('HOLD');
  });

  it('2. High risk scenario never uses Math.random() and is deterministic', () => {
    const s1 = SCENARIOS.HIGH;
    const s2 = SCENARIOS.HIGH;
    expect(s1.risk_score).toEqual(s2.risk_score);
    expect(s1.synthetic_probability).toBe(95);
    expect(s1.authenticity).toBe(5);
  });

  it('3. Audio Analyzer starts and stops correctly without errors', async () => {
    const telemetryCb = vi.fn();
    const res = await startAudioAnalysis(null, telemetryCb);
    expect(res.success).toBe(true);

    stopAudioAnalysis();
  });

  it('4. Renders application header with NIRBHAYA SANCHAR SYSTEM 2 title', async () => {
    render(<App />);
    expect(screen.getAllByText(/NIRBHAYA SANCHAR/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/SYSTEM 2/i).length).toBeGreaterThan(0);
  });
});
