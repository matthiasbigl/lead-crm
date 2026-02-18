import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { leadService } from '$lib/server/services/lead.service';
import { createActivitySchema } from '$lib/schemas/lead.schema';

// GET /api/leads/:id/activities
export const GET: RequestHandler = async ({ params }) => {
	const activities = await leadService.getActivities(params.id);
	return json(activities);
};

// POST /api/leads/:id/activities
export const POST: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const parsed = createActivitySchema.safeParse(body);

	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
	}

	const activity = await leadService.addActivity({
		leadId: params.id,
		...parsed.data
	});

	return json(activity, { status: 201 });
};
