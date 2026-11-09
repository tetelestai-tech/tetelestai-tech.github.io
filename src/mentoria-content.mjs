// Mentoria "renda em dólar treinando IA": teste de 11 a 25/11/2026 (decisão de Carlos em 08/11/2026).
// Fonte única dos textos: "Mentoria — Guia do teste de 14 dias", seções 4 e 5. Os trechos marcados
// FIXO são literais do guia e não mudam sem o Carlos. Regras da página:
// - nenhum nome de plataforma; nenhum valor em dólar, extrato ou nota fiscal na parte aberta;
// - vídeo 2, preço, contrato e WhatsApp só aparecem para quem passa no filtro;
// - o aviso de comissão de indicação aparece antes do preço e de novo antes do Pix.

// Vagas para mentorados. "vagasRestantes" é real: muda só quando um pacote é pago (Gabriela avisa).
export const MENTORIA_TURMA = { vagasTotal: 5, vagasRestantes: 5 };

// Vídeos: null mostra o espaço reservado até a edição chegar (guia, seção 6, pedido D).
export const MENTORIA_VIDEOS = {
  video1: { src: null, poster: null, label: "Vídeo 1 · aberto · 3 a 4 min" },
  video2: { src: null, poster: null, label: "Vídeo 2 · provas e oferta · 4 a 5 min" },
};

// Respostas do filtro: tabela public.mentoria_filtro no Supabase "TETELESTAI Marketing — São Paulo".
// A chave publicável só permite inserir (RLS e permissões por coluna); ninguém lê pelo site.
export const MENTORIA_STORE = {
  url: "https://vjslazmwbbcsfnixvpyf.supabase.co/rest/v1/mentoria_filtro",
  key: "sb_publishable_IZHHH8VTVcTFMrgWP9lgZQ_5qSO1Bgz",
};

