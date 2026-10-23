// Shared interface copy and homepage content (PT/EN).
// Redesign 2026-10: the homepage leads with the R$ 697 landing page offer for small
// businesses; career and AI training remain as separate fronts with their own pages.
// Statements marked CONFIRM in AGENTS.md must be confirmed by Carlos before publishing.

export const UI = {
  pt: {
    lang: "pt-BR",
    skip: "Pular para o conteúdo",
    homeLabel: "Início",
    brandLabel: "Tetelestai — início",
    navLabel: "Navegação principal",
    nav: [
      ["sites", "Sites"], ["landingPages", "Landing pages"], ["portfolio", "Projetos"],
      ["career", "Carreira"], ["aiTraining", "IA"],
    ],
    cta: "Pedir orçamento",
    ctaWhatsApp: "Pedir orçamento no WhatsApp",
    waDefault: "Olá! Vim pelo site da Tetelestai e quero um orçamento.",
    menuOpen: "Abrir menu",
    menuClose: "Fechar menu",
    languageLabel: "Idioma",
    breadcrumbLabel: "Caminho da página",
    visitSite: "Visitar o site",
    seeCase: "Ver como foi feito",
    safety: "No primeiro contato, não envie senhas, dados bancários, documentos de identidade, currículos completos ou outras informações sensíveis.",
    footer: {
      tagline: "Tecnologia com propósito. Oportunidades sem fronteiras.",
      people: "Carlos Viegas · Gabriela Rosa · Brasília-DF",
      columns: [
        ["Serviços", [["sites", "Criação de sites"], ["landingPages", "Landing pages"], ["portfolio", "Projetos"]]],
        ["Outras frentes", [["career", "Carreira internacional em TI"], ["aiTraining", "Capacitação em IA"]]],
      ],
      contact: "Contato",
      company: "Tetelestai Soluções em Tecnologia Ltda. · CNPJ 58.138.258/0001-39",
      otherLanguage: "English",
      verse: "Está consumado!",
      verseReference: "João 19:30",
    },
    notFound: {
      kicker: "Página não encontrada",
      title: "Este endereço não existe",
      text: "Volte ao início para conhecer as soluções da Tetelestai.",
      back: "Ir para o início",
      metaTitle: "Página não encontrada | Tetelestai",
    },
  },
  en: {
    lang: "en",
    skip: "Skip to content",
    homeLabel: "Home",
    brandLabel: "Tetelestai — home",
    navLabel: "Primary navigation",
    nav: [
      ["sites", "Websites"], ["landingPages", "Landing pages"], ["portfolio", "Projects"],
      ["career", "Career"], ["aiTraining", "AI"],
    ],
    cta: "Get a quote",
    ctaWhatsApp: "Get a quote on WhatsApp",
    waDefault: "Hi! I found Tetelestai's website and I'd like a quote.",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    languageLabel: "Language",
    breadcrumbLabel: "Breadcrumb",
    visitSite: "Visit the website (Portuguese)",
    seeCase: "See how it was made",
    safety: "Do not send passwords, banking details, identity documents, full CVs or other sensitive information in the first contact.",
    footer: {
      tagline: "Technology with purpose. Opportunities without borders.",
      people: "Carlos Viegas · Gabriela Rosa · Brasília, Brazil",
      columns: [
        ["Services", [["sites", "Website development"], ["landingPages", "Landing pages"], ["portfolio", "Projects"]]],
        ["More from Tetelestai", [["career", "International careers in tech"], ["aiTraining", "AI training"]]],
      ],
      contact: "Contact",
      company: "Tetelestai Soluções em Tecnologia Ltda. · CNPJ 58.138.258/0001-39",
      otherLanguage: "Português",
      verse: "It is finished!",
      verseReference: "John 19:30",
    },
    notFound: {
      kicker: "Page not found",
      title: "This address does not exist",
      text: "Return home to explore Tetelestai's solutions.",
      back: "Go to the homepage",
      metaTitle: "Page not found | Tetelestai",
    },
  },
};

