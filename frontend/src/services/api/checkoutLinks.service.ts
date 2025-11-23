import { apiClient } from './client';
import type {
  PoolCheckoutLink,
  ShareCheckoutLink,
  CheckoutLinkDetails,
  CheckoutResult,
  CreatePoolCheckoutLinkDto,
  CreateShareCheckoutLinkDto,
  CompleteCheckoutDto,
  RevokePoolCheckoutLinkDto,
} from '@/types/checkoutLinks.types';

class CheckoutLinksService {
  // ========================================
  // Pool Checkout Links
  // ========================================

  /**
   * Create a pool checkout link
   * POST /api/v1/pools/:poolId/checkout-links
   * Auth: Council member or admin
   */
  async createPoolCheckoutLink(
    communityId: string,
    poolId: string,
    dto: CreatePoolCheckoutLinkDto
  ): Promise<PoolCheckoutLink> {
    return apiClient.post(
      `/api/v1/pools/${poolId}/checkout-links`,
      dto
    );
  }

  /**
   * List all checkout links for a pool
   * GET /api/v1/pools/:poolId/checkout-links
   * Auth: Council member or admin
   */
  async getPoolCheckoutLinks(
    communityId: string,
    poolId: string
  ): Promise<PoolCheckoutLink[]> {
    const response = await apiClient.get(
      `/api/v1/pools/${poolId}/checkout-links`
    );
    // API returns { links: [...] }, extract the array
    return (response as any).links || response;
  }

  /**
   * Revoke a pool checkout link
   * POST /api/v1/pools/:poolId/checkout-links/:linkId/revoke
   * Auth: Council member or admin
   */
  async revokePoolCheckoutLink(
    communityId: string,
    poolId: string,
    linkId: string,
    dto?: RevokePoolCheckoutLinkDto
  ): Promise<void> {
    return apiClient.post(
      `/api/v1/pools/${poolId}/checkout-links/${linkId}/revoke`,
      dto || {}
    );
  }

  /**
   * Regenerate a pool checkout link (creates new code, revokes old)
   * POST /api/v1/pools/:poolId/checkout-links/:linkId/regenerate
   * Auth: Council member or admin
   */
  async regeneratePoolCheckoutLink(
    communityId: string,
    poolId: string,
    linkId: string
  ): Promise<PoolCheckoutLink> {
    return apiClient.post(
      `/api/v1/pools/${poolId}/checkout-links/${linkId}/regenerate`,
      {}
    );
  }

  // ========================================
  // Share Checkout Links
  // ========================================

  /**
   * Create a share checkout link
   * POST /api/v1/wealth/:shareId/checkout-link
   * Auth: Share owner or admin
   */
  async createShareCheckoutLink(
    shareId: string,
    dto: CreateShareCheckoutLinkDto
  ): Promise<ShareCheckoutLink> {
    return apiClient.post(`/api/v1/wealth/${shareId}/checkout-link`, dto);
  }

  /**
   * Get share checkout link info
   * GET /api/v1/wealth/:shareId/checkout-link
   * Auth: Share owner or admin
   */
  async getShareCheckoutLink(shareId: string): Promise<ShareCheckoutLink | null> {
    try {
      return await apiClient.get(`/api/v1/wealth/${shareId}/checkout-link`);
    } catch (error: any) {
      // Return null if no link exists (404)
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Revoke a share checkout link (manual early revoke)
   * DELETE /api/v1/wealth/:shareId/checkout-link
   * Auth: Share owner or admin
   */
  async revokeShareCheckoutLink(shareId: string): Promise<void> {
    return apiClient.delete(`/api/v1/wealth/${shareId}/checkout-link`);
  }

  // ========================================
  // Public Checkout Endpoints
  // ========================================

  /**
   * Get checkout link details (public - no auth required)
   * GET /api/v1/checkout/:linkCode
   */
  async getCheckoutLinkDetails(linkCode: string): Promise<CheckoutLinkDetails> {
    return apiClient.get(`/api/v1/checkout/${linkCode}`);
  }

  /**
   * Complete checkout (requires auth - user must be community member)
   * POST /api/v1/checkout/:linkCode
   */
  async completeCheckout(
    linkCode: string,
    dto: CompleteCheckoutDto
  ): Promise<CheckoutResult> {
    return apiClient.post(`/api/v1/checkout/${linkCode}`, dto);
  }

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * Download QR code image
   * Converts base64 data URL to downloadable file
   */
  downloadQRCode(qrCodeDataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Print QR code
   * Opens print dialog with QR code
   */
  printQRCode(qrCodeDataUrl: string, title: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${title}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: sans-serif;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            img {
              max-width: 400px;
              height: auto;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <img src="${qrCodeDataUrl}" alt="QR Code" />
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for image to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}

export const checkoutLinksService = new CheckoutLinksService();
