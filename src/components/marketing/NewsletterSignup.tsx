import { useState, type FormEvent } from "react";
import { Mail, PartyPopper } from "lucide-react";
import { subscribeEmail } from "@/engine/newsletterEngine";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = subscribeEmail(email);
    if (!result.success) {
      setStatus("error");
      setError(result.error ?? "Não foi possível cadastrar este email.");
      return;
    }
    setStatus("success");
    setError(null);
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-700/40 bg-emerald-950/20 p-4 text-center font-serif text-emerald-200">
        <PartyPopper className="h-5 w-5 shrink-0" aria-hidden="true" />
        Prontinho — você vai saber das novidades primeiro.
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
      <label className="flex-1">
        <span className="sr-only">Email</span>
        <input
          type="email"
          required
          placeholder="seu@email.com"
          className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button type="submit" className="btn-primary">
        <Mail className="h-4 w-4" aria-hidden="true" /> Quero novidades
      </button>
      {status === "error" && error && <p className="text-sm text-red-300 sm:basis-full">{error}</p>}
    </form>
  );
}
