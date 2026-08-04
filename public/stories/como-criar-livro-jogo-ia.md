# Como criar um Livro-Jogo para esta engine (guia para IA)

Você vai ajudar a criar um arquivo `story.json` para uma engine de livro-jogo (gamebook) interativo em React. Este documento descreve o formato **exato** esperado — siga-o rigorosamente. Ao final, gere **apenas o JSON válido**, sem comentários, sem blocos de markdown ao redor, sem texto explicativo antes ou depois.

## Visão geral

Um livro-jogo é um único objeto JSON com metadados, regras de criação de personagem, listas de itens/inimigos, e um mapa de seções (o "grafo" da história). O jogador começa em `startSection`, lê os parágrafos, e escolhe entre as `choices` disponíveis, cada uma levando a outra seção (`target`).

## Estrutura de nível superior

```json
{
  "id": "identificador-unico-kebab-case",
  "version": "1.0.0",
  "title": "Título do Livro",
  "author": "Nome do Autor",
  "description": "Um ou dois parágrafos descrevendo a aventura.",
  "genre": "Fantasia sombria",
  "estimatedDuration": "20-30 minutos",
  "cover": "/stories/seu-id/cover.png",
  "rules": "Explicação curta das regras (opcional, aparece na tela de detalhes).",
  "startSection": "1",
  "characterCreation": { "...": "ver seção characterCreation abaixo" },
  "items": [ "...": "ver seção items abaixo" ],
  "enemies": [ "...": "ver seção enemies abaixo" ],
  "sections": { "1": { "...": "ver seção sections abaixo" } }
}
```

Campos obrigatórios: `id`, `version`, `title`, `author`, `description`, `startSection`, `characterCreation`, `items` (pode ser `[]`), `enemies` (pode ser `[]`), `sections`.
Campos opcionais: `genre`, `estimatedDuration`, `cover`, `rules`.

- `id`: string única, use kebab-case (ex.: `"torre-do-feiticeiro"`).
- `sections` é um **objeto/dicionário**, não um array — as chaves são os mesmos valores usados no `id` de cada seção.

## characterCreation

Define como os atributos iniciais do personagem são rolados.

```json
"characterCreation": {
  "skill": { "dice": 1, "sides": 6, "modifier": 6 },
  "stamina": { "dice": 2, "sides": 6, "modifier": 12 },
  "luck": { "dice": 1, "sides": 6, "modifier": 6 },
  "gold": 5,
  "provisions": 10
}
```

Cada atributo (`skill`, `stamina`, `luck`) é uma fórmula de dados: valor final = soma de `dice` dados de `sides` lados + `modifier`. `gold` e `provisions` são números fixos iniciais (inteiros ≥ 0).

Convenção usual (não obrigatória): Habilidade ~1d6+6, Energia ~2d6+12, Sorte ~1d6+6.

## items[]

Cada item:

```json
{
  "id": "ancient-sword",
  "name": "Espada Antiga",
  "description": "Uma lâmina gasta pelo tempo, ainda afiada.",
  "kind": "weapon",
  "damageBonus": 1,
  "consumable": false,
  "discardable": true,
  "icon": "sword",
  "examineText": "Gravuras quase apagadas cobrem a lâmina — um nome que você não consegue ler.",
  "examineImage": "/stories/seu-id/espada-antiga.png"
}
```

- `kind`: `"weapon" | "armor" | "consumable" | "key" | "misc"`.
- `damageBonus` (armas): inteiro somado ao **dano causado** quando o item está equipado e o jogador vence a rodada de combate.
- `defenseBonus` (armaduras): inteiro subtraído do **dano recebido** quando o item está equipado e o inimigo vence a rodada (nunca deixa o dano negativo).
- `onUseEffects`: array de `{ "stat": "skill"|"stamina"|"luck"|"gold"|"provisions", "value": number }`, aplicado quando o item é usado (ex.: uma poção que restaura Energia).
- `consumable`: se `true`, o item é removido do inventário ao ser usado.
- `discardable`: se `false`, o jogador não pode descartar o item manualmente (útil para itens de enredo/chave).
- `icon` (opcional): chave de ícone mostrada no inventário. Valores reconhecidos: `"sword"`, `"shield"`, `"potion"`, `"food"`, `"book"`, `"key"`, `"gem"`, `"misc"`. Se omitido ou desconhecida, a UI escolhe um ícone padrão a partir de `kind`.
- `examineText` / `examineImage` (opcionais): conteúdo extra só visível quando o jogador clica em "Olhar" no item, dentro do inventário (o botão só aparece se pelo menos um dos dois estiver definido). `examineImage` usa o mesmo esquema de caminho de `cover`/`image` (arquivo em `public/stories/<seu-id>/...`).

## enemies[]

```json
{
  "id": "goblin",
  "name": "Goblin",
  "skill": 5,
  "stamina": 6,
  "defeatText": "O goblin foge gritando.",
  "points": 10,
  "lootItemId": "rusty-dagger",
  "lootChancePercent": 30
}
```

