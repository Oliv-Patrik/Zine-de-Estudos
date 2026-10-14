import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Undo2,
  Plus,
  Search,
} from 'lucide-react';
import { StudySession, Subject } from '../types';
import { useI18n } from '../i18n';
import { EmptyStateMascot } from './illustrations/EmptyStateMascot';
import { MaskingTapeStrip } from './illustrations/PunkStickers';

interface SessionsListProps {
  sessions: StudySession[];
  subjects: Subject[];
  onEditSession: (session: StudySession) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenNewSessionModal: () => void;
  theme?: 'dark' | 'light';
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  subjects,
  onEditSession,
  onDeleteSession,
  onOpenNewSessionModal,
  theme = 'dark',
}) => {
  const { t, formatDate, formatMinutes } = useI18n();
  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [deletedBackup, setDeletedBackup] = useState<StudySession | null>(null);
  const [undoTimer, setUndoTimer] = useState<any>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sortedSessions.filter((s) => {
      const matchSubj = filterSubject === 'all' || s.subjectId === filterSubject;
      if (!matchSubj) return false;

      if (!searchTerm.trim()) return true;
      const lower = searchTerm.toLowerCase();
      const subjectName = subjectMap.get(s.subjectId)?.name.toLowerCase() || '';
      const topic = (s.topic || '').toLowerCase();
      const notes = (s.notes || '').toLowerCase();
      return subjectName.includes(lower) || topic.includes(lower) || notes.includes(lower);
    });
  }, [sortedSessions, filterSubject, searchTerm, subjectMap]);

  const handleDeleteWithUndo = (session: StudySession) => {
    setDeletedBackup(session);
    onDeleteSession(session.id);

    if (undoTimer) clearTimeout(undoTimer);
    const timer = setTimeout(() => {
      setDeletedBackup(null);
    }, 6000);
    setUndoTimer(timer);
  };

  const handleUndo = () => {
    if (!deletedBackup) return;
    onEditSession(deletedBackup);
    setDeletedBackup(null);
    if (undoTimer) clearTimeout(undoTimer);
  };

  return (
    <section
      id="sessoes"
      className={`border-2 p-6 sm:p-8 relative overflow-hidden transition-all punk-shadow ${
        isDark
          ? 'bg-[#15181D] border-[#2E343D] text-[#F5F2EB]'
          : 'bg-[#FFFFFF] border-[#000000] text-[#111317]'
      }`}
    >
      <div className="absolute -top-2 left-16">
        <MaskingTapeStrip width="w-24" rotation={-3} />
      </div>

      {/* Toast Banner for Undo */}
      {deletedBackup && (
        <div className="mb-6 p-3.5 bg-[#DC2626] text-white border-2 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-between">
          <span className="text-xs font-bold font-stencil uppercase tracking-wider">
            {t('sessions.sessionDeleted')}
          </span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-1 bg-black text-white border border-white text-xs font-stencil uppercase tracking-wider hover:bg-neutral-900 transition-colors"
          >
            <Undo2 size={13} />
            <span>{t('sessions.undo')}</span>
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-3xl sm:text-4xl font-black font-stencil uppercase tracking-wider">
            {t('sessions.title')}{' '}
            <span className="text-[#DC2626] font-marker lowercase tracking-normal">
              {t('sessions.titleEmphasis')}
            </span>
          </h3>
          <p className={`text-xs mt-0.5 font-stencil uppercase tracking-wider ${isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'}`}>
            {sessions.length} sessões registradas no zine
          </p>
        </div>

        <button
          onClick={onOpenNewSessionModal}
          className="px-4 py-2 bg-[#DC2626] text-white text-xs font-bold font-stencil tracking-wider uppercase border-2 border-black punk-btn flex items-center gap-2 shrink-0"
        >
          <Plus size={15} strokeWidth={3} />
          <span>{t('sessions.quickLog')}</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tópico, anotação ou disciplina..."
            className={`w-full text-xs rounded-none pl-9 pr-3.5 py-2.5 border-2 border-black transition-colors ${
              isDark
                ? 'bg-[#0B0C0E] text-[#F5F2EB] placeholder-[#68707E]'
                : 'bg-[#F3EFE6] text-[#111317] placeholder-[#A2A9B5]'
            }`}
          />
        </div>

        {/* Subject Filter */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className={`text-xs font-bold font-stencil uppercase tracking-wider px-3.5 py-2.5 border-2 border-black transition-colors shrink-0 ${
            isDark
              ? 'bg-[#0B0C0E] text-[#F5F2EB]'
              : 'bg-[#F3EFE6] text-[#111317]'
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

      {/* Empty State */}
      {filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <EmptyStateMascot theme={isDark ? 'dark' : 'light'} />
          <h4 className="mt-4 font-black font-stencil uppercase text-base tracking-wider">
            {t('sessions.noSessions')}
          </h4>
          <p className={`text-xs mt-1 max-w-sm font-sans-body ${isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'}`}>
            {t('sessions.startFirstSession')}
          </p>
          <button
            onClick={onOpenNewSessionModal}
            className="mt-4 px-4 py-2 bg-[#DC2626] text-white text-xs font-bold font-stencil uppercase tracking-wider border-2 border-black punk-btn"
          >
            {t('sessions.quickLog')}
          </button>
        </div>
      ) : (
        /* Sessions Table / Cards as pasted clippings with hard shadow */
        <div className="flex flex-col gap-2.5">
          {filteredSessions.slice(0, 50).map((session, sIdx) => {
            const subject = subjectMap.get(session.subjectId);
            // Slight rotation variation (±0.5 deg) for pasted flyer effect
            const rotation = (sIdx % 3 - 1) * 0.4;

            return (
              <div
                key={session.id}
                style={{ transform: `rotate(${rotation}deg)` }}
                className={`p-4 border-2 border-black transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group punk-shadow-sm ${
                  isDark
                    ? 'bg-[#0B0C0E] hover:border-[#DC2626]'
                    : 'bg-[#F3EFE6] hover:border-[#DC2626]'
                }`}
              >
                {/* Left: Subject Color & Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className="w-3.5 h-3.5 border border-black mt-1 shrink-0"
                    style={{ backgroundColor: subject?.color || '#DC2626' }}
                    title={subject?.name}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider font-stencil">
                        {subject?.name || 'Disciplina'}
                      </span>
                      {session.fromPomodoro && (
                        <span className="text-[10px] px-1.5 py-0.2 border border-[#DC2626] text-[#DC2626] font-bold font-stencil uppercase tracking-wider">
                          Pomodoro
                        </span>
                      )}
                    </div>

                    {session.topic && (
                      <p className="text-xs font-semibold mt-0.5 truncate text-slate-200 dark:text-slate-200 font-sans-body">
                        {session.topic}
                      </p>
                    )}

                    {session.notes && (
                      <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1 italic font-marker">
                        &ldquo;{session.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Date, Duration, Actions */}
                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 text-xs">
                  <div className="flex items-center gap-1.5 opacity-80 font-stencil uppercase tracking-wider text-xs">
                    <Calendar size={13} />
                    <span>{formatDate(session.date)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold font-timer-mono text-[#DC2626]">
                    <Clock size={13} />
                    <span>{formatMinutes(session.durationMinutes)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditSession(session)}
                      className="p-1.5 border border-transparent hover:border-black hover:bg-black/20 text-[#A2A9B5] hover:text-white transition-colors"
                      title={t('sessions.edit')}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteWithUndo(session)}
                      className="p-1.5 border border-transparent hover:border-black hover:bg-red-500/20 text-[#A2A9B5] hover:text-[#DC2626] transition-colors"
                      title={t('sessions.delete')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
