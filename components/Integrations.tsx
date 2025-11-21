import React from 'react';
import { Zap } from 'lucide-react';

const Integrations: React.FC = () => {
  const row1 = [
     { name: 'Slack', logo: '/logos/integrations/Slack_Technologies_Logo.svg' },
    { name: 'Stripe', logo: '/logos/integrations/Stripe_Logo,_revised_2016.svg' },
    { name: 'Klarna', logo: '/logos/integrations/Klarna_Payment_Badge.svg' },
    { name: 'Notion', logo: '/logos/integrations/Notion-logo.svg' },
    { name: 'Google Sheets', logo: '/logos/integrations/Google_Sheets_logo_(2014-2020).svg' },
    { name: 'Gmail', logo: '/logos/integrations/Gmail_icon_(2020).svg' },
    { name: 'BankID', logo: '/logos/integrations/BankID_logo.svg' },
  ];

  const row2 = [
    { name: 'Google Calendar', logo: '/logos/integrations/Google_Calendar_icon_(2020).svg' },
    { name: 'Google Drive', logo: '/logos/integrations/Google_Drive_icon_(2020).svg' },
    { name: 'HubSpot', logo: '/logos/integrations/HubSpot_Logo.svg' },
    { name: 'Google Forms', logo: '/logos/integrations/Google_Forms_logo_(2014-2020).svg' },
    { name: 'Outlook', logo: '/logos/integrations/Microsoft_Office_Outlook_(2018–2024).svg' },
    { name: 'ChatGPT', logo: '/logos/integrations/ChatGPT-Logo.svg' },
    { name: 'Airtable', logo: '/logos/integrations/Airtable_Logo.svg' }
  ];

  return (
    <section className="py-24 bg-white border-t border-slate-100 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">Integrationer</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
            Integrera med era nuvarande lösningar
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Vi bygger broar, inte silos. Anslut sömlöst till de verktyg du redan använder.
          </p>
        </div>

        {/* Logos - Two Rows */}
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Row 1 */}
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-12 py-4">
              {row1.map((integration, index) => (
                <div key={index} className="flex items-center justify-center flex-shrink-0">
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
                    title={integration.name}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-12 py-4">
              {row2.map((integration, index) => (
                <div key={index} className="flex items-center justify-center flex-shrink-0">
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
                    title={integration.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-16">
          <p className="text-slate-500 text-sm">
            + Hundratals fler integrationer via API
          </p>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