- `skill` e `stamina` são inteiros (`stamina` ≥ 1). `defeatText` (opcional) aparece quando o inimigo é derrotado. `description`/`image` são opcionais.
- `points` (opcional, inteiro ≥ 0): pontos somados à pontuação do jogador (visível na Ficha) ao derrotar este inimigo. A engine soma isso automaticamente — não precisa de nenhuma `action` extra.
- `lootItemId` (opcional): `id` de um item de `items` que este inimigo pode deixar cair ao ser derrotado. Durante o combate, a UI mostra uma dica discreta sob o inimigo vivo com o nome do item e a chance.
- `lootChancePercent` (opcional, 0–100): chance de o item de `lootItemId` ser realmente concedido ao derrotar o inimigo (sorteada automaticamente pela engine). Sem `lootItemId`, este campo não tem efeito.

## sections{}

Cada seção (a chave do objeto deve ser igual ao `id` interno):

```json
"1": {
  "id": "1",
  "title": "Os portões da fortaleza",
  "paragraphs": [
    "Primeiro parágrafo.",
    "Segundo parágrafo."
  ],
  "image": "/stories/seu-id/imagem-opcional.webp",
  "onEnter": [ "...ações executadas automaticamente ao entrar, opcional" ],
  "choices": [
    { "id": "entrar", "text": "Entrar pela porta principal", "target": "2" }
  ]
}
```

- `paragraphs`: array de strings, pelo menos 1.
- `title` e `image` são opcionais.
- `onEnter`: lista de Ações (ver abaixo) — útil para armadilhas automáticas, ganho de item ao entrar, início de combate/teste, ou finais.
- `choices`: lista de Escolhas — pode ser vazia **apenas** em seções finais que já terminam a história via `onEnter` com `endStory` (senão o jogador fica travado sem opções).

### Imagens de seção (`image`)

Uma seção pode incluir **uma** ilustração, exibida entre o título e o primeiro parágrafo, como uma prancha inserida na página:

- Caminho do arquivo: coloque a imagem em `public/stories/<seu-id>/nome-do-arquivo.png` (ou `.webp`/`.jpg`) e referencie com `"image": "/stories/<seu-id>/nome-do-arquivo.png"` (mesmo esquema de caminho absoluto usado em `cover`).
- A tela de leitura aplica um blend de multiplicação (`mix-blend-mode: multiply`) para a imagem se fundir com o papel do pergaminho — funciona melhor com **ilustrações em tinta/gravura de fundo claro** (preto e branco ou sépia, como xilogravuras ou desenhos a nanquim), evite fotos com fundos coloridos sólidos ou muito escuros, pois o blend pode escurecê-los demais.
- A imagem é opcional em toda seção; use com moderação, em momentos-chave da narrativa (chegada a um lugar importante, revelação de um inimigo, um item marcante), não em toda seção.
- Não é necessário definir largura/altura — a engine ajusta automaticamente mantendo a proporção original do arquivo.

### Choice (escolha)

```json
{
  "id": "abrir-bau",
  "text": "Abrir o baú trancado",
  "target": "12",
  "conditions": [ { "type": "hasItem", "itemId": "rusty-key" } ],
  "lockedReason": "Você precisa de uma chave para abrir o baú.",
  "actions": [ { "type": "removeItem", "itemId": "rusty-key" } ]
}
```

- `id`, `text`, `target` são obrigatórios. `target` deve ser o `id` de uma seção existente.
- `conditions` (opcional): a escolha só aparece habilitada se **todas** as condições forem verdadeiras (E lógico). Se alguma falhar, a escolha aparece bloqueada mostrando `lockedReason`.
- `actions` (opcional): executadas quando o jogador escolhe essa opção, antes de navegar para `target`.

## Condições (Condition) — usadas em `choices[].conditions`

| type | campos extras | verdadeiro quando |
|---|---|---|
| `hasItem` | `itemId` | jogador tem o item no inventário |
| `notHasItem` | `itemId` | jogador NÃO tem o item |
| `statGreater` | `stat` (skill\|stamina\|luck), `value` | atributo atual > value |
| `statLess` | `stat`, `value` | atributo atual < value |
| `statEqual` | `stat`, `value` | atributo atual == value |
| `flagActive` | `flag` | flag booleana está ativa (setada por `setFlag`) |
| `flagInactive` | `flag` | flag está inativa ou nunca foi setada |
| `minGold` | `value` | ouro atual ≥ value |
| `enemyDefeated` | `enemyId` | esse inimigo específico já foi derrotado alguma vez |
| `sectionVisited` | `sectionId` | jogador já visitou essa seção antes |
| `choiceMade` | `choiceId` | jogador já fez essa escolha específica antes |

Todo objeto de condição aceita `"negate": true` opcional para inverter o resultado (NOT lógico).

