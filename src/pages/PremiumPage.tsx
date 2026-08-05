import { useState } from "react";
import { CheckCircle2, Crown } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";

type PlanId = "monthly" | "annual";

const PLANS: { id: PlanId; label: string; price: string; period: string }[] = [
  { id: "monthly", label: "Mensal", price: "R$ 9,90", period: "30 dias" },
  { id: "annual", label: "Anual", price: "R$ 89,90", period: "1 ano" },
];

export default function PremiumPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPremiumActive = Boolean(currentUser?.premiumUntil && new Date(currentUser.premiumUntil) > new Date());

  async function handleSubscribe(plan: PlanId) {
    if (!supabase) return;
    setLoadingPlan(plan);
    setError(null);
    const { data, error: invokeError } = await supabase.functions.invoke("create-premium-checkout", { body: { plan } });
    setLoadingPlan(null);
    if (invokeError || !data?.init_point) {
      setError("Não foi possível iniciar o pagamento. Tente novamente.");
      return;
    }
    window.location.href = data.init_point;
  }

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <SiteNav />

      <header className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-ember-400">
          <Crown className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl text-parchment-50 sm:text-3xl">Seja Premium</h1>
        <p className="mt-2 font-serif text-sm text-parchment-300/70">Crie e publique seus próprios livros, sem limites.</p>
      </header>

      {isPremiumActive && (
        <p className="mb-6 flex items-center justify-center gap-2 rounded-md border border-moss-700/40 bg-moss-950/20 p-3 text-center text-sm text-moss-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Você já é premium até {new Date(currentUser.premiumUntil!).toLocaleDateString("pt-BR")}. Renovar antes de vencer soma
          mais tempo.
        </p>
      )}

      {error && <p className="mb-6 text-center text-sm text-red-300">{error}</p>}

      <div className="grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div key={plan.id} className="parchment-card p-6 text-center">
            <h2 className="font-display text-lg text-parchment-50">{plan.label}</h2>
            <p className="mt-2 font-display text-3xl text-ember-400">{plan.price}</p>
            <p className="mt-1 text-sm text-parchment-300/70">por {plan.period}</p>
            <button
              type="button"
              className="btn-primary mt-6 w-full"
              disabled={loadingPlan !== null}
              onClick={() => handleSubscribe(plan.id)}
            >
              {loadingPlan === plan.id ? "Redirecionando..." : "Assinar"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-parchment-400/60">
        Pagamento processado pelo Mercado Pago. Seu cartão nunca passa pelo nosso site.
      </p>
    </div>
  );
}
