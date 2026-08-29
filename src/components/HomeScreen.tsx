import React, { useState, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Camera as CameraIcon, 
  Image as ImageIcon, 
  ChevronRight,
  Sparkles,
  Check,
  Upload,
  X,
  RotateCcw,
  Camera
} from 'lucide-react';
import cameraIconSvg from '../assets/camera_icon.svg';
import { CalendarEvent, PhotoItem, ScreenType, TaskItem, UserProfile } from '../types';
import { INITIAL_PROFILE } from '../mockData';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  tasks: TaskItem[];
  events: CalendarEvent[];
  photos: PhotoItem[];
  profile: UserProfile;
  onUpdateAvatar?: (avatarUrl: string) => void;
  onQuickAddTask?: (title: string) => void;
  onOpenTaskModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  tasks,
  events,
  photos,
  profile,
  onUpdateAvatar,
}) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'options' | 'pick_photo'>('options');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Today's events count
  const todayEvents = events.filter(e => e.dateStr === '2024-10-15');
  const latestPhoto = photos[0]?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateAvatar) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateAvatar(event.target.result as string);
          setIsAvatarModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFromPhotos = (photoUrl: string) => {
    if (onUpdateAvatar) {
      onUpdateAvatar(photoUrl);
      setIsAvatarModalOpen(false);
    }
  };

  const handleResetDefaultAvatar = () => {
    if (onUpdateAvatar) {
      onUpdateAvatar(INITIAL_PROFILE.avatarUrl);
      setIsAvatarModalOpen(false);
    }
  };

  // Calendar Card mini grid data for preview
  const daysHeader = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const calendarDays = [
    { num: '', current: false },
    { num: '', current: false },
    { num: '1', current: false },
    { num: '2', current: false },
    { num: '3', current: false },
    { num: '4', current: false },
    { num: '5', current: false },
    { num: '6', current: false },
    { num: '7', current: false },
    { num: '8', current: false },
    { num: '9', current: false },
    { num: '10', current: false },
    { num: '11', current: false },
    { num: '12', current: false },
    { num: '13', current: false },
    { num: '14', current: false },
    { num: '15', current: false },
    { num: '16', current: false },
    { num: '17', current: false },
    { num: '18', current: false },
    { num: '19', current: false },
    { num: '20', current: false },
    { num: '21', current: false },
    { num: '22', current: false },
    { num: '23', current: true }, // Highlighted day
    { num: '24', current: false },
    { num: '25', current: false },
    { num: '26', current: false },
    { num: '27', current: false },
    { num: '28', current: false },
    { num: '29', current: false },
    { num: '30', current: false },
  ];

  // SVG circular progress calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="relative min-h-screen flex flex-col justify-between py-6 px-5 sm:px-6 max-w-md mx-auto select-none">
      {/* Hidden file input for uploading custom avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header Bar - Clean title without arrow & close button */}
      <header className="flex items-center justify-center py-2">
        <h1 className="text-xl font-bold text-slate-800 tracking-wide">叮叮的随记</h1>
      </header>

      {/* User Greeting Section - Interactive Avatar */}
      <section className="mt-2 mb-5 flex items-center gap-4">
        <div 
          id="btn-profile-avatar"
          onClick={() => {
            setActiveTab('options');
            setIsAvatarModalOpen(true);
          }}
          title="点击更换头像或跳转相册"
          className="relative cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/90 shadow-md ring-4 ring-blue-100/50 bg-white flex items-center justify-center group-hover:ring-blue-300 transition-all">
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Hover overlay hint */}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs">
            <Camera className="w-5 h-5 text-white drop-shadow" />
          </div>

          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {profile.greeting}
          </h2>
          <p className="text-base font-medium text-slate-600 mt-0.5">
            {profile.subGreeting}
          </p>
        </div>
      </section>

      {/* Avatar & Album Action Dialog */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm animate-in fade-in">
          <div className="glass-modal rounded-3xl p-5 w-full max-w-sm border border-white shadow-2xl relative text-left">
            {/* Close Button */}
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header Preview */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-200/60">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md ring-2 ring-blue-100 bg-white flex items-center justify-center shrink-0">
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-contain p-1"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{profile.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">管理个人头像与生活相册</p>
              </div>
            </div>

            {activeTab === 'options' ? (
              <div className="space-y-2.5">
                {/* Action 1: 跳转相册 */}
                <button
                  onClick={() => {
                    setIsAvatarModalOpen(false);
                    onNavigate('album');
                  }}
                  id="btn-avatar-nav-album"
                  className="w-full p-3.5 rounded-2xl glass-panel-soft hover:bg-white border border-white/80 transition-all flex items-center justify-between group cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                        跳转生活相册
                      </div>
                      <div className="text-[11px] text-slate-500">
                        查看全部照片与分类记录
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Action 2: 从相册照片选择头像 */}
                <button
                  onClick={() => setActiveTab('pick_photo')}
                  id="btn-avatar-pick-photo"
                  className="w-full p-3.5 rounded-2xl glass-panel-soft hover:bg-white border border-white/80 transition-all flex items-center justify-between group cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                        从相册选择新头像
                      </div>
                      <div className="text-[11px] text-slate-500">
                        挑选相册已有照片设为头像
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Action 3: 上传本地新照片 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  id="btn-avatar-upload"
                  className="w-full p-3.5 rounded-2xl glass-panel-soft hover:bg-white border border-white/80 transition-all flex items-center justify-between group cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        上传本地图片
                      </div>
                      <div className="text-[11px] text-slate-500">
                        从设备中选择照片上传
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Action 4: 恢复默认头像 */}
                {profile.avatarUrl !== INITIAL_PROFILE.avatarUrl && (
                  <button
                    onClick={handleResetDefaultAvatar}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>恢复初始默认头像</span>
                  </button>
                )}
              </div>
            ) : (
              /* Photo Picker View */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700">选择相册照片作为头像</span>
                  <button
                    onClick={() => setActiveTab('options')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    返回选项
                  </button>
                </div>

                {photos.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    相册暂无照片，请先拍照或上传照片
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 pr-1.5 scrollbar-thin">
                    {photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => handleSelectFromPhotos(photo.url)}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 focus:border-blue-500 active:scale-95 transition-all group cursor-pointer shadow-2xs"
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.caption || '照片'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        {profile.avatarUrl === photo.url && (
                          <div className="absolute inset-0 bg-blue-500/40 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2x2 Bento Cards Grid */}
      <div className="grid grid-cols-2 gap-4 my-auto pb-4">
        {/* Card 1: 日历 (Calendar) */}
        <div 
          id="card-nav-calendar"
          onClick={() => onNavigate('calendar')}
          className="glass-panel rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white/70 active:scale-[0.98] group relative overflow-hidden min-h-[195px]"
        >
          {/* Subtle light leak glow */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-100/40 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-800">日历</span>
          </div>

          {/* Mini Calendar Preview Grid */}
          <div className="my-auto py-1">
            <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-slate-400 mb-1">
              {daysHeader.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-slate-600">
              {calendarDays.slice(0, 28).map((day, idx) => (
                <div key={idx} className="h-4 flex items-center justify-center">
                  {day.current ? (
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[9px] shadow-xs">
                      {day.num}
                    </span>
                  ) : (
                    <span>{day.num}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>今日有{todayEvents.length > 0 ? todayEvents.length : 3}个日程</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: 任务 (Tasks) */}
        <div 
          id="card-nav-tasks"
          onClick={() => onNavigate('tasks')}
          className="glass-panel rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white/70 active:scale-[0.98] group relative overflow-hidden min-h-[195px]"
        >
          {/* Subtle light leak glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform"></div>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-lg font-bold text-slate-800">任务</span>
          </div>

          {/* Circular Progress Arc */}
          <div className="relative flex items-center justify-center my-auto py-1">
            <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 96 96">
              {/* Background ring */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-200/70"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Progress ring */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-900 transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-slate-900 leading-none">
                {completionRate}%
              </span>
              <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                已完成{completionRate}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>{pendingTasks}个待办任务</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: 相机 (Camera) */}
        <div 
          id="card-nav-camera"
          onClick={() => onNavigate('camera')}
          className="glass-panel rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white/70 active:scale-[0.98] group relative overflow-hidden min-h-[195px]"
        >
          {/* Subtle light leak glow */}
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-sky-100/50 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform"></div>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <CameraIcon className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-800">相机</span>
          </div>

          {/* Styled Camera & Lens Aperture Graphic */}
          <div className="my-auto py-2 flex items-center justify-center">
            <div className="w-26 h-20 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm flex items-center justify-center">
              <img 
                src={cameraIconSvg} 
                alt="相机图标" 
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>快拍记录灵感</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: 相册 (Album) */}
        <div 
          id="card-nav-album"
          onClick={() => onNavigate('album')}
          className="glass-panel rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white/70 active:scale-[0.98] group relative overflow-hidden min-h-[195px]"
        >
          {/* Subtle light leak glow */}
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-purple-100/40 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform"></div>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-800">相册</span>
          </div>

          {/* Photo Preview Thumbnail */}
          <div className="my-auto py-1 flex items-center justify-center">
            <div className="w-full h-22 rounded-2xl overflow-hidden relative shadow-sm border border-white/80 group-hover:scale-105 transition-transform">
              <img 
                src={latestPhoto} 
                alt="相册预览" 
                className="w-full h-full object-cover filter brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <span className="absolute bottom-1.5 left-2.5 text-[10px] font-semibold text-white/90 drop-shadow">
                {photos.length} 张珍贵瞬间
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>分类与时间线</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
