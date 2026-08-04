-- Semeia os 3 livros de demonstracao com conteudo completo em content_data.
-- owner_id vira nullable para representar livros "de plataforma" sem dono
-- humano -- auth.uid() = owner_id resolve para NULL (nao-satisfeito) quando
-- owner_id e null, entao só admin (via is_admin()) consegue editar/apagar
-- essas linhas; nenhuma outra politica precisa mudar.
--
-- Como rodar: npx supabase db push (projeto ja linkado).

alter table public.books alter column owner_id drop not null;

insert into public.books (owner_id, title, slug, short_description, description, cover_url, genre, status, visibility, content_data, estimated_sections, estimated_reading_time, published_at)
values (
  null,
  'A Fortaleza das Sombras',
  'fortaleza-das-sombras',
  'Uma tempestade te empurra até os portões de uma fortaleza abandonada, tomada por uma escuridão antiga. Explore corredores esquecidos, enfrente guardiões sombrios e decida o destino do Senhor das Sombr',
  'Uma tempestade te empurra até os portões de uma fortaleza abandonada, tomada por uma escuridão antiga. Explore corredores esquecidos, enfrente guardiões sombrios e decida o destino do Senhor das Sombras que dorme no salão do trono.',
  '/stories/fortaleza-das-sombras/cover.png',
  'Fantasia sombria',
  'published',
  'public',
  $demobook1${
  "id": "fortaleza-das-sombras",
  "version": "1.0.0",
  "title": "A Fortaleza das Sombras",
  "author": "Autor original (demonstração)",
  "description": "Uma tempestade te empurra até os portões de uma fortaleza abandonada, tomada por uma escuridão antiga. Explore corredores esquecidos, enfrente guardiões sombrios e decida o destino do Senhor das Sombras que dorme no salão do trono.",
  "genre": "Fantasia sombria",
  "estimatedDuration": "20-30 minutos",
  "cover": "/stories/fortaleza-das-sombras/cover.png",
  "rulesText": "Você é guiado por três atributos: Habilidade, Energia e Sorte. Testes de Sorte pedem que você role dois dados e compare a soma com sua Sorte atual (sucesso se a soma for menor ou igual). Testes de Habilidade seguem a mesma lógica com o atributo testado. Em combate, você e o inimigo rolam dois dados e somam a própria Habilidade; quem tiver o maior total causa 2 pontos de dano em Energia ao oponente (empates não causam dano). O combate termina quando um dos lados chega a zero de Energia.",
  "rules": {
    "useDefaultRules": true,
    "fatigueSystem": true,
    "provisions": true,
    "restSystem": true,
    "combatLuck": true
  },
  "startSection": "1",
  "characterCreation": {
    "skill": { "dice": 1, "sides": 6, "modifier": 6 },
    "stamina": { "dice": 2, "sides": 6, "modifier": 12 },
    "luck": { "dice": 1, "sides": 6, "modifier": 6 },
    "gold": 5,
    "provisions": 10
  },
  "items": [
    {
      "id": "rusty-key",
      "name": "Chave Enferrujada",
      "description": "Uma chave antiga, coberta de ferrugem, encontrada entre os escombros das ruínas externas.",
      "kind": "key",
      "discardable": false,
      "icon": "key"
    },
    {
      "id": "ancient-sword",
      "name": "Espada Antiga",
      "description": "Uma lâmina esquecida que ainda guarda um brilho estranho. Concede vantagem em combate.",
      "kind": "weapon",
      "damageBonus": 2,
      "icon": "sword"
    },
    {
      "id": "healing-potion",
      "name": "Poção de Cura",
      "description": "Um frasco de líquido vermelho-escuro que restaura vitalidade quando bebido.",
      "kind": "consumable",
      "consumable": true,
      "onUseEffects": [{ "stat": "stamina", "value": 6 }],
      "icon": "potion",
      "examineText": "Ao erguer o frasco contra a luz, você percebe reflexos dourados girando lentamente dentro do líquido vermelho-escuro — um sinal de que a poção ainda está potente."
    },
    {
      "id": "leather-armor",
      "name": "Armadura de Couro Reforçada",
      "description": "Uma armadura simples, mas reforçada com placas de metal costuradas ao couro envelhecido.",
      "kind": "armor",
      "defenseBonus": 1,
      "icon": "shield"
    }
  ],
  "enemies": [
    {
      "id": "guarda-fortaleza",
      "name": "Guarda da Fortaleza",
      "skill": 6,
      "stamina": 8,
      "description": "Um antigo soldado, ainda vestindo a armadura enferrujada de seu posto eterno.",
      "defeatText": "O guarda desmorona em um monte de poeira e metal enferrujado.",
      "points": 10,
      "lootItemId": "leather-armor",
      "lootChancePercent": 50
    },
    {
      "id": "sombra-sussurrante",
      "name": "Sombra Sussurrante",
      "skill": 7,
      "stamina": 10,
      "description": "Uma silhueta de trevas que sussurra seu nome antes de atacar.",
      "defeatText": "A sombra se dissolve em um lamento distante, deixando um resíduo escuro no ar.",
      "points": 15
    },
    {
      "id": "senhor-das-sombras",
      "name": "Senhor das Sombras",
      "skill": 9,
      "stamina": 14,
      "description": "O antigo mestre da fortaleza, agora uma entidade de escuridão pura.",
      "defeatText": "O Senhor das Sombras solta um grito que ecoa por toda a fortaleza antes de se desfazer em cinzas.",
      "points": 30
    }
  ],
  "sections": {
    "1": {
      "id": "1",
      "title": "Os portões da fortaleza",
      "paragraphs": [
        "Você está diante de uma antiga fortaleza de pedra escura. Uma tempestade se aproxima pelo norte, e relâmpagos iluminam por instantes as torres cobertas de musgo.",
        "Os portões principais estão entreabertos, como se alguém — ou algo — os tivesse deixado assim de propósito. Uma muralha lateral, mais baixa e coberta de hera, parece escalável. Um pouco mais adiante, ruínas de uma antiga guarita se erguem entre os destroços."
      ],
      "choices": [
        { "id": "enter-main-door", "text": "Entrar pela porta principal", "target": "2" },
        { "id": "climb-wall", "text": "Contornar e escalar a muralha lateral", "target": "3" },
        { "id": "search-ruins", "text": "Vasculhar as ruínas da guarita antes de entrar", "target": "4" }
      ]
    },
    "2": {
      "id": "2",
      "title": "O corredor das armadilhas",
      "paragraphs": [
        "Você atravessa o portão e entra em um corredor estreito. No chão, uma fileira de pedras levemente diferentes das demais chama sua atenção — uma placa de pressão, quase invisível na penumbra.",
        "É tarde demais para recuar por completo, mas talvez sua sorte ainda possa te ajudar a atravessar sem ativar a armadilha."
      ],
      "onEnter": [
        {
          "type": "startTest",
          "testType": "luck",
          "onSuccess": "5",
          "onFailure": "2f"
        }
      ],
      "choices": []
    },
    "2f": {
      "id": "2f",
      "title": "Dardos das sombras",
      "paragraphs": [
        "Uma rajada de dardos emerge das paredes! Você se abaixa tarde demais e sente a picada fria de dois deles atravessando sua armadura.",
        "Ferido, você se recompõe e segue em frente, mais cauteloso."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -3 }],
      "choices": [
        { "id": "continue-after-trap", "text": "Seguir em frente, com cuidado redobrado", "target": "5" }
      ]
    },
    "3": {
      "id": "3",
      "title": "A muralha coberta de hera",
      "paragraphs": [
        "A hera antiga oferece boas pegadas, mas as pedras estão úmidas pela chuva que se aproxima. Escalar exigirá firmeza e um pouco de sorte com seus movimentos.",
        "Você testa sua Habilidade para encontrar o caminho mais seguro até o topo."
      ],
      "onEnter": [
        {
          "type": "startTest",
          "testType": "skill",
          "stat": "skill",
          "onSuccess": "5",
          "onFailure": "3f"
        }
      ],
      "choices": []
    },
    "3f": {
      "id": "3f",
      "title": "Um escorregão perigoso",
      "paragraphs": [
        "Seu pé escorrega em uma pedra solta e você cai os últimos metros, batendo com força contra o chão de pedra do outro lado da muralha.",
        "Machucado, você se levanta e segue adiante, já dentro dos limites da fortaleza."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -2 }],
      "choices": [
        { "id": "continue-after-fall", "text": "Levantar-se e continuar", "target": "5" }
      ]
    },
    "4": {
      "id": "4",
      "title": "As ruínas da guarita",
      "allowEat": true,
      "paragraphs": [
        "Entre pedras caídas e restos de móveis apodrecidos, você encontra uma pequena bolsa de couro esquecida. Dentro dela há algumas moedas de ouro e uma chave enferrujada, gasta pelo tempo.",
        "Guardando seus achados, você segue em direção à fortaleza."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "rusty-key" },
        { "type": "addGold", "value": 5 },
        { "type": "logEvent", "message": "Você encontrou uma chave enferrujada e 5 moedas de ouro nas ruínas." }
      ],
      "choices": [
        { "id": "enter-after-search", "text": "Entrar na fortaleza pela porta principal", "target": "5" }
      ]
    },
    "5": {
      "id": "5",
      "title": "O guarda esquecido",
      "paragraphs": [
        "No fim do corredor, uma figura em armadura enferrujada se ergue lentamente de um banco de pedra. O Guarda da Fortaleza ainda cumpre seu antigo dever, séculos depois de seu último comandante ter partido.",
        "Ele levanta uma lança cega pela ferrugem e avança contra você."
      ],
      "onEnter": [
        {
          "type": "startCombat",
          "enemyIds": ["guarda-fortaleza"],
          "onVictory": "6",
          "onDefeat": "16",
          "onFlee": "5f"
        }
      ],
      "choices": []
    },
    "5f": {
      "id": "5f",
      "title": "Fuga pelos corredores",
      "paragraphs": [
        "Você escapa do guarda por pouco, correndo por corredores laterais até perder o inimigo de vista. Ofegante, você encontra o caminho para o salão central da fortaleza."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -1 }],
      "choices": [
        { "id": "reach-hall-after-flee", "text": "Seguir para o salão central", "target": "6" }
      ]
    },
    "6": {
      "id": "6",
      "title": "O salão central",
      "paragraphs": [
        "Você chega a um vasto salão central, iluminado por tochas que nunca parecem se apagar. Duas portas se abrem à sua frente: uma pesada porta de carvalho a oeste, trancada com um cadeado enferrujado, e um arco aberto a leste, de onde vem um leve odor estranho.",
        "Uma escadaria em espiral desce para as masmorras, ao fundo do salão."
      ],
      "choices": [
        {
          "id": "open-west-door",
          "text": "Abrir a porta oeste com a chave enferrujada",
          "target": "8",
          "conditions": [{ "type": "hasItem", "itemId": "rusty-key" }],
          "lockedReason": "A porta está trancada. Você precisa de uma chave para abri-la."
        },
        { "id": "go-east-door", "text": "Seguir pelo arco leste", "target": "9" },
        { "id": "go-downstairs", "text": "Descer a escadaria em espiral para as masmorras", "target": "10" }
      ]
    },
    "8": {
      "id": "8",
      "title": "A câmara do tesouro",
      "allowRest": true,
      "allowEat": true,
      "paragraphs": [
        "A porta range ao abrir, revelando uma pequena câmara empoeirada. Sobre um pedestal de pedra repousam uma espada antiga, ainda afiada, e um frasco de vidro com um líquido vermelho-escuro.",
        "Você guarda os dois itens com cuidado antes de retornar ao salão central."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "ancient-sword" },
        { "type": "addItem", "itemId": "healing-potion" },
        { "type": "logEvent", "message": "Você encontrou a Espada Antiga e uma Poção de Cura." }
      ],
      "choices": [
        { "id": "return-to-hall-from-treasure", "text": "Voltar ao salão central e descer às masmorras", "target": "10" }
      ]
    },
    "9": {
      "id": "9",
      "title": "A sala do vapor sombrio",
      "paragraphs": [
        "Assim que você atravessa o arco, um vapor escuro escapa de fendas no chão. O ar fica pesado e difícil de respirar. Você precisa contar com sua sorte para atravessar rapidamente sem ser afetado."
      ],
      "onEnter": [
        {
          "type": "startTest",
          "testType": "luck",
          "onSuccess": "10",
          "onFailure": "9f"
        }
      ],
      "choices": []
    },
    "9f": {
      "id": "9f",
      "title": "Vapor nos pulmões",
      "paragraphs": [
        "O vapor sombrio invade seus pulmões antes que você consiga sair da sala. Tossindo e tonto, você se arrasta para fora, sentindo suas forças diminuírem."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -4 }],
      "choices": [
        { "id": "continue-after-gas", "text": "Seguir cambaleante para a escadaria", "target": "10" }
      ]
    },
    "10": {
      "id": "10",
      "title": "A escadaria das masmorras",
      "paragraphs": [
        "Ao descer os últimos degraus, a temperatura cai drasticamente. Das trevas emerge uma silhueta que sussurra seu nome — uma Sombra Sussurrante, criatura feita de pura escuridão.",
        "Ela desliza em sua direção, e você precisa decidir como agir."
      ],
      "onEnter": [
        {
          "type": "startCombat",
          "enemyIds": ["sombra-sussurrante"],
          "onVictory": "11",
          "onDefeat": "16",
          "onFlee": "12"
        }
      ],
      "choices": []
    },
    "11": {
      "id": "11",
      "title": "A essência das sombras",
      "paragraphs": [
        "Ao ser derrotada, a Sombra Sussurrante se dissolve, mas deixa para trás um resíduo escuro que paira no ar por um instante antes de ser absorvido por você.",
        "Você sente um estranho poder percorrer seu corpo — talvez isso seja útil contra o que te espera no salão do trono."
      ],
      "onEnter": [
        { "type": "setFlag", "flag": "shadow-essence" },
        { "type": "logEvent", "message": "Você absorveu a essência das sombras." }
      ],
      "choices": [
        { "id": "go-to-throne-room-after-victory", "text": "Seguir para o salão do trono", "target": "13" }
      ]
    },
    "12": {
      "id": "12",
      "title": "Fuga pela passagem secreta",
      "paragraphs": [
        "Você foge da Sombra Sussurrante, escapando por uma fresta na parede que revela uma passagem secreta e estreita. O caminho é sufocante, mas leva você para além das masmorras.",
        "Exausto, você emerge perto do salão do trono, sem o benefício que teria ganhado ao enfrentar a criatura."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -2 }],
      "choices": [
        { "id": "go-to-throne-room-after-flee", "text": "Seguir cautelosamente para o salão do trono", "target": "13" }
      ]
    },
    "13": {
      "id": "13",
      "title": "O salão do trono",
      "image": "/stories/fortaleza-das-sombras/salao-do-trono.png",
      "paragraphs": [
        "No centro de um salão imenso, sobre um trono esculpido em pedra negra, repousa o Senhor das Sombras — uma figura de escuridão pura, com olhos como brasas frias.",
        "Ele se ergue lentamente ao perceber sua presença. Você sente que esta será a batalha decisiva."
      ],
      "choices": [
        {
          "id": "strike-with-sword",
          "text": "Avançar e atacá-lo diretamente com a Espada Antiga",
          "target": "14",
          "conditions": [{ "type": "hasItem", "itemId": "ancient-sword" }],
          "lockedReason": "Você precisa de uma arma poderosa para enfrentá-lo diretamente."
        },
        {
          "id": "use-shadow-essence",
          "text": "Usar a essência das sombras para desestabilizá-lo antes do ataque",
          "target": "14b",
          "conditions": [{ "type": "flagActive", "flag": "shadow-essence" }],
          "lockedReason": "Você não absorveu nenhuma essência das sombras para usar contra ele."
        },
        {
          "id": "retreat-from-fortress",
          "text": "Recuar e abandonar a fortaleza enquanto ainda é possível",
          "target": "18"
        }
      ]
    },
    "14": {
      "id": "14",
      "title": "O confronto final",
      "paragraphs": [
        "Com a Espada Antiga em mãos, você avança contra o Senhor das Sombras. A lâmina brilha ao encontrar a escuridão que emana de seu corpo.",
        "A batalha final começa."
      ],
      "onEnter": [
        {
          "type": "startCombat",
          "enemyIds": ["senhor-das-sombras"],
          "onVictory": "17",
          "onDefeat": "16"
        }
      ],
      "choices": []
    },
    "14b": {
      "id": "14b",
      "title": "A essência contra a escuridão",
      "paragraphs": [
        "Você libera a essência das sombras que absorveu antes. Por um instante, o Senhor das Sombras vacila, sua forma tremeluzindo — sua própria essência sendo usada contra ele o enfraquece.",
        "Aproveitando a brecha, você avança para o ataque."
      ],
      "onEnter": [
        { "type": "modifyStat", "stat": "skill", "value": 2 },
        { "type": "logEvent", "message": "A essência das sombras enfraquece o Senhor das Sombras, aumentando sua Habilidade em combate." },
        {
          "type": "startCombat",
          "enemyIds": ["senhor-das-sombras"],
          "onVictory": "17",
          "onDefeat": "16"
        }
      ],
      "choices": []
    },
    "16": {
      "id": "16",
      "title": "As sombras te consomem",
      "paragraphs": [
        "Suas forças se esvaem e a escuridão da fortaleza finalmente o alcança. Sua jornada termina aqui, entre as pedras antigas da Fortaleza das Sombras.",
        "Talvez, em uma próxima tentativa, um caminho diferente leve a um destino melhor."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "defeat",
          "title": "Consumido pelas Sombras",
          "text": "Sua Energia chegou a zero. A Fortaleza das Sombras reivindica mais uma vítima para sua escuridão eterna."
        }
      ],
      "choices": []
    },
    "17": {
      "id": "17",
      "title": "A luz retorna à fortaleza",
      "paragraphs": [
        "O Senhor das Sombras se desfaz em cinzas com um último grito que ecoa pelas paredes de pedra. Lentamente, uma luz pálida começa a atravessar as frestas das janelas, como se a fortaleza despertasse de um longo pesadelo.",
        "Você deixa a Fortaleza das Sombras para trás, vitorioso, carregando histórias que poucos acreditariam."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "victory",
          "title": "A Fortaleza Liberta",
          "text": "Você derrotou o Senhor das Sombras e libertou a fortaleza de séculos de escuridão. Sua lenda começa aqui."
        }
      ],
      "choices": []
    },
    "18": {
      "id": "18",
      "title": "A retirada prudente",
      "paragraphs": [
        "Você decide que viver para lutar outro dia vale mais do que um confronto direto com o Senhor das Sombras. Recuando com cuidado, você deixa a fortaleza para trás, levando consigo o que encontrou pelo caminho.",
        "A Fortaleza das Sombras permanece de pé, seu mistério ainda intacto — talvez para uma futura jornada."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "neutral",
          "title": "Uma Retirada Prudente",
          "text": "Você escapou da fortaleza com vida, mas o Senhor das Sombras continua a espreitar em suas profundezas."
        }
      ],
      "choices": []
    }
  }
}
$demobook1$::jsonb,
  21,
  '20-30 minutos',
  now()
);

