import React, { useState } from 'react';
import { DopamineChat } from './components/chat/DopamineChat';
import { Sparkles, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { ServiceMode } from './services/chatService';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [serviceMode, setServiceMode] = useState<ServiceMode>('auto');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100/60 via-purple-50 to-fuchsia-50/40 flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8">
      {/* Top Navigation Bar */}
      <nav className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-violet-100 shadow-sm mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
            <Sparkles className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              DOPAMINE AI
              <span className="text-[10px] font-semibold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md">
                Kyzylorda Student Wellbeing
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Модуль чат-бота для интеграции в Lovable / React
            </p>
          </div>
        </div>

        {/* View and Mode Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Selector */}
          <div className="bg-violet-50 p-1 rounded-xl border border-violet-200/80 flex items-center text-xs">
            <button
              onClick={() => setServiceMode('auto')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                serviceMode === 'auto'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-violet-700 hover:text-violet-900'
              }`}
            >
              Авто / Сервер
            </button>
            <button
              onClick={() => setServiceMode('demo')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                serviceMode === 'demo'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-violet-700 hover:text-violet-900'
              }`}
            >
              Скрипт Демо
            </button>
          </div>

          {/* Desktop / Mobile view toggle */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl items-center text-slate-600 text-xs">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'desktop' ? 'bg-white text-violet-700 shadow-sm' : 'hover:text-slate-900'
              }`}
              title="Десктоп көрінісі"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'mobile' ? 'bg-white text-violet-700 shadow-sm' : 'hover:text-slate-900'
              }`}
              title="Мобильді көрініс"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Chatbot Presentation Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        <div
          className={`w-full transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'max-w-sm rounded-[40px] p-2.5 bg-slate-800 shadow-2xl border-4 border-slate-700'
              : 'max-w-4xl'
          }`}
        >
          {viewMode === 'mobile' && (
            <div className="h-5 flex items-center justify-center mb-1">
              <div className="w-20 h-3.5 bg-slate-900 rounded-full" />
            </div>
          )}

          <DopamineChat
            serviceMode={serviceMode}
            isEmbedded={viewMode === 'mobile'}
            className={viewMode === 'mobile' ? 'h-[620px] rounded-[32px]' : ''}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-5xl mt-6 pt-4 border-t border-violet-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Демонстрациялық хакатон прототипі. Медициналық диагноз қойылмайды, дербес деректер сақталмайды.
          </span>
        </div>
        <div className="flex items-center gap-4 text-violet-700 font-medium">
          <span>«Сезіміңді түсін. Өзіңді таны. Алға жылжы.»</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
