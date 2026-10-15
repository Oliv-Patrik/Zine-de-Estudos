import React, { useState, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { StudySession, Subject } from '../types';
import { useI18n } from '../i18n';
import { exportSessionsToCsv } from '../lib/csvExport';
import { FlameBadge, MaskingTapeStrip } from './illustrations/PunkStickers';

interface ConsistencyChartsProps {
  sessions: StudySession[];
  subjects: Subject[];
  theme?: 'dark' | 'light';
}

type PeriodType = 'weekly' | 'monthly' | 'yearly';

export const ConsistencyCharts: React.FC<ConsistencyChartsProps> = ({
  sessions,
  subjects,
  theme = 'dark',
}) => {
  const { t, formatDate, formatMinutes, language } = useI18n();
  const isDark = theme === 'dark';

  const [period, setPeriod] = useState<PeriodType>('weekly');
  const [periodOffset, setPeriodOffset] = useState<number>(0);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [hoveredHeatmapDay, setHoveredHeatmapDay] = useState<{
    date: string;
    minutes: number;
    sessionsCount: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const dailyTotals = useMemo(() => {
    const map = new Map<string, { totalMinutes: number; sessionsCount: number; bySubject: Record<string, number> }>();
    sessions.forEach((s) => {
      const existing = map.get(s.date) || { totalMinutes: 0, sessionsCount: 0, bySubject: {} };
      existing.totalMinutes += s.durationMinutes;
      existing.sessionsCount += 1;
      existing.bySubject[s.subjectId] = (existing.bySubject[s.subjectId] || 0) + s.durationMinutes;
      map.set(s.date, existing);
    });
    return map;
  }, [sessions]);

  const { currentStreak, bestStreak, totalAccumulatedMinutes, activeDaysCount } = useMemo(() => {
    const dates = Array.from(dailyTotals.keys()).sort();
    if (dates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, totalAccumulatedMinutes: 0, activeDaysCount: 0 };
    }

    let totalAccumulatedMinutes = 0;
    dailyTotals.forEach((v) => {
      totalAccumulatedMinutes += v.totalMinutes;
    });

    const activeDaysCount = dailyTotals.size;

    let maxStreak = 0;
    let tempStreak = 0;

    const dateSet = new Set(dates);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let curr = 0;
    const checkDate = dateSet.has(todayStr) ? today : dateSet.has(yesterdayStr) ? yesterday : null;

    if (checkDate) {
      const d = new Date(checkDate);
      while (true) {
        const dStr = d.toISOString().slice(0, 10);
        if (dateSet.has(dStr)) {
          curr++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    }

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(dates[i - 1]);
        const current = new Date(dates[i]);
        const diffDays = Math.round((current.getTime() - prev.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }

    return {
      currentStreak: curr,
      bestStreak: Math.max(maxStreak, curr),
      totalAccumulatedMinutes,
      activeDaysCount,
    };
  }, [dailyTotals]);

  const chartData = useMemo(() => {
    const bars: Array<{
      label: string;
      sublabel?: string;
      total: number;
      dateKey?: string;
      segments: Array<{ subjectId: string; minutes: number; color: string; name: string }>;
    }> = [];

    const now = new Date();

    if (period === 'weekly') {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + periodOffset * 7);

      const dayOfWeek = targetDate.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(targetDate);
      monday.setDate(targetDate.getDate() - diffToMonday);

      const dayNamesPt = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const dayNamesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayLabels = language === 'pt-BR' ? dayNamesPt : dayNamesEn;

      for (let i = 0; i < 7; i++) {
        const cur = new Date(monday);
        cur.setDate(monday.getDate() + i);
        const dateStr = cur.toISOString().slice(0, 10);
        const dayData = dailyTotals.get(dateStr);

        const segments: Array<{ subjectId: string; minutes: number; color: string; name: string }> = [];
        let total = 0;

        if (dayData) {
          Object.entries(dayData.bySubject).forEach(([sId, mins]) => {
            if (selectedSubjectFilter === 'all' || selectedSubjectFilter === sId) {
              const subj = subjectMap.get(sId);
              segments.push({
                subjectId: sId,
                minutes: mins,
                color: subj?.color || '#DC2626',
                name: subj?.name || 'Disciplina',
              });
              total += mins;
            }
          });
        }

        bars.push({
          label: dayLabels[i],
          sublabel: `${cur.getDate()}/${cur.getMonth() + 1}`,
          total,
          dateKey: dateStr,
          segments,
        });
      }
    } else if (period === 'monthly') {
      const target = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
      const year = target.getFullYear();
      const month = target.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = dailyTotals.get(dateStr);

        const segments: Array<{ subjectId: string; minutes: number; color: string; name: string }> = [];
        let total = 0;

        if (dayData) {
          Object.entries(dayData.bySubject).forEach(([sId, mins]) => {
            if (selectedSubjectFilter === 'all' || selectedSubjectFilter === sId) {
              const subj = subjectMap.get(sId);
              segments.push({
                subjectId: sId,
                minutes: mins,
                color: subj?.color || '#DC2626',
                name: subj?.name || 'Disciplina',
              });
              total += mins;
            }
          });
        }

        bars.push({
          label: String(day),
          total,
          dateKey: dateStr,
          segments,
        });
      }
    } else {
      const targetYear = now.getFullYear() + periodOffset;
      const monthNamesPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabels = language === 'pt-BR' ? monthNamesPt : monthNamesEn;

      for (let m = 0; m < 12; m++) {
        const monthPrefix = `${targetYear}-${String(m + 1).padStart(2, '0')}`;
        const subjectAccum: Record<string, number> = {};
        let total = 0;

        sessions.forEach((s) => {
          if (s.date.startsWith(monthPrefix)) {
            if (selectedSubjectFilter === 'all' || selectedSubjectFilter === s.subjectId) {
              subjectAccum[s.subjectId] = (subjectAccum[s.subjectId] || 0) + s.durationMinutes;
              total += s.durationMinutes;
            }
          }
        });

        const segments = Object.entries(subjectAccum).map(([sId, mins]) => {
          const subj = subjectMap.get(sId);
          return {
            subjectId: sId,
            minutes: mins,
            color: subj?.color || '#DC2626',
            name: subj?.name || 'Disciplina',
          };
        });

        bars.push({
          label: monthLabels[m],
          total,
          segments,
        });
      }
    }

    return bars;
  }, [period, periodOffset, selectedSubjectFilter, dailyTotals, sessions, subjectMap, language]);

  // Label for the displayed period (e.g., Weekly "8 – 14 out 2026", Monthly "Outubro 2026", Yearly "2026", or "HOJE" if current)
  const currentPeriodLabel = useMemo(() => {
    const now = new Date();
    if (periodOffset === 0) {
      return language === 'pt-BR' ? 'HOJE' : 'TODAY';
    }

    const shortMonthsPt = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const shortMonthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthsPt = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const fullMonthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (period === 'weekly') {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + periodOffset * 7);
      const dayOfWeek = targetDate.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(targetDate);
      monday.setDate(targetDate.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mMonth = monday.getMonth();
      const sMonth = sunday.getMonth();
      const mYear = monday.getFullYear();
      const sYear = sunday.getFullYear();

      if (language === 'pt-BR') {
        if (mMonth === sMonth && mYear === sYear) {
          return `${monday.getDate()} – ${sunday.getDate()} ${shortMonthsPt[mMonth]} ${mYear}`;
        } else if (mYear === sYear) {
          return `${monday.getDate()} ${shortMonthsPt[mMonth]} – ${sunday.getDate()} ${shortMonthsPt[sMonth]} ${sYear}`;
        } else {
          return `${monday.getDate()} ${shortMonthsPt[mMonth]} ${mYear} – ${sunday.getDate()} ${shortMonthsPt[sMonth]} ${sYear}`;
        }
      } else {
        if (mMonth === sMonth && mYear === sYear) {
          return `${shortMonthsEn[mMonth]} ${monday.getDate()} – ${sunday.getDate()}, ${mYear}`;
        } else if (mYear === sYear) {
          return `${shortMonthsEn[mMonth]} ${monday.getDate()} – ${shortMonthsEn[sMonth]} ${sunday.getDate()}, ${sYear}`;
        } else {
          return `${shortMonthsEn[mMonth]} ${monday.getDate()}, ${mYear} – ${shortMonthsEn[sMonth]} ${sunday.getDate()}, ${sYear}`;
        }
      }
    } else if (period === 'monthly') {
      const target = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
      const monthIdx = target.getMonth();
      const year = target.getFullYear();
      return language === 'pt-BR' ? `${fullMonthsPt[monthIdx]} ${year}` : `${fullMonthsEn[monthIdx]} ${year}`;
    } else {
      const targetYear = now.getFullYear() + periodOffset;
      return `${targetYear}`;
    }
  }, [period, periodOffset, language]);

  // Check if any sessions exist prior to the displayed period
  const hasEarlierSessions = useMemo(() => {
    const activeSessions = sessions.filter((s) => !s.deletedAt);
    if (activeSessions.length === 0) return false;

    const now = new Date();
    let currentPeriodStartDateStr = '';

    if (period === 'weekly') {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + periodOffset * 7);
      const dayOfWeek = targetDate.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(targetDate);
      monday.setDate(targetDate.getDate() - diffToMonday);
      currentPeriodStartDateStr = monday.toISOString().slice(0, 10);
    } else if (period === 'monthly') {
      const target = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
      const year = target.getFullYear();
      const month = String(target.getMonth() + 1).padStart(2, '0');
      currentPeriodStartDateStr = `${year}-${month}-01`;
    } else {
      const targetYear = now.getFullYear() + periodOffset;
      currentPeriodStartDateStr = `${targetYear}-01-01`;
    }

    return activeSessions.some((s) => s.date < currentPeriodStartDateStr);
  }, [sessions, period, periodOffset]);

  const periodStats = useMemo(() => {
    let totalMinutes = 0;
    let activeDays = 0;
    const subjectCounts: Record<string, number> = {};

    chartData.forEach((b) => {
      totalMinutes += b.total;
      if (b.total > 0) activeDays++;
      b.segments.forEach((seg) => {
        subjectCounts[seg.name] = (subjectCounts[seg.name] || 0) + seg.minutes;
      });
    });

    const daysCount = chartData.length || 1;
    const dailyAverage = Math.round(totalMinutes / daysCount);
    const consistencyRate = Math.round((activeDays / daysCount) * 100);

    let topSubject = '—';
    let topMinutes = 0;
    Object.entries(subjectCounts).forEach(([name, mins]) => {
      if (mins > topMinutes) {
        topMinutes = mins;
        topSubject = name;
      }
    });

    return {
      totalMinutes,
      dailyAverage,
      consistencyRate,
      topSubject,
    };
  }, [chartData]);

  const heatmapGrid = useMemo(() => {
    const today = new Date();
    const totalDays = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    const weeks: Array<Array<{ date: string; minutes: number; sessionsCount: number; level: number }>> = [];
    let currentWeek: Array<{ date: string; minutes: number; sessionsCount: number; level: number }> = [];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const data = dailyTotals.get(dateStr);
      const mins = data ? data.totalMinutes : 0;
      const count = data ? data.sessionsCount : 0;

      let level = 0;
      if (mins > 120) level = 4;
      else if (mins > 60) level = 3;
      else if (mins > 30) level = 2;
      else if (mins > 0) level = 1;

      currentWeek.push({
        date: dateStr,
        minutes: mins,
        sessionsCount: count,
        level,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    return weeks;
  }, [dailyTotals]);

  const maxBarValue = Math.max(60, ...chartData.map((b) => b.total));

  return (
    <section id="constancia" className="flex flex-col gap-8">
      {/* 1. Summary Strip of Key Metrics with hard drop shadows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div
          className={`p-5 border-2 border-black relative overflow-hidden punk-shadow ${
            isDark ? 'bg-[#15181D] text-[#F5F2EB]' : 'bg-white text-[#111317]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#DC2626] font-stencil">
            <span>{t('analytics.currentStreak')}</span>
            {currentStreak > 0 ? <FlameBadge size={16} /> : <Flame size={16} />}
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black font-stencil tracking-tight text-[#DC2626] tabular-nums">
              {currentStreak}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider font-stencil ${isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'}`}>
              {t('stickers.streak')}
            </span>
          </div>
        </div>

        {/* Longest Streak */}
        <div
          className={`p-5 border-2 border-black punk-shadow ${
            isDark ? 'bg-[#15181D] text-[#F5F2EB]' : 'bg-white text-[#111317]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#2563EB] font-stencil">
            <span>{t('analytics.bestStreak')}</span>
            <Trophy size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black font-stencil tracking-tight text-[#2563EB] tabular-nums">
              {bestStreak}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider font-stencil ${isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'}`}>
              dias
            </span>
          </div>
        </div>

        {/* Total Time */}
        <div
          className={`p-5 border-2 border-black punk-shadow ${
            isDark ? 'bg-[#15181D] text-[#F5F2EB]' : 'bg-white text-[#111317]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#D97706] font-stencil">
            <span>{t('analytics.totalTime')}</span>
            <Clock size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black font-stencil tracking-tight tabular-nums">
              {formatMinutes(totalAccumulatedMinutes)}
            </span>
          </div>
        </div>

        {/* Active Days */}
        <div
          className={`p-5 border-2 border-black punk-shadow ${
            isDark ? 'bg-[#15181D] text-[#F5F2EB]' : 'bg-white text-[#111317]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#4D7C0F] font-stencil">
            <span>{t('analytics.activeDays')}</span>
            <CalendarDays size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black font-stencil tracking-tight text-[#4D7C0F] tabular-nums">
              {activeDaysCount}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider font-stencil ${isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'}`}>
              dias
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Stacked Bar Chart & Navigation Controls */}
      <div
        className={`border-2 p-6 sm:p-8 relative punk-shadow ${
          isDark
            ? 'bg-[#15181D] border-[#2E343D] text-[#F5F2EB]'
            : 'bg-white border-[#000000] text-[#111317]'
        }`}
      >
        <div className="absolute -top-2 right-12">
          <MaskingTapeStrip width="w-24" rotation={3} />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-black font-stencil uppercase tracking-wider">
              {t('analytics.title')}{' '}
              <span className="text-[#DC2626] font-marker lowercase tracking-normal">
                {t('analytics.titleEmphasis')}
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Switcher */}
            <div
              className={`p-1 border-2 border-black flex items-center ${
                isDark ? 'bg-[#0B0C0E]' : 'bg-[#EAE4D6]'
              }`}
            >
              {(['weekly', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setPeriodOffset(0);
                  }}
                  className={`px-3 py-1 font-stencil text-xs uppercase tracking-wider transition-all ${
                    period === p
                      ? 'bg-[#DC2626] text-white shadow-[2px_2px_0px_#000000]'
                      : isDark
                      ? 'text-[#A2A9B5] hover:text-white'
                      : 'text-[#3C424C] hover:text-black'
                  }`}
                >
                  {p === 'weekly'
                    ? t('analytics.periodWeekly')
                    : p === 'monthly'
                    ? t('analytics.periodMonthly')
                    : t('analytics.periodYearly')}
                </button>
              ))}
            </div>

            {/* Navigation (Prev / Next / Period Label / Today Button) */}
            <div
              tabIndex={0}
              role="region"
              aria-label="Navegação de períodos"
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  if (hasEarlierSessions) {
                    e.preventDefault();
                    setPeriodOffset((o) => o - 1);
                  }
                } else if (e.key === 'ArrowRight') {
                  if (periodOffset < 0) {
                    e.preventDefault();
                    setPeriodOffset((o) => o + 1);
                  }
                }
              }}
              className={`flex items-center gap-1.5 p-1 border-2 border-black outline-none focus:ring-2 focus:ring-[#DC2626] transition-all ${
                isDark ? 'bg-[#0B0C0E]' : 'bg-[#EAE4D6]'
              }`}
            >
              {/* Previous Period Arrow (Left) */}
              <button
                type="button"
                onClick={() => {
                  if (hasEarlierSessions) setPeriodOffset((o) => o - 1);
                }}
                disabled={!hasEarlierSessions}
                aria-disabled={!hasEarlierSessions}
                className={`p-1.5 transition-colors ${
                  !hasEarlierSessions
                    ? 'opacity-30 cursor-not-allowed text-[#717885]'
                    : 'hover:text-[#DC2626] cursor-pointer'
                }`}
                title={!hasEarlierSessions ? t('analytics.noEarlierRecords') : t('analytics.previous')}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Central Period Label */}
              <span
                className={`px-2.5 py-0.5 text-xs font-bold font-stencil uppercase tracking-wider select-none text-center min-w-[70px] ${
                  periodOffset === 0 ? 'text-[#DC2626]' : isDark ? 'text-[#F5F2EB]' : 'text-[#111317]'
                }`}
              >
                {currentPeriodLabel}
              </span>

              {/* Next Period Arrow (Right) */}
              <button
                type="button"
                onClick={() => {
                  if (periodOffset < 0) setPeriodOffset((o) => o + 1);
                }}
                disabled={periodOffset >= 0}
                aria-disabled={periodOffset >= 0}
                className={`p-1.5 transition-colors ${
                  periodOffset >= 0
                    ? 'opacity-30 cursor-not-allowed text-[#717885]'
                    : 'hover:text-[#DC2626] cursor-pointer'
                }`}
                title={periodOffset >= 0 ? t('analytics.noLaterRecords') : t('analytics.next')}
              >
                <ChevronRight size={16} />
              </button>

              {/* "Hoje" Button - visible only outside the current period */}
              {periodOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setPeriodOffset(0)}
                  className="ml-1 px-2.5 py-1 text-xs font-bold font-stencil uppercase tracking-wider bg-[#DC2626] text-white border border-black shadow-[2px_2px_0px_#000000] hover:bg-[#B91C1C] active:translate-y-0.5 transition-all cursor-pointer"
                  title={t('analytics.backToToday')}
                >
                  {t('analytics.backToToday')}
                </button>
              )}
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className={`text-xs font-bold font-stencil uppercase tracking-wider px-3 py-1.5 border-2 border-black transition-colors ${
                  isDark ? 'bg-[#0B0C0E] text-[#F5F2EB]' : 'bg-white text-[#111317]'
                }`}
              >
                <option value="all">{t('analytics.allSubjects')}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CSV Export Button */}
            <button
              onClick={() => exportSessionsToCsv(sessions, subjects, language)}
              className={`px-3 py-1.5 text-xs font-bold font-stencil tracking-wider uppercase border-2 border-black flex items-center gap-1.5 punk-btn ${
                isDark ? 'bg-[#15181D] text-white' : 'bg-white text-black'
              }`}
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Stacked Bars Graphic Area with Screenprint Reticula */}
        <div className="relative w-full h-64 sm:h-72 flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 border-b-2 border-black">
          {chartData.map((bar, index) => {
            const heightPercent = maxBarValue > 0 ? (bar.total / maxBarValue) * 100 : 0;
            const isHovered = hoveredBarIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip in Tape Tag style */}
                {isHovered && bar.total > 0 && (
                  <div
                    className={`absolute bottom-full mb-2 z-30 px-3 py-2 text-xs border-2 border-black shadow-[3px_3px_0px_#000000] whitespace-nowrap pointer-events-none ${
                      isDark ? 'bg-[#0B0C0E] text-white' : 'bg-[#F5EBCB] text-black'
                    }`}
                  >
                    <div className="font-stencil font-black flex items-center gap-1.5 uppercase text-sm">
                      <span>{bar.label}</span>
                      {bar.sublabel && <span className="opacity-70">({bar.sublabel})</span>}
                      <span>·</span>
                      <span className="text-[#DC2626]">{formatMinutes(bar.total)}</span>
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 text-[11px] opacity-90 font-sans-body">
                      {bar.segments.map((seg, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 border border-black" style={{ backgroundColor: seg.color }} />
                          <span className="truncate max-w-[120px] font-semibold">{seg.name}:</span>
                          <span className="font-bold tabular-nums">{formatMinutes(seg.minutes)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stacked Bar Container */}
                <div
                  className="w-full max-w-[42px] flex flex-col-reverse border-2 border-black overflow-hidden transition-all duration-200"
                  style={{
                    height: `${Math.max(4, heightPercent)}%`,
                    backgroundColor: bar.total === 0 ? (isDark ? '#22272F' : '#E5E0D5') : 'transparent',
                  }}
                >
                  {bar.segments.map((seg, sIdx) => {
                    const segmentPercent = bar.total > 0 ? (seg.minutes / bar.total) * 100 : 0;
                    return (
                      <div
                        key={sIdx}
                        style={{
                          height: `${segmentPercent}%`,
                          backgroundColor: seg.color,
                        }}
                        className="w-full transition-opacity group-hover:opacity-90 border-t border-black/40"
                      />
                    );
                  })}
                </div>

                {/* Bar Labels below */}
                <div className="mt-2 text-center select-none font-stencil uppercase tracking-wider">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block ${
                      isHovered
                        ? 'text-[#DC2626]'
                        : isDark
                        ? 'text-[#A2A9B5]'
                        : 'text-[#3C424C]'
                    }`}
                  >
                    {bar.label}
                  </span>
                  {bar.sublabel && (
                    <span className="text-[9px] opacity-60 block -mt-0.5">{bar.sublabel}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Period Statistics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-2 font-stencil uppercase tracking-wider">
          <div>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-[#68707E]' : 'text-[#666F7D]'}`}>
              {t('analytics.totalInPeriod')}
            </span>
            <span className="text-2xl font-black mt-0.5 block tabular-nums">
              {formatMinutes(periodStats.totalMinutes)}
            </span>
          </div>

          <div>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-[#68707E]' : 'text-[#666F7D]'}`}>
              {t('analytics.dailyAverage')}
            </span>
            <span className="text-2xl font-black mt-0.5 block tabular-nums">
              {formatMinutes(periodStats.dailyAverage)}
            </span>
          </div>

          <div>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-[#68707E]' : 'text-[#666F7D]'}`}>
              {t('analytics.topSubject')}
            </span>
            <span className="text-2xl font-black mt-0.5 block truncate text-[#DC2626]">
              {periodStats.topSubject}
            </span>
          </div>

          <div>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-[#68707E]' : 'text-[#666F7D]'}`}>
              {t('analytics.consistencyRate')}
            </span>
            <span className="text-2xl font-black mt-0.5 block tabular-nums text-[#4D7C0F]">
              {periodStats.consistencyRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. 52-Week Annual Heatmap (Carimbos de Constância) */}
      <div
        className={`border-2 p-6 sm:p-8 relative punk-shadow ${
          isDark
            ? 'bg-[#15181D] border-[#2E343D] text-[#F5F2EB]'
            : 'bg-white border-[#000000] text-[#111317]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h4 className="text-xl font-black font-stencil uppercase tracking-wider">
              {t('analytics.heatmapTitle')}
            </h4>
            <p className={`text-xs mt-0.5 font-semibold ${isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'}`}>
              {t('analytics.heatmapSubtitle')}
            </p>
          </div>

          {/* Color Scale Legend in ink stamp squares */}
          <div className="flex items-center gap-1.5 text-xs font-stencil uppercase tracking-wider">
            <span>{t('analytics.less')}</span>
            <div className="flex items-center gap-1">
              <span className={`w-3.5 h-3.5 border border-black ${isDark ? 'bg-[#22272F]' : 'bg-[#E5E0D5]'}`} />
              <span className="w-3.5 h-3.5 border border-black bg-[#991B1B]" />
              <span className="w-3.5 h-3.5 border border-black bg-[#DC2626]" />
              <span className="w-3.5 h-3.5 border border-black bg-[#EF4444]" />
              <span className="w-3.5 h-3.5 border border-black bg-[#F59E0B]" />
            </div>
            <span>{t('analytics.more')}</span>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-3">
          <div className="inline-flex gap-1 min-w-[720px]">
            {heatmapGrid.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => {
                  let bg = isDark ? '#22272F' : '#E5E0D5';
                  if (day.level === 1) bg = '#991B1B';
                  else if (day.level === 2) bg = '#DC2626';
                  else if (day.level === 3) bg = '#EF4444';
                  else if (day.level === 4) bg = '#F59E0B';

                  return (
                    <div
                      key={dIdx}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredHeatmapDay({
                          date: day.date,
                          minutes: day.minutes,
                          sessionsCount: day.sessionsCount,
                          x: rect.x + rect.width / 2,
                          y: rect.y,
                        });
                      }}
                      onMouseLeave={() => setHoveredHeatmapDay(null)}
                      className="w-3.5 h-3.5 border border-black/80 transition-transform hover:scale-125 cursor-pointer"
                      style={{ backgroundColor: bg }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Day Tooltip Portal */}
        {hoveredHeatmapDay && (
          <div
            className={`fixed z-50 px-2.5 py-1.5 border-2 border-black shadow-[3px_3px_0px_#000000] text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 ${
              isDark ? 'bg-[#0B0C0E] text-white' : 'bg-[#F5EBCB] text-black'
            }`}
            style={{ left: hoveredHeatmapDay.x, top: hoveredHeatmapDay.y - 6 }}
          >
            <div className="font-stencil font-black uppercase text-sm">{formatDate(hoveredHeatmapDay.date)}</div>
            <div className="text-[11px] font-sans-body font-semibold">
              {hoveredHeatmapDay.minutes > 0
                ? `${hoveredHeatmapDay.minutes} min · ${hoveredHeatmapDay.sessionsCount} sessão(ões)`
                : 'Dia sem sessões'}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
