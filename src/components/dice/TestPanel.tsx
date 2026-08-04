import { Sparkles } from "lucide-react";
import { DiceFace } from "@/components/dice/DiceFace";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import { useSettingsStore } from "@/stores/settingsStore";

const TEST_LABELS: Record<string, string> = {
  luck: "Teste de Sorte",
  skill: "Teste de Habilidade",
  attribute: "Teste de Atributo",
  fixed: "Teste de Valor Fixo",
};

export function TestPanel() {
  const pendingTest = useGameSessionStore((s) => s.pendingTest);
  const rollPendingTest = useGameSessionStore((s) => s.rollPendingTest);
  const confirmPendingTest = useGameSessionStore((s) => s.confirmPendingTest);
  const lastTestOutcome = useGameSessionStore((s) => s.lastTestOutcome);
  const character = useGameSessionStore((s) => s.character);
  const animations = useSettingsStore((s) => s.settings.animations);

  if (!pendingTest || !character) return null;

  const label = TEST_LABELS[pendingTest.testType] ?? "Teste";

  return (
    <div aria-label="Painel de teste">
      <div className="mb-4 flex items-center gap-2 text-ember-600">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <h2 className="font-display text-lg uppercase tracking-wide">{label}</h2>
      </div>

      {!lastTestOutcome && (
        <>
          <p className="mb-5 text-center font-serif text-nightwood-900">
            {pendingTest.testType === "luck"
              ? `Role dois dados. Sucesso se a soma for menor ou igual à sua Sorte (${character.stats.luck}).`
              : pendingTest.testType === "fixed"
                ? `Role dois dados. Sucesso se a soma for maior ou igual a ${pendingTest.fixedValue ?? 0}.`
                : `Role dois dados. Sucesso se a soma for menor ou igual ao atributo testado.`}
          </p>
          <div className="flex justify-center">
            <button className="btn-primary" onClick={rollPendingTest}>
              Rolar dados
            </button>
          </div>
        </>
      )}

      {lastTestOutcome && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            {lastTestOutcome.roll.rolls.map((r, i) => (
              <DiceFace key={i} value={r} animate={animations} delay={i * 0.1} />
            ))}
          </div>
          <p className="font-display text-lg text-nightwood-900">
            Total: <span className="text-ember-600">{lastTestOutcome.roll.total}</span>
          </p>
          <p
            className={`font-display text-xl ${lastTestOutcome.success ? "text-emerald-700" : "text-red-700"}`}
            title={
              pendingTest.testType === "luck"
                ? "Teste de Sorte: sucesso se a soma dos dados for ≤ sua Sorte atual. Sua Sorte cai 1 ponto após o teste, mesmo com sucesso."
                : undefined
            }
          >
            {lastTestOutcome.success ? "Sucesso!" : "Falha..."}
          </p>
          <button className="btn-primary mt-2" onClick={confirmPendingTest}>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
