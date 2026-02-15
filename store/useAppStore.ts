import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Project { id: string; name: string; color: string; }
export interface Entry { id: string; projectId: string; task: string; start: string; end?: string; duration?: number; }

interface AppState {
  projects: Project[];
  entries: Entry[];
  activeEntry: Entry | null;
  addProject: (name: string) => void;
  startTimer: (projectId: string, task: string) => void;
  stopTimer: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [{ id: '1', name: 'General', color: '#3b82f6' }],
      entries: [],
      activeEntry: null,

      addProject: (name) => set((state) => ({
        projects: [...state.projects, { id: Date.now().toString(), name, color: '#'+Math.floor(Math.random()*16777215).toString(16) }]
      })),

      startTimer: (projectId, task) => set({
        activeEntry: { id: Date.now().toString(), projectId, task, start: new Date().toISOString() }
      }),

      stopTimer: () => {
        const { activeEntry, entries } = get();
        if (!activeEntry) return;
        const stoppedEntry = { ...activeEntry, end: new Date().toISOString() };
        set({ entries: [stoppedEntry, ...entries], activeEntry: null });
      },
    }),
    { name: 'timer-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
