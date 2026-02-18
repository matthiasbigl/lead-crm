import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { leadService } from '$lib/server/services/lead.service';

// GET /api/stats — Dashboard statistics
export const GET: RequestHandler = async () => {
	const stats = await leadService.getDashboardStats();
	return json(stats);
};
