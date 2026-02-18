import { pgTable, text, integer, timestamp, jsonb, pgEnum, uuid, serial, varchar, index } from 'drizzle-orm/pg-core';

// ... (enums stay the same)

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
}, (table) => {
	return {
		businessNameIdx: index('business_name_idx').on(table.businessName),
		statusIdx: index('status_idx').on(table.status),
		cityIdx: index('city_idx').on(table.city),
		createdAtIdx: index('created_at_idx').on(table.createdAt)
	};
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
}, (table) => {
	return {
		leadIdIdx: index('lead_id_idx').on(table.leadId),
		createdAtIdx: index('activity_created_at_idx').on(table.createdAt)
	};
});

// Types derived from schema
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
export type LeadSource = (typeof leadSourceEnum.enumValues)[number];
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
