import { BookOpen, Shield } from "lucide-react";
import type { GameBook } from "@/types/story";
import { isRuleEnabled } from "@/engine/storyEngine";

interface RuleBlock {
  title: string;
  text: string;
}

function defaultRuleBlocks(book: GameBook): RuleBlock[] {
  const blocks: RuleBlock[] = [
    {
      title: "Habilidade, Energia e Sorte",
      text: "Você é guiado por três atributos: Habilidade (sua perícia em combate e testes físicos), Energia (sua vitalidade — chega a 0 e a aventura termina) e Sorte (sua fortuna, usada em Testes de Sorte).",
    },
    {
      title: "Ouro e Provisões",
      text: "Ouro compra e troca itens ao longo da aventura. Provisões são consumidas para descansar ou comer — fique de olho na quantidade.",
    },
    {
      title: "Inventário",
      text: "Itens encontrados ficam guardados no seu inventário. Armas e armaduras podem ser equipadas para dar bônus em combate; alguns itens têm texto e imagem extras, visíveis ao \"Olhar\" o item.",
    },
    {
      title: "Combate",
      text: "Você e o inimigo rolam dois dados e somam a própria Habilidade; quem tiver o maior total causa dano em Energia ao oponente (empates não causam dano). Armas equipadas aumentam o dano causado; armaduras reduzem o dano recebido. O combate termina quando um dos lados chega a 0 de Energia.",
    },
    {
      title: "Testes de Sorte",
      text: "Role dois dados e compare a soma com sua Sorte atual: sucesso se a soma for menor ou igual. Sua Sorte sempre cai 1 ponto após o teste, mesmo em caso de sucesso.",
    },
  ];

  if (isRuleEnabled(book, "restSystem")) {
    blocks.push({
      title: "Descanso",
      text: "Em locais seguros específicos da aventura, você pode descansar: consome 1 Provisão, restaura 4 pontos de Energia (nunca acima do seu máximo) e zera sua Fadiga. Sem Provisões, não é possível descansar.",
    });
  }

  blocks.push({
    title: "Alimentação",
    text: "Em certos pontos da aventura, você pode comer: consome 1 Provisão e zera sua Fadiga.",
  });

  if (isRuleEnabled(book, "fatigueSystem")) {
    blocks.push({
      title: "Fadiga",
      text: "Um contador visível na sua Ficha, ao lado dos outros atributos. Ele sobe 1 ponto a cada trecho da aventura em que você avança sem comer ou descansar, e volta a 0 sempre que você faz uma dessas duas coisas. Se a fadiga acumular demais, o cansaço cobra seu preço automaticamente, reduzindo sua Energia — fique atento e aproveite as oportunidades de descanso e alimentação.",
    });
  }

  if (isRuleEnabled(book, "combatLuck")) {
    blocks.push({
      title: "Sorte em combate",
      text: "Depois de vencer uma rodada de combate, você pode optar por Testar a Sorte: um Teste de Sorte reduz sua Sorte em 1 ponto; se for bem-sucedido, você causa +2 pontos de dano adicional nesta rodada. Se falhar, o ataque já resolvido causa apenas o dano normal.",
    });
  }

  blocks.push({
    title: "Magia",
    text: "Esta aventura não utiliza um sistema de magia nesta versão da engine.",
  });

  return blocks;
}

interface RulesScreenProps {
  book: GameBook;
  onContinue?: () => void;
}

/**
 * Tela de "Regras da Aventura": explica as mecânicas oficiais da engine
 * (condicionadas às flags de `book.rules`) mais o texto especial do livro
 * (`book.rulesText`). Mostrada obrigatoriamente uma vez no início da partida
 * (`onContinue` presente) e reaberta a qualquer momento pela aba "Regras" do
 * fichário (sem `onContinue`, modo só-leitura).
 */
export function RulesScreen({ book, onContinue }: RulesScreenProps) {
  const useDefault = isRuleEnabled(book, "useDefaultRules");
  const blocks = useDefault ? defaultRuleBlocks(book) : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-ember-400">
        <Shield className="h-5 w-5" aria-hidden="true" />
        <h2 className="font-display text-lg uppercase tracking-wide">Regras da Aventura</h2>
      </div>

      <div className="flex flex-col gap-4">
        {blocks.map((block) => (
          <div key={block.title}>
            <h3 className="mb-1 font-display text-sm uppercase tracking-wide text-parchment-200">{block.title}</h3>
            <p className="text-parchment-300/85">{block.text}</p>
          </div>
        ))}

        {book.rulesText && (
          <div>
            <h3 className="mb-1 flex items-center gap-1.5 font-display text-sm uppercase tracking-wide text-parchment-200">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Regras especiais do livro
            </h3>
            <p className="text-parchment-300/85">{book.rulesText}</p>
          </div>
        )}
      </div>

      {onContinue && (
        <button type="button" className="btn-primary self-center" onClick={onContinue}>
          Continuar para a aventura
        </button>
      )}
    </div>
  );
}
