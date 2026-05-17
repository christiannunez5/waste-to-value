import type { User } from '@/types/user';

export type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};
