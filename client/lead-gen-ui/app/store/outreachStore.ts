import { create } from 'zustand';
import type { Lead } from '~/api/leadsApi';
import type { GeneratedMessage } from '~/api/outreachApi';

interface OutreachState {
  selectedLead: Lead | null;
  generatedMessage: GeneratedMessage | null;
  isSending: boolean;
  isGenerating: boolean;
  method: 'sms' | 'email';
  recipientEmail: string;
  error: string | null;

  setSelectedLead: (lead: Lead | null) => void;
  setGeneratedMessage: (msg: GeneratedMessage | null) => void;
  setIsSending: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;
  setMethod: (m: 'sms' | 'email') => void;
  setRecipientEmail: (email: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useOutreachStore = create<OutreachState>((set) => ({
  selectedLead: null,
  generatedMessage: null,
  isSending: false,
  isGenerating: false,
  method: 'sms',
  recipientEmail: '',
  error: null,

  setSelectedLead: (lead) => set({ selectedLead: lead, generatedMessage: null, error: null }),
  setGeneratedMessage: (msg) => set({ generatedMessage: msg }),
  setIsSending: (v) => set({ isSending: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setMethod: (m) => set({ method: m, generatedMessage: null }),
  setRecipientEmail: (email) => set({ recipientEmail: email }),
  setError: (error) => set({ error }),
  reset: () => set({
    selectedLead: null,
    generatedMessage: null,
    isSending: false,
    isGenerating: false,
    method: 'sms',
    recipientEmail: '',
    error: null,
  }),
}));