export const HOME = {
  pt: {
    path: "/",
    metaTitle: "Sites e landing pages em Brasília | Tetelestai",
    metaDescription: "Sites e landing pages para pequenos negócios em Brasília. Landing page a partir de R$ 697, com botão de WhatsApp, no ar em até 5 dias úteis.",
    hero: {
      eyebrow: "Brasília · Sites e landing pages",
      title: "Sites e landing pages para pequenos negócios em Brasília",
      lead: "Uma página que explica o seu serviço e leva o cliente direto para o seu WhatsApp. No ar em até 5 dias úteis depois que você manda os materiais.",
      secondary: "Ver projetos no ar",
      price: "Landing page a partir de R$ 697",
      byline: "Feito por Carlos Viegas, 22 anos de engenharia de software",
    },
    proof: { label: "No ar agora", apps: "Na App Store: De Rolê e Tempo de Recarga" },
    projects: {
      eyebrow: "Projetos no ar", title: "Veja o que já entregamos",
      aside: "Abra os sites no seu celular. É assim que o seu cliente vai ver a sua página.",
      more: "Ver todos os projetos",
    },
    price: {
      eyebrow: "Preço",
      title: "O preço está aqui. Sem “sob consulta”.",
      lead: "Você sabe quanto vai pagar e o que vai receber antes de começar. A landing page é a forma mais rápida de ter um endereço para mandar quando o cliente pergunta “como funciona?”.",
      other: "Precisa de um site com várias páginas, um sistema ou uma automação? O orçamento sai depois de uma conversa.",
      otherLink: "Ver criação de sites",
      waMessage: "Olá! Quero a landing page de R$ 697.",
    },
    how: { eyebrow: "Como funciona", title: "Três passos, do WhatsApp à página no ar" },
    who: { eyebrow: "Quem faz", title: "Duas pessoas, do primeiro contato à entrega" },
    fronts: {
      eyebrow: "A Tetelestai",
      title: "Três frentes, o mesmo cuidado",
      aside: "Tecnologia com propósito. Oportunidades sem fronteiras.",
      items: [
        { id: "solucoes-digitais", title: "Sites e landing pages", text: "Páginas para pequenos negócios apresentarem o serviço e receberem clientes pelo WhatsApp.", links: ["sites", "landingPages"] },
        { id: "carreira-internacional", title: "Carreira internacional em TI", text: "Guia Essencial: currículo em inglês, LinkedIn e candidaturas organizadas. R$ 47.", links: ["career"] },
        { id: "capacitacao-ia", title: "Capacitação em IA", text: "Treinamento prático de inteligência artificial para equipes e profissionais, sob demanda.", links: ["aiTraining"] },
      ],
    },
    faqTitle: { eyebrow: "Dúvidas", title: "Antes de pedir o orçamento" },
    faqs: [
      { q: "Quanto custa uma landing page na Tetelestai?", a: "R$ 697, em 2× de R$ 348,50. Inclui uma página com até 5 seções, versão para celular, botão de WhatsApp, SEO básico e uma rodada de ajustes. Domínio e hospedagem são pagos à parte." },
      { q: "Qual a diferença entre site e landing page?", a: "A landing page é uma página só, focada em uma oferta e em uma ação, como chamar no WhatsApp. O site apresenta a empresa e vários serviços, em mais de uma página, e é feito sob orçamento." },
      { q: "Em quanto tempo a página fica pronta?", a: "A landing page fica no ar em até 5 dias úteis, contados a partir do envio dos textos e das fotos. O prazo de um site completo vem na proposta." },
      { q: "Preciso ter textos e fotos prontos?", a: "Ajuda juntar o que você já tem. A proposta deixa combinado o que será usado, o que falta preparar e quem cuida de cada parte." },
      { q: "Vocês atendem fora de Brasília?", a: "Sim. O atendimento é todo pelo WhatsApp e a entrega é online, então dá para atender negócios de outras cidades." },
      { q: "Preciso fazer anúncio para usar a página?", a: "Não. Você pode mandar o link no WhatsApp, colocar na bio do Instagram e divulgar onde quiser." },
    ],
    final: { title: "Vamos colocar o seu negócio na internet?", text: "Conte o que você vende e receba a proposta com preço e prazo." },
  },
  en: {
    path: "/en/",
    metaTitle: "Websites and landing pages in Brasília | Tetelestai",
    metaDescription: "Websites and landing pages for small businesses, made in Brasília. Landing pages from R$ 697 with a WhatsApp button, live in up to 5 business days.",
    hero: {
      eyebrow: "Brasília · Websites and landing pages",
      title: "Websites and landing pages for small businesses",
      lead: "A page that explains what you do and sends customers straight to your WhatsApp. Live in up to 5 business days after you send your materials.",
      secondary: "See live projects",
      price: "Landing pages from R$ 697",
      byline: "Built by Carlos Viegas, 22 years in software engineering",
    },
    proof: { label: "Live now", apps: "On the App Store: De Rolê and Tempo de Recarga" },
    projects: {
      eyebrow: "Live projects", title: "What we've delivered",
      aside: "Open these sites on your phone. That's how your customers will see your page.",
      more: "See all projects",
    },
    price: {
      eyebrow: "Pricing",
      title: "The price is right here. No “contact us for pricing”.",
      lead: "You know what you'll pay and what you'll get before we start. A landing page is the fastest way to have a link to send when a customer asks “how does it work?”.",
      other: "Need a multi-page website, a system or an automation? We quote it after a quick conversation.",
      otherLink: "See website development",
      waMessage: "Hi! I'd like the R$ 697 landing page.",
    },
    how: { eyebrow: "How it works", title: "Three steps, from WhatsApp to a live page" },
    who: { eyebrow: "Who we are", title: "Two people, from first message to delivery" },
    fronts: {
      eyebrow: "Tetelestai",
      title: "Three fronts, the same care",
      aside: "Technology with purpose. Opportunities without borders.",
      items: [
        { id: "digital-solutions", title: "Websites and landing pages", text: "Pages that help small businesses present their services and get customers on WhatsApp.", links: ["sites", "landingPages"] },
        { id: "international-career", title: "International careers in tech", text: "The Essencial guide: English CV, LinkedIn and an organized job search (in Portuguese).", links: ["career"] },
        { id: "practical-ai", title: "AI training", text: "Hands-on artificial intelligence training for teams and professionals, on demand.", links: ["aiTraining"] },
      ],
    },
    faqTitle: { eyebrow: "FAQ", title: "Before you ask for a quote" },
    faqs: [
      { q: "How much does a landing page cost?", a: "R$ 697, or 2 × R$ 348.50. It includes one page with up to 5 sections, a mobile version, a WhatsApp button, basic SEO and one round of revisions. Domain and hosting are billed separately." },
      { q: "What's the difference between a website and a landing page?", a: "A landing page is a single page focused on one offer and one action, such as messaging you on WhatsApp. A website presents the business and several services across multiple pages, and is quoted per project." },
      { q: "How long does it take?", a: "A landing page goes live in up to 5 business days after you send the texts and photos. The timeline for a full website comes in the proposal." },
      { q: "Do I need texts and photos ready?", a: "It helps to gather what you have. The proposal states what will be used, what still needs preparing and who handles each part." },
      { q: "Do you work with clients outside Brasília?", a: "Yes. Everything happens over WhatsApp and delivery is online, so we can work with businesses in other cities." },
      { q: "Do I need to run ads?", a: "No. You can share the link on WhatsApp, add it to your Instagram bio and post it wherever you like." },
    ],
    final: { title: "Ready to put your business online?", text: "Tell us what you sell and get a proposal with price and timeline." },
  },
};

