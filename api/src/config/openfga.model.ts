/**
 * OpenFGA Authorization Model for ReBAC (Relationship-Based Access Control)
 *
 * This model defines ALL authorization logic for the community management system.
 * NO authorization logic should be embedded in application code - everything is evaluated by OpenFGA.
 *
 * Key Concepts:
 * - Trust relationships are modeled as OpenFGA relationships (trust_level_X)
 * - Community configurations (trust thresholds) are stored as relationships
 * - All 5 permission models are implemented through relationship-based checks
 * - Contextual authorization (trust scores, council memberships, pool roles) via relationships
 *
 * Permission Models Supported:
 * 1. Admin permissions (direct admin relation)
 * 2. Trust threshold permissions (trust_level_X relations)
 * 3. User-based permissions (explicit user grants)
 * 4. Council-based permissions (council member relations)
 * 5. Pool role permissions (pool role relations)
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
     * Relations:
     * - admin: Community administrators (full control)
     * - member: Regular community members
     * - reader: Read-only access
     * - trust_level_0 through trust_level_100: Trust score relationships
     *   Each user is assigned to their trust level (e.g., user with 15 trust -> trust_level_15)
     * - can_award_trust_grantor: Users/admins who grant trust-awarding permission
     * - poll_creator: Users explicitly granted poll creation permission
     * - dispute_handler: Users/councils with dispute handling permission
     *
     * Permissions:
     * - can_read: admin, member, or reader
     * - can_update: admin only
     * - can_delete: admin only
     * - can_create_wealth: member or admin with sufficient trust
     * - can_view_wealth: member/admin with minTrustForWealth
     * - can_award_trust: has trust_level >= minTrustToAwardTrust OR admin OR explicit grant
     * - can_create_poll: has trust_level >= minTrustForPolls OR admin OR explicit poll_creator grant
     * - can_handle_dispute: has trust_level >= minTrustForDisputes OR is dispute_handler
     */
    {
      type: 'community',
      relations: {
        // Core roles
        admin: { this: {} },
        member: { this: {} },
        reader: { this: {} },

        // Trust level relationships (0-100)
        // Users are assigned to their trust level relation
        trust_level_0: { this: {} },
        trust_level_1: { this: {} },
        trust_level_2: { this: {} },
        trust_level_3: { this: {} },
        trust_level_4: { this: {} },
        trust_level_5: { this: {} },
        trust_level_6: { this: {} },
        trust_level_7: { this: {} },
        trust_level_8: { this: {} },
        trust_level_9: { this: {} },
        trust_level_10: { this: {} },
        trust_level_11: { this: {} },
        trust_level_12: { this: {} },
        trust_level_13: { this: {} },
        trust_level_14: { this: {} },
        trust_level_15: { this: {} },
        trust_level_16: { this: {} },
        trust_level_17: { this: {} },
        trust_level_18: { this: {} },
        trust_level_19: { this: {} },
        trust_level_20: { this: {} },
        trust_level_21: { this: {} },
        trust_level_22: { this: {} },
        trust_level_23: { this: {} },
        trust_level_24: { this: {} },
        trust_level_25: { this: {} },
        trust_level_26: { this: {} },
        trust_level_27: { this: {} },
        trust_level_28: { this: {} },
        trust_level_29: { this: {} },
        trust_level_30: { this: {} },
        trust_level_31: { this: {} },
        trust_level_32: { this: {} },
        trust_level_33: { this: {} },
        trust_level_34: { this: {} },
        trust_level_35: { this: {} },
        trust_level_36: { this: {} },
        trust_level_37: { this: {} },
        trust_level_38: { this: {} },
        trust_level_39: { this: {} },
        trust_level_40: { this: {} },
        trust_level_41: { this: {} },
        trust_level_42: { this: {} },
        trust_level_43: { this: {} },
        trust_level_44: { this: {} },
        trust_level_45: { this: {} },
        trust_level_46: { this: {} },
        trust_level_47: { this: {} },
        trust_level_48: { this: {} },
        trust_level_49: { this: {} },
        trust_level_50: { this: {} },
        trust_level_51: { this: {} },
        trust_level_52: { this: {} },
        trust_level_53: { this: {} },
        trust_level_54: { this: {} },
        trust_level_55: { this: {} },
        trust_level_56: { this: {} },
        trust_level_57: { this: {} },
        trust_level_58: { this: {} },
        trust_level_59: { this: {} },
        trust_level_60: { this: {} },
        trust_level_61: { this: {} },
        trust_level_62: { this: {} },
        trust_level_63: { this: {} },
        trust_level_64: { this: {} },
        trust_level_65: { this: {} },
        trust_level_66: { this: {} },
        trust_level_67: { this: {} },
        trust_level_68: { this: {} },
        trust_level_69: { this: {} },
        trust_level_70: { this: {} },
        trust_level_71: { this: {} },
        trust_level_72: { this: {} },
        trust_level_73: { this: {} },
        trust_level_74: { this: {} },
        trust_level_75: { this: {} },
        trust_level_76: { this: {} },
        trust_level_77: { this: {} },
        trust_level_78: { this: {} },
        trust_level_79: { this: {} },
        trust_level_80: { this: {} },
        trust_level_81: { this: {} },
        trust_level_82: { this: {} },
        trust_level_83: { this: {} },
        trust_level_84: { this: {} },
        trust_level_85: { this: {} },
        trust_level_86: { this: {} },
        trust_level_87: { this: {} },
        trust_level_88: { this: {} },
        trust_level_89: { this: {} },
        trust_level_90: { this: {} },
        trust_level_91: { this: {} },
        trust_level_92: { this: {} },
        trust_level_93: { this: {} },
        trust_level_94: { this: {} },
        trust_level_95: { this: {} },
        trust_level_96: { this: {} },
        trust_level_97: { this: {} },
        trust_level_98: { this: {} },
        trust_level_99: { this: {} },
        trust_level_100: { this: {} },

        // User-based permission grants
        poll_creator: { this: {} },
        dispute_handler: { this: {} },
        forum_manager: { this: {} },
        item_manager: { this: {} },

        // Configuration metadata (stored as special relations with config:communityId)
        // min_trust_for_wealth_X (config user assigned to this relation to indicate threshold)
        // min_trust_to_award_trust_X
        // min_trust_for_polls_X
        // min_trust_for_disputes_X

        // Basic permissions
        can_read: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'member' } },
              { computedUserset: { relation: 'reader' } },
            ],
          },
        },
        can_update: {
          computedUserset: { relation: 'admin' },
        },
        can_delete: {
          computedUserset: { relation: 'admin' },
        },
        can_manage_items: {
          union: {
            child: [
              { computedUserset: { relation: 'admin' } },
              { computedUserset: { relation: 'item_manager' } },
              { computedUserset: { relation: 'trust_level_20' } },
            ],
          },
        },
      },
      metadata: {
        relations: {
          admin: { directly_related_user_types: [{ type: 'user' }] },
          member: { directly_related_user_types: [{ type: 'user' }] },
          reader: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_0: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_1: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_2: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_3: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_4: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_5: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_6: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_7: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_8: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_9: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_10: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_11: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_12: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_13: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_14: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_15: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_16: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_17: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_18: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_19: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_20: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_21: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_22: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_23: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_24: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_25: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_26: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_27: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_28: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_29: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_30: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_31: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_32: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_33: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_34: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_35: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_36: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_37: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_38: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_39: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_40: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_41: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_42: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_43: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_44: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_45: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_46: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_47: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_48: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_49: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_50: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_51: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_52: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_53: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_54: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_55: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_56: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_57: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_58: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_59: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_60: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_61: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_62: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_63: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_64: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_65: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_66: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_67: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_68: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_69: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_70: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_71: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_72: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_73: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_74: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_75: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_76: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_77: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_78: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_79: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_80: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_81: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_82: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_83: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_84: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_85: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_86: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_87: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_88: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_89: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_90: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_91: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_92: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_93: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_94: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_95: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_96: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_97: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_98: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_99: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_100: { directly_related_user_types: [{ type: 'user' }] },
          poll_creator: { directly_related_user_types: [{ type: 'user' }] },
          dispute_handler: {
            directly_related_user_types: [{ type: 'user' }, { type: 'council' }],
          },
          forum_manager: { directly_related_user_types: [{ type: 'user' }] },
          item_manager: { directly_related_user_types: [{ type: 'user' }] },
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
     * Specialized community actors with trust scores and resource management.
     *
     * Relations:
     * - parent_community: Link to parent community
     * - member: Council members
     * - trust_level_X: Council's trust level (based on member trust awards)
     *
     * Permissions:
     * - can_read: inherited from parent community
     * - can_manage: council members
     * - can_create_initiative: council members
     */
    {
      type: 'council',
      relations: {
        parent_community: { this: {} },
        member: { this: {} },

        // Trust levels for councils (0-100, same as users)
        trust_level_0: { this: {} },
        trust_level_5: { this: {} },
        trust_level_10: { this: {} },
        trust_level_15: { this: {} },
        trust_level_20: { this: {} },
        trust_level_25: { this: {} },
        trust_level_30: { this: {} },
        trust_level_35: { this: {} },
        trust_level_40: { this: {} },
        trust_level_45: { this: {} },
        trust_level_50: { this: {} },
        trust_level_60: { this: {} },
        trust_level_70: { this: {} },
        trust_level_80: { this: {} },
        trust_level_90: { this: {} },
        trust_level_100: { this: {} },

        can_read: {
          tupleToUserset: {
            tupleset: { relation: 'parent_community' },
            computedUserset: { relation: 'can_read' },
          },
        },
        can_manage: {
          computedUserset: { relation: 'member' },
        },
      },
      metadata: {
        relations: {
          parent_community: {
            directly_related_user_types: [{ type: 'community' }],
          },
          member: { directly_related_user_types: [{ type: 'user' }] },
          trust_level_0: { directly_related_user_types: [{ type: 'council' }] },
          trust_level_5: { directly_related_user_types: [{ type: 'council' }] },
          trust_level_10: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_15: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_20: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_25: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_30: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_35: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_40: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_45: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_50: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_60: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_70: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_80: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_90: {
            directly_related_user_types: [{ type: 'council' }],
          },
          trust_level_100: {
            directly_related_user_types: [{ type: 'council' }],
          },
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
        grants_reader: { this: {} },
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
          grants_reader: { directly_related_user_types: [{ type: 'user' }] },
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

    /**
     * SYSTEM TYPE
     */
    {
      type: 'system',
      relations: {
        superadmin: { this: {} },
      },
      metadata: {
        relations: {
          superadmin: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },
  ],
};

/**
 * DSL representation for reference (used by OpenFGA CLI)
 *
 * Key patterns:
 *
 * 1. Trust-based permissions (threshold checking):
 *    - Users are assigned to trust_level_X relation matching their trust score
 *    - Permissions check if user has trust_level_Y where Y >= required threshold
 *    - Example: can_award_trust checks trust_level_15 or higher
 *
 * 2. User-based permissions (explicit grants):
 *    - Admins assign users to special relations (poll_creator, dispute_handler)
 *    - Permissions check these relations directly
 *
 * 3. Council-based permissions:
 *    - Users have council#member relation
 *    - Councils have trust levels just like users
 *    - Permissions can check council membership or council trust levels
 *
 * 4. Pool role permissions:
 *    - Users assigned to pool#manager relation
 *    - Permissions check manager relation for pool operations
 *
 * 5. Admin permissions:
 *    - Admins have community#admin relation
 *    - Admin relation grants elevated permissions across all resources
 */
