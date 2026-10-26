// Client inclusion authorized for portfolio review on 2026-10-14; Afeto Nobre and LaLeLis added on 2026-10-26.
// Descriptions and captures checked against the sites' code; no performance claims.
export const CLIENT_PROJECTS = [
  {
    key: "afetoProject",
    name: "Afeto Nobre",
    url: "https://afetonobre.com.br/",
    domain: "afetonobre.com.br",
    desktop: "/assets/portfolio/afeto-desktop.webp",
    mobile: "/assets/portfolio/afeto-mobile.webp",
  },
  {
    key: "lalelisProject",
    name: "LaLeLis",
    url: "https://lalelis.com.br/",
    domain: "lalelis.com.br",
    desktop: "/assets/portfolio/lalelis-desktop.webp",
    mobile: "/assets/portfolio/lalelis-mobile.webp",
  },
  {
    key: "infinityProject",
    name: "Infinity Car Studio",
    url: "https://infinitycarstudio.com.br/",
    domain: "infinitycarstudio.com.br",
    desktop: "/assets/portfolio/infinity-desktop.webp",
    mobile: "/assets/portfolio/infinity-mobile.webp",
  },
  {
    key: "jujuProject",
    name: "Bolachinhas da Vovó Juju",
    url: "https://bolachinhadavovojuju.com.br/",
    domain: "bolachinhadavovojuju.com.br",
    desktop: "/assets/portfolio/juju-desktop.webp",
    mobile: "/assets/portfolio/juju-mobile.webp",
  },
];

const project = key => CLIENT_PROJECTS.find(item => item.key === key);

// The homepage keeps its two original client cards; the full portfolio lists every client.
export const HOME_CLIENT_KEYS = ["infinityProject", "jujuProject"];
export const CLIENT_KEYS = CLIENT_PROJECTS.map(item => item.key);
export const nextClientKey = key => CLIENT_KEYS[(CLIENT_KEYS.indexOf(key) + 1) % CLIENT_KEYS.length];

