// Client inclusion authorized for local portfolio review on 2026-10-14.
// Descriptions and captures checked against the public sites; no performance claims.
export const CLIENT_PROJECTS = [
  {
    key: 'infinityProject',
    path: '/projetos/infinity-car-studio/',
    name: 'Infinity Car Studio',
    category: 'Estética automotiva',
    categoryEn: 'Automotive detailing',
    type: 'Site institucional',
    url: 'https://infinitycarstudio.com.br/',
    domain: 'infinitycarstudio.com.br',
    desktop: '/assets/portfolio/infinity-desktop.webp',
    mobile: '/assets/portfolio/infinity-mobile.webp',
    summary: 'Serviços, trabalhos em foto e vídeo e contato direto para consultas pelo WhatsApp.',
    summaryEn: 'Services, work shown in photos and videos, and direct inquiries through WhatsApp.',
    intro: 'Uma apresentação digital para a estética automotiva da Infinity, no Guará II, Brasília. O site reúne os serviços, os trabalhos publicados pela equipe e os caminhos de contato.',
    objective: 'Apresentar os serviços de estética automotiva e permitir que o visitante conheça os trabalhos antes de consultar a equipe sobre o cuidado para seu carro.',
    delivery: [
      {title:'Identidade e apresentação',text:'Design responsivo com a identidade da Infinity e imagens dos trabalhos realizados pela empresa.'},
      {title:'Serviços e trabalhos',text:'Organização dos serviços de lavagem, higienização, polimento, vitrificação e PPF, com galeria de fotos e vídeos.'},
      {title:'Caminho para o contato',text:'Links diretos para o WhatsApp, endereço no Guará II e respostas às dúvidas sobre serviços e consultas.'},
    ],
    tags: ['Site institucional', 'Foto e vídeo', 'WhatsApp'],
    tagsEn: ['Business website', 'Photo and video', 'WhatsApp'],
    metaTitle: 'Infinity Car Studio — projeto de site | Tetelestai',
    metaDescription: 'Conheça o site da Infinity Car Studio desenvolvido pela Tetelestai: apresentação dos serviços, trabalhos em foto e vídeo e contato pelo WhatsApp.',
  },
  {
    key: 'jujuProject',
    path: '/projetos/bolachinhas-da-vovo-juju/',
    name: 'Bolachinhas da Vovó Juju',
    category: 'Alimentos artesanais',
    categoryEn: 'Artisan food',
    type: 'Landing page',
    url: 'https://bolachinhadavovojuju.com.br/',
    domain: 'bolachinhadavovojuju.com.br',
    desktop: '/assets/portfolio/juju-desktop.webp',
    mobile: '/assets/portfolio/juju-mobile.webp',
    summary: 'Fotografia de produto, apresentação das bolachinhas de polvilho doce e consulta pelo Instagram.',
    summaryEn: 'Product photography, a presentation of the sweet cassava-starch biscuits, and inquiries through Instagram.',
    intro: 'Uma página dedicada às bolachinhas de polvilho doce da Vovó Juju. As fotografias dos produtos e a identidade artesanal conduzem a apresentação da marca e o contato pelo Instagram.',
    objective: 'Apresentar a marca e as bolachinhas de polvilho doce, com destaque para as fotografias dos produtos e um caminho direto para consultar disponibilidade pelo Instagram.',
    delivery: [
      {title:'Produto em destaque',text:'Abertura com fotografias das bolachinhas e das embalagens, preservando a identidade visual da marca.'},
      {title:'Leitura no computador e no celular',text:'Composição responsiva para conhecer os produtos e navegar pelas informações da página.'},
      {title:'Contato pelo Instagram',text:'Orientação para consultas sobre produtos, retirada e ingredientes, com link direto para o perfil da marca.'},
    ],
    tags: ['Landing page', 'Produto em destaque', 'Instagram'],
    tagsEn: ['Landing page', 'Product showcase', 'Instagram'],
    metaTitle: 'Bolachinhas da Vovó Juju — projeto de site | Tetelestai',
    metaDescription: 'Conheça a landing page da Vovó Juju desenvolvida pela Tetelestai: identidade artesanal, fotografia de produto, apresentação responsiva e contato pelo Instagram.',
  },
];

export const PORTFOLIO_PAGES = {
  portfolio: {
    path: '/projetos/',
    label: 'Projetos',
    metaTitle: 'Projetos de sites e soluções digitais | Tetelestai',
    metaDescription: 'Conheça os sites da Infinity Car Studio e da Vovó Juju e os apps iOS Tempo de Recarga e De Rolê, desenvolvidos pela Tetelestai.',
  },
  ...Object.fromEntries(CLIENT_PROJECTS.map(project => [project.key, {...project,label:project.name}])),
};
