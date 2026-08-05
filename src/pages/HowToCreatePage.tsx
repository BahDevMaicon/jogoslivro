import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Check, Copy, FolderUp, PenSquare, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useAuthStore } from "@/stores/authStore";
import { STORY_PROMPT_GUIDE } from "@/lib/storyPromptGuide";

export default function HowToCreatePage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function handleCopyGuide() {
    try {
      await navigator.clipboard.writeText(STORY_PROMPT_GUIDE);
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  const canUseEditor = currentUser?.role === "premium" || currentUser?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SiteNav />

      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-ember-400">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="font-display text-xs uppercase tracking-[0.3em]">Como criar seu livro</span>
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl text-parchment-50 sm:text-4xl">Duas formas de criar sua aventura</h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-parchment-200/80">
          Sem escrever código: use uma IA para gerar a aventura inteira, ou monte tudo por formulário no editor
          visual. As duas formas produzem exatamente o mesmo formato — dá para misturar.
        </p>
      </header>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <div className="parchment-card p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-parchment-50">
            <Bot className="h-5 w-5 text-ember-400" aria-hidden="true" /> Guia para IA
          </h2>
          <p className="font-serif text-parchment-200/85">
            Copie o guia abaixo, cole numa IA de sua confiança (ChatGPT, Claude, etc.), descreva a aventura que você
            imagina, e peça um <code>story.json</code> completo seguindo o guia.
          </p>
        </div>
        <div className="parchment-card p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-parchment-50">
            <PenSquare className="h-5 w-5 text-ember-400" aria-hidden="true" /> Editor visual
          </h2>
          <p className="font-serif text-parchment-200/85">
            Monte a aventura por formulário dentro do próprio app — seções, escolhas, condições, itens e inimigos —
            sem tocar em código nenhum.
          </p>
        </div>
      </div>

      <div className="parchment-card mb-8 p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg text-parchment-50">O guia completo</h2>
          <div className="flex items-center gap-2">
            {copyError && <span className="text-xs text-red-300">Não foi possível copiar. Selecione o texto manualmente.</span>}
            <button type="button" className="btn-secondary text-sm" onClick={handleCopyGuide}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copiado!" : "Copiar guia"}
            </button>
          </div>
        </div>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-4 font-mono text-xs leading-relaxed text-parchment-200/85">
          {STORY_PROMPT_GUIDE}
        </pre>
      </div>

      <div className="parchment-card mb-8 p-6 sm:p-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-parchment-50">
          <FolderUp className="h-5 w-5 text-ember-400" aria-hidden="true" /> Depois de gerar o story.json
        </h2>
        <p className="font-serif text-parchment-200/85">
          Coloque o <code>story.json</code> e as imagens que ele referencia juntos numa única pasta. Na Biblioteca, use
          o botão "Adicionar livro (pasta)" para importar — disponível para contas Premium e administradores.
        </p>
      </div>

      <div className="parchment-card p-6 text-center sm:p-8">
        {!currentUser && (
          <>
            <p className="mb-4 font-serif text-parchment-200/85">Entre na sua conta para começar a criar.</p>
            <button className="btn-primary mx-auto" onClick={() => navigate("/login?redirect=/create-book")}>
              Entrar para criar
            </button>
          </>
        )}
        {currentUser && !canUseEditor && (
          <>
            <p className="mb-4 font-serif text-parchment-200/85">
              Criar e publicar livros é um recurso Premium.
            </p>
            <button className="btn-primary mx-auto" onClick={() => navigate("/premium")}>
              Torne-se Premium para criar
            </button>
          </>
        )}
        {canUseEditor && (
          <button className="btn-primary mx-auto" onClick={() => navigate("/create-book")}>
            <PenSquare className="h-4 w-4" aria-hidden="true" /> Abrir editor visual
          </button>
        )}
      </div>
    </div>
  );
}
