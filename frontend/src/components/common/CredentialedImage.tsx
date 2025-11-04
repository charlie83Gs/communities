import { Component, JSX, Show, createEffect, createSignal, onCleanup } from 'solid-js';
import { keycloakService } from '@/services/keycloak.service';

/**
 * CredentialedImage
 * - Fetches an image with JWT Bearer token authentication (Keycloak)
 * - Converts to a blob URL and sets as <img src>.
 * - Use this when the backend image endpoint requires authentication.
 */
export interface CredentialedImageProps extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;            // absolute URL to the image endpoint
  fallbackText?: string;  // optional text to show if it fails to load
}

export const CredentialedImage: Component<CredentialedImageProps> = (props) => {
  const [blobUrl, setBlobUrl] = createSignal<string | null>(null);
  const [err, setErr] = createSignal<string | null>(null);
  let currentUrl: string | null = null;

  async function load() {
    setErr(null);
    const url = props.src;
    if (!url) {
      setErr('No image URL');
      return;
    }

    try {
      // Get the current Keycloak access token
      const token = keycloakService.getToken();

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include', // Still include credentials for compatibility
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      // Revoke previous if any
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      const objectUrl = URL.createObjectURL(blob);
      currentUrl = objectUrl;
      setBlobUrl(objectUrl);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load image');
    }
  }

  createEffect(() => {
    // re-load when props.src changes
    void props.src; // track
    load();
  });

  onCleanup(() => {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      currentUrl = null;
    }
  });

  // Spread remaining props to img (alt, class, etc.)
  const { fallbackText, src, ...rest } = props as any;

  return (
    <Show when={!err()} fallback={
      <div class="text-sm text-red-600">{fallbackText ?? 'Unable to display image'}</div>
    }>
      <img src={blobUrl() ?? ''} {...(rest as JSX.ImgHTMLAttributes<HTMLImageElement>)} />
    </Show>
  );
};

export default CredentialedImage;