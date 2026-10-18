import { SERVICE_PAGES } from './service-content.mjs';
import { PORTFOLIO_PAGES } from './portfolio-content.mjs';

// Complete translations of existing approved content, not additional offers.
export const EN_SERVICE_PAGES = {
  sites: {
    ...SERVICE_PAGES.sites, path:'/en/website-development/', homeSection:'digital-solutions', category:'Digital solutions',
    label:'Website development', metaTitle:'Website development for businesses | Tetelestai',
    metaDescription:'Websites that present your business, explain your services and make contact easier. Tailored visual design and a scope defined for each project.',
    title:'Website development for businesses',
    intro:'We develop websites with tailored visual design to present your business and its services. The project starts with what you need to communicate and the path visitors should find to contact you.',
    objectiveTitle:'What would you like to present?',
    scopeIntro:'Each project starts with the company’s objectives and priorities. The proposal records the deliverables, responsibilities and working conditions.',
    useCases:[
      {title:'Present your business',text:'Bring together information about the business, its activities and its services at a dedicated web address.'},
      {title:'Explain your services',text:'Give visitors context to understand what your company does and assess whether a service meets their needs. Tetelestai’s website and landing page development pages illustrate this separation by service.'},
      {title:'Organize the contact path',text:'Show visitors where to find information and how to discuss a specific need with the company. On this website, business inquiries are handled through WhatsApp.'},
    ],
    scope:[
      {title:'Structure and navigation',text:'Define pages, sections and navigation paths according to the information the website needs to present.'},
      {title:'Visual design',text:'A tailored presentation that considers the company’s identity and the organization of its content.'},
      {title:'Copy and images',text:'Review available materials and define who will supply, produce and approve each piece of content.'},
      {title:'Features and publication',text:'Features, integrations and publication arrangements are assessed when defining the scope.'},
    ],
    faqs:[
      {q:'What is the difference between a website and a landing page?',a:'A website can bring together information about the company and different services. A landing page focuses the presentation of an offer or campaign on one main action, such as starting a conversation.'},
      {q:'Do I need to have copy and images ready?',a:'Gather what you already have. The scope should identify which materials will be used, what still needs to be prepared and who is responsible for each part.'},
      {q:'How are the domain, hosting and maintenance handled?',a:'The proposal must specify who manages the domain and hosting, how publication will work and which conditions apply to updates and maintenance.'},
      {q:'How is the price determined?',a:'It depends on the objectives, website structure, available materials and required features. The initial conversation helps define the work before a proposal is prepared.'},
    ],
    contactTitle:'Tell us what your business needs', contactText:'Share the website’s objective, the services you want to present and whether you already have a published page. We will discuss scope, availability and conditions.', ctaLabel:'Discuss my website',
  },
  landingPages:{
    ...SERVICE_PAGES.landingPages, path:'/en/landing-pages/', homeSection:'digital-solutions', category:'Digital solutions',
    label:'Landing page development', metaTitle:'Landing page development for businesses | Tetelestai',
    metaDescription:'Landing pages that present an offer or campaign and guide a contact action. Tailored visual design and a scope defined for each project.',
    title:'Landing page development for businesses', intro:'We develop landing pages to present an offer or campaign with a clear objective. Content and design are organized around what visitors need to understand before taking the next step.',
    objectiveTitle:'What would you like to present?', scopeIntro:'Each project starts with the company’s objectives and priorities. The proposal records the deliverables, responsibilities and working conditions.',
    useCases:[
      {title:'Present an offer',text:'Explain a specific service or product, its features and the information needed to start a conversation. This page presents our landing page development service and its scope arrangements.'},
      {title:'Welcome campaign visitors',text:'Continue the message shared in ads, social media or other channels on a page dedicated to the campaign.'},
      {title:'Focus on one action',text:'Guide visitors toward a defined next step, such as chatting on WhatsApp or requesting information. Here, the proposed action is to discuss the project on WhatsApp.'},
    ],
    scope:[
      {title:'Page objective',text:'Define the offer, audience and action the page should present to visitors.'},
      {title:'Content and design',text:'Organize the sections and tailored visual design, defining copy, images and responsibility for these materials.'},
      {title:'Contact path',text:'Choose the call to action and contact destination according to the project’s objective and available channels.'},
      {title:'Features and publication',text:'Forms, integrations and publication arrangements must be assessed and defined in the scope.'},
    ],
    faqs:[
      {q:'Does a landing page replace the company website?',a:'It depends on what you need to present. A landing page can serve a specific offer, while a website brings together broader information about the company and its services. Both formats can also be used together.'},
      {q:'Do I need to run ads to use a landing page?',a:'No. The address can also be shared through social media, messages and other channels. Where visitors come from helps define the message and page structure.'},
      {q:'Are forms and integrations included in the project?',a:'Their inclusion depends on the scope. We need to identify what will be collected, where the information will be sent and which systems and access permissions are involved.'},
      {q:'What information should I provide to request a proposal?',a:'Describe the offer, the people you want to reach, where visitors will come from and the action you want to guide. It also helps to share which materials are available and whether you already have a domain or hosting.'},
    ],
    contactTitle:'What offer would you like to present?',contactText:'Tell us the page’s objective and how you plan to promote it. With this context, we can discuss scope, availability and conditions.',ctaLabel:'Discuss my landing page',
  },
  career:{
    ...SERVICE_PAGES.career,path:'/en/international-career/',homeSection:'international-career',category:'International careers',
    label:'International career consulting',metaTitle:'International career consulting for technology professionals | Tetelestai',
    metaDescription:'Guidance for technology professionals: English CV, LinkedIn, ATS alignment and an international application strategy.',
    title:'International career consulting for technology professionals',intro:'Strategic guidance for technology professionals who want to work globally. Professional positioning through an English CV, LinkedIn, ATS alignment and an application strategy.',
    objectiveTitle:'What is your career goal?',scopeIntro:'Each engagement starts with your career goal and current context. The proposal records the consulting deliverables and working conditions.',
    useCases:[
      {title:'Organize your professional positioning',text:'Align the presentation of your career history with your objective of working internationally.'},
      {title:'Present your CV and LinkedIn profile',text:'Work on the presentation of your English CV and LinkedIn profile, considering ATS alignment within the consulting scope.'},
      {title:'Define an application strategy',text:'Organize applications according to your stated objective and professional context.'},
    ],
    scope:[
      {title:'Goal and context',text:'Understand your career goal, background and relevant constraints.'},
      {title:'English CV and ATS',text:'Define the work on your English CV and its alignment with ATS requirements.'},
      {title:'LinkedIn',text:'Guidance on the positioning and presentation of your professional profile.'},
      {title:'Application strategy',text:'Define the areas to work on and the next steps within the agreed scope.'},
    ],
    faqs:[
      {q:'Who is international career consulting for?',a:'Technology professionals who want to organize their positioning and applications for international opportunities.'},
      {q:'Does the consulting service guarantee interviews or a job offer?',a:'No. Interviews and hiring depend on recruitment processes and employers’ decisions. The consulting service focuses on professional positioning and application strategy.'},
      {q:'Does the consulting service include immigration legal advice?',a:'No. The consulting service does not provide immigration legal advice, visa services or immigration guarantees.'},
      {q:'What should I share in the first conversation?',a:'Share your career goal and application context. Review the scope and conditions before sending materials; do not send full CVs or sensitive documents in the first conversation.'},
    ],
    contactTitle:'Tell us your career goal',contactText:'Share what you would like to work on in your international applications and ask about the consulting scope, availability and conditions.',ctaLabel:'Discuss my international career',
  },
  aiTraining:{
    ...SERVICE_PAGES.aiTraining,path:'/en/ai-training/',homeSection:'practical-ai',category:'AI training',
    label:'AI training',metaTitle:'Practical AI training for people and businesses | Tetelestai',
    metaDescription:'Artificial intelligence training with content and format defined according to the audience, objective and participants’ level of knowledge.',
    title:'Practical artificial intelligence training',intro:'Practical, applied training for people and businesses to develop AI skills. Content and format are adapted to the audience, objective and participants’ level of knowledge.',
    objectiveTitle:'What would you like to develop with AI?',scopeIntro:'Training is provided on demand. Content and format are defined according to the audience, objective and participants’ level of knowledge.',
    useCases:[
      {title:'Develop AI skills',text:'Define what you would like to learn and how that objective will guide the training.'},
      {title:'Train people and teams',text:'Consider the participants and their current knowledge when preparing the training.'},
      {title:'Connect content with your objective',text:'Organize content around the need described in the initial conversation.'},
    ],
    scope:[
      {title:'Audience and level',text:'Identify the participants and the level of knowledge to consider in the training.'},
      {title:'Objective and content',text:'Define topics and activities according to the stated objective.'},
      {title:'Format',text:'Define the training format and organization within the agreed scope.'},
      {title:'Availability and conditions',text:'Review the working conditions before confirming the training.'},
    ],
    faqs:[
      {q:'Who is AI training for?',a:'People and businesses that want to develop practical artificial intelligence skills. Content is adapted to the audience and objective.'},
      {q:'Is there a fixed training program?',a:'Training is provided on demand. Content and format are defined according to the audience, objective and participants’ level of knowledge.'},
      {q:'Do I need previous experience with AI?',a:'Your level of knowledge is considered when defining the content. Tell us what you or your team already know and what you would like to develop.'},
      {q:'What should I share to discuss a training engagement?',a:'Describe who will participate, the objective and their current knowledge level. With this context, we can discuss scope, availability and conditions.'},
    ],
    contactTitle:'Tell us the training objective',contactText:'Share the audience, objective and participants’ knowledge level to discuss on-demand AI training.',ctaLabel:'Discuss AI training',
  },
};

