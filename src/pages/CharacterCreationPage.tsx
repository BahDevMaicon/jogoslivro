import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Dices, ShieldCheck } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { rollFormula } from "@/engine/diceEngine";
import { createCharacterFromRolls, useGameSessionStore } from "@/stores/gameSessionStore";

interface RolledStats {
  skill: number;
  stamina: number;
  luck: number;
}

export default function CharacterCreationPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { entries, status, loadLibrary, getBook } = useLibraryStore();
  const startNewGame = useGameSessionStore((s) => s.startNewGame);

  const [name, setName] = useState("");
  const [rolled, setRolled] = useState<RolledStats | null>(null);

  useEffect(() => {
    if (entries.length === 0 && status === "idle") loadLibrary();
  }, [entries.length, status, loadLibrary]);

  const book = bookId ? getBook(bookId) : undefined;

  useEffect(() => {
    if (book && !rolled) {
      rollStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book]);

  if (!book) {
    return <p className="p-10 text-center font-serif text-parchment-300">Carregando...</p>;
  }

  function rollStats() {
    if (!book) return;
    setRolled({
      skill: rollFormula(book.characterCreation.skill).total,
      stamina: rollFormula(book.characterCreation.stamina).total,
      luck: rollFormula(book.characterCreation.luck).total,
    });
  }

  function handleConfirm() {
    if (!book || !rolled) return;
    const character = createCharacterFromRolls(
      name,
      rolled,
      book.characterCreation.gold,
      book.characterCreation.provisions
    );
    startNewGame(book, character);
    navigate(`/book/${book.id}/play`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <button className="btn-secondary mb-6" onClick={() => navigate(`/book/${book.id}`)}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
      </button>

      <div className="parchment-card p-6 sm:p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-parchment-50">Criação de Personagem</h1>
        <p className="mb-6 text-center font-serif text-parchment-300/70">{book.title}</p>

        <label className="mb-6 block">
          <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">
            Nome do aventureiro
          </span>
          <input
            className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-lg text-parchment-50 outline-none focus-visible:border-ember-400"
            placeholder="Digite um nome (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </label>

        {rolled && (
          <div className="mb-6 grid grid-cols-3 gap-3 text-center">
            <StatCard label="Habilidade" value={rolled.skill} />
            <StatCard label="Energia" value={rolled.stamina} />
            <StatCard label="Sorte" value={rolled.luck} />
          </div>
        )}

        <div className="mb-6 flex justify-center gap-3 text-sm text-parchment-300/70">
          <p>Ouro inicial: {book.characterCreation.gold}</p>
          <p>·</p>
          <p>Provisões: {book.characterCreation.provisions}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="btn-secondary flex-1" onClick={rollStats}>
            <Dices className="h-4 w-4" aria-hidden="true" /> Rolar novamente
          </button>
          <button className="btn-primary flex-1" onClick={handleConfirm} disabled={!rolled}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Confirmar personagem
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-parchment-700/40 bg-nightwood-900/70 py-4">
      <p className="font-display text-2xl text-ember-400">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-parchment-300/70">{label}</p>
    </div>
  );
}
