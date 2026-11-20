import React, { useState, useMemo, useEffect } from 'react';

// ============================================================================
// DOPAMINE — Әкімшілік панелі (AdminDashboard)
// Тіл: Қазақша | Тек жиынтық «Демо-деректер» | Құпиялылықты сақтау саясаты
// ============================================================================

export type PeriodType = '7days' | '14days' | '30days';

export interface DailyMoodPoint {
  date: string;
  dayName: string;
  score: number; // 1-ден 5-ке дейінгі шкала (1 - өте төмен, 5 - өте жоғары)
  uniqueParticipants: number;
  dominantMood: string;
}

export interface GroupSummary {
  id: string;
  groupName: string;
  totalMembers: number;
  activeParticipants: number;
  averageScore: number | null; // Топ тым шағын болса ( < MIN_GROUP_SIZE ), жасырылады
  status: 'жақсы' | 'қалыпты' | 'назар_аудару' | 'құпиялылық_шектеуі';
  trend: 'өсуде' | 'тұрақты' | 'төмендеуде' | 'дерек_жоқ';
}

// Құпиялылықты қамтамасыз ету шегі:
// Қатысушылардың жеке жазбаларын қорғау үшін 15 адамнан кем топтарға жиынтық балл көрсетілмейді.
export const MIN_GROUP_SIZE_THRESHOLD = 15;

// ============================================================================
// Вымышленные демо-деректер (Күндер бойынша 1-5 шкаласында)
// ============================================================================

const DEMO_7_DAYS: DailyMoodPoint[] = [
  { date: '14.11', dayName: 'Дүйсенбі', score: 3.6, uniqueParticipants: 120, dominantMood: 'Сабырлы' },
  { date: '15.11', dayName: 'Сейсенбі', score: 3.9, uniqueParticipants: 134, dominantMood: 'Көтеріңкі' },
  { date: '16.11', dayName: 'Сәрсенбі', score: 3.2, uniqueParticipants: 115, dominantMood: 'Шаршаңқы' },
  { date: '17.11', dayName: 'Бейсенбі', score: 4.1, uniqueParticipants: 145, dominantMood: 'Шабытты' },
  { date: '18.11', dayName: 'Жұма', score: 4.5, uniqueParticipants: 150, dominantMood: 'Қуанышты' },
  { date: '19.11', dayName: 'Сенбі', score: 4.0, uniqueParticipants: 98, dominantMood: 'Демалған' },
  { date: '20.11', dayName: 'Жексенбі', score: 4.2, uniqueParticipants: 88, dominantMood: 'Үйлесімді' },
];

const DEMO_14_DAYS: DailyMoodPoint[] = [
  { date: '07.11', dayName: 'Дүйсенбі', score: 3.5, uniqueParticipants: 118, dominantMood: 'Сабырлы' },
  { date: '08.11', dayName: 'Сейсенбі', score: 3.7, uniqueParticipants: 122, dominantMood: 'Қалыпты' },
  { date: '09.11', dayName: 'Сәрсенбі', score: 3.4, uniqueParticipants: 110, dominantMood: 'Шаршаңқы' },
  { date: '10.11', dayName: 'Бейсенбі', score: 3.8, uniqueParticipants: 130, dominantMood: 'Тұрақты' },
  { date: '11.11', dayName: 'Жұма', score: 4.2, uniqueParticipants: 140, dominantMood: 'Көтеріңкі' },
  { date: '12.11', dayName: 'Сенбі', score: 3.9, uniqueParticipants: 95, dominantMood: 'Демалған' },
  { date: '13.11', dayName: 'Жексенбі', score: 4.0, uniqueParticipants: 90, dominantMood: 'Сабырлы' },
  ...DEMO_7_DAYS,
];

const DEMO_30_DAYS: DailyMoodPoint[] = [
  { date: '22.10', dayName: '22 қазан', score: 3.4, uniqueParticipants: 112, dominantMood: 'Қалыпты' },
  { date: '25.10', dayName: '25 қазан', score: 3.6, uniqueParticipants: 125, dominantMood: 'Сабырлы' },
  { date: '28.10', dayName: '28 қазан', score: 3.8, uniqueParticipants: 130, dominantMood: 'Көтеріңкі' },
  { date: '31.10', dayName: '31 қазан', score: 3.3, uniqueParticipants: 118, dominantMood: 'Шаршаңқы' },
  { date: '03.11', dayName: '3 қараша', score: 3.7, uniqueParticipants: 128, dominantMood: 'Тұрақты' },
  { date: '06.11', dayName: '6 қараша', score: 3.5, uniqueParticipants: 120, dominantMood: 'Қалыпты' },
  ...DEMO_14_DAYS,
];

