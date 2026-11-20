import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import { SupportedLanguage } from '../../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: SupportedLanguage;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  language,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const placeholderText =
    language === 'kk'
      ? 'Өз сезіміңізді немесе сұрағыңызды жазыңыз... (Enter — жіберу)'
      : 'Поделитесь своими мыслями или вопросом... (Enter — отправить)';

  return (
    <div className="relative border-t border-violet-100 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-3 rounded-b-3xl">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="relative flex-1 bg-violet-50/70 border border-violet-200/80 rounded-2xl focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isLoading}
            className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none max-h-32"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            text.trim() && !isLoading
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200 hover:scale-105 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title={language === 'kk' ? 'Жіберу' : 'Отправить'}
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1">
        <span>
          {language === 'kk'
            ? '💡 Хакатон демонстрациялық прототипі. Құпия немесе жеке деректерді енгізбеңіз.'
            : '💡 Демонстрационный прототип хакатона. Не вводите личные или чувствительные данные.'}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
          <span>Shift+Enter</span> <CornerDownLeft className="w-3 h-3" /> <span>жол ауыстыру</span>
        </span>
      </div>
    </div>
  );
};
