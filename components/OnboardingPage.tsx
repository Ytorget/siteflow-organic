import React, { useState, useEffect } from 'react';
import { Building2, User, Mail, Phone, Lock, Loader2, CheckCircle, AlertCircle, ArrowRight, Globe } from 'lucide-react';
import { Page } from '../types';

interface OnboardingPageProps {
  onNavigate: (page: Page) => void;
  token?: string;
}

interface InvitationDetails {
  invitation: {
    id: string;
    email: string;
    role: string;
    companyId: string;
    expiresAt: string;
  };
  company: {
    id: string;
    name: string;
  } | null;
}

type Step = 'validating' | 'company' | 'user' | 'confirming' | 'success' | 'error';

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate, token }) => {
  const [step, setStep] = useState<Step>('validating');
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Company form data
  const [companyName, setCompanyName] = useState('');
  const [orgNumber, setOrgNumber] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Sverige');

  // User form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Ingen inbjudningslänk hittades');
      setStep('error');
      return;
    }

    validateToken(token);
  }, [token]);

  const validateToken = async (invitationToken: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/onboarding/validate/${invitationToken}`);

      if (!response.ok) {
        throw new Error('Invalid or expired invitation token');
      }

      const data = await response.json();
      setInvitation(data);
      setEmail(data.invitation.email);

      if (data.company) {
        setCompanyName(data.company.name || '');
      }

      setStep('company');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ogiltig eller utgången inbjudan');
      setStep('error');
    }
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('user');
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte');
      return;
    }

    setStep('confirming');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/onboarding/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          user: {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            password,
          },
          company: {
            name: companyName,
            org_number: orgNumber || null,
            employee_count: employeeCount,
            industry,
            website: website || null,
            address: address || null,
            city: city || null,
            postal_code: postalCode || null,
            country,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registreringen misslyckades');
      }

      const data = await response.json();

      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid registrering');
      setStep('user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderValidating = () => (
    <div className="text-center py-12">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
      <p className="text-slate-600">Validerar inbjudan...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-serif text-slate-900 mb-2">Ogiltig inbjudan</h2>
      <p className="text-slate-600 mb-6">{error}</p>
      <button
        onClick={() => onNavigate('home')}
        className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        Tillbaka till startsidan
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-serif text-slate-900 mb-2">Välkommen till Siteflow!</h2>
      <p className="text-slate-600 mb-6">Ditt konto har skapats. Du kan nu logga in och börja använda portalen.</p>
      <button
        onClick={() => onNavigate('dashboard')}
        className="px-6 py-3 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-300/50 transition-all duration-300 inline-flex items-center gap-2"
      >
        <span>Gå till dashboard</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderCompanyForm = () => (
    <form onSubmit={handleCompanySubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-slate-900 mb-2">Företagsinformation</h2>
        <p className="text-slate-600">Berätta lite om ert företag</p>
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
          Företagsnamn <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Acme AB"
            required
          />
        </div>
      </div>

      {/* Org Number */}
      <div>
        <label htmlFor="orgNumber" className="block text-sm font-medium text-slate-700 mb-2">
          Organisationsnummer <span className="text-slate-400">(valfritt)</span>
        </label>
        <input
          type="text"
          id="orgNumber"
          value={orgNumber}
          onChange={(e) => setOrgNumber(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          placeholder="556123-4567"
        />
        <p className="mt-1 text-xs text-slate-500">För svenska företag, lämna tomt för utländska</p>
      </div>

      {/* Employee Count */}
      <div>
        <label htmlFor="employeeCount" className="block text-sm font-medium text-slate-700 mb-2">
          Antal anställda <span className="text-red-500">*</span>
        </label>
        <select
          id="employeeCount"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          required
        >
          <option value="">Välj antal</option>
          <option value="1-10">1-10</option>
          <option value="11-50">11-50</option>
          <option value="51-200">51-200</option>
          <option value="201+">201+</option>
        </select>
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
          Bransch <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          placeholder="t.ex. E-handel, Teknologi, Konsulting"
          required
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-2">
          Webbplats <span className="text-slate-400">(valfritt)</span>
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="url"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="https://www.example.com"
          />
        </div>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
            Stad
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Stockholm"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-2">
            Postnummer
          </label>
          <input
            type="text"
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="123 45"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
          Adress
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          placeholder="Storgatan 1"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-300/50 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Nästa</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );

  const renderUserForm = () => (
    <form onSubmit={handleUserSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-slate-900 mb-2">Dina uppgifter</h2>
        <p className="text-slate-600">Skapa ditt användarkonto</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
            Förnamn <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Anna"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
            Efternamn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Andersson"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          E-post <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-slate-50"
            placeholder="anna@example.com"
            readOnly
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">Email från inbjudan</p>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
          Telefon <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="070-123 45 67"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Lösenord <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Minst 8 tecken"
            minLength={8}
            required
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Bekräfta lösenord <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Samma som ovan"
            minLength={8}
            required
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => setStep('company')}
          className="px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Tillbaka
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-300/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Skapar konto...</span>
            </>
          ) : (
            <>
              <span>Skapa konto</span>
              <CheckCircle className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderConfirming = () => (
    <div className="text-center py-12">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
      <p className="text-slate-600">Skapar ditt konto...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('images/abstract-flow.jpg')] bg-cover bg-center opacity-20 mix-blend-screen"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Onboarding Form Section */}
      <section className="min-h-screen flex items-center justify-center py-12 px-6 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4 border-2 border-cyan-400">
              <img src="/logos/siteflow-logo/favicon.svg" alt="Siteflow" width="40" height="40" className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-serif text-white mb-2">Välkommen till Siteflow</h1>
            {invitation && (
              <p className="text-slate-400">
                Inbjuden som <span className="text-cyan-400 font-medium">{invitation.invitation.role}</span>
              </p>
            )}
          </div>

          {/* Progress Indicator */}
          {step !== 'validating' && step !== 'error' && step !== 'success' && step !== 'confirming' && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${step === 'company' ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
                <div className="w-12 h-1 bg-slate-600"></div>
                <div className={`w-3 h-3 rounded-full ${step === 'user' ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <span>Företag</span>
                <span>Användare</span>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
            {step === 'validating' && renderValidating()}
            {step === 'error' && renderError()}
            {step === 'company' && renderCompanyForm()}
            {step === 'user' && renderUserForm()}
            {step === 'confirming' && renderConfirming()}
            {step === 'success' && renderSuccess()}
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Dina uppgifter skyddas med branschledande säkerhet
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardingPage;
