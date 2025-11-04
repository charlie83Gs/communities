#!/usr/bin/env bun
/**
 * Sync Authorization Data to OpenFGA
 *
 * This script syncs all authorization-related data from PostgreSQL to OpenFGA.
 * Run this script to initialize OpenFGA or to perform a full resync.
 *
 * Usage:
 *   bun run scripts/sync-to-openfga.ts [--community=<id>] [--dry-run]
 *
 * Options:
 *   --community=<id>  Sync only specific community (default: all communities)
 *   --dry-run         Show what would be synced without making changes
 *   --verbose         Show detailed progress
 */

import { openFGAService } from '../src/services/openfga.service';
import { trustSyncService } from '../src/services/trustSync.service';
import { communityRepository } from '../src/repositories/community.repository';
import { communityMemberRepository } from '../src/repositories/communityMember.repository';
import { trustViewRepository } from '../src/repositories/trustView.repository';
import logger from '../src/utils/logger';

interface SyncOptions {
  communityId?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

interface SyncStats {
  communities: number;
  members: number;
  trustScores: number;
  roles: number;
  userPermissions: number;
  errors: number;
}

async function parseArgs(): Promise<SyncOptions> {
  const args = process.argv.slice(2);
  const options: SyncOptions = {};

  for (const arg of args) {
    if (arg.startsWith('--community=')) {
      options.communityId = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    }
  }

  return options;
}

async function syncCommunityMembers(
  communityId: string,
  dryRun: boolean,
  verbose: boolean
): Promise<number> {
  const memberships = await communityMemberRepository.findByCommunity(communityId);

  if (verbose) {
    console.log(`  Found ${memberships.length} memberships`);
  }

  if (dryRun) {
    return memberships.length;
  }

  const writes: Array<{ user: string; relation: string; object: string }> = [];

  // Group by user to handle multiple roles
  const userRoles = new Map<string, Set<string>>();

  for (const membership of memberships) {
    if (!userRoles.has(membership.userId)) {
      userRoles.set(membership.userId, new Set());
    }
    userRoles.get(membership.userId)!.add(membership.role);
  }

  // Write all role relations
  for (const [userId, roles] of userRoles.entries()) {
    for (const role of roles) {
      writes.push({
        user: `user:${userId}`,
        relation: role,
        object: `community:${communityId}`,
      });
    }
  }

  await openFGAService.batchWrite(writes, []);

  return writes.length;
}

async function syncCommunityTrustScores(
  communityId: string,
  dryRun: boolean,
  verbose: boolean
): Promise<number> {
  const trustViews = await trustViewRepository.getAllForCommunity(communityId);

  if (verbose) {
    console.log(`  Found ${trustViews.length} trust scores`);
  }

  if (dryRun) {
    return trustViews.length;
  }

  const writes: Array<{ user: string; relation: string; object: string }> = [];

  for (const trustView of trustViews) {
    const clampedScore = Math.max(0, Math.min(100, Math.floor(trustView.points)));
    writes.push({
      user: `user:${trustView.userId}`,
      relation: `trust_level_${clampedScore}`,
      object: `community:${communityId}`,
    });

    if (verbose && trustView.points > 0) {
      console.log(`    User ${trustView.userId}: ${trustView.points} → trust_level_${clampedScore}`);
    }
  }

  await openFGAService.batchWrite(writes, []);

  return writes.length;
}

async function syncCommunityUserPermissions(
  communityId: string,
  dryRun: boolean,
  verbose: boolean
): Promise<number> {
  const community = await communityRepository.findById(communityId);

  if (!community) {
    throw new Error(`Community ${communityId} not found`);
  }

  const writes: Array<{ user: string; relation: string; object: string }> = [];

  // Sync poll creators
  const pollCreators = (community.pollCreatorUsers as string[]) || [];
  for (const userId of pollCreators) {
    writes.push({
      user: `user:${userId}`,
      relation: 'poll_creator',
      object: `community:${communityId}`,
    });
  }

  if (verbose && pollCreators.length > 0) {
    console.log(`  Poll creators: ${pollCreators.length}`);
  }

  // Sync dispute handlers (from community config)
  // Note: This is a simplified version - full implementation would need council data
  // For now, we skip this as it requires additional schema for councils

  if (dryRun) {
    return writes.length;
  }

  await openFGAService.batchWrite(writes, []);

  return writes.length;
}

async function syncCommunity(
  communityId: string,
  options: SyncOptions
): Promise<Partial<SyncStats>> {
  const stats: Partial<SyncStats> = {
    communities: 1,
    members: 0,
    trustScores: 0,
    userPermissions: 0,
    errors: 0,
  };

  try {
    const community = await communityRepository.findById(communityId);

    if (!community) {
      console.error(`❌ Community ${communityId} not found`);
      stats.errors = 1;
      return stats;
    }

    console.log(`\n📦 Syncing community: ${community.name} (${communityId})`);

    // 1. Sync member roles
    try {
      const memberCount = await syncCommunityMembers(
        communityId,
        options.dryRun || false,
        options.verbose || false
      );
      stats.members = memberCount;
      console.log(`  ✓ Synced ${memberCount} member roles`);
    } catch (error) {
      console.error(`  ❌ Failed to sync members:`, error);
      stats.errors! += 1;
    }

    // 2. Sync trust scores
    try {
      const trustCount = await syncCommunityTrustScores(
        communityId,
        options.dryRun || false,
        options.verbose || false
      );
      stats.trustScores = trustCount;
      console.log(`  ✓ Synced ${trustCount} trust scores`);
    } catch (error) {
      console.error(`  ❌ Failed to sync trust scores:`, error);
      stats.errors! += 1;
    }

    // 3. Sync user permissions
    try {
      const permCount = await syncCommunityUserPermissions(
        communityId,
        options.dryRun || false,
        options.verbose || false
      );
      stats.userPermissions = permCount;
      console.log(`  ✓ Synced ${permCount} user permissions`);
    } catch (error) {
      console.error(`  ❌ Failed to sync user permissions:`, error);
      stats.errors! += 1;
    }

    return stats;
  } catch (error) {
    console.error(`❌ Failed to sync community ${communityId}:`, error);
    stats.errors = 1;
    return stats;
  }
}

async function main() {
  const options = await parseArgs();

  console.log('\n🚀 OpenFGA Sync Script');
  console.log('======================\n');

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Initialize OpenFGA
  console.log('Initializing OpenFGA...');
  try {
    await openFGAService.initialize();
    console.log('✓ OpenFGA initialized\n');
  } catch (error) {
    console.error('❌ Failed to initialize OpenFGA:', error);
    process.exit(1);
  }

  const totalStats: SyncStats = {
    communities: 0,
    members: 0,
    trustScores: 0,
    roles: 0,
    userPermissions: 0,
    errors: 0,
  };

  try {
    if (options.communityId) {
      // Sync specific community
      const stats = await syncCommunity(options.communityId, options);
      totalStats.communities += stats.communities || 0;
      totalStats.members += stats.members || 0;
      totalStats.trustScores += stats.trustScores || 0;
      totalStats.userPermissions += stats.userPermissions || 0;
      totalStats.errors += stats.errors || 0;
    } else {
      // Sync all communities
      const communities = await communityRepository.findAll();
      console.log(`Found ${communities.length} communities to sync\n`);

      for (const community of communities) {
        const stats = await syncCommunity(community.id, options);
        totalStats.communities += stats.communities || 0;
        totalStats.members += stats.members || 0;
        totalStats.trustScores += stats.trustScores || 0;
        totalStats.userPermissions += stats.userPermissions || 0;
        totalStats.errors += stats.errors || 0;
      }
    }

    console.log('\n📊 Sync Summary');
    console.log('===============');
    console.log(`Communities synced: ${totalStats.communities}`);
    console.log(`Member roles: ${totalStats.members}`);
    console.log(`Trust scores: ${totalStats.trustScores}`);
    console.log(`User permissions: ${totalStats.userPermissions}`);
    console.log(`Errors: ${totalStats.errors}`);

    if (options.dryRun) {
      console.log('\n🔍 This was a dry run - no changes were made');
    } else {
      console.log('\n✅ Sync completed successfully');
    }

    process.exit(totalStats.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
