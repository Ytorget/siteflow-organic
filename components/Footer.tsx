import React from 'react';
import { Droplets, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/logos/siteflow-logo/site flow.svg" alt="Siteflow" className="h-8 w-auto" />
            <span className="text-xl font-serif text-white">Siteflow</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="mailto:hello@siteflow.se" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-sm border-t border-slate-900 pt-8">
          <p>&copy; {new Date().getFullYear()} Siteflow AB. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Integritetspolicy</a>
            <a href="#" className="hover:text-white">Villkor</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
