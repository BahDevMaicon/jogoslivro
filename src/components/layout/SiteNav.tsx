import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Crown, Info, LibraryBig, LifeBuoy, LogIn, LogOut, PenSquare, Shield, User, UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { BrandMark } from "./BrandMark";
import { PremiumBanner } from "./PremiumBanner";

/** Barra fina de navegação do site (fora do fluxo de leitura): itens variam por papel do usuário logado. */
export function SiteNav() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const isPremiumActive = Boolean(currentUser?.premiumUntil && new Date(currentUser.premiumUntil) > new Date());

  return (
    <>
      <PremiumBanner />
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 font-display text-parchment-200 hover:text-ember-400">
            <BrandMark className="h-7 w-7" /> LivroQuest
          </Link>
          <Link to="/biblioteca" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Biblioteca
          </Link>
          <Link to="/sobre" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
            <Info className="h-3.5 w-3.5" aria-hidden="true" /> Sobre
          </Link>

          {currentUser && (
            <>
              <Link to="/minha-biblioteca" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
                <LibraryBig className="h-3.5 w-3.5" aria-hidden="true" /> Minha biblioteca
              </Link>
              <Link to="/suporte" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
                <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" /> Suporte
              </Link>
              {currentUser.role !== "admin" && (
                <Link to="/premium" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                  {isPremiumActive
                    ? `Premium até ${new Date(currentUser.premiumUntil!).toLocaleDateString("pt-BR")}`
                    : "Seja Premium"}
                </Link>
              )}
            </>
          )}

          {(currentUser?.role === "premium" || currentUser?.role === "admin") && (
            <>
              <Link to="/meus-livros" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
                <PenSquare className="h-3.5 w-3.5" aria-hidden="true" /> Meus livros
              </Link>
              <Link to="/create-book" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
                Criar livro
              </Link>
            </>
          )}

          {currentUser?.role === "admin" && (
            <Link to="/admin" className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Administração
            </Link>
          )}
        </div>

        {currentUser ? (
          <div className="flex items-center gap-3 text-parchment-300">
            <Link to="/perfil" className="flex items-center gap-1.5 text-xs text-parchment-300 hover:text-ember-400">
              <User className="h-3.5 w-3.5" aria-hidden="true" /> {currentUser.displayName || currentUser.email}
            </Link>
            <button
              type="button"
              className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400"
              onClick={() => logout()}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sair
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400"
              onClick={() => navigate("/login")}
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" /> Entrar
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-parchment-400 hover:text-ember-400"
              onClick={() => navigate("/login?mode=register")}
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Criar conta
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
