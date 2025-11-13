import { db as realDb } from '../db/index';
type DbClient = typeof realDb;

import { wealth, wealthRequests, trustHistory, items, needs, councilNeeds } from '../db/schema';
import { eq, and, gte, sql, count, isNull } from 'drizzle-orm';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export interface WealthOverviewData {
  openShares: number;
  totalShares: number;
  activeCategories: number;
  timeSeriesData: Array<{
    date: string;
    shares: number;
    requests: number;
    fulfilled: number;
  }>;
}

export interface WealthItemData {
  categoryName: string;
  subcategoryName: string;
  itemName: string;
  shareCount: number;
  valuePoints: number;
  trend: Array<{
    date: string;
    count: number;
  }>;
}

export interface TrustOverviewData {
  totalTrust: number;
  averageTrust: number;
  trustPerDay: number;
  timeSeriesData: Array<{
    date: string;
    trustAwarded: number;
    trustRemoved: number;
    netTrust: number;
  }>;
}

export interface TrustDistributionData {
  trustLevel: string;
  minScore: number;
  maxScore: number;
  userCount: number;
}

export interface NeedsOverviewData {
  totalActiveNeeds: number;
  totalActiveWants: number;
  activeMembers: number;
  activeCouncils: number;
  objectsVsServices: {
    objects: number;
    services: number;
  };
  timeSeriesData: Array<{
    date: string;
    needs: number;
    wants: number;
  }>;
}

export interface NeedsItemData {
  categoryName: string;
  itemName: string;
  priority: 'need' | 'want';
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  totalUnitsNeeded: number;
  memberCount: number;
  source: 'member' | 'council' | 'both';
}

export interface AggregatedNeedsData {
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  items: Array<{
    itemId: string;
    itemName: string;
    categoryName: string;
    needsTotal: number;
    wantsTotal: number;
    totalUnits: number;
    participantCount: number;
  }>;
}

export interface AggregatedWealthData {
  itemId: string;
  itemName: string;
  categoryName: string;
  activeShares: number;
  totalValuePoints: number;
  sharerCount: number;
  totalQuantity: number;
}

