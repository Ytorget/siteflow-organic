import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Info, Clock } from 'lucide-react';

interface PreviewBannerProps {
  previewUrl: string;
  previewNotes?: string | null;
  previewUpdatedAt?: string | null;
  projectName: string;
}

const PreviewBanner: React.FC<PreviewBannerProps> = ({
  previewUrl,
  previewNotes,
  previewUpdatedAt,
  projectName,
}) => {
  const { t } = useTranslation();

  const formatUpdateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${minutes}m ${t('preview.ago')}`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ${t('preview.ago')}`;
    } else {
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{t('preview.title')}</h3>
          </div>
          <p className="text-indigo-100 text-sm mb-4">
            {t('preview.description', { projectName })}
          </p>

          {previewNotes && (
            <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">{t('preview.notes')}</p>
                  <p className="text-sm text-indigo-100 whitespace-pre-wrap">{previewNotes}</p>
                </div>
              </div>
            </div>
          )}

          {previewUpdatedAt && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-200">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t('preview.lastUpdated')}: {formatUpdateTime(previewUpdatedAt)}
              </span>
            </div>
          )}
        </div>

        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
        >
          {t('preview.openPreview')}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default PreviewBanner;
