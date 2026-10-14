import React, { useState } from 'react';
import { Plus, Check, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { GoalTask } from '../types';
import { useI18n } from '../i18n';
import { playSoftChime } from '../lib/audio';
import { StickerTag } from './illustrations/Stickers';

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
  };

  const handleTaskCheck = (task: GoalTask) => {
    onToggleTask(task.id);
    if (!task.completed) {
      playSoftChime('tick');
    }
  };

  const handleSaveTarget = () => {
    onUpdateTargetMinutes(Math.max(15, tempTarget));
    setIsEditingTarget(false);
  };

  return (
    <section
      id="metas"
      className={`rounded-3xl p-6 sm:p-10 border transition-all relative overflow-hidden ${
        isDark
          ? 'bg-[#EBF0F5] text-[#121518] border-[#CBD5E1] shadow-md'
          : 'bg-[#181F26] text-[#F4F6F8] border-[#2A3744] shadow-md'
      }`}
    >
      {/* Visual Accent Pill */}
      {isGoalReached && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <StickerTag
            text={t('stickers.goalHit')}
            variant="teal"
            rotation={3}
            icon={<CheckCircle2 size={13} />}
          />
        </div>
      )}

      {/* Section Title with Mixed Typography */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight uppercase leading-none">
          {t('goals.title')}{' '}
          <span className="font-serif-italic font-normal lowercase tracking-normal text-[#0E7490]">
            {t('goals.titleEmphasis')}
          </span>
        </h2>
        <p
          className={`text-xs mt-1 font-medium ${
            isDark ? 'text-[#475569]' : 'text-[#94A3B8]'
          }`}
        >
          {todayStudiedMinutes} min de {targetMinutes} min planejados para hoje
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Daily Target Progress & Slider */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className={`rounded-2xl p-5 border ${
              isDark
                ? 'bg-white border-[#D8E1E8]'
                : 'bg-[#12161B] border-[#222C37]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider font-display flex items-center gap-1.5 text-[#0E7490]">
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
                    className={`w-18 text-xs font-bold px-2 py-1 rounded border text-center ${
                      isDark
                        ? 'bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]'
                        : 'bg-[#1C242C] text-white border-[#384656]'
                    }`}
                  />
                  <button
                    onClick={handleSaveTarget}
                    className="text-xs font-bold px-2 py-1 rounded bg-[#0E7490] text-white hover:bg-[#0891B2]"
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
                  className={`text-xs font-bold hover:underline ${
                    isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}
                >
                  {targetMinutes} min ✎
                </button>
              )}
            </div>

            {/* Giant Percentage Counter */}
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-5xl font-black font-display tracking-tight text-[#0E7490] tabular-nums">
                {percentTime}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'
                }`}
              >
                {t('goals.completedPercentage', { percent: percentTime })}
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div
              className={`w-full h-3 rounded-full overflow-hidden mt-2 ${
                isDark ? 'bg-[#E2E8F0]' : 'bg-[#222C37]'
              }`}
            >
              <div
                className="h-full bg-[#0E7490] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentTime}%` }}
              />
            </div>

            {/* Quick target presets */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-[11px]">
              <span className={isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}>Atalhos:</span>
              {[60, 90, 120, 180].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateTargetMinutes(mins)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    targetMinutes === mins
                      ? 'bg-[#0E7490] text-white'
                      : isDark
                      ? 'bg-[#E2E8F0] text-[#475569] hover:bg-[#CBD5E1]'
                      : 'bg-[#222C37] text-[#94A3B8] hover:bg-[#2A3744]'
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
            <h3 className="text-sm font-bold uppercase tracking-wider font-display">
              {t('goals.checklistTitle')}
            </h3>
            <span
              className={`text-xs font-medium ${
                isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'
              }`}
            >
              {completedTasksCount}/{tasks.length} ({percentTasks}%)
            </span>
          </div>

          {/* Add new task input */}
          <form onSubmit={handleCreateTask} className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={t('goals.newTaskPlaceholder')}
              className={`w-full text-xs rounded-xl px-3.5 py-2.5 border transition-colors ${
                isDark
                  ? 'bg-white text-[#0F172A] border-[#CBD5E1] placeholder-[#94A3B8] focus:border-[#0E7490]'
                  : 'bg-[#12161B] text-white border-[#2A3744] placeholder-[#475569] focus:border-[#0E7490]'
              }`}
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-bold tracking-wide hover:bg-[#0891B2] disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus size={14} />
              <span>{t('goals.add')}</span>
            </button>
          </form>

          {/* Task Items List */}
          <div className="flex flex-col gap-2 mt-1">
            {tasks.length === 0 ? (
              <p
                className={`text-xs italic py-4 text-center ${
                  isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'
                }`}
              >
                {t('goals.emptyChecklist')}
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                    task.completed
                      ? isDark
                        ? 'bg-[#E2E8F0]/50 border-transparent text-[#64748B]'
                        : 'bg-[#161C23] border-transparent text-[#64748B]'
                      : isDark
                      ? 'bg-white border-[#D8E1E8] text-[#0F172A]'
                      : 'bg-[#161E26] border-[#2A3744] text-[#F1F5F9]'
                  }`}
                >
                  <label
                    htmlFor={`task-check-${task.id}`}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <input
                      id={`task-check-${task.id}`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskCheck(task)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-[#0E7490] border-[#0E7490] text-white'
                          : isDark
                          ? 'border-[#94A3B8] bg-transparent'
                          : 'border-[#475569] bg-transparent'
                      }`}
                    >
                      {task.completed && <Check size={12} strokeWidth={3} />}
                    </div>

                    <span
                      className={`text-xs font-medium truncate ${
                        task.completed ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {task.text}
                    </span>
                  </label>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 rounded text-[#94A3B8] hover:text-red-500 transition-colors opacity-60 hover:opacity-100"
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
