import React, { useState, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from 'lucide-react';
import { StudySession, Subject } from '../types';
import { useI18n } from '../i18n';
import { exportSessionsToCsv } from '../lib/csvExport';
import { StickerTag, StarburstStar } from './illustrations/Stickers';

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
  const [periodOffset, setPeriodOffset] = useState<number>(0); // 0 = current, -1 = previous, etc.
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [hoveredHeatmapDay, setHoveredHeatmapDay] = useState<{
    date: string;
    minutes: number;
    sessionsCount: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Map of subject id to Subject
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Daily totals map
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

  // Calculate streaks & total metrics
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

    // Streak calculation
    let maxStreak = 0;
    let tempStreak = 0;

    // Check consecutive days
    const dateSet = new Set(dates);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Current streak: count backwards from today or yesterday
    let curr = 0;
    let checkDate = dateSet.has(todayStr) ? today : dateSet.has(yesterdayStr) ? yesterday : null;

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

    // Longest streak
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

  // Compute Bars for Weekly, Monthly, or Yearly
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
      // 7 days of the selected week
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + periodOffset * 7);

      // Start from Monday
      const dayOfWeek = targetDate.getDay(); // 0 is Sunday
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
                color: subj?.color || '#4A7A96',
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
      // Days of the selected month
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
                color: subj?.color || '#4A7A96',
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
      // Yearly: 12 months
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
            color: subj?.color || '#4A7A96',
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

  // Statistics for the active period view
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

  // Calculate annual heatmap 52 weeks grid (Sunday to Saturday or Monday to Sunday)
  const heatmapGrid = useMemo(() => {
    const today = new Date();
    // 52 weeks = 364 days
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

  // Max value for bar chart height scaling
  const maxBarValue = Math.max(60, ...chartData.map((b) => b.total));

  return (
    <section id="constancia" className="flex flex-col gap-8">
      {/* 1. Summary Strip of Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div
          className={`rounded-2xl p-5 border relative overflow-hidden transition-all ${
            isDark ? 'bg-[#181F26] border-[#2A3744]' : 'bg-white border-[#D6E0EA]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0E7490] font-display">
            <span>{t('analytics.currentStreak')}</span>
            <Flame size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#0E7490] tabular-nums">
              {currentStreak}
            </span>
            <span className={`text-xs font-semibold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              {t('stickers.streak')}
            </span>
          </div>
        </div>

        {/* Longest Streak */}
        <div
          className={`rounded-2xl p-5 border transition-all ${
            isDark ? 'bg-[#181F26] border-[#2A3744]' : 'bg-white border-[#D6E0EA]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#4A7A96] font-display">
            <span>{t('analytics.bestStreak')}</span>
            <Trophy size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#4A7A96] tabular-nums">
              {bestStreak}
            </span>
            <span className={`text-xs font-semibold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              dias
            </span>
          </div>
        </div>

        {/* Total Time */}
        <div
          className={`rounded-2xl p-5 border transition-all ${
            isDark ? 'bg-[#181F26] border-[#2A3744]' : 'bg-white border-[#D6E0EA]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6B6D8F] font-display">
            <span>{t('analytics.totalTime')}</span>
            <Clock size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black font-display tracking-tight tabular-nums">
              {formatMinutes(totalAccumulatedMinutes)}
            </span>
          </div>
        </div>

        {/* Active Days */}
        <div
          className={`rounded-2xl p-5 border transition-all ${
            isDark ? 'bg-[#181F26] border-[#2A3744]' : 'bg-white border-[#D6E0EA]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#4E7A74] font-display">
            <span>{t('analytics.activeDays')}</span>
            <CalendarDays size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#4E7A74] tabular-nums">
              {activeDaysCount}
            </span>
            <span className={`text-xs font-semibold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              dias
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Stacked Bar Chart & Navigation Controls */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isDark ? 'bg-[#181F26] border-[#2A3744]' : 'bg-white border-[#D6E0EA]'
        }`}
      >
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-extrabold font-display uppercase tracking-tight">
              {t('analytics.title')}{' '}
              <span className="font-serif-italic font-normal lowercase tracking-normal text-[#0E7490]">
                {t('analytics.titleEmphasis')}
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Switcher */}
            <div
              className={`p-1 rounded-xl text-xs font-bold flex items-center ${
                isDark ? 'bg-[#12161B]' : 'bg-[#F1F5F9]'
              }`}
            >
              {(['weekly', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setPeriodOffset(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    period === p
                      ? 'bg-[#0E7490] text-white shadow-sm'
                      : isDark
                      ? 'text-[#94A3B8] hover:text-white'
                      : 'text-[#64748B] hover:text-[#0F172A]'
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

            {/* Navigation (Prev / Next / Today) */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl text-xs ${
                isDark ? 'bg-[#12161B]' : 'bg-[#F1F5F9]'
              }`}
            >
              <button
                onClick={() => setPeriodOffset((o) => o - 1)}
                className="p-1.5 rounded hover:bg-slate-700/30 transition-colors"
                title={t('analytics.previous')}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPeriodOffset(0)}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  periodOffset === 0 ? 'text-[#0E7490]' : 'opacity-80'
                }`}
              >
                {t('analytics.today')}
              </button>
              <button
                onClick={() => setPeriodOffset((o) => o + 1)}
                disabled={periodOffset >= 0}
                className="p-1.5 rounded hover:bg-slate-700/30 disabled:opacity-30 transition-colors"
                title={t('analytics.next')}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className={`text-xs font-medium rounded-xl px-3 py-2 border transition-colors ${
                  isDark
                    ? 'bg-[#12161B] text-[#F1F5F9] border-[#2A3744]'
                    : 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1]'
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

            {/* CSV Export */}
            <button
              onClick={() => exportSessionsToCsv(sessions, subjects, language)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-[#1A222B] text-[#94A3B8] border-[#2E3C4B] hover:text-white hover:bg-[#253240]'
                  : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A]'
              }`}
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Stacked Bars Graphic Area */}
        <div className="relative w-full h-64 sm:h-72 flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 border-b border-[#2A3744]/40">
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
                {/* Floating Tooltip */}
                {isHovered && bar.total > 0 && (
                  <div
                    className={`absolute bottom-full mb-2 z-30 px-3 py-2 rounded-xl text-xs shadow-xl border whitespace-nowrap pointer-events-none ${
                      isDark
                        ? 'bg-[#12161B] text-white border-[#2A3744]'
                        : 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{bar.label}</span>
                      {bar.sublabel && <span className="opacity-70">({bar.sublabel})</span>}
                      <span>·</span>
                      <span className="text-[#0E7490]">{formatMinutes(bar.total)}</span>
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 text-[11px] opacity-90">
                      {bar.segments.map((seg, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                          <span className="truncate max-w-[120px]">{seg.name}:</span>
                          <span className="font-semibold tabular-nums">{formatMinutes(seg.minutes)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stacked Bar Container */}
                <div
                  className="w-full max-w-[42px] flex flex-col-reverse rounded-t-lg overflow-hidden transition-all duration-300"
                  style={{
                    height: `${Math.max(4, heightPercent)}%`,
                    backgroundColor: bar.total === 0 ? (isDark ? '#222B35' : '#E2E8F0') : 'transparent',
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
                        className="w-full transition-opacity group-hover:opacity-90"
                      />
                    );
                  })}
                </div>

                {/* Bar Labels below */}
                <div className="mt-2 text-center select-none">
                  <span
                    className={`text-[10px] sm:text-xs font-semibold block ${
                      isHovered
                        ? 'text-[#0E7490]'
                        : isDark
                        ? 'text-[#94A3B8]'
                        : 'text-[#64748B]'
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-2">
          <div>
            <span className={`text-[11px] uppercase tracking-wider font-semibold block ${isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
              {t('analytics.totalInPeriod')}
            </span>
            <span className="text-lg font-bold font-display mt-0.5 block tabular-nums">
              {formatMinutes(periodStats.totalMinutes)}
            </span>
          </div>

          <div>
            <span className={`text-[11px] uppercase tracking-wider font-semibold block ${isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
              {t('analytics.dailyAverage')}
            </span>
            <span className="text-lg font-bold font-display mt-0.5 block tabular-nums">
              {formatMinutes(periodStats.dailyAverage)}
            </span>
          </div>

          <div>
            <span className={`text-[11px] uppercase tracking-wider font-semibold block ${isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
              {t('analytics.topSubject')}
            </span>
            <span className="text-lg font-bold font-display mt-0.5 block truncate text-[#0E7490]">
              {periodStats.topSubject}
            </span>
          </div>

          <div>
            <span className={`text-[11px] uppercase tracking-wider font-semibold block ${isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
              {t('analytics.consistencyRate')}
            </span>
            <span className="text-lg font-bold font-display mt-0.5 block tabular-nums text-[#4E7A74]">
              {periodStats.consistencyRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. 52-Week Annual Heatmap (Calendário de Contribuições) */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isDark ? 'bg-[#181F26] border-[#2A3744]' : 'bg-white border-[#D6E0EA]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h4 className="text-lg font-bold font-display uppercase tracking-tight">
              {t('analytics.heatmapTitle')}
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              {t('analytics.heatmapSubtitle')}
            </p>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-1.5 text-xs text-[#8A99AD]">
            <span>{t('analytics.less')}</span>
            <div className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${isDark ? 'bg-[#222C37]' : 'bg-[#E2E8F0]'}`} />
              <span className="w-3 h-3 rounded-sm bg-[#164E63]" />
              <span className="w-3 h-3 rounded-sm bg-[#0E7490]" />
              <span className="w-3 h-3 rounded-sm bg-[#0891B2]" />
              <span className="w-3 h-3 rounded-sm bg-[#38BDF8]" />
            </div>
            <span>{t('analytics.more')}</span>
          </div>
        </div>

        {/* Heatmap Grid Container (Scrollable horizontally on mobile) */}
        <div className="overflow-x-auto pb-3">
          <div className="inline-flex gap-1.5 min-w-[720px]">
            {heatmapGrid.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => {
                  let bg = isDark ? '#222C37' : '#E2E8F0';
                  if (day.level === 1) bg = '#164E63';
                  else if (day.level === 2) bg = '#0E7490';
                  else if (day.level === 3) bg = '#0891B2';
                  else if (day.level === 4) bg = '#38BDF8';

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
                      className="w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer"
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
            className={`fixed z-50 px-2.5 py-1.5 rounded-lg text-xs shadow-xl border pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 ${
              isDark
                ? 'bg-[#12161B] text-white border-[#2A3744]'
                : 'bg-white text-[#0F172A] border-[#CBD5E1]'
            }`}
            style={{ left: hoveredHeatmapDay.x, top: hoveredHeatmapDay.y - 6 }}
          >
            <div className="font-bold">{formatDate(hoveredHeatmapDay.date)}</div>
            <div className="text-[11px] opacity-80">
              {hoveredHeatmapDay.minutes > 0
                ? `${hoveredHeatmapDay.minutes} min · ${hoveredHeatmapDay.sessionsCount} sessão(ões)`
                : 'Nenhum estudo registrado neste dia'}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
