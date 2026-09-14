export const RECARGA_UPDATED = "14 de setembro de 2026";

export const RECARGA_PAGES = {
  "recarga-support": {
    path: "/recarga/suporte/",
    label: "Suporte do aplicativo",
    title: "Suporte — Tetelestai Recarga",
    metaTitle: "Suporte — Tetelestai Recarga",
    metaDescription: "Ajuda e contato de suporte para o aplicativo Tetelestai Recarga.",
    intro: "Ajuda para planejar sua recarga e ajustar a estimativa. Estas orientações se referem à versão 1.0.5 do Tetelestai Recarga e à calculadora web, gratuitas, sem anúncios e sem cadastro.",
    sections: [
      {
        title: "Para solicitar ajuda",
        paragraphs: [
          "Informe a versão do aplicativo, o modelo do aparelho e o que aconteceu. Se estiver usando a calculadora web, informe também o navegador. Para conferir um cálculo, envie o percentual usado, a referência de carga, o horário de conclusão e a margem. Não envie senhas nem dados de acesso ao veículo.",
          "Nenhum dado da calculadora é incluído automaticamente na conversa. O atendimento ocorre fora do aplicativo e segue também as regras de privacidade do WhatsApp.",
        ],
      },
      {
        title: "Como planejar uma carga",
        paragraphs: [
          "Selecione o percentual que aparece no carro. O app não lê a bateria automaticamente. Escolha o horário em Quero 100% às. O padrão é 07:00.",
          "Na versão 1.0.5, percentuais, horários e durações são escolhidos em seletores de rolagem. Role até os valores desejados e toque em Confirmar. Cancelar mantém o valor anterior.",
          "Confira a duração estimada, o início sugerido e qualquer orientação sobre o tempo disponível. Toque em Copiar horário se quiser copiar o resumo. Configure o início no carregamento inteligente do veículo.",
          "O aplicativo não se conecta ao carro nem aciona o carregador. Os horários são estimativas baseadas na referência informada; não garantem que a bateria alcance 100% na hora exata.",
        ],
      },
      {
        title: "Ajustar a referência e a margem",
        paragraphs: [
          "Em Sua recarga, informe uma carga observada no mesmo carro e carregador: bateria inicial, bateria final e duração ou horários de início e término. Indique quando terminou no dia seguinte. O percentual final precisa ser maior que o inicial, e o tempo deve ser maior que zero. Toque em Salvar ajustes para aplicar a referência.",
          "A referência padrão é um BYD Song Pro 25/26 com carregador portátil original, de 69% a 100% em 2h30: início às 04:20, parcial de 85% às 05:37 e término às 06:50. Com ela, sem margem, uma bateria de 69% produz estimativa de 2h30 e início às 04:30 para o alvo de 07:00.",
          "Com 40%, a estimativa é de 4h51 e o início sugerido é às 02:10, com término estimado às 07:01. O início usa intervalos de cinco minutos; a tela informa quando esse ajuste prevê terminar depois do alvo. Abaixo dos 69% observados nesta referência, o cálculo é uma extrapolação.",
          "A duração é arredondada para cima ao minuto. Uma margem antecipa o início e pode fazer a carga terminar antes do horário escolhido. Se a duração observada mudar, revise a calibração.",
        ],
      },
      {
        title: "Histórico, perfis e lembretes",
        paragraphs: [
          "Em Histórico e perfis, salve combinações de carro/carregador e registre cargas. A comparação usa a referência do momento do registro, não uma previsão coletada automaticamente do carro. Usar uma carga como referência exige sua escolha.",
          "O lembrete opcional está disponível no aplicativo instalado no iPhone; a calculadora web não agenda notificações. A entrega depende da permissão e das configurações de notificações do aparelho.",
          "Na calculadora web, os ajustes, perfis e histórico ficam salvos neste navegador. Eles não são sincronizados automaticamente com outro navegador, outro aparelho ou o aplicativo iOS.",
        ],
      },
      {
        title: "Quando não há tempo suficiente",
        paragraphs: [
          "O horário-alvo é a próxima ocorrência do horário escolhido no fuso do aparelho. Se o início recomendado já passou, confira a orientação exibida. Se a duração não couber no tempo restante, o app mostra o término estimado começando agora.",
          "Com 100% de bateria, não é necessário agendar uma nova carga. A leitura real deve ser conferida no veículo.",
        ],
      },
      {
        title: "Restaurar e apagar os dados locais",
        paragraphs: [
          "Abra Sua recarga → Restaurar e apagar dados locais e confirme a operação. A porcentagem, os ajustes, os perfis e o histórico serão apagados e o lembrete será cancelado. Isso não apaga mensagens de atendimento ou cópias mantidas nos backups do sistema.",
          "Na versão web, essa opção apaga os dados da calculadora salvos neste navegador. Limpar os dados do site nas configurações do navegador também os remove.",
        ],
      },
      {
        title: "Conexão com a internet",
        paragraphs: [
          "No aplicativo instalado no iPhone, os cálculos e os ajustes locais funcionam sem internet. Na versão web, é necessária conexão para abrir a página. Os cálculos acontecem no navegador, mas não há garantia de abrir ou recarregar a calculadora sem internet.",
          "Para conversar pelo WhatsApp ou abrir páginas externas, será necessária conexão.",
          "Tetelestai Recarga é um aplicativo independente, sem integração ou vínculo com a BYD.",
        ],
      },
      {
        title: "Privacidade do aplicativo",
        paragraphs: [
          "Consulte como o Tetelestai Recarga trata os dados locais e as informações que você decidir enviar ao suporte.",
        ],
        link: { label: "Ler a política de privacidade do aplicativo", href: "/recarga/privacidade/" },
      },
    ],
  },
  "recarga-privacy": {
    path: "/recarga/privacidade/",
    label: "Privacidade do aplicativo",
    title: "Privacidade — Tetelestai Recarga",
    metaTitle: "Privacidade — Tetelestai Recarga",
    metaDescription: "Como o Tetelestai Recarga trata seus dados locais e as informações de suporte.",
    intro: "Esta política descreve o tratamento de dados no Tetelestai Recarga, versão 1.0.5, na calculadora web e no suporte do aplicativo.",
    sections: [
      {
        title: "Sobre o aplicativo",
        paragraphs: [
          "O Tetelestai Recarga é uma calculadora de duração e horário de carregamento. Você informa o percentual da bateria e uma referência de carga para obter uma estimativa. O aplicativo não acessa o veículo nem inicia, interrompe ou controla o carregamento.",
        ],
      },
      {
        title: "Informações no aparelho",
        paragraphs: [
          "O aplicativo guarda localmente o percentual informado, o nome do veículo, a carga observada, o horário de conclusão e a margem. Também guarda perfis de carro/carregador e histórico de cargas com as estimativas registradas. Esses dados permitem retomar o uso sem preencher tudo novamente.",
          "Na versão web, esses dados ficam salvos no navegador usado para acessar a calculadora. Não há sincronização automática entre navegadores, aparelhos ou com o aplicativo iOS.",
          "Os cálculos são realizados no aparelho. O aplicativo não envia sua bateria, seus horários ou sua calibração para servidores e não exige cadastro. Esta versão é gratuita e não inclui publicidade, rastreamento, ferramentas de análise de uso ou sincronização com uma conta remota.",
          "O aplicativo não acessa localização, contatos, fotos ou dados de acesso ao veículo. A porcentagem da bateria é informada por você; não é obtida automaticamente do carro.",
          "Ao abrir a versão web, a hospedagem do site pode registrar dados técnicos de acesso, como endereço IP e horário. Esses registros são distintos dos valores preenchidos na calculadora.",
        ],
      },
      {
        title: "Lembretes locais",
        paragraphs: [
          "O lembrete opcional usa notificações locais do iPhone, mediante permissão. Não solicitamos token de push nem usamos notificações remotas. A entrega depende das configurações do sistema. Você pode cancelar o lembrete no aplicativo.",
          "A calculadora web não agenda lembretes nem solicita permissão de notificações.",
        ],
      },
      {
        title: "Área de transferência",
        paragraphs: [
          "Ao tocar em Copiar horário, um resumo da recarga é escrito na área de transferência. O resumo inclui o nome do veículo, o percentual informado, a duração, os horários e, quando aplicável, a margem e a orientação sobre o prazo.",
          "O aplicativo não lê o conteúdo anterior da área de transferência. O sistema pode sincronizar o texto copiado com seus outros aparelhos. O tratamento desse conteúdo pelo sistema e por outros aplicativos depende das configurações e permissões do seu aparelho.",
        ],
      },
      {
        title: "Retenção e exclusão",
        paragraphs: [
          "Os valores locais ficam disponíveis até que você os altere ou use Sua recarga → Restaurar e apagar dados locais. Depois da confirmação, essa opção restaura a referência inicial, remove os ajustes, perfis e histórico e cancela o lembrete.",
          "Na versão web, limpar os dados do site nas configurações do navegador também remove os dados da calculadora. A restauração pelo aplicativo ou a limpeza do navegador não apaga dados que estejam guardados em outro navegador ou no aplicativo iOS.",
          "Recursos de backup e restauração do aparelho podem manter cópias de dados locais conforme suas configurações do sistema. Caso queira eliminar também essas cópias, confira os controles de backup e armazenamento da Apple.",
        ],
      },
      {
        title: "Links externos e suporte",
        paragraphs: [
          "Os cálculos são realizados localmente. A versão web precisa de conexão para abrir a página e não oferece garantia de acesso sem internet. Abrir páginas externas e o suporte também depende de conexão.",
          "O contato por WhatsApp é voluntário. Nenhum dado da calculadora é incluído automaticamente na conversa. As informações que você decidir enviar nesse atendimento serão usadas para responder à sua solicitação e tratar o problema relatado. O WhatsApp e os serviços utilizados para acessar páginas externas também têm suas próprias práticas de privacidade.",
          "Mensagens de atendimento não são apagadas pela opção que remove os dados locais do aplicativo. Para solicitar informações sobre um atendimento ou pedir a exclusão de mensagens mantidas pela Tetelestai, use os canais de contato desta página. Eventuais registros necessários para cumprir obrigações aplicáveis poderão ser conservados pelo período correspondente.",
        ],
        link: { label: "Abrir o suporte do aplicativo", href: "/recarga/suporte/" },
      },
      {
        title: "Alterações",
        paragraphs: [
          "Esta política será atualizada se as funções ou as práticas de tratamento de dados do aplicativo mudarem. A data no início do documento identifica a versão do texto.",
        ],
      },
    ],
  },
};
