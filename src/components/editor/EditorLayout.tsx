import { useRef, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, BookOpen, FileJson, Save, Skull, ScrollText, Sparkles, User } from "lucide-react";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import { SiteNav } from "@/components/layout/SiteNav";

export type EditorTab = "info" | "items" | "enemies" | "sections";

const TABS: { id: EditorTab; label: string; icon: typeof BookOpen }[] = [
  { id: "info", label: "Informações", icon: User },
  { id: "items", label: "Itens", icon: Sparkles },
  { id: "enemies", label: "Inimigos", icon: Skull },
  { id: "sections", label: "Seções", icon: ScrollText },
];

interface EditorLayoutProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  children: ReactNode;
}

export function EditorLayout({ activeTab, onTabChange, children }: EditorLayoutProps) {
  const navigate = useNavigate();
  const mode = useBookEditorStore((s) => s.mode);
  const book = useBookEditorStore((s) => s.book);
  const errors = useBookEditorStore((s) => s.errors);
  const saving = useBookEditorStore((s) => s.saving);
  const save = useBookEditorStore((s) => s.save);
  const importFromJson = useBookEditorStore((s) => s.importFromJson);
  const syncError = useBookEditorStore((s) => s.syncError);
  const importInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    const result = await save();
    // Se a cópia no servidor falhou, fica na página mostrando o aviso em vez de navegar direto.
    if (result.success && result.id && !useBookEditorStore.getState().syncError) {
      navigate(`/book/${result.id}`);
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      importFromJson(data);
    } catch {
      useBookEditorStore.setState({ errors: ["O arquivo selecionado não contém um JSON válido."] });
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6">
      <SiteNav />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" className="btn-secondary mb-2" onClick={() => navigate("/biblioteca")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar à biblioteca
          </button>
          <h1 className="font-display text-2xl text-parchment-50">
            {mode === "create" ? "Criar novo livro" : `Editando: ${book.title || book.id}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {mode === "create" && (
            <>
              <button type="button" className="btn-secondary" onClick={() => importInputRef.current?.click()}>
                <FileJson className="h-4 w-4" aria-hidden="true" /> Importar JSON
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportFile}
              />
            </>
          )}
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" aria-hidden="true" /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      {errors.length > 0 && (
        <div className="rounded-md border border-red-800/50 bg-red-950/30 p-4 text-red-200">
          <p className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-wide">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Não foi possível salvar
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {syncError && (
        <div className="rounded-md border border-amber-700/40 bg-amber-950/20 p-4 text-amber-200">
          <p className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> {syncError}
          </p>
        </div>
      )}

      <nav className="flex flex-wrap gap-2 border-b border-parchment-700/30 pb-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              activeTab === id ? "bg-ember-600/20 text-ember-300" : "text-parchment-300 hover:bg-nightwood-800"
            }`}
            onClick={() => onTabChange(id)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </nav>

      <div className="parchment-card p-5">{children}</div>
    </div>
  );
}
