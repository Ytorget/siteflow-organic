import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  ExternalLink,
  Star,
  Clock,
  AlertTriangle,
  PartyPopper,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  isDelivered: boolean;
  deliveredAt?: string | null;
  deliveryUrl?: string | null;
  deliveryNotes?: string | null;
  customerRating?: number | null;
  customerReview?: string | null;
  reviewedAt?: string | null;
  supportStartDate?: string | null;
  supportEndDate?: string | null;
  supportMonths?: number | null;
}

interface ProjectCompletionProps {
  project: Project;
  onSubmitReview?: (rating: number, review: string) => Promise<void>;
  canReview?: boolean;
}

const ProjectCompletion: React.FC<ProjectCompletionProps> = ({
  project,
  onSubmitReview,
  canReview = false,
}) => {
  const { t } = useTranslation();
  const [isReviewing, setIsReviewing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (project.isDelivered && !project.reviewedAt) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [project.isDelivered, project.reviewedAt]);

  useEffect(() => {
    if (project.supportEndDate) {
      const calculateDaysLeft = () => {
        const endDate = new Date(project.supportEndDate!);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays);
      };

      calculateDaysLeft();
      const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Update every hour
      return () => clearInterval(interval);
    }
  }, [project.supportEndDate]);

  if (!project.isDelivered) {
    return null;
  }

  const handleSubmitReview = async () => {
    if (rating === 0 || !review.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitReview?.(rating, review);
      setIsReviewing(false);
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSupportStatus = () => {
    if (!daysLeft) return { color: 'gray', label: t('project.completion.support.unknown') };
    if (daysLeft < 0)
      return { color: 'red', label: t('project.completion.support.expired'), icon: AlertTriangle };
    if (daysLeft <= 30)
      return { color: 'orange', label: t('project.completion.support.ending'), icon: Clock };
    return { color: 'green', label: t('project.completion.support.active'), icon: CheckCircle };
  };

  const supportStatus = getSupportStatus();

  return (
    <div className="space-y-6">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">
            <PartyPopper className="w-24 h-24 text-yellow-500" />
          </div>
        </div>
      )}

      {/* Delivery Celebration Banner */}
      {!project.reviewedAt && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {t('project.completion.congratulations')}
              </h2>
              <p className="text-green-50 mb-4">{t('project.completion.delivered_message')}</p>

              {project.deliveryUrl && (
                <a
                  href={project.deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-md"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t('project.completion.view_project')}
                </a>
              )}

              {project.deliveryNotes && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-green-50 whitespace-pre-wrap">
                    {project.deliveryNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Review Section */}
      {canReview && !project.reviewedAt && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t('project.completion.review.title')}
          </h3>

          {!isReviewing ? (
            <button
              onClick={() => setIsReviewing(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              {t('project.completion.review.rate_project')}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('project.completion.review.rating')}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('project.completion.review.feedback')}
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('project.completion.review.feedback_placeholder')}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || !review.trim() || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? t('project.completion.review.submitting')
                    : t('project.completion.review.submit')}
                </button>
                <button
                  onClick={() => {
                    setIsReviewing(false);
                    setRating(0);
                    setReview('');
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Review Display */}
      {project.reviewedAt && project.customerRating && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t('project.completion.review.your_review')}
          </h3>

          {/* Stars */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  project.customerRating && project.customerRating >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>

          {project.customerReview && (
            <p className="text-slate-700 whitespace-pre-wrap">{project.customerReview}</p>
          )}

          <p className="text-xs text-slate-500 mt-3">
            {t('project.completion.review.submitted_at')}:{' '}
            {new Date(project.reviewedAt).toLocaleDateString('sv-SE')}
          </p>
        </div>
      )}

      {/* Support Period Info */}
      {project.supportEndDate && (
        <div
          className={`bg-white rounded-xl border-2 p-6 ${
            supportStatus.color === 'red'
              ? 'border-red-300'
              : supportStatus.color === 'orange'
              ? 'border-orange-300'
              : 'border-green-300'
          }`}
        >
          <div className="flex items-start gap-4">
            {supportStatus.icon && (
              <supportStatus.icon
                className={`w-8 h-8 flex-shrink-0 ${
                  supportStatus.color === 'red'
                    ? 'text-red-600'
                    : supportStatus.color === 'orange'
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('project.completion.support.title')}
              </h3>

              <div className="space-y-2">
                <p className="text-slate-700">
                  <span className="font-medium">{t('project.completion.support.status')}:</span>{' '}
                  <span
                    className={
                      supportStatus.color === 'red'
                        ? 'text-red-600'
                        : supportStatus.color === 'orange'
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }
                  >
                    {supportStatus.label}
                  </span>
                </p>

                {daysLeft !== null && daysLeft >= 0 && (
                  <p className="text-slate-700">
                    <span className="font-medium">
                      {t('project.completion.support.days_remaining')}:
                    </span>{' '}
                    {daysLeft} {t('common.days')}
                  </p>
                )}

                <p className="text-slate-700">
                  <span className="font-medium">{t('project.completion.support.ends')}:</span>{' '}
                  {new Date(project.supportEndDate).toLocaleDateString('sv-SE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {daysLeft !== null && daysLeft < 30 && daysLeft > 0 && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    {t('project.completion.support.ending_soon')}
                  </p>
                </div>
              )}

              {daysLeft !== null && daysLeft < 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    {t('project.completion.support.expired_message')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCompletion;
