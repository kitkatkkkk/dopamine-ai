import React from 'react';
import { Sparkles, User, HeartHandshake } from 'lucide-react';
import { ChatMessage as ChatMessageType, SupportedLanguage } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  language: SupportedLanguage;
  onOpenConnectModal?: () => void;
  onSelectAction?: (actionText: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  language,
  onOpenConnectModal,
  onSelectAction,
}) => {
  const isUser = message.role === 'user';

  // Format simple markdown into JSX
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Warning / Caution highlight
      if (line.startsWith('⚠️')) {
        return (
          <div
            key={idx}
            className="my-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs sm:text-sm font-medium"
          >
            {line}
          </div>
        );
      }

      // Bold parsing **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="font-semibold text-violet-600 min-w-[1.2rem]">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span>{formattedLine.slice(1)}</span>
          </div>
        );
      }

      // Bullet list item
      if (line.trim().startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-violet-500 font-bold">•</span>
            <span>{line.trim().substring(2)}</span>
          </div>
        );
      }

      // Blank line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 my-3 animate-fade-in ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header name / label */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-semibold text-slate-500">
            {isUser ? (language === 'kk' ? 'Сіз' : 'Вы') : 'DOPAMINE AI'}
          </span>
          {!isUser && (
            message.isDemo ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{language === 'kk' ? 'Скрипт демо' : 'Скрипт демо'}</span>
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{language === 'kk' ? 'Gemini Live AI' : 'Gemini Live AI'}</span>
              </span>
            )
          )}
          <span className="text-[10px] text-slate-400">{message.timestamp}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl text-sm shadow-sm transition-all ${
            isUser
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-violet-200/50'
              : 'bg-white border border-violet-100/90 text-slate-800 rounded-tl-sm shadow-slate-100'
          }`}
        >
          {renderFormattedContent(message.content)}

          {/* DOPAMINE CONNECT Button if applicable */}
          {!isUser && message.showConnectButton && onOpenConnectModal && (
            <div className="mt-3 pt-3 border-t border-violet-100">
              <button
                onClick={onOpenConnectModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium text-xs rounded-xl shadow-md shadow-violet-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <HeartHandshake className="w-4 h-4 text-pink-200" />
                <span>DOPAMINE CONNECT — {language === 'kk' ? 'Психологпен байланысу' : 'Связаться с психологом'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Action pills (suggestions) */}
        {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestedActions.map((action, aIdx) => (
              <button
                key={aIdx}
                onClick={() => onSelectAction && onSelectAction(action)}
                className="text-xs bg-white hover:bg-violet-50 text-violet-700 font-medium px-2.5 py-1 rounded-full border border-violet-200/80 transition-all hover:border-violet-400 shadow-2xs hover:scale-[1.01]"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
