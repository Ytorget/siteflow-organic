import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Puzzle,
  Search,
  Plus,
  Check,
  X,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  Zap,
  Calendar,
  MessageSquare,
  FileText,
  GitBranch,
  Cloud,
  Database,
  Mail,
  CreditCard,
  BarChart3,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Slack,
  Github,
  Trello
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { isAdmin, isKAM } from '../../utils/roleHelpers';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Badge, StatusBadge } from '../../src/components/ui/badge';
import { Alert } from '../../src/components/ui/alert';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../../src/components/ui/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';
import { toast } from '../../src/components/ui/toast';
import { Switch } from '../../src/components/ui/switch';
import { Separator } from '../../src/components/ui/separator';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'communication' | 'project' | 'storage' | 'analytics' | 'payment' | 'crm' | 'security';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  features: string[];
  popular?: boolean;
  comingSoon?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Få notifieringar och uppdateringar direkt i Slack',
    icon: <div className="w-8 h-8 bg-[#4A154B] rounded-lg flex items-center justify-center text-white font-bold text-sm">#</div>,
    category: 'communication',
    status: 'connected',
    lastSync: '2024-01-15T10:30:00',
    features: ['Realtidsnotifieringar', 'Projektuppdateringar', 'Ärendehantering', 'Slash-kommandon'],
    popular: true
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Synkronisera repositories och pull requests',
    icon: <div className="w-8 h-8 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center"><GitBranch className="w-5 h-5 text-white dark:text-slate-900" /></div>,
    category: 'project',
    status: 'connected',
    lastSync: '2024-01-15T09:15:00',
    features: ['Automatisk länkning', 'PR-notifieringar', 'Issue-synkronisering', 'Commit-tracking'],
    popular: true
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Synkronisera möten och deadlines',
    icon: <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>,
    category: 'project',
    status: 'disconnected',
    features: ['Mötessynkronisering', 'Deadline-påminnelser', 'Teamkalendrar', 'Automatisk schemaläggning'],
    popular: true
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Anslut och dela filer från Google Drive',
    icon: <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-green-400 to-yellow-400 rounded-lg flex items-center justify-center"><Cloud className="w-5 h-5 text-white" /></div>,
    category: 'storage',
    status: 'disconnected',
    features: ['Fildelning', 'Automatisk backup', 'Dokumentåtkomst', 'Mappsynkronisering']
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Integrera med Atlassian Jira för ärendehantering',
    icon: <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">JIRA</div>,
    category: 'project',
    status: 'disconnected',
    features: ['Issue-synkronisering', 'Sprint-tracking', 'Workflow-automation', 'Rapport-export'],
    popular: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Hantera betalningar och fakturor',
    icon: <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center"><CreditCard className="w-5 h-5 text-white" /></div>,
    category: 'payment',
    status: 'error',
    lastSync: '2024-01-14T18:00:00',
    features: ['Automatisk fakturering', 'Betalningspåminnelser', 'Prenumerationshantering', 'Rapporter']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM-integration för kundhantering',
    icon: <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>,
    category: 'crm',
    status: 'disconnected',
    features: ['Kontaktsynkronisering', 'Deal-tracking', 'E-postautomation', 'Rapporter']
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Produktanalys och användarinsikter',
    icon: <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>,
    category: 'analytics',
    status: 'disconnected',
    features: ['Händelsespårning', 'Funnelanalys', 'Kohortrapporter', 'A/B-testning']
  },
  {
    id: 'okta',
    name: 'Okta SSO',
    description: 'Single Sign-On för enterprise-säkerhet',
    icon: <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>,
    category: 'security',
    status: 'disconnected',
    features: ['SSO', 'MFA', 'Användarprovisioning', 'Audit-loggar'],
    comingSoon: true
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Kommunikation och samarbete via Teams',
    icon: <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5 text-white" /></div>,
    category: 'communication',
    status: 'disconnected',
    features: ['Chattnotifieringar', 'Mötesintegration', 'Fildelning', 'Kanalmeddelanden'],
    comingSoon: true
  }
];

