import { db } from '@db/index';
import {
  communityUserInvites,
  communityLinkInvites
} from '@db/schema';
import { and, eq, lt, or, gt, isNull } from 'drizzle-orm';

export type UserInviteRecord = typeof communityUserInvites.$inferSelect;
export type LinkInviteRecord = typeof communityLinkInvites.$inferSelect;
export type InviteRecord = UserInviteRecord | LinkInviteRecord;

export type CreateUserInviteInput = {
  communityId: string;
  invitedUserId: string;
  // REMOVED: role - stored in OpenFGA instead
  createdBy: string;
};
export type CreateLinkInviteInput = {
  communityId: string;
  // REMOVED: role - stored in OpenFGA instead
  title?: string;
  secret: string;
  expiresAt: Date;
  createdBy: string;
};

export class InviteRepository {
  async createUserInvite(input: CreateUserInviteInput): Promise<UserInviteRecord> {
    console.log(`[InviteRepository] createUserInvite called with input:`, JSON.stringify(input));
    const [row] = await db
      .insert(communityUserInvites)
      .values({
        communityId: input.communityId,
        invitedUserId: input.invitedUserId,
        status: 'pending',
        createdBy: input.createdBy,
      })
      .returning();
    console.log(`[InviteRepository] Database INSERT completed, returned row ID: ${row.id}`);
    return row;
  }

  async createLinkInvite(input: CreateLinkInviteInput): Promise<LinkInviteRecord> {
    const [row] = await db
      .insert(communityLinkInvites)
      .values({
        communityId: input.communityId,
        title: input.title,
        secret: input.secret,
        expiresAt: input.expiresAt,
        status: 'pending',
        createdBy: input.createdBy,
      })
      .returning();
    return row;
  }

  async findUserInviteById(id: string): Promise<UserInviteRecord | undefined> {
    const [row] = await db.select().from(communityUserInvites).where(eq(communityUserInvites.id, id));
    return row;
  }

  async findLinkInviteById(id: string): Promise<LinkInviteRecord | undefined> {
    const [row] = await db.select().from(communityLinkInvites).where(eq(communityLinkInvites.id, id));
    return row;
  }

  async findInviteById(id: string): Promise<InviteRecord | undefined> {
    let invite = await this.findUserInviteById(id);
    if (invite) return invite as InviteRecord;
    return await this.findLinkInviteById(id);
  }

  async findBySecret(secret: string): Promise<LinkInviteRecord | undefined> {
    const [row] = await db.select().from(communityLinkInvites).where(eq(communityLinkInvites.secret, secret));
    return row;
  }

  async markUserInviteRedeemed(id: string, userId: string): Promise<UserInviteRecord | undefined> {
    const [row] = await db
      .update(communityUserInvites)
      .set({
        status: 'redeemed',
        redeemedBy: userId,
        redeemedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communityUserInvites.id, id))
      .returning();
    return row;
  }

  async markLinkInviteRedeemed(id: string, userId: string): Promise<LinkInviteRecord | undefined> {
    const [row] = await db
      .update(communityLinkInvites)
      .set({
        status: 'redeemed',
        redeemedBy: userId,
        redeemedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communityLinkInvites.id, id))
      .returning();
    return row;
  }

  async markInviteRedeemed(id: string, userId: string): Promise<InviteRecord | undefined> {
    const userInvite = await this.findUserInviteById(id);
    if (userInvite) {
      const updated = await this.markUserInviteRedeemed(id, userId);
      return updated as InviteRecord;
    }
    const linkInvite = await this.findLinkInviteById(id);
    if (linkInvite) {
      const updated = await this.markLinkInviteRedeemed(id, userId);
      return updated as InviteRecord;
    }
    return undefined;
  }

  async cancelUserInvite(id: string): Promise<UserInviteRecord | undefined> {
    const [row] = await db
      .update(communityUserInvites)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communityUserInvites.id, id))
      .returning();
    return row;
  }

  async cancelLinkInvite(id: string): Promise<LinkInviteRecord | undefined> {
    const [row] = await db
      .update(communityLinkInvites)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communityLinkInvites.id, id))
      .returning();
    return row;
  }

  async cancelInvite(id: string): Promise<InviteRecord | undefined> {
    const userInvite = await this.findUserInviteById(id);
    if (userInvite) {
      const updated = await this.cancelUserInvite(id);
      return updated as InviteRecord;
    }
    const linkInvite = await this.findLinkInviteById(id);
    if (linkInvite) {
      const updated = await this.cancelLinkInvite(id);
      return updated as InviteRecord;
    }
    return undefined;
  }

  async expirePastDueLinkInvites(now: Date = new Date()): Promise<number> {
    const result = await db
      .update(communityLinkInvites)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(and(eq(communityLinkInvites.status, 'pending'), lt(communityLinkInvites.expiresAt, now)));
    // @ts-ignore
    return result?.rowCount ?? 0;
  }

  async expirePastDue(now: Date = new Date()): Promise<number> {
    // User invites do not expire; only link invites do
    return await this.expirePastDueLinkInvites(now);
  }

  async findPendingUserInvitesByCommunity(communityId: string): Promise<UserInviteRecord[]> {
    return await db
      .select()
      .from(communityUserInvites)
      .where(
        and(
          eq(communityUserInvites.communityId, communityId),
          eq(communityUserInvites.status, 'pending')
        )
      )
      .orderBy(communityUserInvites.createdAt);
  }

  async findPendingUserInvitesByUser(userId: string): Promise<UserInviteRecord[]> {
    return await db
      .select()
      .from(communityUserInvites)
      .where(
        and(
          eq(communityUserInvites.invitedUserId, userId),
          eq(communityUserInvites.status, 'pending')
        )
      )
      .orderBy(communityUserInvites.createdAt);
  }

  async findActiveLinkInvitesByCommunity(communityId: string): Promise<LinkInviteRecord[]> {
    const now = new Date();
    return await db
      .select()
      .from(communityLinkInvites)
      .where(
        and(
          eq(communityLinkInvites.communityId, communityId),
          eq(communityLinkInvites.status, 'pending'),
          or(
            gt(communityLinkInvites.expiresAt, now),
            isNull(communityLinkInvites.expiresAt)
          )
        )
      )
      .orderBy(communityLinkInvites.createdAt);
  }
}

export const inviteRepository = new InviteRepository();
