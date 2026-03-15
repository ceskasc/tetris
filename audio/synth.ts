"use client";

type ToneOptions = {
  frequency: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
};

let audioContext: AudioContext | null = null;

function getContext() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export function playTone({
  frequency,
  duration,
  gain,
  type = "sine",
}: ToneOptions) {
  const context = getContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  envelope.gain.setValueAtTime(0.0001, context.currentTime);
  envelope.gain.exponentialRampToValueAtTime(gain, context.currentTime + 0.01);
  envelope.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + duration,
  );

  oscillator.connect(envelope);
  envelope.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.02);
}

export function playUiCue(kind: "hover" | "click" | "success" | "unlock") {
  if (kind === "hover") {
    playTone({ frequency: 520, duration: 0.06, gain: 0.015, type: "triangle" });
  }
  if (kind === "click") {
    playTone({ frequency: 360, duration: 0.08, gain: 0.02, type: "square" });
  }
  if (kind === "success") {
    playTone({ frequency: 620, duration: 0.12, gain: 0.03, type: "sine" });
    playTone({ frequency: 780, duration: 0.18, gain: 0.02, type: "triangle" });
  }
  if (kind === "unlock") {
    playTone({ frequency: 440, duration: 0.12, gain: 0.025, type: "triangle" });
    playTone({ frequency: 660, duration: 0.24, gain: 0.02, type: "sine" });
  }
}

export function playGameCue(kind: "drop" | "clear" | "combo" | "level-up") {
  if (kind === "drop") {
    playTone({ frequency: 180, duration: 0.07, gain: 0.02, type: "square" });
  }
  if (kind === "clear") {
    playTone({ frequency: 480, duration: 0.08, gain: 0.03, type: "triangle" });
    playTone({ frequency: 760, duration: 0.14, gain: 0.015, type: "sine" });
  }
  if (kind === "combo") {
    playTone({ frequency: 540, duration: 0.08, gain: 0.02, type: "square" });
    playTone({ frequency: 720, duration: 0.12, gain: 0.018, type: "triangle" });
  }
  if (kind === "level-up") {
    playTone({ frequency: 420, duration: 0.14, gain: 0.03, type: "triangle" });
    playTone({ frequency: 560, duration: 0.18, gain: 0.02, type: "sine" });
    playTone({ frequency: 780, duration: 0.26, gain: 0.015, type: "sine" });
  }
}