export const PORTFOLIO_PAGES = {
  portfolio: {
    path: "/projetos/",
    label: "Projetos",
    metaTitle: "Projetos: sites e aplicativos iOS | Tetelestai",
    metaDescription: "Landing pages da Afeto Nobre, LaLeLis e Vovó Juju, o site da Infinity Car Studio e os apps iOS De Rolê e Tempo de Recarga, feitos pela Tetelestai.",
    eyebrow: "Projetos",
    heading: "Projetos no ar: sites para negócios e aplicativos na App Store",
    intro: "Abra no seu celular. É assim que o seu cliente vai ver a sua página.",
    jumpSites: "Sites de clientes",
    jumpApps: "Aplicativos iOS",
    sites: { eyebrow: "Sites de clientes", title: "Identidades diferentes, o mesmo cuidado com o cliente final" },
    apps: { eyebrow: "Da ideia ao aplicativo", title: "Aplicativos iOS", aside: "Os dois foram desenhados, programados e publicados pela Tetelestai." },
    appsCta: {
      eyebrow: "Apps iOS e Android", title: "Quer um aplicativo para o seu negócio?",
      text: "Do protótipo à publicação na App Store e no Google Play. Escopo, prazo e preço vêm por escrito, depois de uma conversa.",
      cta: "Pedir orçamento de app", waMessage: "Olá! Quero um orçamento de aplicativo (iOS/Android) para o meu negócio.",
    },
    instagram: {
      eyebrow: "Além dos projetos", title: "Conteúdos no Instagram",
      aside: "Vídeos autorais e remixes do IA na Prática, publicados em colaboração com a TETELESTAI.",
      more: "Conhecer o IA na Prática",
    },
    final: { title: "Quer um projeto assim para o seu negócio?", text: "Conte o que você precisa. A proposta vem com preço e prazo." },
  },
  afetoProject: {
    ...project("afetoProject"),
    path: "/projetos/afeto-nobre/",
    label: "Afeto Nobre",
    metaTitle: "Afeto Nobre — case de landing page | Tetelestai",
    metaDescription: "A landing page da Afeto Nobre, doces artesanais no Guará, em Brasília: vitrine de sabores, bolos personalizados e orçamento pelo WhatsApp.",
    category: "Doces artesanais · Landing page",
    summary: "Vitrine de sabores, bolos sob encomenda e botões de orçamento que já abrem o WhatsApp com a mensagem certa para cada pedido.",
    eyebrow: "Case · Doces artesanais",
    intro: "Landing page de doces artesanais no Guará, em Brasília: os sabores em destaque, os bolos sob encomenda e o pedido de orçamento direto no WhatsApp.",
    altDesktop: "Página inicial do site da Afeto Nobre no computador",
    altMobile: "Site da Afeto Nobre no celular",
    facts: [["Cliente", "Afeto Nobre Doces Artesanais"], ["Segmento", "Doces artesanais"], ["Local", "Guará, Brasília-DF"], ["Tipo de projeto", "Landing page de R$ 697"], ["Produtos do cliente", "Brigadeiros, cajuzinho e bolos personalizados"], ["Contato", "WhatsApp e Direct do Instagram"]],
    decisions: [
      { k: "Objetivo", title: "Mostrar os sabores e facilitar o orçamento", text: "Quem encomenda doces para uma festa quer ver os sabores e saber como pedir. A página reúne as duas coisas numa rolagem só." },
      { k: "Vitrine", title: "Sabores com foto e zoom", text: "Os docinhos aparecem num carrossel de cinco sabores, com foto ampliável e uma descrição curta de cada um." },
      { k: "Pedido", title: "Cada botão com a sua mensagem", text: "Os botões de doces e de bolo abrem o WhatsApp com uma mensagem pronta que pede o que o orçamento precisa: sabores e quantidade, ou a ideia do bolo, e a data da festa." },
      { k: "Parceria", title: "Indicação da marca irmã", text: "A seção Confira também apresenta a LaLeLis, que faz topos de bolo e papelaria personalizada, para completar a festa." },
    ],
    delivered: ["Landing page responsiva", "Vitrine de sabores com zoom nas fotos", "Seções de bolos e encomendas", "Botões de WhatsApp com mensagens prontas", "Link para o Instagram da marca"],
  },
  lalelisProject: {
    ...project("lalelisProject"),
    path: "/projetos/lalelis/",
    label: "LaLeLis",
    metaTitle: "LaLeLis — case de landing page | Tetelestai",
    metaDescription: "A landing page da LaLeLis, papelaria personalizada no DF: galeria de peças, lista de produtos e pedido de orçamento que chega pronto no WhatsApp.",
    category: "Papelaria personalizada · Landing page",
    summary: "O cliente marca os produtos, conta o tema e envia a lista: o WhatsApp abre com o pedido escrito.",
    eyebrow: "Case · Papelaria personalizada",
    intro: "Landing page de papelaria personalizada no Distrito Federal: fotos das peças, uma lista para marcar o que precisa e o pedido de orçamento direto no WhatsApp.",
    altDesktop: "Página inicial do site da LaLeLis no computador, com as fotos das peças desfocadas",
    altMobile: "Site da LaLeLis no celular",
    facts: [["Cliente", "LaLeLis Papelaria Personalizada"], ["Segmento", "Papelaria personalizada"], ["Local", "Distrito Federal"], ["Tipo de projeto", "Landing page de R$ 697"], ["Produtos do cliente", "Topos de bolo, caixinhas, cadernetas, cadernos e etiquetas"], ["Contato", "WhatsApp e Instagram"]],
    decisions: [
      { k: "Objetivo", title: "Transformar a escolha em pedido", text: "Papelaria personalizada tem muitos itens e detalhes. A página ajuda o cliente a dizer o que quer antes de a conversa começar." },
      { k: "Galeria", title: "Peças feitas pela LaLeLis", text: "Fotos das peças com legenda por tema, que abrem em tamanho maior com um toque." },
      { k: "Lista", title: "Marque o que você precisa", text: "Seis produtos para marcar e os detalhes do pedido: tema, nome na peça, data e observações. A mensagem aparece montada na tela enquanto o cliente preenche." },
      { k: "Pedido", title: "A lista vai pronta para o WhatsApp", text: "O botão Enviar lista no WhatsApp abre a conversa com o pedido escrito, e o cliente confere a mensagem antes de enviar." },
    ],
    delivered: ["Landing page responsiva", "Galeria de peças com legendas", "Lista de produtos e detalhes do pedido", "Mensagem de orçamento montada para o WhatsApp", "Indicação da Afeto Nobre, marca irmã"],
  },
  infinityProject: {
    ...project("infinityProject"),
    path: "/projetos/infinity-car-studio/",
    label: "Infinity Car Studio",
    metaTitle: "Infinity Car Studio — case de site | Tetelestai",
    metaDescription: "Como fizemos o site da Infinity Car Studio, estética automotiva no Guará II, em Brasília: serviços no topo, galeria de fotos e vídeos e WhatsApp sempre à mão.",
    category: "Estética automotiva · Guará II, Brasília",
    summary: "Serviços claros no topo, galeria com fotos e vídeos dos trabalhos e o WhatsApp sempre à mão no celular.",
    eyebrow: "Case · Estética automotiva",
    intro: "Site de estética automotiva no Guará II, em Brasília: serviços claros, galeria dos trabalhos e WhatsApp sempre à mão.",
    altDesktop: "Página inicial do site da Infinity Car Studio no computador",
    altMobile: "Site da Infinity Car Studio no celular",
    facts: [["Cliente", "Infinity Car Studio"], ["Segmento", "Estética automotiva"], ["Local", "Guará II, Brasília-DF"], ["Tipo de projeto", "Site institucional"], ["Serviços do cliente", "Lavagem, higienização, polimento, vitrificação e PPF"], ["Contato", "WhatsApp e endereço"]],
    decisions: [
      { k: "Objetivo", title: "Apresentar os serviços e mostrar os trabalhos", text: "Quem procura estética automotiva quer ver o resultado antes de chamar. O site existe para isso: mostrar o trabalho e facilitar o contato." },
      { k: "Identidade", title: "A cara da Infinity no celular e no computador", text: "Layout responsivo com a identidade visual da marca, para o site parecer uma extensão da loja." },
      { k: "Serviços e trabalhos", title: "Serviços ao lado da galeria", text: "Cada serviço aparece junto com fotos e vídeos de carros atendidos, para o cliente entender o que vai receber." },
      { k: "Contato", title: "WhatsApp, endereço e dúvidas", text: "Botões diretos para o WhatsApp, o endereço no Guará II e respostas para as dúvidas comuns sobre serviços e agendamento." },
    ],
    delivered: ["Site institucional responsivo", "Apresentação dos serviços", "Galeria de fotos e vídeos", "Botões de WhatsApp", "Endereço e perguntas frequentes"],
  },
  jujuProject: {
    ...project("jujuProject"),
    path: "/projetos/bolachinhas-da-vovo-juju/",
    label: "Bolachinhas da Vovó Juju",
    metaTitle: "Bolachinhas da Vovó Juju — case de landing page | Tetelestai",
    metaDescription: "A landing page da Bolachinhas da Vovó Juju: fotos do produto na abertura, leitura confortável no celular e pedido pelo Instagram. Veja as escolhas do projeto.",
    category: "Alimentos artesanais · Landing page",
    summary: "Uma página com o produto em primeiro lugar, fotos das bolachinhas de polvilho e o pedido pelo Instagram.",
    eyebrow: "Case · Alimentos artesanais",
    intro: "Landing page para uma marca de bolachinhas de polvilho doce: o produto em primeiro lugar e o pedido pelo Instagram.",
    altDesktop: "Página inicial do site da Bolachinhas da Vovó Juju no computador",
    altMobile: "Site da Bolachinhas da Vovó Juju no celular",
    facts: [["Cliente", "Bolachinhas da Vovó Juju"], ["Segmento", "Alimentos artesanais"], ["Produto", "Bolachinhas de polvilho doce"], ["Tipo de projeto", "Landing page"], ["Contato", "Instagram da marca"], ["Leitura", "Computador e celular"]],
    decisions: [
      { k: "Objetivo", title: "Apresentar a marca e as bolachinhas", text: "Mostrar o produto, valorizar a fotografia e dar ao visitante um caminho direto para consultar a disponibilidade." },
      { k: "Produto em destaque", title: "Fotos na abertura", text: "A página abre com as fotos das bolachinhas e das embalagens, preservando a identidade artesanal da marca." },
      { k: "Leitura", title: "Confortável no computador e no celular", text: "Layout responsivo, com o texto e as fotos organizados para a tela pequena." },
      { k: "Contato", title: "Pedido pelo Instagram", text: "Dúvidas sobre produtos, retirada e ingredientes seguem para o perfil da marca, com link direto." },
    ],
    delivered: ["Landing page responsiva", "Abertura com fotografia do produto", "Identidade artesanal preservada", "Caminho direto para o Instagram"],
  },
};

