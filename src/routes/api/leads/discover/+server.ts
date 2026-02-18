import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { discoveryService } from '$lib/server/services/discovery.service';
import { z } from 'zod';

const discoverySchema = z.object({
	queries: z.array(z.string()).min(1, 'At least one search query is required'),
	location: z.string().optional().default('Wien, Austria')
});

// POST /api/leads/discover — Run lead discovery
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const parsed = discoverySchema.safeParse(body);

	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
	}

	const result = await discoveryService.runDiscovery(parsed.data.queries, parsed.data.location);
	return json(result);
};
