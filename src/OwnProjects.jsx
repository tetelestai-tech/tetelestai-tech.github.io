import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";

export function OwnProjects({ children }) {
  return (
    <section id="projects" className="service-section service-section--surface project-section" aria-labelledby="projects-title">
      <div className="section-shell">
        <p className="eyebrow">Na prática</p>
        <h2 id="projects-title">Projetos próprios</h2>

        <article className="project project--site" aria-labelledby="project-site-title">
          <div className="project__copy">
            <p className="project__category">Site institucional · Projeto próprio</p>
            <h3 id="project-site-title">Site Tetelestai</h3>
            <p>Site institucional com versões em português e inglês, páginas dedicadas aos serviços e contato pelo WhatsApp.</p>
            <p>Medição de visitas e cliques mediante consentimento.</p>
            <a className="text-link" href="/">Conhecer o site<ArrowRightIcon size={20} aria-hidden="true" /></a>
          </div>
          <figure className="project__preview project__preview--site">
            <img src="/assets/projects/site-tetelestai.png" width="1440" height="1050" loading="lazy" decoding="async" alt="Página inicial da Tetelestai, com navegação PT e EN, identidade em azul-marinho e ciano e apresentação da empresa." />
            <figcaption>Página inicial em português</figcaption>
          </figure>
        </article>

        <article className="project project--recarga" aria-labelledby="project-recarga-title">
          <div className="project__copy">
            <p className="project__category">Aplicativo · Projeto próprio</p>
            <h3 id="project-recarga-title">Tetelestai Recarga PHEV</h3>
            <p>Aplicativo para planejar a recarga do veículo, estimando a duração e o horário de início com base em uma carga observada. Permite salvar perfis de carro e carregador e registrar o histórico no próprio aparelho.</p>
            <p className="project__status"><strong>Em testes</strong>Versão iOS em testes via TestFlight. Publicação na App Store aguardando revisão.</p>
          </div>
          <figure className="project__preview project__preview--app">
            <img src="/assets/projects/recarga-planejamento.png" width="526" height="918" loading="lazy" decoding="async" alt="Tela Planejar recarga do Tetelestai Recarga PHEV, com bateria informada pelo usuário, horário desejado, início sugerido e duração estimada." />
            <figcaption>Planejar recarga</figcaption>
          </figure>
          <details className="project__details">
            <summary>Ver mais telas do aplicativo</summary>
            <div className="project__gallery">
              <figure className="project__preview">
                <img src="/assets/projects/recarga-referencia.png" width="581" height="891" loading="lazy" decoding="async" alt="Tela Sua recarga, com veículo, percentuais de bateria, duração da carga observada e margem para antecipar o início." />
                <figcaption>Sua recarga · Ajuste da estimativa</figcaption>
              </figure>
              <figure className="project__preview">
                <img src="/assets/projects/recarga-historico.png" width="517" height="860" loading="lazy" decoding="async" alt="Tela Perfis e histórico, com campos para salvar a configuração do carro e carregador e registrar uma carga observada no aparelho." />
                <figcaption>Perfis e histórico · Dados no aparelho</figcaption>
              </figure>
            </div>
          </details>
        </article>
      </div>
      {children}
    </section>
  );
}