// Жиынтық бірегей қатысушылар саны (период бойынша қайталанбайтын)
const UNIQUE_PARTICIPANTS_MAP: Record<PeriodType, number> = {
  '7days': 284,
  '14days': 495,
  '30days': 860,
};

// Топтар бойынша жиынтық мәліметтер (Құпиялылық ережесін тексеру үшін)
const DEMO_GROUPS: GroupSummary[] = [
  { id: 'grp-1', groupName: 'Жаратылыстану факультеті (1-2 курс)', totalMembers: 210, activeParticipants: 184, averageScore: 4.2, status: 'жақсы', trend: 'өсуде' },
  { id: 'grp-2', groupName: 'Гуманитарлық бағыт (Жалпы ағым)', totalMembers: 195, activeParticipants: 162, averageScore: 3.8, status: 'қалыпты', trend: 'тұрақты' },
  { id: 'grp-3', groupName: 'IT және Инженерия мектебі', totalMembers: 240, activeParticipants: 205, averageScore: 3.3, status: 'назар_аудару', trend: 'төмендеуде' },
  { id: 'grp-4', groupName: 'Өнер және Дизайн бөлімі', totalMembers: 140, activeParticipants: 118, averageScore: 4.4, status: 'жақсы', trend: 'өсуде' },
  // Шағын топ — Құпиялылық шегінен төмен (қатысушылар саны < 15):
  { id: 'grp-5', groupName: 'Арнайы зерттеу шағын тобы (Пилоттық)', totalMembers: 9, activeParticipants: 7, averageScore: null, status: 'құпиялылық_шектеуі', trend: 'дерек_жоқ' },
];

