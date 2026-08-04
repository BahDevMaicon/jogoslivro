import type { StatKey } from "./story";

export interface StatBlock {
  skill: number;
  maxSkill: number;
  stamina: number;
  maxStamina: number;
  luck: number;
  maxLuck: number;
}

export interface Character {
  name: string;
  stats: StatBlock;
  gold: number;
  provisions: number;
  inventory: string[]; // item ids (permite repetição)
  equippedWeapon?: string;
  equippedArmor?: string;
  /** Efeitos ativos temporários, ex.: { id: 'poison', remainingRounds: 2 } */
  activeEffects: ActiveEffect[];
  /** Pontuação acumulada (ex.: ao derrotar inimigos com `points`). Saves antigos podem não ter este campo — leia sempre com `?? 0`. */
  score: number;
  /** Contador de fadiga (0-10+): sobe 1 a cada seção avançada sem comer/descansar, zera ao comer/descansar. Saves antigos podem não ter este campo — leia sempre com `?? 0`. */
  fatigue: number;
}

export interface ActiveEffect {
  id: string;
  label: string;
  remainingRounds?: number;
}

export type LogEntryType =
  | "section"
  | "choice"
  | "itemGained"
  | "itemRemoved"
  | "test"
  | "diceRoll"
  | "combatRound"
  | "combatResult"
  | "statChange"
  | "rest"
  | "eat"
  | "custom";

export interface LogEntry {
  id: string;
  type: LogEntryType;
  message: string;
  timestamp: string; // ISO date
}

export interface EnemyState {
  id: string;
  name: string;
  skill: number;
  stamina: number;
  maxStamina: number;
}

export interface CombatState {
  enemies: EnemyState[];
  onVictory: string;
  onDefeat: string;
  onFlee?: string;
  round: number;
  isActive: boolean;
}

export interface PendingTest {
  testType: "luck" | "skill" | "attribute" | "fixed";
  stat?: StatKey;
  fixedValue?: number;
  onSuccess: string;
  onFailure: string;
}

export interface GameSettings {
  fontSize: "small" | "medium" | "large" | "xlarge";
  fontFamily: "garamond" | "ebGaramond" | "baskerville";
  textBold: boolean;
  textSpacing: "compact" | "normal" | "relaxed";
  theme: "dark" | "parchment";
  soundEffects: boolean;
  animations: boolean;
  confirmBeforeRestart: boolean;
  diceRollMode: "manual" | "automatic";
}

export const DEFAULT_SETTINGS: GameSettings = {
  fontSize: "medium",
  fontFamily: "garamond",
  textBold: false,
  textSpacing: "normal",
  theme: "dark",
  soundEffects: true,
  animations: true,
  confirmBeforeRestart: true,
  diceRollMode: "manual",
};

export const SAVE_FORMAT_VERSION = 1;

export interface GameSave {
  formatVersion: number;
  bookId: string;
  bookVersion: string;
  currentSectionId: string;
  character: Character;
  flags: Record<string, boolean>;
  visitedSections: string[];
  choicesMade: string[];
  defeatedEnemies: string[];
  combat: CombatState | null;
  pendingTest: PendingTest | null;
  log: LogEntry[];
  settings: GameSettings;
  isFinished: boolean;
  ending: { type: "victory" | "defeat" | "neutral"; title: string; text: string } | null;
  /** Se a tela de Regras já foi vista/confirmada nesta partida. Saves antigos podem não ter este campo — leia sempre com `?? false`. */
  rulesAcknowledged: boolean;
  /** Id da seção anterior à atual, usado pelo botão "Voltar" quando o jogador fica sem escolhas disponíveis. Saves antigos podem não ter este campo — leia sempre com `?? null`. */
  previousSectionId: string | null;
  createdAt: string;
  updatedAt: string;
}
