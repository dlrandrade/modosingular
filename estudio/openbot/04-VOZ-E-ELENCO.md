# Voz, vícios proibidos e elenco do livro

Trechos de `apostila/ORQUESTRADOR.yaml` (fonte única). A seção `voz` diz como se escreve; `antivicios` lista as expressões que não podem aparecer; `elenco` descreve as quatro personagens compostas (Renata, Otávio, Lúcia, Caio), que nunca são clientes reais.

```yaml
voz:
  resumo: >
    Um mentor sênior, direto e respeitoso, que escreve como quem já viu
    muito caso e não precisa levantar a voz. Adulto, preciso, com calor
    contido e humor seco e raro. Trata o leitor como colega inteligente.
  pessoa: >
    Segunda pessoa ("você"). O narrador pode usar "eu" para opinião e
    posicionamento, NUNCA para inventar episódios da própria biografia.
  registro: >
    Português do Brasil culto e conversado. Nada de gerundismo, jargão de
    coach, anglicismo de marketing ou linguagem institucional.
  ritmo: >
    Parágrafos de 3 a 6 frases como regra. Frases de comprimento variado:
    longas que desenvolvem, curtas que fecham. A frase-soco isolada em
    parágrafo próprio é tempero, não prato: no máximo 4 por capítulo.
  concretude: >
    Toda ideia abstrata desce a uma cena, um caso ou um detalhe de ofício
    em até dois parágrafos. Detalhe específico > adjetivo. Profissões
    variadas; nunca "um profissional" genérico quando cabe "uma
    fonoaudióloga que atende crianças com atraso de fala".
  estrutura_de_prosa: >
    Abrir com cena ou situação reconhecível, não com definição. O conceito
    nasce do caso e só então ganha nome (box "Conceito"). Fechar o texto
    corrido com consequência prática, não com moral.
  numeros: >
    Nenhum número inventado apresentado como dado. Gráficos do PWA viram
    esquemas ilustrativos e são rotulados assim. Percentuais só em falas
    hipotéticas de personagens ("em quatro de cada cinco casos que eu vejo")
    ou como estimativa que o LEITOR faz sobre si.
  etica: >
    Profissões regulamentadas (saúde, direito, psicologia) têm códigos de
    publicidade. O livro lembra isso onde importa (Antes de começar; cap. 13;
    cap. 27) sem virar manual jurídico. Nada de prometer resultado.
  exemplos:
    ruim:
      - "Em um mundo cada vez mais digital, é fundamental que o especialista potencialize sua presença."
      - "Não é sobre aparecer. É sobre ser visto. E isso muda tudo."
      - "Sua voz é única, poderosa e transformadora."
      - "O resultado? Um perfil genérico."
    bom:
      - "A paciente chegou com um print. Alguém tinha explicado a dor dela em quarenta segundos, com uma trilha animada ao fundo, e ela acreditou."
      - "Renata não tinha um problema de marketing. Tinha catorze anos de casos e nenhum deles estava no perfil."
      - "Se você nunca discordou de nada em público, ninguém tem motivo para lembrar do que você pensa."

# ---------------------------------------------------------------------
#  Vícios de IA e de texto de curso. O orquestrador.py implementa estas
#  checagens em `lint`. ERRO bloqueia o gate; AVISO vai para a revisão.
antivicios:
  proibidas:     # ERRO — expressões que não aparecem em lugar nenhum do capítulo
    - "mergulh(ar|o|e|amos)"
    - "desvend(ar|a|e)"
    - "potencializ"
    - "alavanc"
    - "impulsion"
    - "desbloque"
    - "crucial"
    - "tapeçaria"
    - "sinergia"
    - "ecossistema"
    - "no cenário atual"
    - "nos dias de hoje"
    - "em um mundo (cada vez|onde|em que)"
    - "cada vez mais (digital|conectado)"
    - "vale (ressaltar|destacar|lembrar)"
    - "é importante (ressaltar|destacar|lembrar|notar|frisar)"
    - "em suma"
    - "em resumo"
    - "verdadeiramente"
    - "genuinamente"
    - "incríve(l|is)"
    - "poderos[oa]s?"
    - "transformador[a]?s?"
    - "revolucion"
    - "divisor de águas"
    - "virar a chave"
    - "zona de conforto"
    - "próximo nível"
    - "empoder"
    - "ressignific"
    - "gatilho mental"
    - "conteúdo de valor"
    - "(entregar|agregar|gerar) valor"
    - "autentic"
    - "jornada"          # no livro, usar "percurso", "caminho", "trinta dias"
    - "mindset"
    - "storytelling"
    - "insights?"
    - "branding"
    - "networking"
    - "perform(ar|a|am)\\b"
    - "clique"
    - "botão"
    - "no app"
    - "aplicativo do curso"
    - "!"                # exclamação: zero
  limites_por_capitulo:   # ERRO se ultrapassar (contados só na prosa)
    nao_e_e: 2            # "não é X. É Y." / "não é X, é Y" / "não é X — é Y"
    frase_soco: 4         # parágrafo de 1 frase com menos de 12 palavras
    repare_perceba: 1     # "Repare", "Perceba", "Note que"
    pergunta_resposta: 1  # "O resultado? Um..." (pergunta curta respondida em seguida)
    virgula_e_nao: 3      # ", e não Y" — a antítese disfarçada (revisão cap01-r1)
    sinalizacao: 1        # "vale olhar", "convém", "antes de seguir", "por ora"... narrador que anuncia
    suposicao_leitor: 1   # "Talvez você…", "É provável que você…", "Você provavelmente…"
    te_pronome: 0         # "te" fora do roteiro de fala (tratamento é "você")
  limites_por_mil_palavras:   # AVISO
    travessao: 7          # "—" na prosa
    interrogacao: 8
    triade: 4             # "a, b e c" de palavras soltas
  estatisticas_de_frase:      # AVISO
    media_min: 11
    media_max: 22
    desvio_min: 6         # variação de comprimento (ritmo)

# ---------------------------------------------------------------------
#  Lições das revisões cegas. Valem para TODOS os capítulos, escritos ou a escrever.
```

