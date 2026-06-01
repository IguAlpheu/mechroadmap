// Lumeo — Timer sound using Web Audio API (no files needed)

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq: number, duration: number, gain: number, type: OscillatorType = "sine") {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gainNode.gain.setValueAtTime(0, ac.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playFocusEnd() {
  // Three descending tones — soft chime
  playTone(880, 0.4, 0.2);
  setTimeout(() => playTone(698, 0.4, 0.2), 200);
  setTimeout(() => playTone(523, 0.6, 0.25), 400);
}

export function playBreakEnd() {
  // Two ascending tones — gentle alert
  playTone(523, 0.3, 0.2);
  setTimeout(() => playTone(659, 0.5, 0.25), 200);
}

export function playStepComplete() {
  // Single soft pop
  playTone(1046, 0.2, 0.12);
}

export function playStreakClaim() {
  // Quick ascending arpeggio
  playTone(523, 0.15, 0.15);
  setTimeout(() => playTone(659, 0.15, 0.15), 100);
  setTimeout(() => playTone(784, 0.15, 0.15), 200);
  setTimeout(() => playTone(1046, 0.3, 0.2), 300);
}
