/**
 * Pool Checkout Link entity
 * Permanent QR code for ongoing sharing locations (farmer's market, tool library)
 */
export interface PoolCheckoutLink {
  id: string;
  poolId: string;
  itemId: string;
  linkCode: string;
  qrCodeDataUrl: string;
  checkoutUrl: string;
  maxUnitsPerCheckout: number | null;
  item: {
    id: string;
    name: string;
    unit: string;
  };
  isActive: boolean;
  totalCheckouts: number;
  totalUnitsDistributed: number;
  lastCheckoutAt: string | null;
  createdAt: string;
  createdBy: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
}

/**
 * Share Checkout Link entity
 * Temporary QR code for one-time shares (event leftovers, harvest surplus)
 */
export interface ShareCheckoutLink {
  id: string;
  shareId: string;
  linkCode: string;
  qrCodeDataUrl: string;
  checkoutUrl: string;
  maxUnitsPerCheckout: number | null;
  shareUnitsRemaining: number;
  isActive: boolean;
  totalCheckouts: number;
  totalUnitsDistributed: number;
  lastCheckoutAt: string | null;
  createdAt: string;
  deactivatedAt?: string;
  deactivationReason?: 'share_closed' | 'units_depleted' | 'manual_revoke';
}

/**
 * Checkout Link Details (public endpoint response)
 * Returned when scanning a QR code or opening checkout URL
 */
export interface CheckoutLinkDetails {
  type: 'pool' | 'share';
  community: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  item: {
    id: string;
    name: string;
    unit: string;
    imageUrl: string | null;
  };
  sourceName: string; // Pool name or share title
  maxUnitsPerCheckout: number | null;
  availableUnits: number | null; // For share links, null for pool links
  isActive: boolean;
  message?: string; // If inactive: reason message
}

/**
 * Checkout Result (response after completing checkout)
 */
export interface CheckoutResult {
  requestId: string;
  unitsReceived: number;
  trustAwarded?: number;
  message: string;
}

/**
 * DTO for creating pool checkout link
 * POST /api/pools/:poolId/checkout-links
 */
export interface CreatePoolCheckoutLinkDto {
  itemId: string;
  maxUnitsPerCheckout?: number | null;
}

/**
 * DTO for creating share checkout link
 * POST /api/wealth/:shareId/checkout-link
 */
export interface CreateShareCheckoutLinkDto {
  maxUnitsPerCheckout?: number | null;
}

/**
 * DTO for completing checkout
 * POST /api/checkout/:linkCode
 */
export interface CompleteCheckoutDto {
  units: number;
}

/**
 * DTO for revoking pool checkout link
 * POST /api/pools/:poolId/checkout-links/:linkId/revoke
 */
export interface RevokePoolCheckoutLinkDto {
  reason?: string;
}
