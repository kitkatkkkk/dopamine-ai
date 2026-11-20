import React, { useState, useMemo, useEffect } from 'react';

// ============================================================================
// DOPAMINE — Психолог кабинеті (PsychologistDashboard)
// Тіл: Қазақша | Тек тағайындалған «Демо-өтінімдер» | Құпиялылықты сақтау
// ============================================================================

export type AppointmentStatus = 'күтілуде' | 'қабылданды' | 'бас_тартылды' | 'аяқталды';
export type RecordingConsentStatus = 'келісім_берілді' | 'келісім_берілмеді';
export type FilterTab = 'барлығы' | 'күтілуде' | 'қабылданды' | 'бас_тартылды';

export interface DemoAppointmentRequest {
  id: string;
  pseudonym: string; // Вымышленный анонимный псевдоним қатысушы үшін
  meetingDate: string; // Кездесу күні
  meetingTime: string; // Кездесу уақыты
  format: 'Онлайн (анонимді)' | 'Офлайн (кабинет)';
  status: AppointmentStatus;
  recordingConsent: RecordingConsentStatus;
  topicCategory: string; // Сұраныс бағыты (жеке дерексіз)
  createdAt: string;
}

// Психологқа бекітілген ойдан шығарылған демо-өтінімдер (Mock data)
const INITIAL_APPOINTMENTS: DemoAppointmentRequest[] = [
  {
    id: 'req-101',
    pseudonym: 'Аққу-42',
    meetingDate: '21.11.2026',
    meetingTime: '11:00 - 11:45',
    format: 'Онлайн (анонимді)',
    status: 'күтілуде',
    recordingConsent: 'келісім_берілді',
    topicCategory: 'Оқу стрессі және шаршаңқылық',
    createdAt: 'Бүгін, 09:20',
  },
  {
    id: 'req-102',
    pseudonym: 'Қыран-77',
    meetingDate: '21.11.2026',
    meetingTime: '14:30 - 15:15',
    format: 'Офлайн (кабинет)',
    status: 'күтілуде',
    recordingConsent: 'келісім_берілмеді',
    topicCategory: 'Тайм-менеджмент және мазасыздық',
    createdAt: 'Бүгін, 10:45',
  },
  {
    id: 'req-103',
    pseudonym: 'Жұлдыз-19',
    meetingDate: '22.11.2026',
    meetingTime: '10:00 - 10:45',
    format: 'Онлайн (анонимді)',
    status: 'қабылданды',
    recordingConsent: 'келісім_берілді',
    topicCategory: 'Эмоционалдық қолдау',
    createdAt: 'Кеше, 16:30',
  },
  {
    id: 'req-104',
    pseudonym: 'Барыс-08',
    meetingDate: '22.11.2026',
    meetingTime: '16:00 - 16:45',
    format: 'Онлайн (анонимді)',
    status: 'бас_тартылды',
    recordingConsent: 'келісім_берілмеді',
    topicCategory: 'Мамандандыру таңдауындағы сенімсіздік',
    createdAt: '19.11.2026',
  },
];

interface PsychologistDashboardProps {
  // Рольді тексеру: әкімшілікке қолжетімділік жабық болуын қамтамасыз ету
  currentRole?: 'psychologist' | 'admin' | 'user';
  psychologistName?: string;
}

