import type { PageServerLoad } from './$types';
import { leadService } from '$lib/server/services/lead.service';

export const load: PageServerLoad = async () => {
	const [stats, recentLeads] = await Promise.all([
		leadService.getDashboardStats(),
		leadService.getLeads({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
	]);

	return { stats, recentLeads: recentLeads.items };
};
