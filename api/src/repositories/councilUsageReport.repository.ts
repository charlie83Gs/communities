import { db as realDb } from '../db';
import { councilUsageReports, reportAttachments, reportItems, items } from '../db/schema';
import { eq, desc, count } from 'drizzle-orm';

type DbClient = typeof realDb;

export interface ReportItemDto {
  itemId: string;
  quantity: number;
}

export interface CreateUsageReportDto {
  title: string;
  content: string;
  items?: ReportItemDto[];
}

export interface UpdateUsageReportDto {
  title?: string;
  content?: string;
  items?: ReportItemDto[];
}

export interface CreateAttachmentDto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export class CouncilUsageReportRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  /**
   * Create a new usage report
   */
  async create(councilId: string, data: CreateUsageReportDto, createdBy: string) {
    const [report] = await this.db
      .insert(councilUsageReports)
      .values({
        councilId,
        title: data.title,
        content: data.content,
        createdBy,
      })
      .returning();

    // Insert report items if provided
    if (data.items && data.items.length > 0) {
      await this.db.insert(reportItems).values(
        data.items.map((item) => ({
          reportId: report.id,
          itemId: item.itemId,
          quantity: item.quantity,
        }))
      );
    }

    return report;
  }

  /**
   * Find report by ID with attachments and items
   */
  async findById(reportId: string) {
    const [report] = await this.db
      .select()
      .from(councilUsageReports)
      .where(eq(councilUsageReports.id, reportId));

    if (!report) {
      return null;
    }

    // Get attachments for this report
    const attachments = await this.db
      .select()
      .from(reportAttachments)
      .where(eq(reportAttachments.reportId, reportId))
      .orderBy(reportAttachments.createdAt);

    // Get items for this report with item details
    const reportItemsData = await this.db
      .select({
        id: reportItems.id,
        itemId: reportItems.itemId,
        quantity: reportItems.quantity,
        itemName: items.translations,
        createdAt: reportItems.createdAt,
      })
      .from(reportItems)
      .leftJoin(items, eq(reportItems.itemId, items.id))
      .where(eq(reportItems.reportId, reportId))
      .orderBy(reportItems.createdAt);

    // Transform items to include item name from translations
    const formattedItems = reportItemsData.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      quantity: item.quantity,
      itemName: this.getItemName(item.itemName),
      createdAt: item.createdAt,
    }));

    return {
      ...report,
      attachments,
      items: formattedItems,
    };
  }

  /**
   * Helper to extract item name from translations JSONB
   */
  private getItemName(translations: unknown): string {
    if (!translations || typeof translations !== 'object') {
      return 'Unknown Item';
    }
    const trans = translations as Record<string, { name?: string }>;
    // Try English first, then any available language
    if (trans.en?.name) return trans.en.name;
    const firstLang = Object.keys(trans)[0];
    if (firstLang && trans[firstLang]?.name) return trans[firstLang].name;
    return 'Unknown Item';
  }

  /**
   * Find all reports by council with pagination
   */
  async findByCouncil(
    councilId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const reports = await this.db
      .select()
      .from(councilUsageReports)
      .where(eq(councilUsageReports.councilId, councilId))
      .orderBy(desc(councilUsageReports.createdAt))
      .limit(limit)
      .offset(offset);

    // Get attachments and items for all reports
    const reportIds = reports.map((r) => r.id);

    const attachmentsMap = new Map<string, (typeof reportAttachments.$inferSelect)[]>();
    const itemsMap = new Map<
      string,
      Array<{
        id: string;
        itemId: string;
        quantity: number;
        itemName: string;
        createdAt: Date | null;
      }>
    >();

    if (reportIds.length > 0) {
      // Fetch attachments for each report
      for (const report of reports) {
        const attachments = await this.db
          .select()
          .from(reportAttachments)
          .where(eq(reportAttachments.reportId, report.id))
          .orderBy(reportAttachments.createdAt);
        attachmentsMap.set(report.id, attachments);

        // Fetch items for each report
        const reportItemsData = await this.db
          .select({
            id: reportItems.id,
            itemId: reportItems.itemId,
            quantity: reportItems.quantity,
            itemName: items.translations,
            createdAt: reportItems.createdAt,
          })
          .from(reportItems)
          .leftJoin(items, eq(reportItems.itemId, items.id))
          .where(eq(reportItems.reportId, report.id))
          .orderBy(reportItems.createdAt);

        const formattedItems = reportItemsData.map((item) => ({
          id: item.id,
          itemId: item.itemId,
          quantity: item.quantity,
          itemName: this.getItemName(item.itemName),
          createdAt: item.createdAt,
        }));
        itemsMap.set(report.id, formattedItems);
      }
    }

    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(councilUsageReports)
      .where(eq(councilUsageReports.councilId, councilId));

    return {
      reports: reports.map((report) => ({
        ...report,
        attachments: attachmentsMap.get(report.id) || [],
        items: itemsMap.get(report.id) || [],
      })),
      total: Number(total),
    };
  }

  /**
   * Update a report
   */
  async update(reportId: string, data: UpdateUsageReportDto) {
    const { items: reportItemsToUpdate, ...reportData } = data;

    const [updated] = await this.db
      .update(councilUsageReports)
      .set({ ...reportData, updatedAt: new Date() })
      .where(eq(councilUsageReports.id, reportId))
      .returning();

    // Update report items if provided
    if (reportItemsToUpdate !== undefined) {
      await this.updateReportItems(reportId, reportItemsToUpdate);
    }

    return updated;
  }

  /**
   * Update items for a report (replace all)
   */
  async updateReportItems(reportId: string, newItems: ReportItemDto[]) {
    // Delete existing items
    await this.db.delete(reportItems).where(eq(reportItems.reportId, reportId));

    // Insert new items if any
    if (newItems.length > 0) {
      await this.db.insert(reportItems).values(
        newItems.map((item) => ({
          reportId,
          itemId: item.itemId,
          quantity: item.quantity,
        }))
      );
    }
  }

  /**
   * Delete a report (and cascade delete attachments)
   */
  async delete(reportId: string) {
    const [deleted] = await this.db
      .delete(councilUsageReports)
      .where(eq(councilUsageReports.id, reportId))
      .returning();

    return deleted;
  }

  /**
   * Add attachment to a report
   */
  async addAttachment(reportId: string, data: CreateAttachmentDto) {
    const [attachment] = await this.db
      .insert(reportAttachments)
      .values({
        reportId,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
      })
      .returning();

    return attachment;
  }

  /**
   * Remove an attachment
   */
  async removeAttachment(attachmentId: string) {
    const [deleted] = await this.db
      .delete(reportAttachments)
      .where(eq(reportAttachments.id, attachmentId))
      .returning();

    return deleted;
  }

  /**
   * Get attachment by ID
   */
  async findAttachmentById(attachmentId: string) {
    const [attachment] = await this.db
      .select()
      .from(reportAttachments)
      .where(eq(reportAttachments.id, attachmentId));

    return attachment;
  }

  /**
   * Get all attachments for a report
   */
  async findAttachmentsByReport(reportId: string) {
    return await this.db
      .select()
      .from(reportAttachments)
      .where(eq(reportAttachments.reportId, reportId))
      .orderBy(reportAttachments.createdAt);
  }
}

// Default instance for production code paths
export const councilUsageReportRepository = new CouncilUsageReportRepository(realDb);
