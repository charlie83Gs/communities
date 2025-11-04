import { Component, JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { keycloakService } from '@/services/keycloak.service';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

const ProtectedRoute: Component<ProtectedRouteProps> = (props) => {
  const navigate = useNavigate();

  // Check authentication
  const isAuthenticated = keycloakService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login
    navigate('/keycloak-login');
    return null;
  }

  // Check role if required
  if (props.requiredRole && !keycloakService.hasRole(props.requiredRole)) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">Access Denied</h1>
          <p class="mt-2 text-stone-600 dark:text-stone-400">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate('/keycloak-dashboard')}
            class="mt-4 bg-ocean-600 text-white px-4 py-2 rounded hover:bg-ocean-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{props.children}</>;
};

export default ProtectedRoute;
