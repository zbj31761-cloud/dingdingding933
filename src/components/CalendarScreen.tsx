import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  Trash2, 
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { EventModal } from './EventModal';

interface CalendarScreenProps {
  onBack: () => void;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  onBack,
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [selectedDate, setSelectedDate] = useState('2024-10-15');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Days matrix for October 2024 (Image 7 shows 1st on Wednesday/Tuesday)
  // Let's create an exact accurate grid:
  // Weekday row: 日 (0) 一 (1) 二 (2) 三 (3) 四 (4) 五 (5) 六 (6)
  // In Image 7: Day 1 is under 三, Day 2 under 四, Day 3 under 五, Day 4 under 六
  // Day 5 under 日, etc.
  // Day 15 is under 三.
  const emptyBefore = [null, null, null]; // 3 empty slots before Oct 1
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Check if a date has events
  const hasEventOnDay = (day: number) => {
    const dayStr = `2024-10-${day < 10 ? '0' + day : day}`;
    return events.some(e => e.dateStr === dayStr);
  };

  const selectedDayNum = parseInt(selectedDate.split('-')[2] || '15', 10);
  const currentEvents = events.filter(e => e.dateStr === selectedDate);

  const handleDayClick = (day: number) => {
    const dayStr = `2024-10-${day < 10 ? '0' + day : day}`;
    setSelectedDate(dayStr);
  };

  const handleConfirmAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    onAddEvent(eventData);
    // If the added event is on a specific date, switch to that date to view it immediately
    if (eventData.dateStr) {
      setSelectedDate(eventData.dateStr);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between pb-16 max-w-md mx-auto select-none">
      {/* Header matching Image 7 */}
      <header className="pt-10 pb-4 px-6 flex justify-between items-center glass-panel sticky top-0 z-30 rounded-b-3xl">
        <button 
          id="btn-calendar-back"
          onClick={onBack} 
          aria-label="返回" 
          className="text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-full hover:bg-white/60 transition-all active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <h1 className="text-xl font-semibold text-slate-800 tracking-wide">日历</h1>

        <button 
          id="btn-calendar-add"
          onClick={() => setIsAddEventOpen(true)} 
          aria-label="添加日程" 
          className="text-slate-600 hover:text-slate-900 p-2 -mr-2 rounded-full hover:bg-white/60 transition-all active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </header>

      {/* Main Calendar Content */}
      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-12 no-scrollbar">
        {/* Month View Card */}
        <section className="glass-panel rounded-3xl p-5 mb-5 shadow-lg border border-white/80">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-wider">2024年十月</h2>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-3">
            <span>日</span>
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-sm font-medium">
            {/* Empty placeholders */}
            {emptyBefore.map((_, i) => (
              <div key={`empty-${i}`} className="h-9"></div>
            ))}

            {/* October Days */}
            {daysInMonth.map((day) => {
              const isSelected = day === selectedDayNum;
              const hasEvents = hasEventOnDay(day);

              return (
                <div key={day} className="flex flex-col items-center justify-center relative">
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all relative ${
                      isSelected
                        ? 'bg-blue-400/80 text-white font-bold shadow-md ring-4 ring-blue-200/60 scale-110 date-selected-glow'
                        : 'text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    <span>{day}</span>
                  </button>

                  {/* Dot for days with events */}
                  {hasEvents && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1 shadow-xs absolute -bottom-1"></span>
                  )}
                  {hasEvents && isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-xs absolute -bottom-1"></span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Schedule Detail Card "今日日程" matching Image 7 */}
        <section className="glass-panel rounded-3xl p-5 shadow-lg border border-white/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">
              {selectedDate === '2024-10-15' ? '今日日程' : `${selectedDayNum}日日程`}
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-white/70 px-2.5 py-1 rounded-full">
              {currentEvents.length} 个事项
            </span>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {currentEvents.length === 0 ? (
              <div className="glass-panel-soft rounded-2xl p-6 text-center text-slate-400 text-sm">
                该日期暂无安排，点击右上角「+」即可添加日程
              </div>
            ) : (
              currentEvents.map((evt) => (
                <div
                  key={evt.id}
                  id={`event-item-${evt.id}`}
                  className="glass-panel-soft rounded-2xl p-3.5 flex items-center justify-between group hover:bg-white/80 transition-all border border-white/70 shadow-xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-medium text-slate-700 truncate">
                      <span className="text-slate-800 font-semibold">{evt.time}</span>
                      <span className="mx-2 text-slate-400">-</span>
                      <span>{evt.title}</span>
                      {evt.locationOrType && (
                        <span className="ml-1 text-slate-500 text-xs">
                          ({evt.locationOrType})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(evt.id)}
                    aria-label="删除日程"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-all ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Add Schedule / Event Modal (matching Task Modal design) */}
      <EventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onConfirm={handleConfirmAddEvent}
        initialDateStr={selectedDate}
      />
    </div>
  );
};
