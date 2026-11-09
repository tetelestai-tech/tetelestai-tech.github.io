// Mentoria "renda em dólar treinando IA": teste de 11 a 25/11/2026 (decisão de Carlos em 08/11/2026).
// Fonte única dos textos: "Mentoria — Guia do teste de 14 dias", seções 4 e 5. Os trechos marcados
// FIXO são literais do guia e não mudam sem o Carlos. Regras da página:
// - nenhum nome de plataforma; nenhum valor em dólar, extrato ou nota fiscal na parte aberta;
// - vídeo 2, números, preços e contrato vão só por e-mail, para quem passa no filtro (decisão de 09/11):
//   a função mentoria-filtro do Supabase grava a resposta e envia o e-mail (o texto do e-mail e o
//   contrato ficam lá, fora deste repositório público);
// - o aviso de comissão de indicação aparece no e-mail antes dos valores;
// - quem não passa vê o retorno na tela e a opção do direcionamento de carreira internacional.

// Vagas para mentorados. "vagasRestantes" é real: muda só quando um pacote é pago (Gabriela avisa).
export const MENTORIA_TURMA = { vagasTotal: 5, vagasRestantes: 5 };

// Vídeos: null mostra o espaço reservado até a edição chegar (guia, seção 6, pedido D).
export const MENTORIA_VIDEOS = {
  video1: { src: null, poster: null, label: "Vídeo 1 · aberto · 3 a 4 min" },
};

// Respostas do filtro: função mentoria-filtro do Supabase "TETELESTAI Marketing — São Paulo".
// Ela grava em public.mentoria_filtro (o site não grava nem lê direto) e, para quem passa,
// manda o e-mail com o link do vídeo 2 (bucket privado, link de 7 dias).
export const MENTORIA_ENVIO = {
  url: "https://vjslazmwbbcsfnixvpyf.supabase.co/functions/v1/mentoria-filtro",
};

// Checkout na Kiwify (decisão de 09/11). null mantém o WhatsApp até o link existir.
export const MENTORIA_CHECKOUT = { direcionamento: null };

// Mesmo formato do link que já funciona no site (guia, seção 5, bloco 9).
export const MENTORIA_WHATSAPP = {
  naoRecebi: "https://wa.me/556184711930?text=Ol%C3%A1%21%20Passei%20no%20filtro%20da%20mentoria%20e%20n%C3%A3o%20recebi%20o%20e-mail.",
  direcionamento: "https://wa.me/556184711930?text=Ol%C3%A1%21%20Respondi%20o%20filtro%20da%20mentoria%20e%20quero%20o%20direcionamento%20de%20carreira%20internacional.",
  espera: "https://wa.me/556184711930?text=Ol%C3%A1%21%20Respondi%20o%20filtro%20da%20mentoria%20e%20quero%20entrar%20na%20lista%20de%20espera.",
};

// Perguntas do filtro (guia, seção 5). A regra de passar não aparece para quem responde.
export const MENTORIA_FILTRO = [
  {
    name: "experiencia", type: "radio",
    label: "Qual a sua experiência profissional com programação?",
    options: [["menos_1", "Menos de 1 ano"], ["1_3", "1 a 3 anos"], ["3_8", "3 a 8 anos"], ["mais_8", "Mais de 8 anos"]],
    passa: value => ["3_8", "mais_8"].includes(value),
    volte: "pelo menos 3 anos de experiência profissional com programação",
  },
  {
    name: "linguagens", type: "text",
    label: "Em quais linguagens você se sente seguro para resolver um problema ao vivo?",
    placeholder: "Por exemplo: Python, Java, TypeScript",
    passa: value => value.trim().length > 0,
    volte: "segurança para resolver um problema ao vivo em pelo menos uma linguagem",
  },
  {
    name: "ingles", type: "radio",
    label: "Como é o seu inglês falado?",
    options: [["nao_falo", "Não falo"], ["trava", "Entendo, mas travo para falar"], ["com_esforco", "Converso com esforço"], ["tranquilo", "Faço entrevista com tranquilidade"]],
    passa: value => ["com_esforco", "tranquilo"].includes(value),
    volte: "inglês falado para conversar numa entrevista, mesmo com esforço",
  },
  {
    name: "situacao", type: "radio",
    label: "Qual é a sua situação hoje?",
    options: [["emprego_fixo", "CLT ou PJ fixo, e quero renda extra"], ["desempregado", "Desempregado, e preciso de renda agora"], ["autonomo", "Autônomo"]],
    passa: value => ["emprego_fixo", "autonomo"].includes(value),
    volte: "uma renda fixa garantida: as plataformas têm mês sem projeto, e este caminho é renda extra, não a conta do mês",
  },
  {
    name: "horas", type: "radio",
    label: "Quantas horas por semana você tem livres de verdade para isso?",
    options: [["menos_5", "Menos de 5"], ["5_10", "5 a 10"], ["mais_10", "Mais de 10"]],
    passa: value => ["5_10", "mais_10"].includes(value),
    volte: "pelo menos 5 horas livres por semana",
  },
];

