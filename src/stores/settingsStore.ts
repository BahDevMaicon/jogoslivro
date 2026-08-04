import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, type GameSettings } from "@/types/game";

interface SettingsState {
  settings: GameSettings;
  updateSettings: (patch: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "livro-jogo:settings",
      // Faz merge por campo em `settings`, para que saves antigos no localStorage
      // (de antes de novos campos serem adicionados a GameSettings) não apaguem
      // os novos defaults — só sobrescrevem os campos que já existiam.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SettingsState>),
        settings: { ...current.settings, ...(persisted as Partial<SettingsState>)?.settings },
      }),
    }
  )
);
