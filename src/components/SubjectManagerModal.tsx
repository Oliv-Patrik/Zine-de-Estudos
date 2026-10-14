import React, { useState } from 'react';
import { X, Plus, Archive, RotateCcw, Check } from 'lucide-react';
import { Subject } from '../types';
import { PUNK_PALETTE } from '../constants/palette';
import { useI18n } from '../i18n';
import { MaskingTapeStrip } from './illustrations/PunkStickers';

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
  const [newColor, setNewColor] = useState(PUNK_PALETTE.subjectColors[0].hex);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg p-6 sm:p-8 border-3 border-black shadow-[6px_6px_0px_#000000] relative max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#15181D] text-[#F5F2EB]'
            : 'bg-[#FFFFFF] text-[#111317]'
        }`}
      >
        <div className="absolute -top-3 left-10">
          <MaskingTapeStrip width="w-24" rotation={3} />
        </div>

        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <h3 className="text-2xl font-black font-stencil uppercase tracking-wider">
            {t('subjects.manage')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black punk-btn bg-[#DC2626] text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add New Subject Form */}
        <form onSubmit={handleCreate} className="mt-5 p-4 border-2 border-dashed border-black flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider font-stencil text-[#DC2626]">
            {t('subjects.addNew')}
          </span>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('subjects.name')}
            className={`w-full text-xs font-semibold px-3.5 py-2.5 border-2 border-black ${
              isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
            }`}
          />

          {/* Color swatches */}
          <div>
            <span className="text-[11px] font-bold font-stencil uppercase tracking-wider opacity-70 block mb-1.5">
              {t('subjects.color')}:
            </span>
            <div className="flex flex-wrap gap-2">
              {PUNK_PALETTE.subjectColors.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setNewColor(c.hex)}
                  className={`w-6 h-6 border-2 border-black transition-transform ${
                    newColor === c.hex ? 'scale-125 border-white shadow-[2px_2px_0px_#000000]' : ''
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
            className="self-end px-4 py-2 bg-[#DC2626] text-white text-xs font-black font-stencil uppercase tracking-wider border-2 border-black punk-btn disabled:opacity-50 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>{t('subjects.save')}</span>
          </button>
        </form>

        {/* Existing Subjects List */}
        <div className="mt-6 flex flex-col gap-2.5 font-sans-body">
          {subjects.map((subj) => {
            const isEditing = editingId === subj.id;

            return (
              <div
                key={subj.id}
                className={`p-3.5 border-2 border-black flex items-center justify-between gap-3 ${
                  subj.archived ? 'opacity-50' : ''
                } ${
                  isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
                }`}
              >
                {isEditing ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border-2 border-black bg-white text-black"
                    />
                    <div className="flex gap-1.5">
                      {PUNK_PALETTE.subjectColors.map((c) => (
                        <button
                          type="button"
                          key={c.hex}
                          onClick={() => setEditColor(c.hex)}
                          className={`w-5 h-5 border-2 border-black ${
                            editColor === c.hex ? 'scale-125 border-white' : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span
                      className="w-3.5 h-3.5 border border-black shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider font-stencil truncate">{subj.name}</span>
                    {subj.archived && (
                      <span className="text-[10px] px-1.5 py-0.5 border border-black text-[#A2A9B5] font-stencil uppercase">
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
                        className="p-1.5 bg-[#DC2626] text-white border border-black"
                        title={t('subjects.save')}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 border border-black"
                        title={t('subjects.cancel')}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(subj)}
                        className="text-xs px-2.5 py-1 font-stencil uppercase tracking-wider font-bold border-2 border-black punk-btn"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onToggleArchiveSubject(subj.id)}
                        className="p-1.5 border-2 border-black punk-btn text-[#A2A9B5] hover:text-[#DC2626]"
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
