import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API MediaDevices and AudioContext for jsdom environment
if (typeof window !== 'undefined') {
  window.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
  }));

  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });

  window.AudioContext = vi.fn().mockImplementation(() => ({
    createMediaStreamSource: vi.fn().mockReturnValue({
      connect: vi.fn(),
    }),
    createAnalyser: vi.fn().mockReturnValue({
      fftSize: 1024,
      smoothingTimeConstant: 0.8,
      frequencyBinCount: 512,
      getByteTimeDomainData: vi.fn((array) => array.fill(128)),
    }),
    sampleRate: 48000,
    close: vi.fn().mockResolvedValue(),
  }));
}
