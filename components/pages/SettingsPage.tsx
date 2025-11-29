import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  Smartphone,
  Mail,
  Save,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Monitor,
  Moon,
  Sun,
  Languages,
  Clock,
  CreditCard,
  Building,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Textarea } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { Switch } from '../../src/components/ui/switch';
import { Avatar } from '../../src/components/ui/avatar';
import { Badge } from '../../src/components/ui/badge';
import { Alert } from '../../src/components/ui/alert';
import { Separator } from '../../src/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../src/components/ui/select';
import { toast } from '../../src/components/ui/toast';
import { Progress } from '../../src/components/ui/progress';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [ticketUpdates, setTicketUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Appearance state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('sv');
  const [timezone, setTimezone] = useState('Europe/Stockholm');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profil sparad', { description: 'Dina profilinställningar har uppdaterats.' });
    } catch {
      toast.error('Fel', { description: 'Kunde inte spara profilen.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Lösenorden matchar inte');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Lösenordet måste vara minst 8 tecken');
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Lösenord ändrat', { description: 'Ditt lösenord har uppdaterats.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Fel', { description: 'Kunde inte ändra lösenordet.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notifieringar sparade');
    } catch {
      toast.error('Fel vid sparning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
      toast.success('Utseende sparat');
    } catch {
      toast.error('Fel vid sparning');
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;

    if (score < 40) return { score, label: 'Svagt', color: 'bg-red-500' };
    if (score < 70) return { score, label: 'Medel', color: 'bg-yellow-500' };
    return { score, label: 'Starkt', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Inställningar
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Hantera ditt konto och dina preferenser
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Säkerhet
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifieringar
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Utseende
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profilbild</CardTitle>
                <CardDescription>
                  Din profilbild visas på ditt konto och i teamvyer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar
                    src={user?.avatar}
                    name={`${firstName} ${lastName}`}
                    size="xl"
                    className="w-24 h-24"
                  />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Byt bild
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Ta bort
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      JPG, PNG eller GIF. Max 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Personlig information</CardTitle>
                <CardDescription>
                  Uppdatera din personliga information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Förnamn</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ditt förnamn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Efternamn</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ditt efternamn"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-postadress</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+46 70 123 45 67"
                    leftIcon={<Smartphone className="w-4 h-4" />}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Berätta lite om dig själv..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <Button onClick={handleSaveProfile} loading={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Spara ändringar
                </Button>
              </CardFooter>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Företagsinformation</CardTitle>
                <CardDescription>
                  Information om ditt företag
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {user?.companyName || 'Inget företag kopplat'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Roll: {user?.role || 'Användare'}
                    </p>
                  </div>
                  <Badge className="ml-auto" variant="secondary">
                    {user?.role === 'admin' ? 'Admin' : user?.role === 'kam' ? 'KAM' : 'Användare'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Ändra lösenord</CardTitle>
                <CardDescription>
                  Uppdatera ditt lösenord regelbundet för ökad säkerhet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ange nuvarande lösenord"
                      leftIcon={<Key className="w-4 h-4" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nytt lösenord</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ange nytt lösenord"
                      leftIcon={<Key className="w-4 h-4" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Lösenordsstyrka</span>
                        <span className={`font-medium ${
                          passwordStrength.score < 40 ? 'text-red-500' :
                          passwordStrength.score < 70 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.score} className={passwordStrength.color} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Bekräfta nytt lösenord"
                    leftIcon={<Key className="w-4 h-4" />}
                    error={confirmPassword && newPassword !== confirmPassword ? 'Lösenorden matchar inte' : undefined}
                    success={confirmPassword && newPassword === confirmPassword ? 'Lösenorden matchar' : undefined}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <Button
                  onClick={handleChangePassword}
                  loading={isSaving}
                  disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Uppdatera lösenord
                </Button>
              </CardFooter>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>Tvåfaktorsautentisering (2FA)</CardTitle>
                <CardDescription>
                  Lägg till ett extra säkerhetslager på ditt konto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${twoFactorEnabled ? 'bg-green-100 dark:bg-green-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <Shield className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {twoFactorEnabled ? '2FA aktiverad' : '2FA inaktiverad'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {twoFactorEnabled
                          ? 'Ditt konto är skyddat med tvåfaktorsautentisering'
                          : 'Aktivera för ökad säkerhet'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                {!twoFactorEnabled && (
                  <Alert variant="warning" className="mt-4">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Vi rekommenderar starkt att aktivera 2FA för att skydda ditt konto.</span>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Aktiva sessioner</CardTitle>
                <CardDescription>
                  Hantera enheter där du är inloggad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Windows - Chrome</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Stockholm, Sverige • Aktiv nu</p>
                      </div>
                    </div>
                    <Badge variant="success">Denna enhet</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">iPhone - Safari</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Stockholm, Sverige • 2 timmar sedan</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400">
                      Logga ut
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <Button variant="outline" className="text-red-600 hover:text-red-700 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logga ut från alla enheter
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>E-postnotifieringar</CardTitle>
                <CardDescription>
                  Välj vilka e-postmeddelanden du vill ta emot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Projektuppdateringar</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Få notifieringar om projektändringar och milstolpar
                    </p>
                  </div>
                  <Switch checked={projectUpdates} onCheckedChange={setProjectUpdates} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Ärendeuppdateringar</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Få notifieringar om nya svar och statusändringar
                    </p>
                  </div>
                  <Switch checked={ticketUpdates} onCheckedChange={setTicketUpdates} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Veckosammanfattning</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Få en veckovis sammanfattning av aktivitet
                    </p>
                  </div>
                  <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Marknadsföring</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Ta emot nyheter och erbjudanden
                    </p>
                  </div>
                  <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push-notifieringar</CardTitle>
                <CardDescription>
                  Hantera notifieringar i webbläsaren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Aktivera push-notifieringar</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Få direkta notifieringar i webbläsaren
                    </p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <Button onClick={handleSaveNotifications} loading={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Spara inställningar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tema</CardTitle>
                <CardDescription>
                  Anpassa utseendet på din dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Sun className={`w-8 h-8 mx-auto mb-2 ${theme === 'light' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      Ljust
                    </p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Moon className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      Mörkt
                    </p>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Monitor className={`w-8 h-8 mx-auto mb-2 ${theme === 'system' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      System
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Språk och region</CardTitle>
                <CardDescription>
                  Anpassa språk, tidszon och datumformat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Språk</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <Languages className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sv">Svenska</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="no">Norsk</SelectItem>
                        <SelectItem value="da">Dansk</SelectItem>
                        <SelectItem value="fi">Suomi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tidszon</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <Clock className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Stockholm">Europa/Stockholm (CET)</SelectItem>
                        <SelectItem value="Europe/London">Europa/London (GMT)</SelectItem>
                        <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Datumformat</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger className="w-full md:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">2024-01-15 (ISO)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">15/01/2024 (EU)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">01/15/2024 (US)</SelectItem>
                      <SelectItem value="DD.MM.YYYY">15.01.2024 (DE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <Button onClick={handleSaveAppearance} loading={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Spara inställningar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