export const PsychologistDashboard: React.FC<PsychologistDashboardProps> = ({
  currentRole = 'psychologist',
  psychologistName = 'Әлия С. (Кезекші психолог)',
}) => {
  const [appointments, setAppointments] = useState<DemoAppointmentRequest[]>(INITIAL_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState<FilterTab>('барлығы');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Браузер вкладкасының тақырыбын орнату
  useEffect(() => {
    document.title = 'DOPAMINE — Психолог кабинеті';
  }, []);

  // Әкімшілік немесе рұқсаты жоқ тұлғаларға арналған қорғаныс экраны
  if (currentRole === 'admin') {
    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedCard}>
          <div style={styles.accessDeniedIcon}>⛔</div>
          <h2 style={styles.accessDeniedTitle}>Қолжетімділік шектелген</h2>
          <p style={styles.accessDeniedText}>
            Психолог кабинетіне тек расталған психолог мамандар ғана кіре алады.
            Қатысушылардың құпиялылығын қорғау үшін бұл бөлімге әкімшілікке (Admin) тікелей сілтеме арқылы да кіруге қатаң тыйым салынған.
          </p>
        </div>
      </div>
    );
  }

  // Өтінімді қабылдау әрекеті
  const handleAccept = (id: string, pseudonym: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'қабылданды' as AppointmentStatus } : item
      )
    );
    setActionNotice(`«${pseudonym}» бүркеншік атты қатысушының өтінімі сәтті ҚАБЫЛДАНДЫ.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Өтінімнен бас тарту әрекеті
  const handleDecline = (id: string, pseudonym: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'бас_тартылды' as AppointmentStatus } : item
      )
    );
    setActionNotice(`«${pseudonym}» қатысушының өтінімінен БАС ТАРТЫЛДЫ.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Таңдалған таб бойынша өтінімдерді сүзу
  const filteredAppointments = useMemo(() => {
    if (activeTab === 'барлығы') return appointments;
    return appointments.filter((app) => app.status === activeTab);
  }, [appointments, activeTab]);

  // Есептегіштер
  const pendingCount = appointments.filter((a) => a.status === 'күтілуде').length;
  const acceptedCount = appointments.filter((a) => a.status === 'қабылданды').length;

  return (
    <div style={styles.pageContainer}>
      {/* 1. Демо-режим міндетті белгісі */}
      <div style={styles.demoBanner}>
        <div style={styles.demoBadge}>Демо-режим</div>
        <div style={styles.demoBannerText}>
          <strong>Демо-режим. Нақты қабылдауға жазылу жүргізілмейді.</strong> Барлық мәліметтер, кездесу уақыттары және бүркеншік аттар тестілеуге арналған ойдан шығарылған деректер.
        </div>
      </div>

      {/* 2. Этика және құпиялылық кепілдігі */}
      <div style={styles.privacyBanner}>
        <div style={styles.privacyIcon}>🛡️</div>
        <div style={styles.privacyText}>
          <strong>Этикалық құпиялылық:</strong> Қатысушылардың жеке чаттары мен дербес күнделіктері ешкімге көрсетілмейді және толық құпия сақталады. Психолог тек анонимді бүркеншік атты (псевдонимді) және кездесу уақытын ғана көре алады.
        </div>
      </div>

      {/* 3. Хабарлама белгісі (әрекет жасалғанда) */}
      {actionNotice && (
        <div style={styles.actionAlert}>
          <span>✓ {actionNotice}</span>
          <button onClick={() => setActionNotice(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* 4. Тақырып және маман профилі */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>DOPAMINE — Психологтың жұмыс кабинеті</h1>
          <p style={styles.pageSubtitle}>
            Сізге тағайындалған кеңес беру өтінімдерін басқару және кесте мониторингі
          </p>
        </div>
        <div style={styles.psychologistBadge}>
          <span style={styles.avatarDot} />
          <div>
            <div style={styles.psychologistNameText}>{psychologistName}</div>
            <div style={styles.psychologistRoleText}>Бекітілген маман</div>
          </div>
        </div>
      </header>

      {/* 5. Жиынтық индикаторлар (KPI) */}
      <section style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Жаңа / Күтілудегі өтінімдер</div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumberOrange}>{pendingCount}</span>
            <span style={styles.kpiSubLabel}>өтінім қарауда</span>
          </div>
          <div style={styles.kpiFootnote}>Шешім қабылдау қажет</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Қабылданған кездесулер</div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumberGreen}>{acceptedCount}</span>
            <span style={styles.kpiSubLabel}>кестеге енгізілді</span>
          </div>
          <div style={styles.kpiFootnote}>Жақын арадағы сессиялар</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Анонимділік деңгейі</div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumberBlue}>100%</span>
            <span style={styles.kpiSubLabel}>Псевдоним жүйесі</span>
          </div>
          <div style={styles.kpiFootnote}>Личный чаттар жабық</div>
        </div>
      </section>

      {/* 6. Өтінімдерді сүзгілеу қойындылары */}
      <section style={styles.tabSection}>
        <div style={styles.tabButtons}>
          <button
            type="button"
            onClick={() => setActiveTab('барлығы')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'барлығы' ? styles.tabBtnActive : {}),
            }}
          >
            Барлығы ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('күтілуде')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'күтілуде' ? styles.tabBtnActive : {}),
            }}
          >
            Күтілуде ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('қабылданды')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'қабылданды' ? styles.tabBtnActive : {}),
            }}
          >
            Қабылданған ({acceptedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('бас_тартылды')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'бас_тартылды' ? styles.tabBtnActive : {}),
            }}
          >
            Бас тартылған ({appointments.filter((a) => a.status === 'бас_тартылды').length})
          </button>
        </div>
      </section>

      {/* 7. Өтінімдер тізімі */}
      <section style={styles.listCard}>
        {filteredAppointments.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>Әзірге өтінім жоқ</h3>
            <p style={styles.emptyText}>
              Таңдалған санат бойынша сізге бекітілген өтінімдер тіркелмеген.
            </p>
          </div>
        ) : (
          <div style={styles.appointmentsList}>
            {filteredAppointments.map((app) => (
              <div key={app.id} style={styles.appointmentItem}>
                <div style={styles.itemMainRow}>
                  {/* Сол жақ: Псевдоним және бағыты */}
                  <div style={styles.clientInfo}>
                    <div style={styles.pseudonymRow}>
                      <span style={styles.pseudonymBadge}>Бүркеншік ат:</span>
                      <strong style={styles.pseudonymTitle}>{app.pseudonym}</strong>
                      <span style={styles.demoSmallTag}>Демо</span>
                    </div>
                    <div style={styles.topicText}>
                      <strong>Сұраныс бағыты:</strong> {app.topicCategory}
                    </div>
                    <div style={styles.metaRow}>
                      <span style={styles.formatTag}>{app.format}</span>
                      <span style={styles.createdDate}>Өтінім уақыты: {app.createdAt}</span>
                    </div>
                  </div>

                  {/* Ортасы: Кездесу күні мен уақыты */}
                  <div style={styles.meetingTimeBox}>
                    <div style={styles.meetingTimeLabel}>Кездесу уақыты:</div>
                    <div style={styles.meetingDateText}>📅 {app.meetingDate}</div>
                    <div style={styles.meetingHourText}>⏰ {app.meetingTime}</div>
                  </div>

                  {/* Оң жақ: Мәртебелер */}
                  <div style={styles.statusCol}>
                    <div style={styles.statusRowItem}>
                      <span style={styles.statusLabelSmall}>Өтінім күйі:</span>
                      {app.status === 'күтілуде' && (
                        <span style={styles.statusBadgePending}>Күтілуде</span>
                      )}
                      {app.status === 'қабылданды' && (
                        <span style={styles.statusBadgeAccepted}>✓ Қабылданды</span>
                      )}
                      {app.status === 'бас_тартылды' && (
                        <span style={styles.statusBadgeDeclined}>✕ Бас тартылды</span>
                      )}
                    </div>

                    <div style={styles.statusRowItem}>
                      <span style={styles.statusLabelSmall}>Жазбаға келісім:</span>
                      {app.recordingConsent === 'келісім_берілді' ? (
                        <span style={styles.consentGivenBadge}>Келісім берілді</span>
                      ) : (
                        <span style={styles.consentRefusedBadge}>Келісім берілмеді</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Әрекет түймелері («Қабылдау» және «Бас тарту») */}
                <div style={styles.actionsRow}>
                  <div style={styles.privacyNoteSmall}>
                    🔒 Қатысушының жеке чаты мен жеке жазбалары жасырын.
                  </div>
                  <div style={styles.btnRow}>
                    <button
                      type="button"
                      disabled={app.status === 'қабылданды'}
                      onClick={() => handleAccept(app.id, app.pseudonym)}
                      style={{
                        ...styles.acceptBtn,
                        ...(app.status === 'қабылданды' ? styles.btnDisabled : {}),
                      }}
                    >
                      {app.status === 'қабылданды' ? 'Қабылданды' : 'Қабылдау'}
                    </button>
                    <button
                      type="button"
                      disabled={app.status === 'бас_тартылды'}
                      onClick={() => handleDecline(app.id, app.pseudonym)}
                      style={{
                        ...styles.declineBtn,
                        ...(app.status === 'бас_тартылды' ? styles.btnDisabled : {}),
                      }}
                    >
                      {app.status === 'бас_тартылды' ? 'Бас тартылды' : 'Бас тарту'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. Төменгі колонтитул */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          DOPAMINE Психолог модулі. <strong>«Демо-режим. Нақты қабылдауға жазылу жүргізілмейді»</strong>.
          Барлық жеке хат алмасулар шифрланған және үшінші тұлғалардан толықтай қорғалған.
        </p>
      </footer>
    </div>
  );
};

// ============================================================================
// Стилистика (Таза CSS-in-JS, сыртқы тәуелділіксіз жұмыс істейді)
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    minHeight: '100vh',
    padding: '24px 32px',
    boxSizing: 'border-box',
  },
  demoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '10px',
    padding: '12px 18px',
    marginBottom: '14px',
  },
  demoBadge: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    flexShrink: 0,
  },
  demoBannerText: {
    fontSize: '13px',
    color: '#1E40AF',
    lineHeight: 1.4,
  },
  privacyBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '10px',
    padding: '12px 18px',
    marginBottom: '20px',
  },
  privacyIcon: {
    fontSize: '18px',
    lineHeight: 1,
  },
  privacyText: {
    fontSize: '13px',
    color: '#166534',
    lineHeight: 1.45,
  },
  actionAlert: {
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#065F46',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 500,
  },
  alertCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#065F46',
    fontWeight: 700,
    fontSize: '14px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
  },
  psychologistBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    padding: '8px 16px',
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  avatarDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    display: 'inline-block',
  },
  psychologistNameText: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0F172A',
  },
  psychologistRoleText: {
    fontSize: '11px',
    color: '#64748B',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  kpiLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748B',
    marginBottom: '10px',
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    marginBottom: '6px',
  },
  kpiNumberOrange: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#EA580C',
    lineHeight: 1,
  },
  kpiNumberGreen: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#16A34A',
    lineHeight: 1,
  },
  kpiNumberBlue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#2563EB',
    lineHeight: 1,
  },
  kpiSubLabel: {
    fontSize: '13px',
    color: '#64748B',
  },
  kpiFootnote: {
    fontSize: '12px',
    color: '#94A3B8',
  },
  tabSection: {
    marginBottom: '16px',
  },
  tabButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    borderColor: '#2563EB',
    fontWeight: 600,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '24px',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  emptyIcon: {
    fontSize: '36px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#0F172A',
    margin: '0 0 6px 0',
  },
  emptyText: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  appointmentItem: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '18px',
    backgroundColor: '#FAFAFC',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  itemMainRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
  },
  clientInfo: {
    flex: '1 1 260px',
  },
  pseudonymRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  pseudonymBadge: {
    fontSize: '12px',
    color: '#64748B',
  },
  pseudonymTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1E293B',
  },
  demoSmallTag: {
    fontSize: '10px',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 600,
  },
  topicText: {
    fontSize: '13px',
    color: '#334155',
    marginBottom: '8px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  formatTag: {
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  createdDate: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  meetingTimeBox: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '10px 14px',
    minWidth: '160px',
  },
  meetingTimeLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    marginBottom: '4px',
  },
  meetingDateText: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1E293B',
    marginBottom: '2px',
  },
  meetingHourText: {
    fontSize: '12px',
    color: '#2563EB',
    fontWeight: 600,
  },
  statusCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '170px',
  },
  statusRowItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  statusLabelSmall: {
    fontSize: '11px',
    color: '#64748B',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  statusBadgeAccepted: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  statusBadgeDeclined: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  consentGivenBadge: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  consentRefusedBadge: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #E2E8F0',
  },
  privacyNoteSmall: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  btnRow: {
    display: 'flex',
    gap: '8px',
  },
  acceptBtn: {
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    border: 'none',
    padding: '7px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  declineBtn: {
    backgroundColor: '#FFFFFF',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
    padding: '7px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  accessDeniedContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: '24px',
  },
  accessDeniedCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #FCA5A5',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '480px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  accessDeniedIcon: {
    fontSize: '44px',
    marginBottom: '16px',
  },
  accessDeniedTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#991B1B',
    margin: '0 0 10px 0',
  },
  accessDeniedText: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.5,
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  footerText: {
    fontSize: '12px',
    color: '#94A3B8',
    margin: 0,
  },
};

export default PsychologistDashboard;
