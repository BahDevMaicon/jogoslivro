import { useCallback } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { playSound, type SoundEvent } from "./soundManager";

/** Expõe uma função `play(event)` que respeita a preferência `settings.soundEffects`. */
export function useSound() {
  const enabled = useSettingsStore((s) => s.settings.soundEffects);
  return useCallback(
    (event: SoundEvent) => {
      if (!enabled) return;
      playSound(event);
    },
    [enabled]
  );
}
