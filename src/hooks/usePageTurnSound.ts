import pageFlipSrc from "@/assets/page-flip.mp3";

let audio: HTMLAudioElement | null = null;
let muted = false;

export function playPageTurnSound() {
  if (muted) return;
  if (!audio) {
    audio = new Audio(pageFlipSrc);
    audio.volume = 0.5;
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function isSoundMuted() {
  return muted;
}

export function setSoundMuted(value: boolean) {
  muted = value;
}
