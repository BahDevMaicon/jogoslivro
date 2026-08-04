import { BookOpen, Dices, PenSquare, Shield, Sparkles, Swords } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SiteNav />

      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-ember-400">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="font-display text-xs uppercase tracking-[0.3em]">Sobre o projeto</span>
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl text-parchment-50 sm:text-4xl">
          Uma engine para livros-jogo que rodam no navegador
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-parchment-200/80">
          Livros-jogo (gamebooks) clássicos — daqueles em que você escolhe o parágrafo seguinte e rola dados para
          decidir o resto — reimaginados como uma experiência digital que ainda parece um livro de verdade.
        </p>
      </header>

      <div className="parchment-card mb-8 p-6 sm:p-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-parchment-50">
          <BookOpen className="h-5 w-5 text-ember-400" aria-hidden="true" /> O que é
        </h2>
        <p className="font-serif text-parchment-200/85">
          É um motor genérico: um único aplicativo capaz de rodar qualquer livro-jogo descrito num arquivo{" "}
          <code>story.json</code>. Nós escrevemos a engine; autores (humanos ou IA, com um guia próprio para isso)
          escrevem as aventuras. Nenhum código é necessário para criar uma história nova.
        </p>
      </div>

      <div className="parchment-card mb-8 p-6 sm:p-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-parchment-50">
          <Dices className="h-5 w-5 text-ember-400" aria-hidden="true" /> Como é ler
        </h2>
        <p className="mb-3 font-serif text-parchment-200/85">
          A leitura imita um livro físico — páginas viram, escolhas aparecem como texto em prosa, e as regras clássicas
          de gamebook estão todas lá: teste de Habilidade, Energia e Sorte, um sistema de combate com dados 3D,
          inventário com itens equipáveis, e um sistema de sobrevivência com fome, fadiga e descanso que dá peso real
          às decisões ao longo do caminho.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-parchment-300/70">
          <span className="flex items-center gap-1 rounded-full border border-parchment-700/40 px-3 py-1">
            <Swords className="h-3 w-3" aria-hidden="true" /> Combate com dados 3D
          </span>
          <span className="flex items-center gap-1 rounded-full border border-parchment-700/40 px-3 py-1">
            <Shield className="h-3 w-3" aria-hidden="true" /> Inventário e equipamento
          </span>
          <span className="flex items-center gap-1 rounded-full border border-parchment-700/40 px-3 py-1">
            Fadiga, descanso e provisões
          </span>
        </div>
      </div>

      <div className="parchment-card mb-8 p-6 sm:p-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-parchment-50">
          <PenSquare className="h-5 w-5 text-ember-400" aria-hidden="true" /> Como é criar
        </h2>
        <p className="font-serif text-parchment-200/85">
          Duas formas de escrever uma aventura nova: cole o nosso guia de regras numa IA de sua confiança e peça um{" "}
          <code>story.json</code> completo, ou use o editor visual dentro do próprio app — seções, escolhas,
          condições, itens e inimigos, tudo por formulário, sem tocar em código. As duas formas produzem exatamente o
          mesmo formato, então dá para misturar: começar com a IA e ajustar os detalhes no editor.
        </p>
      </div>

      <div className="parchment-card mb-10 p-6 sm:p-8">
        <h2 className="mb-3 font-display text-lg text-parchment-50">A visão</h2>
        <p className="font-serif text-parchment-200/85">
          Este site é um MVP: estamos validando se essa forma de ler e criar livros-jogo faz sentido para outras
          pessoas antes de investir em contas de verdade, uma biblioteca pública maior e ferramentas de criação ainda
          mais completas. Se algo te incomodar ou faltar, é exatamente esse o momento para dizer.
        </p>
      </div>

      <div className="parchment-card p-6 sm:p-8">
        <h2 className="mb-1 text-center font-display text-lg text-parchment-50">Quer saber das novidades?</h2>
        <p className="mb-4 text-center font-serif text-sm text-parchment-300/70">
          Deixe seu email e avisamos quando novidades saírem.
        </p>
        <NewsletterSignup />
      </div>
    </div>
  );
}
