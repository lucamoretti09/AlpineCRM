import { create } from 'zustand';
import api from '@/lib/api';

export interface CRMDataSource {
  type: 'contact' | 'deal' | 'task' | 'ticket' | 'invoice' | 'email';
  id: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  sources?: CRMDataSource[];
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  error: string | null;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleExpanded: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  dismissError: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Bună! Sunt asistentul tău AI AlpineCRM. Cum te pot ajuta astăzi?',
  timestamp: new Date().toISOString(),
};

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [WELCOME_MESSAGE],
  isOpen: false,
  isExpanded: false,
  isLoading: false,
  error: null,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
  dismissError: () => set({ error: null }),

  clearHistory: () => set({ messages: [WELCOME_MESSAGE], error: null }),

  sendMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const loadingMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    set((s) => ({
      messages: [...s.messages, userMsg, loadingMsg],
      isLoading: true,
      error: null,
    }));

    try {
      const history = get().messages
        .filter((m) => m.id !== 'welcome' && !m.isLoading)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/ai/chat', { message: content, conversationHistory: history });

      const responseData = data.data || data;

      const assistantMsg: ChatMessage = {
        id: loadingMsg.id,
        role: 'assistant',
        content: responseData.content || 'Nu am putut genera un răspuns.',
        timestamp: new Date().toISOString(),
        sources: responseData.sources,
      };

      set((s) => ({
        messages: s.messages.map((m) => (m.id === loadingMsg.id ? assistantMsg : m)),
        isLoading: false,
      }));
    } catch {
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== loadingMsg.id),
        isLoading: false,
        error: 'Eroare la comunicarea cu asistentul AI.',
      }));
    }
  },
}));
