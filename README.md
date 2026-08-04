# Livros-Jogo — Engine de Gamebooks

Uma engine genérica, em **React + TypeScript**, para executar livros-jogos (gamebooks) interativos a partir de arquivos **JSON**. Não contém nenhum texto, imagem ou marca de terceiros — apenas uma história original de demonstração, **"A Fortaleza das Sombras"**, incluída para validar todas as funcionalidades.

## Objetivo do projeto

Criar uma aplicação web responsiva, instalável como PWA, capaz de carregar e executar diferentes livros-jogo definidos em JSON, com:

- leitura interativa com escolhas condicionais;
- ficha de personagem e inventário;
- testes de Sorte e de Habilidade;
- combate por rodadas;
- histórico de eventos;
- salvamento automático (com exportação/importação);
- configurações de leitura e jogabilidade.

A história não fica fixa no código: a engine é genérica e lê o formato descrito em [Formato das histórias](#formato-das-histórias).

## Tecnologias

- **React 18** + **TypeScript** (modo `strict`)
- **Vite** como bundler/dev server
- **React Router** para navegação entre telas
- **Zustand** para estado global (biblioteca, sessão de jogo, configurações)
- **Zod** para validação dos arquivos JSON das histórias
- **Framer Motion** para animações discretas
- **Lucide React** para ícones
- **Tailwind CSS** para estilização
- **vite-plugin-pwa** para instalação como PWA
- **Vitest** + **Testing Library** para testes unitários
- **localStorage** para salvamento (com versionamento do formato)

## Instalação

```bash
npm install
```

> Este ambiente de geração não teve acesso à rede, então as dependências **não puderam ser instaladas nem o projeto pôde ser compilado/testado aqui**. Rode os comandos abaixo localmente para validar tudo — veja [Limitações atuais](#limitações-atuais).

## Execução

```bash
npm run dev
```

Abre o servidor de desenvolvimento (padrão: http://localhost:5173).

## Build de produção

```bash
npm run build
npm run preview
```

## Testes

```bash
npm run test        # roda uma vez
npm run test:watch  # modo watch
```

## Lint e checagem de tipos

```bash
npm run lint
npm run typecheck
```

## Estrutura de pastas

```
src/
├── app/                    # (reservado para composição futura de providers)
├── components/
│   ├── book/                # (reservado para cartões/listas de livros reutilizáveis)
│   ├── character/            # Ficha e resumo do personagem
│   ├── combat/                # Painel de combate
│   ├── dice/                   # Dados visuais, rolador livre e painel de teste
│   ├── inventory/              # Painel de inventário
│   ├── history/                # Painel de histórico
│   ├── settings/                # Painel de configurações
│   └── layout/                  # Modal, ErrorBoundary
├── engine/                  # Lógica pura, sem React (a "engine" propriamente dita)
│   ├── actionEngine.ts        # Executa ações (addItem, modifyStat, setFlag...)
│   ├── bookLoader.ts           # Carrega e valida um livro-jogo a partir de uma URL
│   ├── combatEngine.ts          # Cálculo de rodadas de combate
│   ├── conditionEngine.ts        # Avaliação de condições de escolhas
│   ├── diceEngine.ts              # Rolagem de dados (crypto.getRandomValues)
│   ├── saveEngine.ts               # Persistência em localStorage + export/import
│   ├── storyEngine.ts               # Orquestração: navegação, onEnter, escolhas
│   └── testEngine.ts                 # Testes de Sorte / Habilidade
├── pages/                   # Telas roteadas (Biblioteca, Detalhes, Criação, Leitura)
├── schemas/                 # Schemas Zod (validação dos arquivos JSON de histórias)
├── stores/                  # Zustand: libraryStore, gameSessionStore, settingsStore...
├── stories/                 # Registro estático de livros + história de demonstração (dados ficam em /public/stories)
├── types/                    # Tipos TypeScript centrais (story.ts, game.ts)
├── utils/                    # Utilitários (log, ids)
└── tests/                    # Testes unitários (Vitest)

public/
└── stories/
    └── fortaleza-das-sombras/
        └── story.json        # História de demonstração completa
```

### Sobre a organização das stores

O pedido original sugeria stores/slices separadas para personagem, inventário e combate. Como esses três domínios são sempre lidos e gravados **atomicamente** junto com a seção atual e as flags (fazem parte do mesmo save), a fonte única de verdade é a `gameSessionStore`. Os arquivos `characterStore.ts`, `inventoryStore.ts` e `combatStore.ts` existem como **hooks seletores finos** sobre essa store — isso evita dessincronização entre partes do estado que mudam sempre juntas, mantendo ao mesmo tempo os componentes desacoplados uns dos outros. `libraryStore` e `settingsStore` são, de fato, stores independentes, pois têm ciclos de vida próprios.

## Formato das histórias

Um livro-jogo é um arquivo JSON validado pelo schema em `src/schemas/story.schema.ts` (usando Zod) e tipado em `src/types/story.ts`. Estrutura mínima:

```json
{
  "id": "meu-livro",
  "version": "1.0.0",
  "title": "Título do Livro",
  "author": "Autor",
  "description": "Descrição da aventura.",
  "genre": "Fantasia",
  "estimatedDuration": "20-30 minutos",
  "startSection": "1",
  "characterCreation": {
    "skill": { "dice": 1, "sides": 6, "modifier": 6 },
    "stamina": { "dice": 2, "sides": 6, "modifier": 12 },
    "luck": { "dice": 1, "sides": 6, "modifier": 6 },
    "gold": 5,
    "provisions": 10
  },
  "items": [],
  "enemies": [],
  "sections": {
    "1": {
      "id": "1",
      "title": "Título da seção",
      "paragraphs": ["Parágrafo 1.", "Parágrafo 2."],
      "choices": [
        { "id": "escolha-1", "text": "Fazer algo", "target": "2" }
      ]
    }
  }
}
```

A engine valida automaticamente (além dos tipos) que `startSection` existe, que toda escolha aponta para uma seção existente, e que condições/ações referenciam itens e inimigos que de fato existem no livro. Erros de validação impedem o carregamento do livro e são exibidos na Biblioteca.

### Como adicionar um novo livro

1. Crie a pasta `public/stories/<seu-id>/` e coloque nela um `story.json` seguindo o formato acima (pode incluir imagens em `.webp`/`.png` na mesma pasta e referenciá-las nos campos `cover`/`image`).
2. Registre o livro em `src/stories/registry.ts`:
   ```ts
   export const BOOK_REGISTRY: BookRegistryEntry[] = [
     { id: "fortaleza-das-sombras", url: "/stories/fortaleza-das-sombras/story.json" },
     { id: "seu-id", url: "/stories/seu-id/story.json" },
   ];
   ```
3. Pronto — o livro aparecerá automaticamente na Biblioteca.

### Como criar seções

Cada seção (`StorySection`) tem:

- `id`: identificador único (string);
- `title` (opcional): exibido no topo da leitura;
- `paragraphs`: lista de parágrafos de texto;
- `image` (opcional): caminho para uma imagem local;
- `onEnter` (opcional): lista de **ações** executadas automaticamente ao entrar na seção (útil para armadilhas, testes automáticos, início de combate, ganho de itens, finais);
- `choices`: lista de escolhas, cada uma com `id`, `text`, `target` (seção de destino), `conditions` (opcional) e `actions` (opcional).

### Como adicionar condições

Condições controlam se uma escolha está disponível. Tipos suportados (`src/types/story.ts` → `Condition`):

| Tipo | Campos | Descrição |
|---|---|---|
| `hasItem` / `notHasItem` | `itemId` | Possui/não possui um item |
| `statGreater` / `statLess` / `statEqual` | `stat`, `value` | Compara um atributo (`skill`, `stamina`, `luck`) |
| `flagActive` / `flagInactive` | `flag` | Estado de uma flag booleana |
| `minGold` | `value` | Ouro mínimo |
| `enemyDefeated` | `enemyId` | Inimigo específico já derrotado |
| `sectionVisited` | `sectionId` | Seção específica já visitada |
| `choiceMade` | `choiceId` | Escolha específica já feita |

Todas aceitam `"negate": true` para inverter o resultado. Uma escolha com condições não satisfeitas aparece bloqueada, exibindo `lockedReason` (se definido).

### Como adicionar ações

Ações (`Action`) alteram o estado do jogo e podem ser usadas em `onEnter` de uma seção ou em `actions` de uma escolha:

| Tipo | Campos | Descrição |
|---|---|---|
| `addItem` / `removeItem` | `itemId` | Adiciona/remove um item do inventário |
| `modifyStat` | `stat`, `value` | Soma/subtrai de um atributo (respeitando 0 e o máximo) |
| `restoreStat` | `stat`, `value?` | Restaura um atributo (ao máximo, se `value` omitido) |
| `addGold` / `removeGold` | `value` | Ajusta o ouro |
| `addProvisions` / `removeProvisions` | `value` | Ajusta as provisões |
| `setFlag` / `clearFlag` | `flag` | Ativa/desativa uma flag |
| `logEvent` | `message` | Registra um evento customizado no histórico |
| `startCombat` | `enemyIds`, `onVictory`, `onDefeat`, `onFlee?` | Inicia um combate |
| `startTest` | `testType`, `stat?`, `fixedValue?`, `onSuccess`, `onFailure` | Inicia um teste (Sorte/Habilidade/atributo/valor fixo) |
| `goToSection` | `sectionId` | Redireciona imediatamente para outra seção |
| `endStory` | `ending`, `title`, `text` | Finaliza a história (`victory`, `defeat` ou `neutral`) |

### Como criar inimigos

Um inimigo (`StoryEnemy`) é definido no array `enemies` do livro:

```json
{ "id": "goblin", "name": "Goblin", "skill": 5, "stamina": 6, "defeatText": "O goblin foge gritando." }
```

Para colocá-lo em combate, use a ação `startCombat` com `enemyIds: ["goblin"]` (suporta múltiplos inimigos simultâneos). As regras de combate seguem o padrão clássico: cada lado rola 2 dados + Habilidade; quem tiver o maior total causa 2 pontos de dano em Energia; empates não causam dano; o combate termina quando um dos lados chega a zero.

### Como exportar e importar saves

Na tela de leitura, abra **Configurações → Salvamento**:

- **Exportar save (JSON)** baixa um arquivo com o estado completo da partida (personagem, inventário, flags, histórico, seção atual etc.), incluindo um número de versão do formato (`formatVersion`) para permitir migrações futuras.
- **Importar save (JSON)** lê um arquivo exportado anteriormente e restaura a partida.
- **Excluir save** apaga a partida salva localmente (`localStorage`).

## Funcionalidades concluídas

- Biblioteca com carregamento/validação de múltiplos livros-jogo via JSON.
- Tela de detalhes do livro (regras, atributos, autor, descrição).
- Criação de personagem com rolagem configurável pelo próprio JSON da história, com opção de rolar novamente.
- Tela de leitura com parágrafos, escolhas condicionais (bloqueadas com motivo quando aplicável), resumo do personagem e indicação de salvamento automático.
- Ficha completa do personagem, inventário (usar/equipar/desequipar/descartar), histórico de eventos e configurações — todos como modais acessíveis a partir da leitura.
- Sistema de dados com animação (Framer Motion) e resultado visual.
- Teste de Sorte e teste de Habilidade/atributo/valor fixo configuráveis pela história.
- Combate por rodadas com múltiplos inimigos, item equipável (bônus de dano), uso de provisão, fuga condicional e finais diferentes por vitória/derrota/fuga.
- Salvamento automático em `localStorage`, com versionamento (`formatVersion`), export/import e exclusão de save.
- Engine 100% desacoplada dos componentes React (`src/engine/*`), com funções puras e testáveis.
- Testes unitários cobrindo dados, condições, ações, testes de atributo, combate, validação de histórias e o motor de save/load.
- PWA configurada via `vite-plugin-pwa` (manifest + service worker).
- Acessibilidade básica: `aria-label`s, foco visível, `role="dialog"`/`aria-modal`, contraste pensado para tema escuro.
- História original de demonstração "A Fortaleza das Sombras" (21 seções), com 3+ caminhos, uma chave, uma arma, uma poção, um teste de sorte, um teste de habilidade, três inimigos, uma armadilha, uma escolha dependente de item, uma escolha dependente de flag, uma possibilidade de fuga e três finais (vitória, derrota e um final neutro de retirada).

## Limitações atuais

- **Este ambiente de geração não tinha acesso à rede.** Não foi possível rodar `npm install`, `npm run build`, `npm run test` ou `npm run lint` aqui — o código foi escrito e revisado manualmente com cuidado, mas **é necessário rodar esses comandos localmente** para pegar eventuais erros de tipagem/lint que só um compilador real detectaria.
- Os ícones do PWA (`public/pwa-192x192.png`, `public/pwa-512x512.png`) são placeholders sólidos (cor de fundo do tema); substitua por artes reais antes de publicar.
- O resultado de uma rodada de combate já navega automaticamente para a próxima seção assim que o combate termina (vitória/derrota/fuga), sem uma etapa extra de "confirmar" como a que existe para os testes de Sorte/Habilidade — ou seja, a mensagem final da rodada aparece por um instante antes da transição.
- O modo de rolagem "automática" e a confirmação antes de reiniciar (nas Configurações) estão salvos e disponíveis, mas ainda não estão conectados a toda a lógica de UI (ex.: a Biblioteca sempre confirma antes de reiniciar, independentemente da preferência).
- Efeitos sonoros: a opção existe nas configurações, mas nenhum som foi implementado (não havia assets de áudio livres de direitos disponíveis neste ambiente).
- Apenas uma história de demonstração está incluída; o sistema de biblioteca já suporta múltiplas, bastando registrá-las.
- Não há sincronização em nuvem — o salvamento é local ao dispositivo/navegador (por design, conforme solicitado).

## Sugestões para a próxima versão

- Adicionar uma etapa de confirmação visual também ao final de cada combate (como já existe para os testes), permitindo ao jogador ler o resultado antes de avançar.
- Substituir os ícones PWA placeholder por uma identidade visual definitiva.
- Implementar efeitos sonoros reais e conectar completamente o modo de rolagem automática.
- Adicionar suporte a múltiplos slots de save por livro (não apenas um save por `bookId`).
- Internacionalização (i18n) para permitir histórias em outros idiomas.
- Testes de integração de ponta a ponta (ex.: Playwright) cobrindo o fluxo completo Biblioteca → Criação → Leitura → Final.
- Editor visual de histórias (fora do escopo desta entrega) para reduzir a edição manual do JSON.
