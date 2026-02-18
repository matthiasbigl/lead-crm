import { pgTable, text, integer, timestamp, jsonb, pgEnum, uuid, serial, varchar } from 'drizzle-orm/pg-core';

// Enums
export const leadStatusEnum = pgEnum('lead_status', [
	'new',
	'contacted',
	'qualified',
	'proposal',
	'won',
	'lost'
]);

export const leadSourceEnum = pgEnum('lead_source', [
	'scraped',
	'manual',
	'referral',
	'google_places',
	'directory'
]);

export const activityTypeEnum = pgEnum('activity_type', [
	'note',
	'email',
	'call',
	'meeting',
	'proposal_sent',
	'status_change'
]);

// Leads table
export const leads = pgTable('leads', {
	id: uuid('id').primaryKey().defaultRandom(),
	businessName: varchar('business_name', { length: 255 }).notNull(),
	contactPerson: varchar('contact_person', { length: 255 }),
	email: varchar('email', { length: 255 }),
	phone: varchar('phone', { length: 50 }),
	websiteUrl: text('website_url'),
	websiteScore: integer('website_score'),
	address: text('address'),
	city: varchar('city', { length: 100 }),
	postalCode: varchar('postal_code', { length: 10 }),
	country: varchar('country', { length: 100 }).default('Austria'),
	businessType: varchar('business_type', { length: 100 }),
	source: leadSourceEnum('source').notNull().default('manual'),
	status: leadStatusEnum('status').notNull().default('new'),
	estimatedValue: integer('estimated_value'),
	notes: text('notes'),
	tags: jsonb('tags').$type<string[]>().default([]),
	metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	contactedAt: timestamp('contacted_at', { withTimezone: true })
});

// Activities table
export const activities = pgTable('activities', {
	id: serial('id').primaryKey(),
	leadId: uuid('lead_id')
		.notNull()
		.references(() => leads.id, { onDelete: 'cascade' }),
	type: activityTypeEnum('type').notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Types derived from schema
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
export type LeadSource = (typeof leadSourceEnum.enumValues)[number];
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
