import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Lock, Loader2, MessageCircle } from 'lucide-react';
import { useCommentsByTicket, useCreateComment } from '../../src/hooks/useApi';
import { useAuth } from '../../src/context/AuthContext';
import RichTextEditor from './RichTextEditor';

interface TicketConversationProps {
  ticketId: string;
  canAddInternal?: boolean; // Whether user can add internal comments
}

const TicketConversation: React.FC<TicketConversationProps> = ({
  ticketId,
  canAddInternal = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useCommentsByTicket(ticketId);
  const createComment = useCreateComment();

  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        ticketId,
        body: newComment,
        isInternal: canAddInternal ? isInternal : false,
      });
      setNewComment('');
      setIsInternal(false);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Show time for today
      return date.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 48) {
      // Show "Yesterday" for yesterday
      return `${t('ticket.conversation.yesterday')} ${date.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      // Show full date for older messages
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Get initials from author (we'll need to enhance this with actual user data later)
  const getAuthorInitials = (authorId: string) => {
    // For now, just use the first character of the ID
    // TODO: Fetch actual user data to display proper names/initials
    return authorId.substring(0, 2).toUpperCase();
  };

  const isOwnComment = (authorId: string) => authorId === user?.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {t('ticket.conversation.title')}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {comments.length} {t('ticket.conversation.messages')}
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>{t('ticket.conversation.noMessages')}</p>
            <p className="text-sm mt-1">{t('ticket.conversation.startConversation')}</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwn = isOwnComment(comment.authorId);
            const isInternalComment = comment.isInternal;

            return (
              <div
                key={comment.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : isInternalComment
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-400 text-white'
                  }`}
                >
                  {getAuthorInitials(comment.authorId)}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {/* Internal Badge */}
                  {isInternalComment && (
                    <div className="flex items-center gap-1 mb-1 text-xs text-amber-600">
                      <Lock className="w-3 h-3" />
                      <span>{t('ticket.conversation.internal')}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? isInternalComment
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                        : isInternalComment
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-slate-400 mt-1 px-2">
                    {formatTime(comment.insertedAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Internal Comment Toggle */}
          {canAddInternal && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <Lock className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700">{t('ticket.conversation.markAsInternal')}</span>
            </label>
          )}

          {/* Message Input */}
          <div className="flex flex-col gap-2">
            <RichTextEditor
              content={newComment}
              onChange={setNewComment}
              placeholder={t('ticket.conversation.placeholder')}
              minHeight="100px"
              disabled={createComment.isPending}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || createComment.isPending}
              className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('ticket.conversation.send')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketConversation;
