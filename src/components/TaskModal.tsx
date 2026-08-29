import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, Bell, Check } from 'lucide-react';
import { TaskItem } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (task: { title: string; dateStr: string; time: string; dateTag: string }) => void;
  initialDateStr?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialDateStr = '2024-10-15',
}) => {
  if (!isOpen) return null;

  const [description, setDescription] = useState('');
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(10); // 1-12
  const initialDayNum = parseInt(initialDateStr.split('-')[2] || '15', 10);
  const [selectedDay, setSelectedDay] = useState<number>(initialDayNum || 15);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedReminder, setSelectedReminder] = useState('准时提醒');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isReminderPickerOpen, setIsReminderPickerOpen] = useState(false);
  const [timePickerTab, setTimePickerTab] = useState<'quick' | '24h' | 'custom'>('24h');
  const [customHour, setCustomHour] = useState('10');
  const [customMinute, setCustomMinute] = useState('00');
  const [quickDate, setQuickDate] = useState<'today' | 'tomorrow' | 'custom'>('today');

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const day = parseInt(initialDateStr.split('-')[2] || '15', 10);
    setSelectedDay(day);
    if (day === 15) {
      setQuickDate('today');
    } else if (day === 16) {
      setQuickDate('tomorrow');
    } else {
      setQuickDate('custom');
    }
  }, [initialDateStr]);

  // Generate 24-hour time slots (all 48 half-hour slots: 00:00 to 23:30)
  const full24Hours = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
    return `${hourStr}:${minute}`;
  });

  const timePeriods = [
    { label: '上午/早晨', hours: full24Hours.slice(12, 24) }, // 06:00 - 11:30
    { label: '下午/中午', hours: full24Hours.slice(24, 36) }, // 12:00 - 17:30
    { label: '晚上/夜间', hours: full24Hours.slice(36, 48) }, // 18:00 - 23:30
    { label: '凌晨/深夜', hours: full24Hours.slice(0, 12) },  // 00:00 - 05:30
  ];

  const reminderOptions = [
    '准时提醒',
    '提前 5 分钟',
    '提前 15 分钟',
    '提前 30 分钟',
    '提前 1 小时',
    '提前 2 小时',
    '提前 1 天',
    '不提醒',
  ];

  // Dynamic calendar matrix generation for the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  };

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1 <= 0 ? 12 : currentMonth - 1);

  const calendarDays: Array<{ day: number; monthType: 'prev' | 'current' | 'next'; isToday?: boolean }> = [];

  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, monthType: 'prev' });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isToday = currentYear === 2024 && currentMonth === 10 && d === 15;
    calendarDays.push({ day: d, monthType: 'current', isToday });
  }

  // Next month padding to fill 35 or 42 grid items
  const totalSlots = calendarDays.length > 35 ? 42 : 35;
  const remaining = totalSlots - calendarDays.length;
  for (let n = 1; n <= remaining; n++) {
    calendarDays.push({ day: n, monthType: 'next' });
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number, monthType: 'prev' | 'current' | 'next') => {
    if (monthType === 'prev') {
      handlePrevMonth();
      setSelectedDay(day);
      setQuickDate('custom');
      return;
    }
    if (monthType === 'next') {
      handleNextMonth();
      setSelectedDay(day);
      setQuickDate('custom');
      return;
    }
    setSelectedDay(day);
    if (currentYear === 2024 && currentMonth === 10) {
      if (day === 15) setQuickDate('today');
      else if (day === 16) setQuickDate('tomorrow');
      else setQuickDate('custom');
    } else {
      setQuickDate('custom');
    }
  };

  const handleQuickToday = () => {
    setCurrentYear(2024);
    setCurrentMonth(10);
    setSelectedDay(15);
    setQuickDate('today');
  };

  const handleQuickTomorrow = () => {
    setCurrentYear(2024);
    setCurrentMonth(10);
    setSelectedDay(16);
    setQuickDate('tomorrow');
  };

  const handleApplyCustomTime = () => {
    const formattedHour = customHour.padStart(2, '0');
    const formattedMinute = customMinute.padStart(2, '0');
    setSelectedTime(`${formattedHour}:${formattedMinute}`);
    setIsTimePickerOpen(false);
  };

  const handleConfirm = () => {
    const finalTitle = description.trim() || `待办事项 (${selectedTime})`;
    const dateTag = quickDate === 'today' ? 'today' : quickDate === 'tomorrow' ? 'tomorrow' : 'upcoming';
    const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const dayStr = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    onConfirm({
      title: finalTitle,
      dateStr,
      time: selectedTime,
      dateTag,
    });
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div 
        ref={modalRef}
        id="modal-task-container"
        className="glass-modal rounded-[32px] p-5 w-full max-w-sm border border-white shadow-2xl relative flex flex-col gap-4 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="关闭弹窗"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-white/60 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Task Description Input Field */}
        <div className="glass-panel-soft rounded-2xl p-3.5 border border-white/80 mt-1">
          <input
            type="text"
            id="input-modal-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请输入任务描述 (如：准备汇报材料)"
            autoFocus
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-base font-medium text-slate-800 placeholder-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
          />
        </div>

        {/* Mini Calendar Container */}
        <div className="glass-panel-soft rounded-3xl p-4 border border-white/80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button 
              type="button" 
              onClick={handlePrevMonth}
              aria-label="上一月"
              className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-white/50 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-semibold text-slate-800 tracking-wide">
              {currentYear}年 {currentMonth}月
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth}
              aria-label="下一月"
              className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-white/50 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
            <span>日</span>
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {calendarDays.map((item, idx) => {
              const isSelected = item.monthType === 'current' && item.day === selectedDay;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item.day, item.monthType)}
                  className={`h-7 flex items-center justify-center rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-100/90 text-blue-900 font-bold shadow-xs border border-blue-200 scale-105'
                      : item.monthType === 'current'
                      ? 'text-slate-800 hover:bg-white/60'
                      : 'text-slate-300'
                  }`}
                >
                  {item.isToday ? (
                    <span className={`px-1.5 py-0.5 rounded-lg text-[11px] ${isSelected ? 'font-bold' : 'text-blue-600 font-semibold'}`}>
                      今天
                    </span>
                  ) : (
                    <span>{item.day}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time & Reminder Dropdown Bar */}
        <div className="relative">
          <div className="glass-panel-soft rounded-2xl py-2.5 px-4 flex items-center justify-between text-xs font-medium text-slate-700 border border-white/80">
            {/* Time Toggle */}
            <button
              type="button"
              id="btn-toggle-task-time-picker"
              onClick={() => {
                setIsTimePickerOpen(!isTimePickerOpen);
                setIsReminderPickerOpen(false);
              }}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer py-0.5"
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>时间</span>
              <span className="text-[10px] text-slate-400">∨</span>
            </button>

            <div className="w-[1px] h-3.5 bg-slate-300"></div>

            {/* Reminder Toggle */}
            <button
              type="button"
              id="btn-toggle-task-reminder-picker"
              onClick={() => {
                setIsReminderPickerOpen(!isReminderPickerOpen);
                setIsTimePickerOpen(false);
              }}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer py-0.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>{selectedReminder}</span>
              <span className="text-[10px] text-slate-400">∨</span>
            </button>

            <div className="w-[1px] h-3.5 bg-slate-300"></div>

            {/* Current Selected Time Pill */}
            <button
              type="button"
              onClick={() => {
                setIsTimePickerOpen(!isTimePickerOpen);
                setIsReminderPickerOpen(false);
              }}
              className="text-slate-800 font-bold hover:text-blue-600 transition-colors cursor-pointer"
            >
              {selectedTime}
            </button>
          </div>

          {/* 24-Hour Time Picker Modal / Dropdown */}
          {isTimePickerOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 z-30 glass-modal rounded-2xl p-3 shadow-2xl border border-white max-h-72 overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  24小时完整时间选择
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTimePickerTab('24h')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                      timePickerTab === '24h' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    列表
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimePickerTab('custom')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                      timePickerTab === 'custom' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    自定义
                  </button>
                </div>
              </div>

              {timePickerTab === '24h' ? (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {timePeriods.map((period) => (
                    <div key={period.label}>
                      <div className="text-[10px] font-bold text-slate-400 mb-1 px-1">{period.label}</div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {period.hours.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              setSelectedTime(time);
                              setIsTimePickerOpen(false);
                            }}
                            className={`py-1.5 rounded-xl text-xs font-semibold transition-all text-center ${
                              selectedTime === time
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white/70 hover:bg-white text-slate-700'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 mb-1">时 (00-23)</span>
                      <select
                        value={customHour}
                        onChange={(e) => setCustomHour(e.target.value)}
                        className="bg-white/90 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const val = i < 10 ? `0${i}` : `${i}`;
                          return <option key={val} value={val}>{val} 时</option>;
                        })}
                      </select>
                    </div>
                    <span className="text-xl font-bold text-slate-400 mt-4">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 mb-1">分 (00-59)</span>
                      <select
                        value={customMinute}
                        onChange={(e) => setCustomMinute(e.target.value)}
                        className="bg-white/90 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
                      >
                        {Array.from({ length: 60 }, (_, i) => {
                          const val = i < 10 ? `0${i}` : `${i}`;
                          return <option key={val} value={val}>{val} 分</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomTime}
                    className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all"
                  >
                    确定设置时间
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reminder Picker Modal / Dropdown */}
          {isReminderPickerOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 z-30 glass-modal rounded-2xl p-2.5 shadow-2xl border border-white animate-in fade-in zoom-in-95">
              <div className="text-xs font-bold text-slate-800 px-2 pb-2 mb-1 border-b border-slate-200/60 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                提醒方式选择
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {reminderOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedReminder(opt);
                      setIsReminderPickerOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs text-left font-medium transition-all flex items-center justify-between ${
                      selectedReminder === opt
                        ? 'bg-blue-100 text-blue-900 font-bold border border-blue-200'
                        : 'hover:bg-white/80 text-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedReminder === opt && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Date Selectors: 今天 / 明天 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="btn-quick-today"
            onClick={handleQuickToday}
            className={`py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
              quickDate === 'today'
                ? 'bg-white/90 text-blue-600 border-blue-200 shadow-sm'
                : 'glass-panel-soft text-slate-700 border-white/80 hover:bg-white/60'
            }`}
          >
            今天
          </button>
          <button
            type="button"
            id="btn-quick-tomorrow"
            onClick={handleQuickTomorrow}
            className={`py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
              quickDate === 'tomorrow'
                ? 'bg-white/90 text-blue-600 border-blue-200 shadow-sm'
                : 'glass-panel-soft text-slate-700 border-white/80 hover:bg-white/60'
            }`}
          >
            明天
          </button>
        </div>

        {/* Main Action: 确定 (Always active & interactive) */}
        <button
          type="button"
          id="btn-modal-confirm"
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl text-base font-bold bg-white/90 hover:bg-white text-blue-700 border border-blue-200/60 shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          确定
        </button>
      </div>
    </div>
  );
};
