import pageFlipSrc from "@/assets/page-flip.mp3";

let audio: HTMLAudioElement | null = null;
let muted = false;
let unlocked = false;

function getAudio() {
  if (!audio) {
    audio = new Audio(pageFlipSrc);
    audio.volume = 0.5;
    audio.preload = "auto";
  }

  return audio;
}

export async function unlockPageTurnSound() {
  if (muted || unlocked) return;

  const nextAudio = getAudio();
  const previousMutedState = nextAudio.muted;

  try {
    nextAudio.muted = true;
    await nextAudio.play();
    nextAudio.pause();
    nextAudio.currentTime = 0;
    unlocked = true;
  } catch {
    // Ignore autoplay warm-up failures; playback will retry on the next user gesture.
  } finally {
    nextAudio.muted = previousMutedState;
  }
}

export function playPageTurnSound() {
  if (muted) return;

  const nextAudio = getAudio();
  nextAudio.currentTime = 0;

  void nextAudio.play().then(() => {
    unlocked = true;
  }).catch(() => {});
}

export function isSoundMuted() {
  return muted;
}

export function setSoundMuted(value: boolean) {
  muted = value;

  if (audio) {
    audio.muted = value;
  }
}
