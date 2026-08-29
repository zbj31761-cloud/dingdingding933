/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenType, TaskItem, CalendarEvent, PhotoItem, UserProfile } from './types';
import { 
  INITIAL_PROFILE, 
  INITIAL_TASKS, 
  INITIAL_EVENTS, 
  INITIAL_PHOTOS, 
  INITIAL_CATEGORIES 
} from './mockData';
import { HomeScreen } from './components/HomeScreen';
import { TaskScreen } from './components/TaskScreen';
import { TaskModal } from './components/TaskModal';
import { CalendarScreen } from './components/CalendarScreen';
import { CameraScreen } from './components/CameraScreen';
import { AlbumScreen } from './components/AlbumScreen';
import { SplashScreen } from './components/SplashScreen';
import { Smartphone, Maximize, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDesktopFramed, setIsDesktopFramed] = useState(true);

  // Persistent States
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('mist_notes_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('mist_notes_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    const saved = localStorage.getItem('mist_notes_photos');
    return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('mist_notes_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mist_notes_profile');
    if (!saved) return INITIAL_PROFILE;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        name: parsed.name === '用户' ? '叮叮大王' : (parsed.name || '叮叮大王'),
        greeting: parsed.greeting === '你好，用户！' ? '叮叮大王' : (parsed.greeting || '叮叮大王'),
        avatarUrl: parsed.avatarUrl || INITIAL_PROFILE.avatarUrl,
      };
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    setProfile(prev => ({
      ...prev,
      avatarUrl: newAvatarUrl,
    }));
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mist_notes_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('mist_notes_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('mist_notes_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('mist_notes_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('mist_notes_categories', JSON.stringify(categories));
  }, [categories]);

  // Task Operations
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (title: string, dateTag: string = 'today', time: string = '10:00 AM') => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      dateTag,
      time,
      dateStr: '2024-10-15',
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleConfirmTaskModal = (taskData: { title: string; dateStr: string; time: string; dateTag: string }) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      dateStr: taskData.dateStr,
      time: taskData.time,
      dateTag: taskData.dateTag,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Event Operations
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Photo & Category Operations
  const handleAddPhoto = (photo: PhotoItem) => {
    setPhotos(prev => [photo, ...prev]);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleAddCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (category === '全部') return; // Cannot delete "全部"
    setCategories(prev => prev.filter(c => c !== category));
  };

  const handleResetData = () => {
    if (window.confirm('确认重置所有数据到初始状态吗？')) {
      setTasks(INITIAL_TASKS);
      setEvents(INITIAL_EVENTS);
      setPhotos(INITIAL_PHOTOS);
      setCategories(INITIAL_CATEGORIES);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Desktop Controls (Top-right corner for quick testing & view toggles) */}
      <aside className="hidden md:flex fixed top-4 right-4 z-50 items-center gap-2 glass-panel rounded-full px-3 py-1.5 shadow-md">
        <button
          onClick={() => setIsDesktopFramed(!isDesktopFramed)}
          title={isDesktopFramed ? "切换为铺满模式" : "切换为手机模拟框"}
          className="p-1.5 rounded-full hover:bg-white/80 text-slate-700 transition-all flex items-center gap-1 text-xs font-semibold"
        >
          {isDesktopFramed ? <Maximize className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          <span>{isDesktopFramed ? "全屏模式" : "手机视图"}</span>
        </button>
        <div className="w-[1px] h-3.5 bg-slate-300"></div>
        <button
          onClick={() => setShowSplash(true)}
          title="重播开屏页动画"
          className="p-1.5 rounded-full hover:bg-white/80 text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>开屏</span>
        </button>
        <div className="w-[1px] h-3.5 bg-slate-300"></div>
        <button
          onClick={handleResetData}
          title="重置初始数据"
          className="p-1.5 rounded-full hover:bg-white/80 text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置</span>
        </button>
      </aside>

      {/* Main Container */}
      <div 
        className={`w-full transition-all duration-300 ${
          isDesktopFramed 
            ? 'max-w-[412px] h-[100dvh] md:h-[870px] md:rounded-[44px] md:shadow-[0_25px_70px_rgba(30,58,138,0.18)] md:border-[8px] md:border-white/80 md:ring-1 md:ring-slate-300/60 overflow-hidden relative' 
            : 'max-w-xl min-h-screen relative'
        }`}
      >
        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div
              key="screen-splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <SplashScreen 
                duration={2300}
                onFinish={() => setShowSplash(false)} 
              />
            </motion.div>
          ) : (
            <>
              {currentScreen === 'home' && (
                <motion.div
                  key="screen-home"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full h-full overflow-y-auto"
                >
                  <HomeScreen
                    onNavigate={setCurrentScreen}
                    tasks={tasks}
                    events={events}
                    photos={photos}
                    profile={profile}
                    onUpdateAvatar={handleUpdateAvatar}
                    onQuickAddTask={(title) => handleAddTask(title, 'today', '10:00 AM')}
                    onOpenTaskModal={() => setIsTaskModalOpen(true)}
                  />
                </motion.div>
              )}

          {currentScreen === 'tasks' && (
            <motion.div
              key="screen-tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-full overflow-y-auto"
            >
              <TaskScreen
                onBack={() => setCurrentScreen('home')}
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onOpenTaskModal={() => setIsTaskModalOpen(true)}
              />
            </motion.div>
          )}

          {currentScreen === 'calendar' && (
            <motion.div
              key="screen-calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-full overflow-y-auto"
            >
              <CalendarScreen
                onBack={() => setCurrentScreen('home')}
                events={events}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </motion.div>
          )}

          {currentScreen === 'camera' && (
            <motion.div
              key="screen-camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-full overflow-hidden"
            >
              <CameraScreen
                onBack={() => setCurrentScreen('home')}
                onNavigateToAlbum={() => setCurrentScreen('album')}
                onCapturePhoto={handleAddPhoto}
                latestPhotoUrl={photos[0]?.url}
              />
            </motion.div>
          )}

              {currentScreen === 'album' && (
                <motion.div
                  key="screen-album"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full h-full overflow-y-auto"
                >
                  <AlbumScreen
                    onBack={() => setCurrentScreen('home')}
                    photos={photos}
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddPhoto={handleAddPhoto}
                    onDeletePhoto={handleDeletePhoto}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Global Task Creation Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onConfirm={handleConfirmTaskModal}
        />
      </div>
    </div>
  );
}
