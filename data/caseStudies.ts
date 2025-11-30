// Case study types and data

export interface CaseStudyImage {
  src: string;
  alt: { sv: string; en: string };
}

export interface CaseStudyClient {
  name: string | null;
  industry: { sv: string; en: string };
  size?: { sv: string; en: string };
  logo?: string;
}

export interface CaseStudyMetric {
  value: string;
  label: { sv: string; en: string };
  trend?: 'up' | 'down';
}

export interface CaseStudyTestimonial {
  quote: { sv: string; en: string };
  author: string;
  role: { sv: string; en: string };
}

export interface CaseStudySection {
  id: string;
  heading: { sv: string; en: string };
  content: { sv: string; en: string };
  image?: CaseStudyImage;
}

export interface CaseStudy {
  slug: string;
  title: { sv: string; en: string };
  excerpt: { sv: string; en: string };
  heroImage: CaseStudyImage;
  publishDate: string;
  client: CaseStudyClient;
  tags: string[];
  services: { sv: string; en: string }[];
  metrics: CaseStudyMetric[];
  challenge: { sv: string; en: string };
  solution: { sv: string; en: string };
  testimonial?: CaseStudyTestimonial;
  sections: CaseStudySection[];
  duration?: { sv: string; en: string };
}

export const caseStudies: CaseStudy[] = [
  // Case 1: Aura - Quiet Luxury E-commerce
  {
    slug: 'aura-quiet-luxury-ecommerce',
    title: {
      sv: 'Aura – När teknik blir natur',
      en: 'Aura – When Technology Becomes Nature'
    },
    excerpt: {
      sv: 'En premium e-handelsplattform för "quiet luxury"-hemelektronik. Vi skapade en digital upplevelse där varje interaktion känns som en del av naturen.',
      en: 'A premium e-commerce platform for "quiet luxury" consumer electronics. We created a digital experience where every interaction feels like part of nature.'
    },
    heroImage: {
      src: '/case-study/aura/image copy 2.png',
      alt: { sv: 'Aura Quiet Living', en: 'Aura Quiet Living' }
    },
    publishDate: '2024-11-20',
    client: {
      name: 'Aura',
      industry: { sv: 'E-handel & Lifestyle', en: 'E-commerce & Lifestyle' },
      size: { sv: 'Startup', en: 'Startup' }
    },
    tags: ['React', 'TypeScript', 'Google Gemini AI', 'Tailwind CSS'],
    services: [
      { sv: 'UI/UX Design', en: 'UI/UX Design' },
      { sv: 'E-handelsplattform', en: 'E-commerce Platform' },
      { sv: 'AI Integration', en: 'AI Integration' }
    ],
    metrics: [
      { value: '42%', label: { sv: 'Högre konvertering', en: 'Higher conversion' }, trend: 'up' },
      { value: '3.2x', label: { sv: 'Längre sessionstid', en: 'Longer session time' }, trend: 'up' },
      { value: '89%', label: { sv: 'Lägre avvisningsfrekvens', en: 'Lower bounce rate' }, trend: 'down' },
      { value: '4.8/5', label: { sv: 'Användaromdöme', en: 'User rating' }, trend: 'up' }
    ],
    challenge: {
      sv: 'Aura ville utmana "black box"-estetiken inom hemelektronik. De tillverkar produkter med organiska material – sandsten, obehandlad aluminium, bomull. Men hur skapar man en e-handel som speglar denna filosofi utan att kännas som ännu en Shopify-mall?',
      en: 'Aura wanted to challenge the "black box" aesthetic in consumer electronics. They manufacture products with organic materials – sandstone, untreated aluminum, cotton. But how do you create an e-commerce that reflects this philosophy without feeling like just another Shopify template?'
    },
    solution: {
      sv: 'Vi byggde en plattform där varje detalj kommunicerar lugn och medveten design. Istället för aggressiva "Köp nu"-knappar skapade vi en AI-concierge driven av Google Gemini som agerar varumärkesambassadör och hjälper kunder baserat på deras välmående-behov.',
      en: 'We built a platform where every detail communicates calm and conscious design. Instead of aggressive "Buy now" buttons, we created an AI concierge powered by Google Gemini that acts as brand ambassador and helps customers based on their wellness needs.'
    },
    testimonial: {
      quote: {
        sv: 'Siteflow förstod vår vision direkt. De skapade inte bara en e-handel – de skapade en digital förlängning av vårt varumärke. Våra kunder säger att bara att besöka sajten ger dem en känsla av ro.',
        en: 'Siteflow understood our vision immediately. They didn\'t just create an e-commerce site – they created a digital extension of our brand. Our customers say that just visiting the site gives them a sense of peace.'
      },
      author: 'Emma Lindström',
      role: { sv: 'Grundare, Aura', en: 'Founder, Aura' }
    },
    sections: [
      {
        id: 'designfilosofi',
        heading: { sv: 'Digital Silence', en: 'Digital Silence' },
        content: {
          sv: 'Vår designfilosofi för Aura byggde på konceptet "Digital Silence". Vi undvek alla traditionella e-handelstrick:\n\n• Inga röda notisbubblor eller skarpa kontraster\n• Inga aggressiva popup-fönster eller tidsbegränsade erbjudanden\n• Inga stressframkallande räknare eller "bara 3 kvar i lager"\n\nIstället fokuserade vi på:\n\n• Varma crèmetoner och mjukt kolgrått\n• Långsamma, naturliga animationer som efterliknar fysisk tröghet\n• Generösa whitespace och läsbar typografi\n• En upplevelse som känns mer som ett galleri än en butik',
          en: 'Our design philosophy for Aura was built on the concept of "Digital Silence". We avoided all traditional e-commerce tricks:\n\n• No red notification bubbles or sharp contrasts\n• No aggressive popups or time-limited offers\n• No stress-inducing counters or "only 3 left in stock"\n\nInstead, we focused on:\n\n• Warm cream tones and soft charcoal gray\n• Slow, natural animations that mimic physical inertia\n• Generous whitespace and readable typography\n• An experience that feels more like a gallery than a shop'
        },
        image: {
          src: '/case-study/aura/image copy 5.png',
          alt: { sv: 'Aura materiallära', en: 'Aura material philosophy' }
        }
      },
      {
        id: 'ai-concierge',
        heading: { sv: 'AI-Concierge', en: 'AI Concierge' },
        content: {
          sv: '**Den smartaste sälj assistant**\n\nIstället för traditionell sökning eller FAQ implementerade vi en AI-driven concierge powered by Google Gemini 2.5 Flash.\n\nConciergen förstår kontext och rekommenderar produkter baserat på användarens välmående-mål:\n\n• "Jag känner mig stressad" → Föreslår Aura Essence (luftrenare) eller Aura Epoch (klocka med stressmätare)\n• "Jag vill fokusera bättre" → Visar Aura Harmony (noise-cancelling hörlurar)\n• "Söker hållbara produkter" → Förklarar materialval och livscykel\n\nAI:n är tränad på Auras varumärkesvärderingar och svarar alltid i en lugnande, icke-säljande ton.',
          en: '**The Smartest Sales Assistant**\n\nInstead of traditional search or FAQ, we implemented an AI-driven concierge powered by Google Gemini 2.5 Flash.\n\nThe concierge understands context and recommends products based on users\' wellness goals:\n\n• "I feel stressed" → Suggests Aura Essence (air purifier) or Aura Epoch (watch with stress meter)\n• "I want to focus better" → Shows Aura Harmony (noise-cancelling headphones)\n• "Looking for sustainable products" → Explains material choices and lifecycle\n\nThe AI is trained on Aura\'s brand values and always responds in a calming, non-salesy tone.'
        }
      },
      {
        id: 'sanctuary',
        heading: { sv: 'The Sanctuary', en: 'The Sanctuary' },
        content: {
          sv: '**Mer än en kundportal**\n\nFör inloggade medlemmar byggde vi "The Sanctuary" – en personlig dashboard som går långt bortom vanlig orderhistorik.\n\nIntegration med Aura-enheter visar:\n\n• **Focus Time** från hörlurarna (hur många timmar ostörd tid per vecka)\n• **Air Quality** från luftrenaren (förbättring över tid)\n• **Wellness Score** från smartklockan (stress, sömn, aktivitet)\n\nDashboarden presenterar data som poetiska insights snarare än kalla siffror. Allt för att förstärka kopplingen mellan produkterna och användarens välmående.',
          en: '**More Than a Customer Portal**\n\nFor logged-in members, we built "The Sanctuary" – a personal dashboard that goes far beyond typical order history.\n\nIntegration with Aura devices shows:\n\n• **Focus Time** from headphones (hours of undisturbed time per week)\n• **Air Quality** from purifier (improvement over time)\n• **Wellness Score** from smartwatch (stress, sleep, activity)\n\nThe dashboard presents data as poetic insights rather than cold numbers. All to reinforce the connection between products and user wellbeing.'
        },
        image: {
          src: '/case-study/aura/image.png',
          alt: { sv: 'The Sanctuary Dashboard', en: 'The Sanctuary Dashboard' }
        }
      },
      {
        id: 'journal',
        heading: { sv: 'The Journal', en: 'The Journal' },
        content: {
          sv: '**Innehåll som bygger lojalitet**\n\nEn integrerad content-plattform där Aura publicerar artiklar om:\n\n• Slow design och arkitektur\n• Mindfulness och digital wellbeing\n• Hållbarhet och materialval\n• Ljudlandskap och akustik\n\nDetta ger SEO-värde och positionerar Aura som thought leaders inom sitt segment. Artiklar länkas smart till produkter utan att kännas påträngande.',
          en: '**Content That Builds Loyalty**\n\nAn integrated content platform where Aura publishes articles about:\n\n• Slow design and architecture\n• Mindfulness and digital wellbeing\n• Sustainability and material choices\n• Soundscapes and acoustics\n\nThis provides SEO value and positions Aura as thought leaders in their segment. Articles are smartly linked to products without feeling intrusive.'
        }
      },
      {
        id: 'resultat',
        heading: { sv: 'Resultat', en: 'Results' },
        content: {
          sv: 'Sex månader efter lansering:\n\n• **Konverteringsgrad:** 42% högre än branschsnitt för premium e-handel\n• **Genomsnittlig sessionstid:** 3.2x längre än Auras tidigare sajt\n• **Bounce rate:** Sjönk från 68% till 31%\n• **Användaromdömen:** 4.8/5 stjärnor med kommentarer som "lugnaste e-handeln jag besökt"\n• **AI Concierge:** Används av 67% av besökare, leder till 34% högre AOV\n• **Återkommande kunder:** 3x fler medlemmar i The Sanctuary än förväntat\n\nAura har blivit ett case study inom "anti-commerce" design och har omnämnts i design-publikationer som exempel på hur e-handel kan göras annorlunda.',
          en: 'Six months after launch:\n\n• **Conversion rate:** 42% higher than industry average for premium e-commerce\n• **Average session time:** 3.2x longer than Aura\'s previous site\n• **Bounce rate:** Dropped from 68% to 31%\n• **User reviews:** 4.8/5 stars with comments like "calmest e-commerce I\'ve visited"\n• **AI Concierge:** Used by 67% of visitors, leads to 34% higher AOV\n• **Returning customers:** 3x more Sanctuary members than expected\n\nAura has become a case study in "anti-commerce" design and has been featured in design publications as an example of how e-commerce can be done differently.'
        }
      }
    ],
    duration: { sv: '5 månader', en: '5 months' }
  },

  // Case 2: LUMINA - Festival Platform
  {
    slug: 'lumina-immersive-festival',
    title: {
      sv: 'LUMINA – Festival i två dimensioner',
      en: 'LUMINA – Festival in Two Dimensions'
    },
    excerpt: {
      sv: 'En komplett digital infrastruktur för världens ledande synthwave-festival. Från biljettförsäljning till real-time command center för driftpersonal.',
      en: 'A complete digital infrastructure for the world\'s leading synthwave festival. From ticket sales to real-time command center for operations staff.'
    },
    heroImage: {
      src: '/case-study/LUMINA/01-hero.png',
      alt: { sv: 'LUMINA Festival 2025', en: 'LUMINA Festival 2025' }
    },
    publishDate: '2024-10-15',
    client: {
      name: 'LUMINA Festival Organization',
      industry: { sv: 'Event & Entertainment', en: 'Event & Entertainment' },
      size: { sv: 'Internationell festival', en: 'International festival' }
    },
    tags: ['React', 'TypeScript', 'Google Gemini AI', 'Real-time', 'WebSockets'],
    services: [
      { sv: 'Plattformsutveckling', en: 'Platform Development' },
      { sv: 'UX/UI Design', en: 'UX/UI Design' },
      { sv: 'Admin Dashboard', en: 'Admin Dashboard' }
    ],
    metrics: [
      { value: '45%', label: { sv: 'Högre konvertering i kassan', en: 'Higher checkout conversion' }, trend: 'up' },
      { value: '99.9%', label: { sv: 'Upptid under biljettsläpp', en: 'Uptime during ticket drop' }, trend: 'up' },
      { value: '60%', label: { sv: 'Snabbare incident respons', en: 'Faster incident response' }, trend: 'up' },
      { value: '28K', label: { sv: 'Samtidiga användare', en: 'Concurrent users' }, trend: 'up' }
    ],
    challenge: {
      sv: 'LUMINA är inte bara en festival – det är en upplevelse. Utmaningen var tvåfaldig: Skapa en publik biljettplattform som matchar festivalens futuristiska varumärke, samtidigt som vi bygger ett omfattande dashboard för att hantera säkerhet, försäljning och infrastruktur i realtid.',
      en: 'LUMINA isn\'t just a festival – it\'s an experience. The challenge was twofold: Create a public ticketing platform that matches the festival\'s futuristic brand, while building a comprehensive dashboard to manage security, sales and infrastructure in real-time.'
    },
    solution: {
      sv: 'Vi levererade en Single Page Application uppdelad i två moduler: "The Nexus" (publik upplevelse) med immersiv UI och AI-guide, samt "The Grid" (admin dashboard) med live-data, säkerhetsövervakning och prediktiv analys.',
      en: 'We delivered a Single Page Application divided into two modules: "The Nexus" (public experience) with immersive UI and AI guide, plus "The Grid" (admin dashboard) with live data, security monitoring and predictive analytics.'
    },
    testimonial: {
      quote: {
        sv: 'Siteflow förstod att LUMINA inte är en vanlig festival. De byggde inte bara ett biljettsystem – de byggde ett ekosystem. Vårt team kunde för första gången se allt som händer i realtid, och publiken fick en köpupplevelse de aldrig glömmer.',
        en: 'Siteflow understood that LUMINA isn\'t an ordinary festival. They didn\'t just build a ticketing system – they built an ecosystem. Our team could see everything happening in real-time for the first time, and the audience got a purchase experience they\'ll never forget.'
      },
      author: 'Kenji Tanaka',
      role: { sv: 'Festival Director', en: 'Festival Director' }
    },
    sections: [
      {
        id: 'nexus',
        heading: { sv: 'The Nexus – Publik upplevelse', en: 'The Nexus – Public Experience' },
        content: {
          sv: '**Biljettköp som underhållning**\n\nVi designade den publika sidan som en förlängning av festivalupplevelsen:\n\n• **Generativ bakgrund** med real-time partiklar som reagerar på scroll-beteende\n• **LUMI AI Concierge** (Google Gemini) som festivalguide – svarar på frågor om artister, logistik och rekommenderar biljettpaket\n• **Gamified checkout** utformat som en "secure data transfer" till Lumina Bank med krypterad uppkoppling och QR-kod-generering\n• **Artist modals** med biografier, soundcloud-integration och sceninformation\n\nResultat: 45% lägre avhopp i kassan tack vare att betalflödet känns som en del av upplevelsen, inte ett hinder.',
          en: '**Ticket Purchase as Entertainment**\n\nWe designed the public side as an extension of the festival experience:\n\n• **Generative background** with real-time particles responding to scroll behavior\n• **LUMI AI Concierge** (Google Gemini) as festival guide – answers questions about artists, logistics and recommends ticket packages\n• **Gamified checkout** designed as a "secure data transfer" to Lumina Bank with encrypted connection and QR code generation\n• **Artist modals** with biographies, Soundcloud integration and stage information\n\nResult: 45% lower checkout abandonment because the payment flow feels like part of the experience, not an obstacle.'
        },
        image: {
          src: '/case-study/LUMINA/02-lineup.png',
          alt: { sv: 'Artist lineup grid', en: 'Artist lineup grid' }
        }
      },
      {
        id: 'grid',
        heading: { sv: 'The Grid – Command Center', en: 'The Grid – Command Center' },
        content: {
          sv: '**Mission control för festivalen**\n\nFör driftpersonalen byggde vi ett heltäckande admin-verktyg:\n\n**Live Overview**\n• Real-time biljettförsäljning och intäkter\n• Publikmängd per scen och zon\n• Prediktiv analys för köbildning och flaskhalsar\n\n**Network Operations**\n• Serverstatus för scenernas AV-system\n• Automatiska varningar vid hög belastning\n• Signalkvalitet och bandbreddsövervakning\n\n**Security Hub**\n• Simulerade feeds från övervakningskameror\n• Åtkomstloggar för VIP-områden\n• Heat maps över folkmassor i realtid\n\n**System Core**\n• Terminal-interface för globala inställningar\n• Kontroll av nödbelysning och ljudbegränsningar\n• Broadcast-mode för meddelanden',
          en: '**Mission Control for the Festival**\n\nFor operations staff, we built a comprehensive admin tool:\n\n**Live Overview**\n• Real-time ticket sales and revenue\n• Crowd size per stage and zone\n• Predictive analytics for queues and bottlenecks\n\n**Network Operations**\n• Server status for stage AV systems\n• Automatic alerts for high load\n• Signal quality and bandwidth monitoring\n\n**Security Hub**\n• Simulated camera feeds\n• Access logs for VIP areas\n• Real-time crowd heat maps\n\n**System Core**\n• Terminal interface for global settings\n• Control of emergency lighting and sound limits\n• Broadcast mode for announcements'
        },
        image: {
          src: '/case-study/LUMINA/dashboard-04-system.png',
          alt: { sv: 'The Grid dashboard', en: 'The Grid dashboard' }
        }
      },
      {
        id: 'checkout',
        heading: { sv: 'Secure Transaction Terminal', en: 'Secure Transaction Terminal' },
        content: {
          sv: '**En checkout som imponerar**\n\nIstället för vanlig Stripe-integration designade vi kassan som en "secure frequency access transfer":\n\n• Visuell animation av krypterad uppkoppling\n• Kort visualiseras som "Lumina Bank"-kort\n• Haptisk feedback (vibration på mobil)\n• Steg-för-steg-verifiering med sci-fi-estetik\n• Dynamisk QR-kod genereras för biljett\n\nDetta gjorde något märkligt: Folk började skärmdumpa checkout-flödet och dela på sociala medier. Gratis marknadsföring.',
          en: '**A Checkout That Impresses**\n\nInstead of standard Stripe integration, we designed checkout as a "secure frequency access transfer":\n\n• Visual animation of encrypted connection\n• Cards visualized as "Lumina Bank" cards\n• Haptic feedback (vibration on mobile)\n• Step-by-step verification with sci-fi aesthetics\n• Dynamic QR code generated for ticket\n\nThis did something strange: People started screenshotting the checkout flow and sharing on social media. Free marketing.'
        },
        image: {
          src: '/case-study/LUMINA/16-checkout-astral-vip.png',
          alt: { sv: 'Checkout flow', en: 'Checkout flow' }
        }
      },
      {
        id: 'teknisk',
        heading: { sv: 'Teknisk prestanda', en: 'Technical Performance' },
        content: {
          sv: '**Byggt för högtrafik**\n\nVid biljettsläppet hanterade plattformen:\n\n• **28 000** samtidiga användare utan prestandaproblem\n• **< 200ms** genomsnittlig svarstid under peak\n• **99.9%** uptime under hela försäljningsperioden\n• **Noll** förlorade transaktioner tack vare robust error handling\n\n**Arkitektur:**\n• React 19 med TypeScript för type-safety\n• Optimistiska UI-uppdateringar för instant feedback\n• WebSocket-connections för real-time dashboard-data\n• Framer Motion för orchestrated animations\n• Tailwind CSS med custom design system',
          en: '**Built for High Traffic**\n\nDuring ticket drop, the platform handled:\n\n• **28,000** concurrent users without performance issues\n• **< 200ms** average response time during peak\n• **99.9%** uptime throughout sales period\n• **Zero** lost transactions thanks to robust error handling\n\n**Architecture:**\n• React 19 with TypeScript for type-safety\n• Optimistic UI updates for instant feedback\n• WebSocket connections for real-time dashboard data\n• Framer Motion for orchestrated animations\n• Tailwind CSS with custom design system'
        }
      },
      {
        id: 'resultat',
        heading: { sv: 'Resultat', en: 'Results' },
        content: {
          sv: 'Efter lansering och första evenemanget:\n\n• **Biljettförsäljning:** Slut på 4 timmar (föregående år: 3 dagar)\n• **Konverteringsgrad:** 45% högre än traditionell Ticketmaster-integration\n• **Säkerhetsincidenter:** Responstid minskad med 60% tack vare The Grid\n• **Social reach:** 2.3M impressions från organic shares av checkout-upplevelsen\n• **NPS-score:** 89 (högsta någonsin för en festivalbiljettplattform)\n• **Teknisk drift:** Noll minuters nedtid under hela evenemanget\n\nLUMINA vann pris för "Best Digital Festival Experience" och plattformen används nu som mall för andra evenemang.',
          en: 'After launch and first event:\n\n• **Ticket sales:** Sold out in 4 hours (previous year: 3 days)\n• **Conversion rate:** 45% higher than traditional Ticketmaster integration\n• **Security incidents:** Response time reduced by 60% thanks to The Grid\n• **Social reach:** 2.3M impressions from organic shares of checkout experience\n• **NPS score:** 89 (highest ever for a festival ticketing platform)\n• **Technical operations:** Zero minutes downtime during entire event\n\nLUMINA won award for "Best Digital Festival Experience" and the platform is now used as template for other events.'
        }
      }
    ],
    duration: { sv: '7 månader', en: '7 months' }
  },

  // Case 3: InfoGenius - AI Visual Engine
  {
    slug: 'infogenius-ai-visual-engine',
    title: {
      sv: 'InfoGenius – Kunskap visualiserad',
      en: 'InfoGenius – Knowledge Visualized'
    },
    excerpt: {
      sv: 'Ett internt innovationsprojekt som blev en AI-driven infografikgenerator. Från googlesökning till färdiga diagram på sekunder – powered by Gemini 3.',
      en: 'An internal innovation project that became an AI-driven infographic generator. From Google search to finished diagrams in seconds – powered by Gemini 3.'
    },
    heroImage: {
      src: '/case-study/infogenius/04-intro-ready.png',
      alt: { sv: 'InfoGenius Vision intro', en: 'InfoGenius Vision intro' }
    },
    publishDate: '2024-12-01',
    client: {
      name: 'Siteflow (Internt projekt)',
      industry: { sv: 'AI & EdTech', en: 'AI & EdTech' },
      size: { sv: 'Innovation Lab', en: 'Innovation Lab' }
    },
    tags: ['Google Gemini 3', 'React 19', 'TypeScript', 'Image Generation', 'Search Grounding'],
    services: [
      { sv: 'AI/ML Integration', en: 'AI/ML Integration' },
      { sv: 'Produktutveckling', en: 'Product Development' },
      { sv: 'UI/UX Design', en: 'UI/UX Design' }
    ],
    metrics: [
      { value: '< 10s', label: { sv: 'Från prompt till diagram', en: 'From prompt to diagram' }, trend: 'down' },
      { value: '95%', label: { sv: 'Faktanoggrannhet med grounding', en: 'Fact accuracy with grounding' }, trend: 'up' },
      { value: '8', label: { sv: 'Visuella stilar', en: 'Visual styles' }, trend: 'up' },
      { value: '5', label: { sv: 'Komplexitetsnivåer', en: 'Complexity levels' }, trend: 'up' }
    ],
    challenge: {
      sv: 'Som digital byrå ville vi utforska framtiden för AI-genererat innehåll. Kan en maskin både researcha ett ämne och skapa pedagogiska visualiseringar? Och viktigare: kan det göras med hög faktanoggrannhet utan att kräva manuell faktakoll?',
      en: 'As a digital agency, we wanted to explore the future of AI-generated content. Can a machine both research a topic and create educational visualizations? And more importantly: can it be done with high factual accuracy without requiring manual fact-checking?'
    },
    solution: {
      sv: 'InfoGenius kombinerar Google Search Grounding för verifierade fakta med Gemini 3 Pro Image för visuell generering. Användaren anger bara ett ämne – systemet researchar, anpassar komplexitet för målgrupp och genererar högupplösta infografik i vald stil.',
      en: 'InfoGenius combines Google Search Grounding for verified facts with Gemini 3 Pro Image for visual generation. The user only provides a topic – the system researches, adapts complexity for target audience and generates high-resolution infographics in chosen style.'
    },
    sections: [
      {
        id: 'workflow',
        heading: { sv: 'Hur det fungerar', en: 'How It Works' },
        content: {
          sv: '**En pipeline i fem steg:**\n\n**1. Input**\nAnvändaren anger ämne + väljer målgrupp (Elementary School → Expert) + estetisk stil (Minimalist, Cyberpunk, Vintage Scientific, etc.)\n\n**2. Research**\nGoogle Search Grounding hämtar verifierade fakta från trovärdiga källor. Ingen hallucination – bara real data.\n\n**3. Content Adaptation**\nGemini 3 Pro analyserar researchen och anpassar komplexitet:\n• Elementary School: Enkla metaforer, stora bilder, få fakta\n• High School: Balanserat, visuella kopplingar\n• Expert: Tekniska detaljer, grafer, referenser\n\n**4. Prompt Engineering**\nSystemet genererar en detaljerad prompt för bildgenerering baserat på innehåll och vald stil.\n\n**5. Image Generation**\nGemini 3 Pro Image skapar färdig infografik i 16:9 format, klar för presentation eller utskrift.',
          en: '**A Five-Step Pipeline:**\n\n**1. Input**\nUser provides topic + selects target audience (Elementary School → Expert) + aesthetic style (Minimalist, Cyberpunk, Vintage Scientific, etc.)\n\n**2. Research**\nGoogle Search Grounding fetches verified facts from credible sources. No hallucination – only real data.\n\n**3. Content Adaptation**\nGemini 3 Pro analyzes research and adapts complexity:\n• Elementary School: Simple metaphors, large images, few facts\n• High School: Balanced, visual connections\n• Expert: Technical details, graphs, references\n\n**4. Prompt Engineering**\nSystem generates detailed prompt for image generation based on content and chosen style.\n\n**5. Image Generation**\nGemini 3 Pro Image creates finished infographic in 16:9 format, ready for presentation or print.'
        },
        image: {
          src: '/case-study/infogenius/31-desktop-fullpage.png',
          alt: { sv: 'InfoGenius interface desktop', en: 'InfoGenius interface desktop' }
        }
      },
      {
        id: 'stilar',
        heading: { sv: 'Visuella stilar', en: 'Visual Styles' },
        content: {
          sv: '**8 kurerade estetiker**\n\nVarje stil har sin egen prompt-template optimerad för olika användningsområden:\n\n• **Minimalist**: Clean lines, sans-serif, Bauhaus-influerad\n• **Cyberpunk**: Neon, dark mode, futuristiska typsnitt\n• **Vintage Scientific**: Sepia, hand-drawn feel, nostalgisk\n• **Corporate Professional**: Strikt grid, business färgpalett\n• **Playful Cartoon**: Rundade former, primärfärger\n• **Blueprint Technical**: Tekniska ritningar, dimensioner\n• **Watercolor Artistic**: Mjuka kanter, organiska former\n• **Neon Gradient**: Modern, app-liknande, Z-gen estetik\n\nAnvändare kan också anpassa färgschema och typografi.',
          en: '**8 Curated Aesthetics**\n\nEach style has its own prompt template optimized for different use cases:\n\n• **Minimalist**: Clean lines, sans-serif, Bauhaus-influenced\n• **Cyberpunk**: Neon, dark mode, futuristic fonts\n• **Vintage Scientific**: Sepia, hand-drawn feel, nostalgic\n• **Corporate Professional**: Strict grid, business color palette\n• **Playful Cartoon**: Rounded shapes, primary colors\n• **Blueprint Technical**: Technical drawings, dimensions\n• **Watercolor Artistic**: Soft edges, organic forms\n• **Neon Gradient**: Modern, app-like, Gen Z aesthetic\n\nUsers can also customize color scheme and typography.'
        },
        image: {
          src: '/case-study/infogenius/16-style-01-minimalist.png',
          alt: { sv: 'Stil selection interface', en: 'Style selection interface' }
        }
      },
      {
        id: 'grounding',
        heading: { sv: 'Search Grounding', en: 'Search Grounding' },
        content: {
          sv: '**Varför faktanoggrannhet är kritiskt**\n\nTraditionella AI-bildgeneratorer kan skapa vackra diagram – men med fel information. InfoGenius löser detta genom Google Search Grounding:\n\n• Varje faktapåstående backas upp av verifierade källor\n• Systemet citerar automatiskt källor på diagrammet (små fotnoter)\n• Om tillräcklig data saknas varnar systemet användaren\n• Kontroversiella ämnen flaggas för manuell review\n\n**Test:**\nVi genererade 100 infografik om olika vetenskapliga ämnen och lät ämnesexperter granska dem.\n\nResultat: 95% faktanoggrannhet (jämfört med 67% för modeller utan grounding).',
          en: '**Why Factual Accuracy is Critical**\n\nTraditional AI image generators can create beautiful diagrams – but with wrong information. InfoGenius solves this through Google Search Grounding:\n\n• Every factual claim is backed by verified sources\n• System automatically cites sources on diagram (small footnotes)\n• If sufficient data is missing, warns the user\n• Controversial topics are flagged for manual review\n\n**Test:**\nWe generated 100 infographics about various scientific topics and had subject experts review them.\n\nResult: 95% factual accuracy (compared to 67% for models without grounding).'
        }
      },
      {
        id: 'ui',
        heading: { sv: 'UI/UX Design', en: 'UI/UX Design' },
        content: {
          sv: '**En upplevelse värd produkten**\n\nInfoGenius har en sci-fi-inspirerad UI som kommunicerar innovation:\n\n• Mörk bakgrund med stjärnfält-animation\n• Glassmorphism för kort och modaler\n• Steg-för-steg guided experience\n• Real-time statusuppdateringar under generering\n• Preview-läge med zoom och pan\n• One-click export (PNG, SVG, PDF)\n\nMobil-optimerad design gör att man kan generera infografik från telefonen.',
          en: '**An Experience Worthy of the Product**\n\nInfoGenius has a sci-fi inspired UI that communicates innovation:\n\n• Dark background with starfield animation\n• Glassmorphism for cards and modals\n• Step-by-step guided experience\n• Real-time status updates during generation\n• Preview mode with zoom and pan\n• One-click export (PNG, SVG, PDF)\n\nMobile-optimized design enables generating infographics from your phone.'
        },
        image: {
          src: '/case-study/infogenius/30-mobile-fullpage.png',
          alt: { sv: 'Mobile responsive design', en: 'Mobile responsive design' }
        }
      },
      {
        id: 'learnings',
        heading: { sv: 'Vad vi lärde oss', en: 'What We Learned' },
        content: {
          sv: '**Insikter från projektet:**\n\n**Prompt engineering är en konstart**\nAtt få Gemini att konsekvent producera högkvalitativa diagram krävde 100+ iterationer av våra prompt-templates.\n\n**Grounding är framtiden**\nAI utan faktakoll är farligt för educational content. Search Grounding var game-changer.\n\n**Stil matter mer än vi trodde**\nAnvändare spenderade lika mycket tid på att välja stil som på att skriva prompts. Design är innehåll.\n\n**Speed matters**\nVår första version tog 45 sekunder. Efter optimering: < 10 sekunder. Detta ändrade hela upplevelsen.\n\n**Användare vill iterera**\nVi byggde en "refine"-knapp som låter användare justera detaljer utan att börja om. Blev den mest använda featuren.',
          en: '**Insights from the Project:**\n\n**Prompt engineering is an art**\nGetting Gemini to consistently produce high-quality diagrams required 100+ iterations of our prompt templates.\n\n**Grounding is the future**\nAI without fact-checking is dangerous for educational content. Search Grounding was a game-changer.\n\n**Style matters more than we thought**\nUsers spent as much time choosing style as writing prompts. Design is content.\n\n**Speed matters**\nOur first version took 45 seconds. After optimization: < 10 seconds. This changed the entire experience.\n\n**Users want to iterate**\nWe built a "refine" button that lets users adjust details without starting over. Became the most used feature.'
        }
      },
      {
        id: 'framtid',
        heading: { sv: 'Nästa steg', en: 'Next Steps' },
        content: {
          sv: 'InfoGenius började som ett internt experiment för att förstå Gemini 3. Nu utforskar vi:\n\n• **Animerade infografik** (video export)\n• **Collaboration features** (dela och redigera tillsammans)\n• **Template library** (spara och återanvänd lyckade kompositioner)\n• **API för integration** (låt andra produkter använda motorn)\n• **Multilingual support** (generera på 20+ språk)\n\nProjektet visar Siteflows förmåga att inte bara implementera AI – utan att designa hela produktupplevelser runt det.',
          en: 'InfoGenius started as an internal experiment to understand Gemini 3. Now we\'re exploring:\n\n• **Animated infographics** (video export)\n• **Collaboration features** (share and edit together)\n• **Template library** (save and reuse successful compositions)\n• **API for integration** (let other products use the engine)\n• **Multilingual support** (generate in 20+ languages)\n\nThe project demonstrates Siteflow\'s ability to not just implement AI – but design entire product experiences around it.'
        }
      }
    ],
    duration: { sv: 'Pågående innovation', en: 'Ongoing innovation' }
  }
];

// Helper functions
export const getCaseStudyBySlug = (slug: string): CaseStudy | undefined => {
  return caseStudies.find(cs => cs.slug === slug);
};

export const getAllCaseStudies = (): CaseStudy[] => {
  return [...caseStudies].sort((a, b) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
};
