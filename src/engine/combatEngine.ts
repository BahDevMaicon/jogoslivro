import { roll2d6, type DiceRollResult } from "./diceEngine";
import type { CombatState, Character, EnemyState } from "@/types/game";
import type { StoryEnemy } from "@/types/story";

/** Constrói o estado inicial de combate a partir da lista de inimigos definida na história. */
export function createCombatState(
  enemies: StoryEnemy[],
  onVictory: string,
  onDefeat: string,
  onFlee?: string
): CombatState {
  return {
    enemies: enemies.map(
      (e): EnemyState => ({
        id: e.id,
        name: e.name,
        skill: e.skill,
        stamina: e.stamina,
        maxStamina: e.stamina,
      })
    ),
    onVictory,
    onDefeat,
    onFlee,
    round: 1,
    isActive: true,
  };
}

export interface CombatantPower {
  roll: DiceRollResult;
  attackStrength: number;
}

export interface RoundResult {
  playerRoll: DiceRollResult;
  playerAttackStrength: number;
  enemyRoll: DiceRollResult;
  enemyAttackStrength: number;
  /** Quem venceu a rodada (aplica dano ao oponente); 'tie' não causa dano */
  winner: "player" | "enemy" | "tie";
  damage: number;
}

export const DEFAULT_COMBAT_DAMAGE = 2;

/** Calcula a força de ataque de um combatente: 2d6 + Habilidade + modificadores. */
export function calculateAttackStrength(skill: number, modifier = 0): CombatantPower {
  const roll = roll2d6();
  return { roll, attackStrength: roll.total + skill + modifier };
}

/**
 * Resolve uma rodada de combate entre o jogador e um único inimigo.
 * Quem tiver a maior Força de Ataque causa dano (padrão 2 pontos de Energia);
 * empate não causa dano.
 */
export function resolveCombatRound(
  playerSkill: number,
  enemySkill: number,
  options?: { playerModifier?: number; enemyModifier?: number; damage?: number }
): RoundResult {
  const damage = options?.damage ?? DEFAULT_COMBAT_DAMAGE;
  const player = calculateAttackStrength(playerSkill, options?.playerModifier ?? 0);
  const enemy = calculateAttackStrength(enemySkill, options?.enemyModifier ?? 0);

  let winner: RoundResult["winner"] = "tie";
  if (player.attackStrength > enemy.attackStrength) winner = "player";
  else if (enemy.attackStrength > player.attackStrength) winner = "enemy";

  return {
    playerRoll: player.roll,
    playerAttackStrength: player.attackStrength,
    enemyRoll: enemy.roll,
    enemyAttackStrength: enemy.attackStrength,
    winner,
    damage: winner === "tie" ? 0 : damage,
  };
}

export interface DamageModifiers {
  /** Bônus de dano do equipamento de quem venceu a rodada (ex.: arma do jogador) */
  attackerDamageBonus?: number;
  /** Redução de dano do equipamento de quem perdeu a rodada (ex.: armadura do jogador) */
  defenderDefenseBonus?: number;
}

/**
 * Aplica o dano de uma rodada ao personagem ou ao inimigo-alvo, retornando novos
 * estados e o dano final (`damageDealt`) já considerando bônus de ataque/defesa
 * de equipamento — a rolagem (`round.damage`) decide só a base; o equipamento
 * decide quanto esse valor aumenta (arma) ou diminui (armadura), com piso em 0.
 */
export function applyRoundDamage(
  round: RoundResult,
  character: Character,
  enemy: EnemyState,
  modifiers?: DamageModifiers
): { character: Character; enemy: EnemyState; damageDealt: number } {
  if (round.winner === "tie") {
    return { character, enemy, damageDealt: 0 };
  }

  const damageDealt = Math.max(
    0,
    round.damage + (modifiers?.attackerDamageBonus ?? 0) - (modifiers?.defenderDefenseBonus ?? 0)
  );

  if (round.winner === "player") {
    return {
      character,
      enemy: { ...enemy, stamina: Math.max(0, enemy.stamina - damageDealt) },
      damageDealt,
    };
  }

  return {
    character: {
      ...character,
      stats: {
        ...character.stats,
        stamina: Math.max(0, character.stats.stamina - damageDealt),
      },
    },
    enemy,
    damageDealt,
  };
}

/**
 * Resolve o Teste de Sorte especial de combate ("Testar a Sorte"), disponível
 * após uma rodada vencida pelo jogador: rola 2 dados, sucesso se a soma for
 * menor ou igual à Sorte atual. Não altera `luck` — o chamador aplica a
 * penalidade de -1 junto ao restante do estado.
 */
export function resolveCombatLuckBonus(character: Character): { roll: DiceRollResult; success: boolean } {
  const roll = roll2d6();
  return { roll, success: roll.total <= character.stats.luck };
}

export type CombatOutcome = "ongoing" | "victory" | "defeat";

/** Determina o status atual do combate após atualizações de energia. */
export function evaluateCombatOutcome(character: Character, enemies: EnemyState[]): CombatOutcome {
  if (character.stats.stamina <= 0) return "defeat";
  if (enemies.every((e) => e.stamina <= 0)) return "victory";
  return "ongoing";
}
