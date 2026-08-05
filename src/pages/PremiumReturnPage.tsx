import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useAuthStore } from "@/stores/authStore";

type ReturnState = "approved" | "pending" | "failure";

const CONTENT: Record<ReturnState, { icon: JSX.Element; title: string; text: string }> = {
  approved: {
    icon: <CheckCircle2 className="h-10 w-10 text-moss-400" aria-hidden="true" />,
    title: "Pagamento aprovado!",
    text: "Sua conta já está premium.",
  },
  pending: {
    icon: <Clock className="h-10 w-10 text-amber-400" aria-hidden="true" />,
    title: "Pagamento em análise",
    text: "Assim que for confirmado, sua conta vira premium automaticamente.",
  },
  failure: {
    icon: <XCircle className="h-10 w-10 text-red-400" aria-hidden="true" />,
    title: "Pagamento não aprovado",
    text: "Não conseguimos confirmar o pagamento. Você pode tentar de novo.",
  },
};

/**
 * Página de retorno do Checkout Pro (Mercado Pago). Quem libera o premium de
 * verdade é o webhook (`mp-webhook`), assíncrono — aqui só chamamos
 * `refreshProfile()` de novo depois de um instante pra pegar essa atualização
 * assim que ela chegar, sem exigir reload manual do usuário.
 */
export default function PremiumReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [checking, setChecking] = useState(true);

  const rawStatus = searchParams.get("status") ?? searchParams.get("collection_status") ?? "pending";
  const state: ReturnState = rawStatus === "approved" ? "approved" : rawStatus === "failure" || rawStatus === "rejected" ? "failure" : "pending";

  useEffect(() => {
    void refreshProfile();
    const timer = setTimeout(() => {
      void refreshProfile().then(() => setChecking(false));
    }, 3000);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  const { icon, title, text } = CONTENT[state];

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <SiteNav />
      <div className="parchment-card p-8">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h1 className="font-display text-2xl text-parchment-50">{title}</h1>
        <p className="mt-2 font-serif text-parchment-200/85">{text}</p>
        {checking && <p className="mt-4 text-xs text-parchment-400/60">Confirmando com o servidor...</p>}
        <button type="button" className="btn-primary mt-6" onClick={() => navigate("/premium")}>
          Voltar
        </button>
      </div>
    </div>
  );
}
