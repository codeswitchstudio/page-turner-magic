import pageFlipSrc from "@/assets/page-flip.mp3";

let audio: HTMLAudioElement | null = null;

export function playPageTurnSound() {
  if (!audio) {
    audio = new Audio(pageFlipSrc);
    audio.volume = 0.5;
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
