import { leadRepository, type LeadFilters } from '../repositories/lead.repository';
import type { NewLead, LeadStatus, NewActivity } from '../db/schema';

export const leadService = {
	async getLeads(filters: LeadFilters) {
		return leadRepository.findAll(filters);
	},

	async getLeadById(id: string) {
		const lead = await leadRepository.findById(id);
		if (!lead) throw new Error('Lead not found');
		return lead;
	},

	async createLead(data: NewLead) {
		// Check for existing lead with same name and city (simple dedupe)
		const existing = await leadRepository.findAll({
			search: data.businessName,
			limit: 10
		});

		const isDuplicate = existing.items.some(
			(l) =>
				l.businessName.toLowerCase() === data.businessName.toLowerCase() &&
				(l.city?.toLowerCase() === data.city?.toLowerCase() || l.websiteUrl === data.websiteUrl)
		);

		if (isDuplicate) {
			throw new Error(`Lead with name "${data.businessName}" already exists in ${data.city}`);
		}

		const lead = await leadRepository.create(data);

		// Auto-add creation activity
		await leadRepository.addActivity({
			leadId: lead.id,
			type: 'note',
			title: 'Lead created',
			description: `Lead "${lead.businessName}" was added via ${lead.source}`
		});

		return lead;
	},

	async updateLead(id: string, data: Partial<NewLead>) {
		const lead = await leadRepository.update(id, data);
		if (!lead) throw new Error('Lead not found');
		return lead;
	},

	async updateLeadStatus(id: string, status: LeadStatus) {
		const lead = await leadRepository.updateStatus(id, status);
		if (!lead) throw new Error('Lead not found');

		// Log status change as activity
		await leadRepository.addActivity({
			leadId: id,
			type: 'status_change',
			title: `Status changed to "${status}"`,
			description: `Lead status was updated to "${status}"`
		});

		return lead;
	},

	async deleteLead(id: string) {
		const lead = await leadRepository.delete(id);
		if (!lead) throw new Error('Lead not found');
		return lead;
	},

	async getActivities(leadId: string) {
		return leadRepository.getActivities(leadId);
	},

	async addActivity(data: NewActivity) {
		return leadRepository.addActivity(data);
	},

	async getDashboardStats() {
		const stats = await leadRepository.getStats();

		const statusMap = Object.fromEntries(stats.map((s) => [s.status, s]));
		const totalLeads = stats.reduce((sum, s) => sum + s.count, 0);
		const totalPipelineValue = stats.reduce((sum, s) => sum + s.totalValue, 0);

		return {
			totalLeads,
			totalPipelineValue,
			byStatus: statusMap,
			newLeads: statusMap['new']?.count ?? 0,
			contacted: statusMap['contacted']?.count ?? 0,
			qualified: statusMap['qualified']?.count ?? 0,
			proposals: statusMap['proposal']?.count ?? 0,
			won: statusMap['won']?.count ?? 0,
			lost: statusMap['lost']?.count ?? 0
		};
	},

	/**
	 * Calculate a lead score based on available data
	 */
	calculateScore(lead: {
		websiteUrl?: string | null;
		websiteScore?: number | null;
		city?: string | null;
		businessType?: string | null;
	}): number {
		let score = 5; // Base score

		// Website quality (inverted — worse website = better lead for us)
		if (lead.websiteScore !== null && lead.websiteScore !== undefined) {
			score += Math.max(0, 10 - lead.websiteScore); // Bad website = high score
		}

		// No website at all = great lead
		if (!lead.websiteUrl) {
			score += 3;
		}

		// Austrian location bonus
		const austrianCities = ['wien', 'vienna', 'korneuburg', 'klosterneuburg', 'stockerau', 'graz', 'linz', 'salzburg'];
		if (lead.city && austrianCities.some((c) => lead.city!.toLowerCase().includes(c))) {
			score += 2;
		}

		// Business type relevance
		const highValueTypes = ['restaurant', 'hotel', 'arzt', 'rechtsanwalt', 'handwerk', 'immobilien', 'gastro'];
		if (lead.businessType && highValueTypes.some((t) => lead.businessType!.toLowerCase().includes(t))) {
			score += 2;
		}

		return Math.min(10, Math.max(1, Math.round(score)));
	}
};