const categories = [
  { id: 'all', label: 'Alla', icon: <Puzzle className="w-4 h-4" /> },
  { id: 'communication', label: 'Kommunikation', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'project', label: 'Projekthantering', icon: <FileText className="w-4 h-4" /> },
  { id: 'storage', label: 'Lagring', icon: <Cloud className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analys', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'payment', label: 'Betalning', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'crm', label: 'CRM', icon: <Users className="w-4 h-4" /> },
  { id: 'security', label: 'Säkerhet', icon: <Shield className="w-4 h-4" /> }
];

const IntegrationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const canManageIntegrations = user && (isAdmin(user.role) || isKAM(user.role));

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const availableCount = integrations.filter(i => i.status === 'disconnected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  const handleConnect = async (integration: Integration) => {
    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${integration.name} ansluten`, {
        description: 'Integrationen är nu aktiv och redo att användas.'
      });
      setIsConfigModalOpen(false);
    } catch {
      toast.error('Anslutning misslyckades', {
        description: 'Kunde inte ansluta till integrationen. Försök igen.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${integration.name} frånkopplad`);
    } catch {
      toast.error('Kunde inte koppla från');
    }
  };

  const handleSync = async (integration: Integration) => {
    toast.info(`Synkroniserar ${integration.name}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Synkronisering klar');
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Ansluten</Badge>;
      case 'error':
        return <Badge variant="error">Fel</Badge>;
      default:
        return <Badge variant="secondary">Ej ansluten</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Integrationer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Anslut Siteflow till dina favoritverktyg
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{connectedCount}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Anslutna</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Puzzle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{availableCount}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tillgängliga</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{errorCount}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Kräver åtgärd</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {errorCount > 0 && (
        <Alert variant="error" title="Integrationsproblem upptäckta">
          {errorCount} integration{errorCount > 1 ? 'er' : ''} har problem som kräver åtgärd.
          Kontrollera anslutningarna nedan.
        </Alert>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Sök integrationer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.icon}
                  <span className="ml-2">{category.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      {filteredIntegrations.filter(i => i.status === 'connected' || i.status === 'error').length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Anslutna integrationer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations
              .filter(i => i.status === 'connected' || i.status === 'error')
              .map((integration) => (
                <Card key={integration.id} className={integration.status === 'error' ? 'border-red-300 dark:border-red-800' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {integration.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {integration.name}
                            </h3>
                            {getStatusIcon(integration.status)}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    {integration.lastSync && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          Senast synkad: {new Date(integration.lastSync).toLocaleString('sv-SE')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Synka
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setIsConfigModalOpen(true);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Konfigurera
                      </Button>
                      {canManageIntegrations && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => handleDisconnect(integration)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Tillgängliga integrationer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations
            .filter(i => i.status === 'disconnected')
            .map((integration) => (
              <Card
                key={integration.id}
                className={`transition-all hover:shadow-md ${integration.comingSoon ? 'opacity-75' : 'cursor-pointer'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {integration.icon}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {integration.name}
                          </h3>
                          {integration.popular && (
                            <Badge variant="warning" className="text-xs">Populär</Badge>
                          )}
                          {integration.comingSoon && (
                            <Badge variant="secondary" className="text-xs">Kommer snart</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 2 && (
                        <span className="text-xs px-2 py-0.5 text-slate-500 dark:text-slate-400">
                          +{integration.features.length - 2} mer
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant={integration.comingSoon ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full"
                      disabled={integration.comingSoon || !canManageIntegrations}
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setIsConfigModalOpen(true);
                      }}
                    >
                      {integration.comingSoon ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Kommer snart
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Anslut
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Puzzle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Inga integrationer hittades
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Prova att ändra din sökning eller kategorifilter
            </p>
          </CardContent>
        </Card>
      )}

      {/* Configuration Modal */}
      <Modal open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <div className="flex items-center gap-3">
              {selectedIntegration?.icon}
              <div>
                <ModalTitle>{selectedIntegration?.name}</ModalTitle>
                <ModalDescription>{selectedIntegration?.description}</ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <div className="p-6 space-y-6">
            {/* Features */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                Funktioner som ingår
              </h4>
              <div className="space-y-2">
                {selectedIntegration?.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Connection Settings */}
            {selectedIntegration?.status === 'connected' ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Inställningar
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Automatisk synkronisering</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Synka data var 15:e minut
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Notifieringar</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Få notifieringar om synkroniseringsfel
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="info">
                  Du kommer att omdirigeras till {selectedIntegration?.name} för att auktorisera anslutningen.
                </Alert>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              Avbryt
            </Button>
            {selectedIntegration?.status === 'connected' ? (
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    if (selectedIntegration) {
                      handleDisconnect(selectedIntegration);
                      setIsConfigModalOpen(false);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Koppla från
                </Button>
                <Button onClick={() => setIsConfigModalOpen(false)}>
                  Spara
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => selectedIntegration && handleConnect(selectedIntegration)}
                loading={isConnecting}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Anslut till {selectedIntegration?.name}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default IntegrationsPage;
