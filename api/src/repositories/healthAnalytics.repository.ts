import { db as realDb } from '../db/index';
import { wealth, wealthRequests, trustHistory, items } from '../db/schema';
import { eq, and, gte, sql, desc, count } from 'drizzle-orm';

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

export class HealthAnalyticsRepository {
  private db: any;

  constructor(db: any) {
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
}

// Default instance for production code paths
export const healthAnalyticsRepository = new HealthAnalyticsRepository(realDb);