export const EN_PORTFOLIO_PAGES = {
  portfolio:{...PORTFOLIO_PAGES.portfolio,path:'/en/projects/',label:'Projects',metaTitle:'Website and iOS App Portfolio | TETELESTAI',metaDescription:'Explore Tetelestai’s websites for Infinity Car Studio and Vovó Juju, plus the iOS apps Tempo de Recarga and De Rolê.'},
  infinityProject:{...PORTFOLIO_PAGES.infinityProject,path:'/en/projects/infinity-car-studio/',category:'Automotive detailing',type:'Business website',
    intro:'A digital presentation for Infinity’s automotive detailing business in Guará II, Brasília. The website brings together its services, work published by the team and contact options.',
    objective:'Present automotive detailing services and let visitors explore the work before asking the team about care for their car.',
    delivery:[
      {title:'Identity and presentation',text:'Responsive design with Infinity’s identity and images of work carried out by the company.'},
      {title:'Services and work',text:'Organization of washing, interior cleaning, polishing, ceramic coating and PPF services, with a photo and video gallery.'},
      {title:'Contact path',text:'Direct WhatsApp links, the address in Guará II and answers to questions about services and inquiries.'},
    ],tags:['Business website','Photo and video','WhatsApp'],
    metaTitle:'Infinity Car Studio — website project | Tetelestai',metaDescription:'Explore the Infinity Car Studio website developed by Tetelestai: service presentation, work in photos and videos, and WhatsApp contact.',
  },
  jujuProject:{...PORTFOLIO_PAGES.jujuProject,path:'/en/projects/bolachinhas-da-vovo-juju/',category:'Artisan food',type:'Landing page',
    intro:'A page dedicated to Vovó Juju’s sweet cassava-starch biscuits. Product photographs and an artisan identity guide the brand presentation and contact through Instagram.',
    objective:'Present the brand and its sweet cassava-starch biscuits, highlighting product photography and a direct path to ask about availability on Instagram.',
    delivery:[
      {title:'Product in focus',text:'An opening with photographs of the biscuits and packaging, preserving the brand’s visual identity.'},
      {title:'Desktop and mobile reading',text:'A responsive composition for exploring the products and navigating the page’s information.'},
      {title:'Instagram contact',text:'Guidance for inquiries about products, pickup and ingredients, with a direct link to the brand’s profile.'},
    ],tags:['Landing page','Product showcase','Instagram'],
    metaTitle:'Bolachinhas da Vovó Juju — website project | Tetelestai',metaDescription:'Explore the Vovó Juju landing page developed by Tetelestai: artisan identity, product photography, responsive presentation and Instagram contact.',
  },
};

export const servicesFor = locale => locale === 'en' ? EN_SERVICE_PAGES : SERVICE_PAGES;
export const portfolioFor = locale => locale === 'en' ? EN_PORTFOLIO_PAGES : PORTFOLIO_PAGES;
export function equivalentPaths(page) {
  const pt=SERVICE_PAGES[page] ?? PORTFOLIO_PAGES[page];
  const en=EN_SERVICE_PAGES[page] ?? EN_PORTFOLIO_PAGES[page];
  return pt && en ? {pt:pt.path,en:en.path} : {pt:'/',en:'/en/'};
}

export const COMMERCIAL_TRANSLATIONS = [...Object.keys(SERVICE_PAGES),...Object.keys(PORTFOLIO_PAGES)].map(equivalentPaths);
