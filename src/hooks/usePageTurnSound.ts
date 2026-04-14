let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/**
 * Synthesises a short paper-swoosh sound using filtered noise.
 * No external audio files required.
 */
export function playPageTurnSound() {
  const ctx = getAudioContext();
  const duration = 0.35;
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // White noise with an amplitude envelope that fades out
  for (let i = 0; i < length; i++) {
    const t = i / length;
    // Fast attack, smooth decay envelope
    const envelope = Math.pow(1 - t, 2.5) * (t < 0.05 ? t / 0.05 : 1);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Band-pass filter to shape the noise into a papery swoosh
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(3000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);
  filter.Q.value = 0.8;

  // Keep it subtle
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}
