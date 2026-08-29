import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Trash2, 
  Share2, 
  Download, 
  Sparkles, 
  Heart,
  Maximize2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { PhotoItem } from '../types';

interface AlbumScreenProps {
  onBack: () => void;
  photos: PhotoItem[];
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onAddPhoto: (photo: PhotoItem) => void;
  onDeletePhoto: (id: string) => void;
}

export const AlbumScreen: React.FC<AlbumScreenProps> = ({
  onBack,
  photos,
  categories,
  onAddCategory,
  onDeleteCategory,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [importedPhotoUrl, setImportedPhotoUrl] = useState<string | null>(null);
  const [importedPhotoName, setImportedPhotoName] = useState<string>('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('风景');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startLongPress = (cat: string) => {
    if (cat === '全部') return;
    setIsLongPressTriggered(false);
    const timer = setTimeout(() => {
      setIsLongPressTriggered(true);
      setCategoryToDelete(cat);
    }, 600);
    setLongPressTimer(timer);
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCategoryClick = (cat: string) => {
    if (isLongPressTriggered) {
      setIsLongPressTriggered(false);
      return;
    }
    setActiveCategory(cat);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    onDeleteCategory(categoryToDelete);
    if (activeCategory === categoryToDelete) {
      setActiveCategory('全部');
    }
    setCategoryToDelete(null);
  };

  // Filter photos based on selected category
  const filteredPhotos = activeCategory === '全部'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  // Group photos by dateStr
  const dateGroups: { [dateStr: string]: PhotoItem[] } = {};
  filteredPhotos.forEach(photo => {
    if (!dateGroups[photo.dateStr]) {
      dateGroups[photo.dateStr] = [];
    }
    dateGroups[photo.dateStr].push(photo);
  });

  const dates = Object.keys(dateGroups);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportedPhotoUrl(event.target.result as string);
          setImportedPhotoName(file.name.replace(/\.[^/.]+$/, "") || '本地照片');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importedPhotoUrl) return;

    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;

    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      url: importedPhotoUrl,
      caption: importedPhotoName.trim() || '本地照片',
      dateStr: dateStr,
      category: newPhotoCategory,
      aspect: '4/3',
      span: 2,
      takenAt: Date.now(),
    };

    onAddPhoto(newPhoto);
    setImportedPhotoUrl(null);
    setImportedPhotoName('');
    setIsAddPhotoOpen(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setActiveCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddCategoryOpen(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between pb-32 max-w-md mx-auto select-none">
      {/* Header */}
      <header className="pt-10 pb-4 px-6 flex justify-between items-center glass-panel sticky top-0 z-30 rounded-b-3xl">
        <button 
          id="btn-album-back"
          onClick={onBack} 
          aria-label="返回" 
          className="text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-full hover:bg-white/60 transition-all active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <h1 className="text-xl font-semibold text-slate-800 tracking-wide">相册</h1>

        <button 
          id="btn-album-add-photo"
          onClick={() => setIsAddPhotoOpen(true)} 
          aria-label="添加照片" 
          className="text-slate-600 hover:text-slate-900 p-2 -mr-2 rounded-full hover:bg-white/60 transition-all active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </header>

      {/* Main Timeline Content */}
      <main className="flex-1 px-4 pt-6 timeline-container overflow-y-auto no-scrollbar relative">
        {/* Continuous background line for timeline matching HTML */}
        <div className="timeline-line"></div>

        {dates.length === 0 ? (
          <div className="relative z-10 glass-panel rounded-3xl p-8 text-center text-slate-500 my-10">
            <p className="font-semibold text-base mb-1">当前分类暂无照片</p>
            <p className="text-xs text-slate-400">切换其他分类或点击右上角「+」添加照片</p>
          </div>
        ) : (
          dates.map((dateStr) => {
            const groupPhotos = dateGroups[dateStr];

            return (
              <section key={dateStr} className="relative z-10 flex gap-3 mb-10">
                {/* Date Column matching HTML */}
                <div className="w-18 pt-1 shrink-0 bg-transparent">
                  <h2 className="text-[15px] font-medium text-slate-700 tracking-wide">
                    {dateStr}
                  </h2>
                </div>

                {/* Photos Grid */}
                <div className="flex-1 pr-1">
                  {/* If 3 photos, render matching layout styles */}
                  {groupPhotos.length === 3 ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Photo 1: Spans full row */}
                      <div 
                        onClick={() => setSelectedPhoto(groupPhotos[0])}
                        className="col-span-2 relative rounded-2xl overflow-hidden shadow-sm aspect-[4/3] cursor-pointer group bg-slate-200"
                      >
                        <img 
                          alt={groupPhotos[0].caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={groupPhotos[0].url} 
                          referrerPolicy="no-referrer"
                        />
                        {/* Quick Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(groupPhotos[0]);
                          }}
                          title="删除照片"
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-10 backdrop-blur-xs shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                          <span className="text-white text-xs font-medium truncate">{groupPhotos[0].caption}</span>
                        </div>
                      </div>

                      {/* Photo 2 */}
                      <div 
                        onClick={() => setSelectedPhoto(groupPhotos[1])}
                        className="relative rounded-2xl overflow-hidden shadow-sm aspect-square cursor-pointer group bg-slate-200"
                      >
                        <img 
                          alt={groupPhotos[1].caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={groupPhotos[1].url} 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(groupPhotos[1]);
                          }}
                          title="删除照片"
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-10 backdrop-blur-xs shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-white text-[11px] font-medium truncate">{groupPhotos[1].caption}</span>
                        </div>
                      </div>

                      {/* Photo 3 */}
                      <div 
                        onClick={() => setSelectedPhoto(groupPhotos[2])}
                        className="relative rounded-2xl overflow-hidden shadow-sm aspect-square cursor-pointer group bg-slate-200"
                      >
                        <img 
                          alt={groupPhotos[2].caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={groupPhotos[2].url} 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(groupPhotos[2]);
                          }}
                          title="删除照片"
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-10 backdrop-blur-xs shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-white text-[11px] font-medium truncate">{groupPhotos[2].caption}</span>
                        </div>
                      </div>
                    </div>
                  ) : groupPhotos.length === 2 ? (
                    <div className="grid grid-cols-3 gap-2.5">
                      <div 
                        onClick={() => setSelectedPhoto(groupPhotos[0])}
                        className="col-span-2 relative rounded-2xl overflow-hidden shadow-sm aspect-[4/3] cursor-pointer group bg-slate-200"
                      >
                        <img 
                          alt={groupPhotos[0].caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={groupPhotos[0].url} 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(groupPhotos[0]);
                          }}
                          title="删除照片"
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-10 backdrop-blur-xs shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div 
                        onClick={() => setSelectedPhoto(groupPhotos[1])}
                        className="col-span-1 relative rounded-2xl overflow-hidden shadow-sm aspect-[3/4] cursor-pointer group bg-slate-200"
                      >
                        <img 
                          alt={groupPhotos[1].caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={groupPhotos[1].url} 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(groupPhotos[1]);
                          }}
                          title="删除照片"
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-10 backdrop-blur-xs shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {groupPhotos.map((photo) => (
                        <div 
                          key={photo.id}
                          onClick={() => setSelectedPhoto(photo)}
                          className="relative rounded-2xl overflow-hidden shadow-sm aspect-square cursor-pointer group bg-slate-200"
                        >
                          <img 
                            alt={photo.caption} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            src={photo.url} 
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoToDelete(photo);
                            }}
                            title="删除照片"
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-10 backdrop-blur-xs shadow-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* Floating Category Selection Bar matching Image 4 & HTML */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 z-40 flex flex-col items-center gap-1.5">
        <div className="glass-floating rounded-full px-2 py-2 flex items-center space-x-1.5 shadow-2xl border border-white/80 overflow-x-auto no-scrollbar max-w-full">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const canDelete = cat !== '全部';
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                onMouseDown={() => startLongPress(cat)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(cat)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onContextMenu={(e) => {
                  if (canDelete) {
                    e.preventDefault();
                    setCategoryToDelete(cat);
                  }
                }}
                title={canDelete ? "长按或右键可删除此分类" : undefined}
                className={`px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all whitespace-nowrap active:scale-95 select-none relative ${
                  isActive
                    ? 'bg-white/90 shadow-sm border border-white text-slate-800'
                    : 'bg-transparent hover:bg-white/40 text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <button
            onClick={() => setIsAddCategoryOpen(true)}
            aria-label="添加分类"
            title="添加新分类"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent hover:bg-white/50 text-slate-700 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Photo Confirmation Dialog */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="glass-modal rounded-3xl p-5 w-full max-w-xs border border-white shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 border border-white/80 shadow-sm relative bg-slate-100">
              <img 
                src={photoToDelete.url} 
                alt={photoToDelete.caption} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white drop-shadow" />
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">删除照片</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              确定要删除这张照片吗？
              {photoToDelete.caption && photoToDelete.caption !== '精彩瞬间' && photoToDelete.caption !== '本地照片' && (
                <>
                  <br />
                  <span className="font-semibold text-slate-700">「{photoToDelete.caption}」</span>
                </>
              )}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 glass-panel-soft hover:bg-white transition-all"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePhoto(photoToDelete.id);
                  if (selectedPhoto?.id === photoToDelete.id) {
                    setSelectedPhoto(null);
                  }
                  setPhotoToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md transition-all active:scale-95"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="glass-modal rounded-3xl p-5 w-full max-w-xs border border-white shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">删除分类</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              确定要删除分类「<span className="font-bold text-slate-700">{categoryToDelete}</span>」吗？
              <br />
              <span className="text-[11px] text-slate-400">（照片不会被删除）</span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 glass-panel-soft hover:bg-white transition-all"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md transition-all active:scale-95"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm glass-modal rounded-3xl overflow-hidden p-4 border border-white/80 shadow-2xl flex flex-col gap-3">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center z-10 hover:bg-black/80 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="px-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {selectedPhoto.category}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {selectedPhoto.dateStr}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-2">
                {selectedPhoto.caption}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <button
                onClick={() => setPhotoToDelete(selectedPhoto)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除照片</span>
              </button>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal - Local Album Import */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in">
          <div className="glass-modal rounded-3xl p-5 w-full max-w-sm border border-white shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddPhotoOpen(false);
                setImportedPhotoUrl(null);
                setImportedPhotoName('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">从本地相册导入</h3>
            <p className="text-xs text-slate-500 mb-4">选择手机或电脑本地相册中的照片导入</p>

            {/* Hidden native file input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Local Photo Selection / Preview Area */}
              {importedPhotoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/80 shadow-inner bg-slate-950 aspect-[4/3] flex items-center justify-center group">
                  <img 
                    src={importedPhotoUrl} 
                    alt="待导入照片预览" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-800 text-xs font-semibold hover:bg-white shadow-sm transition-all"
                    >
                      重新选择
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImportedPhotoUrl(null);
                        setImportedPhotoName('');
                      }}
                      className="p-1.5 rounded-xl bg-red-500/90 text-white text-xs hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 p-6 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] group bg-white/40"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 mb-1 group-hover:text-blue-600 transition-colors">
                    点击打开本地相册
                  </span>
                  <span className="text-[11px] text-slate-400 text-center">
                    支持 JPG, PNG, WEBP 等格式
                  </span>
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">选择所属分类</label>
                <select
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value)}
                  className="w-full glass-panel-soft rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white"
                >
                  {categories.filter(c => c !== '全部').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPhotoOpen(false);
                    setImportedPhotoUrl(null);
                    setImportedPhotoName('');
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 glass-panel-soft hover:bg-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!importedPhotoUrl}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
                    importedPhotoUrl 
                      ? 'bg-slate-900 hover:bg-slate-800 active:scale-95' 
                      : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  }`}
                >
                  确认导入相册
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
          <div className="glass-modal rounded-3xl p-5 w-full max-w-sm border border-white shadow-2xl relative">
            <button
              onClick={() => setIsAddCategoryOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">新建相册分类</h3>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">分类名称</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="例如：旅行、工作、灵感"
                  required
                  autoFocus
                  className="w-full glass-panel-soft rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 glass-panel-soft hover:bg-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
