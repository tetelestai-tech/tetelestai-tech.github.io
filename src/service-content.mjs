import { MENTORIA_PAGE } from "./mentoria-content.mjs";

// Portuguese service pages (redesign 2026-10). `label` and `intro` also feed the
// Service structured data; `intro` must stay identical to the visible hero lead.
export const SERVICE_PAGES = {
  sites: {
    path: "/criacao-de-sites/",
    label: "Criação de sites",
    metaTitle: "Criação de sites para empresas | Tetelestai",
    metaDescription: "Site profissional para empresas: várias páginas, versão para celular, SEO e GEO e contato direto. Proposta por escrito, atendimento online em todo o Brasil.",
    eyebrow: "Criação de sites · todo o Brasil",
    heading: "Criação de sites para empresas de todo o Brasil",
    intro: "Um site com várias páginas para apresentar a empresa, explicar cada serviço e transformar visitas em contatos, pedidos e vendas. Preço e prazo vêm por escrito, depois de uma conversa.",
    ctaLabel: "Pedir orçamento do site",
    secondaryLabel: "Ver um site que fizemos",
    waMessage: "Olá! Quero um orçamento de site para o meu negócio.",
    facts: [["O que é", "Site institucional com várias páginas"], ["Para quem", "Empresas de qualquer porte e profissionais"], ["Inclui", "Celular, SEO, GEO e WhatsApp"], ["Preço", "Sob orçamento, por escrito"], ["Prazo", "Combinado na proposta"], ["Onde", "Online, no Brasil e no exterior"]],
    compare: {
      eyebrow: "Site ou landing page?", title: "Escolha pelo que o seu cliente precisa ver",
      options: [
        { badge: "Várias páginas", title: "Site completo", items: ["Uma página para cada serviço", "Galeria, sobre, perguntas e contato", "Mais chances de aparecer no Google para cada serviço", "Pode crescer com blog, agendamento ou versão em inglês"], price: "Sob orçamento", cta: "Pedir orçamento do site" },
        { badge: "Uma página", title: "Landing page", items: ["Uma oferta e uma ação", "Pronta em até 2 dias úteis", "Ideal para mandar no WhatsApp e na bio", "Pode virar um site completo depois"], price: "R$ 697", cta: "Ver a landing page" },
      ],
    },
    features: {
      eyebrow: "O que entra no site", title: "Feito para vender, não só para existir",
      items: [
        { k: "Páginas", title: "Uma página para cada serviço", text: "Texto claro sobre o que você faz, para quem e quanto custa, com chamada para o WhatsApp em cada página." },
        { k: "Google e IA", title: "SEO e GEO desde o início", text: "Títulos, descrições, dados estruturados e mapa do site para o Google e os assistentes de IA entenderem o que você faz e onde atende." },
        { k: "Celular", title: "Pensado para a tela pequena", text: "Rápido para abrir, fácil de ler e com botões grandes. É no celular que o seu cliente vai ver." },
        { k: "Fotos", title: "Seus trabalhos em destaque", text: "Galeria com fotos e vídeos reais, que mostram o resultado melhor do que qualquer texto." },
        { k: "Contato", title: "WhatsApp com mensagem pronta", text: "O cliente toca no botão e a conversa já começa dizendo de onde ele veio." },
        { k: "Sob medida", title: "Recursos combinados na proposta", text: "Formulários, agendamento, integrações, versão em inglês e até um app iOS ou Android entram quando fazem sentido para o seu negócio." },
      ],
    },
    caseStudy: {
      key: "infinityProject", eyebrow: "Projeto em destaque", title: "Infinity Car Studio: estética automotiva no Guará II",
      items: ["Serviços de lavagem, higienização, polimento, vitrificação e PPF organizados logo no topo.", "Galeria com fotos e vídeos dos carros atendidos.", "Botões de WhatsApp, endereço e respostas para as dúvidas sobre agendamento."],
    },
    how: { eyebrow: "Como funciona", title: "Do primeiro contato ao site no ar" },
    faqTitle: { eyebrow: "Dúvidas", title: "Perguntas sobre criação de sites" },
    faqs: [
      { q: "Quanto custa um site completo?", a: "Depende do número de páginas e dos recursos. O preço sai por escrito depois de uma conversa pelo WhatsApp, junto com o prazo e o que está incluso. Para começar com algo mais simples, a landing page custa R$ 697." },
      { q: "Quanto tempo leva para o site ficar pronto?", a: "O prazo vem na proposta e conta a partir do envio dos textos e das fotos. Uma landing page fica pronta em até 2 dias úteis." },
      { q: "O site aparece no Google e nos assistentes de IA?", a: "O site sai otimizado para SEO e GEO: títulos, descrições, dados estruturados, mapa do site e textos claros, que o Google e assistentes como ChatGPT, Gemini e Perplexity conseguem entender e citar. A posição nos resultados depende também da concorrência e do conteúdo ao longo do tempo." },
      { q: "Preciso ter textos e fotos prontos?", a: "Ajuda juntar o que você já tem. A proposta deixa combinado o que será usado, o que falta preparar e quem cuida de cada parte." },
      { q: "Domínio, hospedagem e manutenção estão inclusos?", a: "No site completo, domínio e hospedagem são pagos à parte. Na landing page de R$ 697, o domínio .com.br e a hospedagem estão inclusos nos primeiros 12 meses; depois, a renovação anual fica por conta da empresa. Atualizações e manutenção depois da entrega são combinadas conforme a necessidade." },
      { q: "Vocês atendem em todo o Brasil?", a: "Sim. O atendimento é online, para negócios de todo o Brasil e de outros países. A Tetelestai fica em Brasília." },
    ],
    final: { title: "Vamos conversar sobre o seu site?", text: "Conte quais serviços você oferece e para quem. A proposta vem com preço e prazo." },
  },
  landingPages: {
    path: "/criacao-de-landing-pages/",
    label: "Criação de landing pages",
    metaTitle: "Criação de landing page por R$ 697 | Tetelestai",
    metaDescription: "Landing page sob medida: oferta, SEO e GEO, versão para celular e botão de WhatsApp. R$ 697 em 2×, no ar em até 2 dias úteis.",
    eyebrow: "Landing page · R$ 697",
    heading: "Landing page sob medida: R$ 697, no ar em até 2 dias úteis",
    intro: "Uma página com tudo o que o cliente precisa saber antes de chamar no WhatsApp: o que você faz, como funciona e quanto custa.",
    ctaLabel: "Quero minha landing page",
    secondaryLabel: "Ver um exemplo no ar",
    waMessage: "Olá! Quero a landing page de R$ 697.",
    price: "697.00",
    facts: [["Preço", "R$ 697 em 2× de R$ 348,50"], ["Pagamento", "Metade na contratação, metade na entrega"], ["Inclui", "1 página com até 5 seções"], ["Oferta e textos", "Sob medida para o seu negócio"], ["SEO e GEO", "Incluso"], ["Celular e WhatsApp", "Incluso"], ["Prazo", "Até 2 dias úteis após os materiais"], ["Domínio e hospedagem", "Inclusos por 12 meses"]],
    audience: {
      eyebrow: "Para quem é", title: "Para negócios que vendem pela conversa",
      items: [
        { k: "01", title: "Você vende pelo WhatsApp", text: "E precisa de um link para mandar quando o cliente pergunta “como funciona?” ou “quanto custa?”." },
        { k: "02", title: "Você tem uma oferta específica", text: "Um serviço, um produto ou uma campanha que merece uma página só dela." },
        { k: "03", title: "Você ainda não tem site", text: "Comece com uma página bem feita e transforme em site completo quando fizer sentido." },
      ],
    },
    anatomy: {
      eyebrow: "Exemplo de estrutura", title: "As 5 seções que mais ajudam a vender",
      aside: "A estrutura muda conforme o negócio e fica definida na proposta.",
      items: [
        { title: "Abertura", text: "O que você faz, para quem e o botão do WhatsApp." },
        { title: "Serviços ou produto", text: "O que o cliente pode contratar, com preço quando fizer sentido." },
        { title: "Como funciona", text: "Os passos, do primeiro contato à entrega." },
        { title: "Provas", text: "Fotos de trabalhos reais e avaliações de clientes." },
        { title: "Dúvidas e contato", text: "As perguntas que você mais responde no WhatsApp." },
      ],
    },
    caseStudy: {
      // Since 28/10 the live example is Respeitável Feijuca (Carlos); Juju stays in the portfolio.
      key: "feijucaProject", eyebrow: "Exemplo no ar", title: "Respeitável Feijuca",
      text: "A feijoada em vídeo na abertura, um vídeo curto em cada item do combo e a encomenda pelo WhatsApp com a mensagem pronta.",
    },
    how: { eyebrow: "Como funciona", title: "Três passos até a página no ar" },
    faqTitle: { eyebrow: "Dúvidas", title: "Perguntas sobre landing pages" },
    faqs: [
      { q: "A landing page substitui o site da empresa?", a: "Não necessariamente. Ela apresenta uma oferta específica, enquanto o site apresenta o negócio inteiro. As duas podem funcionar juntas, e a landing page pode virar um site depois." },
      { q: "Preciso fazer anúncio?", a: "Não. Você pode mandar o link no WhatsApp, colocar na bio do Instagram e divulgar onde quiser. Se fizer anúncio, a página recebe esse visitante." },
      { q: "O que está incluso nos R$ 697?", a: "Uma página com até 5 seções, com oferta e textos pensados para o seu negócio, otimizada para SEO e GEO, com versão para celular, botão de WhatsApp e uma rodada de ajustes. O domínio .com.br e a hospedagem estão inclusos nos primeiros 12 meses; a partir do segundo ano, a renovação anual fica por conta da empresa." },
      { q: "O que é GEO?", a: "É preparar a página para ser entendida e citada por assistentes de IA, como ChatGPT, Gemini e Perplexity: informações objetivas, perguntas respondidas na própria página e dados estruturados. Funciona junto com o SEO do Google." },
      { q: "Formulários e integrações estão inclusos?", a: "Dependem do escopo. Se você precisar coletar dados ou integrar com outro sistema, isso entra na proposta com o preço combinado." },
      { q: "O que eu mando para pedir a proposta?", a: "O que você vende, para quem, de onde vêm os visitantes, o que eles devem fazer na página e se você já tem domínio ou hospedagem." },
      { q: "Como funciona o pagamento?", a: "R$ 697 em 2× de R$ 348,50: a primeira parcela na contratação e a segunda na entrega da página." },
    ],
    final: { title: "Quer a sua landing page?", text: "Mande uma mensagem contando o que você vende. A proposta vem com preço e prazo." },
  },
  // Since 08/11/2026 the career front is the mentoria test (Essencial, Kit Word and Acompanhado were retired).
  career: MENTORIA_PAGE,
  aiTraining: {
    path: "/capacitacao-em-ia/",
    label: "Capacitação em IA",
    metaTitle: "Capacitação em IA para equipes e profissionais | Tetelestai",
    metaDescription: "Treinamento prático de inteligência artificial sob demanda, adaptado ao público, ao objetivo e ao nível de quem participa. Fale com a Tetelestai pelo WhatsApp.",
    eyebrow: "Capacitação em IA",
    heading: "Capacitação prática em IA para equipes e profissionais",
    intro: "Treinamento sob demanda, montado a partir do público, do objetivo e do nível de quem participa. Sem programa genérico.",
    ctaLabel: "Falar sobre a capacitação",
    waMessage: "Olá! Quero conversar sobre uma capacitação em IA.",
    examples: {
      title: "Por exemplo, dá para trabalhar",
      items: ["Escrever e revisar textos de atendimento e vendas", "Organizar informações, planilhas e relatórios", "Criar conteúdo para redes sociais com revisão humana", "Usar IA sem expor dados sensíveis da empresa"],
    },
    facts: [["Formato", "Sob demanda"], ["Para quem", "Pessoas e empresas"], ["Pré-requisito", "Nenhum"], ["Conteúdo", "Definido pelo objetivo"], ["Quem conduz", "Carlos Viegas"], ["Como começar", "Conversa pelo WhatsApp"]],
    define: {
      eyebrow: "O que vamos definir juntos", title: "Quatro decisões antes da primeira aula",
      items: [
        { k: "01", title: "Público e nível", text: "Quem participa e o que essas pessoas já sabem sobre IA." },
        { k: "02", title: "Objetivo e conteúdo", text: "O que a equipe precisa conseguir fazer depois do treinamento." },
        { k: "03", title: "Formato", text: "Duração, quantidade de encontros e se será online ou presencial." },
        { k: "04", title: "Disponibilidade e condições", text: "Datas, valores e materiais, por escrito." },
      ],
    },
    how: {
      eyebrow: "Como funciona", title: "Do contexto à entrega",
      steps: [
        { k: "Etapa 1", title: "Entender", text: "Objetivo, contexto e limites da equipe." },
        { k: "Etapa 2", title: "Definir", text: "Conteúdo, formato e resultado esperado." },
        { k: "Etapa 3", title: "Executar", text: "Encontros práticos, materiais e próximos passos." },
      ],
    },
    faqTitle: { eyebrow: "Dúvidas", title: "Antes de começar" },
    faqs: [
      { q: "Para quem é a capacitação?", a: "Para pessoas e empresas que querem usar inteligência artificial no trabalho de forma prática e com segurança." },
      { q: "Existe um programa fixo?", a: "Não. O conteúdo é montado sob demanda, a partir do público, do objetivo e do nível de quem participa." },
      { q: "Preciso ter experiência com IA?", a: "Não. O treinamento parte do nível atual do grupo." },
      { q: "O que eu mando para começar?", a: "Quem vai participar, o objetivo e o nível de conhecimento atual. Não envie dados sensíveis no primeiro contato." },
    ],
    final: { title: "Vamos conversar sobre a sua equipe?", text: "Conte o objetivo e quem vai participar. A proposta vem com formato, datas e valores." },
  },
};
