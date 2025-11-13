import { Request, Response, NextFunction } from 'express';
import { appUserRepository } from '@repositories/appUser.repository';
import { inviteService } from '@/services/invite.service';
import { userPreferencesService } from '@/services/userPreferences.service';
import { communityService } from '@/services/community.service';
import { trustHistoryRepository } from '@repositories/trustHistory.repository';
import { trustViewRepository } from '@repositories/trustView.repository';
import { ApiResponse } from '@/utils/response';
import { db } from '@/db';
import { trustHistory } from '@/db/schema/trustHistory.schema';
import { appUsers } from '@/db/schema/app_users.schema';
import { communities } from '@/db/schema/communities.schema';
import { eq, desc } from 'drizzle-orm';

export class UsersController {
  /**
   * @swagger
   * /api/v1/users/search:
   *   get:
   *     summary: Search users by display name, username or email
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *           example: "john"
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 10
   *     responses:
   *       200:
   *         description: List of matching users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     format: uuid
   *                   displayName:
   *                     type: string
   *                   email:
   *                     type: string
   *             example:
   *               - id: "123e4567-e89b-12d3-a456-426614174000"
   *                 displayName: "John Doe"
   *                 email: "john@example.com"
   *               - id: "223e4567-e89b-12d3-a456-426614174001"
   *                 displayName: "Jane Roe"
   *                 email: "jane@example.com"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status: { type: string, example: "error" }
   *                 message: { type: string, example: "Unauthorized" }
   */
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit = 10 } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
      }
      const users = await appUserRepository.search(q, Number(limit));
      // Map to frontend expected format
      const formattedUsers = users.map(user => ({
        id: user.id,
        displayName: user.displayName || user.username,
        username: user.username,
        email: user.email,
      }));
      return ApiResponse.success(res, formattedUsers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   format: uuid
   *                 displayName:
   *                   type: string
   *                 username:
   *                   type: string
   *                 email:
   *                   type: string
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               displayName: "Ada Lovelace"
   *               username: "ada"
   *               email: "ada@example.com"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "User not found"
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get user from app_users (id is the user ID)
      const user = await appUserRepository.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Map to frontend expected format
      const formattedUser = {
        id: user.id,
        displayName: user.displayName || user.username,
        username: user.username,
        email: user.email,
      };
      return ApiResponse.success(res, formattedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/users/{id}/invites:
   *   get:
   *     summary: Get pending invites for a user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of pending invites
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     format: uuid
   *                   communityId:
   *                     type: string
   *                     format: uuid
   *                   role:
   *                     type: string
   *                   status:
   *                     type: string
   *                   createdBy:
   *                     type: string
   *                     format: uuid
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *             example:
   *               - id: "7e1c7de6-8a2f-4f81-9f3d-2b62e6a1c9b2"
   *                 communityId: "123e4567-e89b-12d3-a456-426614174001"
   *                 role: "member"
   *                 status: "pending"
   *                 createdBy: "223e4567-e89b-12d3-a456-426614174002"
   *                 createdAt: "2025-10-06T12:00:00Z"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden - can only view own invites
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden"
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "User not found"
   */
  /**
   * @swagger
   * /api/v1/users/{id}/preferences:
   *   get:
   *     summary: Get user preferences by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: User preferences
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserPreferencesResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status: { type: string, example: "error" }
   *                 message: { type: string, example: "Unauthorized" }
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status: { type: string, example: "error" }
   *                 message: { type: string, example: "User not found" }
   */
  async getUserPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      const preferences = await userPreferencesService.getPreferences(id);
      return ApiResponse.success(res, preferences);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/users/{id}/communities:
   *   get:
   *     summary: Get communities the user belongs to
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of communities
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Community'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status: { type: string, example: "error" }
   *                 message: { type: string, example: "Unauthorized" }
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status: { type: string, example: "error" }
   *                 message: { type: string, example: "Forbidden" }
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status: { type: string, example: "error" }
   *                 message: { type: string, example: "User not found" }
   */
  async getUserCommunities(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requesterId = (req as any).user?.id;
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify user exists in app_users (id is the user ID)
      const user = await appUserRepository.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get communities for this user (page 1, limit 50 for profile)
      const { data: communities } = await communityService.listCommunities(1, 50, id);
      return ApiResponse.success(res, communities);
    } catch (error) {
      next(error);
    }
  }

  async getUserInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requesterId = (req as any).user?.id;
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const invites = await inviteService.getPendingInvitesForUser(id, requesterId!);
      return ApiResponse.success(res, invites);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/users/me/trust/timeline:
   *   get:
   *     summary: Get trust timeline for the current user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by specific community (optional)
   *     responses:
   *       200:
   *         description: Trust timeline events
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 events:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       timestamp:
   *                         type: string
   *                         format: date-time
   *                       type:
   *                         type: string
   *                         enum: [awarded, removed, admin_grant]
   *                       fromUserId:
   *                         type: string
   *                       fromUserDisplayName:
   *                         type: string
   *                       amount:
   *                         type: number
   *                       cumulativeTrust:
   *                         type: number
   *                       communityId:
   *                         type: string
   *                       communityName:
   *                         type: string
   *       401:
   *         description: Unauthorized
   */
  async getUserTrustTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { communityId } = req.query;

      // Fetch trust history with joins to get user and community names
      const query = db
        .select({
          id: trustHistory.id,
          timestamp: trustHistory.createdAt,
          type: trustHistory.action,
          fromUserId: trustHistory.fromUserId,
          fromUserDisplayName: appUsers.displayName,
          fromUserUsername: appUsers.username,
          amount: trustHistory.pointsDelta,
          communityId: trustHistory.communityId,
          communityName: communities.name,
        })
        .from(trustHistory)
        .leftJoin(appUsers, eq(trustHistory.fromUserId, appUsers.id))
        .leftJoin(communities, eq(trustHistory.communityId, communities.id))
        .where(eq(trustHistory.toUserId, userId))
        .orderBy(desc(trustHistory.createdAt))
        .limit(100);

      const historyRecords = await query;

      // Calculate cumulative trust at each point
      // We need to process in chronological order (oldest first) to calculate cumulative
      const sortedRecords = [...historyRecords].reverse();

      let cumulativeByComm = new Map<string, number>();

      const events = sortedRecords.map((record) => {
        const commId = record.communityId;
        const current = cumulativeByComm.get(commId) || 0;
        const newCumulative = current + record.amount;
        cumulativeByComm.set(commId, newCumulative);

        return {
          id: record.id,
          timestamp: record.timestamp?.toISOString() || new Date().toISOString(),
          type: record.type === 'award' ? 'awarded' : record.type === 'remove' ? 'removed' : 'admin_grant',
          fromUserId: record.fromUserId || null,
          fromUserDisplayName: record.fromUserDisplayName || record.fromUserUsername || 'Admin',
          amount: record.amount,
          cumulativeTrust: newCumulative,
          communityId: record.communityId,
          communityName: record.communityName || 'Unknown',
        };
      }).reverse(); // Reverse back to newest first

      // Filter by community if specified
      const filteredEvents = communityId
        ? events.filter(e => e.communityId === communityId)
        : events;

      return ApiResponse.success(res, { events: filteredEvents });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/users/me/trust/summary:
   *   get:
   *     summary: Get trust summary for the current user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Trust summary statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalTrust:
   *                   type: number
   *                 awardsReceived:
   *                   type: number
   *                 awardsRemoved:
   *                   type: number
   *                 byCommunity:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       communityId:
   *                         type: string
   *                       communityName:
   *                         type: string
   *                       trustPoints:
   *                         type: number
   *       401:
   *         description: Unauthorized
   */
  async getUserTrustSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get all trust views for this user (across all communities)
      const trustViews = await trustViewRepository.listByUser(userId, 100, 0);

      // Better approach: fetch all history and calculate stats
      const allHistory = await trustHistoryRepository.getHistoryForUserAllCommunities(userId, 1000, 0);

      // Calculate stats
      const awardsReceived = allHistory.filter((h: any) => h.action === 'award' || h.action === 'admin_grant').length;
      const awardsRemoved = allHistory.filter((h: any) => h.action === 'remove').length;
      const totalTrust = trustViews.reduce((sum: any, tv: any) => sum + tv.points, 0);

      // Build community breakdown
      const communityMap = new Map<string, { name: string; points: number }>();

      for (const tv of trustViews) {
        const commRecords = await db
          .select({ name: communities.name })
          .from(communities)
          .where(eq(communities.id, tv.communityId))
          .limit(1);

        communityMap.set(tv.communityId, {
          name: commRecords[0]?.name || 'Unknown',
          points: tv.points,
        });
      }

      const byCommunity = Array.from(communityMap.entries()).map(([id, data]) => ({
        communityId: id,
        communityName: data.name,
        trustPoints: data.points,
      }));

      return ApiResponse.success(res, {
        totalTrust,
        awardsReceived,
        awardsRemoved,
        byCommunity,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
