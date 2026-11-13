// Shared interface copy and homepage content (PT/EN).
// Redesign 2026-10: the homepage leads with the landing page offer (R$ 297 + R$ 97/month since 09/11) for small
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
    appsLabel: "Apps iOS e Android",
    ctaWhatsApp: "Pedir orçamento no WhatsApp",
    waDefault: "Olá! Vim pelo site da Tetelestai e quero um orçamento.",
    // Primary goal (Carlos, 28/10): hiring the landing page through WhatsApp (R$ 297 + R$ 97/month since 09/11).
    ctaLanding: "Landing page R$ 297 + R$ 97/mês",
    ctaLandingLong: "Quero minha landing page",
    waLanding: "Olá! Quero a landing page de R$ 297 + R$ 97/mês.",
    floatLabel: "Conversar no WhatsApp",
    menuOpen: "Abrir menu",
    menuClose: "Fechar menu",
    languageLabel: "Idioma",
    breadcrumbLabel: "Caminho da página",
    visitSite: "Visitar o site",
    seeCase: "Ver como foi feito",
    safety: "No primeiro contato, não envie senhas, dados bancários, documentos de identidade, currículos completos ou outras informações sensíveis.",
    footer: {
      tagline: "Tecnologia com propósito. Oportunidades sem fronteiras.",
      people: "Carlos Viegas · Gabriela Rosa · Brasília-DF · atendimento online em todo o Brasil",
      columns: [
        ["Serviços", [["sites", "Criação de sites"], ["landingPages", "Landing pages"], ["apps", "Apps iOS e Android"], ["portfolio", "Projetos"]]],
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
    appsLabel: "iOS and Android apps",
    ctaWhatsApp: "Get a quote on WhatsApp",
    waDefault: "Hi! I found Tetelestai's website and I'd like a quote.",
    ctaLanding: "Landing page R$ 297 + R$ 97/month",
    ctaLandingLong: "I want my landing page",
    waLanding: "Hi! I'd like the R$ 297 + R$ 97/month landing page.",
    floatLabel: "Chat on WhatsApp",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    languageLabel: "Language",
    breadcrumbLabel: "Breadcrumb",
    visitSite: "Visit the website (Portuguese)",
    seeCase: "See how it was made",
    safety: "Do not send passwords, banking details, identity documents, full CVs or other sensitive information in the first contact.",
    footer: {
      tagline: "Technology with purpose. Opportunities without borders.",
      people: "Carlos Viegas · Gabriela Rosa · Based in Brasília, working online across Brazil and abroad",
      columns: [
        ["Services", [["sites", "Website development"], ["landingPages", "Landing pages"], ["apps", "iOS and Android apps"], ["portfolio", "Projects"]]],
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
    metaTitle: "Sites, landing pages e apps para empresas | Tetelestai",
    metaDescription: "Landing page sob medida por R$ 297 de entrada + R$ 97/mês, no ar em até 2 dias úteis, com SEO, GEO e botão de WhatsApp. Sites e apps para empresas de todo o Brasil sob orçamento.",
    // Opening chosen by Carlos on 28/10 (option A): the landing page first, quotes second. Price changed on 09/11.
    hero: {
      eyebrow: "Landing page sob medida · todo o Brasil",
      title: "Sua landing page no ar em até 2 dias úteis: R$ 297 de entrada + R$ 97/mês",
      lead: "Oferta, textos, SEO e GEO e botão de WhatsApp, feitos para o seu negócio. O prazo conta a partir do envio dos textos e das fotos. Sites e apps completos sob orçamento.",
      secondary: "Orçamento de site ou app",
      secondaryMessage: "Olá! Vim pelo site da Tetelestai e quero um orçamento de site ou app.",
      trust: ["Hospedagem e 1 atualização por mês", "Domínio .com.br no 1º ano", "{sites} sites de clientes no ar", "{apps} apps na App Store"],
      trustLabel: "Por que contratar",
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
      other: "Precisa de um site com várias páginas, um app iOS ou Android, um sistema ou uma automação? O orçamento sai depois de uma conversa.",
      otherLink: "Ver criação de sites",
      // Exit rule decided by Carlos on 11/11 (Plano 90 dias, "Ofertas vigentes"); on the site since the 13/11 review.
      exit: {
        title: "Sem prazo mínimo e sem multa",
        items: [
          "Você fica enquanto quiser: não há prazo mínimo de contrato.",
          "Para cancelar, basta avisar com 30 dias de antecedência. Não há multa.",
          "Ao fim do aviso, o site sai da nossa hospedagem. O domínio continua seu e você recebe os arquivos do site.",
        ],
      },
      waMessage: "Olá! Quero a landing page de R$ 297 + R$ 97/mês.",
    },
    how: { eyebrow: "Como funciona", title: "Três passos, do WhatsApp à página no ar" },
    who: { eyebrow: "Quem faz", title: "Duas pessoas, do primeiro contato à entrega" },
    fronts: {
      eyebrow: "A Tetelestai",
      title: "Três frentes, o mesmo cuidado",
      aside: "Tecnologia com propósito. Oportunidades sem fronteiras.",
      items: [
        { id: "solucoes-digitais", title: "Sites, landing pages e apps", text: "Sites e apps que apresentam o negócio e geram vendas, e landing pages que levam o cliente ao WhatsApp. Apps iOS e Android sob orçamento.", links: ["sites", "landingPages", "apps"] },
        { id: "carreira-internacional", title: "Carreira internacional em TI", text: "Frente em reformulação. O guia e o acompanhamento individual saíram de venda.", links: ["career"] },
        { id: "capacitacao-ia", title: "Capacitação em IA", text: "Treinamento prático de inteligência artificial para equipes e profissionais, sob demanda.", links: ["aiTraining"] },
      ],
    },
    faqTitle: { eyebrow: "Dúvidas", title: "Antes de pedir o orçamento" },
    faqs: [
      { q: "Quanto custa uma landing page na Tetelestai?", a: "R$ 297 de entrada, na contratação, e R$ 97 por mês desde o 1º mês. A entrada inclui uma página com até 5 seções, otimizada para SEO e GEO, com oferta e textos pensados para o seu negócio, versão para celular, botão de WhatsApp e uma rodada de ajustes. Depois, a mensalidade de R$ 97 inclui hospedagem, SSL, backup, uma atualização por mês, relatório mensal e SEO local básico, e o domínio .com.br fica incluso nos primeiros 12 meses, registrado no nome da empresa." },
      { q: "Posso cancelar a mensalidade quando quiser?", a: "Sim. Não há prazo mínimo nem multa: basta avisar com 30 dias de antecedência. Ao fim do aviso, o site sai da hospedagem da Tetelestai. O domínio, que já está registrado no nome da empresa, continua com você, e você recebe os arquivos do site." },
      { q: "Qual a diferença entre site e landing page?", a: "A landing page é uma página só, focada em uma oferta e em uma ação, como chamar no WhatsApp. O site apresenta a empresa e vários serviços, em mais de uma página, e é feito sob orçamento." },
      { q: "Em quanto tempo a página fica pronta?", a: "A landing page fica no ar em até 2 dias úteis, contados a partir do envio dos textos e das fotos. O prazo de um site completo ou de um app vem na proposta." },
      { q: "Preciso ter textos e fotos prontos?", a: "Ajuda juntar o que você já tem. A proposta deixa combinado o que será usado, o que falta preparar e quem cuida de cada parte." },
      { q: "Vocês atendem em todo o Brasil?", a: "Sim. O atendimento é online, pelo WhatsApp, para negócios de todo o Brasil e de outros países. A Tetelestai fica em Brasília." },
      { q: "Preciso fazer anúncio para usar a página?", a: "Não. Você pode mandar o link no WhatsApp, colocar na bio do Instagram e divulgar onde quiser." },
    ],
    final: { title: "Vamos colocar o seu negócio na internet?", text: "Conte o que você vende e receba a proposta com preço e prazo." },
  },
  en: {
    path: "/en/",
    metaTitle: "Websites, landing pages and apps for businesses | Tetelestai",
    metaDescription: "A tailored landing page for R$ 297 upfront + R$ 97/month, live in up to 2 business days, with SEO, GEO and a WhatsApp button. Websites and apps for businesses, quoted per project.",
    hero: {
      eyebrow: "Tailored landing pages · Brazil and abroad",
      title: "Your landing page live in up to 2 business days: R$ 297 upfront + R$ 97/month",
      lead: "Offer, copy, SEO and GEO and a WhatsApp button, made for your business. The timeline starts when you send texts and photos. Full websites and apps are quoted per project.",
      secondary: "Website or app quote",
      secondaryMessage: "Hi! I found Tetelestai's website and I'd like a quote for a website or app.",
      trust: ["Hosting and 1 update a month", ".com.br domain in the first year", "{sites} client websites live", "{apps} apps on the App Store"],
      trustLabel: "Why hire us",
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
      other: "Need a multi-page website, an iOS or Android app, a system or an automation? We quote it after a quick conversation.",
      otherLink: "See website development",
      exit: {
        title: "No minimum term, no cancellation fee",
        items: [
          "Stay as long as you like: there is no minimum contract term.",
          "To cancel, just give 30 days' notice. There is no fee.",
          "When the notice ends, the site leaves our hosting. The domain stays yours and you receive the site files.",
        ],
      },
      waMessage: "Hi! I'd like the R$ 297 + R$ 97/month landing page.",
    },
    how: { eyebrow: "How it works", title: "Three steps, from WhatsApp to a live page" },
    who: { eyebrow: "Who we are", title: "Two people, from first message to delivery" },
    fronts: {
      eyebrow: "Tetelestai",
      title: "Three fronts, the same care",
      aside: "Technology with purpose. Opportunities without borders.",
      items: [
        { id: "digital-solutions", title: "Websites, landing pages and apps", text: "Websites and apps that present your business and drive sales, and landing pages that bring customers to WhatsApp. iOS and Android apps quoted per project.", links: ["sites", "landingPages", "apps"] },
        { id: "international-career", title: "International careers in tech", text: "This front is being reworked. The guide and the one-on-one coaching are no longer on sale.", links: ["career"] },
        { id: "practical-ai", title: "AI training", text: "Hands-on artificial intelligence training for teams and professionals, on demand.", links: ["aiTraining"] },
      ],
    },
    faqTitle: { eyebrow: "FAQ", title: "Before you ask for a quote" },
    faqs: [
      { q: "How much does a landing page cost?", a: "R$ 297 upfront when you hire us, then R$ 97 a month from the first month. The upfront payment includes one page with up to 5 sections, optimized for SEO and GEO, with an offer and copy written for your business, a mobile version, a WhatsApp button and one round of revisions. After that, the R$ 97 monthly fee covers hosting, SSL, backups, one update a month, a monthly report and basic local SEO, and the .com.br domain is included for the first 12 months, registered in the client's name." },
      { q: "Can I cancel the monthly fee whenever I want?", a: "Yes. There is no minimum term and no cancellation fee: just give 30 days' notice. When the notice ends, the site leaves Tetelestai's hosting. The domain, already registered in the client's name, stays with you, and you receive the site files." },
      { q: "What's the difference between a website and a landing page?", a: "A landing page is a single page focused on one offer and one action, such as messaging you on WhatsApp. A website presents the business and several services across multiple pages, and is quoted per project." },
      { q: "How long does it take?", a: "A landing page goes live in up to 2 business days after you send the texts and photos. The timeline for a full website or an app comes in the proposal." },
      { q: "Do I need texts and photos ready?", a: "It helps to gather what you have. The proposal states what will be used, what still needs preparing and who handles each part." },
      { q: "Do you work with clients across Brazil?", a: "Yes. We work online, over WhatsApp, with businesses across Brazil and abroad. Tetelestai is based in Brasília." },
      { q: "Do I need to run ads?", a: "No. You can share the link on WhatsApp, add it to your Instagram bio and post it wherever you like." },
    ],
    final: { title: "Ready to put your business online?", text: "Tell us what you sell and get a proposal with price and timeline." },
  },
};

// Shared building blocks reused by several pages.
export const HOW_STEPS = {
  pt: [
    { k: "Passo 1", title: "Você conta o que vende", text: "Pelo WhatsApp: o que você oferece, para quem e o que o cliente precisa fazer depois de ler a página." },
    { k: "Passo 2", title: "Você recebe a proposta", text: "Preço, prazo e o que está incluso, por escrito. A entrada de R$ 297 é paga na contratação." },
    { k: "Passo 3", title: "A página vai ao ar", text: "Você manda textos e fotos, revisa uma prévia, pede os ajustes e a página entra no ar. A mensalidade de R$ 97 cobre hospedagem, backup e uma atualização por mês." },
  ],
  en: [
    { k: "Step 1", title: "Tell us what you sell", text: "On WhatsApp: what you offer, who it's for and what customers should do after reading the page." },
    { k: "Step 2", title: "Get a written proposal", text: "Price, timeline and what's included, in writing. The R$ 297 upfront payment is made when you hire us." },
    { k: "Step 3", title: "Your page goes live", text: "You send texts and photos, review a preview, ask for changes and the page goes live. The R$ 97 monthly fee covers hosting, backups and one update a month." },
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

// Profile links under each person in "Quem faz". An empty address renders nothing: the site never shows a
// placeholder or a guessed profile. Carlos (13/11): his LinkedIn now, carlosviegas.dev once it is live; no GitHub.
// LinkedIn address sent by Carlos on 13/11; carlosSite stays empty until that page is live.
export const PROFILES = { carlosLinkedIn: "https://www.linkedin.com/in/carloshsrosa/", carlosSite: "" };
const PROFILE_LINKS = {
  pt: { CV: [["carlosLinkedIn", "Carlos no LinkedIn"], ["carlosSite", "Página pessoal de Carlos"]] },
  en: { CV: [["carlosLinkedIn", "Carlos on LinkedIn"], ["carlosSite", "Carlos's personal page"]] },
};
export function peopleFor(locale, profiles = PROFILES) {
  return PEOPLE[locale].map(person => ({
    ...person,
    links: (PROFILE_LINKS[locale][person.initials] ?? []).filter(([key]) => profiles[key]).map(([key, label]) => ({ href: profiles[key], label })),
  }));
}

export const LANDING_RECEIPT = {
  pt: {
    title: "Landing page", place: "Online · todo o Brasil", total: "R$ 297", split: "de entrada + R$ 97/mês desde o 1º mês",
    note: "O prazo conta a partir do envio dos textos e das fotos.", cta: "Quero minha landing page",
    rows: [["Página", "1, até 5 seções"], ["Oferta e textos", "sob medida"], ["SEO e GEO", "incluso"], ["Celular e WhatsApp", "incluso"], ["Ajustes", "1 rodada"], ["Prazo", "até 2 dias úteis"], ["Mensalidade", "hospedagem, SSL, backup, 1 atualização"], ["Domínio .com.br", "1º ano incluso"], ["Cancelamento", "30 dias de aviso, sem multa"]],
  },
  en: {
    title: "Landing page", place: "Online · Brazil and abroad", total: "R$ 297", split: "upfront + R$ 97/month from the first month",
    note: "The deadline starts when you send the texts and photos.", cta: "I want my landing page",
    rows: [["Page", "1, up to 5 sections"], ["Offer and copy", "tailored"], ["SEO and GEO", "included"], ["Mobile + WhatsApp", "included"], ["Revisions", "1 round"], ["Delivery", "up to 2 business days"], ["Monthly fee", "hosting, SSL, backups, 1 update"], [".com.br domain", "1st year included"], ["Cancellation", "30 days' notice, no fee"]],
  },
};
