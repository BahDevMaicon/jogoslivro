import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Crown,
  Info,
  LibraryBig,
  LifeBuoy,
  LogIn,
  LogOut,
  Menu,
  PenSquare,
  Plus,
  Shield,
  User,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { BrandMark } from "./BrandMark";
import { PremiumBanner } from "./PremiumBanner";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const linkClass = "flex items-center gap-1.5 text-parchment-400 transition hover:text-ember-400";
const mobileLinkClass =
  "flex items-center gap-2 rounded-md px-3 py-2.5 text-parchment-300 transition hover:bg-nightwood-800 hover:text-ember-400";

/** Barra de navegação do site (fora do fluxo de leitura): itens variam por papel do usuário logado; vira lista/hambúrguer em telas estreitas. */
export function SiteNav() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const isPremiumActive = Boolean(currentUser?.premiumUntil && new Date(currentUser.premiumUntil) > new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { to: "/biblioteca", label: "Biblioteca", icon: BookOpen },
    { to: "/sobre", label: "Sobre", icon: Info },
    { to: "/como-criar", label: "Como criar", icon: PenSquare },
    ...(currentUser
      ? [
          { to: "/minha-biblioteca", label: "Minha biblioteca", icon: LibraryBig },
          { to: "/suporte", label: "Suporte", icon: LifeBuoy },
        ]
      : []),
    ...(currentUser && currentUser.role !== "admin"
      ? [
          {
            to: "/premium",
            label: isPremiumActive ? `Premium até ${new Date(currentUser.premiumUntil!).toLocaleDateString("pt-BR")}` : "Seja Premium",
            icon: Crown,
          },
        ]
      : []),
    ...(currentUser?.role === "premium" || currentUser?.role === "admin"
      ? [
          { to: "/meus-livros", label: "Meus livros", icon: PenSquare },
          { to: "/create-book", label: "Criar livro", icon: Plus },
        ]
      : []),
    ...(currentUser?.role === "admin" ? [{ to: "/admin", label: "Administração", icon: Shield }] : []),
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
  }

  return (
    <>
      <PremiumBanner />
      <nav className="mb-6 text-sm">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 font-display text-parchment-200 hover:text-ember-400"
            onClick={closeMenu}
          >
            <BrandMark className="h-7 w-7" /> LivroQuest
          </Link>

          <div className="hidden flex-1 items-center gap-4 px-6 lg:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={linkClass}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {currentUser ? (
              <>
                <Link to="/perfil" className="flex items-center gap-1.5 text-xs text-parchment-300 hover:text-ember-400">
                  <User className="h-3.5 w-3.5" aria-hidden="true" /> {currentUser.displayName || currentUser.email}
                </Link>
                <button type="button" className={linkClass} onClick={() => logout()}>
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sair
                </button>
              </>
            ) : (
              <>
                <button type="button" className={linkClass} onClick={() => navigate("/login")}>
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" /> Entrar
                </button>
                <button type="button" className={linkClass} onClick={() => navigate("/login?mode=register")}>
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Criar conta
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="flex shrink-0 items-center justify-center rounded-md border border-parchment-700/40 p-2 text-parchment-300 transition hover:border-ember-400/50 hover:text-ember-400 lg:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-3 flex flex-col gap-1 rounded-md border border-parchment-700/30 bg-nightwood-900/70 p-2 lg:hidden">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={mobileLinkClass} onClick={closeMenu}>
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </Link>
            ))}

            <div className="my-1 border-t border-parchment-700/30" />

            {currentUser ? (
              <>
                <Link to="/perfil" className={mobileLinkClass} onClick={closeMenu}>
                  <User className="h-4 w-4" aria-hidden="true" /> {currentUser.displayName || currentUser.email}
                </Link>
                <button type="button" className={`${mobileLinkClass} text-left`} onClick={handleLogout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sair
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`${mobileLinkClass} text-left`}
                  onClick={() => {
                    navigate("/login");
                    closeMenu();
                  }}
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" /> Entrar
                </button>
                <button
                  type="button"
                  className={`${mobileLinkClass} text-left`}
                  onClick={() => {
                    navigate("/login?mode=register");
                    closeMenu();
                  }}
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" /> Criar conta
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
