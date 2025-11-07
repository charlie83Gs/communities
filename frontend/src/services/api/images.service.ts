import { keycloakService } from '@/services/keycloak.service';

const baseUrl = import.meta.env.VITE_API_URL as string;

export interface UploadedImage {
  id: string;
  filename: string; // e.g., some-uuid.webp
  contentType: string;
  bytes: number;
  width: number;
  height: number;
}

class ImagesService {
  private readonly basePath = '/api/v1/images';

  // Upload a single image file via multipart/form-data
  async upload(file: File): Promise<UploadedImage> {
    const form = new FormData();
    form.append('image', file);

    // Get the current Keycloak access token
    const token = keycloakService.getToken();

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${this.basePath}`, {
      method: 'POST',
      headers,
      body: form,
      credentials: 'include',
      // IMPORTANT: do not set Content-Type, the browser will set proper multipart boundary
    });

    if (!response.ok) {
      // Attempt to surface backend error message
      let message = `API Error: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && typeof errJson === 'object') {
          if ('message' in errJson && typeof errJson.message === 'string') message = errJson.message;
          else if ('error' in errJson && typeof errJson.error === 'string') message = errJson.error;
        }
      } catch {
        // ignore json parse errors
      }
      throw new Error(message);
    }

    const json = await response.json();
    const data = (json && typeof json === 'object' && 'data' in json) ? (json as any).data : json;
    return data as UploadedImage;
  }

  // Build an absolute URL to retrieve a stored image by filename
  url(filename?: string | null): string | undefined {
    if (!filename) return undefined;
    return `${baseUrl}${this.basePath}/${encodeURIComponent(filename)}`;
  }
}

export const imagesService = new ImagesService();
