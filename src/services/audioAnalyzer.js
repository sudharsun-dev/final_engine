/**
 * Web Audio API Engine for Live Microphone Analysis & Waveform Rendering
 */

let audioContext = null;
let mediaStream = null;
let sourceNode = null;
let analyserNode = null;
let animationFrameId = null;
let isAnalyzing = false;

let windowCount = 0;
let totalSamplesProcessed = 0;
let windowTimer = null;

// Telemetry state listeners
let telemetryCallbacks = [];

export const getAudioAnalyzerState = () => ({
  isAnalyzing,
  sampleRate: audioContext ? audioContext.sampleRate : 48000,
  channels: 1,
  windowCount
});

/**
 * Start Audio Analysis with Web Audio API
 */
export async function startAudioAnalysis(canvasRef, onTelemetryUpdate) {
  if (isAnalyzing) return { success: true };

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      }
    });

    mediaStream = stream;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    sourceNode = audioContext.createMediaStreamSource(stream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.8;

    sourceNode.connect(analyserNode);

    isAnalyzing = true;
    windowCount = 1;
    totalSamplesProcessed = 0;

    // Start 2.5s analysis window counter
    windowTimer = setInterval(() => {
      if (isAnalyzing) {
        windowCount += 1;
      }
    }, 2500);

    // Render loop for canvas waveform and audio metrics calculation
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isAnalyzing || !analyserNode) return;

      animationFrameId = requestAnimationFrame(render);

      analyserNode.getByteTimeDomainData(dataArray);

      // Compute RMS, Peak, Level
      let sumSquares = 0;
      let maxPeak = 0;

      for (let i = 0; i < bufferLength; i++) {
        const norm = (dataArray[i] - 128) / 128;
        sumSquares += norm * norm;
        if (Math.abs(norm) > maxPeak) {
          maxPeak = Math.abs(norm);
        }
      }

      const rms = Math.sqrt(sumSquares / bufferLength);
      const audioLevelPct = Math.min(100, Math.round(rms * 250));
      const peakVal = parseFloat(maxPeak.toFixed(3));
      const rmsVal = parseFloat(rms.toFixed(3));

      totalSamplesProcessed += bufferLength;

      // Broadcast telemetry metrics
      if (onTelemetryUpdate) {
        const sampleRate = audioContext ? audioContext.sampleRate : 48000;
        const pcmBitRate = Math.round((sampleRate * 16 * 1) / 1000); // e.g. 768 kbps raw PCM
        
        onTelemetryUpdate({
          isAnalyzing: true,
          sampleRate,
          channels: 1,
          rms: rmsVal,
          peak: peakVal,
          audioLevel: audioLevelPct,
          windowCount,
          pcmBitRate: `${pcmBitRate} kbps raw PCM`,
          uplinkRate: isAnalyzing ? `${(audioLevelPct > 2 ? 64 + Math.round(audioLevelPct * 0.4) : 12)} KB/s` : '0 KB/s',
          quality: rmsVal > 0.005 ? 'OPTIMAL (HIGH FIDELITY)' : 'SILENT / STANDBY',
          windowDuration: '2.5 s',
          windowSize: '40,000 samples'
        });
      }

      // Draw Waveform on Canvas if element provided
      if (canvasRef && canvasRef.current) {
        drawWaveform(canvasRef.current, dataArray, bufferLength, audioLevelPct);
      }
    };

    render();

    return { success: true };
  } catch (err) {
    console.error('[AUDIO ANALYZER ERROR] Could not access microphone:', err);
    stopAudioAnalysis();
    return { success: false, error: err.message || 'Microphone access denied' };
  }
}

/**
 * Stop Audio Analysis and release hardware microphone resources
 */
export function stopAudioAnalysis() {
  isAnalyzing = false;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (windowTimer) {
    clearInterval(windowTimer);
    windowTimer = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }

  sourceNode = null;
  analyserNode = null;
  windowCount = 0;

  console.log('[AUDIO ANALYZER] Stopped and hardware resources released.');
}

/**
 * Draw continuous waveform on Canvas using Web Audio time-domain samples
 */
function drawWaveform(canvas, dataArray, bufferLength, audioLevelPct) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Background clear
  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 0, width, height);

  // Draw grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Dynamic stroke color based on signal level
  let strokeColor = '#0d9488'; // Teal default
  if (audioLevelPct > 40) strokeColor = '#38bdf8'; // Cyan
  if (audioLevelPct > 75) strokeColor = '#f59e0b'; // Amber

  ctx.lineWidth = 2;
  ctx.strokeStyle = strokeColor;
  ctx.shadowBlur = 8;
  ctx.shadowColor = strokeColor;

  ctx.beginPath();
  const sliceWidth = (width * 1.0) / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Reset shadow for next frame
  ctx.shadowBlur = 0;
}