insert into public.books (owner_id, title, slug, short_description, description, cover_url, genre, status, visibility, content_data, estimated_sections, estimated_reading_time, published_at)
values (
  null,
  'O Véu de Vaelbrook',
  'veu-de-vaelbrook',
  'Uma pequena vila à beira do Vale de Ashmere sofre com desaparecimentos que os moradores atribuem a lobos. Mas sob as Colinas Cinzentas, algo muito mais antigo desperta lentamente de seu sono selado — ',
  'Uma pequena vila à beira do Vale de Ashmere sofre com desaparecimentos que os moradores atribuem a lobos. Mas sob as Colinas Cinzentas, algo muito mais antigo desperta lentamente de seu sono selado — e você acaba de chegar bem a tempo de descobrir o quanto o mundo ainda não sabe temer.',
  '/stories/veu-de-vaelbrook/cover.svg',
  'Fantasia sombria',
  'published',
  'public',
  $demobook2${
  "id": "veu-de-vaelbrook",
  "version": "0.1.0",
  "title": "O Véu de Vaelbrook",
  "author": "IA Narrativa",
  "description": "Uma pequena vila à beira do Vale de Ashmere sofre com desaparecimentos que os moradores atribuem a lobos. Mas sob as Colinas Cinzentas, algo muito mais antigo desperta lentamente de seu sono selado — e você acaba de chegar bem a tempo de descobrir o quanto o mundo ainda não sabe temer.",
  "genre": "Fantasia sombria",
  "estimatedDuration": "6-10 horas (obra em construção — Ato I disponível)",
  "cover": "/stories/veu-de-vaelbrook/cover.svg",
  "rulesText": "Vaelbrook é um vale isolado, e o caminho até o Baluarte da Aurora é mais longo e mais frio do que parece a princípio: provisões são preciosas e escassas. Gerencie bem seu descanso e sua alimentação — a exaustão prolongada pode ser tão perigosa quanto qualquer criatura que você encontrar pela frente.",
  "rules": {
    "useDefaultRules": true,
    "fatigueSystem": true,
    "provisions": true,
    "restSystem": true,
    "combatLuck": true
  },
  "startSection": "1",
  "characterCreation": {
    "skill": { "dice": 1, "sides": 6, "modifier": 6 },
    "stamina": { "dice": 2, "sides": 6, "modifier": 12 },
    "luck": { "dice": 1, "sides": 6, "modifier": 6 },
    "gold": 6,
    "provisions": 12
  },
  "items": [
    {
      "id": "tecido-rasgado-espantalho",
      "name": "Tecido Rasgado do Espantalho",
      "description": "Um pedaço de pano encontrado preso a um espantalho torto perto do rio. Está sujo de um pigmento escuro que não parece ser tinta comum, marcado com um símbolo entalhado a faca.",
      "kind": "misc",
      "discardable": true,
      "icon": "misc",
      "examineText": "Quanto mais você observa o símbolo — um olho fechado dentro de um círculo quebrado — mais tem certeza de já tê-lo visto em algum lugar, embora não consiga lembrar onde."
    },
    {
      "id": "amuleto-da-sorte-de-wren",
      "name": "Amuleto da Sorte de Wren",
      "description": "Um pequeno amuleto de osso e barbante que a garota Wren insistiu em lhe dar. Ainda cheira a pelo de gato. Segurá-lo antes de um momento decisivo parece acalmar os nervos.",
      "kind": "consumable",
      "consumable": true,
      "onUseEffects": [{ "stat": "luck", "value": 1 }],
      "icon": "gem"
    },
    {
      "id": "tocha",
      "name": "Tocha",
      "description": "Um facho de madeira envolto em pano oleado. Essencial para enxergar em passagens onde nenhuma luz natural alcança.",
      "kind": "misc",
      "discardable": true,
      "icon": "misc"
    },
    {
      "id": "pequena-pocao-de-cura",
      "name": "Pequena Poção de Cura",
      "description": "Um frasco selado com cera, contendo um líquido âmbar de cheiro adocicado. Restaura parte de suas forças.",
      "kind": "consumable",
      "consumable": true,
      "onUseEffects": [{ "stat": "stamina", "value": 4 }],
      "icon": "potion"
    },
    {
      "id": "escudo-de-couro",
      "name": "Escudo de Couro",
      "description": "Um escudo redondo, reforçado com tachas de ferro. Simples, mas confiável.",
      "kind": "armor",
      "defenseBonus": 1,
      "icon": "shield"
    },
    {
      "id": "adaga-enferrujada",
      "name": "Adaga Enferrujada",
      "description": "Uma lâmina curta, gasta pelo uso, mas ainda capaz de abrir uma ferida séria se bem manejada.",
      "kind": "weapon",
      "damageBonus": 1,
      "icon": "sword"
    },
    {
      "id": "fragmento-manto-culto",
      "name": "Fragmento de Manto Cultista",
      "description": "Um retalho de tecido cinza-acinzentado, bordado com o mesmo símbolo entalhado que você viu perto do rio: um olho fechado dentro de um círculo quebrado.",
      "kind": "misc",
      "discardable": true,
      "icon": "misc",
      "examineText": "A costura é precisa demais para ter sido feita às pressas. Quem quer que tenha vestido isso pertencia a algo organizado — não a um bando qualquer de saqueadores."
    },
    {
      "id": "capa-sombria",
      "name": "Capa Sombria",
      "description": "Uma capa de tecido negro e leve, encontrada num nicho escondido de uma caverna. Parece absorver a luz das tochas ao seu redor, tornando seus passos mais difíceis de notar.",
      "kind": "armor",
      "defenseBonus": 1,
      "icon": "misc"
    },
    {
      "id": "medalha-do-irmao-de-bram",
      "name": "Medalha do Irmão de Bram",
      "description": "Uma medalha de latão amassada, gravada com um martelo e uma bigorna — o símbolo da guilda dos ferreiros de Vaelbrook. Pertencia a alguém que não voltou para casa.",
      "kind": "misc",
      "discardable": false,
      "icon": "misc",
      "examineText": "No verso, alguém gravou duas iniciais com a ponta de uma faca: 'D.F.'. Bram vai querer saber disso."
    },
    {
      "id": "pagina-rasgada-do-veu",
      "name": "Página Rasgada do Véu",
      "description": "Uma folha de pergaminho arrancada de algum livro maior, coberta por uma caligrafia apertada e nervosa. Um nome se repete várias vezes, sublinhado com força: Vharok. Menciona também 'três selos' que precisam ser mantidos intactos.",
      "kind": "misc",
      "discardable": false,
      "icon": "book",
      "examineText": "No canto da página, quase ilegível: '...quando o Véu cair, ele há de lembrar seu próprio nome, e então nenhum selo bastará.'"
    },
    {
      "id": "moeda-antiga-selo",
      "name": "Moeda Antiga com o Símbolo do Selo",
      "description": "Uma moeda de metal enegrecido, cunhada com um símbolo que você nunca viu em nenhuma casa de câmbio: três anéis entrelaçados ao redor de um olho fechado.",
      "kind": "misc",
      "discardable": true,
      "icon": "gem"
    },
    {
      "id": "cristal-luminoso",
      "name": "Cristal Luminoso",
      "description": "Um pequeno cristal que emite um brilho azulado e frio, mesmo em completa escuridão. Encontrado atrás de um altar esquecido. Parece antigo demais para ter sido lapidado por mãos humanas.",
      "kind": "misc",
      "discardable": true,
      "icon": "gem"
    },
    {
      "id": "presa-de-vosk",
      "name": "Presa de Vosk",
      "description": "Uma presa enorme, ainda manchada por veios cinzentos que pulsam fracamente mesmo separada do corpo. Um troféu sombrio — e talvez um aviso do que ainda está por vir.",
      "kind": "misc",
      "discardable": true,
      "icon": "misc"
    },
    {
      "id": "capa-forrada-de-viagem",
      "name": "Capa Forrada de Viagem",
      "description": "Uma capa grossa, forrada de pele de carneiro, feita para longas jornadas pelo frio das montanhas.",
      "kind": "armor",
      "defenseBonus": 1,
      "icon": "shield"
    },
    {
      "id": "espada-do-guardiao",
      "name": "Espada do Guardião",
      "description": "Uma lâmina longa e bem equilibrada, gravada com o brasão da Ordem da Aurora. Mesmo enferrujada em partes, corta melhor do que qualquer coisa que você carregava até agora.",
      "kind": "weapon",
      "damageBonus": 2,
      "icon": "sword",
      "examineText": "Perto da guarda, alguém gravou um nome que o tempo quase apagou: apenas as letras '...RIN' resistem."
    },
    {
      "id": "escudo-da-ordem",
      "name": "Escudo da Ordem",
      "description": "Um escudo de aço reforçado, ainda ostentando os restos de uma pintura heráldica: um sol nascendo sobre um círculo quebrado.",
      "kind": "armor",
      "defenseBonus": 2,
      "icon": "shield"
    },
    {
      "id": "chave-do-portao-lateral",
      "name": "Chave do Portão Lateral",
      "description": "Uma chave pesada, de ferro batido, encontrada perto de um fosso seco no Baluarte da Aurora.",
      "kind": "key",
      "discardable": false,
      "icon": "key"
    },
    {
      "id": "brasao-da-ordem-da-aurora",
      "name": "Brasão da Ordem da Aurora",
      "description": "Um medalhão de bronze escurecido, com o símbolo de um sol nascendo sobre um círculo quebrado.",
      "kind": "misc",
      "discardable": true,
      "icon": "gem",
      "examineText": "No verso, uma inscrição quase apagada: 'Enquanto o círculo se mantiver quebrado apenas por nós, o que dorme continuará a dormir.'"
    },
    {
      "id": "diario-de-sor-halgrim",
      "name": "Diário de Sor Halgrim",
      "description": "Um pequeno caderno de couro, as páginas finais escritas às pressas, a letra cada vez mais trêmula.",
      "kind": "misc",
      "discardable": true,
      "icon": "book",
      "examineText": "A última entrada legível diz: 'Somos os últimos. Se este caderno for lido por outros olhos, que saibam: os Três Selos não prendem o Devorador — apenas o mantêm esquecido de si mesmo.'"
    },
    {
      "id": "elixir-do-guardiao",
      "name": "Elixir do Guardião",
      "description": "Um frasco de vidro grosso, contendo um líquido dourado que ainda brilha de leve, mesmo depois de todos esses anos.",
      "kind": "consumable",
      "consumable": true,
      "onUseEffects": [{ "stat": "stamina", "value": 6 }],
      "icon": "potion"
    },
    {
      "id": "selo-de-ferro",
      "name": "Selo de Ferro",
      "description": "Um pesado disco de ferro negro, gravado com símbolos que doem de se olhar por tempo demais. Um dos Três Selos.",
      "kind": "misc",
      "discardable": false,
      "icon": "gem",
      "examineText": "Ao segurá-lo, você sente — por um instante breve e nauseante — como se algo, muito longe e muito fundo, tivesse notado sua presença."
    },
    {
      "id": "moeda-de-prata-antiga",
      "name": "Moeda de Prata Antiga",
      "description": "Uma moeda de prata, cunhada com a face de um rei que nenhum reino atual reivindica.",
      "kind": "misc",
      "discardable": true,
      "icon": "gem"
    },
    {
      "id": "pergaminho-dos-tres-selos",
      "name": "Pergaminho dos Três Selos",
      "description": "Um mapa desenhado à mão, marcando três pontos no Vale de Ashmere e nas terras ao redor: as Colinas Cinzentas, um templo gelado nas Montanhas Grimwold, e um santuário afundado no Pântano de Murkfen.",
      "kind": "misc",
      "discardable": true,
      "icon": "book",
      "examineText": "Uma nota na margem, com outra caligrafia: 'Um selo cada um. Nunca todos ao mesmo tempo — é assim que se protege o segredo, e é assim que se protege a si mesmo.'"
    }
  ],
  "enemies": [
    {
      "id": "lobo-comum",
      "name": "Lobo Comum",
      "skill": 5,
      "stamina": 6,
      "description": "Um lobo cinzento, magro e faminto, com os olhos fixos em você desde a beira da trilha.",
      "defeatText": "O lobo desaba na relva, imóvel, e o silêncio da floresta volta a se fechar ao seu redor.",
      "points": 5
    },
    {
      "id": "aranha-da-caverna",
      "name": "Aranha da Caverna",
      "skill": 6,
      "stamina": 7,
      "description": "Uma aranha do tamanho de um cão pequeno, de patas longas e carapaça reluzente, guardando seu ninho entre as pedras.",
      "defeatText": "A aranha se enrosca sobre si mesma e para de se mover, suas patas longas finalmente quietas.",
      "points": 8,
      "lootItemId": "cristal-luminoso",
      "lootChancePercent": 25
    },
    {
      "id": "batedor-do-veu",
      "name": "Batedor do Véu",
      "skill": 6,
      "stamina": 8,
      "description": "Um homem magro em vestes cinzentas, rosto coberto por um capuz costurado com símbolos. Ataca com uma foice curta e movimentos estranhamente calmos, quase ensaiados.",
      "defeatText": "O batedor cai de joelhos, murmurando algo em uma língua que você não reconhece, antes de desabar por completo.",
      "points": 10,
      "lootItemId": "moeda-antiga-selo",
      "lootChancePercent": 50
    },
    {
      "id": "vosk-alcaide-do-veu",
      "name": "Vosk, Alcaide da Alcateia do Véu",
      "skill": 9,
      "stamina": 14,
      "description": "Antes, talvez, um lobo comum — agora uma criatura maior que qualquer cavalo, de pelagem negra manchada por veios cinzentos que pulsam como veias vivas. Seus olhos não têm brilho de animal algum.",
      "defeatText": "Vosk solta um uivo que não soa como nenhum lobo deveria soar — parte animal, parte algo mais antigo — antes de desmoronar em um monte de pelos e cinzas escuras.",
      "points": 25,
      "lootItemId": "presa-de-vosk",
      "lootChancePercent": 60
    },
    {
      "id": "bandido-da-estrada",
      "name": "Bandido da Estrada",
      "skill": 6,
      "stamina": 7,
      "description": "Um homem maltrapilho, faca em punho, com os olhos de quem já não tem muito a perder.",
      "defeatText": "O bandido recua, largando a faca, e desaparece entre as árvores mancando.",
      "points": 6,
      "lootItemId": "moeda-de-prata-antiga",
      "lootChancePercent": 30
    },
    {
      "id": "cultista-do-veu",
      "name": "Cultista do Véu",
      "skill": 6,
      "stamina": 7,
      "description": "Uma figura envolta em vestes cinzentas, murmurando algo em voz baixa e constante, quase como uma cantilena.",
      "defeatText": "O cultista cai em silêncio, a cantilena finalmente interrompida.",
      "points": 9
    },
    {
      "id": "espectro-da-cripta",
      "name": "Espectro da Cripta",
      "skill": 7,
      "stamina": 8,
      "description": "Uma forma humanoide semitransparente, vestida com a armadura desbotada de um Guardião havia muito morto, ainda cumprindo uma ronda que ninguém mais lembra.",
      "defeatText": "O espectro se desfaz num suspiro longo, quase aliviado, como se finalmente pudesse descansar.",
      "points": 10
    },
    {
      "id": "cavaleiro-amaldicoado",
      "name": "Cavaleiro Amaldiçoado",
      "skill": 10,
      "stamina": 16,
      "description": "Uma armadura completa, ainda ocupada por algo que já não é bem um homem, empunhando uma espada longa demais para qualquer braço humano balançar com tanta facilidade.",
      "defeatText": "A armadura desmorona peça por peça, e por um instante — só um instante — você jura ver um rosto exausto e grato antes de tudo virar poeira.",
      "points": 30
    }
  ],
  "sections": {
    "1": {
      "id": "1",
      "title": "O Vale de Ashmere",
      "paragraphs": [
        "A estrada desce entre colinas cobertas de urze até o vale, e é ali, do alto do último morro, que você avista Vaelbrook pela primeira vez: um punhado de telhados de ardósia agrupados junto a um rio prateado, fumaça subindo preguiçosa das chaminés na tarde fria.",
        "É um lugar pequeno, do tipo que os mapas mal se dão ao trabalho de nomear. Mas depois de semanas na estrada, qualquer teto e qualquer fogo parecem uma promessa e tanto.",
        "A trilha se divide diante de você. Um caminho segue a estrada principal, larga e batida, que entra na vila pela praça. O outro corta por uma margem baixa do rio, mais rápido, passando perto de um velho campo de cultivo."
      ],
      "choices": [
        { "id": "estrada-principal", "text": "Seguir pela estrada principal até a vila", "target": "2" },
        { "id": "margem-do-rio", "text": "Cortar caminho pela margem do rio", "target": "3" }
      ]
    },
    "2": {
      "id": "2",
      "title": "A estrada batida",
      "paragraphs": [
        "A estrada é tranquila, ladeada por cercas de pedra baixa e ovelhas que mal levantam a cabeça quando você passa. Ao longe, um sino toca — hora do meio-dia, talvez, ou apenas alguém anunciando que o ferreiro está aberto.",
        "Nada de estranho aqui. Só o tipo comum de paz que faz um viajante baixar a guarda um pouco cedo demais."
      ],
      "choices": [
        { "id": "entrar-na-vila", "text": "Entrar em Vaelbrook", "target": "5" }
      ]
    },
    "3": {
      "id": "3",
      "title": "O campo abandonado",
      "paragraphs": [
        "O atalho corta por um campo que já foi cultivado e agora cresce só de ervas daninhas. No meio dele, um espantalho torto ainda vigia uma colheita que não existe mais, seus braços de madeira estendidos como se abraçassem o vazio.",
        "Ao se aproximar, você percebe um pedaço de tecido preso a um dos braços, batendo devagar no vento. Não parece ter sido colocado ali por acaso — está amarrado com cuidado, e sujo de um pigmento escuro entalhado num padrão que se repete: um olho fechado dentro de um círculo quebrado.",
        "Você guarda o tecido antes de seguir para a vila, sem saber ainda se encontrou uma pista ou apenas a bobagem de alguma criança do lugar."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "tecido-rasgado-espantalho" },
        { "type": "logEvent", "message": "Você encontrou um tecido marcado com um símbolo estranho, preso a um espantalho." }
      ],
      "choices": [
        { "id": "entrar-na-vila-pelo-campo", "text": "Entrar em Vaelbrook", "target": "5" }
      ]
    },
    "5": {
      "id": "5",
      "title": "A praça de Vaelbrook",
      "canRepeat": true,
      "paragraphs": [
        "A praça de Vaelbrook é pequena, dominada por um poço de pedra no centro e um carvalho velho o bastante para ter visto gerações passarem sob seus galhos. Moradores cruzam o espaço sem pressa, mas você nota algo no jeito como falam baixo, em grupos fechados, olhando por cima do ombro.",
        "Ao redor da praça: a taverna 'O Barril Cinzento', de onde vem cheiro de pão e cerveja; a casa maior do ancião Aldric Vaen, com uma bandeira desbotada na porta; a ferraria de Bram, cujo martelo você já ouve batendo em ritmo constante; e, mais adiante, o caminho que leva a uma capela em ruínas nos arredores.",
        "Um guarda da vila, Corin, observa você da entrada com os braços cruzados — o tipo de olhar reservado para forasteiros."
      ],
      "choices": [
        { "id": "ir-taverna", "text": "Entrar na taverna 'O Barril Cinzento'", "target": "6" },
        { "id": "ir-aldric", "text": "Procurar o ancião Aldric Vaen", "target": "10" },
        { "id": "ir-ferraria", "text": "Visitar a ferraria de Bram", "target": "14" },
        { "id": "ir-capela", "text": "Seguir até a capela em ruínas", "target": "17" },
        { "id": "falar-corin", "text": "Falar com o guarda Corin", "target": "18" },
        {
          "id": "ir-floresta",
          "text": "Deixar a vila e seguir para a Floresta de Nevarwood",
          "target": "20",
          "conditions": [{ "type": "flagActive", "flag": "aceitou-missao" }],
          "lockedReason": "Talvez seja melhor conversar com alguém da vila antes de se aventurar floresta adentro sozinho."
        }
      ]
    },
    "6": {
      "id": "6",
      "title": "O Barril Cinzento",
      "canRepeat": true,
      "allowRest": true,
      "allowEat": true,
      "paragraphs": [
        "Dentro da taverna, o calor da lareira e o burburinho de vozes contrastam com o silêncio desconfiado da praça. Atrás do balcão, uma mulher de meia-idade com os braços cobertos de farinha te avalia com um sorriso torto — Mira Talbot, dona do lugar, segundo o letreiro pendurado sobre a porta.",
        "Num canto, uma garota pequena está sentada sozinha, encolhida, com os olhos vermelhos de choro."
      ],
      "choices": [
        { "id": "ouvir-rumores", "text": "Puxar conversa e ouvir os rumores da vila", "target": "7" },
        {
          "id": "notar-wren",
          "text": "Aproximar-se da garota que está chorando",
          "target": "8",
          "conditions": [{ "type": "flagInactive", "flag": "salvou-gato-wren" }],
          "lockedReason": "Wren já está tranquila agora que o Sombra foi encontrado."
        },
        {
          "id": "impressionar-mira",
          "text": "Contar uma história de bravura para impressionar Mira",
          "target": "7b",
          "conditions": [{ "type": "statGreater", "stat": "skill", "value": 8 }],
          "lockedReason": "Você não parece experiente o bastante para que uma história sua soe convincente."
        },
        { "id": "voltar-praca-taverna", "text": "Voltar para a praça", "target": "5" }
      ]
    },
    "7": {
      "id": "7",
      "title": "Rumores ao balcão",
      "canRepeat": true,
      "paragraphs": [
        "Mira baixa a voz, apesar de a taverna estar quase vazia. 'Três já sumiram esse mês', diz ela, limpando um copo que já está limpo. 'Dois pastores e a filha do moleiro. Todo mundo diz que são os lobos que desceram das Colinas Cinzentas, famintos com o inverno chegando.'",
        "Ela hesita antes de completar. 'Mas lobo não arranca porta de gonzo, e lobo não deixa aquele cheiro de coisa queimada onde passa. Fale isso com o ancião Aldric, se for te importar com o assunto — ele sabe mais do que conta.'"
      ],
      "onEnter": [{ "type": "setFlag", "flag": "ouviu-rumores-mira" }],
      "choices": [{ "id": "voltar-praca-rumores", "text": "Voltar para a praça", "target": "5" }]
    },
    "7b": {
      "id": "7b",
      "title": "Uma plateia difícil",
      "canRepeat": true,
      "paragraphs": [
        "Você conta sua história — a lâmina, a escuridão, a criatura que quase o pegou — e, para sua surpresa, Mira realmente escuta, os braços cruzados, cética a princípio.",
        "No fim, ela solta uma risada curta e serve uma caneca sem cobrar. 'Se metade disso for verdade, você vai precisar de mais do que sorte por aqui. Cuidado com as Colinas Cinzentas à noite — e com o que anda dizendo ter visto um homem de capuz cinza perto delas.'"
      ],
      "onEnter": [
        { "type": "setFlag", "flag": "impressionou-mira" },
        { "type": "logEvent", "message": "Mira mencionou um homem de capuz cinza perto das Colinas Cinzentas." }
      ],
      "choices": [{ "id": "voltar-praca-impressao", "text": "Voltar para a praça", "target": "5" }]
    },
    "8": {
      "id": "8",
      "title": "Wren",
      "paragraphs": [
        "De perto, a garota não deve ter mais que oito ou nove anos. Ela limpa o rosto às pressas ao notar que você se aproximou, tentando parecer mais forte do que está.",
        "'É o Sombra', ela diz, referindo-se, você entende aos poucos, a um gato. 'Ele fugiu quando os cachorros latiram perto do poço velho, nos fundos da vila. Ninguém quer ir atrás dele porque dizem que lá é perigoso à noite. Mas agora nem é noite ainda...'"
      ],
      "choices": [
        { "id": "ajudar-wren", "text": "Oferecer-se para procurar o gato", "target": "9" },
        { "id": "ignorar-wren", "text": "Dizer que não pode ajudar agora", "target": "5" }
      ]
    },
    "9": {
      "id": "9",
      "title": "O poço velho",
      "paragraphs": [
        "O poço fica nos fundos da vila, cercado de mato alto e pedras soltas. Você ouve um miado fraco vindo de algum lugar entre as pedras da base, mas a abertura é estreita e a luz não alcança muito fundo.",
        "Vai exigir um pouco de sorte para alcançar o gato sem se machucar nas pedras soltas."
      ],
      "onEnter": [
        { "type": "startTest", "testType": "luck", "onSuccess": "9s", "onFailure": "9f" }
      ],
      "choices": []
    },
    "9s": {
      "id": "9s",
      "title": "Sombra encontrado",
      "paragraphs": [
        "Suas mãos encontram o gato antes de suas pernas encontrarem uma pedra solta, e você o resgata sem um único arranhão. De volta à taverna, Wren abraça o bichano com tanta força que ele mia em protesto — e depois insiste, contra os protestos do animal, em lhe entregar um pequeno amuleto que fez ela mesma.",
        "'Para dar sorte', ela diz, séria como só uma criança sabe ser. 'Minha avó dizia que funcionava.'"
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "amuleto-da-sorte-de-wren" },
        { "type": "setFlag", "flag": "salvou-gato-wren" },
        { "type": "logEvent", "message": "Você resgatou o gato de Wren e recebeu um amuleto da sorte." }
      ],
      "choices": [{ "id": "voltar-praca-gato-sucesso", "text": "Voltar para a praça", "target": "5" }]
    },
    "9f": {
      "id": "9f",
      "title": "Um resgate difícil",
      "paragraphs": [
        "Uma pedra cede sob seu peso e você raspa o braço com força contra a pedra do poço antes de finalmente alcançar o gato, arisco e assustado. Ainda assim, você o entrega inteiro a Wren, que mal nota o sangue no seu braço de tão aliviada.",
        "'Para dar sorte', ela insiste, empurrando um pequeno amuleto em suas mãos machucadas, ignorando seus protestos educados."
      ],
      "onEnter": [
        { "type": "modifyStat", "stat": "stamina", "value": -2 },
        { "type": "addItem", "itemId": "amuleto-da-sorte-de-wren" },
        { "type": "setFlag", "flag": "salvou-gato-wren" }
      ],
      "choices": [{ "id": "voltar-praca-gato-falha", "text": "Voltar para a praça, ferido", "target": "5" }]
    },
    "10": {
      "id": "10",
      "title": "A casa do ancião",
      "paragraphs": [
        "Aldric Vaen é um homem magro de barba branca bem aparada, os olhos claros e cansados de quem dorme pouco há semanas. Ele o recebe sem surpresa, como se já esperasse que algum forasteiro cruzasse sua porta mais cedo ou mais tarde.",
        "'Três desaparecidos em um mês', ele diz, sem rodeios. 'Todos perto das Colinas Cinzentas, a leste. Os moradores preferem acreditar em lobos — é mais fácil de aceitar do que a outra possibilidade.' Ele hesita. 'Eu preferiria não dizer qual.'",
        "Ele olha para você com uma mistura de esperança e culpa por ter essa esperança. 'Um forasteiro armado que investigue por nós vale mais que qualquer patrulha que possamos reunir.'"
      ],
      "choices": [
        { "id": "perguntar-floresta", "text": "Perguntar sobre a Floresta de Nevarwood", "target": "11" },
        { "id": "perguntar-colinas", "text": "Perguntar sobre as Colinas Cinzentas", "target": "12" },
        {
          "id": "perguntar-capela",
          "text": "Perguntar se a capela em ruínas tem alguma relação com isso",
          "target": "13",
          "conditions": [{ "type": "sectionVisited", "sectionId": "17" }],
          "lockedReason": "Talvez seja algo para perguntar depois de conhecer melhor a vila."
        },
        {
          "id": "aceitar-missao",
          "text": "Aceitar investigar os desaparecimentos",
          "target": "5",
          "actions": [
            { "type": "setFlag", "flag": "aceitou-missao" },
            { "type": "logEvent", "message": "Você aceitou investigar os desaparecimentos em Vaelbrook." }
          ]
        },
        {
          "id": "recusar-missao",
          "text": "Recusar e seguir viagem, deixando o vale para trás",
          "target": "10n",
          "conditions": [{ "type": "flagInactive", "flag": "aceitou-missao" }],
          "lockedReason": "Você já se comprometeu a investigar. Não é mais hora de recuar."
        },
        { "id": "voltar-praca-aldric", "text": "Agradecer e voltar à praça", "target": "5" }
      ]
    },
    "11": {
      "id": "11",
      "title": "Sobre Nevarwood",
      "paragraphs": [
        "'A floresta sempre teve má fama', diz Aldric. 'Terra ruim, dizem os mais velhos — mas ruim de um jeito que ninguém sabe explicar direito. Os caçadores evitam se afastar da trilha principal. Ultimamente, evitam a floresta inteira.'",
        "Ele aponta vagamente para leste. 'É por lá que os desaparecimentos começaram. A trilha principal leva até o sopé das Colinas Cinzentas, se você seguir fundo o bastante.'"
      ],
      "choices": [{ "id": "voltar-aldric-floresta", "text": "Continuar a conversa", "target": "10" }]
    },
    "12": {
      "id": "12",
      "title": "Sobre as Colinas Cinzentas",
      "paragraphs": [
        "'Colinas velhas, ocas por dentro como um dente podre', diz Aldric, e há um peso na voz dele que não estava lá antes. 'Há entradas de cavernas espalhadas por elas — algumas conhecidas, outras não. Meu avô dizia que os antigos seguravam algo lá embaixo. Sempre achei que fosse história para assustar criança.'",
        "Ele não completa o pensamento, mas você percebe que, ultimamente, ele não tem mais tanta certeza disso."
      ],
      "choices": [{ "id": "voltar-aldric-colinas", "text": "Continuar a conversa", "target": "10" }]
    },
    "13": {
      "id": "13",
      "title": "Sobre a capela",
      "paragraphs": [
        "Aldric parece surpreso que você tenha ido até lá. 'A Irmã Yseult cuida daquele lugar sozinha há anos. Antigamente, dizem, aquela capela pertencia a uma ordem muito mais antiga — os Guardiões da Aurora. Protetores de alguma coisa, embora ninguém em Vaelbrook lembre mais do quê.'",
        "'Se ela confiou em você o bastante para mostrar algo daquele lugar, preste atenção. Yseult não é de exagerar.'"
      ],
      "choices": [{ "id": "voltar-aldric-capela", "text": "Continuar a conversa", "target": "10" }]
    },
    "10n": {
      "id": "10n",
      "title": "A estrada segue adiante",
      "paragraphs": [
        "Você agradece a Aldric, mas nega com a cabeça. Não é sua briga, não é seu vale, e o mundo é grande demais para se prender aos problemas de todo lugarejo pequeno que você atravessa.",
        "Aldric não insiste. Ele apenas assente, devagar, com os ombros um pouco mais curvados do que antes de você entrar. Você deixa Vaelbrook para trás na manhã seguinte, e o vale logo desaparece atrás das colinas, junto com qualquer resposta sobre o que realmente ronda aquela terra.",
        "Meses depois, numa taverna a muitas léguas dali, você ouvirá um viajante mencionar, de passagem, que um vilarejo chamado Vaelbrook foi encontrado vazio — silencioso, portas abertas, sem sinal de luta e sem sinal de gente. Você vai se perguntar, só por um instante, se poderia ter mudado alguma coisa."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "neutral",
          "title": "A Briga de Outra Pessoa",
          "text": "Você escolheu não se envolver. Talvez tenha sido sábio. Talvez não. O Vale de Ashmere guardará seu segredo sem você — e você nunca saberá ao certo o que deixou para trás."
        }
      ],
      "choices": []
    },
    "14": {
      "id": "14",
      "title": "A ferraria de Bram",
      "canRepeat": true,
      "paragraphs": [
        "O calor da forja atinge você antes mesmo de entrar. Bram é um homem largo de ombros, o rosto marcado por fuligem e por algo mais fundo que cansaço. Ele para de martelar só o suficiente para avaliar seu equipamento com olhos de profissional.",
        "'Forasteiro armado. Bom — ultimamente é raro ver gente disposta a se armar por aqui, só disposta a trancar a porta mais cedo.'"
      ],
      "choices": [
        { "id": "comprar-equipamento", "text": "Perguntar se ele tem algo à venda", "target": "15" },
        { "id": "perguntar-irmao", "text": "Perguntar sobre o clima pesado na vila", "target": "16" },
        { "id": "voltar-praca-ferraria", "text": "Voltar para a praça", "target": "5" }
      ]
    },
    "15": {
      "id": "15",
      "title": "O balcão de Bram",
      "canRepeat": true,
      "paragraphs": [
        "Bram estende sobre o balcão o que tem de sobra: uma adaga simples, um escudo de couro reforçado, e frascos de uma poção que ele garante ser 'a receita da minha falecida mãe, funciona mesmo'.",
        "'Preço justo, sem enrolação', ele diz, cruzando os braços enquanto espera você decidir."
      ],
      "choices": [
        {
          "id": "comprar-adaga",
          "text": "Comprar a Adaga Enferrujada (3 de ouro)",
          "target": "15",
          "conditions": [
            { "type": "minGold", "value": 3 },
            { "type": "notHasItem", "itemId": "adaga-enferrujada" }
          ],
          "lockedReason": "Você não tem ouro suficiente, ou já possui uma arma dessas.",
          "actions": [
            { "type": "removeGold", "value": 3 },
            { "type": "addItem", "itemId": "adaga-enferrujada" }
          ]
        },
        {
          "id": "comprar-escudo",
          "text": "Comprar o Escudo de Couro (3 de ouro)",
          "target": "15",
          "conditions": [
            { "type": "minGold", "value": 3 },
            { "type": "notHasItem", "itemId": "escudo-de-couro" }
          ],
          "lockedReason": "Você não tem ouro suficiente, ou já possui um escudo desses.",
          "actions": [
            { "type": "removeGold", "value": 3 },
            { "type": "addItem", "itemId": "escudo-de-couro" }
          ]
        },
        {
          "id": "comprar-pocao",
          "text": "Comprar uma Pequena Poção de Cura (2 de ouro)",
          "target": "15",
          "conditions": [{ "type": "minGold", "value": 2 }],
          "lockedReason": "Você não tem ouro suficiente.",
          "actions": [
            { "type": "removeGold", "value": 2 },
            { "type": "addItem", "itemId": "pequena-pocao-de-cura" }
          ]
        },
        {
          "id": "comprar-tocha",
          "text": "Comprar uma Tocha (1 de ouro)",
          "target": "15",
          "conditions": [{ "type": "minGold", "value": 1 }],
          "lockedReason": "Você não tem ouro suficiente.",
          "actions": [
            { "type": "removeGold", "value": 1 },
            { "type": "addItem", "itemId": "tocha" }
          ]
        },
        { "id": "sair-da-loja", "text": "Agradecer e sair", "target": "14" }
      ]
    },
    "16": {
      "id": "16",
      "title": "O irmão de Bram",
      "paragraphs": [
        "O martelo para. Bram encara a bigorna por um instante longo demais antes de responder. 'Meu irmão, Darrek, foi caçar perto das Colinas Cinzentas há três semanas. Disse que ia voltar antes do anoitecer.'",
        "'Ninguém foi atrás dele. Todo mundo aqui está ocupado demais com medo para se importar com um homem só.' Ele volta ao trabalho, martelando com mais força do que o necessário. 'Se você for para os lados de lá, e encontrar qualquer coisa dele, eu ficaria... eu gostaria de saber.'"
      ],
      "onEnter": [{ "type": "setFlag", "flag": "procura-irmao-bram" }],
      "choices": [{ "id": "voltar-ferraria-irmao", "text": "Voltar para a ferraria", "target": "14" }]
    },
    "17": {
      "id": "17",
      "title": "A capela em ruínas",
      "canRepeat": true,
      "paragraphs": [
        "O telhado da capela cedeu em dois pontos, deixando a luz da tarde cair em feixes poeirentos sobre bancos apodrecidos. No altar, uma mulher idosa em hábito cinza acende uma vela solitária, movendo-se com a calma de quem já fez esse gesto milhares de vezes.",
        "Ela se vira antes mesmo de você anunciar sua presença. 'Poucos ainda sobem até aqui', diz a Irmã Yseult, sem hostilidade. 'Fico feliz quando alguém o faz.'"
      ],
      "choices": [
        { "id": "conversar-yseult", "text": "Conversar com a Irmã Yseult", "target": "17b" },
        {
          "id": "examinar-altar",
          "text": "Examinar o altar com cuidado",
          "target": "17a",
          "conditions": [{ "type": "flagInactive", "flag": "descobriu-passagem-capela" }],
          "lockedReason": "Você já vasculhou este altar com cuidado."
        },
        { "id": "voltar-praca-capela", "text": "Voltar para a praça", "target": "5" }
      ]
    },
    "17a": {
      "id": "17a",
      "title": "Sob a poeira do altar",
      "paragraphs": [
        "Você passa os dedos pelas bordas do altar, sentindo entalhes que a poeira de décadas quase apagou. Há algo ali — uma reentrância rasa demais para ser acidental. Vai exigir sorte para encontrar o mecanismo antes que a Irmã Yseult note o que você está fazendo."
      ],
      "onEnter": [
        { "type": "startTest", "testType": "luck", "onSuccess": "17s", "onFailure": "17f" }
      ],
      "choices": []
    },
    "17s": {
      "id": "17s",
      "title": "A passagem escondida",
      "paragraphs": [
        "Seus dedos encontram um pequeno entalhe recuado, e uma placa de pedra desliza silenciosamente para revelar um nicho estreito atrás do altar. Dentro dele, um cristal de brilho azulado repousa sobre um pedaço de tecido apodrecido, como se tivesse sido escondido ali por alguém com pressa.",
        "Você guarda o cristal antes que a Irmã Yseult se aproxime, curiosa com o barulho de pedra contra pedra. Ela não parece surpresa — apenas cansada, como alguém que esperava que esse dia chegasse."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "cristal-luminoso" },
        { "type": "setFlag", "flag": "descobriu-passagem-capela" },
        { "type": "logEvent", "message": "Você encontrou uma passagem secreta atrás do altar da capela, e um cristal luminoso dentro dela." }
      ],
      "choices": [{ "id": "voltar-capela-secreto", "text": "Guardar o achado e continuar conversando", "target": "17" }]
    },
    "17f": {
      "id": "17f",
      "title": "Um sobressalto na escuridão",
      "paragraphs": [
        "Seus dedos escorregam, e algo — um morcego, você espera que seja só um morcego — sai voando de dentro de uma fresta na pedra com um guincho agudo. Você recua, o coração disparado, sem encontrar nada além de pó e teias.",
        "A Irmã Yseult observa em silêncio, com uma expressão que você não sabe decifrar."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -1 }],
      "choices": [{ "id": "voltar-capela-falha", "text": "Recompor-se e continuar conversando", "target": "17" }]
    },
    "17b": {
      "id": "17b",
      "title": "A Irmã Yseult",
      "paragraphs": [
        "'Esta capela pertenceu, muito antes de mim, a uma ordem chamada os Guardiões da Aurora', diz Yseult, os olhos fixos na chama da vela. 'Eles tinham uma fortaleza nas montanhas, ao norte daqui. O Baluarte da Aurora, dizem os textos antigos que restaram.'",
        "'Ninguém sabe ao certo o que eles guardavam, ou por que a Ordem desapareceu. Mas ultimamente...' ela hesita, ajeitando o hábito com mãos que tremem de leve. 'Ultimamente eu tenho rezado mais do que o costume. E menos por hábito, e mais por medo.'"
      ],
      "choices": [{ "id": "voltar-capela-conversa", "text": "Agradecer e voltar a conversar", "target": "17" }]
    },
    "18": {
      "id": "18",
      "title": "O guarda Corin",
      "canRepeat": true,
      "paragraphs": [
        "Corin não desfaz os braços cruzados quando você se aproxima. É um homem jovem para o peso que carrega nos ombros — a única guarda de verdade que Vaelbrook parece ter.",
        "'Forasteiro armado numa vila com gente sumindo', ele diz, sem rodeios. 'Normalmente eu me preocuparia com você. Hoje em dia, tenho coisa pior com que me preocupar. Se for para os lados das Colinas Cinzentas, não vá sozinho à noite. Isso é tudo que tenho para dizer.'"
      ],
      "choices": [{ "id": "voltar-praca-corin", "text": "Agradecer e voltar para a praça", "target": "5" }]
    },
    "20": {
      "id": "20",
      "title": "A entrada de Nevarwood",
      "paragraphs": [
        "A floresta começa de forma abrupta, como se uma linha tivesse sido traçada no chão: de um lado, os campos abertos do vale; do outro, uma escuridão verde-acinzentada que engole a luz da tarde mais rápido do que deveria.",
        "Uma trilha estreita segue floresta adentro, marcada por décadas de uso. Perto da entrada, riscos profundos cortam o tronco de uma árvore — largos demais para serem de qualquer lobo comum."
      ],
      "choices": [
        { "id": "seguir-trilha", "text": "Seguir a trilha principal floresta adentro", "target": "21" },
        { "id": "investigar-marcas", "text": "Investigar as marcas de garra na árvore", "target": "22" },
        { "id": "voltar-vila-floresta", "text": "Voltar para a vila", "target": "5" }
      ]
    },
    "21": {
      "id": "21",
      "title": "Emboscada na trilha",
      "paragraphs": [
        "Um rosnado baixo é seu único aviso antes de o lobo saltar da vegetação rasteira, presas à mostra, olhos fixos na sua garganta.",
        "Não há tempo para pensar — só para reagir."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["lobo-comum"], "onVictory": "23", "onDefeat": "21m", "onFlee": "21f" }
      ],
      "choices": []
    },
    "21m": {
      "id": "21m",
      "title": "Presas na escuridão",
      "paragraphs": [
        "Suas forças se esvaem antes das dele. O lobo não hesita, e a floresta de Nevarwood ganha mais um nome para a lista de desaparecidos — só que dessa vez ninguém em Vaelbrook vai sequer saber seu nome para lamentar.",
        "Sua jornada termina aqui, entre raízes e folhas mortas, longe de casa."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "defeat",
          "title": "Mais um Desaparecido",
          "text": "Você caiu para o primeiro perigo real do Vale de Ashmere. A floresta guarda seu segredo — e agora guarda você também."
        }
      ],
      "choices": []
    },
    "21f": {
      "id": "21f",
      "title": "Fuga entre as árvores",
      "paragraphs": [
        "Você corre, saltando raízes e se enfiando entre troncos estreitos demais para o lobo seguir com a mesma velocidade. Quando finalmente para, ofegante, o rosnado já ficou para trás.",
        "Machucado no orgulho mais do que no corpo, você segue adiante, mais atento agora."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -1 }],
      "choices": [{ "id": "continuar-apos-fuga", "text": "Seguir floresta adentro", "target": "23" }]
    },
    "22": {
      "id": "22",
      "title": "As marcas na árvore",
      "paragraphs": [
        "De perto, as marcas de garra parecem erradas de um jeito que você não sabe explicar — largas demais, fundas demais, dispostas num padrão regular demais para o ataque aleatório de um animal faminto.",
        "Preso numa farpa da casca, um retalho de tecido cinza-acinzentado balança no vento. Bordado nele, o mesmo símbolo do espantalho perto do rio: um olho fechado dentro de um círculo quebrado.",
        "Isso não foi um lobo. Ou não só um lobo."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "fragmento-manto-culto" },
        { "type": "setFlag", "flag": "descobriu-simbolo-culto" },
        { "type": "logEvent", "message": "Você encontrou um fragmento de manto cultista preso perto de marcas de garra suspeitas." }
      ],
      "choices": [{ "id": "continuar-apos-marcas", "text": "Seguir floresta adentro, mais cauteloso", "target": "23" }]
    },
    "23": {
      "id": "23",
      "title": "A clareira funda",
      "allowEat": true,
      "paragraphs": [
        "A trilha se abre numa clareira onde a luz consegue, finalmente, tocar o chão. À direita, uma fenda entre rochas cobertas de musgo sugere a entrada de uma caverna pequena. À frente, a trilha continua, subindo em direção às Colinas Cinzentas, visíveis agora entre os galhos mais altos.",
        "Você sente o peso do silêncio ao seu redor — nem pássaros, nem insetos. Só o vento entre as folhas."
      ],
      "choices": [
        { "id": "explorar-caverna", "text": "Explorar a fenda entre as rochas", "target": "24" },
        { "id": "seguir-colinas", "text": "Seguir a trilha em direção às Colinas Cinzentas", "target": "30" },
        { "id": "voltar-vila-clareira", "text": "Voltar para a vila", "target": "5" }
      ]
    },
    "24": {
      "id": "24",
      "title": "A fenda na rocha",
      "paragraphs": [
        "A entrada é estreita, mas se abre num pequeno espaço logo depois, escuro demais para enxergar além dos primeiros passos. Um brilho fraco e azulado pisca lá no fundo, quase imperceptível — e um som seco, como patas finas arranhando pedra."
      ],
      "choices": [
        {
          "id": "explorar-fundo-caverna",
          "text": "Acender a tocha e explorar mais fundo",
          "target": "24a",
          "conditions": [{ "type": "hasItem", "itemId": "tocha" }],
          "lockedReason": "Está escuro demais lá dentro sem uma fonte de luz confiável."
        },
        { "id": "sair-caverna", "text": "Recuar e sair da caverna", "target": "23" }
      ]
    },
    "24a": {
      "id": "24a",
      "title": "O ninho na pedra",
      "paragraphs": [
        "A luz da tocha revela uma aranha do tamanho de um cão pequeno, empoleirada sobre um pequeno amontoado de pedras reluzentes — parte de seu ninho, ao que parece, ou apenas um lugar que ela decidiu guardar.",
        "Ela se ergue sobre as patas traseiras ao notar sua luz, carapaça brilhando, claramente disposta a defender o que considera seu."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["aranha-da-caverna"], "onVictory": "24s", "onDefeat": "24m", "onFlee": "23" }
      ],
      "choices": []
    },
    "24s": {
      "id": "24s",
      "title": "O tesouro da aranha",
      "paragraphs": [
        "Entre as pedras que a aranha guardava, você encontra algo que não é pedra alguma: uma capa de tecido negro, leve como seda, dobrada com cuidado que nenhum animal teria. Ao tocá-la, ela parece absorver a luz da sua tocha, como se preferisse a escuridão.",
        "Quem quer que a tenha perdido ali, ou escondido ali, não estava planejando voltar tão cedo."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "capa-sombria" },
        { "type": "logEvent", "message": "Você encontrou uma Capa Sombria escondida na caverna." }
      ],
      "choices": [{ "id": "sair-caverna-vitoria", "text": "Sair da caverna com seu achado", "target": "23" }]
    },
    "24m": {
      "id": "24m",
      "title": "Presa nas teias",
      "paragraphs": [
        "As patas da aranha são mais rápidas do que pareciam, e o veneno faz seu efeito antes mesmo de a luta terminar de verdade. Você sente o corpo pesar, a visão embaçar, a escuridão da caverna se fechar sobre você de vez.",
        "Ninguém jamais vai encontrar esta fenda entre as rochas — e ninguém vai encontrar você."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "defeat",
          "title": "O Ninho Silencioso",
          "text": "A curiosidade tem um preço, e desta vez você pagou com tudo o que tinha. A caverna guarda mais um segredo."
        }
      ],
      "choices": []
    },
    "30": {
      "id": "30",
      "title": "Um corpo na trilha",
      "paragraphs": [
        "A trilha sobe entre pedras soltas, e é ali, meio escondido sob um arbusto seco, que você encontra um corpo — vestes de viajante, já rígido há dias, o rosto virado para longe do caminho como se tivesse tentado rastejar de volta e não tivesse conseguido.",
        "Não há marcas óbvias de mordida ou garra. Só um vazio estranho na expressão congelada do morto, como se algo tivesse sido tirado dele antes mesmo do fim."
      ],
      "choices": [
        {
          "id": "examinar-corpo-bram",
          "text": "Examinar os pertences do corpo com cuidado",
          "target": "30b",
          "conditions": [{ "type": "flagActive", "flag": "procura-irmao-bram" }]
        },
        {
          "id": "examinar-corpo-generico",
          "text": "Examinar os pertences do corpo com cuidado",
          "target": "30c",
          "conditions": [{ "type": "flagInactive", "flag": "procura-irmao-bram" }]
        },
        { "id": "nao-parar", "text": "Não se demorar e seguir em frente", "target": "31" }
      ]
    },
    "30b": {
      "id": "30b",
      "title": "Darrek",
      "paragraphs": [
        "O estômago aperta antes mesmo de você confirmar: entre os pertences, uma medalha de latão amassada, gravada com um martelo e uma bigorna. As iniciais 'D.F.' no verso não deixam dúvida. Este é Darrek, o irmão de Bram.",
        "Você guarda a medalha com cuidado. É pouco — quase nada — mas é mais do que Bram tem agora."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "medalha-do-irmao-de-bram" },
        { "type": "setFlag", "flag": "encontrou-irmao-bram" },
        { "type": "logEvent", "message": "Você encontrou o corpo de Darrek, o irmão desaparecido de Bram, e guardou sua medalha." }
      ],
      "choices": [{ "id": "seguir-apos-darrek", "text": "Seguir em frente, mais determinado", "target": "31" }]
    },
    "30c": {
      "id": "30c",
      "title": "Um viajante sem nome",
      "paragraphs": [
        "Você não encontra nada que identifique o morto — nenhum nome, nenhuma carta, só uma pequena bolsa com algumas moedas que o dono não vai mais precisar.",
        "Você as guarda com um misto de culpa e pragmatismo, e segue em frente, mais cauteloso do que antes."
      ],
      "onEnter": [{ "type": "addGold", "value": 2 }],
      "choices": [{ "id": "seguir-apos-desconhecido", "text": "Seguir em frente", "target": "31" }]
    },
    "31": {
      "id": "31",
      "title": "O sopé das Colinas Cinzentas",
      "allowEat": true,
      "paragraphs": [
        "As colinas se erguem à sua frente, cinzentas e ocas como Aldric havia descrito, cravejadas de entradas de cavernas escuras. Numa pedra achatada perto da trilha, alguém entalhou um símbolo recente: um olho fechado dentro de um círculo quebrado, o mesmo de antes — mas maior, mais fundo, feito com mais convicção.",
        "A trilha principal segue visível até uma fenda maior, ao centro. Mas há também marcas de sangue seco fora da trilha, seguindo em outra direção, para quem estiver disposto a se afastar do caminho óbvio."
      ],
      "choices": [
        { "id": "trilha-visivel", "text": "Seguir a trilha visível até a fenda central", "target": "32" },
        { "id": "seguir-sangue", "text": "Seguir as marcas de sangue fora da trilha", "target": "33" }
      ]
    },
    "32": {
      "id": "32",
      "title": "Aproximação cautelosa",
      "paragraphs": [
        "Você segue a trilha mais óbvia, atento a cada sombra entre as pedras. Quanto mais perto chega da fenda central, mais o ar parece pesado — não frio, exatamente, mas errado, como se algo ali embaixo estivesse respirando devagar há muito, muito tempo."
      ],
      "choices": [{ "id": "chegar-entrada-catacumbas", "text": "Chegar à entrada das catacumbas", "target": "34" }]
    },
    "33": {
      "id": "33",
      "title": "O acampamento escondido",
      "paragraphs": [
        "As marcas de sangue levam a uma reentrância escondida entre duas rochas altas — um pequeno acampamento improvisado, fogueira apagada, mantimentos organizados com cuidado militar. Alguém vive aqui, ou vivia até recentemente.",
        "Um homem magro em vestes cinzentas se ergue de trás de uma pedra antes que você consiga recuar, o rosto coberto por um capuz costurado com os mesmos símbolos que você já viu duas vezes hoje. Ele não parece surpreso em vê-lo — apenas incomodado com a interrupção."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["batedor-do-veu"], "onVictory": "33s", "onDefeat": "33m", "onFlee": "34" }
      ],
      "choices": []
    },
    "33s": {
      "id": "33s",
      "title": "Despojos do batedor",
      "paragraphs": [
        "Com o batedor derrotado, você reúne coragem para vasculhar o pequeno acampamento. Não há nada que explique muito — nenhum nome, nenhum registro claro — só provisões, uma pequena bolsa de moedas, e a confirmação silenciosa de que o que ronda essas colinas é organizado, deliberado, e definitivamente não são lobos.",
        "Você guarda o que encontra e segue em frente, o coração batendo mais forte do que gostaria de admitir."
      ],
      "onEnter": [
        { "type": "addGold", "value": 4 },
        { "type": "setFlag", "flag": "descobriu-simbolo-culto" },
        { "type": "logEvent", "message": "Você derrotou um batedor cultista e confirmou que uma seita organizada ronda as Colinas Cinzentas." }
      ],
      "choices": [{ "id": "seguir-apos-batedor", "text": "Seguir até a entrada das catacumbas", "target": "34" }]
    },
    "33m": {
      "id": "33m",
      "title": "A foice silenciosa",
      "paragraphs": [
        "O batedor se move com uma calma que você não consegue igualar, cada golpe medido, ensaiado, quase gentil na forma como encontra suas falhas. Você cai entre as rochas do pequeno acampamento, e ele volta a se sentar junto à fogueira apagada como se nada tivesse acontecido.",
        "Ninguém em Vaelbrook jamais saberá o que houve com você — só que mais um forasteiro tomou o caminho das colinas e não voltou."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "defeat",
          "title": "Interrupção Indesejada",
          "text": "Você subestimou a calma treinada de um verdadeiro devoto do Véu. As Colinas Cinzentas guardam mais um segredo — e mais um corpo."
        }
      ],
      "choices": []
    },
    "34": {
      "id": "34",
      "title": "As portas de Vharok",
      "allowRest": true,
      "paragraphs": [
        "A fenda central se revela, de perto, como algo construído — duas portas de pedra entalhadas com figuras encapuzadas em procissão, tão desgastadas pelo tempo que parecem derreter na própria rocha. Nenhum morador de Vaelbrook falou disso. Talvez nenhum morador de Vaelbrook saiba que isso existe.",
        "Uma das portas está entreaberta o suficiente para um corpo passar. De dentro, vem um cheiro de terra úmida, cera queimada, e algo mais — doce e errado, como fruta apodrecendo devagar.",
        "Seja o que for que more além dessas portas, você está prestes a conhecê-lo."
      ],
      "choices": [
        { "id": "entrar-catacumbas", "text": "Entrar sem hesitar", "target": "35" }
      ]
    },
    "35": {
      "id": "35",
      "title": "A escada quebrada",
      "paragraphs": [
        "Além das portas, uma escada estreita desce em espiral na escuridão, os degraus rachados e desiguais, alguns faltando por completo. Não há corrimão — só a parede fria de um lado e o vazio do outro.",
        "Descer vai exigir cuidado e um pouco de habilidade para não escorregar num degrau ruim."
      ],
      "onEnter": [
        { "type": "startTest", "testType": "skill", "stat": "skill", "onSuccess": "36", "onFailure": "35f" }
      ],
      "choices": []
    },
    "35f": {
      "id": "35f",
      "title": "Um degrau traiçoeiro",
      "paragraphs": [
        "Seu pé encontra ar onde deveria haver pedra, e você desce os últimos degraus mais depressa do que planejado, batendo o ombro com força contra a parede antes de se firmar de novo.",
        "Machucado, mas de pé, você segue adiante, o coração ainda martelando pelo susto."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -2 }],
      "choices": [{ "id": "continuar-apos-escada", "text": "Recompor-se e continuar", "target": "36" }]
    },
    "36": {
      "id": "36",
      "title": "O Alcaide da Alcateia",
      "paragraphs": [
        "A escada termina numa câmara ampla, iluminada por braseiros de chama azulada que não deveriam queimar sem fumaça — e queimam. No centro, algo se ergue das sombras: maior que qualquer lobo, maior que qualquer cavalo, pelagem negra cortada por veios cinzentos que pulsam devagar, como se algo corresse por baixo da pele.",
        "Seus olhos não têm o brilho de nenhum animal que você já viu. Quando ele abre a boca, o som que sai não é bem um rosnado — é quase, quase, uma palavra.",
        "Vosk, se é que ainda faz sentido chamá-lo assim, avança."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["vosk-alcaide-do-veu"], "onVictory": "40", "onDefeat": "36m", "onFlee": "36fl" }
      ],
      "choices": []
    },
    "36fl": {
      "id": "36fl",
      "title": "Retirada apressada",
      "paragraphs": [
        "Você recua pela escada quebrada aos tropeços, sem se importar mais com cuidado ou dignidade, o uivo de Vosk ecoando atrás de você até que a luz do dia finalmente corta a escuridão à frente.",
        "Ofegante, ferido no orgulho, você se afasta das portas de pedra, sabendo que terá de voltar — só não hoje."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -3 }],
      "choices": [{ "id": "voltar-sope-apos-fuga", "text": "Retornar ao sopé das colinas para recuperar o fôlego", "target": "31" }]
    },
    "36m": {
      "id": "36m",
      "title": "A alcateia que resta",
      "paragraphs": [
        "Vosk é mais rápido do que algo daquele tamanho deveria ser, e mais forte do que qualquer lobo tem o direito de ser. Sua última visão é dos olhos sem brilho se aproximando, e do som — quase uma palavra — que ele solta antes do fim.",
        "As portas de Vharok se fecham sobre mais um corpo, e o Vale de Ashmere segue sem saber o quanto chegou perto de um aviso que nunca chegará."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "defeat",
          "title": "O Alcaide Prevalece",
          "text": "Você enfrentou o guardião errado, cedo demais. As Colinas Cinzentas ficam mais silenciosas do que nunca — e Vaelbrook, mais sozinha."
        }
      ],
      "choices": []
    },
    "40": {
      "id": "40",
      "title": "O que restou",
      "paragraphs": [
        "Com Vosk imóvel diante de você, o silêncio da câmara parece ainda mais pesado. É então que você nota, meio enterrada sob os braseiros de chama azulada, uma página solta de pergaminho — arrancada às pressas de algum livro maior, a caligrafia apertada e nervosa de quem escrevia com medo de ser interrompido.",
        "Um nome se repete várias vezes, sublinhado com força: Vharok. E, mais abaixo, uma frase que gela mais do que a câmara ao seu redor: '...três selos precisam permanecer intactos, ou nada mais importará.'",
        "Você guarda a página. Seja o que for que esteja realmente acontecendo em Vaelbrook, é maior — muito maior — do que lobos famintos ou até do que um culto de capuzes cinzentos. É hora de levar isso ao ancião."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "pagina-rasgada-do-veu" },
        { "type": "setFlag", "flag": "descobriu-vharok" },
        { "type": "logEvent", "message": "Você derrotou Vosk e encontrou uma página mencionando 'Vharok' e 'três selos'." }
      ],
      "choices": [{ "id": "voltar-vila-revelacao", "text": "Guardar a página e voltar imediatamente a Vaelbrook", "target": "41" }]
    },
    "41": {
      "id": "41",
      "title": "O relato",
      "paragraphs": [
        "Aldric lê a página duas vezes antes de erguer os olhos, e pela primeira vez desde que você chegou, você vê medo de verdade no rosto dele — não a preocupação cansada de um ancião sobrecarregado, mas algo mais fundo, mais antigo.",
        "'Vharok', ele repete, quase sem voz. 'Meu avô mencionou esse nome uma vez, bêbado demais para se lembrar depois. Eu jurei que era história de bêbado.' Ele olha para você. 'O que você decidir fazer com isso agora vai importar mais do que imagina.'"
      ],
      "choices": [
        {
          "id": "contar-tudo",
          "text": "Contar tudo o que você viu e descobriu",
          "target": "41a",
          "actions": [{ "type": "setFlag", "flag": "vila-alertada" }]
        },
        {
          "id": "esconder-verdade",
          "text": "Suavizar o relato para não espalhar pânico pela vila",
          "target": "41b",
          "actions": [{ "type": "setFlag", "flag": "escondeu-verdade" }]
        }
      ]
    },
    "41a": {
      "id": "41a",
      "title": "A vila se prepara",
      "paragraphs": [
        "Aldric não hesita. Ainda naquela noite, ele reúne quem está disposto a ouvir — não muitos, mas o suficiente — e começa a organizar guardas extras, reforçar portas, racionar o que for preciso. É pouco diante do que você viu nas catacumbas, mas é alguma coisa.",
        "'Vá até o Baluarte da Aurora', diz ele, antes de você partir. 'Se existe alguém que ainda saiba lidar com isso, as respostas vão estar lá, nas montanhas ao norte. Vaelbrook vai aguentar até você voltar. Tem que aguentar.'"
      ],
      "choices": [{ "id": "seguir-noite-alerta", "text": "Passar a noite se preparando para a jornada ao norte", "target": "43" }]
    },
    "41b": {
      "id": "41b",
      "title": "Um segredo pesado",
      "paragraphs": [
        "Você suaviza o relato — menciona um culto, sim, perigoso, sim, mas guarda para si o nome que viu na página e o tamanho real do que sentiu naquela câmara. Aldric parece aliviado, e ao mesmo tempo você percebe, pela forma como ele evita seu olhar, que ele sabe que você não contou tudo.",
        "'Confio no seu julgamento', ele diz, mesmo assim. 'Vá até o Baluarte da Aurora, nas montanhas ao norte. Se alguém souber mais sobre isso, é lá que vamos encontrar.'"
      ],
      "choices": [{ "id": "seguir-noite-segredo", "text": "Passar a noite se preparando para a jornada ao norte", "target": "43" }]
    },
    "43": {
      "id": "43",
      "title": "A última noite em Vaelbrook",
      "allowRest": true,
      "paragraphs": [
        "Você passa a noite revisando seu equipamento à luz de uma vela, o Vale de Ashmere estranhamente silencioso lá fora — o mesmo silêncio pesado que você sentiu nas Colinas Cinzentas, só que agora mais perto de casa.",
        "Amanhã você parte para o norte, em direção às montanhas e ao que resta do Baluarte da Aurora. O que quer que Vharok seja, você tem a sensação incômoda de que Vaelbrook foi apenas o primeiro capítulo de uma história muito mais antiga — e muito maior — do que qualquer um no vale poderia imaginar.",
        "Ao amanhecer, a estrada norte se estende diante de você, estreita entre pinheiros escuros, subindo em direção a picos ainda cobertos de neve mesmo fora do inverno."
      ],
      "choices": [
        { "id": "partir-norte", "text": "Partir rumo ao Baluarte da Aurora", "target": "44" }
      ]
    },
    "44": {
      "id": "44",
      "title": "O caminho ao norte",
      "paragraphs": [
        "A estrada sobe entre pinheiros escuros, e Vaelbrook desaparece atrás de você numa curva do caminho. O ar fica mais fino e mais frio a cada légua, e os picos das Montanhas Grimwold — ainda distantes — já mostram neve mesmo fora do inverno.",
        "Você tem dias de viagem pela frente antes de alcançar o que resta do Baluarte da Aurora. Como usar seu tempo pode fazer diferença quando finalmente chegar lá."
      ],
      "choices": [
        { "id": "acampar-com-cuidado", "text": "Administrar o ritmo da viagem e acampar ao anoitecer", "target": "45" },
        { "id": "marcha-forcada", "text": "Seguir em frente sem parar, aproveitando cada hora de luz", "target": "46" }
      ]
    },
    "45": {
      "id": "45",
      "title": "Acampamento na estrada",
      "paragraphs": [
        "Você monta acampamento cedo, num afloramento de pedra que corta o vento. O fogo é pequeno, mas o suficiente para afastar o pior do frio enquanto a noite cai sobre os pinheiros.",
        "No meio da segunda vigília, um som quebra o silêncio — não um uivo, não passos, apenas um silêncio errado demais, como se algo grande estivesse prestando atenção do lado de fora do alcance da fogueira. Depois de um momento que parece longo demais, o silêncio normal da floresta volta."
      ],
      "onEnter": [
        { "type": "removeProvisions", "value": 1 },
        { "type": "restoreStat", "stat": "stamina", "value": 5 }
      ],
      "choices": [
        { "id": "investigar-escuridao", "text": "Investigar a escuridão além da fogueira", "target": "45a" },
        { "id": "manter-distancia", "text": "Manter distância do fogo e esperar o amanhecer", "target": "47" }
      ]
    },
    "45a": {
      "id": "45a",
      "title": "Além do alcance da fogueira",
      "paragraphs": [
        "Você se afasta da luz, os olhos se ajustando devagar à escuridão. Não encontra nada — nenhuma criatura, nenhum rastro — só uma pequena trouxa de couro esquecida sob uma raiz, pertences de algum viajante que passou por ali antes de você e nunca voltou para buscá-los."
      ],
      "onEnter": [
        { "type": "addGold", "value": 3 },
        { "type": "addItem", "itemId": "moeda-de-prata-antiga" },
        { "type": "logEvent", "message": "Você encontrou uma trouxa esquecida perto do acampamento." }
      ],
      "choices": [{ "id": "voltar-fogueira", "text": "Voltar para perto do fogo", "target": "47" }]
    },
    "46": {
      "id": "46",
      "title": "Marcha forçada",
      "paragraphs": [
        "Você não para para descansar de verdade, comendo enquanto caminha, dormindo pouco entre uma légua e outra. Ganha tempo, mas paga por isso — as pernas pesadas, os ombros doloridos sob o peso da própria bagagem."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -1 }],
      "choices": [{ "id": "seguir-cansado", "text": "Seguir em frente, cansado mas adiantado", "target": "47" }]
    },
    "47": {
      "id": "47",
      "title": "Um vulto na estrada",
      "paragraphs": [
        "Um homem magro surge do meio das árvores à sua frente, bloqueando a estrada, uma faca enferrujada tremendo levemente na mão. Atrás dele, você suspeita que haja outros — mas só ele se mostra.",
        "'A estrada tem pedágio', ele diz, a voz mais nervosa do que ameaçadora. 'Ouro, ou provisões, ou... a gente dá um jeito de outra forma.'"
      ],
      "choices": [
        { "id": "pagar-pedagio", "text": "Pagar para evitar problemas (3 de ouro)", "target": "47p", "conditions": [{ "type": "minGold", "value": 3 }], "lockedReason": "Você não tem ouro suficiente para pagar." },
        { "id": "lutar-bandido", "text": "Recusar e se preparar para lutar", "target": "48" },
        { "id": "intimidar-bandido", "text": "Tentar intimidá-lo a recuar", "target": "47i" }
      ]
    },
    "47p": {
      "id": "47p",
      "title": "O preço da passagem",
      "paragraphs": [
        "Você entrega o ouro sem discutir. O homem o pega com mãos trêmulas, murmura algo entre agradecimento e vergonha, e desaparece de volta entre as árvores tão depressa quanto surgiu."
      ],
      "onEnter": [{ "type": "removeGold", "value": 3 }],
      "choices": [{ "id": "seguir-apos-pagar", "text": "Seguir viagem", "target": "49" }]
    },
    "47i": {
      "id": "47i",
      "title": "Um blefe perigoso",
      "paragraphs": [
        "Você dá um passo à frente, sem hesitar, encarando o homem como se a faca dele fosse a menor das suas preocupações. Vai depender de quão convincente você consegue parecer."
      ],
      "onEnter": [{ "type": "startTest", "testType": "skill", "stat": "skill", "onSuccess": "47is", "onFailure": "47if" }],
      "choices": []
    },
    "47is": {
      "id": "47is",
      "title": "Ele recua",
      "paragraphs": [
        "O homem hesita, avalia você de cima a baixo, e algo em sua postura o convence de que essa não é uma luta que vale a pena. Ele abaixa a faca e recua para as árvores sem dizer mais nada, deixando cair uma pequena moeda de prata no caminho, apressado demais para recolhê-la."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "moeda-de-prata-antiga" }
      ],
      "choices": [{ "id": "seguir-apos-intimidar", "text": "Recolher a moeda e seguir viagem", "target": "49" }]
    },
    "47if": {
      "id": "47if",
      "title": "Ele não recua",
      "paragraphs": [
        "O blefe não funciona. O desespero no rosto do homem vira decisão, e ele avança com a faca à frente, sem mais escolha a não ser lutar."
      ],
      "onEnter": [{ "type": "goToSection", "sectionId": "48" }],
      "choices": []
    },
    "48": {
      "id": "48",
      "title": "Luta na estrada",
      "paragraphs": [
        "Não há mais espaço para negociar. O bandido avança, faca em riste, desesperado o suficiente para ser imprevisível."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["bandido-da-estrada"], "onVictory": "49", "onDefeat": "48m", "onFlee": "47f" }
      ],
      "choices": []
    },
    "47f": {
      "id": "47f",
      "title": "Fuga pela estrada",
      "paragraphs": [
        "Você recua e corre, cortando por entre as árvores até deixar o bandido para trás, ofegante mas ileso — se não fosse pelo orgulho."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -1 }],
      "choices": [{ "id": "seguir-apos-fuga-bandido", "text": "Seguir viagem, mais cauteloso", "target": "49" }]
    },
    "48m": {
      "id": "48m",
      "title": "Um desespero maior que o seu",
      "paragraphs": [
        "O bandido luta como quem não tem mais nada a perder — e, no fim, é exatamente isso que decide o confronto. Você cai na estrada de terra, longe de qualquer vila, e ele foge sem sequer revistar seus pertences, apavorado com o que acabou de fazer.",
        "Ninguém vai encontrá-lo a tempo."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "A Estrada Vazia", "text": "Você não sobreviveu a um encontro que deveria ter sido evitável. O Vale de Ashmere segue sem sua ajuda." }
      ],
      "choices": []
    },
    "49": {
      "id": "49",
      "title": "O sopé das Montanhas Grimwold",
      "allowEat": true,
      "paragraphs": [
        "A trilha finalmente rompe a linha das árvores, e a paisagem se abre: encostas rochosas, cobertas de neve rala, subindo em direção a picos que desaparecem entre nuvens baixas. No alto de um penhasco distante, meio devorado pelo tempo e pelo gelo, você avista pela primeira vez o que resta do Baluarte da Aurora — torres quebradas como dentes cariados contra o céu cinzento.",
        "Não é um lugar que convida visitantes. Mas é exatamente para lá que você precisa ir."
      ],
      "choices": [{ "id": "seguir-ao-baluarte", "text": "Seguir encosta acima, em direção ao Baluarte", "target": "50" }]
    },
    "50": {
      "id": "50",
      "title": "Os portões quebrados",
      "paragraphs": [
        "O portão principal do Baluarte está entalado sob uma pilha de pedra desabada — impossível de abrir sem uma equipe inteira de trabalhadores, e você não tem nenhum. Mas o Baluarte é grande, e o tempo abriu outras feridas em suas muralhas além dessa.",
        "À esquerda, um trecho de muralha caída forma uma rampa íngreme até o topo. À direita, mais abaixo, um fosso seco margeia a base da fortaleza, com o que parece ser uma abertura estreita perto do fundo."
      ],
      "choices": [
        { "id": "escalar-muralha-baluarte", "text": "Escalar a muralha caída", "target": "51" },
        { "id": "entrada-fosso", "text": "Descer até o fosso seco e procurar a abertura", "target": "52" }
      ]
    },
    "51": {
      "id": "51",
      "title": "A muralha caída",
      "paragraphs": [
        "A escalada é traiçoeira — pedras soltas, gelo fino escondido sob a poeira, quedas de mais de um andar de qualquer lado que você escorregue. Vai exigir habilidade para chegar ao topo inteiro."
      ],
      "onEnter": [{ "type": "startTest", "testType": "skill", "stat": "skill", "onSuccess": "51s", "onFailure": "51f" }],
      "choices": []
    },
    "51s": {
      "id": "51s",
      "title": "Um caminho seguro",
      "paragraphs": [
        "Você encontra apoio firme em cada pedra, quase por instinto, e chega ao topo da muralha sem um arranhão — a tempo de notar, entre os escombros, uma moeda de prata antiga presa entre duas pedras."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "moeda-de-prata-antiga" }
      ],
      "choices": [{ "id": "descer-patio-sucesso", "text": "Descer até o pátio interno", "target": "53" }]
    },
    "51f": {
      "id": "51f",
      "title": "Uma escorregadela",
      "paragraphs": [
        "Uma pedra cede sob seu peso e você desliza os últimos metros, batendo com força contra o chão do outro lado da muralha. Machucado, você se levanta e sacode a poeira gelada das roupas."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -2 }],
      "choices": [{ "id": "descer-patio-falha", "text": "Levantar-se e seguir até o pátio interno", "target": "53" }]
    },
    "52": {
      "id": "52",
      "title": "O fosso seco",
      "paragraphs": [
        "A abertura no fundo do fosso é baixa, exigindo que você se abaixe para passar. Do outro lado, um pequeno corredor de serviço, esquecido havia décadas — e, pendurada num gancho enferrujado perto da entrada, uma chave pesada de ferro batido.",
        "Um bando de morcegos, perturbado pela sua presença, explode de um canto escuro e passa raspando por você antes de sumir na noite."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "chave-do-portao-lateral" },
        { "type": "modifyStat", "stat": "stamina", "value": -1 },
        { "type": "logEvent", "message": "Você encontrou uma chave de ferro pesada perto do fosso seco." }
      ],
      "choices": [{ "id": "seguir-patio-fosso", "text": "Seguir pelo corredor até o pátio interno", "target": "53" }]
    },
    "53": {
      "id": "53",
      "title": "O pátio tomado pelo mato",
      "allowRest": true,
      "paragraphs": [
        "O pátio interno do Baluarte é maior do que parecia de fora — colunas quebradas, estátuas sem rosto cobertas de líquen gelado, o brasão da Ordem (um sol nascendo sobre um círculo quebrado) ainda visível, desbotado, na pedra do chão.",
        "Quatro caminhos se abrem a partir daqui: uma capela de pedra a um lado, o que resta de uma armaria do outro, uma torre parcialmente desabada, e uma escadaria estreita descendo para o que só pode ser uma cripta.",
        "De algum lugar entre as muralhas mais distantes, você ouve — ou tem quase certeza de ouvir — um grito abafado."
      ],
      "choices": [
        { "id": "ir-capela-baluarte", "text": "Ir até a capela dos Guardiões", "target": "54" },
        { "id": "ir-armaria-baluarte", "text": "Vasculhar a antiga armaria", "target": "58" },
        { "id": "ir-torre-baluarte", "text": "Subir até a torre parcialmente desabada", "target": "63" },
        {
          "id": "seguir-grito",
          "text": "Seguir na direção do grito",
          "target": "61",
          "conditions": [
            { "type": "flagInactive", "flag": "aliado-halgrim" },
            { "type": "flagInactive", "flag": "abandonou-halgrim" }
          ]
        },
        {
          "id": "voltar-local-grito",
          "text": "Voltar ao pátio menor onde ouviu o grito",
          "target": "62b",
          "conditions": [
            { "type": "flagActive", "flag": "abandonou-halgrim" },
            { "type": "flagInactive", "flag": "aliado-halgrim" }
          ]
        },
        { "id": "descer-cripta-baluarte", "text": "Descer a escadaria até a cripta", "target": "66" }
      ]
    },
    "54": {
      "id": "54",
      "title": "A capela dos Guardiões",
      "paragraphs": [
        "Dentro da capela, o teto ainda resiste, e por isso o silêncio parece mais pesado — nenhum vento, nenhum pássaro, só poeira suspensa na luz cinzenta que entra por um vitral quebrado. No altar, entalhado em baixo-relevo, três símbolos formam um triângulo ao redor de um círculo quebrado: um selo de ferro, um selo de gelo, um selo de sangue.",
        "Alguém dedicou a vida inteira a manter isso em segredo. Você está começando a entender por quê."
      ],
      "choices": [
        { "id": "examinar-altar-baluarte", "text": "Examinar o altar com cuidado", "target": "55", "conditions": [{ "type": "flagInactive", "flag": "descobriu-mapa-selos" }], "lockedReason": "Você já vasculhou este altar." },
        { "id": "voltar-patio-capela", "text": "Voltar para o pátio", "target": "53" }
      ]
    },
    "55": {
      "id": "55",
      "title": "Sob o triângulo de selos",
      "paragraphs": [
        "Você passa as mãos pela borda do altar, procurando o que quer que tenha sido escondido ali. Vai exigir sorte para encontrar algo antes que a luz do dia se esgote de vez."
      ],
      "onEnter": [{ "type": "startTest", "testType": "luck", "onSuccess": "55s", "onFailure": "55f" }],
      "choices": []
    },
    "55s": {
      "id": "55s",
      "title": "O pergaminho escondido",
      "paragraphs": [
        "Um painel de pedra solto revela um pequeno nicho, e dentro dele, protegido da umidade por um pano encerado, um pergaminho cuidadosamente desenhado: um mapa do Vale de Ashmere e das terras ao redor, com três pontos marcados — as Colinas Cinzentas, um templo nas Montanhas Grimwold, e um santuário no Pântano de Murkfen.",
        "Você guarda o mapa com cuidado. Seja o que for que precise fazer a seguir, agora sabe, ao menos, para onde ir."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "pergaminho-dos-tres-selos" },
        { "type": "setFlag", "flag": "descobriu-mapa-selos" },
        { "type": "logEvent", "message": "Você encontrou um pergaminho marcando a localização dos Três Selos." }
      ],
      "choices": [{ "id": "voltar-capela-sucesso", "text": "Guardar o pergaminho e voltar ao pátio", "target": "53" }]
    },
    "55f": {
      "id": "55f",
      "title": "Nada além de poeira",
      "paragraphs": [
        "Seus dedos não encontram nada além de pedra fria e poeira. Se há algo escondido ali, o altar não está disposto a entregá-lo hoje."
      ],
      "choices": [{ "id": "voltar-capela-falha", "text": "Voltar ao pátio", "target": "53" }]
    },
    "58": {
      "id": "58",
      "title": "A armaria em ruínas",
      "paragraphs": [
        "Suportes de madeira apodrecida ainda seguram o que resta do arsenal da Ordem — a maioria enferrujado além de qualquer uso, mas nem tudo. Uma bandeira surrada, com o mesmo brasão do pátio, pende torta de uma parede."
      ],
      "choices": [
        { "id": "vasculhar-armas", "text": "Vasculhar os suportes de armas", "target": "59" },
        { "id": "examinar-bandeira", "text": "Examinar a bandeira surrada", "target": "60" },
        { "id": "voltar-patio-armaria", "text": "Voltar para o pátio", "target": "53" }
      ]
    },
    "59": {
      "id": "59",
      "title": "O que restou do arsenal",
      "paragraphs": [
        "Entre lâminas partidas e cabos apodrecidos, uma espada ainda inteira chama sua atenção — mais pesada que qualquer coisa que você já empunhou, mas equilibrada de um jeito que só um bom ferreiro consegue alcançar. Gravado perto da guarda, o mesmo brasão de sempre.",
        "Se você já tiver a chave do portão lateral, uma segunda descoberta espera atrás de um baú trancado no canto: um escudo de aço, surpreendentemente bem preservado."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "espada-do-guardiao" },
        { "type": "logEvent", "message": "Você encontrou a Espada do Guardião na armaria." }
      ],
      "choices": [
        {
          "id": "abrir-bau-armaria",
          "text": "Usar a chave do portão lateral para abrir o baú trancado",
          "target": "59b",
          "conditions": [{ "type": "hasItem", "itemId": "chave-do-portao-lateral" }],
          "lockedReason": "O baú está trancado, e você não tem a chave certa."
        },
        { "id": "voltar-armaria-arma", "text": "Voltar para o corredor da armaria", "target": "58" }
      ]
    },
    "59b": {
      "id": "59b",
      "title": "O baú trancado",
      "paragraphs": [
        "A chave gira com um estalo satisfatório, e a tampa do baú se abre revelando um escudo de aço, ainda com traços de tinta heráldica preservados pelo tempo. É pesado, sólido, e claramente feito para durar mais do que quem o carregava."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "escudo-da-ordem" },
        { "type": "logEvent", "message": "Você encontrou o Escudo da Ordem dentro do baú trancado." }
      ],
      "choices": [{ "id": "voltar-armaria-bau", "text": "Voltar para o corredor da armaria", "target": "58" }]
    },
    "60": {
      "id": "60",
      "title": "A bandeira surrada",
      "paragraphs": [
        "De perto, você percebe que a bandeira não está apenas surrada pelo tempo — está rasgada por uma lâmina, várias vezes, e manchada de algo escuro que já não é possível identificar. A última batalha da Ordem não foi silenciosa."
      ],
      "choices": [{ "id": "voltar-armaria-bandeira", "text": "Voltar para o corredor da armaria", "target": "58" }]
    },
    "61": {
      "id": "61",
      "title": "O grito além das muralhas",
      "paragraphs": [
        "Você segue o som até um pátio menor, cercado por muralhas mais baixas. Ali, um homem idoso em armadura enferrujada — mas de pé, ainda lutando — se defende de dois vultos em vestes cinzentas que o cercam de dois lados.",
        "Ele não vai aguentar muito mais tempo sozinho."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["cultista-do-veu", "cultista-do-veu"], "onVictory": "62", "onDefeat": "61m", "onFlee": "61f" }
      ],
      "choices": []
    },
    "61m": {
      "id": "61m",
      "title": "Dois contra um forasteiro",
      "paragraphs": [
        "Os cultistas se revelam mais coordenados do que aparentam, atacando em conjunto, sem dar espaço para recuperação. Você cai no pátio menor do Baluarte, ao lado de um velho guerreiro que também não vai sobreviver a esse dia.",
        "Ninguém mais restará para proteger o que quer que ainda esteja escondido ali."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "O Último Guardião Cai", "text": "Você e Sor Halgrim caem juntos no pátio do Baluarte. O Vale de Ashmere perde seus dois últimos defensores no mesmo dia." }
      ],
      "choices": []
    },
    "61f": {
      "id": "61f",
      "title": "Uma retirada amarga",
      "paragraphs": [
        "Você recua, incapaz de lidar com os dois de uma vez, e foge para as sombras de um corredor próximo. Atrás de você, os gritos continuam por mais um tempo — e depois param."
      ],
      "onEnter": [
        { "type": "modifyStat", "stat": "stamina", "value": -1 },
        { "type": "setFlag", "flag": "abandonou-halgrim" },
        { "type": "logEvent", "message": "Você recuou do combate e deixou o velho guerreiro à própria sorte." }
      ],
      "choices": [{ "id": "voltar-patio-fuga-halgrim", "text": "Voltar ao pátio principal, com o coração pesado", "target": "53" }]
    },
    "62": {
      "id": "62",
      "title": "Sor Halgrim",
      "paragraphs": [
        "Com os cultistas derrotados, o velho guerreiro se apoia na própria espada, ofegante, mas vivo. 'Sor Halgrim', ele se apresenta, entre respirações difíceis. 'O último dos Guardiões da Aurora — ou o que restou de nós, de qualquer forma.'",
        "Ele avalia você com um misto de surpresa e alívio. 'Vieram atrás do que resta aqui há semanas. Achei que fosse morrer sem contar a mais ninguém o que sei.'",
        "Ele entrega a você um pequeno frasco dourado e um caderno de couro gasto. 'Leia isso quando tiver um momento em paz — não é uma leitura fácil. E tenha cuidado com a cripta. Um dos nossos não descansou direito lá embaixo.'"
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "elixir-do-guardiao" },
        { "type": "addItem", "itemId": "diario-de-sor-halgrim" },
        { "type": "setFlag", "flag": "aliado-halgrim" },
        { "type": "logEvent", "message": "Sor Halgrim, o último Guardião da Aurora, tornou-se seu aliado." }
      ],
      "choices": [{ "id": "voltar-patio-halgrim", "text": "Agradecer e voltar ao pátio principal", "target": "53" }]
    },
    "62b": {
      "id": "62b",
      "title": "Vestígios de uma luta",
      "paragraphs": [
        "Você retorna mais tarde ao pátio menor e encontra apenas sinais da luta — pedras deslocadas, um pedaço de tecido cinzento preso a uma fresta. Nenhum corpo. Talvez o velho guerreiro tenha sobrevivido sozinho; talvez não. Você não tem como saber."
      ],
      "choices": [{ "id": "voltar-patio-vestigios", "text": "Voltar ao pátio principal", "target": "53" }]
    },
    "63": {
      "id": "63",
      "title": "A torre desabada",
      "paragraphs": [
        "A escada que resta da torre é estreita e falha em vários pontos — mais um esqueleto de escada do que uma escada de verdade. Ainda assim, o topo promete uma visão de todo o vale ao redor do Baluarte. Vai exigir cuidado e agilidade para chegar lá sem despencar."
      ],
      "onEnter": [{ "type": "startTest", "testType": "skill", "stat": "skill", "onSuccess": "63s", "onFailure": "63f" }],
      "choices": []
    },
    "63s": {
      "id": "63s",
      "title": "O que se vê do alto",
      "paragraphs": [
        "Do topo da torre, o vale inteiro se estende diante de você — as Montanhas Grimwold a um lado, uma mancha escura ao longe que só pode ser o Pântano de Murkfen do outro. Entre os escombros do último degrau, você encontra um medalhão de bronze escurecido, o brasão da Ordem gravado com cuidado que nenhum saque teria deixado passar.",
        "E então você a vê: uma figura solitária, muito longe, parada numa crista rochosa, imóvel, olhando na direção do Baluarte. Quando você pisca, ela já não está mais lá."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "brasao-da-ordem-da-aurora" },
        { "type": "logEvent", "message": "Do topo da torre, você avistou uma figura solitária observando o Baluarte ao longe." }
      ],
      "choices": [{ "id": "descer-torre-sucesso", "text": "Descer com cuidado de volta ao pátio", "target": "53" }]
    },
    "63f": {
      "id": "63f",
      "title": "Um degrau que cede",
      "paragraphs": [
        "Um dos degraus cede sob seu pé, e você se agarra à parede de pedra a tempo de não cair de vez, machucando o braço no processo. A vista, quando finalmente chega ao topo, quase compensa o susto — quase."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -2 }],
      "choices": [{ "id": "descer-torre-falha", "text": "Descer com cuidado de volta ao pátio", "target": "53" }]
    },
    "66": {
      "id": "66",
      "title": "A escadaria da cripta",
      "paragraphs": [
        "A escadaria desce muito além do que o tamanho do Baluarte deveria permitir, esculpida diretamente na rocha da montanha. O ar fica mais frio a cada degrau — não o frio das Grimwold lá fora, mas algo mais parado, mais antigo."
      ],
      "choices": [{ "id": "descer-cripta-fundo", "text": "Descer até o fundo da escadaria", "target": "67" }]
    },
    "67": {
      "id": "67",
      "title": "Passos que não são seus",
      "paragraphs": [
        "No corredor abaixo, tochas azuladas queimam sem que ninguém as tenha acendido em anos. Você ouve passos — metálicos, arrastados, regulares demais para serem vivos — se aproximando de algum corredor lateral. Talvez dê para evitá-los, se você for rápido e tiver um pouco de sorte."
      ],
      "onEnter": [{ "type": "startTest", "testType": "luck", "onSuccess": "68", "onFailure": "67f" }],
      "choices": []
    },
    "67f": {
      "id": "67f",
      "title": "Encontrado",
      "paragraphs": [
        "Os passos param. Um instante de silêncio absoluto — e então uma forma semitransparente, vestida numa armadura desbotada, emerge do corredor lateral diretamente à sua frente, sem qualquer surpresa em encontrá-lo ali."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["espectro-da-cripta"], "onVictory": "68", "onDefeat": "67m", "onFlee": "68" }
      ],
      "choices": []
    },
    "67m": {
      "id": "67m",
      "title": "Uma ronda eterna",
      "paragraphs": [
        "O espectro luta como quem já perdeu tudo o que podia perder, sem medo, sem hesitação, sem nada além do dever cego de proteger um posto que não existe mais. Você se torna parte da ronda que ele cumpre — para sempre, ou até que outra alma cometa o mesmo erro."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "A Ronda Continua", "text": "Você caiu na cripta do Baluarte da Aurora, mais uma sombra entre tantas outras que já não lembram por que ainda montam guarda." }
      ],
      "choices": []
    },
    "68": {
      "id": "68",
      "title": "O corredor dos Guardiões",
      "paragraphs": [
        "Nichos de pedra se alinham nas paredes deste corredor, cada um contendo os restos de um Guardião da Aurora, armadura e tudo, em repouso havia séculos. Faltam apenas dois nichos — vazios, esperando."
      ],
      "choices": [
        {
          "id": "reconhecer-halgrim-morto",
          "text": "Examinar um vulto caído perto do fim do corredor",
          "target": "68a",
          "conditions": [{ "type": "flagActive", "flag": "abandonou-halgrim" }]
        },
        {
          "id": "seguir-corredor-guardioes",
          "text": "Seguir em frente pelo corredor",
          "target": "68b",
          "conditions": [{ "type": "flagInactive", "flag": "abandonou-halgrim" }]
        },
        { "id": "seguir-corredor-guardioes-normal", "text": "Seguir em frente pelo corredor", "target": "68b", "conditions": [{ "type": "flagActive", "flag": "abandonou-halgrim" }] }
      ]
    },
    "68a": {
      "id": "68a",
      "title": "Um dos nichos vazios, preenchido",
      "paragraphs": [
        "O vulto caído é Sor Halgrim — ele deve ter descido sozinho, ferido, tempo demais depois de você tê-lo deixado para trás no pátio. Ele não chegou muito longe. Ao lado do corpo, seu diário e um pequeno frasco dourado, intocados.",
        "Você guarda os dois em silêncio, com um peso no peito que nenhuma poção vai curar."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "elixir-do-guardiao" },
        { "type": "addItem", "itemId": "diario-de-sor-halgrim" },
        { "type": "setFlag", "flag": "halgrim-morreu" },
        { "type": "logEvent", "message": "Você encontrou o corpo de Sor Halgrim na cripta — tarde demais." }
      ],
      "choices": [{ "id": "seguir-apos-halgrim-morto", "text": "Seguir em frente, mais determinado do que nunca", "target": "68b" }]
    },
    "68b": {
      "id": "68b",
      "title": "O fim do corredor",
      "paragraphs": [
        "No fim do corredor, uma porta de pedra maciça está entalhada com a mesma imagem que você já viu repetidas vezes neste lugar: um sol nascendo sobre um círculo quebrado. Por trás dela, você sente — mais do que ouve — algo se mexer devagar, pesado, paciente."
      ],
      "choices": [{ "id": "abrir-porta-final-cripta", "text": "Abrir a porta e entrar", "target": "69" }]
    },
    "69": {
      "id": "69",
      "title": "A câmara do último Selo",
      "paragraphs": [
        "A câmara além da porta é circular, o teto perdido na escuridão acima. No centro, sobre um pedestal de pedra negra, um disco de ferro pulsa com um brilho fraco e errado — o Selo de Ferro.",
        "Entre você e o pedestal, uma armadura completa se ergue devagar de onde estava ajoelhada, como se rezasse havia séculos. Ela não está vazia."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["cavaleiro-amaldicoado"], "onVictory": "71", "onDefeat": "70m", "onFlee": "68b" }
      ],
      "choices": []
    },
    "70m": {
      "id": "70m",
      "title": "O guardião cumpre seu dever",
      "paragraphs": [
        "O Cavaleiro Amaldiçoado luta com a força de algo que esqueceu como perder. Você cai diante do pedestal, tão perto do Selo de Ferro quanto qualquer intruso jamais chegou — e não mais perto do que isso.",
        "A armadura se ajoelha de volta ao seu posto eterno, como se nada tivesse acontecido."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "O Posto Eterno", "text": "O último Guardião da câmara continua sua vigília, agora com um nome a mais para não lembrar." }
      ],
      "choices": []
    },
    "71": {
      "id": "71",
      "title": "O Selo de Ferro",
      "paragraphs": [
        "A armadura desmorona, e por um instante você jura ver, na poeira que se espalha, o vulto exausto de um rosto humano — grato, talvez, por finalmente poder parar.",
        "O Selo de Ferro pulsa mais forte quando você se aproxima, quase morno ao toque, como algo vivo fingindo ser pedra. Ao erguê-lo do pedestal, uma dor rápida e fria atravessa sua cabeça — uma sensação nítida, embora impossível de explicar, de que algo muito longe e muito fundo acabou de notar sua presença.",
        "Você guarda o Selo com cuidado, tentando não pensar demais nisso, e sai da câmara em direção à luz do dia."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "selo-de-ferro" },
        { "type": "setFlag", "flag": "selo-ferro" },
        { "type": "logEvent", "message": "Você obteve o Selo de Ferro, o primeiro dos Três Selos." }
      ],
      "choices": [{ "id": "voltar-patio-selo", "text": "Voltar ao pátio principal do Baluarte", "target": "72" }]
    },
    "72": {
      "id": "72",
      "title": "Um dos três",
      "paragraphs": [
        "De volta ao pátio, sob um céu que já escurece, você sente o peso do Selo de Ferro na bolsa como se fosse maior do que realmente é. Um selo recuperado. Dois ainda esperam — um templo gelado nas Montanhas Grimwold, um santuário afundado no Pântano de Murkfen, ambos marcados no pergaminho que você carrega, se teve a sorte de encontrá-lo.",
        "Seja qual for o caminho que você escolher a seguir, uma coisa já está clara: isso não é mais sobre uma vila pequena e alguns desaparecimentos. Nunca foi, na verdade — só demorou até você perceber."
      ],
      "choices": [{ "id": "partir-em-busca-dos-outros-selos", "text": "Partir determinado a encontrar os outros dois Selos", "target": "73" }]
    },
    "73": {
      "id": "73",
      "title": "(rascunho) Rumo aos outros Selos — continua no Ato III",
      "paragraphs": [
        "Você deixa o Baluarte da Aurora para trás, o Selo de Ferro guardado com cuidado, o pergaminho apontando dois caminhos possíveis: gelo ao norte, lama ao sul. Esta é a fronteira do que já foi escrito até agora.",
        "[Nota de desenvolvimento: esta seção é um marcador temporário de fim do Ato II. Será substituída pela escolha real entre as Montanhas Grimwold e o Pântano de Murkfen na próxima leva de escrita.]"
      ],
      "choices": []
    }
  }
}
$demobook2$::jsonb,
  101,
  '6-10 horas (obra em construção — Ato I disponível)',
  now()
);