// Shared building blocks reused by several pages.
export const HOW_STEPS = {
  pt: [
    { k: "Passo 1", title: "Você conta o que vende", text: "Pelo WhatsApp: o que você oferece, para quem e o que o cliente precisa fazer depois de ler a página." },
    { k: "Passo 2", title: "Você recebe a proposta", text: "Preço, prazo e o que está incluso, por escrito, antes de qualquer pagamento." },
    { k: "Passo 3", title: "A página vai ao ar", text: "Você manda textos e fotos, revisa uma prévia, pede os ajustes e a página entra no ar." },
  ],
  en: [
    { k: "Step 1", title: "Tell us what you sell", text: "On WhatsApp: what you offer, who it's for and what customers should do after reading the page." },
    { k: "Step 2", title: "Get a written proposal", text: "Price, timeline and what's included, in writing, before any payment." },
    { k: "Step 3", title: "Your page goes live", text: "You send texts and photos, review a preview, ask for changes and the page goes live." },
  ],
};

export const PEOPLE = {
  pt: [
    { initials: "CV", name: "Carlos Viegas", role: "Co-Founder & CTO", bio: "22 anos de engenharia de software, 14 deles como líder técnico no Banco do Brasil. Cuida da parte técnica de cada projeto." },
    { initials: "GR", name: "Gabriela Rosa", role: "Co-Founder & CEO", bio: "Co-fundadora e administradora da Tetelestai. Lidera o negócio, o marketing e o relacionamento com clientes." },
  ],
  en: [
    { initials: "CV", name: "Carlos Viegas", role: "Co-Founder & CTO", bio: "22 years in software engineering, 14 of them as a tech lead at Banco do Brasil. Leads the technical side of every project." },
    { initials: "GR", name: "Gabriela Rosa", role: "Co-Founder & CEO", bio: "Co-founder and Tetelestai’s managing partner. Leads the business, marketing and client relations." },
  ],
};

export const LANDING_RECEIPT = {
  pt: {
    title: "Landing page", total: "R$ 697", split: "em 2× de R$ 348,50",
    note: "O prazo conta a partir do envio dos textos e das fotos.", cta: "Quero minha landing page",
    rows: [["Página", "1, até 5 seções"], ["Celular e WhatsApp", "incluso"], ["SEO básico", "incluso"], ["Ajustes", "1 rodada"], ["Prazo", "até 5 dias úteis"], ["Domínio e hospedagem", "à parte"]],
  },
  en: {
    title: "Landing page", total: "R$ 697", split: "or 2 × R$ 348.50",
    note: "The deadline starts when you send the texts and photos.", cta: "I want my landing page",
    rows: [["Page", "1, up to 5 sections"], ["Mobile + WhatsApp", "included"], ["Basic SEO", "included"], ["Revisions", "1 round"], ["Delivery", "up to 5 business days"], ["Domain and hosting", "not included"]],
  },
};
