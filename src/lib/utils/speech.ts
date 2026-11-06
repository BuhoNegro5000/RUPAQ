import { browser } from '$app/environment';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function canSpeak(): boolean {
  return browser && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function speak(text: string, options: { onEnd?: () => void } = {}): boolean {
  if (!canSpeak()) return false;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-PE';
  utterance.rate = 0.92;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((voice) => /es[-_]PE/i.test(voice.lang)) ??
    voices.find((voice) => /es[-_](MX|US|ES|AR|CO|CL)/i.test(voice.lang)) ??
    voices.find((voice) => /^es/i.test(voice.lang));
  if (preferred) utterance.voice = preferred;
  utterance.onend = () => {
    currentUtterance = null;
    options.onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    options.onEnd?.();
  };
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return canSpeak() && window.speechSynthesis.speaking;
}
