import React, { useState } from 'react';
import { X, HeartHandshake, PhoneCall, CheckCircle, ShieldAlert } from 'lucide-react';
import { SupportedLanguage } from '../../types/chat';

interface DopamineConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
}

export const DopamineConnectModal: React.FC<DopamineConnectModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [studentName, setStudentName] = useState('');
  const [institution, setInstitution] = useState('Қорқыт Ата атындағы Қызылорда университеті');
  const [preferredTime, setPreferredTime] = useState('15:00');
  const [topic, setTopic] = useState('Академиялық күйзеліс және мазасыздық');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [demoBookingId, setDemoBookingId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoBookingId('DEMO-' + Math.floor(1000 + Math.random() * 9000));
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-violet-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-violet-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                DOPAMINE CONNECT
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  {language === 'kk' ? 'Демо' : 'Демо'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'kk'
                  ? 'Қызылорда студенттік психологиялық қолдау қызметі'
                  : 'Служба психологической поддержки студентов в Кызылорде'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Disclaimer */}
        <div className="mt-4 p-3 bg-violet-50 rounded-2xl border border-violet-200/60 flex items-start gap-2.5 text-xs text-violet-900">
          <ShieldAlert className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {language === 'kk' ? 'Хакатон демонстрациялық модулі (Ойдан шығарылған деректер)' : 'Демонстрационный модуль хакатона (Тестовые данные)'}
            </p>
            <p className="text-violet-700 mt-0.5">
              {language === 'kk'
                ? 'Бұл модуль нақты жеке деректерді өңдемейді. Тестілеу кезінде тек шартты/ойдан шығарылған деректерді қолданыңыз. Автоматты жазылу бекітілмейді.'
                : 'Модуль не обрабатывает реальные персональные данные. Используйте вымышленные тестовые данные. Запись не оформляется автоматически.'}
            </p>
          </div>
        </div>

        {/* Emergency Contacts Banner */}
        <div className="mt-3 p-3 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-xs text-red-900">
          <PhoneCall className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              {language === 'kk' ? 'Шұғыл көмек қажет болса (Қазақстан):' : 'Если требуется срочная помощь (РК):'}
            </p>
            <div className="flex flex-wrap gap-2 mt-1.5 font-medium">
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-red-200">
                📞 111 — {language === 'kk' ? 'Балалар мен жастарға' : 'Линия для молодежи'}
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-red-200">
                📞 150 — {language === 'kk' ? 'Сенім телефоны' : 'Телефон доверия'}
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-red-200">
                🚑 103 — {language === 'kk' ? 'Жедел жәрдем' : 'Скорая помощь'}
              </span>
            </div>
          </div>
        </div>

        {/* Form or Confirmation */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'kk' ? 'Есіміңіз немесе бүркеншік ат' : 'Ваше имя или псевдоним'}
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={language === 'kk' ? 'Тесттік есім (мысалы: Айсұлтан)' : 'Тестовое имя (например: Айсултан)'}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'kk' ? 'Оқу орны (Қызылорда)' : 'Учебное заведение (Кызылорда)'}
              </label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition bg-white"
              >
                <option value="Қорқыт Ата атындағы Қызылорда университеті">
                  Қорқыт Ата атындағы Қызылорда университеті (Korkyt Ata)
                </option>
                <option value="Қызылорда Болашақ университеті">
                  Қызылорда «Болашақ» университеті
                </option>
                <option value="Қызылорда медициналық жоғары колледжі">
                  Қызылорда медициналық жоғары колледжі
                </option>
                <option value="Назарбаев Зияткерлік мектебі (НЗМ Қызылорда)">
                  НЗМ Қызылорда / БИЛ
                </option>
                <option value="Қызылорда қаласының мектебі">
                  Қызылорда қаласының жалпы білім беретін мектебі
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'kk' ? 'Ыңғайлы уақыт' : 'Удобное время'}
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'kk' ? 'Кездесу форматы' : 'Формат встречи'}
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition bg-white">
                  <option>{language === 'kk' ? 'Онлайн (анонимді)' : 'Онлайн (анонимно)'}</option>
                  <option>{language === 'kk' ? 'Офлайн (кампуста)' : 'Офлайн (на кампусе)'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'kk' ? 'Талқылағыңыз келетін тақырып' : 'Тема обращения'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {language === 'kk' ? 'Бас тарту' : 'Отмена'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-md shadow-violet-200 transition"
              >
                {language === 'kk' ? 'Өтініш жіберу (Демо)' : 'Отправить заявку (Демо)'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">
              {language === 'kk' ? 'Демо-өтініш сәтті қабылданды!' : 'Демо-заявка успешно оформлена!'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              ID: <span className="font-mono font-semibold text-violet-700">{demoBookingId}</span>
            </p>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-1.5 text-slate-600 border border-slate-200">
              <p>
                <strong>{language === 'kk' ? 'Студент:' : 'Студент:'}</strong> {studentName}
              </p>
              <p>
                <strong>{language === 'kk' ? 'Оқу орны:' : 'Уч. заведение:'}</strong> {institution}
              </p>
              <p>
                <strong>{language === 'kk' ? 'Таңдалған уақыт:' : 'Время:'}</strong> {preferredTime}
              </p>
              <p>
                <strong>{language === 'kk' ? 'Күйі:' : 'Статус:'}</strong>{' '}
                <span className="text-emerald-600 font-semibold">
                  {language === 'kk' ? 'Демонстрациялық растау' : 'Демонстрационное подтверждение'}
                </span>
              </p>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              {language === 'kk'
                ? 'Бұл хакатон шеңберіндегі интерфейстік көрсетілім болып табылады.'
                : 'Это прототип для демонстрации в рамках хакатона.'}
            </p>

            <button
              onClick={handleReset}
              className="mt-5 w-full py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow transition"
            >
              {language === 'kk' ? 'Түсінікті, жабу' : 'Понятно, закрыть'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
