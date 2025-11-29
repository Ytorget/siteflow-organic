import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  RefreshCw,
  Search,
  Filter,
  Upload,
  Download,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileType,
  MoreHorizontal,
  Eye,
  Trash2,
  Share2,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  HardDrive,
  Calendar,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  ExternalLink,
  Copy,
  Star,
  StarOff
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { useProjects, useDocuments } from '../../src/hooks/useApi';
import ProjectSelector from '../shared/ProjectSelector';
import DocumentList from '../shared/DocumentList';
import { isAdmin, isKAM, isProjectLeader } from '../../utils/roleHelpers';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';
import { EmptyState } from '../../src/components/ui/empty-state';
import { Alert } from '../../src/components/ui/alert';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';
import { Label } from '../../src/components/ui/label';
import { Input } from '../../src/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../src/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../src/components/ui/dropdown-menu';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../src/components/ui/modal';

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: 'blue' | 'amber' | 'green' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{trend.isPositive ? '+' : ''}{trend.value}% från förra veckan</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Get file icon based on file type/extension
const getFileIcon = (filename: string, className = "w-5 h-5") => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return <FileImage className={`${className} text-purple-500`} />;
  }
  if (['pdf'].includes(ext)) {
    return <FileType className={`${className} text-red-500`} />;
  }
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <FileText className={`${className} text-blue-500`} />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className={`${className} text-green-500`} />;
  }
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'py'].includes(ext)) {
    return <FileCode className={`${className} text-amber-500`} />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className={`${className} text-slate-500`} />;
  }
  return <File className={`${className} text-slate-400`} />;
};

// Get file type label
const getFileTypeLabel = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'Bild';
  if (['pdf'].includes(ext)) return 'PDF';
  if (['doc', 'docx'].includes(ext)) return 'Dokument';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Kalkylblad';
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'py'].includes(ext)) return 'Kod';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'Arkiv';
  return 'Fil';
};

