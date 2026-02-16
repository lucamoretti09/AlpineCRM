import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  timezone?: string;
  preferences?: any;
}

const DEFAULT_USER: User = {
  id: 'user-1',
  email: 'alex@alpinecrm.com',
  firstName: 'Alex',
  lastName: 'Morgan',
  role: 'admin',
  timezone: 'UTC',
};

interface AuthState {
  user: User;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: DEFAULT_USER,
  setUser: (user: User) => set({ user }),
}));
