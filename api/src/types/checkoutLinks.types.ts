/**
 * FT-21: Sharing Markets - Checkout Links Types
 */

// ========== Pool Checkout Links ==========

export interface PoolCheckoutLink {
  id: string;
  poolId: string;
  itemId: string;
  linkCode: string;
  maxUnitsPerCheckout: number | null;
  isActive: boolean;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokeReason: string | null;
  createdAt: Date;
  createdBy: string;
  totalCheckouts: number;
  totalUnitsDistributed: number;
  lastCheckoutAt: Date | null;
}

export interface CreatePoolCheckoutLinkRequest {
  itemId: string;
  maxUnitsPerCheckout?: number | null;
}

export interface CreatePoolCheckoutLinkResponse {
  id: string;
  linkCode: string;
  qrCodeDataUrl: string; // base64 data URL for QR code image
  checkoutUrl: string; // full URL: https://domain/checkout/{code}
  maxUnitsPerCheckout: number | null;
  item: {
    id: string;
    name: string;
    unit: string;
  };
  createdAt: string;
}

export interface PoolCheckoutLinkListItem {
  id: string;
  item: {
    id: string;
    name: string;
    unit: string;
  };
  linkCode: string;
  checkoutUrl: string;
  qrCodeDataUrl: string; // base64 data URL for QR code image
  maxUnitsPerCheckout: number | null;
  isActive: boolean;
  totalCheckouts: number;
  totalUnitsDistributed: number;
  lastCheckoutAt: string | null;
  createdAt: string;
  revokedAt?: string | null;
  revokedBy?: string | null;
  revokeReason?: string | null;
}

export interface RevokePoolCheckoutLinkRequest {
  reason?: string;
}

// ========== Share Checkout Links ==========

export interface ShareCheckoutLink {
  id: string;
  shareId: string;
  linkCode: string;
  maxUnitsPerCheckout: number | null;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivationReason: 'share_closed' | 'units_depleted' | 'manual_revoke' | null;
  createdAt: Date;
  totalCheckouts: number;
  totalUnitsDistributed: number;
  lastCheckoutAt: Date | null;
}

export interface CreateShareCheckoutLinkRequest {
  maxUnitsPerCheckout?: number | null;
}

export interface CreateShareCheckoutLinkResponse {
  id: string;
  linkCode: string;
  qrCodeDataUrl: string;
  checkoutUrl: string;
  maxUnitsPerCheckout: number | null;
  shareUnitsRemaining: number;
  createdAt: string;
}

export interface ShareCheckoutLinkInfoResponse {
  id: string;
  linkCode: string;
  checkoutUrl: string;
  qrCodeDataUrl: string;
  maxUnitsPerCheckout: number | null;
  isActive: boolean;
  totalCheckouts: number;
  totalUnitsDistributed: number;
  lastCheckoutAt: string | null;
  createdAt: string;
  share: {
    id: string;
    title: string;
    unitsAvailable: number;
  };
}

// ========== Public Checkout Endpoints ==========

export interface PublicCheckoutDetailsResponse {
  type: 'pool' | 'share';
  community: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  item: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  maxUnitsPerCheckout: number | null;
  availableUnits: number | null; // For share links only
  isActive: boolean;
  message?: string; // If inactive
}

export interface CompleteCheckoutRequest {
  units: number;
}

export interface CompleteCheckoutResponse {
  requestId: string;
  unitsReceived: number;
  trustAwarded?: number; // If trust configured for item
  message: string;
}

// ========== Internal Service Types ==========

export interface CheckoutLinkDetails {
  linkType: 'pool' | 'share';
  linkId: string;
  linkCode: string;
  communityId: string;
  itemId: string;
  maxUnitsPerCheckout: number | null;
  isActive: boolean;
  // For pool links
  poolId?: string;
  councilId?: string;
  // For share links
  shareId?: string;
  shareOwnerId?: string;
  shareUnitsAvailable?: number;
}
