export type ScreenType = 'home' | 'tasks' | 'calendar' | 'camera' | 'album';

export interface TaskItem {
  id: string;
  title: string;
  time?: string;
  dateTag?: 'today' | 'tomorrow' | 'upcoming' | string;
  dateStr?: string; // e.g. "2024-10-15"
  completed: boolean;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string; // e.g. "9:00 AM"
  locationOrType?: string; // e.g. "Zoom", "Notes"
  dateStr: string; // e.g. "2024-10-15"
  completed?: boolean;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  dateStr: string; // e.g. "10月15日"
  category: '自拍' | '美食' | '风景' | '宠物' | string;
  aspect?: 'square' | '4/3' | '3/4' | '4/5' | 'wide' | string;
  span?: 1 | 2; // For masonry/grid layout
  takenAt?: number;
}

export interface UserProfile {
  name: string;
  greeting: string;
  subGreeting: string;
  avatarUrl: string;
}
