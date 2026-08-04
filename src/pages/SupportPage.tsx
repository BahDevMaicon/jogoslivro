import { useState, type FormEvent } from "react";
import { LifeBuoy, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useAuthStore } from "@/stores/authStore";
import { sendSupportMessage } from "@/engine/supportEngine";

const SUPPORT_EMAIL = "maicon.cassio@gmail.com";

export default function SupportPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    setSending(true);
    setFeedback(null);
    const result = await sendSupportMessage(currentUser.id, subject, message);
    setSending(false);

    if (!result.success) {
      setFeedback({ kind: "error", text: result.error ?? "Não foi possível enviar sua mensagem. Tente novamente." });
      return;
    }
    setSubject("");
    setMessage("");
    setFeedback({ kind: "success", text: "Mensagem enviada! Vamos te responder por e-mail em breve." });
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
          Dúvida, sugestão ou algo quebrado? Conta pra gente.
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
          <label className="block">
            <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">
              Assunto (opcional)
            </span>
            <input
              type="text"
              className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>

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
            {sending ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-parchment-400/70">
        Prefere e-mail direto?{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ember-400 hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}
