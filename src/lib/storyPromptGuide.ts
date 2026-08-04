/**
 * Guia em Markdown, pronto para ser colado numa IA, descrevendo o formato
 * exato de `story.json` esperado por esta engine. Este documento é a
 * referência ÚNICA e oficial das regras da engine — toda mecânica precisa
 * estar descrita aqui, sem exceções (salvo quando marcada como opcional).
 * Sempre que uma mecânica for adicionada ou alterada na engine, este guia
 * deve ser atualizado primeiro/junto, mantido manualmente em sincronia com
 * `src/types/story.ts` e `src/schemas/story.schema.ts`.
 */
export const STORY_PROMPT_GUIDE = `# Como criar um Livro-Jogo para esta engine (guia para IA)

Você vai ajudar a criar um arquivo \`story.json\` para uma engine de livro-jogo (gamebook) interativo em React. Este documento descreve o formato **exato** esperado e todas as regras oficiais da engine — siga-o rigorosamente, sem exceções, salvo quando um recurso for explicitamente marcado como opcional. Ao final, gere **apenas o JSON válido**, sem comentários, sem blocos de markdown ao redor, sem texto explicativo antes ou depois.

## Visão geral

Um livro-jogo é um único objeto JSON com metadados, configuração de quais sistemas da engine estão ativos, regras de criação de personagem, listas de itens/inimigos, e um mapa de seções (o "grafo" da história). O jogador começa em \`startSection\`, lê os parágrafos, e escolhe entre as \`choices\` disponíveis, cada uma levando a outra seção (\`target\`).

## 1. Regras básicas

Toda partida começa obrigatoriamente com uma tela de **Regras da Aventura**, gerada automaticamente pela engine (você não cria uma seção para isso). Ela explica, no mínimo: Habilidade, Energia, Sorte, Ouro, Provisões, Inventário, Combate, Testes de Sorte, Descanso, Alimentação, Fadiga, Magia (quando existir) e as regras especiais do livro. Essa estrutura é padrão em todos os livros e não precisa ser criada manualmente — a engine monta o conteúdo padrão a partir dos sistemas ativos em \`rules\` (seção 10) e complementa com o texto livre de \`rulesText\`, se você fornecer um. Se \`rules.useDefaultRules\` for \`false\`, a engine mostra **apenas** \`rulesText\` — nesse caso, escreva ali uma explicação completa, pois as explicações padrão não aparecerão.

A tela de Regras também fica sempre acessível durante a leitura, numa aba própria do fichário do jogador.

## Estrutura de nível superior

\`\`\`json
{
  "id": "identificador-unico-kebab-case",
  "version": "1.0.0",
  "title": "Título do Livro",
  "author": "Nome do Autor",
  "description": "Um ou dois parágrafos descrevendo a aventura.",
  "genre": "Fantasia sombria",
  "estimatedDuration": "20-30 minutos",
  "cover": "/stories/seu-id/cover.png",
  "rulesText": "Regras especiais deste livro (opcional, texto livre).",
  "rules": { "...": "ver seção 10, metadados — quais sistemas estão ativos" },
  "startSection": "1",
  "characterCreation": { "...": "ver seção characterCreation abaixo" },
  "items": [ "...": "ver seção items abaixo" ],
  "enemies": [ "...": "ver seção enemies abaixo" ],
  "sections": { "1": { "...": "ver seção sections abaixo" } }
}
\`\`\`

Campos obrigatórios: \`id\`, \`version\`, \`title\`, \`author\`, \`description\`, \`startSection\`, \`characterCreation\`, \`items\` (pode ser \`[]\`), \`enemies\` (pode ser \`[]\`), \`sections\`.
Campos opcionais: \`genre\`, \`estimatedDuration\`, \`cover\`, \`rulesText\`, \`rules\`.

- \`id\`: string única, use kebab-case (ex.: \`"torre-do-feiticeiro"\`).
- \`sections\` é um **objeto/dicionário**, não um array — as chaves são os mesmos valores usados no \`id\` de cada seção.

## 2. Estrutura da história

Cada seção tem um \`id\` único (a chave do objeto em \`sections\` deve ser igual ao \`id\` interno — ex.: \`"154": { "id": "154", ... }\`). Cada escolha (\`choice\`) tem seu destino claramente definido em \`target\`, que deve ser o \`id\` de uma seção existente. Ver "sections{}" e "Choice" abaixo para o formato completo.

## characterCreation

Define como os atributos iniciais do personagem são rolados.

\`\`\`json
"characterCreation": {
  "skill": { "dice": 1, "sides": 6, "modifier": 6 },
  "stamina": { "dice": 2, "sides": 6, "modifier": 12 },
  "luck": { "dice": 1, "sides": 6, "modifier": 6 },
  "gold": 5,
  "provisions": 10
}
\`\`\`

Cada atributo (\`skill\`, \`stamina\`, \`luck\`) é uma fórmula de dados: valor final = soma de \`dice\` dados de \`sides\` lados + \`modifier\`. \`gold\` e \`provisions\` são números fixos iniciais (inteiros ≥ 0).

Convenção usual (não obrigatória): Habilidade ~1d6+6, Energia ~2d6+12, Sorte ~1d6+6.

## items[]

Cada item:

\`\`\`json
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
\`\`\`

- \`kind\`: \`"weapon" | "armor" | "consumable" | "key" | "misc"\`.
- \`damageBonus\` (armas): inteiro somado ao **dano causado** quando o item está equipado e o jogador vence a rodada de combate.
- \`defenseBonus\` (armaduras): inteiro subtraído do **dano recebido** quando o item está equipado e o inimigo vence a rodada (nunca deixa o dano negativo).
- \`onUseEffects\`: array de \`{ "stat": "skill"|"stamina"|"luck"|"gold"|"provisions", "value": number }\`, aplicado quando o item é usado (ex.: uma poção que restaura Energia).
- \`consumable\`: se \`true\`, o item é removido do inventário ao ser usado.
- \`discardable\`: se \`false\`, o jogador não pode descartar o item manualmente (útil para itens de enredo/chave).
- \`icon\` (opcional): chave de ícone mostrada no inventário. Valores reconhecidos: \`"sword"\`, \`"shield"\`, \`"potion"\`, \`"food"\`, \`"book"\`, \`"key"\`, \`"gem"\`, \`"misc"\`. Se omitido ou desconhecido, a UI escolhe um ícone padrão a partir de \`kind\`.
- \`examineText\` / \`examineImage\` (opcionais): conteúdo extra só visível quando o jogador clica em "Olhar" no item, dentro do inventário (o botão só aparece se pelo menos um dos dois estiver definido). \`examineImage\` usa o mesmo esquema de caminho de \`cover\`/\`image\` (arquivo em \`public/stories/<seu-id>/...\`).

## enemies[]

\`\`\`json
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
\`\`\`

- \`skill\` e \`stamina\` são inteiros (\`stamina\` ≥ 1). \`defeatText\` (opcional) aparece quando o inimigo é derrotado. \`description\`/\`image\` são opcionais.
- \`points\` (opcional, inteiro ≥ 0): pontos somados à pontuação do jogador (visível na Ficha) ao derrotar este inimigo. A engine soma isso automaticamente — não precisa de nenhuma \`action\` extra.
- \`lootItemId\` (opcional): \`id\` de um item de \`items\` que este inimigo pode deixar cair ao ser derrotado. Durante o combate, a UI mostra uma dica discreta sob o inimigo vivo avisando que ele "pode deixar algo ao ser derrotado" — sem revelar qual item nem a chance exata.
- \`lootChancePercent\` (opcional, 0–100): chance de o item de \`lootItemId\` ser realmente concedido ao derrotar o inimigo (sorteada automaticamente pela engine). Sem \`lootItemId\`, este campo não tem efeito.

## sections{}

Cada seção (a chave do objeto deve ser igual ao \`id\` interno):

\`\`\`json
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
  ],
  "canRepeat": false,
  "allowRest": false,
  "allowEat": false
}
\`\`\`

- \`paragraphs\`: array de strings, pelo menos 1.
- \`title\` e \`image\` são opcionais.
- \`onEnter\`: lista de Ações (ver abaixo) — útil para armadilhas automáticas, ganho de item ao entrar, início de combate/teste, ou finais.
- \`choices\`: lista de Escolhas — pode ser vazia **apenas** em seções finais que já terminam a história via \`onEnter\` com \`endStory\` (senão o jogador fica travado sem opções).
- \`canRepeat\`, \`allowRest\`, \`allowEat\`: ver seções 3, 4 e 5 abaixo. Todos opcionais, default \`false\`.

### Imagens de seção (\`image\`)

Uma seção pode incluir **uma** ilustração, exibida entre o título e o primeiro parágrafo, como uma prancha inserida na página:

- Caminho do arquivo: coloque a imagem em \`public/stories/<seu-id>/nome-do-arquivo.png\` (ou \`.webp\`/\`.jpg\`) e referencie com \`"image": "/stories/<seu-id>/nome-do-arquivo.png"\` (mesmo esquema de caminho absoluto usado em \`cover\`).
- A tela de leitura aplica um blend de multiplicação (\`mix-blend-mode: multiply\`) para a imagem se fundir com o papel do pergaminho — funciona melhor com **ilustrações em tinta/gravura de fundo claro** (preto e branco ou sépia, como xilogravuras ou desenhos a nanquim), evite fotos com fundos coloridos sólidos ou muito escuros, pois o blend pode escurecê-los demais.
- A imagem é opcional em toda seção; use com moderação, em momentos-chave da narrativa (chegada a um lugar importante, revelação de um inimigo, um item marcante), não em toda seção.
- Não é necessário definir largura/altura — a engine ajusta automaticamente mantendo a proporção original do arquivo.

### Choice (escolha)

\`\`\`json
{
  "id": "abrir-bau",
  "text": "Abrir o baú trancado",
  "target": "12",
  "conditions": [ { "type": "hasItem", "itemId": "rusty-key" } ],
  "lockedReason": "Você precisa de uma chave para abrir o baú.",
  "actions": [ { "type": "removeItem", "itemId": "rusty-key" } ]
}
\`\`\`

- \`id\`, \`text\`, \`target\` são obrigatórios. \`target\` deve ser o \`id\` de uma seção existente.
- \`conditions\` (opcional): a escolha só aparece habilitada se **todas** as condições forem verdadeiras (E lógico). Se alguma falhar, a escolha aparece bloqueada mostrando \`lockedReason\`.
- \`actions\` (opcional): executadas quando o jogador escolhe essa opção, antes de navegar para \`target\`.
- Além disso, toda escolha respeita o **controle de caminhos já explorados** (seção 3): se já foi feita antes e a seção não permite repetição, ela aparece bloqueada automaticamente, mesmo sem nenhuma \`condition\`.

## 3. Controle de caminhos já explorados (\`canRepeat\`)

Para evitar exploração infinita e repetição de recompensas, a engine controla automaticamente as escolhas já feitas: depois que o jogador escolhe uma opção, se ele retornar à mesma seção, essa opção **continua visível, mas aparece desabilitada** (com a mensagem "Você já seguiu por este caminho e não pode repeti-lo.") e não pode ser escolhida de novo. Isso é automático — não exige nenhuma \`condition\` manual.

**Exceção:** seções que funcionam como locais revisitáveis (cidades, vilarejos, acampamentos, fortalezas aliadas, hubs centrais) devem ter \`"canRepeat": true\`. Nelas, as escolhas continuam disponíveis mesmo depois de já terem sido feitas. Sem essa propriedade (ou com \`false\`, o padrão), cada escolha da seção só pode ser feita uma vez.

Use \`canRepeat: true\` nas seções que são pontos de retorno da aventura (ex.: uma vila-base entre capítulos); deixe como padrão (\`false\`) em seções que fazem parte de um caminho linear de exploração, para que o jogador não repita recompensas.

A interface reforça isso de duas formas automáticas, sem exigir nada do autor: toda escolha que leva a uma seção já visitada ganha um ícone de olho discreto; e se todas as escolhas da seção atual estiverem bloqueadas (nenhuma disponível), um botão "Voltar" aparece para o jogador retornar à seção anterior, garantindo que ele nunca fique travado sem opções.

## 4. Sistema de descanso (\`allowRest\`)

Marque \`"allowRest": true\` em seções que representem locais seguros específicos da aventura (uma sala isolada, um acampamento, uma estalagem). Nessas seções, um botão "Descansar" fica disponível para o jogador, com este efeito fixo da engine:

- Consome 1 Provisão.
- Restaura 4 pontos de Energia (nunca ultrapassando a Energia máxima inicial do personagem).
- Zera o contador de Fadiga (seção 7).

Sem Provisões, o descanso não pode ser realizado (o botão fica desabilitado). Distribua locais de descanso com naturalidade ao longo de toda a aventura, especialmente antes de trechos mais longos ou perigosos — nunca deixe o jogador andar um trecho extenso da história sem nenhuma oportunidade razoável de descansar.

Pode ser desativado no livro inteiro com \`rules.restSystem: false\` (seção 10); nesse caso não use \`allowRest\` em nenhuma seção.

### Emboscada durante o descanso (\`restEncounter\`, opcional)

Um local de descanso pode não ser totalmente seguro (ex.: descansar ao relento numa floresta). Adicione \`restEncounter\` à seção para dar uma chance de a tentativa de descanso ser interrompida por um combate:

\`\`\`json
{
  "allowRest": true,
  "restEncounter": {
    "chancePercent": 25,
    "enemyIds": ["lobo-selvagem"],
    "onVictory": "10",
    "onDefeat": "16",
    "onFlee": "9"
  }
}
\`\`\`

- \`chancePercent\` (0–100): chance de a emboscada ocorrer a cada tentativa de descanso nesta seção.
- \`enemyIds\`, \`onVictory\`, \`onDefeat\`, \`onFlee\` (opcional): mesmos campos e mesmo comportamento da ação \`startCombat\`.
- Se a emboscada ocorrer, o descanso é **interrompido sem custo**: nenhuma Provisão é gasta e nenhum benefício (Energia/Fadiga) é aplicado — o combate substitui o descanso desta vez. Se não ocorrer, o descanso funciona normalmente. Todo \`enemyId\`/seção referenciados devem existir, como em \`startCombat\`.

## 5. Sistema de alimentação (\`allowEat\`)

Marque \`"allowEat": true\` em seções onde o jogador pode simplesmente comer (não precisa ser um local totalmente seguro — pode ser uma pausa rápida durante a exploração). Efeito fixo da engine:

- Consome 1 Provisão.
- Zera o contador de Fadiga (seção 7).

Diferente do descanso, comer não restaura Energia. Distribua oportunidades de alimentação com naturalidade ao longo da exploração, para dar ao jogador uma forma frequente de controlar a Fadiga sem precisar de um local totalmente seguro.

## 6. Sistema de provisões

O gerenciamento de Provisões é parte da estratégia principal da aventura: elas são gastas ao descansar e ao comer, e mantêm a Fadiga sob controle. Distribua naturalmente ao longo do livro:

- provisões encontradas em baús, corpos, ruínas;
- comerciantes que vendem provisões;
- recompensas de combate ou de testes bem-sucedidos;
- saques ao derrotar inimigos;
- locais seguros (\`allowRest\`) e oportunidades de alimentação (\`allowEat\`);
- eventos narrativos que removam provisões (uma tempestade, um roubo), quando fizer sentido para a história.

O jogador nunca deve passar grandes trechos da aventura sem oportunidades razoáveis de recuperar provisões.

Pode ser desativado como orientação geral com \`rules.provisions: false\` (não muda nenhum comportamento de código — só indica que o gerenciamento de provisões não é um foco desta aventura).

## 7. Sistema de fadiga

Um contador de Fadiga (0 a 10+), **visível na Ficha do personagem**, ao lado de Habilidade, Energia, Sorte, Ouro e Provisões:

\`\`\`
Habilidade: 10
Energia: 18/20
Sorte: 9
Ouro: 15
Provisões: 4
Fadiga: 3/10
\`\`\`

**Funcionamento:** toda vez que o jogador avança para uma nova seção (por uma escolha, pelo resultado de um combate, de um teste, ou por fuga), a Fadiga sobe 1 ponto. Toda vez que o jogador come (\`allowEat\`) ou descansa (\`allowRest\`), a Fadiga volta a 0.

**Penalidade por exaustão:** a cada vez que a Fadiga sobe, a engine sorteia um limiar aleatório entre 7 e 10. Se a Fadiga (já incrementada) atingir ou ultrapassar esse limiar sorteado, a exaustão é disparada automaticamente:

> "A longa jornada começa a cobrar seu preço. Sem descanso e alimentação suficientes, seu corpo enfraquece."

Resultado: o personagem perde 2 pontos de Energia, e a Fadiga volta a 0 (o ciclo recomeça). Isso é inteiramente automático — o autor do livro não precisa (e não deve) escrever nenhuma \`action\` para isso; só precisa distribuir bem os pontos de \`allowRest\`/\`allowEat\` para que o jogador tenha meios de evitar a exaustão repetida.

Ao planejar a aventura, crie momentos onde o jogador precise decidir entre continuar explorando (arriscando fadiga) ou gastar uma Provisão para comer/descansar.

Pode ser desativado no livro inteiro com \`rules.fatigueSystem: false\`; nesse caso a Fadiga não aparece na Ficha e nunca é incrementada.

## 8. Sistema de combate

- Cada lado (jogador e inimigo) rola 2 dados + a própria Habilidade; quem tiver o maior total vence a rodada. Empate não causa dano.
- O dano base de quem vence é 2 pontos de Energia. A arma equipada do jogador (\`damageBonus\`) soma a esse dano quando ele vence a rodada; a armadura equipada (\`defenseBonus\`) subtrai do dano quando o inimigo vence (nunca abaixo de 0).
- O combate termina quando um dos lados chega a 0 de Energia: vitória leva a \`onVictory\`, derrota a \`onDefeat\`.
- Fuga: se \`onFlee\` estiver definido na ação \`startCombat\`, o jogador pode fugir a qualquer momento, indo para essa seção.
- Inimigos especiais e efeitos especiais: use \`points\`, \`lootItemId\`/\`lootChancePercent\` (ver \`enemies[]\`) para inimigos com recompensas diferenciadas; use \`onEnter\`/\`actions\` nas seções de vitória/derrota para efeitos narrativos adicionais (ex.: ganhar um item ou setar uma flag após vencer um chefe).
- Ao vencer, a engine resolve automaticamente \`points\` e \`lootItemId\`/\`lootChancePercent\` de cada inimigo derrotado — o autor só precisa preencher esses campos em \`enemies[]\`.

### Sorte durante o combate ("Testar a Sorte")

Depois de vencer uma rodada de combate (o ataque do jogador já causou dano normalmente), a interface oferece a opção **Testar a Sorte**, sempre que o inimigo atingido nessa rodada ainda estiver vivo e o jogador tiver ao menos 1 ponto de Sorte:

- Realiza um Teste de Sorte (2 dados, sucesso se a soma for ≤ Sorte atual).
- Reduz a Sorte em 1 ponto, independentemente do resultado.
- Se bem-sucedido: causa +2 pontos de dano adicional ao inimigo, nesta mesma rodada.
- Se falhar: o ataque já resolvido causa apenas o dano normal (nenhum dano extra, nenhuma penalidade além da Sorte perdida).

É opcional a cada rodada (o jogador escolhe testar ou não) e totalmente automático do lado da engine — nenhuma configuração é necessária por livro além de manter \`rules.combatLuck\` ativo (é o padrão).

Pode ser desativado no livro inteiro com \`rules.combatLuck: false\`.

## 9. Magia

Esta versão da engine **não implementa** um sistema de magia. Se a sua aventura envolve magia, trate-a apenas narrativamente (descrições, itens mágicos via \`onUseEffects\`, inimigos especiais) — não invente campos ou mecânicas de magia que a engine não suporta. Quando um sistema de magia for adicionado a uma versão futura da engine, este guia será atualizado com as regras correspondentes antes de qualquer livro passar a usá-lo.

## Testes de Sorte, Habilidade e valor fixo (fora de combate)

Testes: rolam 2 dados. \`luck\` compara com a Sorte atual (sucesso se a soma for ≤ Sorte; a Sorte sempre cai 1 ponto após o teste, mesmo em caso de sucesso). \`skill\` compara com a Habilidade atual. \`attribute\` usa o \`stat\` indicado. \`fixed\` compara com \`fixedValue\` (sucesso se a soma for ≥ fixedValue).

## Condições (Condition) — usadas em \`choices[].conditions\`

| type | campos extras | verdadeiro quando |
|---|---|---|
| \`hasItem\` | \`itemId\` | jogador tem o item no inventário |
| \`notHasItem\` | \`itemId\` | jogador NÃO tem o item |
| \`statGreater\` | \`stat\` (skill\\|stamina\\|luck), \`value\` | atributo atual > value |
| \`statLess\` | \`stat\`, \`value\` | atributo atual < value |
| \`statEqual\` | \`stat\`, \`value\` | atributo atual == value |
| \`flagActive\` | \`flag\` | flag booleana está ativa (setada por \`setFlag\`) |
| \`flagInactive\` | \`flag\` | flag está inativa ou nunca foi setada |
| \`minGold\` | \`value\` | ouro atual ≥ value |
| \`enemyDefeated\` | \`enemyId\` | esse inimigo específico já foi derrotado alguma vez |
| \`sectionVisited\` | \`sectionId\` | jogador já visitou essa seção antes |
| \`choiceMade\` | \`choiceId\` | jogador já fez essa escolha específica antes |

Todo objeto de condição aceita \`"negate": true\` opcional para inverter o resultado (NOT lógico).

## Ações (Action) — usadas em \`sections[].onEnter\` e \`choices[].actions\`

| type | campos extras | efeito |
|---|---|---|
| \`addItem\` | \`itemId\` | adiciona item ao inventário |
| \`removeItem\` | \`itemId\` | remove item do inventário, se presente |
| \`modifyStat\` | \`stat\`, \`value\` (pode ser negativo) | soma/subtrai do atributo, limitado entre 0 e o máximo |
| \`restoreStat\` | \`stat\`, \`value?\` | restaura o atributo; se \`value\` for omitido, restaura ao máximo |
| \`addGold\` | \`value\` (≥0) | soma ouro |
| \`removeGold\` | \`value\` (≥0) | subtrai ouro (nunca abaixo de 0) |
| \`addProvisions\` | \`value\` (≥0) | soma provisões |
| \`removeProvisions\` | \`value\` (≥0) | subtrai provisões |
| \`setFlag\` | \`flag\` | ativa uma flag booleana nomeada livremente |
| \`clearFlag\` | \`flag\` | desativa a flag |
| \`logEvent\` | \`message\` | registra uma mensagem customizada no histórico do jogador |
| \`startCombat\` | \`enemyIds\` (array, ≥1), \`onVictory\`, \`onDefeat\`, \`onFlee?\` | inicia combate contra um ou mais inimigos (por id); ao terminar, navega para a seção de vitória/derrota/fuga |
| \`startTest\` | \`testType\` (luck\\|skill\\|attribute\\|fixed), \`stat?\`, \`fixedValue?\`, \`onSuccess\`, \`onFailure\` | inicia um teste de dados; navega conforme sucesso/falha |
| \`goToSection\` | \`sectionId\` | redireciona imediatamente para outra seção |
| \`endStory\` | \`ending\` (victory\\|defeat\\|neutral), \`title\`, \`text\` | finaliza o jogo com uma tela de encerramento |

Fadiga, descanso, alimentação, exaustão automática, sorte em combate e controle de caminhos repetidos (seções 3–9) são inteiramente resolvidos pela engine a partir dos campos \`rules\`/\`canRepeat\`/\`allowRest\`/\`allowEat\` — **não** existem \`action\`s ou \`condition\`s dedicadas para eles, e não devem ser inventadas.

## 10. Estrutura dos metadados

\`\`\`json
{
  "rulesText": "Texto livre com regras especiais do livro (opcional).",
  "rules": {
    "useDefaultRules": true,
    "fatigueSystem": true,
    "provisions": true,
    "restSystem": true,
    "combatLuck": true
  },
  "sections": {
    "120": { "id": "120", "canRepeat": false, "allowRest": true, "allowEat": false, "paragraphs": ["..."], "choices": [] },
    "187": { "id": "187", "canRepeat": true, "allowRest": false, "allowEat": true, "paragraphs": ["..."], "choices": [] }
  }
}
\`\`\`

**\`rules\` (nível do livro, todas as flags opcionais e com default \`true\` quando omitidas):**

| propriedade | efeito | boas práticas |
|---|---|---|
| \`useDefaultRules\` | se \`true\`, a tela de Regras usa as explicações padrão da engine para cada mecânica ativa, além de \`rulesText\`; se \`false\`, mostra só \`rulesText\` | deixe \`true\` a menos que você queira escrever a explicação completa de todas as regras à mão |
| \`fatigueSystem\` | ativa o contador de Fadiga e a exaustão automática (seção 7) | desative só se a aventura for muito curta (poucas seções) e a fadiga não fizer sentido |
| \`provisions\` | só orientação/documentação — indica se o gerenciamento de provisões é um foco estratégico desta aventura | não muda comportamento de código |
| \`restSystem\` | ativa o botão de descanso nas seções com \`allowRest\` (seção 4) | desative junto com \`fatigueSystem\` se a aventura não usar sobrevivência |
| \`combatLuck\` | ativa o "Testar a Sorte" após rodadas vencidas em combate (seção 8) | mantenha ativo salvo pedido explícito para um combate mais simples |

**Por seção (todas opcionais, default \`false\`):** \`canRepeat\` (seção 3), \`allowRest\` (seção 4), \`allowEat\` (seção 5).

## Validações que a engine aplica (o livro é rejeitado se violar)

1. \`startSection\` deve existir em \`sections\`.
2. Todo \`choice.target\` deve ser o id de uma seção existente em \`sections\`.
3. Toda condição \`hasItem\`/\`notHasItem\` deve referenciar um \`itemId\` existente em \`items\`.
4. Toda condição \`enemyDefeated\` e toda ação \`startCombat.enemyIds\` deve referenciar \`enemyId\`s existentes em \`enemies\`.
5. Todo \`enemy.lootItemId\` deve referenciar um \`itemId\` existente em \`items\`.
6. Todo \`section.restEncounter.enemyIds\` deve referenciar \`enemyId\`s existentes, e \`onVictory\`/\`onDefeat\`/\`onFlee\` devem referenciar seções existentes.
7. Os tipos e formatos devem bater exatamente com as tabelas acima — não invente campos nem tipos de condição/ação além dos listados.

## Exemplo mínimo completo e válido

\`\`\`json
{
  "id": "exemplo-minimo",
  "version": "1.0.0",
  "title": "O Exemplo Mínimo",
  "author": "IA",
  "description": "Uma aventura de exemplo com três seções, usando descanso e um hub revisitável.",
  "startSection": "1",
  "rules": {
    "useDefaultRules": true,
    "fatigueSystem": true,
    "provisions": true,
    "restSystem": true,
    "combatLuck": true
  },
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
      "title": "O acampamento",
      "paragraphs": ["Você acorda em uma clareira desconhecida. Um pequeno acampamento abandonado ainda tem brasas quentes."],
      "canRepeat": true,
      "allowRest": true,
      "allowEat": true,
      "choices": [
        { "id": "seguir", "text": "Seguir a trilha", "target": "2" }
      ]
    },
    "2": {
      "id": "2",
      "title": "A bifurcação",
      "paragraphs": ["A trilha se divide em dois caminhos."],
      "choices": [
        { "id": "voltar-acampamento", "text": "Voltar ao acampamento para descansar", "target": "1" },
        { "id": "seguir-fim", "text": "Seguir em frente", "target": "3" }
      ]
    },
    "3": {
      "id": "3",
      "title": "Fim",
      "paragraphs": ["Você encontra o caminho de volta para casa."],
      "onEnter": [
        { "type": "endStory", "ending": "victory", "title": "De volta ao lar", "text": "Sua jornada termina em segurança." }
      ],
      "choices": []
    }
  }
}
\`\`\`

## 11. Diretrizes para a IA na criação de livros

Toda IA, autor ou ferramenta responsável por criar uma aventura para esta engine deve:

- seguir todas as regras da engine descritas neste guia, sem exceções, salvo quando algo for explicitamente marcado como opcional;
- utilizar corretamente todos os metadados (\`rules\`, \`canRepeat\`, \`allowRest\`, \`allowEat\`);
- distribuir combates de forma equilibrada ao longo da aventura;
- distribuir Testes de Sorte naturalmente, sem abusar deles;
- distribuir provisões ao longo da aventura (seção 6);
- distribuir locais para descanso (\`allowRest\`, seção 4);
- distribuir locais para alimentação (\`allowEat\`, seção 5);
- levar o sistema de fadiga em conta ao planejar o ritmo da aventura (seção 7);
- confiar no controle automático de caminhos repetidos, usando \`canRepeat\` apenas quando fizer sentido narrativo (hubs, cidades, bases) — seção 3;
- manter equilíbrio entre narrativa, exploração, combate e gerenciamento de recursos, integrando essas mecânicas à história de forma natural, sem que pareçam elementos artificiais inseridos só para cumprir regras técnicas.

## 12. Atualização contínua deste guia

Este documento é a referência oficial da engine. Qualquer alteração de regras ou mecânicas deve seguir esta ordem: 1) atualizar este guia; 2) atualizar a engine, se necessário; 3) só então criar novos livros com a mudança.

## Dicas de escrita

- Escreva em português, tom literário, em 2ª pessoa ("Você..."), como um livro-jogo clássico.
- Prefira 3 a 6 parágrafos curtos por seção e 2 a 4 escolhas.
- Use \`flag\`s para lembrar decisões do jogador ao longo da história (ex.: \`"ajudou-o-ferreiro"\`).
- Combine \`conditions\` com \`lockedReason\` para dar pistas sobre caminhos alternativos sem revelá-los de imediato.
- Garanta que toda seção seja alcançável a partir de \`startSection\` e que todo caminho termine numa seção com \`endStory\`.

---

Agora gere o \`story.json\` completo pedido pelo usuário, seguindo rigorosamente este formato. Responda **apenas com o JSON**, sem blocos de markdown ao redor, sem comentários.
`;
