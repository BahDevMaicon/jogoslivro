import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
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
  Wrench,
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
const dropdownItemClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-parchment-300 transition hover:bg-nightwood-800 hover:text-ember-400";

/** Botão que abre um painel flutuante com uma lista de links — usado para agrupar itens de nav relacionados no desktop. */
function NavDropdown({
  label,
  icon: Icon,
  align = "left",
  children,
}: {
  label: string;
  icon: LucideIcon;
  align?: "left" | "right";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" className={linkClass} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          className={`absolute top-full z-20 mt-2 min-w-[190px] rounded-md border border-parchment-700/40 bg-nightwood-900/95 p-1.5 shadow-parchment backdrop-blur ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Barra de navegação do site (fora do fluxo de leitura): itens agrupados por papel do usuário, com dropdowns no desktop e lista no mobile/tablet. */
export function SiteNav() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const isPremiumActive = Boolean(currentUser?.premiumUntil && new Date(currentUser.premiumUntil) > new Date());
  const premiumLabel = isPremiumActive
    ? `Premium até ${new Date(currentUser?.premiumUntil ?? "").toLocaleDateString("pt-BR")}`
    : "Seja Premium";
  const canCreate = currentUser?.role === "premium" || currentUser?.role === "admin";
  const isAdmin = currentUser?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryItems: NavItem[] = [
    { to: "/biblioteca", label: "Biblioteca", icon: BookOpen },
    { to: "/sobre", label: "Sobre", icon: Info },
    { to: "/como-criar", label: "Como criar", icon: PenSquare },
  ];

  const toolItems: NavItem[] = [
    ...(canCreate ? [{ to: "/meus-livros", label: "Meus livros", icon: PenSquare }] : []),
    ...(canCreate ? [{ to: "/create-book", label: "Criar livro", icon: Plus }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Administração", icon: Shield }] : []),
  ];

  const accountItems: NavItem[] = [
    { to: "/perfil", label: "Perfil", icon: User },
    { to: "/minha-biblioteca", label: "Minha biblioteca", icon: LibraryBig },
    { to: "/suporte", label: "Suporte", icon: LifeBuoy },
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

          <div className="hidden flex-1 items-center gap-5 px-6 lg:flex">
            {primaryItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={linkClass}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
              </Link>
            ))}
            {toolItems.length > 0 && (
              <NavDropdown label="Ferramentas" icon={Wrench}>
                {toolItems.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={dropdownItemClass}>
                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                  </Link>
                ))}
              </NavDropdown>
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {currentUser && !isAdmin && (
              <Link
                to="/premium"
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  isPremiumActive
                    ? "border-ember-600/40 text-ember-300 hover:border-ember-500/60"
                    : "border-ember-600/40 bg-ember-600/10 text-ember-300 hover:bg-ember-600/20"
                }`}
              >
                <Crown className="h-3.5 w-3.5" aria-hidden="true" /> {premiumLabel}
              </Link>
            )}

            {currentUser ? (
              <NavDropdown
                label={currentUser.displayName || currentUser.email}
                icon={User}
                align="right"
              >
                {accountItems.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={dropdownItemClass}>
                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                  </Link>
                ))}
                <div className="my-1 border-t border-parchment-700/30" />
                <button type="button" className={`${dropdownItemClass} w-full text-left`} onClick={() => logout()}>
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sair
                </button>
              </NavDropdown>
            ) : (
              <>
                <button type="button" className={linkClass} onClick={() => navigate("/login")}>
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" /> Entrar
                </button>
                <button type="button" className="btn-secondary text-xs" onClick={() => navigate("/login?mode=register")}>
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
            {primaryItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={mobileLinkClass} onClick={closeMenu}>
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </Link>
            ))}

            {currentUser && !isAdmin && (
              <Link to="/premium" className={mobileLinkClass} onClick={closeMenu}>
                <Crown className="h-4 w-4" aria-hidden="true" /> {premiumLabel}
              </Link>
            )}

            {toolItems.length > 0 && (
              <>
                <div className="my-1 border-t border-parchment-700/30" />
                {toolItems.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={mobileLinkClass} onClick={closeMenu}>
                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                  </Link>
                ))}
              </>
            )}

            <div className="my-1 border-t border-parchment-700/30" />

            {currentUser ? (
              <>
                {accountItems.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={mobileLinkClass} onClick={closeMenu}>
                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                  </Link>
                ))}
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
