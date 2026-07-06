import { create } from 'zustand';

export interface RecentReport {
  id: string;
  startup_name: string;
  report_type: string;
  score: number | null;
  created_at: string;
}

export interface RecentChat {
  id: string;
  title: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_startups: number;
  average_health_score: number;
  total_chats: number;
  total_reports: number;
  recent_reports: RecentReport[];
  recent_chats: RecentChat[];
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  setMetrics: (metrics: DashboardMetrics) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  setMetrics: (metrics) => set({ metrics }),
}));
