import React from 'react';
import { Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../../types/chat';

interface TypingIndicatorProps {
  language?: SupportedLanguage;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ language = 'kk' }) => {
  return (
    <div className="flex items-start gap-3 animate-fade-in my-2">
      {/* Minimalist AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
        <Sparkles className="w-4 h-4 animate-spin-slow" />
      </div>

      {/* Bubble */}
      <div className="bg-white border border-violet-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
        <div className="flex items-center gap-1.5 py-1">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" />
        </div>
        <span className="text-xs font-medium text-violet-600 ml-1">
          {language === 'kk' ? 'DOPAMINE AI ойлануда...' : 'DOPAMINE AI печатает...'}
        </span>
      </div>
    </div>
  );
};
