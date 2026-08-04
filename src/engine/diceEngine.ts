import type { DiceFormula } from "@/types/story";

/**
 * Rola um único dado de `sides` lados usando o gerador de números
 * aleatórios do navegador (crypto quando disponível, com fallback).
 */
export function rollDie(sides = 6): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return (buffer[0] % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

export interface DiceRollResult {
  rolls: number[];
  sides: number;
  modifier: number;
  total: number;
}

/** Rola `count` dados de `sides` lados e soma um modificador opcional. */
export function rollDice(count: number, sides = 6, modifier = 0): DiceRollResult {
  const rolls = Array.from({ length: Math.max(count, 0) }, () => rollDie(sides));
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
  return { rolls, sides, modifier, total };
}

/** Rola dois dados de seis lados — usado extensivamente pelas regras clássicas. */
export function roll2d6(): DiceRollResult {
  return rollDice(2, 6, 0);
}

/** Resolve uma fórmula de dados (ex.: geração de atributos iniciais). */
export function rollFormula(formula: DiceFormula): DiceRollResult {
  return rollDice(formula.dice, formula.sides, formula.modifier);
}
