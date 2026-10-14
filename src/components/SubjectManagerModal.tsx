import React, { useState } from 'react';
import { X, Plus, Archive, RotateCcw, Check } from 'lucide-react';
import { Subject } from '../types';
import { COLD_PALETTE } from '../constants/palette';
import { useI18n } from '../i18n';

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddSubject: (name: string, color: string) => void;
  onUpdateSubject: (id: string, name: string, color: string) => void;
  onToggleArchiveSubject: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onToggleArchiveSubject,
  theme = 'dark',
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLD_PALETTE.subjectColors[0].hex);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddSubject(newName.trim(), newColor);
    setNewName('');
  };

  const startEdit = (subj: Subject) => {
    setEditingId(subj.id);
    setEditName(subj.name);
    setEditColor(subj.color);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateSubject(id, editName.trim(), editColor);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#181F26] text-[#F4F6F8] border-[#2A3744]'
            : 'bg-white text-[#0F172A] border-[#D6E0EA]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2A3744]/40">
          <h3 className="text-xl font-bold font-display uppercase tracking-tight">
            {t('subjects.manage')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add New Subject Form */}
        <form onSubmit={handleCreate} className="mt-5 p-4 rounded-2xl border border-dashed border-[#2A3744]/70 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider font-display text-[#0E7490]">
            {t('subjects.addNew')}
          </span>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('subjects.name')}
            className={`w-full text-xs rounded-xl px-3.5 py-2.5 border ${
              isDark ? 'bg-[#12161B] border-[#2A3744]' : 'bg-[#F8FAFC] border-[#CBD5E1]'
            }`}
          />

          {/* Color swatches */}
          <div>
            <span className="text-[11px] font-semibold opacity-70 block mb-1.5">
              {t('subjects.color')}:
            </span>
            <div className="flex flex-wrap gap-2">
              {COLD_PALETTE.subjectColors.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setNewColor(c.hex)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    newColor === c.hex ? 'scale-125 border-white shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!newName.trim()}
            className="self-end px-4 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-bold hover:bg-[#0891B2] disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>{t('subjects.save')}</span>
          </button>
        </form>

        {/* Existing Subjects List */}
        <div className="mt-6 flex flex-col gap-2.5">
          {subjects.map((subj) => {
            const isEditing = editingId === subj.id;

            return (
              <div
                key={subj.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  subj.archived ? 'opacity-50' : ''
                } ${
                  isDark ? 'bg-[#141A21] border-[#25303D]' : 'bg-[#FAFCFF] border-[#E2E8F0]'
                }`}
              >
                {isEditing ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                        isDark ? 'bg-[#12161B] border-[#2A3744]' : 'bg-white border-[#CBD5E1]'
                      }`}
                    />
                    <div className="flex gap-1.5">
                      {COLD_PALETTE.subjectColors.map((c) => (
                        <button
                          type="button"
                          key={c.hex}
                          onClick={() => setEditColor(c.hex)}
                          className={`w-5 h-5 rounded-full border ${
                            editColor === c.hex ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span className="text-xs font-bold truncate">{subj.name}</span>
                    {subj.archived && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-[#94A3B8]">
                        {t('subjects.archived')}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(subj.id)}
                        className="p-1.5 rounded bg-[#0E7490] text-white hover:bg-[#0891B2]"
                        title={t('subjects.save')}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded hover:bg-slate-700/20"
                        title={t('subjects.cancel')}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(subj)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-600/40 hover:bg-slate-700/20"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onToggleArchiveSubject(subj.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/20 text-[#94A3B8]"
                        title={subj.archived ? t('subjects.unarchive') : t('subjects.archive')}
                      >
                        {subj.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
