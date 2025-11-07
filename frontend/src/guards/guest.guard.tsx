import { Show } from 'solid-js';
import { Navigate, type RouteSectionProps } from '@solidjs/router';
import { useAuth } from '@/hooks/useAuth';

export const GuestGuard = (props: RouteSectionProps) => {
  const { isAuthenticated } = useAuth();
  return (
    <Show when={!isAuthenticated()} fallback={<Navigate href="/dashboard" />}>
      {props.children}
    </Show>
  );
};