// Mock documents data for demonstration
const mockDocuments = [
  { id: '1', name: 'Projektplan Q4 2024.pdf', size: 2450000, type: 'pdf', uploadedBy: 'Anna Lindström', uploadedAt: new Date().toISOString(), projectId: '1', starred: true },
  { id: '2', name: 'Designspecifikation.docx', size: 1250000, type: 'document', uploadedBy: 'Erik Svensson', uploadedAt: new Date(Date.now() - 86400000).toISOString(), projectId: '1', starred: false },
  { id: '3', name: 'UI_mockups.zip', size: 15000000, type: 'archive', uploadedBy: 'Maria Karlsson', uploadedAt: new Date(Date.now() - 172800000).toISOString(), projectId: '1', starred: false },
  { id: '4', name: 'Budget_2024.xlsx', size: 850000, type: 'spreadsheet', uploadedBy: 'Johan Andersson', uploadedAt: new Date(Date.now() - 259200000).toISOString(), projectId: '1', starred: true },
  { id: '5', name: 'logo_final.png', size: 520000, type: 'image', uploadedBy: 'Sofia Berg', uploadedAt: new Date(Date.now() - 345600000).toISOString(), projectId: '1', starred: false },
  { id: '6', name: 'api_documentation.md', size: 125000, type: 'code', uploadedBy: 'Anna Lindström', uploadedAt: new Date(Date.now() - 432000000).toISOString(), projectId: '1', starred: false },
];

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Check permissions
  const canUpload = user && (isAdmin(user.role) || isKAM(user.role) || isProjectLeader(user.role));

  // Fetch projects based on role
  const { data: projects = [], isLoading, error, refetch } = useProjects(
    user?.companyId && !isAdmin(user.role) && !isKAM(user.role) && !isProjectLeader(user.role)
      ? { companyId: user.companyId }
      : undefined
  );

  // Use mock data for demonstration (in production, this would come from API)
  const documents = selectedProjectId ? mockDocuments : [];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSize = documents.reduce((sum: number, doc: any) => sum + doc.size, 0);
    const starredCount = documents.filter((d: any) => d.starred).length;

    return {
      totalDocuments: documents.length,
      totalSize: formatFileSize(totalSize),
      starredDocuments: starredCount,
      recentUploads: documents.filter((d: any) => {
        const uploadDate = new Date(d.uploadedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return uploadDate > weekAgo;
      }).length
    };
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: any) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, typeFilter]);

  const handleRefresh = () => {
    refetch();
    toast.success('Data uppdaterad');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Idag';
    if (diffInDays === 1) return 'Igår';
    if (diffInDays < 7) return `${diffInDays} dagar sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Fel vid hämtning av data" dismissible>
        {error instanceof Error ? error.message : t('errors.loadFailed', 'Kunde inte ladda data')}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('pages.documents.title', 'Dokument')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('pages.documents.subtitle', 'Hantera projektdokument och filer')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Uppdatera">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Tooltip>
          {canUpload && selectedProjectId && (
            <Button onClick={() => setIsUploadModalOpen(true)} className="shadow-sm">
              <Upload className="w-4 h-4 mr-2" />
              Ladda upp
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totala dokument"
          value={stats.totalDocuments}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Total storlek"
          value={stats.totalSize}
          icon={<HardDrive className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Stjärnmärkta"
          value={stats.starredDocuments}
          icon={<Star className="w-6 h-6" />}
          color="amber"
        />
        <StatsCard
          title="Senaste veckan"
          value={stats.recentUploads}
          icon={<Clock className="w-6 h-6" />}
          trend={{ value: 20, isPositive: true }}
          color="green"
        />
      </div>

      {/* Project Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 max-w-md">
              <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('pages.documents.selectProject', 'Välj projekt')}
              </Label>
              <ProjectSelector
                value={selectedProjectId}
                onChange={setSelectedProjectId}
              />
            </div>

            {selectedProjectId && (
              <>
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sök dokument
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Sök filer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Filtyp
                  </Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Alla typer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla typer</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="document">Dokument</SelectItem>
                      <SelectItem value="spreadsheet">Kalkylblad</SelectItem>
                      <SelectItem value="image">Bilder</SelectItem>
                      <SelectItem value="code">Kod</SelectItem>
                      <SelectItem value="archive">Arkiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Toggle */}
                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Vy
                  </Label>
                  <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Active filters */}
          {selectedProjectId && (typeFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Aktiva filter:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Sök: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Typ: {typeFilter}
                    <button onClick={() => setTypeFilter('all')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      {selectedProjectId ? (
        filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={<FileText className="w-12 h-12" />}
                title={searchQuery || typeFilter !== 'all'
                  ? 'Inga dokument matchar filtret'
                  : 'Inga dokument än'}
                description={canUpload && !searchQuery && typeFilter === 'all'
                  ? 'Ladda upp ditt första dokument'
                  : undefined}
                action={canUpload && !searchQuery && typeFilter === 'all' ? {
                  label: 'Ladda upp dokument',
                  onClick: () => setIsUploadModalOpen(true)
                } : undefined}
              />
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc: any) => {
              const isSelected = selectedDocId === doc.id;

              return (
                <Card
                  key={doc.id}
                  className={`group cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg'
                      : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedDocId(isSelected ? null : doc.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                        {getFileIcon(doc.name, "w-8 h-8")}
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate w-full">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                      {doc.starred && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 mt-2" />
                      )}
                    </div>

                    {/* Quick Actions on Hover */}
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip content="Ladda ner">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Dela">
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Förhandsgranska
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Kopiera länk
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {doc.starred ? (
                              <>
                                <StarOff className="w-4 h-4 mr-2" />
                                Ta bort stjärna
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Stjärnmärk
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Ta bort
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="col-span-5">Namn</div>
                <div className="col-span-2">Typ</div>
                <div className="col-span-2">Storlek</div>
                <div className="col-span-2">Uppladdad</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredDocuments.map((doc: any) => {
                  const isSelected = selectedDocId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(isSelected ? null : doc.id)}
                      className={`group cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 p-4 sm:p-5 items-center">
                        {/* Name */}
                        <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getFileIcon(doc.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                {doc.name}
                              </h3>
                              {doc.starred && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                              {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="hidden sm:block col-span-2">
                          <Badge variant="secondary" className="gap-1">
                            {getFileIcon(doc.name, "w-3 h-3")}
                            {getFileTypeLabel(doc.name)}
                          </Badge>
                        </div>

                        {/* Size */}
                        <div className="hidden sm:block col-span-2 text-sm text-slate-600 dark:text-slate-400">
                          {formatFileSize(doc.size)}
                        </div>

                        {/* Date */}
                        <div className="hidden sm:flex col-span-2 items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(doc.uploadedAt)}
                        </div>

                        {/* Actions */}
                        <div className="hidden sm:flex col-span-1 justify-end items-center gap-1">
                          <Tooltip content="Ladda ner">
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <Download className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Förhandsgranska
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Ladda ner
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Dela
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Kopiera länk
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Ta bort
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 mb-1">Uppladdad av</p>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-700 dark:text-slate-300">{doc.uploadedBy}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 mb-1">Datum</p>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {new Date(doc.uploadedAt).toLocaleDateString('sv-SE', { dateStyle: 'long' })}
                                </span>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 mb-1">Filtyp</p>
                                <span className="text-slate-700 dark:text-slate-300">{getFileTypeLabel(doc.name)}</span>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 mb-1">Storlek</p>
                                <span className="text-slate-700 dark:text-slate-300">{formatFileSize(doc.size)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Ladda ner
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4 mr-2" />
                                Dela
                              </Button>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Öppna
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<Folder className="w-12 h-12" />}
              title={t('pages.documents.noProjectSelected', 'Välj ett projekt')}
              description={t('pages.documents.selectProjectHint', 'Välj ett projekt ovan för att se och hantera dess dokument')}
            />
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Ladda upp dokument
            </ModalTitle>
          </ModalHeader>
          <div className="p-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                Dra och släpp filer här
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                eller klicka för att välja filer
              </p>
              <Button variant="outline" size="sm">
                Välj filer
              </Button>
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
              Max filstorlek: 50 MB • Tillåtna format: PDF, DOC, XLS, PNG, JPG, ZIP
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
                Avbryt
              </Button>
              <Button disabled>
                Ladda upp
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
