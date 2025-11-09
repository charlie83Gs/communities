/**
 * OpenFGA Schema Constants
 *
 * Single source of truth for all OpenFGA relations, roles, and permissions.
 * This file defines the structure of the authorization model.
 */

/**
 * Base Roles (admin, member)
 * These are the foundational roles that grant access to a community.
 * A user should only have ONE base role per resource.
 */
export const BASE_ROLES = ['admin', 'member'] as const;
export type BaseRole = (typeof BASE_ROLES)[number];

/**
 * Feature Roles (regular roles)
 * These roles grant specific permissions within a community.
 * Assigned by admins via UI to delegate specific authority.
 * Users can have MULTIPLE feature roles.
 */
export const FEATURE_ROLES = [
  'trust_viewer',
  'trust_granter',
  'wealth_viewer',
  'wealth_creator',
  'poll_viewer',
  'poll_creator',
  'dispute_viewer',
  'dispute_handler',
  'pool_viewer',
  'pool_creator',
  'council_viewer',
  'council_creator',
  'forum_viewer',
  'forum_manager',
  'thread_creator',
  'attachment_uploader',
  'content_flagger',
  'flag_reviewer',
  'item_viewer',
  'item_manager',
  'analytics_viewer',
  'needs_viewer',
  'needs_publisher',
] as const;
export type FeatureRole = (typeof FEATURE_ROLES)[number];

/**
 * Trust Roles (auto-granted based on trust score)
 * These roles are automatically granted when trust >= threshold.
 * Mirror the feature roles but are prefixed with "trust_".
 */
export const TRUST_ROLES = [
  'trust_trust_viewer',
  'trust_trust_granter',
  'trust_wealth_viewer',
  'trust_wealth_creator',
  'trust_poll_viewer',
  'trust_poll_creator',
  'trust_dispute_viewer',
  'trust_dispute_handler',
  'trust_pool_viewer',
  'trust_pool_creator',
  'trust_council_viewer',
  'trust_council_creator',
  'trust_forum_viewer',
  'trust_forum_manager',
  'trust_thread_creator',
  'trust_attachment_uploader',
  'trust_content_flagger',
  'trust_flag_reviewer',
  'trust_item_viewer',
  'trust_item_manager',
  'trust_analytics_viewer',
  'trust_needs_viewer',
  'trust_needs_publisher',
] as const;
export type TrustRole = (typeof TRUST_ROLES)[number];

/**
 * Permissions (can_* relations)
 * These are computed relations that union admin + feature role + trust role.
 * Application code should check permissions, not roles directly.
 */
export const PERMISSIONS = [
  'can_read',
  'can_update',
  'can_delete',
  'can_view_trust',
  'can_award_trust',
  'can_view_wealth',
  'can_create_wealth',
  'can_view_poll',
  'can_create_poll',
  'can_view_dispute',
  'can_handle_dispute',
  'can_view_pool',
  'can_create_pool',
  'can_view_council',
  'can_create_council',
  'can_view_forum',
  'can_manage_forum',
  'can_create_thread',
  'can_upload_attachment',
  'can_flag_content',
  'can_review_flag',
  'can_view_item',
  'can_manage_item',
  'can_view_analytics',
  'can_view_needs',
  'can_publish_needs',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/**
 * Resource Type Mapping
 * Maps application resource types to OpenFGA types
 */
export const RESOURCE_TYPE_MAP: Record<string, string> = {
  communities: 'community',
  wealth: 'wealth',
  wealth_comments: 'wealth_comment',
  wealthComments: 'wealth_comment',
  invites: 'invite',
  councils: 'council',
  pools: 'pool',
  forum_categories: 'forum_category',
  forum_threads: 'forum_thread',
  forum_posts: 'forum_post',
};

/**
 * Subject Types
 * Types that can be subjects in OpenFGA tuples
 */
export const SUBJECT_TYPES = ['user', 'community', 'council', 'pool', 'metadata'] as const;
export type SubjectType = (typeof SUBJECT_TYPES)[number];

/**
 * Action to Permission Mapping
 * Maps common CRUD actions to OpenFGA permission relations
 */
export const ACTION_PERMISSION_MAP: Record<string, string> = {
  create: 'can_create',
  read: 'can_read',
  update: 'can_update',
  delete: 'can_delete',
  manage: 'can_manage',
  moderate: 'can_moderate',
  contribute: 'can_contribute',
};

/**
 * Helper functions
 */

export function isBaseRole(relation: string): relation is BaseRole {
  return BASE_ROLES.includes(relation as BaseRole);
}

export function isFeatureRole(relation: string): relation is FeatureRole {
  return FEATURE_ROLES.includes(relation as FeatureRole);
}

export function isTrustRole(relation: string): relation is TrustRole {
  return TRUST_ROLES.includes(relation as TrustRole);
}

export function isPermission(relation: string): relation is Permission {
  return PERMISSIONS.includes(relation as Permission);
}

export function mapResourceType(resourceType: string): string {
  return RESOURCE_TYPE_MAP[resourceType] || resourceType;
}

export function mapActionToPermission(action: string): string {
  return ACTION_PERMISSION_MAP[action] || `can_${action}`;
}
