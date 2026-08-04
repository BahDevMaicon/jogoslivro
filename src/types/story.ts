/**
 * Tipos centrais do formato de livro-jogo (gamebook).
 * Estes tipos são a fonte da verdade e devem espelhar os schemas Zod
 * em `src/schemas/story.schema.ts`.
 */

export type StatKey = "skill" | "stamina" | "luck";

export interface DiceFormula {
  /** Quantidade de dados a rolar */
  dice: number;
  /** Número de lados de cada dado (padrão: 6) */
  sides: number;
  /** Modificador somado ao resultado da rolagem */
  modifier: number;
}

export interface CharacterCreationRules {
  skill: DiceFormula;
  stamina: DiceFormula;
  luck: DiceFormula;
  gold: number;
  provisions: number;
}

export type ItemKind = "weapon" | "armor" | "consumable" | "key" | "misc";

export interface ItemEffect {
  stat: StatKey | "gold" | "provisions";
  value: number;
}

export interface StoryItem {
  id: string;
  name: string;
  description: string;
  kind: ItemKind;
  /** Dano extra somado ao dano causado quando esta arma está equipada e o jogador vence a rodada */
  damageBonus?: number;
  /** Dano subtraído do dano recebido quando esta armadura está equipada e o inimigo vence a rodada */
  defenseBonus?: number;
  /** Efeitos aplicados ao ser consumido (poções, provisões especiais...) */
  onUseEffects?: ItemEffect[];
  /** Se true, o item é removido do inventário após o uso */
  consumable?: boolean;
  /** Se false, o item não pode ser descartado manualmente */
  discardable?: boolean;
  /** Chave de ícone sugerida (ex.: "sword", "shield", "potion", "food", "book", "key", "gem"); a UI cai num ícone padrão por `kind` se não reconhecida */
  icon?: string;
  /** Texto extra só visível ao "Olhar" o item no inventário */
  examineText?: string;
  /** Imagem extra só visível ao "Olhar" o item no inventário */
  examineImage?: string;
}

export interface StoryEnemy {
  id: string;
  name: string;
  skill: number;
  stamina: number;
  description?: string;
  image?: string;
  /** Texto exibido quando este inimigo é derrotado */
  defeatText?: string;
  /** Pontos somados à pontuação do jogador ao derrotar este inimigo */
  points?: number;
  /** Item (de `items`) que este inimigo pode deixar cair ao ser derrotado */
  lootItemId?: string;
  /** Chance (0-100) de o item de `lootItemId` ser concedido ao derrotar este inimigo */
  lootChancePercent?: number;
}

// ---------- Condições ----------

interface BaseCondition {
  /** Inverte o resultado da condição (NOT lógico) */
  negate?: boolean;
}

export interface HasItemCondition extends BaseCondition {
  type: "hasItem";
  itemId: string;
}

export interface NotHasItemCondition extends BaseCondition {
  type: "notHasItem";
  itemId: string;
}

export interface StatComparisonCondition extends BaseCondition {
  type: "statGreater" | "statLess" | "statEqual";
  stat: StatKey;
  value: number;
}

export interface FlagActiveCondition extends BaseCondition {
  type: "flagActive";
  flag: string;
}

export interface FlagInactiveCondition extends BaseCondition {
  type: "flagInactive";
  flag: string;
}

export interface MinGoldCondition extends BaseCondition {
  type: "minGold";
  value: number;
}

export interface EnemyDefeatedCondition extends BaseCondition {
  type: "enemyDefeated";
  enemyId: string;
}

export interface SectionVisitedCondition extends BaseCondition {
  type: "sectionVisited";
  sectionId: string;
}

export interface ChoiceMadeCondition extends BaseCondition {
  type: "choiceMade";
  choiceId: string;
}

export type Condition =
  | HasItemCondition
  | NotHasItemCondition
  | StatComparisonCondition
  | FlagActiveCondition
  | FlagInactiveCondition
  | MinGoldCondition
  | EnemyDefeatedCondition
  | SectionVisitedCondition
  | ChoiceMadeCondition;

// ---------- Ações ----------

export interface AddItemAction {
  type: "addItem";
  itemId: string;
}

export interface RemoveItemAction {
  type: "removeItem";
  itemId: string;
}

export interface ModifyStatAction {
  type: "modifyStat";
  stat: StatKey;
  value: number;
}

export interface RestoreStatAction {
  type: "restoreStat";
  stat: StatKey;
  /** Se omitido, restaura ao valor máximo */
  value?: number;
}

export interface AddGoldAction {
  type: "addGold";
  value: number;
}

export interface RemoveGoldAction {
  type: "removeGold";
  value: number;
}

export interface AddProvisionsAction {
  type: "addProvisions";
  value: number;
}