// Mesma regra da coluna gerada "passou" no Supabase.
export function avaliarFiltro(respostas) {
  const falhas = MENTORIA_FILTRO.filter(item => !item.passa(String(respostas[item.name] ?? "")));
  return { passou: falhas.length === 0, volte: falhas.map(item => item.volte) };
}

export const MENTORIA_PAGE = {
  path: "/mentoria/",
  label: "Mentoria: renda em dólar treinando IA",
  metaTitle: "Mentoria: renda em dólar treinando IA, sem largar o emprego | Tetelestai",
  metaDescription: "Mentoria individual com Carlos Viegas para desenvolvedores que programam bem e fazem entrevista em inglês: treinar modelos de IA para plataformas americanas nas horas vagas, como PJ. Sem promessa de ganho.",
  eyebrow: "Mentoria individual · carreira internacional em TI",
  // Bloco 1 do guia (título e subtítulo).
  heading: "Renda em dólar treinando IA nas horas vagas, sem largar o emprego",
  intro: "Mentoria individual com Carlos Viegas, engenheiro de software há 22 anos. Sem promessa de ganho, sem vaga, com método.",
  ctaLabel: "Responder as 5 perguntas",
  secondaryLabel: "Para quem é",
  // O modelo inteiro, como pede a política de Resultados irreais da Meta (sem valor em dólar).
  facts: [
    ["O trabalho", "Avaliar, corrigir e escrever código para empresas que treinam IA"],
    ["Como", "Por hora, como PJ, para plataformas americanas"],
    ["Quando", "Nas horas vagas, quando há projeto"],
    ["Mentoria", "4 encontros individuais de 45 min no Meet"],
    ["Suporte", "30 dias de WhatsApp"],
    ["Vagas", "5 mentorados por mês"],
  ],
  quem: {
    eyebrow: "Antes de tudo",
    title: "Para quem é e para quem não é",
    // FIXO (vídeo 1).
    e: ["Você programa bem em pelo menos uma linguagem.", "Você consegue fazer uma entrevista em inglês.", "Você tem umas dez horas livres por semana."],
    naoE: ["Você está começando a programar.", "Você não se vira em inglês falado.", "Você precisa dessa renda para pagar as contas do mês."],
    fecho: "As plataformas têm entrevista e teste. Quem passa, trabalha. Quem não passa, não trabalha, e eu não tenho como mudar isso.",
    fila: "E a fila oscila: tem mês cheio e tem mês vazio. Por isso eu nunca larguei o meu emprego, e só ensino o caminho para quem vai manter o dele.",
  },
  encontros: {
    eyebrow: "Os 4 encontros",
    title: "Quatro encontros individuais de 45 minutos, pelo Google Meet",
    aside: "Entre os encontros, 30 dias de WhatsApp comigo para dúvidas.",
    items: [
      // Ordem do Carlos, 09/11: aplicar já no 1º encontro e treinar entrevista no 2º; a empresa só pesa antes do 1º pagamento.
      { k: "Encontro 1", title: "Seu perfil e por onde entrar", text: "Cada plataforma paga diferente e pede coisas diferentes; decidimos onde você tenta primeiro, e você já pode fazer as primeiras candidaturas." },
      { k: "Encontro 2", title: "Entrevista e testes", text: "Ensaio com o que eu vi funcionar e com o que me derrubou." },
      { k: "Encontro 3", title: "A parte de empresa", text: "Nota fiscal, recebimento em dólar e imposto, e o erro do começo que me custou caro." },
      { k: "Encontro 4", title: "A sua rotina", text: "Como fazer isso caber nas horas vagas sem destruir a sua semana." },
    ],
  },
  semPromessa: {
    eyebrow: "Por escrito",
    title: "O que eu não prometo",
    // FIXO (vídeo 1).
    texto: "O que eu não prometo: que você vai ser aprovado, que vai ter projeto toda semana, ou que vai ganhar o que eu ganhei. O meu resultado é meu, com 22 anos de experiência e 16 meses de histórico. O seu depende do seu perfil e do seu desempenho nas entrevistas.",
    comissaoTitulo: "Transparência sobre indicação",
    // FIXO (vídeo 1).
    comissao: "Transparência: algumas plataformas pagam a quem indica profissionais. Se você entrar pela minha indicação, eu recebo uma parte pequena, paga pela plataforma, não por você. Eu só indico quem passou no meu filtro, porque indicação ruim queima a minha reputação lá dentro.",
  },
  filtro: {
    eyebrow: "Filtro",
    title: "Responda 5 perguntas",
    lead: "Leva dois minutos. Se o seu perfil fizer sentido, eu mando no seu e-mail o segundo vídeo, os números, os valores e o contrato de uma página.",
    contatoTitulo: "Para onde eu mando o resultado",
    lgpd: "Concordo que a TETELESTAI use meu nome, e-mail, WhatsApp e estas respostas só para este contato sobre a mentoria. Se eu não contratar, os dados são apagados em até 90 dias.",
    enviar: "Enviar respostas",
    enviando: "Enviando…",
    obrigatorio: "Responda todas as perguntas e marque o aceite para enviar.",
  },
  // Título do lado esquerdo depois que a pessoa passa (Carlos, 09/11): parabéns, sem prometer aprovação.
  aprovado: {
    eyebrow: "Resultado do filtro",
    title: "Parabéns: você tem os requisitos para se candidatar nas plataformas",
    lead: "Pelas suas respostas, o seu perfil está alinhado com o que as plataformas pedem hoje. Isso não garante aprovação: quem decide são as entrevistas e os testes delas.",
  },
  passou: {
    eyebrow: "Seu perfil faz sentido",
    title: "O segundo vídeo está indo para o seu e-mail",
    // {email} vira o endereço digitado, para a pessoa notar um erro de digitação.
    enviado: "Mandei para {email} o segundo vídeo, com os números, os valores e o contrato de uma página. O link é só seu e vale por 7 dias.",
    lembrado: "Você já respondeu o filtro. O segundo vídeo foi para o e-mail que você informou; o link é só seu e vale por 7 dias.",
    spam: "Não chegou em alguns minutos? Olhe no spam e na aba Promoções. Se não estiver lá, fale com a minha equipe pelo WhatsApp.",
    erro: "Não consegui enviar as suas respostas agora. Fale com a minha equipe pelo WhatsApp que a gente manda o vídeo para você.",
    whatsapp: "Não recebi o e-mail",
  },
  naoPassou: {
    eyebrow: "Obrigado por responder",
    title: "Pelo que você respondeu, este caminho ainda não é para você",
    sincero: "Prefiro ser sincero: hoje, o seu perfil ainda não está alinhado com o trabalho que eu ensino.",
    volte: "Para a mentoria, volte quando tiver",
    fecho: "Não desanime. Desenvolva esses pontos e responda o filtro de novo: fico à disposição para uma mentoria quando fizer sentido. Suas respostas ficam guardadas só para este contato e são apagadas em até 90 dias.",
    // Carlos, 09/11: a oferta fica colada no título, porque quem não passa lê o título e fecha a página.
    direcionamento: {
      eyebrow: "Um caminho agora",
      title: "Direcionamento de carreira internacional",
      texto: "Um encontro individual de 45 minutos comigo, pelo Google Meet, para olhar o seu momento e decidir o que desenvolver primeiro.",
      preco: "R$ 397",
      pagamento: "Pix à vista, sem juros, ou cartão em até 12x (+3,49% a.m.)",
      cta: "Comprar o direcionamento",
      ctaWhatsApp: "Quero o direcionamento",
      termos: "Pagamento pela Kiwify antes do encontro, marcado à noite ou no fim de semana. 7 dias para desistir, com devolução integral (CDC art. 49). Não substitui a mentoria, não muda o resultado do filtro e não dá desconto no pacote. Sem promessa de aprovação nas plataformas, de projeto ou de renda.",
    },
  },
  vagas: {
    fechada: "As vagas deste mês estão preenchidas. Entre na lista de espera e eu aviso quando abrir novas vagas.",
    esperaCta: "Entrar na lista de espera",
  },
  dados: {
    title: "Seus dados",
    texto: "TETELESTAI Soluções em Tecnologia Ltda. · CNPJ 58.138.258/0001-39 · contato@tetelestai.tech. Nome, e-mail, WhatsApp e respostas do filtro são usados só para este contato sobre a mentoria e ficam no Supabase (servidores em São Paulo) e na planilha de acompanhamento da equipe. Quem passa no filtro recebe o resultado por e-mail, enviado pelo Brevo. Se você não contratar, são apagados em até 90 dias. Você pode pedir acesso, correção ou exclusão a qualquer momento pelo e-mail ou pelo WhatsApp.",
    privacidade: "Política de privacidade",
  },
};
