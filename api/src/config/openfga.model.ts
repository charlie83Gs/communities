/**
 * OpenFGA Authorization Model for ReBAC (Relationship-Based Access Control)
 *
 * This model defines ALL authorization logic for the community management system.
 * NO authorization logic should be embedded in application code - everything is evaluated by OpenFGA.
 *
 * Key Concepts:
 * - ROLES grant PERMISSIONS
 * - Each role comes in TWO variants:
 *   1. Regular role (e.g., forum_manager) - Admin directly grants via UI
 *   2. Trust role (e.g., trust_forum_manager) - Automatically granted when trust >= threshold
 * - Permissions (e.g., can_manage_forum) are unions of: admin OR regular_role OR trust_role
 * - When trust changes, trust roles are recalculated
 * - When trust thresholds change, all users' trust roles are recalculated
 *
 * Role → Permission Model:
 * 1. Admin role - has ALL permissions
 * 2. Resource manager roles (forum_manager, pool_manager, etc.) - per-resource admin functions
 * 3. Trust roles (trust_*) - automatically granted based on trust thresholds
 * 4. Permissions (can_*) - unions of admin + roles
 */

export const authorizationModel = {
  schema_version: '1.1',
  type_definitions: [
    {
      type: 'user',
      relations: {},
      metadata: {
        relations: {},
      },
    },

    /**
     * COMMUNITY TYPE
     *
     * Core entity that manages members, trust, and permissions.
     *
     * Base Relations:
     * - admin: Community administrators (full control)
     * - member: Regular community members
     *
     * Regular Roles (assigned by admins via UI):
     * - trust_viewer: Can view trust information
     * - trust_granter: Can award trust to others
     * - wealth_viewer: Can view wealth items
     * - wealth_creator: Can create/publish wealth
     * - poll_viewer: Can view polls
     * - poll_creator: Can create polls
     * - dispute_viewer: Can view disputes
     * - dispute_handler: Can handle disputes
     * - dispute_participant: Can create disputes
     * - pool_viewer: Can view pools
     * - pool_creator: Can create pools
     * - council_viewer: Can view councils
     * - council_creator: Can create councils
     * - forum_viewer: Can view forum content
     * - forum_manager: Full forum moderation
     * - thread_creator: Can create forum threads
     * - attachment_uploader: Can upload attachments
     * - content_flagger: Can flag content
     * - flag_reviewer: Can review flagged content
     * - item_viewer: Can view items
     * - item_manager: Can manage items
     * - analytics_viewer: Can view analytics
     * - needs_viewer: Can view needs
     * - needs_publisher: Can publish needs
     * - contribution_viewer: Can view contribution profiles
     * - contribution_logger: Can log self-reported contributions
     * - recognition_granter: Can grant peer recognition
     * - contribution_verifier: Can verify contributions
     * - recognition_manager: Can manage recognition system and calibrate values
     *
     * Trust Roles (auto-granted when trust >= threshold):
     * - trust_trust_viewer, trust_trust_granter, trust_wealth_viewer, trust_wealth_creator,
     * - trust_poll_viewer, trust_poll_creator, trust_dispute_viewer, trust_dispute_handler,
     *   trust_dispute_participant,
     * - trust_pool_viewer, trust_pool_creator, trust_council_viewer, trust_council_creator,
     * - trust_forum_viewer, trust_forum_manager, trust_thread_creator,
     * - trust_attachment_uploader, trust_content_flagger, trust_flag_reviewer,
     * - trust_item_viewer, trust_item_manager, trust_analytics_viewer,
     * - trust_needs_viewer, trust_needs_publisher, trust_contribution_viewer,
     * - trust_contribution_logger, trust_recognition_granter, trust_contribution_verifier,
     * - trust_recognition_manager
     *
     * Permissions (union of admin + regular_role + trust_role):
     * - can_view_trust, can_award_trust, can_view_wealth, can_create_wealth,
     * - can_view_poll, can_create_poll, can_view_dispute, can_handle_dispute, can_create_dispute,
     * - can_view_pool, can_create_pool, can_view_council, can_create_council,
     * - can_view_forum, can_manage_forum, can_create_thread, can_upload_attachment,
     * - can_flag_content, can_review_flag, can_view_item, can_manage_item,
     * - can_view_analytics, can_view_needs, can_publish_needs, can_view_contributions,
     * - can_log_contributions, can_grant_peer_recognition, can_verify_contributions,
     * - can_manage_recognition
     */
    {
      type: 'community',
      relations: {
        // ========== BASE ROLES ==========
        admin: { this: {} },
        member: { this: {} },

        // ========== REGULAR ROLES (Admin-Assigned) ==========
        trust_viewer: { this: {} },
        trust_granter: { this: {} },
        wealth_viewer: { this: {} },
        wealth_creator: { this: {} },
        poll_viewer: { this: {} },
        poll_creator: { this: {} },
        dispute_viewer: { this: {} },
        dispute_handler: { this: {} },
        dispute_participant: { this: {} },
        pool_viewer: { this: {} },
        pool_creator: { this: {} },
        council_viewer: { this: {} },
        council_creator: { this: {} },
        forum_viewer: { this: {} },
        forum_manager: { this: {} },
        thread_creator: { this: {} },
        attachment_uploader: { this: {} },
        content_flagger: { this: {} },
        flag_reviewer: { this: {} },
        item_viewer: { this: {} },
        item_manager: { this: {} },
        analytics_viewer: { this: {} },
        needs_viewer: { this: {} },
        needs_publisher: { this: {} },
        contribution_viewer: { this: {} },
        contribution_logger: { this: {} },
        recognition_granter: { this: {} },
        contribution_verifier: { this: {} },
        recognition_manager: { this: {} },
        skill_endorser: { this: {} },

        // ========== TRUST ROLES (Auto-Granted) ==========
        trust_trust_viewer: { this: {} },
        trust_trust_granter: { this: {} },
        trust_wealth_viewer: { this: {} },
        trust_wealth_creator: { this: {} },
        trust_poll_viewer: { this: {} },
        trust_poll_creator: { this: {} },
        trust_dispute_viewer: { this: {} },
        trust_dispute_handler: { this: {} },
        trust_dispute_participant: { this: {} },
        trust_pool_viewer: { this: {} },
        trust_pool_creator: { this: {} },
        trust_council_viewer: { this: {} },
        trust_council_creator: { this: {} },
        trust_forum_viewer: { this: {} },
        trust_forum_manager: { this: {} },
        trust_thread_creator: { this: {} },
        trust_attachment_uploader: { this: {} },
        trust_content_flagger: { this: {} },
        trust_flag_reviewer: { this: {} },
        trust_item_viewer: { this: {} },
        trust_item_manager: { this: {} },
        trust_analytics_viewer: { this: {} },
        trust_needs_viewer: { this: {} },
        trust_needs_publisher: { this: {} },
        trust_contribution_viewer: { this: {} },
        trust_contribution_logger: { this: {} },
        trust_recognition_granter: { this: {} },
        trust_contribution_verifier: { this: {} },
        trust_recognition_manager: { this: {} },
        trust_skill_endorser: { this: {} },

        // ========== PERMISSIONS (UNIONS) ==========
        // Basic community permissions
        can_read: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'member' } },
            ],
          },
        },
        can_update: {
          computedUserset: { relation: 'admin' },
        },
        can_delete: {
          computedUserset: { relation: 'admin' },
        },

        // Viewer permissions
        can_view_trust: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'trust_viewer' } },
              { computedUserset: { relation: 'trust_trust_viewer' } },
            ],
          },
        },
        can_view_poll: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'poll_viewer' } },
              { computedUserset: { relation: 'trust_poll_viewer' } },
            ],
          },
        },
        can_view_dispute: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'dispute_viewer' } },
              { computedUserset: { relation: 'trust_dispute_viewer' } },
            ],
          },
        },
        can_view_pool: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'pool_viewer' } },
              { computedUserset: { relation: 'trust_pool_viewer' } },
            ],
          },
        },
        can_view_council: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'council_viewer' } },
              { computedUserset: { relation: 'trust_council_viewer' } },
            ],
          },
        },
        can_view_forum: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'forum_viewer' } },
              { computedUserset: { relation: 'trust_forum_viewer' } },
            ],
          },
        },
        can_view_item: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'item_viewer' } },
              { computedUserset: { relation: 'trust_item_viewer' } },
            ],
          },
        },

        // Action permissions
        can_award_trust: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'trust_granter' } },
              { computedUserset: { relation: 'trust_trust_granter' } },
            ],
          },
        },
        can_view_wealth: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'wealth_viewer' } },
              { computedUserset: { relation: 'trust_wealth_viewer' } },
            ],
          },
        },
        can_create_wealth: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'wealth_creator' } },
              { computedUserset: { relation: 'trust_wealth_creator' } },
            ],
          },
        },
        can_create_poll: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'poll_creator' } },
              { computedUserset: { relation: 'trust_poll_creator' } },
            ],
          },
        },
        can_handle_dispute: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'dispute_handler' } },
              { computedUserset: { relation: 'trust_dispute_handler' } },
            ],
          },
        },
        can_create_dispute: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'dispute_participant' } },
              { computedUserset: { relation: 'trust_dispute_participant' } },
            ],
          },
        },
        can_create_pool: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'pool_creator' } },
              { computedUserset: { relation: 'trust_pool_creator' } },
            ],
          },
        },
        can_create_council: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'council_creator' } },
              { computedUserset: { relation: 'trust_council_creator' } },
            ],
          },
        },
        can_manage_forum: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'forum_manager' } },
              { computedUserset: { relation: 'trust_forum_manager' } },
            ],
          },
        },
        can_create_thread: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'thread_creator' } },
              { computedUserset: { relation: 'trust_thread_creator' } },
            ],
          },
        },
        can_upload_attachment: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'attachment_uploader' } },
              { computedUserset: { relation: 'trust_attachment_uploader' } },
            ],
          },
        },
        can_flag_content: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'content_flagger' } },
              { computedUserset: { relation: 'trust_content_flagger' } },
            ],
          },
        },
        can_review_flag: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'flag_reviewer' } },
              { computedUserset: { relation: 'trust_flag_reviewer' } },
            ],
          },
        },
        can_manage_item: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'item_manager' } },
              { computedUserset: { relation: 'trust_item_manager' } },
            ],
          },
        },
        can_view_analytics: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'analytics_viewer' } },
              { computedUserset: { relation: 'trust_analytics_viewer' } },
            ],
          },
        },
        can_view_needs: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'needs_viewer' } },
              { computedUserset: { relation: 'trust_needs_viewer' } },
            ],
          },
        },
        can_publish_needs: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'needs_publisher' } },
              { computedUserset: { relation: 'trust_needs_publisher' } },
            ],
          },
        },
        can_view_contributions: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'contribution_viewer' } },
              { computedUserset: { relation: 'trust_contribution_viewer' } },
            ],
          },
        },
        can_log_contributions: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'contribution_logger' } },
              { computedUserset: { relation: 'trust_contribution_logger' } },
            ],
          },
        },
        can_grant_peer_recognition: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'recognition_granter' } },
              { computedUserset: { relation: 'trust_recognition_granter' } },
            ],
          },
        },
        can_verify_contributions: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'contribution_verifier' } },
              { computedUserset: { relation: 'trust_contribution_verifier' } },
            ],
          },
        },
        can_manage_recognition: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'recognition_manager' } },
              { computedUserset: { relation: 'trust_recognition_manager' } },
            ],
          },
        },
        can_endorse_skills: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'skill_endorser' } },
              { computedUserset: { relation: 'trust_skill_endorser' } },
            ],
          },
        },
      },
      metadata: {
        relations: {
          // Base roles
          admin: { directly_related_user_types: [{ type: 'user' }] },
          member: { directly_related_user_types: [{ type: 'user' }] },

          // Regular roles (admin-assigned)
          trust_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_granter: { directly_related_user_types: [{ type: 'user' }] },
          wealth_viewer: { directly_related_user_types: [{ type: 'user' }] },
          wealth_creator: { directly_related_user_types: [{ type: 'user' }] },
          poll_viewer: { directly_related_user_types: [{ type: 'user' }] },
          poll_creator: { directly_related_user_types: [{ type: 'user' }] },
          dispute_viewer: { directly_related_user_types: [{ type: 'user' }] },
          dispute_handler: {
            directly_related_user_types: [{ type: 'user' }, { type: 'council' }],
          },
          dispute_participant: { directly_related_user_types: [{ type: 'user' }] },
          pool_viewer: { directly_related_user_types: [{ type: 'user' }] },
          pool_creator: { directly_related_user_types: [{ type: 'user' }] },
          council_viewer: { directly_related_user_types: [{ type: 'user' }] },
          council_creator: { directly_related_user_types: [{ type: 'user' }] },
          forum_viewer: { directly_related_user_types: [{ type: 'user' }] },
          forum_manager: { directly_related_user_types: [{ type: 'user' }] },
          thread_creator: { directly_related_user_types: [{ type: 'user' }] },
          attachment_uploader: { directly_related_user_types: [{ type: 'user' }] },
          content_flagger: { directly_related_user_types: [{ type: 'user' }] },
          flag_reviewer: { directly_related_user_types: [{ type: 'user' }] },
          item_viewer: { directly_related_user_types: [{ type: 'user' }] },
          item_manager: { directly_related_user_types: [{ type: 'user' }] },
          analytics_viewer: { directly_related_user_types: [{ type: 'user' }] },
          needs_viewer: { directly_related_user_types: [{ type: 'user' }] },
          needs_publisher: { directly_related_user_types: [{ type: 'user' }] },
          contribution_viewer: { directly_related_user_types: [{ type: 'user' }] },
          contribution_logger: { directly_related_user_types: [{ type: 'user' }] },
          recognition_granter: { directly_related_user_types: [{ type: 'user' }] },
          contribution_verifier: { directly_related_user_types: [{ type: 'user' }] },
          recognition_manager: { directly_related_user_types: [{ type: 'user' }] },
          skill_endorser: { directly_related_user_types: [{ type: 'user' }] },

          // Trust roles (auto-granted)
          trust_trust_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_trust_granter: { directly_related_user_types: [{ type: 'user' }] },
          trust_wealth_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_wealth_creator: { directly_related_user_types: [{ type: 'user' }] },
          trust_poll_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_poll_creator: { directly_related_user_types: [{ type: 'user' }] },
          trust_dispute_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_dispute_handler: {
            directly_related_user_types: [{ type: 'user' }, { type: 'council' }],
          },
          trust_dispute_participant: { directly_related_user_types: [{ type: 'user' }] },
          trust_pool_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_pool_creator: { directly_related_user_types: [{ type: 'user' }] },
          trust_council_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_council_creator: { directly_related_user_types: [{ type: 'user' }] },
          trust_forum_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_forum_manager: { directly_related_user_types: [{ type: 'user' }] },
          trust_thread_creator: { directly_related_user_types: [{ type: 'user' }] },
          trust_attachment_uploader: { directly_related_user_types: [{ type: 'user' }] },
          trust_content_flagger: { directly_related_user_types: [{ type: 'user' }] },
          trust_flag_reviewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_item_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_item_manager: { directly_related_user_types: [{ type: 'user' }] },
          trust_analytics_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_needs_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_needs_publisher: { directly_related_user_types: [{ type: 'user' }] },
          trust_contribution_viewer: { directly_related_user_types: [{ type: 'user' }] },
          trust_contribution_logger: { directly_related_user_types: [{ type: 'user' }] },
          trust_recognition_granter: { directly_related_user_types: [{ type: 'user' }] },
          trust_contribution_verifier: { directly_related_user_types: [{ type: 'user' }] },
          trust_recognition_manager: { directly_related_user_types: [{ type: 'user' }] },
          trust_skill_endorser: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },

    /**
     * WEALTH TYPE
     *
     * Represents shared resources/services in a community.
     *
     * Relations:
     * - owner: Creator of the wealth item
     * - parent_community: Link to parent community
     * - min_trust_required_X: Specific trust requirement for this item
     *
     * Permissions:
     * - can_read: inherited from parent community can_read
     * - can_update: owner only
     * - can_delete: owner only
     * - can_request: member of parent community with sufficient trust
     */
    {
      type: 'wealth',
      relations: {
        owner: { this: {} },
        parent_community: { this: {} },

        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_update: {
          computedUserset: { relation: 'owner' },
        },
        can_delete: {
          computedUserset: { relation: 'owner' },
        },
      },
      metadata: {
        relations: {
          owner: { directly_related_user_types: [{ type: 'user' }] },
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
        },
      },
    },

    /**
     * COUNCIL TYPE
     *
     * Specialized community actors with resource management.
     * Councils can be granted permissions explicitly (e.g., handle_dispute_explicit).
     *
     * Relations:
     * - parent_community: Link to parent community
     * - member: Council members
     *
     * Permissions:
     * - can_read: inherited from parent community
     * - can_manage: council members
     */
    {
      type: 'council',
      relations: {
        parent_community: { this: {} },
        member: { this: {} },

        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_manage: {
          union: {
            child: [
              { computedUserset: { relation: 'member' } },
              {
                tupleToUserset: {
                  tupleset: { relation: 'parent_community' },
                  computedUserset: { relation: 'admin' },
                },
              },
            ],
          },
        },
        can_update: {
          union: {
            child: [
              { computedUserset: { relation: 'member' } },
              {
                tupleToUserset: {
                  tupleset: { relation: 'parent_community' },
                  computedUserset: { relation: 'admin' },
                },
              },
            ],
          },
        },
        can_delete: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'admin' },
          },
        },
      },
      metadata: {
        relations: {
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
          member: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },

    /**
     * POOL TYPE
     *
     * Resource aggregation for collective initiatives.
     *
     * Relations:
     * - parent_community: Link to parent community
     * - parent_council: Optional link to parent council
     * - manager: Pool managers (with pool role)
     *
     * Permissions:
     * - can_read: inherited from parent community
     * - can_manage: pool managers
     * - can_contribute: member of parent community
     */
    {
      type: 'pool',
      relations: {
        parent_community: { this: {} },
        parent_council: { this: {} },
        manager: { this: {} },

        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_manage: {
          computedUserset: { relation: 'manager' },
        },
        can_contribute: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'member' },
          },
        },
      },
      metadata: {
        relations: {
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
          parent_council: {
            directly_related_user_types: [{ type: 'council' }],
          },
          manager: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },

    /**
     * COMMENT TYPES
     */
    {
      type: 'wealth_comment',
      relations: {
        parent_wealth: { this: {} },
        parent_community: { this: {} },
        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
      },
      metadata: {
        relations: {
          parent_wealth: { directly_related_user_types: [{ type: 'wealth' }] },
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
        },
      },
    },

    /**
     * INVITE TYPE
     */
    {
      type: 'invite',
      relations: {
        parent_community: { this: {} },
        grants_admin: { this: {} },
        grants_member: { this: {} },
        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_create: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'admin' },
          },
        },
      },
      metadata: {
        relations: {
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
          grants_admin: { directly_related_user_types: [{ type: 'user' }] },
          grants_member: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },

    /**
     * FORUM CATEGORY TYPE
     */
    {
      type: 'forum_category',
      relations: {
        parent_community: { this: {} },
        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_manage: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'admin' },
          },
        },
      },
      metadata: {
        relations: {
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
        },
      },
    },

    /**
     * FORUM THREAD TYPE
     */
    {
      type: 'forum_thread',
      relations: {
        parent_community: { this: {} },
        author: { this: {} },
        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_update: {
          computedUserset: { relation: 'author' },
        },
        can_delete: {
          union: {
            child: [
              { computedUserset: { relation: 'author' } },
              {
                tupleToUserset: {
                  tupleset: { relation: 'parent_community' },
                  computedUserset: { relation: 'admin' },
                },
              },
            ],
          },
        },
        can_moderate: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'admin' },
          },
        },
      },
      metadata: {
        relations: {
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
          author: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },

    /**
     * FORUM POST TYPE
     */
    {
      type: 'forum_post',
      relations: {
        parent_community: { this: {} },
        parent_thread: { this: {} },
        author: { this: {} },
        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_update: {
          computedUserset: { relation: 'author' },
        },
        can_delete: {
          union: {
            child: [
              { computedUserset: { relation: 'author' } },
              {
                tupleToUserset: {
                  tupleset: { relation: 'parent_community' },
                  computedUserset: { relation: 'admin' },
                },
              },
            ],
          },
        },
      },
      metadata: {
        relations: {
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
          parent_thread: {
            directly_related_user_types: [{ type: 'forum_thread' }],
          },
          author: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },
  ],
};

/**
 * Role-Based Permission Model
 *
 * This model uses a ROLE → PERMISSION architecture where roles grant permissions.
 *
 * Architecture:
 * 1. ROLES - Assigned to users (two variants per role)
 * 2. PERMISSIONS - What users can actually do (union of roles)
 *
 * Role Variants:
 *
 * 1. Regular Roles (admin-assigned via UI):
 *    - Examples: forum_manager, pool_creator, dispute_handler
 *    - Assigned by: Admins through UI
 *    - Use case: "Alice should be a forum manager"
 *    - Tuple: user:alice → forum_manager → community:xyz
 *
 * 2. Trust Roles (auto-granted when trust >= threshold):
 *    - Examples: trust_forum_manager, trust_pool_creator
 *    - Assigned by: TrustSyncService (automatic)
 *    - Use case: "Users with 30+ trust unlock forum manager role"
 *    - Tuple: user:bob → trust_forum_manager → community:xyz
 *
 * 3. Permissions (what app code checks):
 *    - Examples: can_manage_forum, can_create_pool
 *    - Formula: admin OR regular_role OR trust_role
 *    - Example: can_manage_forum = admin OR forum_manager OR trust_forum_manager
 *    - App code checks ONLY permissions, never roles directly
 *
 * Workflow Examples:
 *
 * Example 1: Admin grants role via UI
 *   → Admin clicks "Make Alice forum manager"
 *   → System writes: user:alice → forum_manager → community:xyz
 *   → Alice now has can_manage_forum permission
 *
 * Example 2: User earns role via trust
 *   → Bob's trust increases from 29 → 30
 *   → TrustSyncService checks: minTrustForForumModeration = 30? ✓
 *   → System writes: user:bob → trust_forum_manager → community:xyz
 *   → Bob now has can_manage_forum permission
 *
 * Example 3: Community changes trust threshold
 *   → Admin changes minTrustForForumModeration from 30 → 35
 *   → TrustSyncService recalculates ALL users' trust roles
 *   → Users with trust 30-34 lose trust_forum_manager
 *   → Users with trust >= 35 keep trust_forum_manager
 *
 * Key Benefits:
 * - Clean separation: Roles (HOW you got it) vs Permissions (WHAT you can do)
 * - UI-friendly: Roles can be displayed as badges/tags
 * - Auditable: "Who has forum_manager?" vs "Who earned trust_forum_manager?"
 * - Flexible: Can mix admin-granted and trust-based for same user
 * - Scalable: No 100-trust limitation, trust can be unlimited
 */