// Mesmo formato do link que já funciona no site (guia, seção 5, bloco 9).
export const MENTORIA_WHATSAPP = {
  agendar: "https://wa.me/556184711930?text=Ol%C3%A1%21%20Respondi%20o%20filtro%20da%20mentoria%20e%20quero%20agendar.",
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

// Contrato de 1 página: texto literal do guia (seção 5). O contador confere antes de ir ao ar.
export const MENTORIA_CONTRATO = {
  titulo: "Mentoria individual — termos do teste de novembro de 2026",
  itens: [
    "O que é: 4 encontros individuais de 45 minutos pelo Google Meet com Carlos Viegas, mais 30 dias de suporte por WhatsApp a partir do 1º encontro, prestados pela TETELESTAI (CNPJ 58.138.258/0001-39), com nota fiscal.",
    "O que é ensinado: o caminho que Carlos percorreu para prestar serviços de treinamento de IA a plataformas estrangeiras: escolha de plataformas conforme o perfil, estrutura de empresa e recebimento, preparação para entrevistas e testes, e rotina de trabalho nas horas vagas.",
    "O que não é prometido: aprovação em qualquer plataforma, disponibilidade de projetos, volume de horas ou qualquer valor de renda. Os resultados de Carlos são pessoais e não representam o que o cliente obterá. As plataformas decidem sozinhas quem aprovam, quanto pagam e quando há trabalho, e mudam essas regras sem aviso.",
    "Indicação: Carlos pode indicar o cliente em plataformas que têm programa de indicação, apenas se o cliente tiver perfil compatível. Algumas plataformas pagam a Carlos uma comissão por isso. Essa comissão é paga pela plataforma e não altera o preço nem os ganhos do cliente. A indicação não garante aprovação.",
    "Valor e pagamento: R$ 3.297 pelo pacote, ou R$ 597 pela avaliação de perfil, um encontro avulso de 45 minutos. Quem faz a avaliação e contrata o pacote em até 15 dias paga R$ 597 a menos. Pagamento antes do 1º encontro, pela Kiwify: Pix à vista ou cartão de crédito em até 12 vezes, com o acréscimo do parcelamento pago por quem compra.",
    "Arrependimento: o cliente pode desistir em até 7 dias corridos após o pagamento, com devolução integral, conforme o art. 49 do Código de Defesa do Consumidor.",
    "Agenda: encontros marcados em comum acordo, à noite ou no fim de semana; remarcação com 24 h de antecedência; falta sem aviso conta como encontro realizado.",
    "Confidencialidade: Carlos não revela conteúdo de projetos, nomes de clientes finais nem material protegido por contrato com as plataformas. O cliente se compromete a não redistribuir o material da mentoria.",
    "Dados: nome, e-mail, WhatsApp e respostas do filtro são usados só para esta mentoria e apagados em até 90 dias após o último encontro, salvo obrigação fiscal.",
    "Aceite: o pagamento confirma a leitura e o aceite destes termos.",
  ],
};

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
      { k: "Encontro 1", title: "Seu perfil e por onde entrar", text: "Cada plataforma paga diferente e pede coisas diferentes; decidimos onde você tenta primeiro." },
      { k: "Encontro 2", title: "A parte de empresa", text: "Nota fiscal, recebimento em dólar e imposto, e o erro do começo que me custou caro." },
      { k: "Encontro 3", title: "Entrevista e testes", text: "Ensaio com o que eu vi funcionar e com o que me derrubou." },
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
    lead: "Leva dois minutos. Se o seu perfil fizer sentido, você libera o segundo vídeo, o valor da mentoria, o contrato de uma página e o botão para agendar.",
    contatoTitulo: "Seus dados para o contato",
    lgpd: "Concordo que a TETELESTAI use meu nome, e-mail, WhatsApp e estas respostas só para este contato sobre a mentoria. Se eu não contratar, os dados são apagados em até 90 dias.",
    enviar: "Enviar respostas",
    enviando: "Enviando…",
    obrigatorio: "Responda todas as perguntas e marque o aceite para enviar.",
  },
  passou: {
    eyebrow: "Seu perfil faz sentido",
    title: "Este é o segundo vídeo",
    lead: "Nele eu mostro os comprovantes do que eu recebi, as faixas de quem está começando no Brasil, o valor da mentoria e como ela funciona.",
    // FIXO (vídeo 2): toda peça que cita número leva esta frase.
    resultado: "Resultado meu. O seu depende do seu perfil e das entrevistas.",
  },
  naoPassou: {
    eyebrow: "Obrigado por responder",
    title: "Pelo que você respondeu, este caminho ainda não é para você",
    volte: "Volte quando tiver",
    fecho: "Prefiro dizer isso agora do que vender algo que não vai funcionar para você. Suas respostas ficam guardadas só para este contato e são apagadas em até 90 dias.",
  },
  preco: {
    // Formato da nota de preço do site (Receipt); valores da tabela "Ofertas vigentes" do plano.
    title: "Mentoria individual", place: "Online · Google Meet", total: "R$ 3.297",
    split: "Pix à vista, sem juros · cartão em até 12x · 7 dias de arrependimento",
    cta: "Agendar pelo WhatsApp",
    rows: [["Encontros", "4 × 45 min, individuais"], ["WhatsApp", "30 dias"], ["Avaliação de perfil", "R$ 597, descontada do pacote em até 15 dias"], ["Pagamento", "Pix à vista ou cartão em até 12x (+3,49% a.m.)"], ["Arrependimento", "7 dias, devolução integral"]],
    // FIXO (vídeo 2): aviso de comissão visível antes do pagamento.
    note: "Lembrando: se você entrar pela minha indicação, eu recebo uma comissão da plataforma. Isso não muda o que você paga nem o que você recebe.",
    diagnostico: "Prefere começar só com uma avaliação de perfil de 45 minutos? São R$ 597, descontados do pacote se você fechar em até 15 dias.",
    vagas: "Atendo no máximo 5 mentorados por mês.",
    fechada: "As vagas deste mês estão preenchidas. Entre na lista de espera e eu aviso quando abrir novas vagas.",
    esperaCta: "Entrar na lista de espera",
    agendarTexto: "Quem responde primeiro é a minha equipe, que confirma o seu horário, manda o contrato de uma página e o Pix.",
  },
  contrato: { eyebrow: "Contrato de 1 página", aceite: "Ao pagar, você aceita estes termos." },
  dados: {
    title: "Seus dados",
    texto: "TETELESTAI Soluções em Tecnologia Ltda. · CNPJ 58.138.258/0001-39 · contato@tetelestai.tech. Nome, e-mail, WhatsApp e respostas do filtro são usados só para este contato sobre a mentoria e ficam no Supabase (servidores em São Paulo) e na planilha de acompanhamento da equipe. Se você não contratar, são apagados em até 90 dias. Você pode pedir acesso, correção ou exclusão a qualquer momento pelo e-mail ou pelo WhatsApp.",
    privacidade: "Política de privacidade",
  },
};
