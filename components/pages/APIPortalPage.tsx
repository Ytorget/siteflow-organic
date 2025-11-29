import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  Code,
  Book,
  Terminal,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Globe,
  Lock,
  Unlock,
  ChevronRight,
  Download,
  Play,
  Settings,
  FileJson,
  Zap
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { isAdmin, isKAM } from '../../utils/roleHelpers';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { Badge } from '../../src/components/ui/badge';
import { Alert } from '../../src/components/ui/alert';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../../src/components/ui/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';
import { toast } from '../../src/components/ui/toast';
import { Switch } from '../../src/components/ui/switch';
import { Separator } from '../../src/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../src/components/ui/select';
import { Checkbox } from '../../src/components/ui/checkbox';
import { Progress } from '../../src/components/ui/progress';

interface APIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked';
  requestCount: number;
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'sf_live',
    createdAt: '2024-01-01T00:00:00',
    lastUsed: '2024-01-15T14:30:00',
    expiresAt: null,
    scopes: ['projects:read', 'projects:write', 'tickets:read', 'tickets:write'],
    status: 'active',
    requestCount: 15420
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'sf_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'sf_test',
    createdAt: '2024-01-10T00:00:00',
    lastUsed: '2024-01-15T10:00:00',
    expiresAt: '2024-06-01T00:00:00',
    scopes: ['projects:read', 'tickets:read'],
    status: 'active',
    requestCount: 2340
  },
  {
    id: '3',
    name: 'Legacy Integration Key',
    key: 'sf_live_oldkeyxxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'sf_live',
    createdAt: '2023-06-15T00:00:00',
    lastUsed: '2023-12-01T00:00:00',
    expiresAt: '2024-01-01T00:00:00',
    scopes: ['projects:read'],
    status: 'expired',
    requestCount: 8920
  }
];

const availableScopes = [
  { id: 'projects:read', name: 'Läs projekt', description: 'Visa projekt och projektdetaljer' },
  { id: 'projects:write', name: 'Skriv projekt', description: 'Skapa och uppdatera projekt' },
  { id: 'tickets:read', name: 'Läs ärenden', description: 'Visa ärenden och ärendedetaljer' },
  { id: 'tickets:write', name: 'Skriv ärenden', description: 'Skapa och uppdatera ärenden' },
  { id: 'documents:read', name: 'Läs dokument', description: 'Visa och ladda ner dokument' },
  { id: 'documents:write', name: 'Skriv dokument', description: 'Ladda upp och hantera dokument' },
  { id: 'users:read', name: 'Läs användare', description: 'Visa användarinformation' },
  { id: 'webhooks:manage', name: 'Hantera webhooks', description: 'Skapa och hantera webhooks' },
  { id: 'admin', name: 'Administratör', description: 'Full administrativ åtkomst' }
];

