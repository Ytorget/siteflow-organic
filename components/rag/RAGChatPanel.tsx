import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Trash2, StopCircle } from 'lucide-react';
import { useRAGChat } from '../../src/hooks/useRAGChat';

interface RAGChatPanelProps {
  projectId: string;
  projectName?: string;
}

const RAGChatPanel: React.FC<RAGChatPanelProps> = ({ projectId, projectName }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isStreaming, sendMessage, stopStreaming, clearMessages } = useRAGChat({
    projectId,
    onError: (error) => {
      console.error('RAG Chat error:', error);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const messageToSend = input;
    setInput('');
    await sendMessage(messageToSend);

    // Focus input after sending
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Projektassistent</h3>
            {projectName && (
              <p className="text-sm text-slate-600">Chatta om {projectName}</p>
            )}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            disabled={isStreaming}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            title="Rensa chatthistorik"
          >
            <Trash2 className="w-4 h-4" />
            <span>Rensa</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-slate-300 mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">Hej! Hur kan jag hjälpa dig?</h4>
            <p className="text-slate-600 max-w-md">
              Jag har tillgång till all projektinformation och kan svara på frågor om krav, design, budget och mer.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              <button
                onClick={() => sendMessage('Vad är projektets huvudsakliga mål?')}
                disabled={isStreaming}
                className="px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-sm text-slate-700 transition-colors disabled:opacity-50"
              >
                💡 Vad är projektets huvudsakliga mål?
              </button>
              <button
                onClick={() => sendMessage('Vilka tekniska krav finns det?')}
                disabled={isStreaming}
                className="px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-sm text-slate-700 transition-colors disabled:opacity-50"
              >
                🔧 Vilka tekniska krav finns det?
              </button>
              <button
                onClick={() => sendMessage('Sammanfatta kundens önskemål')}
                disabled={isStreaming}
                className="px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-sm text-slate-700 transition-colors disabled:opacity-50"
              >
                📋 Sammanfatta kundens önskemål
              </button>
              <button
                onClick={() => sendMessage('Vad är budgeten och tidsplanen?')}
                disabled={isStreaming}
                className="px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-sm text-slate-700 transition-colors disabled:opacity-50"
              >
                💰 Vad är budgeten och tidsplanen?
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                    )}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('sv-SE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'AI svarar...' : 'Skriv din fråga här... (Enter för att skicka)'}
            disabled={isStreaming}
            rows={1}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stopStreaming}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <StopCircle className="w-5 h-5" />
              <span>Stoppa</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
              <span>Skicka</span>
            </button>
          )}
        </form>
        <p className="text-xs text-slate-500 mt-2">
          AI-assistenten har tillgång till alla formulärsvar, dokument och projektinformation.
        </p>
      </div>
    </div>
  );
};

export default RAGChatPanel;
