import { createStore } from 'solid-js/store';
import type { User } from '@/types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const [authStore, setAuthStore] = createStore<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});