export interface RemoveProvisionsAction {
  type: "removeProvisions";
  value: number;
}

export interface SetFlagAction {
  type: "setFlag";
  flag: string;
}

export interface ClearFlagAction {
  type: "clearFlag";
  flag: string;
}

export interface LogEventAction {
  type: "logEvent";
  message: string;
}

export interface StartCombatAction {
  type: "startCombat";
  enemyIds: string[];
  /** Seção para onde ir em caso de vitória */
  onVictory: string;
  /** Seção para onde ir em caso de derrota */
  onDefeat: string;
  /** Se definido, permite fugir para esta seção */
  onFlee?: string;
}

export interface StartTestAction {
  type: "startTest";
  testType: "luck" | "skill" | "attribute" | "fixed";
  stat?: StatKey;
  fixedValue?: number;
  onSuccess: string;
  onFailure: string;
}

export interface GoToSectionAction {
  type: "goToSection";
  sectionId: string;
}

export interface EndStoryAction {
  type: "endStory";
  ending: "victory" | "defeat" | "neutral";
  title: string;
  text: string;
}

export type Action =
  | AddItemAction
  | RemoveItemAction
  | ModifyStatAction
  | RestoreStatAction
  | AddGoldAction
  | RemoveGoldAction
  | AddProvisionsAction
  | RemoveProvisionsAction
  | SetFlagAction
  | ClearFlagAction
  | LogEventAction
  | StartCombatAction
  | StartTestAction
  | GoToSectionAction
  | EndStoryAction;

// ---------- Seções ----------

export interface Choice {
  id: string;
  text: string;
  target: string;
  conditions?: Condition[];
  /** Texto exibido quando a escolha está bloqueada por não cumprir condições */
  lockedReason?: string;
  actions?: Action[];
}

export interface StorySection {
  id: string;
  title?: string;
  paragraphs: string[];
  image?: string;
  /** Ações executadas automaticamente ao entrar na seção */
  onEnter?: Action[];
  choices: Choice[];
  /** Se true, as escolhas desta seção continuam disponíveis mesmo após já terem sido feitas (ex.: cidades, hubs). Default: false — cada escolha só pode ser feita uma vez. */
  canRepeat?: boolean;
  /** Se true, o jogador pode descansar nesta seção (consome 1 Provisão, restaura 4 de Energia, zera a Fadiga). */
  allowRest?: boolean;
  /** Se true, o jogador pode comer nesta seção (consome 1 Provisão, zera a Fadiga). */
  allowEat?: boolean;
  /** Chance de emboscada ao tentar descansar nesta seção (ver `allowRest`). Só tem efeito combinado com `allowRest: true`. */
  restEncounter?: RestEncounter;
}

/** Encontro de combate que pode interromper uma tentativa de descanso (ver `StorySection.allowRest`/`restEncounter`). */
export interface RestEncounter {
  /** Chance (0-100) de o descanso ser interrompido por este encontro. */
  chancePercent: number;
  enemyIds: string[];
  /** Seção para onde ir em caso de vitória */
  onVictory: string;
  /** Seção para onde ir em caso de derrota */
  onDefeat: string;
  /** Se definido, permite fugir para esta seção */
  onFlee?: string;
}

/** Configuração de quais sistemas oficiais da engine estão ativos neste livro. Todas as flags são opcionais e default `true` quando omitidas. */
export interface RulesConfig {
  /** Se true (default), a tela de Regras usa as explicações padrão da engine para cada mecânica, além de `rulesText`. */
  useDefaultRules?: boolean;
  /** Sistema de fadiga (contador visível, aumenta a cada seção sem comer/descansar). */
  fatigueSystem?: boolean;
  /** Orientação de gerenciamento estratégico de provisões (não altera comportamento de código, só documentação/diretriz de criação). */
  provisions?: boolean;
  /** Sistema de descanso (`allowRest` nas seções). */
  restSystem?: boolean;
  /** Permite "Testar a Sorte" após vencer uma rodada de combate para +2 de dano. */
  combatLuck?: boolean;
}

export interface GameBook {
  id: string;
  version: string;
  title: string;
  author: string;
  description: string;
  genre?: string;
  estimatedDuration?: string;
  /** Classificação indicativa (ex.: "Livre", "14+"). */
  ageRating?: string;
  cover?: string;
  /** Texto livre com regras especiais do livro, mostrado na tela de Regras e nos detalhes. */
  rulesText?: string;
  /** Quais sistemas oficiais da engine estão ativos neste livro (ver `RulesConfig`). */
  rules?: RulesConfig;
  startSection: string;
  characterCreation: CharacterCreationRules;
  items: StoryItem[];
  enemies: StoryEnemy[];
  sections: Record<string, StorySection>;
}
