import { useEffect, useState } from "react";
import { Archive, Ban, CheckCircle2, EyeOff, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { TextField } from "@/components/editor/fields";
import { normalize } from "@/lib/text";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  VISIBILITY_BADGE_CLASS,
  VISIBILITY_LABEL,
  type BookStatus,
  type BookVisibility,
} from "@/lib/bookStatus";

interface BookRow {
  id: string;
  slug: string;
  title: string;
  status: BookStatus;
  visibility: BookVisibility;
  owner: { display_name: string | null; email: string | null } | null;
}

export function AdminBooksTab() {
  const [rows, setRows] = useState<BookRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("books")
      .select("id, slug, title, status, visibility, owner:profiles(display_name, email)")
      .order("created_at", { ascending: false });
    if (queryError) {
      setError("Não foi possível carregar os livros.");
      return;
    }
    setRows((data ?? []) as unknown as BookRow[]);
  }

  async function updateStatus(id: string, patch: { status: BookStatus; visibility?: BookVisibility }) {
    if (!supabase) return;
    setPendingId(id);
    setError(null);
    const payload: Record<string, unknown> = { status: patch.status };
    if (patch.visibility) payload.visibility = patch.visibility;
    if (patch.status === "published") payload.published_at = new Date().toISOString();
    const { error: updateError } = await supabase.from("books").update(payload).eq("id", id);
    setPendingId(null);
    if (updateError) {
      setError("Não foi possível salvar a alteração.");
      return;
    }
    setRows((prev) =>
      prev ? prev.map((r) => (r.id === id ? { ...r, status: patch.status, visibility: patch.visibility ?? r.visibility } : r)) : prev
    );
  }

  const filtered = rows?.filter((r) => {
    if (!search.trim()) return true;
    const q = normalize(search.trim());
    return normalize(r.title).includes(q) || normalize(r.owner?.display_name ?? "").includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <TextField label="Buscar" value={search} onChange={setSearch} placeholder="Título ou autor..." />

      {error && (
        <p className="flex items-center gap-2 rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      {rows === null && !error && <p className="font-serif text-parchment-300">Carregando...</p>}

      {filtered && filtered.length === 0 && <p className="font-serif text-parchment-300/80">Nenhum livro encontrado.</p>}

      {filtered && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((row) => {
            const busy = pendingId === row.id;
            return (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm text-parchment-50">{row.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE_CLASS[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${VISIBILITY_BADGE_CLASS[row.visibility]}`}>
                      {VISIBILITY_LABEL[row.visibility]}
                    </span>
                  </div>
                  <p className="text-xs text-parchment-300/70">
                    por {row.owner?.display_name || row.owner?.email || "(livro de plataforma)"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status !== "published" && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={busy}
                      onClick={() => updateStatus(row.id, { status: "published", visibility: "public" })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Publicar
                    </button>
                  )}
                  {(row.status === "draft" || row.status === "in_review") && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={busy}
                      onClick={() => updateStatus(row.id, { status: "rejected" })}
                    >
                      <Ban className="h-3.5 w-3.5" aria-hidden="true" /> Rejeitar
                    </button>
                  )}
                  {row.status === "published" && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={busy}
                      onClick={() => updateStatus(row.id, { status: "unpublished", visibility: "private" })}
                    >
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Despublicar
                    </button>
                  )}
                  {row.status !== "archived" && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={busy}
                      onClick={() => updateStatus(row.id, { status: "archived" })}
                    >
                      <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Arquivar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
