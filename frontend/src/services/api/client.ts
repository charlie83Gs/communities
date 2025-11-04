import { keycloakService } from '@/services/keycloak.service';

const baseUrl = import.meta.env.VITE_API_URL as string;

async function getAuthHeaders() {
  const headers: Record<string, string> = {};
  try {
    if (keycloakService.isAuthenticated()) {
      const token = keycloakService.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return headers;
}

// Use native fetch with Keycloak Bearer token authentication.
// Authorization header is automatically attached with JWT token from Keycloak.
export const apiClient = {
  async get(endpoint: string) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const json = await response.json();
    return (json && typeof json === 'object' && 'data' in json) ? json.data : json;
  },

  async post(endpoint: string, body: unknown) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const json = await response.json();
    return (json && typeof json === 'object' && 'data' in json) ? json.data : json;
  },

  async put(endpoint: string, body: unknown) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const json = await response.json();
    return (json && typeof json === 'object' && 'data' in json) ? json.data : json;
  },

  async delete(endpoint: string) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    // No body for 204, return void
  },
  
    async postForm(endpoint: string, formData: FormData) {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const json = await response.json();
      return (json && typeof json === 'object' && 'data' in json) ? json.data : json;
    },
};