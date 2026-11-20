import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  Trash2,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, SupportedLanguage } from '../../types/chat';
import { ChatService, ServiceMode } from '../../services/chatService';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { MoodCheckin } from './MoodCheckin';
import { DopamineConnectModal } from './DopamineConnectModal';

export interface DopamineChatProps {
  className?: string;
  isEmbedded?: boolean;
  initialLanguage?: SupportedLanguage;
  apiEndpoint?: string;
  serviceMode?: ServiceMode;
  onPsychologistBookingRequest?: () => void;
}

export const DopamineChat: React.FC<DopamineChatProps> = ({
  className = '',
  isEmbedded = false,
  initialLanguage = 'kk',
  apiEndpoint = '/api/chat',
  serviceMode = 'auto',
  onPsychologistBookingRequest,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [chatService] = useState(() => new ChatService(apiEndpoint, serviceMode));
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{
    configured: boolean;
    model: string;
    reachable: boolean;
  }>({
    configured: false,
    model: 'dopamine-scripted-demo',
    reachable: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial message and check backend health on mount
  useEffect(() => {
    const welcome = chatService.getInitialMessage(language);
    setMessages([welcome]);

    chatService.checkBackendHealth().then((status) => {
      setBackendStatus(status);
    });
  }, []);

  // Update initial message language if switched when only 1 message exists
  const handleToggleLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (messages.length <= 1) {
      setMessages([chatService.getInitialMessage(lang)]);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send message handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorMessage(null);

    const userMsg: ChatMessageType = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Build history payload for Gemini
      const historyPayload = nextMessages
        .slice(-6)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: (m.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
          parts: [{ text: m.content }],
        }));

      const res = await chatService.sendMessage({
        message: text,
        history: historyPayload,
        language,
      });

      const assistantMsg: ChatMessageType = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: res.isDemo,
        suggestedActions: res.suggestedActions,
        showConnectButton: res.showConnectButton,
        language,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[DOPAMINE AI Chat Error]', err);
      setErrorMessage(
        err.message ||
          (language === 'kk'
            ? 'Жүйелік қате орын алды. Қайталап көріңіз.'
            : 'Произошла ошибка при отправке. Попробуйте еще раз.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear or restart conversation
  const handleNewConversation = () => {
    setErrorMessage(null);
    setMessages([chatService.getInitialMessage(language)]);
  };

  // Clear messages completely
  const handleClearMessages = () => {
    setErrorMessage(null);
    setMessages([]);
  };

  // Suggested starters from requirements
  const starters = chatService.getSuggestedStarters(language);

  const openConnect = () => {
    if (onPsychologistBookingRequest) {
      onPsychologistBookingRequest();
    } else {
      setIsConnectModalOpen(true);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-3xl shadow-xl border border-violet-100/80 overflow-hidden font-sans transition-all max-w-4xl mx-auto w-full ${
        isEmbedded ? 'h-[620px]' : 'h-[85vh] min-h-[580px]'
      } ${className}`}
    >
      {/* 1. Header Bar */}
      <header className="px-4 py-3.5 bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 text-white flex items-center justify-between shadow-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 shadow-inner">
            <Sparkles className="w-5 h-5 text-purple-200 animate-pulse-glow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg tracking-tight">DOPAMINE AI</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  backendStatus.configured
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                }`}
                title={`Модель: ${backendStatus.model}`}
              >
                {backendStatus.configured ? '● LIVE AI' : '● DEMO MODE'}
              </span>
            </div>
            <p className="text-[11px] text-purple-200/90 hidden sm:block">
              {language === 'kk'
                ? '«Сезіміңді түсін. Өзіңді таны. Алға жылжы.»'
                : '«Understand your emotions. Discover yourself. Move forward.»'}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <div className="bg-white/10 rounded-xl p-0.5 border border-white/15 flex items-center">
            <button
              onClick={() => handleToggleLanguage('kk')}
              className={`px-2 py-1 text-xs rounded-lg font-semibold transition ${
                language === 'kk'
                  ? 'bg-white text-violet-800 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ҚАЗ
            </button>
            <button
              onClick={() => handleToggleLanguage('ru')}
              className={`px-2 py-1 text-xs rounded-lg font-semibold transition ${
                language === 'ru'
                  ? 'bg-white text-violet-800 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              РУС
            </button>
          </div>

          {/* DOPAMINE CONNECT quick button */}
          <button
            onClick={openConnect}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/20 transition-all hover:scale-105 active:scale-95"
            title="DOPAMINE CONNECT"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-pink-300" />
            <span>CONNECT</span>
          </button>

          {/* New Conversation Button */}
          <button
            onClick={handleNewConversation}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
            title={language === 'kk' ? 'Жаңа әңгіме' : 'Новый диалог'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Clear Messages Button */}
          <button
            onClick={handleClearMessages}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
            title={language === 'kk' ? 'Тазарту' : 'Очистить'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Daily Mood Check-In Widget */}
      <MoodCheckin onSelectMood={handleSendMessage} language={language} />

      {/* 3. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 bg-gradient-to-b from-violet-50/40 via-white to-violet-50/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Sparkles className="w-10 h-10 text-violet-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">
              {language === 'kk' ? 'Әңгіме басталмаған' : 'Диалог не начат'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {language === 'kk'
                ? 'Төмендегі ұсыныстардың бірін таңдаңыз немесе хабарлама жазыңыз'
                : 'Выберите одну из тем ниже или напишите сообщение'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              language={language}
              onOpenConnectModal={openConnect}
              onSelectAction={handleSendMessage}
            />
          ))
        )}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator language={language} />}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                chatService.setMode('demo');
                setErrorMessage(null);
                handleSendMessage('Сабақтан шаршадым');
              }}
              className="text-[11px] font-semibold text-rose-700 underline hover:text-rose-900 ml-2"
            >
              {language === 'kk' ? 'Демо режимде көру' : 'Перейти в демо-режим'}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Suggested Conversation Starters Carousel */}
      <div className="px-3 sm:px-4 py-2 bg-white border-t border-violet-100/70 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[11px] font-semibold text-violet-700 flex items-center gap-1 mr-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-violet-500" />
            {language === 'kk' ? 'Ұсыныстар:' : 'Темы:'}
          </span>
          {starters.map((starter, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSendMessage(starter)}
              disabled={isLoading}
              className="text-xs bg-violet-50/80 hover:bg-violet-100 text-violet-800 px-3 py-1.5 rounded-full border border-violet-200 font-medium transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Chat Input Bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        language={language}
      />

      {/* 6. DOPAMINE CONNECT Modal */}
      <DopamineConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default DopamineChat;
