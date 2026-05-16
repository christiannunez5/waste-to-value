import * as SecureStore from 'expo-secure-store';
import React from 'react';

import {
  getUserById,
  initializeDatabase,
  loginUser,
  registerUser,
  User,
} from '@/lib/database';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const SESSION_KEY = 'waste-to-value-user-id';
const AuthContext = React.createContext<AuthContextValue | null>(null);

async function setSessionUserId(userId: number | null) {
  try {
    if (userId === null) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return;
    }

    await SecureStore.setItemAsync(SESSION_KEY, String(userId));
  } catch {
    // SecureStore may be unavailable on a web preview; Android remains the target runtime.
  }
}

async function getSessionUserId() {
  try {
    const value = await SecureStore.getItemAsync(SESSION_KEY);
    return value ? Number(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [initializing, setInitializing] = React.useState(true);

  const refreshUser = React.useCallback(async () => {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      setUser(null);
      return;
    }

    setUser(await getUserById(sessionUserId));
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function prepare() {
      await initializeDatabase();
      const sessionUserId = await getSessionUserId();
      const sessionUser = sessionUserId ? await getUserById(sessionUserId) : null;

      if (mounted) {
        setUser(sessionUser);
        setInitializing(false);
      }
    }

    prepare();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = React.useCallback(async (username: string, password: string) => {
    const nextUser = await loginUser(username, password);
    await setSessionUserId(nextUser.id);
    setUser(nextUser);
  }, []);

  const signUp = React.useCallback(async (username: string, password: string) => {
    const nextUser = await registerUser(username, password);
    if (!nextUser) {
      throw new Error('Unable to create account.');
    }

    await setSessionUserId(nextUser.id);
    setUser(nextUser);
  }, []);

  const signOut = React.useCallback(async () => {
    await setSessionUserId(null);
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, initializing, signIn, signUp, signOut, refreshUser }),
    [initializing, refreshUser, signIn, signOut, signUp, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const value = React.use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