## Elenco

```yaml
elenco:
  nota_ao_leitor: >
    Quatro personagens compostos atravessam o livro. São feitos de traços
    de muitos especialistas reais; nenhum é uma pessoa identificável. Cada
    um encarna um dos quatro modos de pensar (cap. 7) — o leitor só
    descobre isso na Fase II, mas os sinais estão plantados desde a Fase I.
  personagens:
    renata:
      nome: "Renata Moura"
      idade: 41
      oficio: "fisioterapeuta, dor lombar crônica, consultório próprio em Curitiba há 14 anos"
      modo: "pensa FALANDO — explica com as mãos, por analogia, em voz alta"
      ponto_de_partida: >
        Quatro de cada cinco pacientes novos chegam por indicação de dois
        ortopedistas. Perfil montado por um sobrinho seis anos atrás: fotos de
        alongamento, "cuide da sua coluna" com coração azul. Tentou carrossel
        (formato de quem pensa escrevendo) e parou no 23º dia.
      marcas: ["'a dor não é o inimigo, é o alarme'", "desenha no ar com as mãos", "pergunta 'e de manhã, como é?' a todo paciente"]
      personagens_de_apoio: "Marcos (47, paciente do cap. 1: dor pior ao acordar; encaminhado a reumatologista; frase 'parecia perfil de academia')"
      arco: >
        F1 reconhece a assimetria e a desistência como atrito de formato ->
        F2 descobre o modo oral e um ritmo de 2 peças por semana ->
        F3 publica caso-prova e contraponto sobre "postura correta" ->
        F4 caderno de campo em áudios de 20 s; cresce e quase se descaracteriza ->
        F5 o perfil vira porta de entrada; pacientes chegam citando vídeos antigos.
    otavio:
      nome: "Otávio Bezerra"
      idade: 52
      oficio: "advogado trabalhista que defende pequenas empresas, Recife, 25 anos de prática"
      modo: "pensa ESCREVENDO — pareceres longos, e-mails que os clientes guardam"
      ponto_de_partida: >
        Contratou agência: 15 posts por mês do tipo "Você sabia?". Corretos e
        anônimos. Aprova tudo porque nada está errado. Não saberia defender
        nos comentários metade do que sai com o nome dele.
      marcas: ["'contrato assinado não é prova de nada'", "começa pela pior hipótese", "escreve à mão antes de digitar"]
      arco: >
        F1 terceirização prematura; descobre que a rotina já produz matéria-prima (e-mails a clientes) ->
        F2 a opinião que custa cliente (recusa acordos de fachada) ->
        F3 publica a explicação que repete há anos ->
        F4 ritual encaixado depois de cada parecer; volta à agência na ordem certa ->
        F5 mede o que decide (consultas qualificadas), não curtidas.
    lucia:
      nome: "Lúcia Prado"
      idade: 36
      oficio: "psicóloga clínica, adultos com ansiedade, Porto Alegre"
      modo: "pensa RESPONDENDO — ganha clareza quando alguém pergunta"
      ponto_de_partida: >
        Não publica nada por receio de exposição e por zelo com o sigilo.
        Pacientes chegam com autodiagnósticos de vídeos curtos e ela gasta
        sessões desfazendo rótulos.
      marcas: ["'rótulo não é diagnóstico'", "responde pergunta com pergunta antes de responder", "cuidado extremo com sigilo"]
      arco: >
        F1 o silêncio também comunica ->
        F2 ritmo do pior mês (dezembro/férias de pacientes) ->
        F3 tradução com sigilo; contraponto sobre excesso de rótulos ->
        F4 para de copiar a voz de uma psicóloga famosa e leva só a estrutura; referência sem cópia ->
        F5 a oferta sem quebrar vínculo, dentro do código de ética.
    caio:
      nome: "Caio Tavares"
      idade: 33
      oficio: "arquiteto de reformas de apartamentos antigos, Campinas"
      modo: "pensa CONTANDO — tudo vira história de obra"
      ponto_de_partida: >
        Comprou câmera, estabilizador e duas luzes. Fez seis vídeos
        cinematográficos em onze fins de semana de edição. Parou.
      marcas: ["'toda parede tem uma história, e metade é mentira'", "começa com 'teve uma obra…'", "mede tudo com o passo"]
      arco: >
        F1 produção cinematográfica não é autoridade ->
        F2 o léxico da obra ->
        F3 a pergunta recorrente ("dá para derrubar essa parede?"); o critério para recusar projeto ->
        F4 formato mínimo viável: uma foto de obra e cinco linhas ->
        F5 um texto de um ano atrás ainda traz clientes; sustenta no mês difícil.
  figurantes_permitidos: >
    Uma participação por profissão, sem repetir no mesmo capítulo:
    dentista, nutricionista, contadora, veterinária, engenheiro estrutural,
    professora de piano, cardiologista, fonoaudióloga, oftalmologista,
    advogada de família, consultora de RH, personal trainer, corretor de
    seguros, pediatra, farmacêutica, designer de interiores, professor de
    cursinho, dermatologista, mecânico de motos, confeiteira.
    Os usados ficam registrados em ESTADO.yaml › figurantes.

# ---------------------------------------------------------------------
```
