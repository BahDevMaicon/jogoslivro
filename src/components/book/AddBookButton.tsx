import { useRef, useState, type ChangeEvent } from "react";
import { FolderUp } from "lucide-react";
import { saveUserBook, syncBookToSupabase } from "@/engine/userBookStorage";
import { useAuthStore } from "@/stores/authStore";

interface AddBookButtonProps {
  /** Chamado após um livro ser adicionado com sucesso, para recarregar a biblioteca. */
  onAdded: () => void;
}

/**
 * Botão que abre um seletor de pasta (input com `webkitdirectory`) e salva o
 * livro-jogo localmente (IndexedDB) a partir de um `story.json` + assets
 * dentro da pasta escolhida — sem precisar editar `registry.ts` nem colocar
 * arquivos em `public/`. Só renderiza para quem já tem permissão (premium ou
 * admin) — a checagem de verdade continua sendo o RLS no servidor, isto é só
 * a UI não oferecer o que a pessoa não pode usar.
 */
export function AddBookButton({ onAdded }: AddBookButtonProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  if (!currentUser || (currentUser.role !== "premium" && currentUser.role !== "admin")) {
    return null;
  }

  function handleClick() {
    inputRef.current?.click();
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setStatus("loading");
    setError(null);
    setSyncWarning(null);
    const result = await saveUserBook(files);

    if (result.success) {
      setStatus("idle");
      onAdded();
      if (currentUser && result.book) {
        const sync = await syncBookToSupabase(result.book, currentUser.id);
        if (!sync.success) {
          setSyncWarning(
            `Livro salvo neste navegador. A cópia no servidor falhou (${sync.error ?? "erro desconhecido"}) — ele pode não aparecer em outros dispositivos ainda.`
          );
        }
      }
    } else {
      setStatus("error");
      setError((result.errors ?? ["Não foi possível adicionar o livro."]).join(" "));
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" className="btn-secondary" onClick={handleClick} disabled={status === "loading"}>
        <FolderUp className="h-4 w-4" aria-hidden="true" />
        {status === "loading" ? "Adicionando livro..." : "Adicionar livro (pasta)"}
      </button>
      <input
        ref={(node) => {
          inputRef.current = node;
          if (node) {
            node.setAttribute("webkitdirectory", "true");
            node.setAttribute("directory", "true");
          }
        }}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {error && <p className="max-w-xs text-center text-xs text-red-300">{error}</p>}
      {syncWarning && <p className="max-w-xs text-center text-xs text-amber-300">{syncWarning}</p>}
    </div>
  );
}