export class HealthAnalyticsRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  /**
   * Get the date cutoff for a given time range
   */
  private getDateCutoff(timeRange: TimeRange): Date {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get wealth overview statistics
   */
  async getWealthOverview(
    communityId: string,
    timeRange: TimeRange = '30d'
  ): Promise<WealthOverviewData> {
    const dateCutoff = this.getDateCutoff(timeRange);
    const dateCutoffStr = dateCutoff.toISOString();

    // Count open shares (active status)
    const openSharesResult = await this.db
      .select({ count: count() })
      .from(wealth)
      .where(and(eq(wealth.communityId, communityId), eq(wealth.status, 'active')));

    const openShares = openSharesResult[0]?.count || 0;

    // Count total shares in time range
    const totalSharesResult = await this.db
      .select({ count: count() })
      .from(wealth)
      .where(and(eq(wealth.communityId, communityId), gte(wealth.createdAt, dateCutoff)));

    const totalShares = totalSharesResult[0]?.count || 0;

    // Count active categories (distinct items used in the time range)
    const activeCategoriesResult = await this.db
      .selectDistinct({ itemId: wealth.itemId })
      .from(wealth)
      .where(and(eq(wealth.communityId, communityId), gte(wealth.createdAt, dateCutoff)));

    const activeCategories = activeCategoriesResult.length;

    // Get time series data - shares, requests, and fulfilled per day
    const timeSeriesResult = await this.db.execute<{
      date: string;
      shares: string;
      requests: string;
      fulfilled: string;
    }>(sql`
      WITH date_series AS (
        SELECT generate_series(
          ${dateCutoffStr}::timestamp,
          CURRENT_TIMESTAMP,
          '1 day'::interval
        )::date AS date
      ),
      shares_per_day AS (
        SELECT
          DATE(created_at) AS date,
          COUNT(*) AS shares
        FROM ${wealth}
        WHERE community_id = ${communityId}
          AND created_at >= ${dateCutoffStr}::timestamp
        GROUP BY DATE(created_at)
      ),
      requests_per_day AS (
        SELECT
          DATE(wr.created_at) AS date,
          COUNT(*) AS requests
        FROM ${wealthRequests} wr
        JOIN ${wealth} w ON wr.wealth_id = w.id
        WHERE w.community_id = ${communityId}
          AND wr.created_at >= ${dateCutoffStr}::timestamp
        GROUP BY DATE(wr.created_at)
      ),
      fulfilled_per_day AS (
        SELECT
          DATE(wr.updated_at) AS date,
          COUNT(*) AS fulfilled
        FROM ${wealthRequests} wr
        JOIN ${wealth} w ON wr.wealth_id = w.id
        WHERE w.community_id = ${communityId}
          AND wr.status = 'fulfilled'
          AND wr.updated_at >= ${dateCutoffStr}::timestamp
        GROUP BY DATE(wr.updated_at)
      )
      SELECT
        ds.date::text,
        COALESCE(spd.shares, 0)::text AS shares,
        COALESCE(rpd.requests, 0)::text AS requests,
        COALESCE(fpd.fulfilled, 0)::text AS fulfilled
      FROM date_series ds
      LEFT JOIN shares_per_day spd ON ds.date = spd.date
      LEFT JOIN requests_per_day rpd ON ds.date = rpd.date
      LEFT JOIN fulfilled_per_day fpd ON ds.date = fpd.date
      ORDER BY ds.date
    `);

    const timeSeriesData = (timeSeriesResult as any[]).map((row) => ({
      date: row.date,
      shares: parseInt(row.shares, 10),
      requests: parseInt(row.requests, 10),
      fulfilled: parseInt(row.fulfilled, 10),
    }));

    return {
      openShares,
      totalShares,
      activeCategories,
      timeSeriesData,
    };
  }

  /**
   * Get wealth items with statistics and trends
   */
  async getWealthItems(
    communityId: string,
    timeRange: TimeRange = '30d'
  ): Promise<WealthItemData[]> {
    const dateCutoff = this.getDateCutoff(timeRange);
    const dateCutoffStr = dateCutoff.toISOString();

    // Get items with share counts and value points
    // Note: We count all shares (regardless of time range) to show items with any activity
    // but we'll filter the trend data by time range
    const itemsResult = await this.db.execute<{
      item_id: string;
      item_name: string;
      item_kind: string;
      share_count: string;
      value_points: string;
    }>(sql`
      SELECT
        i.id AS item_id,
        i.name AS item_name,
        i.kind AS item_kind,
        COUNT(w.id)::text AS share_count,
        (i.wealth_value * COUNT(w.id))::text AS value_points
      FROM ${items} i
      LEFT JOIN ${wealth} w ON w.item_id = i.id
        AND w.community_id = ${communityId}
      WHERE i.community_id = ${communityId}
        AND i.deleted_at IS NULL
      GROUP BY i.id, i.name, i.kind, i.wealth_value
      HAVING COUNT(w.id) > 0
      ORDER BY COUNT(w.id) DESC
    `);

    // For each item, get trend data
    const itemsWithTrends: WealthItemData[] = [];

    for (const item of itemsResult as any[]) {
      const trendResult = await this.db.execute<{
        date: string;
        count: string;
      }>(sql`
        WITH date_series AS (
          SELECT generate_series(
            ${dateCutoffStr}::timestamp,
            CURRENT_TIMESTAMP,
            '1 day'::interval
          )::date AS date
        ),
        shares_per_day AS (
          SELECT
            DATE(created_at) AS date,
            COUNT(*) AS count
          FROM ${wealth}
          WHERE community_id = ${communityId}
            AND item_id = ${item.item_id}
            AND created_at >= ${dateCutoffStr}::timestamp
          GROUP BY DATE(created_at)
        )
        SELECT
          ds.date::text,
          COALESCE(spd.count, 0)::text AS count
        FROM date_series ds
        LEFT JOIN shares_per_day spd ON ds.date = spd.date
        ORDER BY ds.date
      `);

      itemsWithTrends.push({
        categoryName: item.item_kind === 'object' ? 'Objects' : 'Services',
        subcategoryName: item.item_kind === 'object' ? 'Physical Items' : 'Service Offerings',
        itemName: item.item_name,
        shareCount: parseInt(item.share_count, 10),
        valuePoints: parseFloat(item.value_points || '0'),

        trend: (trendResult as any[]).map((row) => ({
          date: row.date,
          count: parseInt(row.count, 10),
        })),
      });
    }

    return itemsWithTrends;
  }

  /**
   * Get trust overview statistics
   */
  async getTrustOverview(
    communityId: string,
    timeRange: TimeRange = '30d'
  ): Promise<TrustOverviewData> {
    const dateCutoff = this.getDateCutoff(timeRange);
    const dateCutoffStr = dateCutoff.toISOString();

    // Get total trust awards in time range
    const totalTrustResult = await this.db.execute<{ total: string }>(sql`
      SELECT COALESCE(SUM(points_delta), 0)::text AS total
      FROM ${trustHistory}
      WHERE community_id = ${communityId}
        AND action = 'award'
        AND created_at >= ${dateCutoffStr}::timestamp
    `);

    const totalTrust = parseInt((totalTrustResult as any[])[0]?.total || '0', 10);

    // Get average trust per user (only considering users with positive trust scores)
    const averageTrustResult = await this.db.execute<{
      average: string;
      count: string;
    }>(sql`
      SELECT
        COALESCE(AVG(total_trust), 0)::text AS average,
        COUNT(*)::text AS count
      FROM (
        SELECT
          to_user_id,
          SUM(CASE WHEN action = 'award' THEN points_delta ELSE -points_delta END) AS total_trust
        FROM ${trustHistory}
        WHERE community_id = ${communityId}
        GROUP BY to_user_id
        HAVING SUM(CASE WHEN action = 'award' THEN points_delta ELSE -points_delta END) > 0
      ) user_trust
    `);

    const averageTrust = parseFloat((averageTrustResult as any[])[0]?.average || '0');

    // Calculate trust per day
    const daysInRange = Math.ceil((Date.now() - dateCutoff.getTime()) / (1000 * 60 * 60 * 24));
    const trustPerDay = daysInRange > 0 ? totalTrust / daysInRange : 0;

    // Get time series data
    const timeSeriesResult = await this.db.execute<{
      date: string;
      trust_awarded: string;
      trust_removed: string;
      net_trust: string;
    }>(sql`
      WITH date_series AS (
        SELECT generate_series(
          ${dateCutoffStr}::timestamp,
          CURRENT_TIMESTAMP,
          '1 day'::interval
        )::date AS date
      ),
      trust_per_day AS (
        SELECT
          DATE(created_at) AS date,
          SUM(CASE WHEN action = 'award' THEN points_delta ELSE 0 END) AS trust_awarded,
          SUM(CASE WHEN action = 'remove' THEN points_delta ELSE 0 END) AS trust_removed,
          SUM(CASE WHEN action = 'award' THEN points_delta ELSE -points_delta END) AS net_trust
        FROM ${trustHistory}
        WHERE community_id = ${communityId}
          AND created_at >= ${dateCutoffStr}::timestamp
        GROUP BY DATE(created_at)
      )
      SELECT
        ds.date::text,
        COALESCE(tpd.trust_awarded, 0)::text AS trust_awarded,
        COALESCE(tpd.trust_removed, 0)::text AS trust_removed,
        COALESCE(tpd.net_trust, 0)::text AS net_trust
      FROM date_series ds
      LEFT JOIN trust_per_day tpd ON ds.date = tpd.date
      ORDER BY ds.date
    `);

    const timeSeriesData = (timeSeriesResult as any[]).map((row) => ({
      date: row.date,
      trustAwarded: parseInt(row.trust_awarded, 10),
      trustRemoved: parseInt(row.trust_removed, 10),
      netTrust: parseInt(row.net_trust, 10),
    }));

    return {
      totalTrust,
      averageTrust: Math.round(averageTrust * 100) / 100,
      trustPerDay: Math.round(trustPerDay * 100) / 100,
      timeSeriesData,
    };
  }

  /**
   * Get trust distribution by levels
   */
  async getTrustDistribution(
    communityId: string,
    trustLevels: Array<{ name: string; minScore: number }>
  ): Promise<TrustDistributionData[]> {
    // Get user trust scores
    const userTrustResult = await this.db.execute<{
      user_id: string;
      trust_score: string;
    }>(sql`
      SELECT
        to_user_id AS user_id,
        SUM(CASE WHEN action = 'award' THEN points_delta ELSE -points_delta END)::text AS trust_score
      FROM ${trustHistory}
      WHERE community_id = ${communityId}
      GROUP BY to_user_id
    `);

    const userTrustScores = (userTrustResult as any[]).map((row) => ({
      userId: row.user_id,
      trustScore: parseInt(row.trust_score, 10),
    }));

    // Sort trust levels by minScore ascending
    const sortedLevels = [...trustLevels].sort((a, b) => a.minScore - b.minScore);

    // Build distribution
    const distribution: TrustDistributionData[] = sortedLevels.map((level, index) => {
      const nextLevel = sortedLevels[index + 1];
      const minScore = level.minScore;
      const maxScore = nextLevel ? nextLevel.minScore - 1 : Infinity;

      const userCount = userTrustScores.filter(
        (user) => user.trustScore >= minScore && user.trustScore <= maxScore
      ).length;

      return {
        trustLevel: level.name,
        minScore,
        maxScore: maxScore === Infinity ? 999999 : maxScore,
        userCount,
      };
    });

    return distribution;
  }

  /**
   * Get needs overview statistics
   */
  async getNeedsOverview(
    communityId: string,
    timeRange: TimeRange = '30d'
  ): Promise<NeedsOverviewData> {
    const dateCutoff = this.getDateCutoff(timeRange);
    const dateCutoffStr = dateCutoff.toISOString();

    // Count active needs (priority='need')
    const activeNeedsResult = await this.db
      .select({ count: count() })
      .from(needs)
      .where(
        and(
          eq(needs.communityId, communityId),
          eq(needs.status, 'active'),
          eq(needs.priority, 'need'),
          isNull(needs.deletedAt)
        )
      );

    const totalActiveNeeds = activeNeedsResult[0]?.count || 0;

    // Count active wants (priority='want')
    const activeWantsResult = await this.db
      .select({ count: count() })
      .from(needs)
      .where(
        and(
          eq(needs.communityId, communityId),
          eq(needs.status, 'active'),
          eq(needs.priority, 'want'),
          isNull(needs.deletedAt)
        )
      );

    const totalActiveWants = activeWantsResult[0]?.count || 0;

    // Count active members who have published needs
    const activeMembersResult = await this.db
      .selectDistinct({ createdBy: needs.createdBy })
      .from(needs)
      .where(
        and(eq(needs.communityId, communityId), eq(needs.status, 'active'), isNull(needs.deletedAt))
      );

    const activeMembers = activeMembersResult.length;

    // Count active councils who have published needs
    const activeCouncilsResult = await this.db
      .selectDistinct({ councilId: councilNeeds.councilId })
      .from(councilNeeds)
      .where(
        and(
          eq(councilNeeds.communityId, communityId),
          eq(councilNeeds.status, 'active'),
          isNull(councilNeeds.deletedAt)
        )
      );

    const activeCouncils = activeCouncilsResult.length;

    // Get objects vs services breakdown
    const objectsVsServicesResult = await this.db.execute<{
      objects: string;
      services: string;
    }>(sql`
      SELECT
        COUNT(CASE WHEN i.kind = 'object' THEN 1 END)::text AS objects,
        COUNT(CASE WHEN i.kind = 'service' THEN 1 END)::text AS services
      FROM (
        SELECT DISTINCT n.item_id
        FROM ${needs} n
        WHERE n.community_id = ${communityId}
          AND n.status = 'active'
          AND n.deleted_at IS NULL
        UNION
        SELECT DISTINCT cn.item_id
        FROM ${councilNeeds} cn
        WHERE cn.community_id = ${communityId}
          AND cn.status = 'active'
          AND cn.deleted_at IS NULL
      ) active_items
      JOIN ${items} i ON i.id = active_items.item_id
    `);

    const objectsVsServices = {
      objects: parseInt((objectsVsServicesResult as any[])[0]?.objects || '0', 10),

      services: parseInt((objectsVsServicesResult as any[])[0]?.services || '0', 10),
    };

    // Get time series data - needs and wants created per day
    const timeSeriesResult = await this.db.execute<{
      date: string;
      needs: string;
      wants: string;
    }>(sql`
      WITH date_series AS (
        SELECT generate_series(
          ${dateCutoffStr}::timestamp,
          CURRENT_TIMESTAMP,
          '1 day'::interval
        )::date AS date
      ),
      needs_per_day AS (
        SELECT
          DATE(created_at) AS date,
          COUNT(CASE WHEN priority = 'need' THEN 1 END) AS needs,
          COUNT(CASE WHEN priority = 'want' THEN 1 END) AS wants
        FROM (
          SELECT created_at, priority FROM ${needs}
          WHERE community_id = ${communityId}
            AND created_at >= ${dateCutoffStr}::timestamp
          UNION ALL
          SELECT created_at, priority FROM ${councilNeeds}
          WHERE community_id = ${communityId}
            AND created_at >= ${dateCutoffStr}::timestamp
        ) all_needs
        GROUP BY DATE(created_at)
      )
      SELECT
        ds.date::text,
        COALESCE(npd.needs, 0)::text AS needs,
        COALESCE(npd.wants, 0)::text AS wants
      FROM date_series ds
      LEFT JOIN needs_per_day npd ON ds.date = npd.date
      ORDER BY ds.date
    `);

    const timeSeriesData = (timeSeriesResult as any[]).map((row) => ({
      date: row.date,
      needs: parseInt(row.needs, 10),
      wants: parseInt(row.wants, 10),
    }));

    return {
      totalActiveNeeds,
      totalActiveWants,
      activeMembers,
      activeCouncils,
      objectsVsServices,
      timeSeriesData,
    };
  }

  /**
   * Get needs items with aggregation
   */
  async getNeedsItems(
    communityId: string,
    _timeRange: TimeRange = '30d'
  ): Promise<NeedsItemData[]> {
    // Get member needs aggregation
    const memberNeedsResult = await this.db.execute<{
      item_id: string;
      item_name: string;
      item_kind: string;
      priority: string;
      recurrence: string | null;
      is_recurring: boolean;
      total_units_needed: string;
      member_count: string;
    }>(sql`
      SELECT
        n.item_id,
        i.name AS item_name,
        i.kind AS item_kind,
        n.priority,
        n.recurrence,
        n.is_recurring,
        SUM(n.units_needed)::text AS total_units_needed,
        COUNT(DISTINCT n.created_by)::text AS member_count
      FROM ${needs} n
      JOIN ${items} i ON n.item_id = i.id
      WHERE n.community_id = ${communityId}
        AND n.status = 'active'
        AND n.deleted_at IS NULL
      GROUP BY n.item_id, i.name, i.kind, n.priority, n.recurrence, n.is_recurring
    `);

    // Get council needs aggregation
    const councilNeedsResult = await this.db.execute<{
      item_id: string;
      item_name: string;
      item_kind: string;
      priority: string;
      recurrence: string | null;
      is_recurring: boolean;
      total_units_needed: string;
      member_count: string;
    }>(sql`
      SELECT
        cn.item_id,
        i.name AS item_name,
        i.kind AS item_kind,
        cn.priority,
        cn.recurrence,
        cn.is_recurring,
        SUM(cn.units_needed)::text AS total_units_needed,
        COUNT(DISTINCT cn.council_id)::text AS member_count
      FROM ${councilNeeds} cn
      JOIN ${items} i ON cn.item_id = i.id
      WHERE cn.community_id = ${communityId}
        AND cn.status = 'active'
        AND cn.deleted_at IS NULL
      GROUP BY cn.item_id, i.name, i.kind, cn.priority, cn.recurrence, cn.is_recurring
    `);

    // Merge results by item_id + priority + recurrence
    const mergedMap = new Map<string, NeedsItemData>();

    for (const row of memberNeedsResult as any[]) {
      // Transform NULL recurrence to 'one-time' in JavaScript
      const recurrence = row.is_recurring && row.recurrence ? row.recurrence : 'one-time';
      const key = `${row.item_id}-${row.priority}-${recurrence}`;
      mergedMap.set(key, {
        categoryName: row.item_kind === 'object' ? 'Objects' : 'Services',
        itemName: row.item_name,
        priority: row.priority as 'need' | 'want',
        recurrence: recurrence as 'one-time' | 'daily' | 'weekly' | 'monthly',
        totalUnitsNeeded: parseInt(row.total_units_needed, 10),
        memberCount: parseInt(row.member_count, 10),
        source: 'member',
      });
    }

    for (const row of councilNeedsResult as any[]) {
      // Transform NULL recurrence to 'one-time' in JavaScript
      const recurrence = row.is_recurring && row.recurrence ? row.recurrence : 'one-time';
      const key = `${row.item_id}-${row.priority}-${recurrence}`;
      const existing = mergedMap.get(key);

      if (existing) {
        // Both member and council have this need
        existing.totalUnitsNeeded += parseInt(row.total_units_needed, 10);
        existing.memberCount += parseInt(row.member_count, 10);
        existing.source = 'both';
      } else {
        mergedMap.set(key, {
          categoryName: row.item_kind === 'object' ? 'Objects' : 'Services',
          itemName: row.item_name,
          priority: row.priority as 'need' | 'want',
          recurrence: recurrence as 'one-time' | 'daily' | 'weekly' | 'monthly',
          totalUnitsNeeded: parseInt(row.total_units_needed, 10),
          memberCount: parseInt(row.member_count, 10),
          source: 'council',
        });
      }
    }

    return Array.from(mergedMap.values());
  }

  /**
   * Get aggregated needs by recurrence pattern
   * Returns total units needed per item, grouped by recurrence
   */
  async getAggregatedNeeds(communityId: string): Promise<AggregatedNeedsData[]> {
    // Query both needs and council_needs tables, combining them with UNION
    const aggregatedResult = await this.db.execute<{
      recurrence_pattern: string | null;
      item_id: string;
      item_name: string;
      item_kind: string;
      needs_total: string;
      wants_total: string;
      total_units: string;
      participant_count: string;
    }>(sql`
      WITH combined_needs AS (
        SELECT
          item_id,
          priority,
          units_needed,
          created_by as participant_id,
          recurrence as recurrence_pattern
        FROM ${needs}
        WHERE community_id = ${communityId}
          AND status = 'active'
          AND deleted_at IS NULL

        UNION ALL

        SELECT
          item_id,
          priority,
          units_needed,
          CONCAT('council_', council_id) as participant_id,
          recurrence as recurrence_pattern
        FROM ${councilNeeds}
        WHERE community_id = ${communityId}
          AND status = 'active'
          AND deleted_at IS NULL
      )
      SELECT
        recurrence_pattern,
        cn.item_id,
        i.name as item_name,
        i.kind as item_kind,
        SUM(CASE WHEN priority = 'need' THEN units_needed ELSE 0 END)::text as needs_total,
        SUM(CASE WHEN priority = 'want' THEN units_needed ELSE 0 END)::text as wants_total,
        SUM(units_needed)::text as total_units,
        COUNT(DISTINCT participant_id)::text as participant_count
      FROM combined_needs cn
      JOIN ${items} i ON cn.item_id = i.id
      GROUP BY recurrence_pattern, cn.item_id, i.name, i.kind
      ORDER BY recurrence_pattern, SUM(units_needed) DESC
    `);

    // Transform flat results into grouped structure (4 recurrence groups)
    const recurrenceGroups = ['one-time', 'daily', 'weekly', 'monthly'] as const;
    const groupedData: AggregatedNeedsData[] = recurrenceGroups.map((recurrence) => ({
      recurrence,
      items: [],
    }));

    // Populate groups with data

    for (const row of aggregatedResult as any[]) {
      // Transform NULL recurrence to 'one-time' in JavaScript
      const recurrence = row.recurrence_pattern || 'one-time';
      const groupIndex = recurrenceGroups.indexOf(
        recurrence as 'one-time' | 'daily' | 'weekly' | 'monthly'
      );
      if (groupIndex !== -1) {
        groupedData[groupIndex].items.push({
          itemId: row.item_id,
          itemName: row.item_name,
          categoryName: row.item_kind === 'object' ? 'Objects' : 'Services',
          needsTotal: parseInt(row.needs_total, 10),
          wantsTotal: parseInt(row.wants_total, 10),
          totalUnits: parseInt(row.total_units, 10),
          participantCount: parseInt(row.participant_count, 10),
        });
      }
    }

    return groupedData;
  }

  /**
   * Get aggregated wealth shares by item
   * Returns total active shares per item
   */
  async getAggregatedWealth(communityId: string): Promise<AggregatedWealthData[]> {
    const aggregatedResult = await this.db.execute<{
      item_id: string;
      item_name: string;
      item_kind: string;
      active_shares: string;
      total_value_points: string;
      sharer_count: string;
      total_quantity: string;
    }>(sql`
      SELECT
        w.item_id,
        i.name as item_name,
        i.kind as item_kind,
        COUNT(w.id)::text as active_shares,
        SUM(i.wealth_value * COALESCE(w.units_available, 1))::text as total_value_points,
        COUNT(DISTINCT w.created_by)::text as sharer_count,
        SUM(COALESCE(w.units_available, 1))::text as total_quantity
      FROM ${wealth} w
      INNER JOIN ${items} i ON w.item_id = i.id
      WHERE w.community_id = ${communityId}
        AND w.status = 'active'
      GROUP BY w.item_id, i.name, i.kind
      ORDER BY COUNT(w.id) DESC
    `);

    return (aggregatedResult as any[]).map((row) => ({
      itemId: row.item_id,
      itemName: row.item_name,
      categoryName: row.item_kind === 'object' ? 'Objects' : 'Services',
      activeShares: parseInt(row.active_shares, 10),
      totalValuePoints: parseFloat(row.total_value_points || '0'),
      sharerCount: parseInt(row.sharer_count, 10),
      totalQuantity: parseInt(row.total_quantity, 10),
    }));
  }
}

// Default instance for production code paths
export const healthAnalyticsRepository = new HealthAnalyticsRepository(realDb);
