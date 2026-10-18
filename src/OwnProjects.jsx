import { APP_STORE_LINKS, DE_ROLE_APP_STORE } from "./app-store-links.mjs";
import { getAnalytics } from "./analytics.mjs";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";

export function OwnProjects({ children, locale = "pt" }) {
  const english = locale === "en";
  const u = (pt,en) => english ? en : pt;
  return (
    <section id="ios-apps" className="service-section service-section--surface project-section" aria-labelledby="ios-apps-title">
      <div className="section-shell">
        <p className="eyebrow">{u("Da ideia ao aplicativo","From idea to app")}</p>
        <h2 id="ios-apps-title">{u("Aplicativos iOS","iOS apps")}</h2>

        <article className="project project--app project--recarga" aria-labelledby="project-recarga-title">
          <div className="project__copy">
            <p className="project__category">{u("Aplicativo iOS · Utilidades","iOS app · Utilities")}</p>
            <h3 id="project-recarga-title">Tetelestai: Tempo de Recarga</h3>
            <p>{u("Aplicativo para planejar a recarga do veículo, estimando a duração e o horário de início com base em uma carga observada. Permite salvar perfis de carro e carregador e registrar o histórico no próprio aparelho.","An app for planning vehicle charging, estimating its duration and start time based on an observed charge. Users can save vehicle and charger profiles and keep a history on their device.")}</p>
            <p className="project__status"><strong>{u("Disponível na App Store","Available on the App Store")}</strong>{u("Planejamento de recarga para veículos elétricos e híbridos plug-in, com perfis e histórico no aparelho.","Charging planning for electric vehicles and plug-in hybrids, with profiles and history stored on the device.")}</p>
            <div className="app-download">
              <a className="app-download__qr" onClick={() => getAnalytics().trackAppStore("qr_link")} href={APP_STORE_LINKS.qr} target="_blank" rel="noopener noreferrer" aria-label={u("Abrir Tetelestai: Tempo de Recarga na App Store","Open Tetelestai: Tempo de Recarga on the App Store")}>
                <img src="/assets/projects/recarga-app-store-qr.png" width="196" height="196" loading="lazy" decoding="async" alt={u("QR code para baixar Tetelestai: Tempo de Recarga na App Store.","QR code to download Tetelestai: Tempo de Recarga from the App Store.")} />
              </a>
              <div className="app-download__copy"><p>{u("Leia o QR code com a câmera do iPhone ou acesse pelo botão.","Scan the QR code with your iPhone camera or use the button.")}</p><a className="button button--primary" onClick={() => getAnalytics().trackAppStore("button")} href={APP_STORE_LINKS.button} target="_blank" rel="noopener noreferrer">{u("Baixar na App Store","Download on the App Store")}<ArrowRightIcon size={20} aria-hidden="true" /></a></div>
            </div>
          </div>
          <figure className="project__preview project__preview--app">
            <img src="/assets/projects/recarga-planejamento.png" width="526" height="918" loading="lazy" decoding="async" alt={u("Tela Planejar recarga do Tetelestai: Tempo de Recarga, com bateria informada pelo usuário, horário desejado, início sugerido e duração estimada.","Original Portuguese charging planner screen with the user-entered battery level, desired completion time, suggested start and estimated duration.")} />
            <figcaption>{u("Planejar recarga","Charging planner · Original app screen")}</figcaption>
          </figure>
          <details className="project__details">
            <summary>{u("Ver mais telas do aplicativo","View more app screens")}</summary>
            <div className="project__gallery">
              <figure className="project__preview">
                <img src="/assets/projects/recarga-referencia.png" width="581" height="891" loading="lazy" decoding="async" alt={u("Tela Sua recarga, com veículo, percentuais de bateria, duração da carga observada e margem para antecipar o início.","Original Portuguese charging reference screen with the vehicle, battery percentages, observed charge duration and start-time margin.")} />
                <figcaption>{u("Sua recarga · Ajuste da estimativa","Your charging · Estimate adjustment")}</figcaption>
              </figure>
              <figure className="project__preview">
                <img src="/assets/projects/recarga-historico.png" width="517" height="860" loading="lazy" decoding="async" alt={u("Tela Perfis e histórico, com campos para salvar a configuração do carro e carregador e registrar uma carga observada no aparelho.","Original Portuguese profiles and history screen for saving vehicle and charger settings and recording observed charges on the device.")} />
                <figcaption>{u("Perfis e histórico · Dados no aparelho","Profiles and history · Data on the device")}</figcaption>
              </figure>
            </div>
          </details>
        </article>

        <article id="app-de-role" className="project project--app project--de-role" aria-labelledby="project-de-role-title">
          <div className="project__copy">
            <p className="project__category">{u("Aplicativo iOS · Jogo de palavras em equipe","iOS app · Team word game")}</p>
            <div className="app-project__title">
              <img src="/assets/projects/de-role-icon.webp" width="192" height="192" loading="lazy" decoding="async" alt="" />
              <h3 id="project-de-role-title">De Rolê</h3>
            </div>
            <p>{u("Jogo de adivinhação em português brasileiro para reunir duas equipes em torno de um celular. Turnos de 60 segundos, cartas para dar dicas e placar da partida.","A Brazilian Portuguese word game for two teams sharing one phone, with 60-second turns, clue cards and a match scoreboard.")}</p>
            <p className="project__status"><strong>{u("Disponível na App Store","Available on the App Store")}</strong>{u("180 cartas gratuitas para começar. Versão completa disponível por compra única dentro do app.","Start with 180 free cards. The full version is available as a one-time in-app purchase.")}</p>
            <div className="app-download">
              <a className="app-download__qr" href={DE_ROLE_APP_STORE.url} onClick={() => getAnalytics().trackAppStore("qr_link", DE_ROLE_APP_STORE.id)} target="_blank" rel="noopener noreferrer" aria-label={u("Abrir De Rolê na App Store","Open De Rolê on the App Store")}>
                <img src="/assets/projects/de-role-app-store-qr.png" width="296" height="296" loading="lazy" decoding="async" alt={u("QR code para baixar De Rolê na App Store.","QR code to download De Rolê from the App Store.")} />
              </a>
              <div className="app-download__copy">
                <p>{u("Leia o QR code com a câmera do iPhone ou acesse pelo botão.","Scan the QR code with your iPhone camera or use the button.")}</p>
                <a className="button button--primary" href={DE_ROLE_APP_STORE.url} onClick={() => getAnalytics().trackAppStore("button", DE_ROLE_APP_STORE.id)} target="_blank" rel="noopener noreferrer">{u("Baixar na App Store","Download on the App Store")}<ArrowRightIcon size={20} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
          <figure className="project__preview project__preview--app project__preview--video">
            <a className="app-video-cover" href="/assets/projects/de-role-video-20s.mp4" type="video/mp4" target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackAppVideo("cover", DE_ROLE_APP_STORE.id)} aria-label={u("Assistir ao vídeo do De Rolê, 20 segundos, em nova aba","Watch the De Rolê video in Portuguese, 20 seconds, in a new tab")}>
              <img src="/assets/projects/de-role-video-capa.webp" width="1080" height="1920" loading="lazy" decoding="async" alt={u("Capa do vídeo De Rolê: amigos reunidos à mesa com a chamada Explique sem dizer a palavra.","De Rolê video cover showing friends around a table and the Portuguese tagline Explain without saying the word.")} />
            </a>
            <figcaption><a className="text-link" href="/assets/projects/de-role-video-20s.mp4" type="video/mp4" target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackAppVideo("text", DE_ROLE_APP_STORE.id)}>{u("Assistir ao vídeo do app · 20 s","Watch the app video · 20 s")}<ArrowRightIcon size={18} aria-hidden="true" /></a></figcaption>
          </figure>
          <details className="project__details">
            <summary>{u("Ver mais telas do De Rolê","View more De Rolê screens")}</summary>
            <div className="project__gallery">
              <figure className="project__preview">
                <img src="/assets/projects/de-role-inicio.webp" width="1206" height="2622" loading="lazy" decoding="async" alt={u("Tela inicial do De Rolê com a chamada Junta a turma, ilustração de amigos e botão Jogar.","Original Portuguese De Rolê home screen with friends, the invitation to get together and the Play button.")} />
                <figcaption>{u("Junta a turma · Tela inicial","Get together · Original app screen")}</figcaption>
              </figure>
              <figure className="project__preview">
                <img src="/assets/projects/de-role-baralhos.webp" width="1206" height="2622" loading="lazy" decoding="async" alt={u("Escolha entre o baralho gratuito de 180 cartas e a versão completa, com 720 cartas no total.","Original Portuguese deck selection screen with 180 free cards and a full version containing 720 cards in total.")} />
                <figcaption>{u("Escolha do baralho","Deck selection · Original app screen")}</figcaption>
              </figure>
              <figure className="project__preview">
                <img src="/assets/projects/de-role-equipes.webp" width="1206" height="2622" loading="lazy" decoding="async" alt={u("Tela Passe o celular, com a equipe da vez, turno e placar da partida.","Original Portuguese handover screen with the current team, turn and match score.")} />
                <figcaption>{u("Equipes e turnos","Teams and turns · Original app screen")}</figcaption>
              </figure>
            </div>
          </details>
        </article>
      </div>
      {children}
    </section>
  );
}
