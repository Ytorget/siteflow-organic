import React, { useState } from 'react';
import { Mail, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Page } from '../types';
import { useAuth } from '../src/context/AuthContext';

// New UI Components
import { Input } from '../src/components/ui/input';
import { Button } from '../src/components/ui/button';
import { Label } from '../src/components/ui/label';
import { Alert } from '../src/components/ui/alert';
import { Checkbox } from '../src/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../src/components/ui/card';
import { Separator, SeparatorWithText } from '../src/components/ui/separator';
import { toast } from '../src/components/ui/toast';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      toast.success('Inloggning lyckades', {
        description: 'Du omdirigeras till din dashboard...'
      });
      // Redirect to dashboard on success
      onNavigate('dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ett fel uppstod';
      setError(errorMessage);
      toast.error('Inloggning misslyckades', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('images/abstract-flow.jpg')] bg-cover bg-center opacity-20 mix-blend-screen"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Login Form Section */}
      <section className="min-h-screen flex items-center justify-center py-12 px-6 relative z-10">
        <div className="w-full max-w-md">

            {/* Login Card - Force light mode to prevent theme affecting login form */}
            <div className="light bg-white border border-slate-200 rounded-2xl shadow-lg p-8 animate-scale-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4 animate-fade-in border-2 border-cyan-400">
                  <img src="/logos/siteflow-logo/favicon.svg" alt="Siteflow" width="40" height="40" className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-serif text-slate-900 mb-2 animate-on-scroll">{t('loginPage.title')}</h1>
                <p className="text-slate-600 text-sm animate-on-scroll stagger-1">{t('loginPage.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" required>
                    {t('loginPage.emailLabel')}
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('loginPage.emailPlaceholder')}
                    leftIcon={<Mail className="w-5 h-5" />}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    {t('loginPage.passwordLabel')}
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('loginPage.passwordPlaceholder')}
                    leftIcon={<Lock className="w-5 h-5" />}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <Checkbox
                    id="remember"
                    label={t('loginPage.rememberMe')}
                  />
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    {t('loginPage.forgotPassword')}
                  </a>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 hover:shadow-lg hover:shadow-cyan-300/50"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span>Loggar in...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('loginPage.loginButton')}</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <SeparatorWithText className="my-8">
                {t('loginPage.or')}
              </SeparatorWithText>

              {/* Social Login Options */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full" size="lg">
                  <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" className="w-5 h-5 mr-2" />
                  <span>{t('loginPage.continueWithGoogle')}</span>
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <img src="https://github.com/favicon.ico" alt="GitHub" width="20" height="20" className="w-5 h-5 mr-2" />
                  <span>{t('loginPage.continueWithGithub')}</span>
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-8 text-center text-sm text-slate-600">
                {t('loginPage.noAccount')}{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('loginPage.createAccount')}
                </a>
              </div>
            </div>

          {/* Demo Credentials */}
          <div className="mt-6 bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <p className="text-sm font-medium text-slate-300 mb-3">Demo-konton:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setEmail('admin@siteflow.se'); setPassword('AdminPassword123!'); }}
                className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-xs text-cyan-400 font-medium">Admin</span>
                <p className="text-sm text-slate-300">admin@siteflow.se</p>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('demo@siteflow.se'); setPassword('Password123'); }}
                className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-xs text-blue-400 font-medium">Customer</span>
                <p className="text-sm text-slate-300">demo@siteflow.se</p>
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {t('loginPage.securityNote')}
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default LoginPage;
