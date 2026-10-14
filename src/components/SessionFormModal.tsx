import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, BookOpen, FileText } from 'lucide-react';
import { StudySession, Subject } from '../types';
import { useI18n } from '../i18n';
import { getTodayDateString } from '../lib/storage';
import { MaskingTapeStrip } from './illustrations/PunkStickers';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<StudySession, 'id' | 'createdAt'>, existingId?: string) => void;
  subjects: Subject[];
  onOpenSubjectManager: () => void;
  editingSession?: StudySession | null;
  theme?: 'dark' | 'light';
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  onOpenSubjectManager,
  editingSession,
  theme = 'dark',
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [hoursInput, setHoursInput] = useState<number>(0);
  const [minutesInput, setMinutesInput] = useState<number>(45);
  const [date, setDate] = useState<string>(getTodayDateString());
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingSession) {
      setSubjectId(editingSession.subjectId);
      setDurationMinutes(editingSession.durationMinutes);
      setHoursInput(Math.floor(editingSession.durationMinutes / 60));
      setMinutesInput(editingSession.durationMinutes % 60);
      setDate(editingSession.date);
      setTopic(editingSession.topic || '');
      setNotes(editingSession.notes || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setDurationMinutes(45);
      setHoursInput(0);
      setMinutesInput(45);
      setDate(getTodayDateString());
      setTopic('');
      setNotes('');
    }
  }, [editingSession, isOpen, subjects]);

  if (!isOpen) return null;

  const handleShortcutClick = (mins: number) => {
    setDurationMinutes(mins);
    setHoursInput(Math.floor(mins / 60));
    setMinutesInput(mins % 60);
  };

  const handleManualDurationChange = (h: number, m: number) => {
    const total = Math.max(1, h * 60 + m);
    setHoursInput(h);
    setMinutesInput(m);
    setDurationMinutes(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    onSave(
      {
        subjectId,
        durationMinutes: Math.max(1, durationMinutes),
        date,
        topic: topic.trim() || undefined,
        notes: notes.trim() || undefined,
        fromPomodoro: false,
      },
      editingSession ? editingSession.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg p-6 sm:p-8 border-3 border-black shadow-[6px_6px_0px_#000000] relative ${
          isDark
            ? 'bg-[#15181D] text-[#F5F2EB]'
            : 'bg-[#FFFFFF] text-[#111317]'
        }`}
      >
        <div className="absolute -top-3 left-8">
          <MaskingTapeStrip width="w-24" rotation={-3} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <h3 className="text-2xl font-black font-stencil uppercase tracking-wider">
            {editingSession ? t('sessions.update') : t('sessions.quickLog')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black punk-btn bg-[#DC2626] text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 font-sans-body">
          {/* Subject Picker with inline link to manage subjects */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="session-subject-select"
                className="text-xs font-bold font-stencil uppercase tracking-wider flex items-center gap-1.5 opacity-80"
              >
                <BookOpen size={14} />
                {t('sessions.subject')}
              </label>
              <button
                type="button"
                onClick={onOpenSubjectManager}
                className="text-xs text-[#DC2626] hover:underline font-bold font-stencil uppercase tracking-wider"
              >
                + {t('subjects.addNew')}
              </button>
            </div>
            <select
              id="session-subject-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={`w-full text-xs font-bold font-stencil tracking-wider uppercase px-3.5 py-2.5 border-2 border-black transition-colors ${
                isDark ? 'bg-[#0B0C0E] text-[#F5F2EB]' : 'bg-[#F3EFE6] text-[#111317]'
              }`}
            >
              {subjects
                .filter((s) => !s.archived || s.id === subjectId)
                .map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name} {subj.archived ? `(${t('subjects.archived')})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Duration shortcuts & manual inputs */}
          <div>
            <label className="text-xs font-bold font-stencil uppercase tracking-wider flex items-center gap-1.5 opacity-80 mb-1.5">
              <Clock size={14} />
              {t('sessions.duration')}: {durationMinutes} min
            </label>

            {/* Quick shortcuts */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2.5">
              {[
                { mins: 25, label: t('sessions.shortcuts.25m') },
                { mins: 45, label: t('sessions.shortcuts.45m') },
                { mins: 60, label: t('sessions.shortcuts.1h') },
                { mins: 90, label: t('sessions.shortcuts.1h30') },
                { mins: 120, label: t('sessions.shortcuts.2h') },
                { mins: 180, label: t('sessions.shortcuts.3h') },
              ].map((sc) => (
                <button
                  key={sc.mins}
                  type="button"
                  onClick={() => handleShortcutClick(sc.mins)}
                  className={`py-1.5 px-2 font-stencil text-xs font-black uppercase tracking-wider border-2 border-black transition-all punk-btn ${
                    durationMinutes === sc.mins
                      ? 'bg-[#DC2626] text-white'
                      : isDark
                      ? 'bg-[#0B0C0E] text-[#A2A9B5]'
                      : 'bg-[#F3EFE6] text-black'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {/* Manual hours & minutes inputs */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="16"
                  value={hoursInput}
                  onChange={(e) => handleManualDurationChange(Number(e.target.value), minutesInput)}
                  className={`w-full text-xs font-bold px-3 py-2 border-2 border-black ${
                    isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
                  }`}
                  placeholder="Horas"
                />
                <span className="text-[10px] font-stencil uppercase tracking-wider opacity-60 ml-1">{t('sessions.hours')}</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutesInput}
                  onChange={(e) => handleManualDurationChange(hoursInput, Number(e.target.value))}
                  className={`w-full text-xs font-bold px-3 py-2 border-2 border-black ${
                    isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
                  }`}
                  placeholder="Minutos"
                />
                <span className="text-[10px] font-stencil uppercase tracking-wider opacity-60 ml-1">{t('sessions.minutes')}</span>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label
              htmlFor="session-date-input"
              className="text-xs font-bold font-stencil uppercase tracking-wider flex items-center gap-1.5 opacity-80 mb-1.5"
            >
              <Calendar size={14} />
              {t('sessions.date')}
            </label>
            <input
              id="session-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full text-xs font-bold px-3.5 py-2.5 border-2 border-black ${
                isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
              }`}
            />
          </div>

          {/* Topic & Notes */}
          <div>
            <label
              htmlFor="session-topic-input"
              className="text-xs font-bold font-stencil uppercase tracking-wider flex items-center gap-1.5 opacity-80 mb-1.5"
            >
              <FileText size={14} />
              {t('sessions.topic')}
            </label>
            <input
              id="session-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: Resolução dos 15 problemas sem gabarito"
              className={`w-full text-xs px-3.5 py-2.5 border-2 border-black ${
                isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="session-notes-input"
              className="text-xs font-bold font-stencil uppercase tracking-wider opacity-80 mb-1.5 block"
            >
              {t('sessions.notes')}
            </label>
            <textarea
              id="session-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ideias principais, dúvidas que surgiram..."
              className={`w-full text-xs px-3.5 py-2 border-2 border-black resize-none ${
                isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
              }`}
            />
          </div>

          {/* Submit */}
          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-stencil uppercase tracking-wider font-bold hover:underline"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#DC2626] text-white text-xs font-stencil font-black uppercase tracking-wider border-2 border-black punk-btn"
            >
              {editingSession ? t('sessions.update') : t('sessions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
