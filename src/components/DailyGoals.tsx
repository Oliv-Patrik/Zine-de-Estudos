import React, { useState } from 'react';
import { Plus, Check, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { GoalTask } from '../types';
import { useI18n } from '../i18n';
import { playPunkSound } from '../lib/audio';
import { PunkSticker, FlameBadge, MaskingTapeStrip } from './illustrations/PunkStickers';

interface DailyGoalsProps {
  todayStudiedMinutes: number;
  targetMinutes: number;
  onUpdateTargetMinutes: (minutes: number) => void;
  tasks: GoalTask[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const DailyGoals: React.FC<DailyGoalsProps> = ({
  todayStudiedMinutes,
  targetMinutes,
  onUpdateTargetMinutes,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  theme = 'dark',
}) => {
  const { t } = useI18n();
  const [newTaskText, setNewTaskText] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetMinutes);

  const isDark = theme === 'dark';

  const percentTime = Math.min(100, Math.round((todayStudiedMinutes / (targetMinutes || 1)) * 100));
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const percentTasks = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
  const isGoalReached = percentTime >= 100;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText('');
    playPunkSound('click', 0.2);
  };

  const handleTaskCheck = (task: GoalTask) => {
    onToggleTask(task.id);
    if (!task.completed) {
      playPunkSound('click', 0.2);
    }
  };

  const handleSaveTarget = () => {
    onUpdateTargetMinutes(Math.max(15, tempTarget));
    setIsEditingTarget(false);
  };

  return (
    <section
      id="metas"
      className={`border-2 p-6 sm:p-8 relative overflow-hidden transition-all punk-shadow ${
        isDark
          ? 'bg-[#15181D] text-[#F5F2EB] border-[#2E343D]'
          : 'bg-[#FFFFFF] text-[#111317] border-[#000000]'
      }`}
    >
      {/* Tape on top corner */}
      <div className="absolute -top-2 left-10">
        <MaskingTapeStrip width="w-24" rotation={-2} />
      </div>

      {/* Goal Hit Stamp + Flame Badge (strictly when reached) */}
      {isGoalReached && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <PunkSticker
            text={t('stickers.goalHit')}
            variant="red"
            rotation={4}
            icon={<FlameBadge size={16} />}
          />
        </div>
      )}

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-5xl font-black font-stencil tracking-wider uppercase leading-none">
          {t('goals.title')}{' '}
          <span className="text-[#DC2626] font-marker lowercase tracking-normal">
            {t('goals.titleEmphasis')}
          </span>
        </h2>
        <p
          className={`text-xs mt-1 font-semibold uppercase tracking-wider font-stencil ${
            isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'
          }`}
        >
          {todayStudiedMinutes} min de {targetMinutes} min planejados para hoje
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Daily Target Progress */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className={`p-5 border-2 border-black ${
              isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider font-stencil flex items-center gap-1.5 text-[#DC2626]">
                <Target size={15} />
                {t('goals.dailyTarget')}
              </span>

              {isEditingTarget ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(Number(e.target.value))}
                    className={`w-18 text-xs font-bold px-2 py-1 border-2 border-black text-center ${
                      isDark ? 'bg-[#15181D] text-white' : 'bg-white text-black'
                    }`}
                  />
                  <button
                    onClick={handleSaveTarget}
                    className="text-xs font-bold px-2.5 py-1 bg-[#DC2626] text-white border border-black hover:bg-[#B91C1C]"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempTarget(targetMinutes);
                    setIsEditingTarget(true);
                  }}
                  className="text-xs font-bold font-stencil uppercase tracking-wider hover:underline text-[#DC2626]"
                >
                  {targetMinutes} min ✎
                </button>
              )}
            </div>

            {/* Giant Percentage Counter */}
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-6xl font-black font-stencil tracking-tight text-[#DC2626] tabular-nums">
                {percentTime}%
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider font-stencil ${
                  isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'
                }`}
              >
                {t('goals.completedPercentage', { percent: percentTime })}
              </span>
            </div>

            {/* Screenprint Halftone Progress Bar */}
            <div className="w-full h-4 border-2 border-black bg-black/20 overflow-hidden mt-2">
              <div
                className="h-full bg-[#DC2626] transition-all duration-300 ease-out"
                style={{ width: `${percentTime}%` }}
              />
            </div>

            {/* Quick target presets */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dashed border-[#333A44] text-[11px] font-stencil uppercase tracking-wider">
              <span>Atalhos:</span>
              {[60, 90, 120, 180].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateTargetMinutes(mins)}
                  className={`px-2.5 py-1 font-bold border border-black transition-all punk-btn ${
                    targetMinutes === mins
                      ? 'bg-[#DC2626] text-white'
                      : isDark
                      ? 'bg-[#15181D] text-[#A2A9B5]'
                      : 'bg-white text-black'
                  }`}
                >
                  {mins / 60}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checklist */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider font-stencil text-[#DC2626]">
              {t('goals.checklistTitle')}
            </h3>
            <span
              className={`text-xs font-bold font-stencil tracking-wider uppercase ${
                isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'
              }`}
            >
              {completedTasksCount}/{tasks.length} ({percentTasks}%)
            </span>
          </div>

          {/* Add task input */}
          <form onSubmit={handleCreateTask} className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={t('goals.newTaskPlaceholder')}
              className={`w-full text-xs rounded-none px-3.5 py-2.5 border-2 border-black transition-colors ${
                isDark
                  ? 'bg-[#0B0C0E] text-white placeholder-[#68707E]'
                  : 'bg-white text-black placeholder-[#A2A9B5]'
              }`}
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="px-4 py-2.5 bg-[#DC2626] text-white text-xs font-bold font-stencil tracking-wider uppercase border-2 border-black punk-btn disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Plus size={14} />
              <span>{t('goals.add')}</span>
            </button>
          </form>

          {/* Task Items List */}
          <div className="flex flex-col gap-2 mt-1">
            {tasks.length === 0 ? (
              <p className="text-xs italic py-4 text-center font-marker text-[#DC2626]">
                {t('goals.emptyChecklist')}
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-3 p-3 border-2 border-black transition-all ${
                    task.completed
                      ? isDark
                        ? 'bg-[#0B0C0E]/60 text-[#68707E] line-through'
                        : 'bg-[#EAE4D6]/60 text-[#68707E] line-through'
                      : isDark
                      ? 'bg-[#15181D] text-[#F5F2EB]'
                      : 'bg-white text-[#111317]'
                  }`}
                >
                  <label
                    htmlFor={`task-check-${task.id}`}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none"
                  >
                    <input
                      id={`task-check-${task.id}`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskCheck(task)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${
                        task.completed ? 'bg-[#DC2626] text-white' : 'bg-transparent'
                      }`}
                    >
                      {task.completed && <Check size={14} strokeWidth={3} />}
                    </div>

                    <span className="text-xs font-medium truncate font-sans-body">
                      {task.text}
                    </span>
                  </label>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-[#68707E] hover:text-[#DC2626] transition-colors"
                    title={t('sessions.delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
