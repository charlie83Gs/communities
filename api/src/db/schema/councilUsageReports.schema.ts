import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { councils } from './councils.schema';
import { appUsers } from './app_users.schema';
import { items } from './items.schema';

/**
 * Council Usage Reports - Explanations of how councils have used resources
 * - Created by council managers
 * - Support rich text content (markdown)
 * - Can include attachments (images, documents)
 * - Example: "5 carrots used to feed community rabbits"
 */
export const councilUsageReports = pgTable('council_usage_reports', {
  id: uuid('id').defaultRandom().primaryKey(),

  councilId: uuid('council_id').references(() => councils.id, { onDelete: 'cascade' }).notNull(),

  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(), // Rich markdown content

  createdBy: text('created_by').references(() => appUsers.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const councilUsageReportsRelations = relations(councilUsageReports, ({ one, many }) => ({
  council: one(councils, {
    fields: [councilUsageReports.councilId],
    references: [councils.id],
  }),
  creator: one(appUsers, {
    fields: [councilUsageReports.createdBy],
    references: [appUsers.id],
  }),
  attachments: many(reportAttachments),
  items: many(reportItems),
}));

/**
 * Report Attachments - Images and documents attached to usage reports
 * - Supports images (photos of projects) and documents (receipts, etc.)
 * - Cascade delete when parent report is deleted
 */
export const reportAttachments = pgTable('report_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),

  reportId: uuid('report_id').references(() => councilUsageReports.id, { onDelete: 'cascade' }).notNull(),

  filename: varchar('filename', { length: 255 }).notNull(), // Generated filename for storage
  originalName: varchar('original_name', { length: 255 }).notNull(), // User's original filename
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(), // File size in bytes
  url: text('url').notNull(), // Storage URL

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reportAttachmentsRelations = relations(reportAttachments, ({ one }) => ({
  report: one(councilUsageReports, {
    fields: [reportAttachments.reportId],
    references: [councilUsageReports.id],
  }),
}));

/**
 * Report Items - Items used in usage reports
 * - Tracks which items and quantities were used
 * - Example: "5 carrots used to feed community rabbits"
 * - Cascade delete when parent report is deleted
 */
export const reportItems = pgTable('report_items', {
  id: uuid('id').defaultRandom().primaryKey(),

  reportId: uuid('report_id').references(() => councilUsageReports.id, { onDelete: 'cascade' }).notNull(),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  quantity: integer('quantity').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reportItemsRelations = relations(reportItems, ({ one }) => ({
  report: one(councilUsageReports, {
    fields: [reportItems.reportId],
    references: [councilUsageReports.id],
  }),
  item: one(items, {
    fields: [reportItems.itemId],
    references: [items.id],
  }),
}));
