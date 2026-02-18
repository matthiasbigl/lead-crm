import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { leadService } from '$lib/server/services/lead.service';
import { createLeadSchema, leadFilterSchema } from '$lib/schemas/lead.schema';
import { requireApiKey } from '$lib/server/auth';

// GET /api/leads — List leads with filters
export const GET: RequestHandler = async ({ url }) => {
	const params = Object.fromEntries(url.searchParams);
	const parsed = leadFilterSchema.safeParse(params);

	if (!parsed.success) {
		return json({ error: 'Invalid filters', details: parsed.error.flatten() }, { status: 400 });
	}

	const result = await leadService.getLeads(parsed.data);
	return json(result);
};

// POST /api/leads — Create a new lead (requires API key)
export const POST: RequestHandler = async ({ request }) => {
	requireApiKey(request);

	const body = await request.json();
	const parsed = createLeadSchema.safeParse(body);

	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
	}

	const lead = await leadService.createLead(parsed.data);
	return json(lead, { status: 201 });
};
