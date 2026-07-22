/**
 * ÚNICO ARQUIVO DE CONTEÚDO DA LP — LP_GUIDE §2
 *
 * ⚠️ ITENS MARCADOS COM `PENDENTE` PRECISAM SER CONFIRMADOS COM O CLIENTE
 * ANTES DE PUBLICAR. Rode `npm run pendencias` para listar todos.
 *
 * Confirmados via pesquisa pública (Instagram/Facebook/Google):
 *   nome, registro CREF, endereço, telefone, email, instagram, seguidores.
 */

export const site = {
  nome: "Supreme Fitness",
  registro: "CREF 000798-PJ",
  slogan: "A cidade trabalha. A gente treina.",
  cidade: "Santa Cruz do Capibaribe – PE",

  contato: {
    whatsapp: import.meta.env.VITE_WHATSAPP_PHONE,
    mensagemWhatsapp: import.meta.env.VITE_WHATSAPP_MESSAGE,
    email: import.meta.env.VITE_EMAIL,
    telefoneExibicao: "(81) 98995-7810",
    instagram: "https://www.instagram.com/academia.supreme",
    instagramHandle: "@academia.supreme",
    facebook: "https://www.facebook.com/AcademiaSupreme",
    endereco: "Rua João Pereira de Abreu, 21",
    bairro: "Santa Cruz do Capibaribe – PE",
    // PENDENTE: confirmar o link exato do Google Maps / coordenadas do pin
    maps: "https://www.google.com/maps/search/?api=1&query=Rua+Jo%C3%A3o+Pereira+de+Abreu%2C+21+Santa+Cruz+do+Capibaribe+PE",
  },

  navegacao: [
    { label: "Estrutura", href: "#estrutura" },
    { label: "Modalidades", href: "#modalidades" },
    { label: "Resultados", href: "#resultados" },
    { label: "Planos", href: "#planos" },
    { label: "Horários", href: "#horarios" },
  ],

  hero: {
    sobretitulo: "Santa Cruz do Capibaribe · desde 2014",
    titulo: ["A CIDADE", "TRABALHA.", "A GENTE TREINA."],
    subtitulo:
      "Aberto às 5h para quem começa cedo. Aberto às 22h para quem termina tarde. A estrutura é nossa — o peso é seu.",
    cta: "Aula experimental grátis",
    ctaSecundario: "Ver planos",
  },

  // Faixa de prova social — seção 02
  provas: [
    "12 MIL ALUNOS E SEGUIDORES",
    "CREF 000798-PJ",
    "ABERTO ÀS 5H",
    "MUSCULAÇÃO",
    "FUNCIONAL",
    "CROSS",
    "DANÇA E RITMOS",
    "AVALIAÇÃO FÍSICA",
    "A MELHOR DE SANTA CRUZ",
  ],

  estrutura: {
    titulo: "ESTRUTURA DE CAPITAL,\nPREÇO DE INTERIOR",
    texto:
      "Equipamento novo, ar-condicionado, vestiário completo e espaço pra treinar sem fila. Não é a academia possível — é a academia que a gente quis pra nós mesmos.",
    itens: [
      { valor: 1200, sufixo: "m²", label: "de área de treino" },
      { valor: 180, sufixo: "+", label: "equipamentos" },
      { valor: 17, sufixo: "h", label: "abertos por dia" },
      { valor: 12, sufixo: "K", label: "alunos e seguidores" },
    ],
  },

  modalidades: [
    {
      nome: "Musculação",
      texto:
        "Área de peso livre e máquinas para todos os grupos musculares, com professor em sala o dia inteiro.",
      tag: "Todos os níveis",
    },
    {
      nome: "Funcional",
      texto:
        "Treino em circuito, alta intensidade e pouco tempo. Feito pra quem tem 45 minutos e quer resultado.",
      tag: "45 min",
    },
    {
      nome: "Cross",
      texto:
        "Força, condicionamento e comunidade. Turmas com horário fixo e progressão acompanhada.",
      tag: "Turmas fixas",
    },
    {
      nome: "Dança e Ritmos",
      texto:
        "Queima calórica alta sem parecer treino. As turmas mais cheias da casa — chegue cedo.",
      tag: "Mais procurada",
    },
    {
      nome: "Avaliação Física",
      texto:
        "Bioimpedância, dobras e plano de treino individual. Refeita a cada 3 meses para medir o que mudou.",
      tag: "Incluso nos planos",
    },
    {
      nome: "Personal Trainer",
      texto:
        "Acompanhamento individual com profissional registrado, para objetivo específico ou retorno pós-lesão.",
      tag: "Sob agendamento",
    },
  ],

  // PENDENTE: substituir por casos reais, com autorização de imagem assinada
  transformacoes: [
    {
      nome: "PENDENTE — Aluno 01",
      semanas: 24,
      metrica: 14,
      metricaSufixo: "kg",
      metricaLabel: "perdidos",
      depoimento:
        "PENDENTE: coletar depoimento real do aluno, 1 a 2 frases, com autorização de uso de imagem.",
    },
    {
      nome: "PENDENTE — Aluno 02",
      semanas: 36,
      metrica: 9,
      metricaSufixo: "kg",
      metricaLabel: "de massa magra",
      depoimento: "PENDENTE: coletar depoimento real do aluno.",
    },
    {
      nome: "PENDENTE — Aluno 03",
      semanas: 16,
      metrica: 11,
      metricaSufixo: "kg",
      metricaLabel: "perdidos",
      depoimento: "PENDENTE: coletar depoimento real do aluno.",
    },
    {
      nome: "PENDENTE — Aluno 04",
      semanas: 52,
      metrica: 22,
      metricaSufixo: "kg",
      metricaLabel: "perdidos",
      depoimento: "PENDENTE: coletar depoimento real do aluno.",
    },
  ],

  // PENDENTE: TODOS os preços e condições precisam ser confirmados com o cliente
  planos: [
    {
      id: "mensal",
      nome: "Mensal",
      preco: 169.9,
      periodo: "/mês",
      chamada: "Sem fidelidade",
      destaque: false,
      beneficios: [
        "Acesso livre a todas as modalidades",
        "Avaliação física inclusa",
        "Sem taxa de matrícula",
        "Cancele quando quiser",
      ],
    },
    {
      id: "trimestral",
      nome: "Trimestral",
      preco: 149.9,
      periodo: "/mês",
      chamada: "O mais escolhido",
      destaque: true,
      beneficios: [
        "Tudo do plano Mensal",
        "Plano de treino individual",
        "Reavaliação a cada 3 meses",
        "1 sessão de personal por mês",
      ],
    },
    {
      id: "anual",
      nome: "Anual",
      preco: 119.9,
      periodo: "/mês",
      chamada: "Melhor custo",
      destaque: false,
      beneficios: [
        "Tudo do plano Trimestral",
        "2 meses de desconto no ano",
        "Acompanhamento nutricional parceiro",
        "Camiseta oficial Supreme",
      ],
    },
  ],

  // PENDENTE: confirmar horários reais, incluindo feriados
  horarios: [
    { dia: "Segunda a sexta", abre: "05:00", fecha: "22:00", dias: [1, 2, 3, 4, 5] },
    { dia: "Sábado", abre: "07:00", fecha: "13:00", dias: [6] },
    { dia: "Domingo", abre: null, fecha: null, dias: [0] },
  ],

  // Intensidade 0–100 por faixa de horário — resolve a objeção "vai estar lotado?"
  pico: [
    { faixa: "05h – 07h", intensidade: 65 },
    { faixa: "07h – 11h", intensidade: 30 },
    { faixa: "11h – 14h", intensidade: 45 },
    { faixa: "14h – 17h", intensidade: 25 },
    { faixa: "17h – 20h", intensidade: 100 },
    { faixa: "20h – 22h", intensidade: 55 },
  ],

  ctaFinal: {
    titulo: "SUA PRIMEIRA SÉRIE\nCOMEÇA HOJE.",
    texto:
      "Aula experimental grátis, sem compromisso e sem cadastro. Chame no WhatsApp e escolha o melhor horário.",
    cta: "Quero minha aula grátis",
  },

  seo: {
    titulo: "Supreme Fitness | Academia em Santa Cruz do Capibaribe – PE",
    descricao:
      "Musculação, funcional, cross e dança em Santa Cruz do Capibaribe. Aberto das 5h às 22h para quem trabalha. Agende sua aula experimental grátis.",
    ogImagem: "/og-image.jpg",
  },
};

/**
 * PROGRESSIVE OVERLOAD — a barra de supino do HUD (BRIEF §2).
 *
 * Em vez de um número abstrato subindo, a barra ganha um PAR de anilhas a cada
 * trecho vencido da página. O número passa a ser consequência do que está na
 * barra, não um contador solto — por isso ele anda em degraus, não linearmente.
 *
 * Ordem de carregamento é a real da academia: anilha pesada por dentro,
 * leve por fora. Carga final = 20 + 2×(20+20+15+10+10+5) = 180 kg.
 */
export const supino = {
  barra: 20, // barra olímpica
  pares: [20, 20, 15, 10, 10, 5], // kg de cada anilha, por lado

  // Ponto do scroll (0–1) em que cada par entra na barra.
  // Espaçados para cair perto da virada de cada seção.
  limiares: [0.08, 0.22, 0.37, 0.52, 0.66, 0.8],
};

/** Carga final na barra, em kg. Derivada — não editar à mão. */
export const CARGA_TOTAL =
  supino.barra + supino.pares.reduce((soma, kg) => soma + kg * 2, 0);