export const CASE_COPY = {
  pt: {
    decisions: { eyebrow: "O projeto", title: "As decisões por trás da página" },
    delivered: "O que foi entregue",
    next: "Próximo projeto",
    all: "Todos os projetos",
    cta: "Quero um projeto assim",
    waMessage: name => `Olá! Vi o projeto da ${name} no site da Tetelestai e quero um parecido.`,
    final: { title: "Quer um site assim para o seu negócio?", text: "Conte o que você vende. A proposta vem com preço e prazo." },
  },
  en: {
    decisions: { eyebrow: "The project", title: "The decisions behind the page" },
    delivered: "What was delivered",
    next: "Next project",
    all: "All projects",
    cta: "I want a project like this",
    waMessage: name => `Hi! I saw the ${name} project on Tetelestai's website and I'd like something similar.`,
    final: { title: "Want a website like this?", text: "Tell us what you sell. The proposal comes with price and timeline." },
  },
};

// Published iOS apps. App Store destinations are the unmodified links already in use.
export const APPS = {
  recarga: {
    id: "6815378368",
    titleId: "project-recarga-title",
    name: "Tetelestai: Tempo de Recarga",
    qr: "/assets/projects/recarga-app-store-qr.png",
    category: { pt: "Aplicativo iOS · Utilidades", en: "iOS app · Utilities" },
    text: {
      pt: "Planeja a recarga de carros elétricos e híbridos plug-in: a partir de uma carga observada, estima quanto tempo vai levar e a que horas começar.",
      en: "Plans charging for electric and plug-in hybrid cars: from one observed charge, it estimates how long charging takes and when to start.",
    },
    features: {
      pt: ["Perfis de carro e carregador salvos no aparelho", "Histórico das recargas observadas", "Horário de início sugerido para terminar na hora desejada"],
      en: ["Vehicle and charger profiles saved on the device", "History of observed charges", "Suggested start time to finish when you need it"],
    },
    screens: [
      { src: "/assets/projects/recarga-planejamento.png", width: 526, height: 918, pt: ["Planejar recarga", "Tela Planejar recarga, com bateria informada, horário desejado, início sugerido e duração estimada."], en: ["Charging planner", "Original Portuguese charging planner screen with battery level, desired completion time, suggested start and estimated duration."] },
      { src: "/assets/projects/recarga-referencia.png", width: 581, height: 891, pt: ["Ajuste da estimativa", "Tela Sua recarga, com veículo, percentuais de bateria, duração da carga observada e margem para antecipar o início."], en: ["Estimate adjustment", "Original Portuguese charging reference screen with vehicle, battery percentages, observed duration and start-time margin."] },
      { src: "/assets/projects/recarga-historico.png", width: 517, height: 860, pt: ["Perfis e histórico", "Tela Perfis e histórico, para salvar carro e carregador e registrar uma carga observada no aparelho."], en: ["Profiles and history", "Original Portuguese profiles and history screen for saving vehicle and charger settings on the device."] },
    ],
  },
  deRole: {
    id: "6820150552",
    titleId: "project-de-role-title",
    name: "De Rolê",
    icon: "/assets/projects/de-role-icon.webp",
    qr: "/assets/projects/de-role-app-store-qr.png",
    video: "/assets/projects/de-role-video-20s.mp4",
    poster: "/assets/projects/de-role-video-capa.webp",
    category: { pt: "Aplicativo iOS · Jogo de palavras em equipe", en: "iOS app · Team word game" },
    text: {
      pt: "Jogo de adivinhação em português para duas equipes e um celular: uma pessoa dá dicas sem dizer a palavra e a equipe tem 60 segundos para acertar.",
      en: "A Brazilian Portuguese guessing game for two teams sharing one phone: one player gives clues without saying the word, and the team has 60 seconds to guess.",
    },
    features: {
      pt: ["180 cartas gratuitas para começar", "Versão completa por compra única dentro do app", "Turnos de 60 segundos e placar da partida"],
      en: ["Start with 180 free cards", "Full version as a one-time in-app purchase", "60-second turns and a match scoreboard"],
    },
    screens: [
      { src: "/assets/projects/de-role-inicio.webp", width: 1206, height: 2622, pt: ["Tela inicial", "Tela inicial do De Rolê com a chamada Junta a turma, ilustração de amigos e botão Jogar."], en: ["Home screen", "Original Portuguese De Rolê home screen with friends and the Play button."] },
      { src: "/assets/projects/de-role-baralhos.webp", width: 1206, height: 2622, pt: ["Escolha do baralho", "Escolha entre o baralho gratuito de 180 cartas e a versão completa, com 720 cartas no total."], en: ["Deck selection", "Original Portuguese deck selection screen with 180 free cards and a full version with 720 cards in total."] },
      { src: "/assets/projects/de-role-equipes.webp", width: 1206, height: 2622, pt: ["Equipes e turnos", "Tela Passe o celular, com a equipe da vez, turno e placar da partida."], en: ["Teams and turns", "Original Portuguese handover screen with the current team, turn and match score."] },
    ],
  },
};