const codeExamples = {
  curl: `curl -X GET "https://api.siteflow.se/v1/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  javascript: `const response = await fetch('https://api.siteflow.se/v1/projects', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const projects = await response.json();
console.log(projects);`,
  python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.siteflow.se/v1/projects', headers=headers)
projects = response.json()
print(projects)`
};

const APIPortalPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('keys');
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyVisible, setNewKeyVisible] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Create key form state
  const [keyName, setKeyName] = useState('');
  const [keyType, setKeyType] = useState<'live' | 'test'>('test');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [keyExpiration, setKeyExpiration] = useState<'never' | '30' | '90' | '365'>('never');
  const [isCreating, setIsCreating] = useState(false);

  // Code example state
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python'>('curl');

  const canManageKeys = user && (isAdmin(user.role) || isKAM(user.role));

  const activeKeys = apiKeys.filter(k => k.status === 'active').length;
  const totalRequests = apiKeys.reduce((sum, k) => sum + k.requestCount, 0);

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error('Namn krävs', { description: 'Ange ett namn för API-nyckeln' });
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error('Behörigheter krävs', { description: 'Välj minst en behörighet' });
      return;
    }

    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newKey = `sk_${keyType}_${generateRandomString(32)}`;
      const newAPIKey: APIKey = {
        id: String(Date.now()),
        name: keyName,
        key: newKey,
        prefix: `sk_${keyType}`,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        expiresAt: keyExpiration === 'never' ? null : getExpirationDate(keyExpiration),
        scopes: selectedScopes,
        status: 'active',
        requestCount: 0
      };

      setApiKeys([newAPIKey, ...apiKeys]);
      setCreatedKey(newKey);
      setNewKeyVisible(true);

      toast.success('API-nyckel skapad', {
        description: 'Kopiera nyckeln nu - den visas bara en gång!'
      });
    } catch {
      toast.error('Kunde inte skapa nyckel');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!selectedKey) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApiKeys(apiKeys.map(k =>
        k.id === selectedKey.id ? { ...k, status: 'revoked' as const } : k
      ));
      toast.success('API-nyckel återkallad');
      setIsRevokeModalOpen(false);
      setSelectedKey(null);
    } catch {
      toast.error('Kunde inte återkalla nyckeln');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Kopierat till urklipp');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[codeLanguage]);
    toast.success('Kod kopierad');
  };

  const generateRandomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const getExpirationDate = (days: string) => {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return date.toISOString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Aldrig';
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: APIKey['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Aktiv</Badge>;
      case 'expired':
        return <Badge variant="warning">Utgången</Badge>;
      case 'revoked':
        return <Badge variant="error">Återkallad</Badge>;
    }
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes(prev =>
      prev.includes(scopeId)
        ? prev.filter(s => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  const resetCreateForm = () => {
    setKeyName('');
    setKeyType('test');
    setSelectedScopes([]);
    setKeyExpiration('never');
    setCreatedKey(null);
    setNewKeyVisible(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            API & Utvecklare
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Hantera API-nycklar och integrera med Siteflow
          </p>
        </div>
        {canManageKeys && (
          <Button onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Ny API-nyckel
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeKeys}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Aktiva nycklar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {totalRequests.toLocaleString('sv-SE')}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Totala anrop</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">99.9%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tillgänglighet</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">45ms</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Genomsn. svarstid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="keys">
            <Key className="w-4 h-4 mr-2" />
            API-nycklar
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Book className="w-4 h-4 mr-2" />
            Dokumentation
          </TabsTrigger>
          <TabsTrigger value="usage">
            <BarChart3 className="w-4 h-4 mr-2" />
            Användning
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <CardTitle>Dina API-nycklar</CardTitle>
              <CardDescription>
                Hantera API-nycklar för att integrera med Siteflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className={`p-4 border rounded-lg ${
                      apiKey.status === 'active'
                        ? 'border-slate-200 dark:border-slate-700'
                        : 'border-slate-200 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          apiKey.prefix === 'sf_live'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                          <Key className={`w-5 h-5 ${
                            apiKey.prefix === 'sf_live'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-orange-600 dark:text-orange-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {apiKey.name}
                            </h4>
                            {getStatusBadge(apiKey.status)}
                            {apiKey.prefix === 'sf_live' ? (
                              <Badge variant="success" className="text-xs">Live</Badge>
                            ) : (
                              <Badge variant="warning" className="text-xs">Test</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm font-mono text-slate-500 dark:text-slate-400">
                              {showKey === apiKey.id ? apiKey.key : `${apiKey.prefix}_${'•'.repeat(32)}`}
                            </code>
                            <button
                              onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              {showKey === apiKey.id ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopyKey(apiKey.key)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {apiKey.status === 'active' && canManageKeys && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => {
                            setSelectedKey(apiKey);
                            setIsRevokeModalOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Skapad</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {formatDate(apiKey.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Senast använd</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {formatDate(apiKey.lastUsed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Utgår</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Aldrig'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Anrop</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {apiKey.requestCount.toLocaleString('sv-SE')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Behörigheter</p>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="text-center py-12">
                    <Key className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Inga API-nycklar
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Skapa din första API-nyckel för att komma igång
                    </p>
                    {canManageKeys && (
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Skapa API-nyckel
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs">
          <div className="grid gap-6">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle>Snabbstart</CardTitle>
                <CardDescription>
                  Kom igång med Siteflow API på några minuter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Skapa API-nyckel</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Generera en API-nyckel med lämpliga behörigheter
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Autentisera</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Inkludera din API-nyckel i Authorization-headern
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Gör anrop</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Börja göra API-anrop för att integrera
                    </p>
                  </div>
                </div>

                {/* Code Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Exempelkod</Label>
                    <div className="flex gap-2">
                      {(['curl', 'javascript', 'python'] as const).map((lang) => (
                        <Button
                          key={lang}
                          variant={codeLanguage === lang ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setCodeLanguage(lang)}
                        >
                          {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : 'Python'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="p-4 bg-slate-900 dark:bg-slate-950 rounded-lg overflow-x-auto">
                      <code className="text-sm text-slate-100 font-mono whitespace-pre">
                        {codeExamples[codeLanguage]}
                      </code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-slate-400 hover:text-white"
                      onClick={handleCopyCode}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>API-endpoints</CardTitle>
                <CardDescription>
                  Tillgängliga endpoints i Siteflow API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { method: 'GET', path: '/v1/projects', description: 'Lista alla projekt' },
                    { method: 'POST', path: '/v1/projects', description: 'Skapa nytt projekt' },
                    { method: 'GET', path: '/v1/projects/:id', description: 'Hämta specifikt projekt' },
                    { method: 'GET', path: '/v1/tickets', description: 'Lista alla ärenden' },
                    { method: 'POST', path: '/v1/tickets', description: 'Skapa nytt ärende' },
                    { method: 'GET', path: '/v1/documents', description: 'Lista alla dokument' },
                    { method: 'POST', path: '/v1/webhooks', description: 'Registrera webhook' }
                  ].map((endpoint, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={endpoint.method === 'GET' ? 'success' : 'primary'}
                          className="font-mono text-xs"
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono text-slate-700 dark:text-slate-300">
                          {endpoint.path}
                        </code>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {endpoint.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700">
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Fullständig API-dokumentation
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API-användning</CardTitle>
                <CardDescription>
                  Översikt över dina API-anrop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Usage Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Månatliga anrop
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        15,420 / 100,000
                      </span>
                    </div>
                    <Progress value={15.42} className="h-3" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      84,580 anrop kvar denna månad
                    </p>
                  </div>

                  <Separator />

                  {/* Usage by Key */}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                      Användning per nyckel
                    </h4>
                    <div className="space-y-3">
                      {apiKeys.filter(k => k.status === 'active').map((key) => (
                        <div key={key.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Key className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {key.name}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {key.requestCount.toLocaleString('sv-SE')} anrop
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Rate Limits */}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                      Begränsningar
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Per sekund</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">10 anrop</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Per minut</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">100 anrop</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Key Modal */}
      <Modal open={isCreateModalOpen} onOpenChange={(open) => {
        if (!open) resetCreateForm();
        setIsCreateModalOpen(open);
      }}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>
              {createdKey ? 'API-nyckel skapad' : 'Skapa ny API-nyckel'}
            </ModalTitle>
            <ModalDescription>
              {createdKey
                ? 'Kopiera nyckeln nu - den visas bara en gång'
                : 'Välj behörigheter och inställningar för din nya API-nyckel'}
            </ModalDescription>
          </ModalHeader>

          {createdKey ? (
            <div className="p-6 space-y-6">
              <Alert variant="warning">
                <AlertTriangle className="w-4 h-4" />
                <span>Spara denna nyckel säkert. Du kommer inte att kunna se den igen.</span>
              </Alert>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                    {newKeyVisible ? createdKey : `${createdKey.slice(0, 10)}${'•'.repeat(32)}`}
                  </code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewKeyVisible(!newKeyVisible)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {newKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopyKey(createdKey)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                resetCreateForm();
                setIsCreateModalOpen(false);
              }}>
                Jag har sparat nyckeln
              </Button>
            </div>
          ) : (
            <>
              <div className="p-6 space-y-6">
                {/* Key Name */}
                <div className="space-y-2">
                  <Label htmlFor="keyName">Namn</Label>
                  <Input
                    id="keyName"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="t.ex. Production API Key"
                  />
                </div>

                {/* Key Type */}
                <div className="space-y-2">
                  <Label>Typ</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setKeyType('test')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        keyType === 'test'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Badge variant="warning" className="mb-2">Test</Badge>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        För utveckling och testning
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeyType('live')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        keyType === 'live'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Badge variant="success" className="mb-2">Live</Badge>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        För produktion
                      </p>
                    </button>
                  </div>
                </div>

                {/* Scopes */}
                <div className="space-y-2">
                  <Label>Behörigheter</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 border rounded-lg dark:border-slate-700">
                    {availableScopes.map((scope) => (
                      <div
                        key={scope.id}
                        className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                      >
                        <Checkbox
                          id={scope.id}
                          checked={selectedScopes.includes(scope.id)}
                          onCheckedChange={() => toggleScope(scope.id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={scope.id}
                            className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
                          >
                            {scope.name}
                          </label>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {scope.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expiration */}
                <div className="space-y-2">
                  <Label>Utgångsdatum</Label>
                  <Select value={keyExpiration} onValueChange={(v) => setKeyExpiration(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Aldrig</SelectItem>
                      <SelectItem value="30">30 dagar</SelectItem>
                      <SelectItem value="90">90 dagar</SelectItem>
                      <SelectItem value="365">1 år</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ModalFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleCreateKey} loading={isCreating}>
                  <Key className="w-4 h-4 mr-2" />
                  Skapa nyckel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Revoke Key Modal */}
      <Modal open={isRevokeModalOpen} onOpenChange={setIsRevokeModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle>Återkalla API-nyckel</ModalTitle>
            <ModalDescription>
              Är du säker på att du vill återkalla denna API-nyckel? Detta kan inte ångras.
            </ModalDescription>
          </ModalHeader>
          <div className="p-6">
            <Alert variant="error">
              <AlertTriangle className="w-4 h-4" />
              <span>
                All åtkomst som använder denna nyckel kommer att upphöra omedelbart.
              </span>
            </Alert>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsRevokeModalOpen(false)}>
              Avbryt
            </Button>
            <Button variant="danger" onClick={handleRevokeKey}>
              <Trash2 className="w-4 h-4 mr-2" />
              Återkalla nyckel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default APIPortalPage;
