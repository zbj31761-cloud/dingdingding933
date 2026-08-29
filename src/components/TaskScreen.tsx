import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Check, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { ScreenType, TaskItem } from '../types';

interface TaskScreenProps {
  onBack: () => void;
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, dateTag?: string, time?: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenTaskModal: () => void;
}

export const TaskScreen: React.FC<TaskScreenProps> = ({
  onBack,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenTaskModal,
}) => {
  const [inputTitle, setInputTitle] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // Group tasks by section
  const todayTasks = tasks.filter(t => t.dateTag === 'today' || !t.dateTag);
  const upcomingTasks = tasks.filter(t => t.dateTag !== 'today' && t.dateTag);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    onAddTask(inputTitle.trim(), 'today', '10:00 AM');
    setInputTitle('');
  };

  const getFilteredList = (list: TaskItem[]) => {
    if (filterMode === 'pending') return list.filter(t => !t.completed);
    if (filterMode === 'completed') return list.filter(t => t.completed);
    return list;
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between pb-32 max-w-md mx-auto select-none">
      {/* Header matching Image 2 & HTML */}
      <header className="pt-10 pb-4 px-6 flex justify-between items-center glass-panel sticky top-0 z-30 rounded-b-3xl">
        <button 
          id="btn-task-back"
          onClick={onBack} 
          aria-label="返回" 
          className="text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-full hover:bg-white/60 transition-all active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <h1 className="text-xl font-semibold text-slate-800 tracking-wide">任务</h1>

        <div className="relative">
          <button 
            id="btn-task-options"
            onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
            aria-label="更多操作" 
            className="text-slate-600 hover:text-slate-900 p-2 -mr-2 rounded-full hover:bg-white/60 transition-all active:scale-95"
          >
            <MoreHorizontal className="h-6 w-6" />
          </button>

          {showOptionsDropdown && (
            <div className="absolute right-0 top-11 w-44 glass-modal rounded-2xl p-2 shadow-xl z-50 border border-white flex flex-col gap-1">
              <button 
                onClick={() => { setFilterMode('all'); setShowOptionsDropdown(false); }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${filterMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/80'}`}
              >
                <span>显示全部</span>
                {filterMode === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => { setFilterMode('pending'); setShowOptionsDropdown(false); }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${filterMode === 'pending' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/80'}`}
              >
                <span>仅未完成</span>
                {filterMode === 'pending' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => { setFilterMode('completed'); setShowOptionsDropdown(false); }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${filterMode === 'completed' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/80'}`}
              >
                <span>仅已完成</span>
                {filterMode === 'completed' && <Check className="w-3.5 h-3.5" />}
              </button>
              <div className="h-[1px] bg-slate-200/60 my-1"></div>
              <button 
                onClick={() => { onOpenTaskModal(); setShowOptionsDropdown(false); }}
                className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-sky-600 hover:bg-sky-50 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>详细新建任务</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-12 no-scrollbar">
        {/* Section: 今天 (Today) */}
        <section className="mb-8">
          <div className="glass-text-wrapper inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl mb-4 shadow-xs">
            <h2 className="text-xl font-bold text-slate-800">今天</h2>
            <span className="text-xs font-semibold text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
              {todayTasks.filter(t => !t.completed).length} 待办
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {getFilteredList(todayTasks).map((task) => (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`glass-panel rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 min-h-[135px] relative group hover:shadow-md hover:bg-white/70 ${
                  task.completed ? 'opacity-60 bg-white/30' : ''
                }`}
              >
                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  aria-label="删除任务"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white/80 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start justify-between mb-2">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                      task.completed
                        ? 'bg-slate-400 text-white shadow-xs'
                        : 'border-[1.5px] border-slate-300 hover:border-slate-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="glass-text-wrapper px-2 py-0.5 rounded-lg">
                    <span className={`text-[11px] font-medium ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                      {task.completed ? '已完成' : (task.time || '07:00 AM')}
                    </span>
                  </div>
                </div>

                <div className="glass-text-wrapper px-3 py-2 rounded-xl mt-auto shadow-xs">
                  <span
                    className={`text-sm font-semibold block transition-all ${
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: 即将到来 (Upcoming) */}
        <section className="mb-4">
          <div className="glass-text-wrapper inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl mb-4 shadow-xs">
            <h2 className="text-xl font-bold text-slate-800">即将到来</h2>
            <span className="text-xs font-semibold text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
              {upcomingTasks.length} 项
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {getFilteredList(upcomingTasks).map((task) => (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`glass-panel rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 min-h-[135px] relative group hover:shadow-md hover:bg-white/70 ${
                  task.completed ? 'opacity-60 bg-white/30' : ''
                }`}
              >
                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  aria-label="删除任务"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white/80 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start justify-between mb-2">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                      task.completed
                        ? 'bg-slate-400 text-white shadow-xs'
                        : 'border-[1.5px] border-slate-300 hover:border-slate-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="glass-text-wrapper px-2 py-0.5 rounded-lg">
                    <span className={`text-[11px] font-medium ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                      {task.dateTag === 'tomorrow' ? '明天' : task.dateTag === 'upcoming' ? '本周' : (task.dateTag || '下周')}
                    </span>
                  </div>
                </div>

                <div className="glass-text-wrapper px-3 py-2 rounded-xl mt-auto shadow-xs">
                  <span
                    className={`text-sm font-semibold block transition-all ${
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Add Task Input Area matching Image 2 & HTML */}
      <footer className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-30">
        <form 
          onSubmit={handleQuickSubmit}
          className="glass-input-area rounded-3xl p-2 pl-5 pr-3 flex items-center justify-between shadow-xl border border-white/80"
        >
          <input 
            type="text"
            id="input-task-quick"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="添加新任务..." 
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full text-slate-700 placeholder-slate-400 p-0 font-medium"
          />

          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              id="btn-open-task-details"
              onClick={onOpenTaskModal}
              title="设置日期与时间"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all active:scale-95"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};
