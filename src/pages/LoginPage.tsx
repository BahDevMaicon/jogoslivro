import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, ShieldAlert, UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { SiteNav } from "@/components/layout/SiteNav";

type Mode = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const pendingConfirmation = useAuthStore((s) => s.pendingConfirmation);

  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (mode === "register" && password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    const success = mode === "login" ? await login(email, password) : await register(email, password);
    if (success) navigate(redirectTo, { replace: true });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <SiteNav />

      <div className="parchment-card p-6 sm:p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-parchment-50">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mb-6 text-center font-serif text-sm text-parchment-300/70">
          Necessário para criar ou adicionar livros-jogo.
        </p>

        <div className="mb-6 flex rounded-md border border-parchment-700/40 p-1">
          <button
            type="button"
            className={`flex-1 rounded px-3 py-2 text-sm font-display transition ${mode === "login" ? "bg-ember-600/20 text-ember-300" : "text-parchment-400"}`}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`flex-1 rounded px-3 py-2 text-sm font-display transition ${mode === "register" ? "bg-ember-600/20 text-ember-300" : "text-parchment-400"}`}
            onClick={() => setMode("register")}
          >
            Criar conta
          </button>
        </div>

        {(formError || error) && (
          <p className="mb-4 flex items-center gap-2 rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {formError ?? error}
          </p>
        )}

        {pendingConfirmation && (
          <p className="mb-4 flex items-center gap-2 rounded-md border border-ember-700/40 bg-ember-950/20 p-2 text-sm text-ember-200">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> Conta criada! Confira seu email para
            confirmar o cadastro antes de entrar.
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">Email</span>
            <input
              type="email"
              required
              className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">
                Confirmar senha
              </span>
              <input
                type="password"
                required
                minLength={6}
                className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {mode === "login" ? (
              <LogIn className="h-4 w-4" aria-hidden="true" />
            ) : (
              <UserPlus className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-parchment-400/70">
          Sua conta e sessão ficam no Supabase — funciona em qualquer dispositivo.
        </p>
      </div>
    </div>
  );
}
