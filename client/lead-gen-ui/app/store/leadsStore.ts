import { create } from 'zustand';
import type { Lead, ScanConfig } from '~/api/leadsApi';
import { DEFAULT_SCAN_CONFIG } from '~/utils/constants';

interface LeadsState {
  leads: Lead[];
  isScanning: boolean;
  lastScanned: string | null;
  newLeadsFound: number | null;
  scanConfig: ScanConfig;
  error: string | null;

  setLeads: (leads: Lead[]) => void;
  setIsScanning: (val: boolean) => void;
  setLastScanned: (val: string) => void;
  setNewLeadsFound: (val: number) => void;
  setScanConfig: (config: Partial<ScanConfig>) => void;
  setError: (err: string | null) => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  leads: [],
  isScanning: false,
  lastScanned: null,
  newLeadsFound: null,
  scanConfig: DEFAULT_SCAN_CONFIG,
  error: null,

  setLeads: (leads) => set({ leads }),
  setIsScanning: (val) => set({ isScanning: val }),
  setLastScanned: (val) => set({ lastScanned: val }),
  setNewLeadsFound: (val) => set({ newLeadsFound: val }),
  setScanConfig: (config) =>
    set((state) => ({ scanConfig: { ...state.scanConfig, ...config } })),
  setError: (err) => set({ error: err }),
}));
