import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Compass,
  Dices,
  Library,
  Package,
  Save,
  Swords,
  Trophy,
  User,
} from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { HeroBannerCarousel } from "@/components/layout/HeroBannerCarousel";
import { useAuthStore } from "@/stores/authStore";
import { PREMIUM_FEATURES } from "@/lib/premiumFeatures";

const PLATFORM_FEATURES: { icon: typeof BookOpen; label: string; comingSoon?: boolean }[] = [
  { icon: BookOpen, label: "Leitura digital" },
  { icon: Save, label: "Progresso automático" },
  { icon: User, label: "Ficha de personagem" },
  { icon: Package, label: "Inventário" },
  { icon: Swords, label: "Combate automatizado" },
  { icon: Library, label: "Biblioteca pessoal" },
  { icon: Trophy, label: "Conquistas", comingSoon: true },
  { icon: BarChart3, label: "Estatísticas", comingSoon: true },
];

const BASIC_FEATURES = [
  "Ler livros gratuitos",
  "Biblioteca pessoal",
  "Salvar progresso",
  "Avaliar livros",
  "Favoritar livros",
];

export default function HomePage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SiteNav />

      {/* Seção 1 — Hero. Carrossel com as artes de marketing de verdade (cada uma já
          traz título/tagline/CTA desenhados na própria imagem) — sem overlay de texto por cima. */}
      <section className="mb-16 text-center">
        <HeroBannerCarousel />
        <button type="button" className="btn-primary mx-auto mt-6" onClick={() => navigate("/biblioteca")}>
          <Compass className="h-4 w-4" aria-hidden="true" /> Explorar Biblioteca
        </button>
      </section>

      {/* Seção 2 — O que são Livros-Jogo */}
      <section className="parchment-card mb-16 p-6 sm:p-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-parchment-50">
          <Dices className="h-5 w-5 text-ember-400" aria-hidden="true" /> O que são livros-jogo
        </h2>
        <p className="mb-4 font-serif text-parchment-200/85">
          Livros-jogo (gamebooks) são histórias interativas: em vez de virar a página em ordem, você escolhe o que
          fazer a seguir — e cada decisão muda completamente o rumo da narrativa. Aqui isso ganha vida no navegador,
          com testes de Habilidade, Energia e Sorte, combate por dados, exploração e evolução de personagem ao longo
          da jornada, levando a múltiplos finais possíveis.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-parchment-300/70">
          <span className="rounded-full border border-parchment-700/40 px-3 py-1">Decisões que mudam a história</span>
          <span className="rounded-full border border-parchment-700/40 px-3 py-1">Combate por dados</span>
          <span className="rounded-full border border-parchment-700/40 px-3 py-1">Exploração</span>
          <span className="rounded-full border border-parchment-700/40 px-3 py-1">Evolução de personagem</span>
          <span className="rounded-full border border-parchment-700/40 px-3 py-1">Múltiplos finais</span>
        </div>
      </section>

      {/* Seção 3 — Nossa Plataforma */}
      <section className="mb-16">
        <h2 className="mb-6 text-center font-display text-2xl text-parchment-50">Nossa plataforma</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PLATFORM_FEATURES.map(({ icon: Icon, label, comingSoon }) => (
            <div
              key={label}
              className="parchment-card flex flex-col items-center gap-2 p-4 text-center"
            >
              <Icon className="h-6 w-6 text-ember-400" aria-hidden="true" />
              <p className="font-display text-sm text-parchment-100">{label}</p>
              {comingSoon && <span className="text-[10px] uppercase tracking-wide text-parchment-400/70">Em breve</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Seção 4 — Botões principais */}
      <section className="mb-16 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button type="button" className="btn-primary" onClick={() => navigate("/biblioteca")}>
          <Library className="h-4 w-4" aria-hidden="true" /> Explorar Biblioteca Pública
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/book/fortaleza-das-sombras")}
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" /> Ler Aventura de Demonstração
        </button>
      </section>

      {/* Seção 5 — Comparativo de planos */}
      <section className="mb-16">
        <h2 className="mb-6 text-center font-display text-2xl text-parchment-50">Escolha seu plano</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="parchment-card p-6">
            <h3 className="mb-4 font-display text-lg text-parchment-50">Usuário Básico</h3>
            <ul className="flex flex-col gap-2 font-serif text-sm text-parchment-200/85">
              {BASIC_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-moss-400" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-md border-2 border-ember-500/60 bg-gradient-to-b from-ember-600/10 to-nightwood-900 p-6 shadow-parchment">
            <span className="absolute -top-3 left-6 rounded-full bg-ember-600 px-3 py-0.5 font-display text-xs uppercase tracking-wide text-nightwood-950">
              Premium
            </span>
            <h3 className="mb-4 mt-2 font-display text-lg text-parchment-50">Usuário Premium</h3>
            <ul className="flex flex-col gap-2 font-serif text-sm text-parchment-200/85">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-2">
                  <f.icon className="h-4 w-4 shrink-0 text-ember-400" aria-hidden="true" /> {f.label}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={() => navigate(currentUser ? "/premium" : "/login?redirect=/premium")}
            >
              {currentUser ? "Assinar premium" : "Criar conta premium"}
            </button>
          </div>
        </div>
      </section>

      {/* Seção 6 — CTA final */}
      <section className="parchment-card mb-4 p-8 text-center">
        <h2 className="mb-2 font-display text-2xl text-parchment-50">Sua próxima aventura começa aqui.</h2>
        <p className="mx-auto mb-6 max-w-lg font-serif text-parchment-200/85">
          Crie seu personagem. Explore mundos. Descubra segredos. Escreva suas próprias histórias.
        </p>
        <button
          type="button"
          className="btn-primary mx-auto"
          onClick={() => navigate(currentUser ? "/biblioteca" : "/login?mode=register")}
        >
          Começar Agora <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="mt-4 text-xs text-parchment-400/70">
          Quer saber mais primeiro?{" "}
          <Link to="/sobre" className="text-ember-400 underline">
            Sobre o projeto
          </Link>
        </p>
      </section>
    </div>
  );
}