## Ações (Action) — usadas em `sections[].onEnter` e `choices[].actions`

| type | campos extras | efeito |
|---|---|---|
| `addItem` | `itemId` | adiciona item ao inventário |
| `removeItem` | `itemId` | remove item do inventário, se presente |
| `modifyStat` | `stat`, `value` (pode ser negativo) | soma/subtrai do atributo, limitado entre 0 e o máximo |
| `restoreStat` | `stat`, `value?` | restaura o atributo; se `value` for omitido, restaura ao máximo |
| `addGold` | `value` (≥0) | soma ouro |
| `removeGold` | `value` (≥0) | subtrai ouro (nunca abaixo de 0) |
| `addProvisions` | `value` (≥0) | soma provisões |
| `removeProvisions` | `value` (≥0) | subtrai provisões |
| `setFlag` | `flag` | ativa uma flag booleana nomeada livremente |
| `clearFlag` | `flag` | desativa a flag |
| `logEvent` | `message` | registra uma mensagem customizada no histórico do jogador |
| `startCombat` | `enemyIds` (array, ≥1), `onVictory`, `onDefeat`, `onFlee?` | inicia combate contra um ou mais inimigos (por id); ao terminar, navega para a seção de vitória/derrota/fuga |
| `startTest` | `testType` (luck\|skill\|attribute\|fixed), `stat?`, `fixedValue?`, `onSuccess`, `onFailure` | inicia um teste de dados; navega conforme sucesso/falha |
| `goToSection` | `sectionId` | redireciona imediatamente para outra seção |
| `endStory` | `ending` (victory\|defeat\|neutral), `title`, `text` | finaliza o jogo com uma tela de encerramento |

Regras de combate (fixas na engine, não configuráveis por livro): cada lado rola 2 dados + Habilidade; quem tiver o maior total vence a rodada; empate não causa dano. O dano base de quem vence é 2 pontos de Energia — a arma equipada do jogador (`damageBonus`) soma a esse dano quando ele vence, e a armadura equipada (`defenseBonus`) subtrai do dano quando o inimigo vence (nunca abaixo de 0). O combate termina quando um lado chega a 0 de Energia. Ao vencer, a engine resolve automaticamente `points` e `lootItemId`/`lootChancePercent` de cada inimigo derrotado (ver seção `enemies[]`) — o autor só precisa preencher esses campos.

Testes: rolam 2 dados. `luck` compara com a Sorte atual (sucesso se a soma for ≤ Sorte; a Sorte sempre cai 1 ponto após o teste, mesmo em caso de sucesso). `skill` compara com a Habilidade atual. `attribute` usa o `stat` indicado. `fixed` compara com `fixedValue` (sucesso se a soma for ≥ fixedValue).

## Validações que a engine aplica (o livro é rejeitado se violar)

1. `startSection` deve existir em `sections`.
2. Todo `choice.target` deve ser o id de uma seção existente em `sections`.
3. Toda condição `hasItem`/`notHasItem` deve referenciar um `itemId` existente em `items`.
4. Toda condição `enemyDefeated` e toda ação `startCombat.enemyIds` deve referenciar `enemyId`s existentes em `enemies`.
5. Todo `enemy.lootItemId` deve referenciar um `itemId` existente em `items`.
6. Os tipos e formatos devem bater exatamente com as tabelas acima — não invente campos nem tipos de condição/ação além dos listados.

## Exemplo mínimo completo e válido

```json
{
  "id": "exemplo-minimo",
  "version": "1.0.0",
  "title": "O Exemplo Mínimo",
  "author": "IA",
  "description": "Uma aventura de exemplo com duas seções.",
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
      "title": "O início",
      "paragraphs": ["Você acorda em uma clareira desconhecida."],
      "choices": [
        { "id": "seguir", "text": "Seguir a trilha", "target": "2" }
      ]
    },
    "2": {
      "id": "2",
      "title": "Fim",
      "paragraphs": ["Você encontra o caminho de volta para casa."],
      "onEnter": [
        { "type": "endStory", "ending": "victory", "title": "De volta ao lar", "text": "Sua jornada termina em segurança." }
      ],
      "choices": []
    }
  }
}
```

## Dicas de escrita

- Escreva em português, tom literário, em 2ª pessoa ("Você..."), como um livro-jogo clássico.
- Prefira 3 a 6 parágrafos curtos por seção e 2 a 4 escolhas.
- Use `flag`s para lembrar decisões do jogador ao longo da história (ex.: `"ajudou-o-ferreiro"`).
- Combine `conditions` com `lockedReason` para dar pistas sobre caminhos alternativos sem revelá-los de imediato.
- Garanta que toda seção seja alcançável a partir de `startSection` e que todo caminho termine numa seção com `endStory`.

---

Agora gere o `story.json` completo pedido pelo usuário, seguindo rigorosamente este formato. Responda **apenas com o JSON**, sem blocos de markdown ao redor, sem comentários.
