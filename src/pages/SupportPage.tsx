import { useEffect, useState, type FormEvent } from "react";
import { LifeBuoy, Mail, MessageSquareText, ShieldAlert, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useAuthStore } from "@/stores/authStore";
import { fetchMyTickets, sendSupportMessage, type SupportTicket } from "@/engine/supportEngine";
import { CATEGORY_LABEL, STATUS_BADGE_CLASS, STATUS_LABEL, type TicketCategory } from "@/lib/supportStatus";
import { SelectField, TextField } from "@/components/editor/fields";

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as TicketCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

export default function SupportPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const [category, setCategory] = useState<TicketCategory>("duvida");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  async function loadTickets() {
    if (!currentUser) return;
    setLoadingTickets(true);
    setTickets(await fetchMyTickets(currentUser.id));
    setLoadingTickets(false);
  }

  useEffect(() => {
    void loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    setSending(true);
    setFeedback(null);
    const result = await sendSupportMessage(currentUser.id, category, subject, message);
    setSending(false);

    if (!result.success) {
      setFeedback({ kind: "error", text: result.error ?? "Não foi possível enviar sua mensagem. Tente novamente." });
      return;
    }
    setSubject("");
    setMessage("");
    setCategory("duvida");
    setFeedback({ kind: "success", text: "Chamado registrado! Acompanhe o status logo abaixo." });
    await loadTickets();
  }

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <SiteNav />

      <header className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-ember-400">
          <LifeBuoy className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl text-parchment-50 sm:text-3xl">Suporte</h1>
        <p className="mt-2 font-serif text-sm text-parchment-300/70">
          Dúvida, sugestão ou algo quebrado? Abra um chamado e acompanhe a resposta aqui mesmo.
        </p>
      </header>

      <div className="parchment-card p-6 sm:p-8">
        {feedback && (
          <p
            className={`mb-4 flex items-center gap-2 rounded-md border p-2 text-sm ${
              feedback.kind === "success"
                ? "border-moss-700/40 bg-moss-950/20 text-moss-200"
                : "border-red-800/50 bg-red-950/30 text-red-200"
            }`}
          >
            {feedback.kind === "success" ? (
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {feedback.text}
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <SelectField
            label="Tipo de problema"
            value={category}
            onChange={(v) => setCategory(v as TicketCategory)}
            options={CATEGORY_OPTIONS}
          />

          <TextField label="Assunto (opcional)" value={subject} onChange={setSubject} />

          <label className="block">
            <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">Mensagem</span>
            <textarea
              rows={6}
              required
              className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva sua dúvida ou o problema que encontrou..."
            />
          </label>

          <button type="submit" className="btn-primary mt-2" disabled={sending}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {sending ? "Enviando..." : "Abrir chamado"}
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-parchment-50">
          <MessageSquareText className="h-5 w-5 text-ember-400" aria-hidden="true" /> Meus chamados
        </h2>

        {loadingTickets ? (
          <p className="text-sm text-parchment-400/70">Carregando...</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-parchment-400/70">Nenhum chamado aberto ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-sm text-parchment-100">
                    {CATEGORY_LABEL[ticket.category]}
                    {ticket.subject ? ` — ${ticket.subject}` : ""}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_BADGE_CLASS[ticket.status]}`}>
                    {STATUS_LABEL[ticket.status]}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-parchment-200/85">{ticket.message}</p>
                <p className="mt-2 text-xs text-parchment-400/60">
                  {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                </p>

                {ticket.status === "answered" && ticket.adminResponse && (
                  <div className="mt-3 rounded-md border border-moss-700/30 bg-moss-950/20 p-3">
                    <p className="mb-1 text-xs uppercase tracking-wide text-moss-400">Resposta</p>
                    <p className="whitespace-pre-wrap text-sm text-parchment-100">{ticket.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
