import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/waste-ui';
import { useAuth } from '@/providers/auth-provider';

export default function RootIndexScreen() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <LoadingState />;
  }

  return <Redirect href={user ? '/(tabs)' : '/auth'} />;
}
