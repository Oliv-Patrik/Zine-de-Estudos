import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Undo2,
  Plus,
  BookOpen,
  Search,
} from 'lucide-react';
import { StudySession, Subject } from '../types';
import { useI18n } from '../i18n';
import { EmptyStateMascot } from './illustrations/EmptyStateMascot';

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

  // Sort sessions latest date and createdAt first
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
  }, [sessions]);

  // Filtered by search and subject
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
    // Restore session by calling edit/create logic in parent
    onEditSession(deletedBackup); // will open or re-save
    setDeletedBackup(null);
    if (undoTimer) clearTimeout(undoTimer);
  };

  return (
    <section
      id="sessoes"
      className={`rounded-3xl p-6 sm:p-10 border transition-all relative overflow-hidden ${
        isDark ? 'bg-[#181F26] border-[#2A3744]' : 'bg-white border-[#D6E0EA]'
      }`}
    >
      {/* Toast Banner for Undo */}
      {deletedBackup && (
        <div className="mb-6 p-3.5 rounded-2xl bg-[#0E7490] text-white flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <span className="text-xs font-semibold">{t('sessions.sessionDeleted')}</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#0E7490] rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <Undo2 size={13} />
            <span>{t('sessions.undo')}</span>
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display uppercase tracking-tight">
            {t('sessions.title')}{' '}
            <span className="font-serif-italic font-normal lowercase tracking-normal text-[#0E7490]">
              {t('sessions.titleEmphasis')}
            </span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            {sessions.length} sessões registradas no histórico
          </p>
        </div>

        <button
          onClick={onOpenNewSessionModal}
          className="px-4 py-2.5 rounded-2xl bg-[#0E7490] text-white text-xs font-bold tracking-wide hover:bg-[#0891B2] transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus size={15} />
          <span>{t('sessions.quickLog')}</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tópico, disciplina ou anotação..."
            className={`w-full text-xs rounded-xl pl-9 pr-3.5 py-2.5 border transition-colors ${
              isDark
                ? 'bg-[#12161B] text-[#F1F5F9] border-[#2A3744] placeholder-[#475569]'
                : 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] placeholder-[#94A3B8]'
            }`}
          />
        </div>

        {/* Subject Filter */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className={`text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-colors shrink-0 ${
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

      {/* Empty State */}
      {filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <EmptyStateMascot theme={isDark ? 'dark' : 'light'} />
          <h4 className="mt-4 font-bold font-display uppercase text-sm">
            {t('sessions.noSessions')}
          </h4>
          <p className={`text-xs mt-1 max-w-sm ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            {t('sessions.startFirstSession')}
          </p>
          <button
            onClick={onOpenNewSessionModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-bold hover:bg-[#0891B2]"
          >
            {t('sessions.quickLog')}
          </button>
        </div>
      ) : (
        /* Sessions Table / Cards */
        <div className="flex flex-col gap-2.5">
          {filteredSessions.slice(0, 50).map((session) => {
            const subject = subjectMap.get(session.subjectId);

            return (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                  isDark
                    ? 'bg-[#141A21] border-[#25303D] hover:border-[#384656]'
                    : 'bg-[#FAFCFF] border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                {/* Left: Subject Color & Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: subject?.color || '#4A7A96' }}
                    title={subject?.name}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs font-display">
                        {subject?.name || 'Disciplina'}
                      </span>
                      {session.fromPomodoro && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-[#0E7490]/15 text-[#0E7490]">
                          Pomodoro
                        </span>
                      )}
                    </div>

                    {session.topic && (
                      <p className="text-xs font-medium mt-0.5 truncate text-slate-300 dark:text-slate-200">
                        {session.topic}
                      </p>
                    )}

                    {session.notes && (
                      <p className="text-[11px] opacity-70 mt-0.5 line-clamp-1 italic">
                        &ldquo;{session.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Date, Duration, Actions */}
                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 text-xs">
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Calendar size={13} />
                    <span>{formatDate(session.date)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold font-timer-mono text-[#0E7490]">
                    <Clock size={13} />
                    <span>{formatMinutes(session.durationMinutes)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditSession(session)}
                      className="p-1.5 rounded-lg hover:bg-slate-700/20 text-[#94A3B8] hover:text-white transition-colors"
                      title={t('sessions.edit')}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteWithUndo(session)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#94A3B8] hover:text-red-500 transition-colors"
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
