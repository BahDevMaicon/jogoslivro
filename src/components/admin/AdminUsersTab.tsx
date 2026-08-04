import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/authStore";
import { normalize } from "@/lib/text";
import { TextField, SelectField } from "@/components/editor/fields";

type Role = "normal" | "premium" | "admin";
type Status = "active" | "blocked" | "pending" | "deleted";

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  role: Role;
  status: Status;
}

const ROLE_OPTIONS = [
  { value: "normal", label: "Usuário" },
  { value: "premium", label: "Premium" },
  { value: "admin", label: "Administrador" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "blocked", label: "Bloqueado" },
];

export function AdminUsersTab() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [rows, setRows] = useState<ProfileRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("profiles")
      .select("id, email, display_name, role, status")
      .order("created_at", { ascending: false });
    if (queryError) {
      setError("Não foi possível carregar os usuários.");
      return;
    }
    setRows((data ?? []) as ProfileRow[]);
  }

  async function updateField(id: string, patch: Partial<Pick<ProfileRow, "role" | "status">>) {
    if (!supabase) return;
    setPendingId(id);
    setError(null);
    const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", id);
    setPendingId(null);
    if (updateError) {
      setError("Não foi possível salvar a alteração.");
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, ...patch } : r)) : prev));
  }

  const filtered = rows?.filter((r) => {
    if (!search.trim()) return true;
    const q = normalize(search.trim());
    return normalize(r.email ?? "").includes(q) || normalize(r.display_name ?? "").includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <TextField label="Buscar" value={search} onChange={setSearch} placeholder="Email ou nome..." />

      {error && (
        <p className="flex items-center gap-2 rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      {rows === null && !error && <p className="font-serif text-parchment-300">Carregando...</p>}

      {filtered && filtered.length === 0 && (
        <p className="font-serif text-parchment-300/80">Nenhum usuário encontrado.</p>
      )}

      {filtered && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((row) => {
            const isSelf = row.id === currentUser?.id;
            return (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-sm text-parchment-50">{row.display_name || "(sem nome)"}</p>
                  <p className="text-xs text-parchment-300/70">{row.email ?? "(sem email)"}</p>
                  {isSelf && <p className="text-xs text-ember-400">Sua conta</p>}
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-40">
                    <SelectField
                      label="Papel"
                      value={row.role}
                      disabled={isSelf || pendingId === row.id}
                      onChange={(v) => updateField(row.id, { role: v as Role })}
                      options={ROLE_OPTIONS}
                    />
                  </div>
                  <div className="w-32">
                    <SelectField
                      label="Status"
                      value={row.status === "pending" || row.status === "deleted" ? "active" : row.status}
                      disabled={isSelf || pendingId === row.id}
                      onChange={(v) => updateField(row.id, { status: v as Status })}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
