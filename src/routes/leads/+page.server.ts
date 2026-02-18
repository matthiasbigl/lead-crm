import type { PageServerLoad } from './$types';
import { leadService } from '$lib/server/services/lead.service';
import { leadFilterSchema } from '$lib/schemas/lead.schema';

export const load: PageServerLoad = async ({ url }) => {
	const params = Object.fromEntries(url.searchParams);
	const parsed = leadFilterSchema.safeParse(params);

	const filters = parsed.success ? parsed.data : {};
	const result = await leadService.getLeads(filters);

	return {
		leads: result.items,
		total: result.total,
		filters
	};
};
