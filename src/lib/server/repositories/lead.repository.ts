import { db } from '../db';
import { leads, activities, type NewLead, type NewActivity, type LeadStatus } from '../db/schema';
import { eq, ilike, or, desc, asc, sql, and, type SQL } from 'drizzle-orm';

export interface LeadFilters {
	search?: string;
	status?: LeadStatus;
	source?: string;
	city?: string;
	minScore?: number;
	maxScore?: number;
	sortBy?: 'createdAt' | 'updatedAt' | 'businessName' | 'websiteScore' | 'estimatedValue';
	sortOrder?: 'asc' | 'desc';
	limit?: number;
	offset?: number;
}

export const leadRepository = {
	async findAll(filters: LeadFilters = {}) {
		const conditions: SQL[] = [];

		if (filters.search) {
			const searchTerm = `%${filters.search}%`;
			conditions.push(
				or(
					ilike(leads.businessName, searchTerm),
					ilike(leads.contactPerson, searchTerm),
					ilike(leads.email, searchTerm),
					ilike(leads.city, searchTerm),
					ilike(leads.businessType, searchTerm)
				)!
			);
		}

		if (filters.status) {
			conditions.push(eq(leads.status, filters.status));
		}

		if (filters.source) {
			conditions.push(eq(leads.source, filters.source as any));
		}

		if (filters.city) {
			conditions.push(ilike(leads.city, `%${filters.city}%`));
		}

		if (filters.minScore !== undefined) {
			conditions.push(sql`${leads.websiteScore} >= ${filters.minScore}`);
		}

		if (filters.maxScore !== undefined) {
			conditions.push(sql`${leads.websiteScore} <= ${filters.maxScore}`);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const sortColumn = filters.sortBy
			? leads[filters.sortBy as keyof typeof leads]
			: leads.createdAt;
		const orderFn = filters.sortOrder === 'asc' ? asc : desc;

		const [items, countResult] = await Promise.all([
			db
				.select()
				.from(leads)
				.where(whereClause)
				.orderBy(orderFn(sortColumn as any))
				.limit(filters.limit ?? 50)
				.offset(filters.offset ?? 0),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(leads)
				.where(whereClause)
		]);

		return {
			items,
			total: countResult[0]?.count ?? 0,
			limit: filters.limit ?? 50,
			offset: filters.offset ?? 0
		};
	},

	async findById(id: string) {
		const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
		return result[0] ?? null;
	},

	async create(data: NewLead) {
		const result = await db.insert(leads).values(data).returning();
		return result[0];
	},

	async update(id: string, data: Partial<NewLead>) {
		const result = await db
			.update(leads)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(leads.id, id))
			.returning();
		return result[0] ?? null;
	},

	async delete(id: string) {
		const result = await db.delete(leads).where(eq(leads.id, id)).returning();
		return result[0] ?? null;
	},

	async updateStatus(id: string, status: LeadStatus) {
		const updates: Partial<NewLead> & { updatedAt: Date; contactedAt?: Date } = {
			status,
			updatedAt: new Date()
		};

		if (status === 'contacted') {
			updates.contactedAt = new Date();
		}

		const result = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();
		return result[0] ?? null;
	},

	async getStats() {
		const result = await db
			.select({
				status: leads.status,
				count: sql<number>`count(*)::int`,
				totalValue: sql<number>`coalesce(sum(${leads.estimatedValue}), 0)::int`
			})
			.from(leads)
			.groupBy(leads.status);

		return result;
	},

	// Activities
	async getActivities(leadId: string) {
		return db
			.select()
			.from(activities)
			.where(eq(activities.leadId, leadId))
			.orderBy(desc(activities.createdAt));
	},

	async addActivity(data: NewActivity) {
		const result = await db.insert(activities).values(data).returning();
		return result[0];
	}
};
