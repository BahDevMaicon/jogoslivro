import { Link, useLocation } from "react-router-dom";
import { Crown } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

/** Convite pra virar Premium — só pra quem está logado, é `normal` (nem premium nem admin) e não já está na própria página de planos. */
export function PremiumBanner() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const location = useLocation();

  if (currentUser?.role !== "normal" || location.pathname === "/premium") return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-ember-600/40 bg-ember-600/10 px-4 py-3">
      <p className="flex items-center gap-2 text-sm text-parchment-100">
        <Crown className="h-4 w-4 shrink-0 text-ember-400" aria-hidden="true" />
        Torne-se Premium e crie e publique seus próprios livros-jogo.
      </p>
      <Link to="/premium" className="btn-secondary shrink-0 text-xs">
        Ver planos
      </Link>
    </div>
  );
}
