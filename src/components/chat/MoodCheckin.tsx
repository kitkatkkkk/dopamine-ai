import React from 'react';
import { Heart } from 'lucide-react';
import { SupportedLanguage } from '../../types/chat';

interface MoodCheckinProps {
  onSelectMood: (prompt: string) => void;
  language: SupportedLanguage;
}

interface MoodItem {
  id: string;
  emoji: string;
  labelKk: string;
  labelRu: string;
  promptKk: string;
  promptRu: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const MOODS: MoodItem[] = [
  {
    id: 'great',
    emoji: '🌟',
    labelKk: 'Керемет',
    labelRu: 'Отлично',
    promptKk: 'Бүгін көңіл-күйім керемет! Өзімді сергек әрі жігерлі сезініп тұрмын.',
    promptRu: 'Сегодня у меня отличное настроение! Чувствую прилив энергии и мотивации.',
    bgClass: 'bg-amber-50 hover:bg-amber-100/80',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
  },
  {
    id: 'good',
    emoji: '😊',
    labelKk: 'Жақсы',
    labelRu: 'Хорошо',
    promptKk: 'Көңіл-күйім жақсы, бәрі өз орнымен келе жатыр.',
    promptRu: 'Настроение хорошее, всё идёт своим чередом.',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/80',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-800',
  },
  {
    id: 'neutral',
    emoji: '😐',
    labelKk: 'Бірқалыпты',
    labelRu: 'Нормально',
    promptKk: 'Бүгін көңіл-күйім бірқалыпты, ерекше ештеңе жоқ, бірақ біраз қолдау керек.',
    promptRu: 'Настроение обычное, немного однообразно, хочется небольшой поддержки.',
    bgClass: 'bg-sky-50 hover:bg-sky-100/80',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-800',
  },
  {
    id: 'tired',
    emoji: '😫',
    labelKk: 'Шаршадым',
    labelRu: 'Устал(а)',
    promptKk: 'Сабақтан және тапсырмалардан қатты шаршадым, энергия таусылды.',
    promptRu: 'Очень устал(а) от учёбы и дедлайнов, чувствую эмоциональное выгорание.',
    bgClass: 'bg-violet-50 hover:bg-violet-100/80',
    borderClass: 'border-violet-200',
    textClass: 'text-violet-800',
  },
  {
    id: 'anxious',
    emoji: '😰',
    labelKk: 'Мазасызбын',
    labelRu: 'Тревожно',
    promptKk: 'Емтихан мен оқу үлгеріміме алаңдап жүрмін, іштей мазасыздық бар.',
    promptRu: 'Сильно переживаю и тревожусь из-за учебы, экзаменов и будущего.',
    bgClass: 'bg-rose-50 hover:bg-rose-100/80',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-800',
  },
];

export const MoodCheckin: React.FC<MoodCheckinProps> = ({ onSelectMood, language }) => {
  return (
    <div className="py-2 px-3 sm:px-4 bg-violet-50/50 border-b border-violet-100/70">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-violet-800 flex items-center gap-1">
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
          {language === 'kk' ? 'Күндізгі көңіл-күй check-in:' : 'Дневной чек-ин настроения:'}
        </span>
        <span className="text-[10px] text-slate-400">
          {language === 'kk' ? 'Өзіңді белгіле' : 'Выбери своё состояние'}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {MOODS.map((m) => {
          const label = language === 'kk' ? m.labelKk : m.labelRu;
          const prompt = language === 'kk' ? m.promptKk : m.promptRu;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMood(prompt)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all shadow-2xs hover:scale-105 active:scale-95 ${m.bgClass} ${m.borderClass} ${m.textClass}`}
              title={label}
            >
              <span className="text-sm">{m.emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
