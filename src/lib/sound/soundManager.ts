export type SoundEvent = "dice" | "sword" | "item" | "gold" | "victory" | "defeat";

const SOUND_FILES: Record<SoundEvent, string> = {
  dice: "/sounds/dice.mp3",
  sword: "/sounds/sword.mp3",
  item: "/sounds/item.mp3",
  gold: "/sounds/gold.mp3",
  victory: "/sounds/victory.mp3",
  defeat: "/sounds/defeat.mp3",
};

const cache = new Map<SoundEvent, HTMLAudioElement>();

/**
 * Toca um efeito sonoro nomeado, caso o arquivo exista em `public/sounds/`.
 * Nenhum áudio está incluído neste projeto — as chamadas simplesmente não
 * produzem som até que arquivos reais sejam adicionados nesses caminhos
 * (o navegador rejeita silenciosamente a reprodução de um arquivo ausente).
 */
export function playSound(event: SoundEvent) {
  let audio = cache.get(event);
  if (!audio) {
    audio = new Audio(SOUND_FILES[event]);
    audio.volume = 0.5;
    cache.set(event, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Arquivo ausente ou reprodução bloqueada pelo navegador — ignora silenciosamente.
  });
}