export const AdminDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('7days');
  const [hoveredPoint, setHoveredPoint] = useState<DailyMoodPoint | null>(null);

  // Браузер қойындысының (вкладкасының) тақырыбын жаңарту
  useEffect(() => {
    document.title = 'DOPAMINE — Әкімшілік кабинеті';
  }, []);

  // Таңдалған периодқа сәйкес деректер
  const chartData = useMemo(() => {
    switch (selectedPeriod) {
      case '14days':
        return DEMO_14_DAYS;
      case '30days':
        return DEMO_30_DAYS;
      case '7days':
      default:
        return DEMO_7_DAYS;
    }
  }, [selectedPeriod]);

  // Бірегей қатысушылар саны (таңдалған кезеңге)
  const totalUniqueParticipants = useMemo(() => {
    return UNIQUE_PARTICIPANTS_MAP[selectedPeriod];
  }, [selectedPeriod]);

  // Таңдалған периодтағы орташа көңіл-күй (1.0 - 5.0)
  const averageMoodScore = useMemo(() => {
    if (chartData.length === 0) return '0.0';
    const sum = chartData.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / chartData.length).toFixed(2);
  }, [chartData]);

  // 1-ден 5-ке дейінгі баған шкаласы бойынша санат атауы
  const moodInterpretation = useMemo(() => {
    const val = parseFloat(averageMoodScore);
    if (val >= 4.0) return { text: 'Жоғары (Көтеріңкі / Үйлесімді)', color: '#16A34A', bg: '#DCFCE7' };
    if (val >= 3.0) return { text: 'Қалыпты (Тұрақты / Сабырлы)', color: '#2563EB', bg: '#DBEAFE' };
    if (val >= 2.0) return { text: 'Назар аудару қажет (Шаршаңқылық)', color: '#D97706', bg: '#FEF3C7' };
    return { text: 'Дағдарысты деңгей (Жедел қолдау қажет)', color: '#DC2626', bg: '#FEE2E2' };
  }, [averageMoodScore]);

  // ==========================================
  // SVG Графиктің геометриялық есептеулері (1-5 шкаласы)
  // ==========================================
  const svgWidth = 720;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;
  const innerWidth = svgWidth - paddingLeft - paddingRight;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const minScale = 1;
  const maxScale = 5;

  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const x = paddingLeft + (index / (chartData.length - 1)) * innerWidth;
      const normalized = (d.score - minScale) / (maxScale - minScale);
      const y = paddingTop + (1 - normalized) * innerHeight;
      return { x, y, data: d };
    });
  }, [chartData, innerWidth, innerHeight]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = paddingTop + innerHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, innerHeight, paddingTop]);

  return (
    <div style={styles.pageContainer}>
      {/* 1. Жоғарғы басты белгі: Демо-деректер */}
      <div style={styles.demoBanner}>
        <div style={styles.demoBadge}>Демо-деректер</div>
        <div style={styles.demoBannerText}>
          Назар аударыңыз! Барлық статистикалық және графикалық көрсеткіштер тек демонстрациялық мақсатта ойдан шығарылған жиынтық мәліметтер болып табылады («Демо-деректер»).
        </div>
      </div>

      {/* 2. Құпиялылық және дербес деректерді қорғау кепілдігі */}
      <div style={styles.privacyBanner}>
        <div style={styles.privacyIcon}>🔒</div>
        <div style={styles.privacyText}>
          <strong>Құпиялылықты сақтау саясаты:</strong> Қатысушылардың жеке күнделік жазбалары мен дербес деректері әкімшілікке ешқашан көрсетілмейді және қатаң құпия сақталады. Статистика жеке тұлғаны анықтауға жол бермеу мақсатында тек <strong>{MIN_GROUP_SIZE_THRESHOLD} немесе одан көп адамнан тұратын ірі топтар</strong> үшін жиынтық түрде ұсынылады.
        </div>
      </div>

      {/* 3. Тақырып және периодты таңдау бөлімі */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>DOPAMINE — Әкімшілік мониторинг кабинеті</h1>
          <p style={styles.pageSubtitle}>
            Ұжым мен топтардың эмоционалдық ахуалын жалпыланған көрсеткіштер арқылы бақылау
          </p>
        </div>

        {/* Кезеңді таңдау түймелері (Период фильтрі) */}
        <div style={styles.periodControl}>
          <span style={styles.periodLabel}>Кезеңді таңдау:</span>
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => setSelectedPeriod('7days')}
              style={{
                ...styles.periodBtn,
                ...(selectedPeriod === '7days' ? styles.periodBtnActive : {}),
              }}
            >
              Соңғы 7 күн
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('14days')}
              style={{
                ...styles.periodBtn,
                ...(selectedPeriod === '14days' ? styles.periodBtnActive : {}),
              }}
            >
              Соңғы 14 күн
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('30days')}
              style={{
                ...styles.periodBtn,
                ...(selectedPeriod === '30days' ? styles.periodBtnActive : {}),
              }}
            >
              Соңғы 30 күн
            </button>
          </div>
        </div>
      </header>

      {/* 4. Негізгі жиынтық көрсеткіштер (KPI) */}
      <section style={styles.kpiGrid}>
        {/* Карточка 1: Орташа көңіл-күй (1-5 шкаласы) */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeaderRow}>
            <span style={styles.kpiTitle}>Орташа көңіл-күй (1–5)</span>
            <span style={styles.demoPill}>Демо</span>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiScoreBig}>{averageMoodScore}</span>
            <span style={styles.kpiScaleText}>/ 5.0 балл</span>
          </div>
          <div style={{ ...styles.moodBadge, backgroundColor: moodInterpretation.bg, color: moodInterpretation.color }}>
            {moodInterpretation.text}
          </div>
        </div>

        {/* Карточка 2: Бірегей қатысушылар саны (таңдалған кезеңге) */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeaderRow}>
            <span style={styles.kpiTitle}>Бірегей қатысушылар саны</span>
            <span style={styles.demoPill}>Демо</span>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumberBig}>{totalUniqueParticipants.toLocaleString()}</span>
            <span style={styles.kpiScaleText}>адам</span>
          </div>
          <p style={styles.kpiDescText}>
            Таңдалған кезеңде кемінде 1 рет көңіл-күй белгілеген жеке қатысушылар
          </p>
        </div>

        {/* Карточка 3: Анонимділік пен қорғау деңгейі */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeaderRow}>
            <span style={styles.kpiTitle}>Құпиялылық қорғанысы</span>
            <span style={styles.safePill}>100% Анонимді</span>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumberBig}>≥ {MIN_GROUP_SIZE_THRESHOLD}</span>
            <span style={styles.kpiScaleText}>шектік мөлшер</span>
          </div>
          <p style={styles.kpiDescText}>
            Жеке жазбалар шифрланған, әкімшілікке жеке деректер көрсетілмейді
          </p>
        </div>
      </section>

      {/* 5. График: Орташа көңіл-күй динамикасы (1-ден 5-ке дейінгі шкала) */}
      <section style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <div style={styles.chartTitleRow}>
              <h2 style={styles.chartHeading}>
                Орташа көңіл-күй динамикасы (1-ден 5-ке дейінгі шкала)
              </h2>
              <span style={styles.demoPill}>Демо-деректер</span>
            </div>
            <p style={styles.chartSubtitle}>
              Күндер бойынша орташа көңіл-күй деңгейі (1 — өте төмен, 3 — қалыпты, 5 — өте жақсы)
            </p>
          </div>

          {hoveredPoint && (
            <div style={styles.activeTooltipBox}>
              <span style={styles.tooltipDay}>{hoveredPoint.dayName} ({hoveredPoint.date}):</span>
              <strong style={styles.tooltipScore}> {hoveredPoint.score} / 5.0</strong>
              <span style={styles.tooltipMood}> — {hoveredPoint.dominantMood} ({hoveredPoint.uniqueParticipants} адам)</span>
            </div>
          )}
        </div>

        {/* SVG сызбасы */}
        <div style={styles.svgWrapper}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={styles.svgElement}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="moodGradient5" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Координаталық тор (1-ден 5-ке дейінгі бүтін баллдар) */}
            {[5, 4, 3, 2, 1].map((level) => {
              const normalized = (level - minScale) / (maxScale - minScale);
              const y = paddingTop + (1 - normalized) * innerHeight;
              return (
                <g key={level}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    fill="#64748B"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {level}.0
                  </text>
                </g>
              );
            })}

            {/* График аумағы */}
            <path d={areaD} fill="url(#moodGradient5)" />

            {/* Негізгі қисық сызық */}
            <path
              d={pathD}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Нүктелер мен дата жазулары */}
            {points.map((pt, i) => {
              const isHovered = hoveredPoint?.date === pt.data.date;
              // 30 күндік көріністе даталар тым тығыз болмас үшін аралатып жазу
              const showDateLabel =
                chartData.length <= 14 || i % 3 === 0 || i === chartData.length - 1;

              return (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 4.5}
                    fill={isHovered ? '#1D4ED8' : '#FFFFFF'}
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease-in-out' }}
                    onMouseEnter={() => setHoveredPoint(pt.data)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {showDateLabel && (
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      fill="#64748B"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {pt.data.date}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Графиктің түсіндірмелері (Легенда) */}
        <div style={styles.chartLegend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#2563EB' }} />
            <span>Орташа көңіл-күй көрсеткіші (1–5)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#16A34A' }} />
            <span>Оңтайлы аймақ (4.0 – 5.0)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#3B82F6' }} />
            <span>Қалыпты аймақ (3.0 – 3.9)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#D97706' }} />
            <span>Назар аударуды қажет ететін деңгей (1.0 – 2.9)</span>
          </div>
        </div>
      </section>

      {/* 6. Ірі топтар бойынша жиынтық статистика және Құпиялылық шегін тексеру */}
      <section style={styles.groupSectionCard}>
        <div style={styles.groupHeaderRow}>
          <div>
            <h3 style={styles.groupHeading}>
              Топтар бойынша жиынтық мониторинг (Тек ірі топтар үшін)
            </h3>
            <p style={styles.groupSubheading}>
              Қатысушылар құпиялылығын қорғау үшін статистика тек кемінде {MIN_GROUP_SIZE_THRESHOLD} адамдық топтарға ғана есептеледі
            </p>
          </div>
          <span style={styles.demoBadgeSmall}>Демо-деректер</span>
        </div>

        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Топ / Ұжым атауы</th>
                <th style={styles.th}>Жалпы қатысушы</th>
                <th style={styles.th}>Белсенді жауап</th>
                <th style={styles.th}>Орташа балл (1–5)</th>
                <th style={styles.th}>Үрдіс</th>
                <th style={styles.th}>Жүйе күйі</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_GROUPS.map((grp) => {
                const isUnderThreshold = grp.totalMembers < MIN_GROUP_SIZE_THRESHOLD;

                return (
                  <tr key={grp.id} style={styles.tr}>
                    <td style={styles.tdName}>
                      {grp.groupName}
                      {isUnderThreshold && (
                        <div style={styles.thresholdWarning}>
                          ⚠️ Қатысушылар саны аз ({grp.totalMembers} &lt; {MIN_GROUP_SIZE_THRESHOLD}). Жеке құпиялылық қорғалған.
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{grp.totalMembers} адам</td>
                    <td style={styles.td}>{grp.activeParticipants} адам</td>
                    <td style={styles.td}>
                      {isUnderThreshold ? (
                        <span style={styles.hiddenScorePill}>Жасырылған (Құпия)</span>
                      ) : (
                        <span style={styles.scorePill}>
                          <strong>{grp.averageScore?.toFixed(1)}</strong> / 5.0
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {grp.trend === 'өсуде' && <span style={styles.trendUp}>↗ Өсуде</span>}
                      {grp.trend === 'тұрақты' && <span style={styles.trendNeutral}>→ Тұрақты</span>}
                      {grp.trend === 'төмендеуде' && <span style={styles.trendDown}>↘ Төмендеуде</span>}
                      {grp.trend === 'дерек_жоқ' && <span style={styles.trendNone}>—</span>}
                    </td>
                    <td style={styles.td}>
                      {grp.status === 'жақсы' && <span style={styles.badgeGood}>Оңтайлы</span>}
                      {grp.status === 'қалыпты' && <span style={styles.badgeNorm}>Қалыпты</span>}
                      {grp.status === 'назар_аудару' && <span style={styles.badgeWarn}>Назар қажет</span>}
                      {grp.status === 'құпиялылық_шектеуі' && (
                        <span style={styles.badgePrivate}>Құпиялылық шегі</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Төменгі ақпараттық колонтитул */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          DOPAMINE Әкімшілік модулі. Барлық мәліметтер тестілеуге арналған <strong>«Демо-деректер»</strong> үлгісі болып табылады.
          Қатысушылардың жеке жазбалары мен күнделіктері ешқашан ашылмайды.
        </p>
      </footer>
    </div>
  );
};

// ============================================================================
// Стилистика (Таза CSS-in-JS, сыртқы кітапханасыз оңай қосылады)
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
    marginBottom: '24px',
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
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
  periodControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  periodLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
  },
  buttonGroup: {
    display: 'flex',
    backgroundColor: '#E2E8F0',
    borderRadius: '8px',
    padding: '3px',
    gap: '2px',
  },
  periodBtn: {
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#475569',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
  },
  periodBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#1D4ED8',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  kpiHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  kpiTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748B',
  },
  demoPill: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '4px',
  },
  safePill: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '10px',
  },
  kpiScoreBig: {
    fontSize: '34px',
    fontWeight: 700,
    color: '#2563EB',
    lineHeight: 1,
  },
  kpiNumberBig: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#0F172A',
    lineHeight: 1,
  },
  kpiScaleText: {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: 500,
  },
  moodBadge: {
    fontSize: '12px',
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: '6px',
    display: 'inline-block',
    alignSelf: 'flex-start',
  },
  kpiDescText: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
    lineHeight: 1.4,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '24px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
  },
  chartTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },
  chartHeading: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#0F172A',
    margin: 0,
  },
  chartSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  activeTooltipBox: {
    backgroundColor: '#EEF2FF',
    border: '1px solid #C7D2FE',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    color: '#1E293B',
  },
  tooltipDay: {
    color: '#475569',
  },
  tooltipScore: {
    color: '#2563EB',
  },
  tooltipMood: {
    color: '#334155',
  },
  svgWrapper: {
    width: '100%',
    overflowX: 'auto',
    marginBottom: '16px',
  },
  svgElement: {
    width: '100%',
    height: '260px',
    display: 'block',
  },
  chartLegend: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    paddingTop: '14px',
    borderTop: '1px solid #F1F5F9',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#64748B',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  groupSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '24px',
  },
  groupHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  groupHeading: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#0F172A',
    margin: '0 0 4px 0',
  },
  groupSubheading: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  demoBadgeSmall: {
    fontSize: '11px',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid #BFDBFE',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  thRow: {
    borderBottom: '2px solid #E2E8F0',
  },
  th: {
    textAlign: 'left',
    padding: '12px 10px',
    color: '#475569',
    fontWeight: 600,
    fontSize: '12px',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  tdName: {
    padding: '14px 10px',
    fontWeight: 600,
    color: '#1E293B',
  },
  td: {
    padding: '14px 10px',
    color: '#475569',
  },
  thresholdWarning: {
    fontSize: '11px',
    color: '#D97706',
    fontWeight: 500,
    marginTop: '4px',
  },
  scorePill: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  hiddenScorePill: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
    padding: '3px 8px',
    borderRadius: '4px',
    fontStyle: 'italic',
    fontSize: '12px',
  },
  trendUp: {
    color: '#16A34A',
    fontWeight: 600,
  },
  trendNeutral: {
    color: '#64748B',
  },
  trendDown: {
    color: '#DC2626',
    fontWeight: 600,
  },
  trendNone: {
    color: '#94A3B8',
  },
  badgeGood: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  badgeNorm: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  badgeWarn: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  badgePrivate: {
    backgroundColor: '#F3E8FF',
    color: '#7E22CE',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
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

export default AdminDashboard;
