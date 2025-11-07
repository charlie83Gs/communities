import { Show } from 'solid-js';
import { Navigate, type RouteSectionProps } from '@solidjs/router';
import { useAuth } from '@/hooks/useAuth';

export const AuthGuard = (props: RouteSectionProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <Show
      when={!isLoading()}
      fallback={<div class="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <Show when={isAuthenticated()} fallback={<Navigate href="/login" />}>
        {props.children}
      </Show>
    </Show>
  );
};
