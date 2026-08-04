import { roll2d6, type DiceRollResult } from "./diceEngine";
import type { PendingTest } from "@/types/game";
import type { Character } from "@/types/game";

export interface TestOutcome {
  roll: DiceRollResult;
  targetValue: number;
  success: boolean;
  nextSectionId: string;
  /** Aplicável somente a testes de sorte: a Sorte é sempre reduzida em 1 após o teste */
  luckPenaltyApplied: boolean;
}

/**
 * Executa um "Teste de Sorte" clássico: rola 2 dados, sucesso se a soma for
 * menor ou igual à Sorte atual. A Sorte é sempre reduzida em 1 ponto após o teste,
 * independentemente do resultado.
 */
export function resolveLuckTest(character: Character, test: PendingTest): TestOutcome {
  const roll = roll2d6();
  const success = roll.total <= character.stats.luck;
  return {
    roll,
    targetValue: character.stats.luck,
    success,
    nextSectionId: success ? test.onSuccess : test.onFailure,
    luckPenaltyApplied: true,
  };
}

/**
 * Executa um teste de atributo genérico (Habilidade, Energia, Sorte ou valor fixo).
 * Sucesso quando a soma dos dados + o atributo for maior ou igual ao valor-alvo,
 * seguindo a convenção de "teste de habilidade" configurável pela história.
 */
export function resolveAttributeTest(character: Character, test: PendingTest): TestOutcome {
  const roll = roll2d6();
  const targetValue =
    test.testType === "fixed" ? (test.fixedValue ?? 0) : test.stat ? character.stats[test.stat] : 0;

  // Regra configurável: para testes de valor fixo, sucesso quando a soma dos
  // dados atinge ou supera o alvo; para testes de atributo (Habilidade, Energia,
  // Sorte), sucesso quando a soma dos dados fica igual ou abaixo do atributo,
  // seguindo a mesma convenção do Teste de Sorte clássico.
  const success = test.testType === "fixed" ? roll.total >= targetValue : roll.total <= targetValue;

  return {
    roll,
    targetValue,
    success,
    nextSectionId: success ? test.onSuccess : test.onFailure,
    luckPenaltyApplied: false,
  };
}

/** Ponto de entrada único: escolhe a resolução correta conforme o tipo de teste. */
export function resolveTest(character: Character, test: PendingTest): TestOutcome {
  if (test.testType === "luck") {
    return resolveLuckTest(character, test);
  }
  return resolveAttributeTest(character, test);
}
