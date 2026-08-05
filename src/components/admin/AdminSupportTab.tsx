import { useEffect, useState } from "react";
import { CheckCircle2, Send, ShieldAlert } from "lucide-react";
import { SelectField, TextareaField } from "@/components/editor/fields";
import {
  fetchAllTickets,
  respondToTicket,
  updateTicketStatus,
  type AdminSupportTicket,
} from "@/engine/supportEngine";
import { CATEGORY_LABEL, STATUS_BADGE_CLASS, STATUS_LABEL, type TicketStatus } from "@/lib/supportStatus";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Todos os status" },
  ...(Object.keys(STATUS_LABEL) as TicketStatus[]).map((value) => ({ value, label: STATUS_LABEL[value] })),
];

export function AdminSupportTab() {
  const [tickets, setTickets] = useState<AdminSupportTicket[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setTickets(await fetchAllTickets());
  }

  async function markInReview(id: string) {
    setPendingId(id);
    setError(null);
    const result = await updateTicketStatus(id, "in_review");
    setPendingId(null);
    if (!result.success) {
      setError(result.error ?? "Não foi possível atualizar o chamado.");
      return;
    }
    setTickets((prev) => (prev ? prev.map((t) => (t.id === id ? { ...t, status: "in_review" } : t)) : prev));
  }

  async function submitResponse(id: string) {
    const response = (drafts[id] ?? "").trim();
    if (!response) return;
    setPendingId(id);
    setError(null);
    const result = await respondToTicket(id, response);
    setPendingId(null);
    if (!result.success) {
      setError(result.error ?? "Não foi possível enviar a resposta.");
      return;
    }
    setTickets((prev) =>
      prev
        ? prev.map((t) =>
            t.id === id ? { ...t, status: "answered", adminResponse: response, respondedAt: new Date().toISOString() } : t
          )
        : prev
    );
    setDrafts((prev) => ({ ...prev, [id]: "" }));
  }

  const filtered = tickets?.filter((t) => statusFilter === "all" || t.status === statusFilter);

  return (
    <div className="flex flex-col gap-4">
      <SelectField
        label="Filtrar por status"
        value={statusFilter}
        onChange={(v) => setStatusFilter(v as TicketStatus | "all")}
        options={STATUS_FILTER_OPTIONS}
      />

      {error && (
        <p className="flex items-center gap-2 rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      {tickets === null && !error && <p className="font-serif text-parchment-300">Carregando...</p>}

      {filtered && filtered.length === 0 && <p className="font-serif text-parchment-300/80">Nenhum chamado encontrado.</p>}

      {filtered && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((ticket) => {
            const busy = pendingId === ticket.id;
            return (
              <div key={ticket.id} className="flex flex-col gap-3 rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-sm text-parchment-50">
                      {CATEGORY_LABEL[ticket.category]}
                      {ticket.subject ? ` — ${ticket.subject}` : ""}
                    </p>
                    <p className="text-xs text-parchment-300/70">
                      {ticket.displayName || "(usuário sem nome)"} · {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE_CLASS[ticket.status]}`}>
                    {STATUS_LABEL[ticket.status]}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm text-parchment-200/85">{ticket.message}</p>

                {ticket.status === "answered" ? (
                  <div className="rounded-md border border-moss-700/30 bg-moss-950/20 p-3">
                    <p className="mb-1 text-xs uppercase tracking-wide text-moss-400">Resposta enviada</p>
                    <p className="whitespace-pre-wrap text-sm text-parchment-100">{ticket.adminResponse}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {ticket.status === "sent" && (
                      <button
                        type="button"
                        className="btn-secondary self-start text-xs"
                        disabled={busy}
                        onClick={() => markInReview(ticket.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Marcar em análise
                      </button>
                    )}
                    <TextareaField
                      label="Resposta"
                      value={drafts[ticket.id] ?? ""}
                      onChange={(v) => setDrafts((prev) => ({ ...prev, [ticket.id]: v }))}
                      placeholder="Escreva a resposta para o usuário..."
                      rows={3}
                    />
                    <button
                      type="button"
                      className="btn-primary self-start text-xs"
                      disabled={busy || !(drafts[ticket.id] ?? "").trim()}
                      onClick={() => submitResponse(ticket.id)}
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" /> Responder
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