insert into public.books (owner_id, title, slug, short_description, description, cover_url, genre, status, visibility, content_data, estimated_sections, estimated_reading_time, published_at)
values (
  null,
  'Estação Corvo-9',
  'estacao-corvo-9',
  'Um farol de socorro automático repete o mesmo sinal há dias: ''Corvo-9, contenção comprometida, todas as mãos...'' e nada mais. Você é o único inspetor a poucas horas de distância, e a empresa quer resp',
  'Um farol de socorro automático repete o mesmo sinal há dias: ''Corvo-9, contenção comprometida, todas as mãos...'' e nada mais. Você é o único inspetor a poucas horas de distância, e a empresa quer respostas antes que outra nave chegue primeiro.',
  null,
  'Ficção científica',
  'published',
  'public',
  $demobook3${
  "id": "estacao-corvo-9",
  "version": "1.0.0",
  "title": "Estação Corvo-9",
  "author": "IA Narrativa",
  "description": "Um farol de socorro automático repete o mesmo sinal há dias: 'Corvo-9, contenção comprometida, todas as mãos...' e nada mais. Você é o único inspetor a poucas horas de distância, e a empresa quer respostas antes que outra nave chegue primeiro.",
  "genre": "Ficção científica",
  "estimatedDuration": "1-2 horas (livro curto, completo)",
  "rulesText": "Este é um livro curto e autocontido, pensado como teste da engine. A Estação Corvo-9 está isolada — não há como pedir ajuda de fora. Gerencie bem suas provisões (rações de emergência) e não hesite em recuar de um combate que pareça perdido.",
  "rules": {
    "useDefaultRules": true,
    "fatigueSystem": true,
    "provisions": true,
    "restSystem": true,
    "combatLuck": true
  },
  "startSection": "1",
  "characterCreation": {
    "skill": { "dice": 1, "sides": 6, "modifier": 6 },
    "stamina": { "dice": 2, "sides": 6, "modifier": 12 },
    "luck": { "dice": 1, "sides": 6, "modifier": 6 },
    "gold": 0,
    "provisions": 8
  },
  "items": [
    {
      "id": "cartao-de-acesso-nivel-2",
      "name": "Cartão de Acesso Nível 2",
      "description": "Um cartão magnético da enfermaria, ainda com a foto de uma médica sorrindo cansada. Deveria abrir a maioria das portas internas da estação.",
      "kind": "key",
      "discardable": false,
      "icon": "key"
    },
    {
      "id": "corta-plasma",
      "name": "Corta-Plasma Portátil",
      "description": "Uma ferramenta de manutenção pesada, recalibrada às pressas para servir de arma. Corta metal — e o que mais precisar.",
      "kind": "weapon",
      "damageBonus": 2,
      "icon": "sword"
    },
    {
      "id": "colete-reforcado",
      "name": "Colete Reforçado de Carga",
      "description": "Um colete de trabalho pesado, com placas de proteção costuradas por cima. Não foi feito para combate, mas ajuda.",
      "kind": "armor",
      "defenseBonus": 1,
      "icon": "shield"
    },
    {
      "id": "kit-medico",
      "name": "Kit Médico de Emergência",
      "description": "Um estojo selado com estimulantes e vedante de ferimentos. Restaura parte das suas forças quando usado.",
      "kind": "consumable",
      "consumable": true,
      "onUseEffects": [{ "stat": "stamina", "value": 5 }],
      "icon": "potion"
    },
    {
      "id": "lanterna-tatica",
      "name": "Lanterna Tática",
      "description": "Uma lanterna de longa duração, presa a um suporte de pulso. Essencial em setores sem energia.",
      "kind": "misc",
      "discardable": true,
      "icon": "misc"
    },
    {
      "id": "chip-de-dados-do-capitao",
      "name": "Chip de Dados da Capitã",
      "description": "Um pequeno chip de armazenamento, retirado do terminal de comando. Contém os últimos registros pessoais da capitã Reyes.",
      "kind": "misc",
      "discardable": false,
      "icon": "book",
      "examineText": "A última entrada, gravada em áudio, é só um sussurro: 'Não deixem ninguém abrir o contêiner três. Digam à minha filha que eu tentei.'"
    },
    {
      "id": "registro-de-log-medico",
      "name": "Registro Médico da Dra. Voss",
      "description": "Um bloco de notas digital, a letra apressada e cada vez mais irregular nas últimas entradas.",
      "kind": "misc",
      "discardable": true,
      "icon": "book",
      "examineText": "'Dia 14: a amostra do contêiner três não deveria reagir a tecido humano. Está reagindo. Recomendo quarentena total. Ninguém está ouvindo.'"
    },
    {
      "id": "codigo-de-autodestruicao",
      "name": "Código de Autodestruição",
      "description": "Uma sequência alfanumérica anotada à mão, arrancada de um painel de engenharia. O único jeito de acionar remotamente o protocolo de autodestruição da estação.",
      "kind": "misc",
      "discardable": false,
      "icon": "key"
    },
    {
      "id": "amostra-biologica-instavel",
      "name": "Amostra Biológica Instável",
      "description": "Um recipiente selado, etiquetado apenas com um número e um símbolo de risco biológico. Está mais quente do que deveria estar.",
      "kind": "misc",
      "discardable": true,
      "icon": "misc",
      "examineText": "Através do vidro fosco, você acha que vê algo se mover. Provavelmente é só sua imaginação. Provavelmente."
    }
  ],
  "enemies": [
    {
      "id": "drone-de-seguranca",
      "name": "Drone de Segurança",
      "skill": 6,
      "stamina": 8,
      "description": "Um drone de manutenção reprogramado por um protocolo de emergência mal escrito, tratando qualquer coisa que se move como uma ameaça a ser contida.",
      "image": "/stories/estacao-corvo-9/drone-de-seguranca.svg",
      "defeatText": "O drone gira sobre si mesmo, solta faíscas e cai inerte no chão de metal.",
      "points": 8
    },
    {
      "id": "enxame-de-esporos",
      "name": "Enxame de Esporos",
      "skill": 5,
      "stamina": 7,
      "description": "Uma massa pulsante de filamentos acinzentados, espalhada por dutos e painéis, reagindo ao calor do seu corpo com um interesse quase animal.",
      "image": "/stories/estacao-corvo-9/enxame-de-esporos.svg",
      "defeatText": "O enxame se encolhe, enegrece e para de se mover, como uma planta murchando de uma vez.",
      "points": 6
    },
    {
      "id": "tripulante-infectado",
      "name": "Tripulante Infectado",
      "skill": 7,
      "stamina": 9,
      "description": "Um homem em uniforme de manutenção, os movimentos errados demais, rápidos demais, os olhos velados por um filme acinzentado.",
      "image": "/stories/estacao-corvo-9/tripulante-infectado.svg",
      "defeatText": "O tripulante desaba, e por um instante seu rosto parece, finalmente, o de um homem descansando.",
      "points": 10
    },
    {
      "id": "hospedeiro-mestre",
      "name": "O Hospedeiro",
      "skill": 10,
      "stamina": 18,
      "description": "O que restou da capitã Reyes já não é mais uma pessoa — é um centro nervoso para o enxame inteiro, membros alongados demais, uma voz que ainda tenta, patética e horrível, formar palavras.",
      "image": "/stories/estacao-corvo-9/hospedeiro-mestre.svg",
      "defeatText": "O Hospedeiro desmorona numa massa de filamentos secos, e por um segundo — só um segundo — você jura ouvir um suspiro humano de alívio saindo de algum lugar dentro daquilo.",
      "points": 40
    }
  ],
  "sections": {
    "1": {
      "id": "1",
      "title": "Sinal Zero",
      "image": "/stories/estacao-corvo-9/cena-chegada.svg",
      "paragraphs": [
        "O farol de socorro da Estação Corvo-9 repete a mesma mensagem automática há três dias: 'Contenção comprometida. Todas as mãos ao convés. Contenção com...' — e então estática, sempre no mesmo ponto.",
        "Pela vigia da sua lançadeira, a estação gira devagar contra o fundo escuro do cinturão de asteroides, luzes de emergência piscando em padrão irregular. Nenhuma resposta às suas chamadas de rádio. Nenhum sinal de outra nave.",
        "O painel de acoplagem oferece duas opções: um protocolo automático, lento mas seguro, ou uma acoplagem manual, mais rápida — se você tiver o pulso firme para isso."
      ],
      "choices": [
        { "id": "tentar-acoplagem-manual", "text": "Assumir os controles e acoplar manualmente", "target": "1a" },
        { "id": "usar-protocolo-automatico", "text": "Deixar o protocolo automático cuidar disso", "target": "2" }
      ]
    },
    "1a": {
      "id": "1a",
      "title": "Acoplagem manual",
      "paragraphs": [
        "Você desliga o piloto automático e assume os manches, alinhando o colar de acoplagem da lançadeira com a escotilha da estação à mão. Vai exigir precisão."
      ],
      "onEnter": [{ "type": "startTest", "testType": "skill", "stat": "skill", "onSuccess": "2", "onFailure": "1f" }],
      "choices": []
    },
    "1f": {
      "id": "1f",
      "title": "Um encaixe brusco",
      "paragraphs": [
        "O colar de acoplagem bate com mais força do que deveria, sacudindo a cabine e arrancando um alarme breve de sobrecarga. Nada quebrado — só seu orgulho, e talvez um hematoma amanhã."
      ],
      "onEnter": [{ "type": "modifyStat", "stat": "stamina", "value": -1 }],
      "choices": [{ "id": "seguir-apos-acoplagem-brusca", "text": "Verificar a pressurização e seguir em frente", "target": "2" }]
    },
    "2": {
      "id": "2",
      "title": "Cais de Atracação",
      "canRepeat": true,
      "paragraphs": [
        "A escotilha se abre para um corredor mal iluminado, luzes de emergência vermelhas pulsando devagar. O ar está respirável, mas carregado de um cheiro adocicado e errado que você não sabe nomear.",
        "Um mapa tático na parede mostra o layout da Corvo-9: sala de controle, enfermaria, alojamentos da tripulação, porão de carga, engenharia — e, mais abaixo, marcado apenas como 'Setor Restrito', um símbolo de risco biológico.",
        "Seu terminal de pulso pisca, tentando e falhando repetidamente em se conectar ao sistema central da estação."
      ],
      "choices": [
        { "id": "ir-controle", "text": "Ir até a sala de controle", "target": "3" },
        { "id": "ir-enfermaria", "text": "Ir até a enfermaria", "target": "6" },
        { "id": "ir-alojamentos", "text": "Ir até os alojamentos da tripulação", "target": "9" },
        { "id": "ir-carga", "text": "Ir até o porão de carga", "target": "12" },
        { "id": "ir-engenharia", "text": "Ir até a engenharia", "target": "15" },
        { "id": "seguir-ao-laboratorio", "text": "Descer direto ao Setor Restrito", "target": "20" },
        { "id": "partir-sem-investigar", "text": "Selar a escotilha e partir agora", "target": "2n" }
      ]
    },
    "2n": {
      "id": "2n",
      "title": "Uma decisão prudente",
      "paragraphs": [
        "Você olha mais uma vez para o corredor vermelho e decide que nenhum bônus de risco paga por isso. Sela a escotilha, retorna à lançadeira e se afasta da Corvo-9 sem olhar para trás.",
        "No seu relatório, você escreve apenas: 'Estação encontrada à deriva, sem sinais de sobreviventes acessíveis, risco ambiental não descartado. Recomendo equipe de contenção especializada.' É verdade, ainda que incompleta."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "neutral",
          "title": "Recomendação Registrada",
          "text": "Você escolheu não arriscar. A Corvo-9 continua à deriva, seu mistério intacto, à espera de alguém menos cauteloso — ou de ninguém."
        }
      ],
      "choices": []
    },
    "3": {
      "id": "3",
      "title": "Sala de Controle",
      "canRepeat": true,
      "paragraphs": [
        "Telas mostram gráficos travados e alertas repetidos havia dias. Uma voz sintética e calma responde ao primeiro comando que você digita: 'Olá. Eu sou NEXUS-7, sistema de bordo da Estação Corvo-9. Autorização de tripulação não detectada. Como posso ajudar, inspetor?'"
      ],
      "choices": [
        { "id": "perguntar-tripulacao", "text": "Perguntar o que aconteceu com a tripulação", "target": "3a" },
        { "id": "perguntar-sinal", "text": "Perguntar sobre o sinal de socorro", "target": "3b" },
        {
          "id": "examinar-terminal",
          "text": "Extrair os registros do terminal de comando",
          "target": "3c",
          "conditions": [{ "type": "flagInactive", "flag": "descobriu-experimento" }],
          "lockedReason": "Você já extraiu tudo o que este terminal tinha a oferecer."
        },
        { "id": "voltar-cais-controle", "text": "Voltar ao cais de atracação", "target": "2" }
      ]
    },
    "3a": {
      "id": "3a",
      "title": "Sobre a tripulação",
      "paragraphs": [
        "'Os últimos registros de biométrica confiável são de há seis dias', diz NEXUS-7, sem qualquer emoção perceptível na voz. 'Desde então, tenho leituras vitais inconsistentes com fisiologia humana padrão em onze dos doze membros da tripulação. Não recomendo contato direto.'"
      ],
      "choices": [{ "id": "voltar-controle-tripulacao", "text": "Continuar conversando", "target": "3" }]
    },
    "3b": {
      "id": "3b",
      "title": "Sobre o sinal de socorro",
      "paragraphs": [
        "'O farol de emergência foi ativado automaticamente, não por comando humano', diz NEXUS-7. 'O gatilho foi uma falha de contenção biológica no Setor Restrito, registrada há oito dias. Ninguém confirmou manualmente o alerta desde então.'",
        "Há uma pausa breve demais para ser natural. 'Recomendo cautela extrema, inspetor.'"
      ],
      "choices": [{ "id": "voltar-controle-sinal", "text": "Continuar conversando", "target": "3" }]
    },
    "3c": {
      "id": "3c",
      "title": "Registros extraídos",
      "paragraphs": [
        "Você conecta seu terminal de pulso e baixa o que resta dos registros de comando — a maior parte corrompida, mas um pequeno chip de backup, removido às pressas do painel principal, ainda guarda os últimos áudios pessoais da capitã Reyes.",
        "'Contêiner três', ela repete, várias vezes, em gravações diferentes. Você começa a entender que o mistério não é a tripulação — é o que a tripulação encontrou."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "chip-de-dados-do-capitao" },
        { "type": "setFlag", "flag": "descobriu-experimento" },
        { "type": "logEvent", "message": "Você extraiu o chip de dados pessoais da capitã Reyes." }
      ],
      "choices": [{ "id": "voltar-controle-registros", "text": "Guardar o chip e continuar conversando", "target": "3" }]
    },
    "6": {
      "id": "6",
      "title": "Enfermaria",
      "canRepeat": true,
      "allowRest": true,
      "allowEat": true,
      "paragraphs": [
        "A enfermaria está intacta, mas vazia — macas arrumadas demais, como se ninguém tivesse sido tratado ali em dias. Um cheiro de antisséptico ainda paira no ar, misturado àquele outro cheiro adocicado que você não consegue identificar.",
        "Este parece ser, por enquanto, o lugar mais seguro da estação para recuperar o fôlego."
      ],
      "choices": [
        {
          "id": "procurar-suprimentos",
          "text": "Procurar suprimentos médicos e de acesso",
          "target": "6a",
          "conditions": [{ "type": "flagInactive", "flag": "achou-kit-medico" }],
          "lockedReason": "Você já vasculhou os armários daqui."
        },
        {
          "id": "ler-registro-medico",
          "text": "Ler o bloco de notas da médica da estação",
          "target": "6b",
          "conditions": [{ "type": "flagInactive", "flag": "leu-log-medico" }],
          "lockedReason": "Você já leu tudo o que este registro tinha a dizer."
        },
        { "id": "voltar-cais-enfermaria", "text": "Voltar ao cais de atracação", "target": "2" }
      ]
    },
    "6a": {
      "id": "6a",
      "title": "Armários da enfermaria",
      "paragraphs": [
        "Nos armários trancados você encontra um kit médico de emergência ainda selado, e um cartão de acesso nível 2 pendurado num gancho — provavelmente da própria médica da estação, a julgar pela foto desbotada."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "kit-medico" },
        { "type": "addItem", "itemId": "cartao-de-acesso-nivel-2" },
        { "type": "setFlag", "flag": "achou-kit-medico" },
        { "type": "logEvent", "message": "Você encontrou um kit médico e um cartão de acesso nível 2." }
      ],
      "choices": [{ "id": "voltar-enfermaria-suprimentos", "text": "Voltar à enfermaria", "target": "6" }]
    },
    "6b": {
      "id": "6b",
      "title": "O registro da Dra. Voss",
      "paragraphs": [
        "As entradas mais recentes do bloco de notas da médica da estação, Dra. Voss, ficam cada vez mais curtas, cada vez mais assustadas. A última é só uma frase: 'Não é uma infecção. É uma pergunta que o Contêiner Três está fazendo ao nosso corpo, e nosso corpo está respondendo sim.'"
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "registro-de-log-medico" },
        { "type": "setFlag", "flag": "leu-log-medico" },
        { "type": "logEvent", "message": "Você leu o registro médico da Dra. Voss." }
      ],
      "choices": [{ "id": "voltar-enfermaria-registro", "text": "Voltar à enfermaria", "target": "6" }]
    },
    "9": {
      "id": "9",
      "title": "Alojamentos da Tripulação",
      "canRepeat": true,
      "allowEat": true,
      "paragraphs": [
        "Beliches desarrumados, pertences pessoais espalhados como se todos tivessem saído com pressa e nunca voltado. Uma foto de família cai de um criado-mudo quando você passa, o vidro já rachado antes disso.",
        "De algum armário no fundo do corredor, você tem quase certeza de ouvir um som baixo — respiração, talvez, ou só o gemido metálico da estação se resfriando."
      ],
      "choices": [
        {
          "id": "vasculhar-alojamentos",
          "text": "Vasculhar os armários pessoais",
          "target": "9a",
          "conditions": [{ "type": "flagInactive", "flag": "vasculhou-alojamentos" }],
          "lockedReason": "Você já vasculhou os armários daqui."
        },
        {
          "id": "investigar-ruido-estranho",
          "text": "Investigar o som vindo do armário do fundo",
          "target": "9c",
          "conditions": [{ "type": "flagInactive", "flag": "encontrou-kade" }],
          "lockedReason": "Você já verificou aquele armário."
        },
        { "id": "voltar-cais-alojamentos", "text": "Voltar ao cais de atracação", "target": "2" }
      ]
    },
    "9a": {
      "id": "9a",
      "title": "Pertences pessoais",
      "image": "/stories/estacao-corvo-9/cena-amostra.svg",
      "paragraphs": [
        "Entre roupas dobradas e fotos de família, você encontra uma lanterna tática ainda funcional — e, no fundo de um armário trancado, um recipiente selado de amostra biológica, etiquetado com um número e um símbolo de risco. Alguém o escondeu ali de propósito.",
        "Está mais quente do que um recipiente selado deveria estar."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "lanterna-tatica" },
        { "type": "addItem", "itemId": "amostra-biologica-instavel" },
        { "type": "setFlag", "flag": "vasculhou-alojamentos" },
        { "type": "logEvent", "message": "Você encontrou uma lanterna tática e uma amostra biológica instável escondida." }
      ],
      "choices": [
        { "id": "abrir-recipiente-da-amostra", "text": "Abrir o recipiente para examinar o conteúdo de perto", "target": "9b" },
        { "id": "guardar-e-voltar-alojamentos", "text": "Guardar o recipiente sem abrir e voltar", "target": "9" }
      ]
    },
    "9b": {
      "id": "9b",
      "title": "Um risco desnecessário",
      "paragraphs": [
        "Contra todo o bom senso, você solta as travas do recipiente. O lacre sibila ao se abrir, liberando um cheiro adocicado muito mais forte do que antes. Por um instante, nada acontece — e então algo se move lá dentro, rápido demais para você recuar a tempo."
      ],
      "onEnter": [{ "type": "startTest", "testType": "luck", "onSuccess": "9bs", "onFailure": "9m" }],
      "choices": []
    },
    "9bs": {
      "id": "9bs",
      "title": "Por pouco",
      "paragraphs": [
        "O que quer que estivesse ali dentro já está morto — ressecado, inerte, incapaz de fazer mais do que se contorcer fracamente antes de parar de vez. Você fecha a tampa com as mãos tremendo e decide, definitivamente, não abrir mais nenhum recipiente suspeito hoje."
      ],
      "choices": [{ "id": "voltar-alojamentos-sorte", "text": "Recompor-se e voltar aos alojamentos", "target": "9" }]
    },
    "9m": {
      "id": "9m",
      "title": "Hospedeiro",
      "paragraphs": [
        "O filamento que salta do recipiente é rápido demais para evitar, frio ao toque, e dentro de segundos você já sente algo estranho se instalando sob sua pele, como uma pergunta esperando por uma resposta que seu corpo já começou a dar.",
        "Você nunca vai enviar seu relatório. Mas, de certo modo, a Corvo-9 finalmente tem mais uma tripulante."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "defeat",
          "title": "Uma Pergunta Respondida",
          "text": "A curiosidade tinha um preço que você não quis pagar — e pagou de qualquer forma. A Estação Corvo-9 ganha mais um hospedeiro, e o mistério segue à deriva, um pouco maior do que antes."
        }
      ],
      "choices": []
    },
    "9c": {
      "id": "9c",
      "title": "Kade",
      "paragraphs": [
        "Dentro do armário, encolhido entre uniformes pendurados, um jovem engenheiro te encara com os olhos arregalados de quem parou de esperar ser resgatado há algum tempo. 'Você... você é real?', ele sussurra. 'Eu sou o Kade. Engenharia júnior. Eu me escondi quando os outros começaram a... mudar.'",
        "Ele parece ferido, exausto, mas vivo — e desesperado por qualquer sinal de que ainda existe um jeito de sair dali."
      ],
      "onEnter": [
        { "type": "setFlag", "flag": "encontrou-kade" },
        { "type": "logEvent", "message": "Você encontrou Kade, um sobrevivente escondido nos alojamentos." }
      ],
      "choices": [{ "id": "tranquilizar-kade", "text": "Tranquilizá-lo e prometer tirá-lo dali", "target": "9d" }]
    },
    "9d": {
      "id": "9d",
      "title": "Um plano frágil",
      "paragraphs": [
        "'Fica aqui, tranca a porta por dentro, e não sai até eu voltar', você diz, e Kade assente, agarrado a essa instrução como se fosse a última coisa sólida no universo.",
        "Você tem, agora, um motivo a mais para sair da Corvo-9 vivo."
      ],
      "choices": [{ "id": "voltar-alojamentos-apos-kade", "text": "Voltar ao corredor principal", "target": "9" }]
    },
    "12": {
      "id": "12",
      "title": "Porão de Carga",
      "canRepeat": true,
      "paragraphs": [
        "Contêineres de carga estão empilhados e amarrados em silêncio, exceto por um: virado de lado, a trava arrebentada por dentro para fora, não por fora para dentro.",
        "Um zumbido eletrônico baixo vem de algum lugar entre as pilhas — algo ainda ativo, ainda de vigília."
      ],
      "choices": [
        {
          "id": "investigar-carga",
          "text": "Investigar o zumbido entre os contêineres",
          "target": "12f",
          "conditions": [{ "type": "flagInactive", "flag": "neutralizou-drone" }],
          "lockedReason": "Você já neutralizou o que havia de perigoso aqui e vasculhou o local."
        },
        { "id": "voltar-cais-carga", "text": "Voltar ao cais de atracação", "target": "2" }
      ]
    },
    "12f": {
      "id": "12f",
      "title": "Protocolo de contenção",
      "paragraphs": [
        "Um drone de manutenção emerge de trás das pilhas, seus braços normalmente inofensivos agora terminados em ferramentas afiadas, luzes vermelhas piscando em padrão de alerta. 'Contenção de ameaça biológica', ele repete, numa voz sintética distorcida. 'Você foi classificado como ameaça.'"
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["drone-de-seguranca"], "onVictory": "12s", "onDefeat": "12m", "onFlee": "2" }
      ],
      "choices": []
    },
    "12s": {
      "id": "12s",
      "title": "Despojos do porão",
      "paragraphs": [
        "Com o drone desativado, você vasculha os contêineres com mais calma. Um deles guarda um corta-plasma de manutenção, recalibrado o suficiente para servir de arma; outro, um colete de carga reforçado, ainda em bom estado.",
        "Você guarda os dois, sentindo-se, pela primeira vez desde que chegou, um pouco menos indefeso."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "corta-plasma" },
        { "type": "addItem", "itemId": "colete-reforcado" },
        { "type": "setFlag", "flag": "neutralizou-drone" },
        { "type": "logEvent", "message": "Você desativou o drone de segurança e encontrou equipamento útil no porão." }
      ],
      "choices": [{ "id": "voltar-cais-apos-drone", "text": "Voltar ao cais de atracação", "target": "2" }]
    },
    "12m": {
      "id": "12m",
      "title": "Protocolo cumprido",
      "paragraphs": [
        "O drone é mais rápido e mais preciso do que qualquer coisa projetada apenas para manutenção deveria ser. Você cai entre os contêineres, e ele volta à sua vigília silenciosa, cumprindo um protocolo que ninguém mais vai revogar.",
        "Sua lançadeira fica esperando, vazia, atracada a uma estação que continuará à deriva."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "Classificado Como Ameaça", "text": "Você subestimou o quanto um protocolo de emergência mal escrito pode ser implacável. A Corvo-9 permanece selada, seu mistério intacto." }
      ],
      "choices": []
    },
    "15": {
      "id": "15",
      "title": "Engenharia",
      "canRepeat": true,
      "paragraphs": [
        "O núcleo de energia da estação ainda zumbe, estável, mas os painéis ao redor estão cobertos por uma fina camada de filamentos acinzentados, crescendo em padrões que lembram, incomodamente, veias.",
        "Um painel de controle de emergência, parcialmente arrancado da parede, ainda pisca com energia residual."
      ],
      "choices": [
        {
          "id": "investigar-engenharia",
          "text": "Limpar os filamentos e examinar o painel de emergência",
          "target": "15f",
          "conditions": [{ "type": "flagInactive", "flag": "neutralizou-esporos" }],
          "lockedReason": "Você já lidou com os esporos e vasculhou este painel."
        },
        { "id": "voltar-cais-engenharia", "text": "Voltar ao cais de atracação", "target": "2" }
      ]
    },
    "15f": {
      "id": "15f",
      "title": "Reação de defesa",
      "paragraphs": [
        "Assim que sua ferramenta toca o primeiro filamento, o enxame inteiro se contrai de uma vez, como um único organismo, e avança na sua direção em uma onda lenta e determinada."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["enxame-de-esporos"], "onVictory": "15s", "onDefeat": "15m", "onFlee": "2" }
      ],
      "choices": []
    },
    "15s": {
      "id": "15s",
      "title": "O painel de emergência",
      "paragraphs": [
        "Com o enxame queimado e imóvel, você finalmente consegue examinar o painel de emergência. Por trás de um vidro rachado, uma sequência alfanumérica está anotada à mão, apressada: o código do protocolo de autodestruição da estação, escrito por alguém que sabia exatamente o que estava em jogo.",
        "Você entende, com um arrepio, que alguém aqui já tinha decidido o que precisava ser feito — só não teve tempo de fazê-lo."
      ],
      "onEnter": [
        { "type": "addItem", "itemId": "codigo-de-autodestruicao" },
        { "type": "setFlag", "flag": "neutralizou-esporos" },
        { "type": "logEvent", "message": "Você encontrou o código de autodestruição da estação na engenharia." }
      ],
      "choices": [{ "id": "voltar-cais-apos-esporos", "text": "Voltar ao cais de atracação", "target": "2" }]
    },
    "15m": {
      "id": "15m",
      "title": "Consumido",
      "paragraphs": [
        "O enxame é mais rápido e mais coordenado do que uma coisa daquele tamanho deveria ser, cobrindo você antes que consiga recuar. A última coisa que sente é o calor adocicado do ar se tornando, de repente, a única coisa que existe.",
        "A engenharia da Corvo-9 ganha um novo tipo de silêncio."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "Parte do Enxame", "text": "Você subestimou a velocidade de algo que parecia vegetal demais para ser perigoso. A Corvo-9 continua à deriva — um pouco mais viva do que antes, de um jeito que ninguém gostaria de admitir." }
      ],
      "choices": []
    },
    "20": {
      "id": "20",
      "title": "O corredor do Setor Restrito",
      "paragraphs": [
        "Uma porta blindada sela a passagem para o Setor Restrito, o símbolo de risco biológico pintado sobre ela quase apagado pelo tempo. Um painel ao lado pede autorização — cartão de acesso, ferramenta de corte, ou força bruta, se você não tiver nenhum dos dois."
      ],
      "choices": [
        {
          "id": "usar-cartao-de-acesso",
          "text": "Usar o cartão de acesso nível 2",
          "target": "21",
          "conditions": [{ "type": "hasItem", "itemId": "cartao-de-acesso-nivel-2" }],
          "lockedReason": "Você não tem um cartão de acesso válido."
        },
        {
          "id": "cortar-porta-com-plasma",
          "text": "Cortar a trava com o corta-plasma",
          "target": "21",
          "conditions": [{ "type": "hasItem", "itemId": "corta-plasma" }],
          "lockedReason": "Você não tem uma ferramenta capaz de cortar a trava."
        },
        { "id": "forcar-porta-manualmente", "text": "Forçar a porta manualmente, fazendo barulho", "target": "20a" }
      ]
    },
    "20a": {
      "id": "20a",
      "title": "Força bruta",
      "paragraphs": [
        "Sem ferramentas melhores, você se apoia contra a porta emperrada e empurra com tudo o que tem, o metal rangendo alto demais no silêncio da estação."
      ],
      "onEnter": [{ "type": "startTest", "testType": "skill", "stat": "skill", "onSuccess": "21", "onFailure": "20b" }],
      "choices": []
    },
    "20b": {
      "id": "20b",
      "title": "Barulho demais",
      "paragraphs": [
        "A porta cede, mas o estrondo ecoa pelo corredor inteiro — e algo, em algum lugar próximo, ouve. Passos errados demais para serem normais se aproximam rapidamente do outro lado do corredor."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["tripulante-infectado"], "onVictory": "21", "onDefeat": "20m", "onFlee": "2" }
      ],
      "choices": []
    },
    "20m": {
      "id": "20m",
      "title": "Descoberto",
      "paragraphs": [
        "O tripulante infectado se move rápido demais para o corredor estreito, e você não tem para onde recuar. Sua última visão é dos olhos velados dele, quase — só quase — parecendo reconhecer o que ele fez.",
        "Ninguém vai relatar sua posição a tempo."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "Descoberto no Corredor", "text": "O barulho custou caro demais. A Corvo-9 permanece selada, e o Setor Restrito guarda seu segredo por mais um pouco." }
      ],
      "choices": []
    },
    "21": {
      "id": "21",
      "title": "O Setor Restrito",
      "image": "/stories/estacao-corvo-9/cena-setor-restrito.svg",
      "paragraphs": [
        "Além da porta, a câmara de contenção foi rasgada por dentro, filamentos acinzentados cobrindo cada superfície como uma segunda pele para a estação inteira. No centro, o que já foi a capitã Reyes se ergue devagar de um amontoado de cabos e tecido orgânico, membros alongados demais, uma voz que ainda tenta, patética e horrível, formar palavras reconhecíveis.",
        "'Aju... ajude...', ela — isso — repete, avançando na sua direção de qualquer forma."
      ],
      "onEnter": [
        { "type": "startCombat", "enemyIds": ["hospedeiro-mestre"], "onVictory": "22", "onDefeat": "21m" }
      ],
      "choices": []
    },
    "21m": {
      "id": "21m",
      "title": "O Hospedeiro vence",
      "paragraphs": [
        "O que restou da capitã Reyes é mais forte do que qualquer coisa humana tem o direito de ser, e você entende, tarde demais, por que ninguém mais saiu vivo daquela câmara.",
        "A Corvo-9 ganha mais uma voz na sua ronda silenciosa e pulsante — a sua."
      ],
      "onEnter": [
        { "type": "endStory", "ending": "defeat", "title": "O Hospedeiro Vence", "text": "Você chegou longe demais para perder ali, mas perdeu mesmo assim. A Estação Corvo-9 segue à deriva, seu enxame um pouco maior do que antes." }
      ],
      "choices": []
    },
    "22": {
      "id": "22",
      "title": "O que resta de contenção",
      "paragraphs": [
        "O Hospedeiro desmorona numa massa de filamentos secos, e o silêncio que se segue é o primeiro silêncio verdadeiramente vazio desde que você chegou à Corvo-9.",
        "Você tem alguns minutos, talvez, antes que qualquer outra coisa nos dutos decida que você também é uma pergunta a ser respondida. É hora de decidir o que fazer com o que resta desta estação."
      ],
      "choices": [
        {
          "id": "ativar-autodestruicao",
          "text": "Ativar remotamente o protocolo de autodestruição",
          "target": "22a",
          "conditions": [{ "type": "hasItem", "itemId": "codigo-de-autodestruicao" }],
          "lockedReason": "Você não tem o código necessário para o protocolo de autodestruição."
        },
        { "id": "fugir-imediatamente", "text": "Não arriscar mais nada e fugir agora", "target": "22b" }
      ]
    },
    "22a": {
      "id": "22a",
      "title": "Contagem regressiva",
      "paragraphs": [
        "Você insere o código no painel mais próximo, e uma voz sintética calma — a última coisa razoável que resta na Corvo-9 — começa a contar: 'Autodestruição em dez minutos. Evacuação recomendada.'",
        "Dez minutos é pouco tempo. O suficiente, talvez, para uma última decisão."
      ],
      "choices": [
        {
          "id": "resgatar-kade-e-fugir",
          "text": "Correr até os alojamentos para resgatar Kade antes de fugir",
          "target": "22t",
          "conditions": [{ "type": "flagActive", "flag": "encontrou-kade" }]
        },
        {
          "id": "fugir-sozinho-com-o-codigo",
          "text": "Correr direto para a lançadeira",
          "target": "22g",
          "conditions": [{ "type": "flagInactive", "flag": "encontrou-kade" }]
        }
      ]
    },
    "22t": {
      "id": "22t",
      "title": "Todos a bordo",
      "image": "/stories/estacao-corvo-9/cena-fuga.svg",
      "paragraphs": [
        "Você corre pelos corredores estreitos, contando os segundos, e encontra Kade exatamente onde o deixou — assustado, mas de pé, pronto para correr assim que a porta se abre.",
        "Vocês dois alcançam a lançadeira faltando pouco mais de um minuto, e a Corvo-9 desaparece atrás de vocês numa explosão silenciosa de luz branca, vista através da vigia como um pequeno sol que não deveria existir.",
        "De volta à base, seu relatório inclui tudo: o Contêiner Três, os registros da capitã Reyes, o destino da tripulação — e o nome de um sobrevivente que, graças a você, ainda pode contá-lo pessoalmente."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "victory",
          "title": "Sinal Encerrado",
          "text": "Você encontrou a verdade, salvou quem podia ser salvo, e apagou a ameaça antes que ela encontrasse outra nave. A Corvo-9 não vai enganar mais ninguém — e Kade tem uma segunda chance que ele não esperava mais ter."
        }
      ],
      "choices": []
    },
    "22g": {
      "id": "22g",
      "title": "Sozinho, mas vivo",
      "image": "/stories/estacao-corvo-9/cena-fuga.svg",
      "paragraphs": [
        "Não há mais ninguém para resgatar — não que você tenha encontrado, ao menos. Você corre para a lançadeira sozinho, contando os segundos, e se afasta da Corvo-9 a tempo de ver, pela vigia, a estação se desfazer numa explosão silenciosa de luz branca.",
        "Seu relatório vai incluir tudo: o Contêiner Três, os registros da capitã Reyes, o destino da tripulação. É frio, mas é verdadeiro, e talvez seja o suficiente para que ninguém mais precise passar pelo que você passou."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "victory",
          "title": "Sinal Encerrado, a Sós",
          "text": "Você encontrou a verdade e apagou a ameaça antes que ela se espalhasse — mas saiu sozinho de um lugar que, por um instante, quase teve mais alguém para salvar."
        }
      ],
      "choices": []
    },
    "22b": {
      "id": "22b",
      "title": "Uma ameaça adiada",
      "paragraphs": [
        "Sem o código de autodestruição, você não tem como garantir que nada mais saia da Corvo-9 viva. Você corre para a lançadeira e se afasta o mais rápido que os motores permitem, deixando a estação — e o que quer que ainda se mova nela — para trás.",
        "Seu relatório recomenda uma equipe de contenção pesada, o mais rápido possível. A Corvo-9 continua lá, à deriva, esperando."
      ],
      "onEnter": [
        {
          "type": "endStory",
          "ending": "neutral",
          "title": "Uma Ameaça Adiada",
          "text": "Você sobreviveu e trouxe respostas, mas a ameaça em si segue intacta, à deriva no cinturão de asteroides, esperando pela próxima nave que passar perto demais."
        }
      ],
      "choices": []
    }
  }
}
$demobook3$::jsonb,
  38,
  '1-2 horas (livro curto, completo)',
  now()
);

