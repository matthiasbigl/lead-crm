import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { leadService } from '$lib/server/services/lead.service';
import { updateLeadSchema, updateStatusSchema } from '$lib/schemas/lead.schema';

// GET /api/leads/:id — Get lead details
export const GET: RequestHandler = async ({ params }) => {
	try {
		const lead = await leadService.getLeadById(params.id);
		const activities = await leadService.getActivities(params.id);
		return json({ lead, activities });
	} catch {
		return json({ error: 'Lead not found' }, { status: 404 });
	}
};

// PATCH /api/leads/:id — Update lead
export const PATCH: RequestHandler = async ({ params, request }) => {
	const body = await request.json();

	// Check if this is a status-only update
	if (body.status && Object.keys(body).length === 1) {
		const parsed = updateStatusSchema.safeParse(body);
		if (!parsed.success) {
			return json({ error: 'Invalid status', details: parsed.error.flatten() }, { status: 400 });
		}
		try {
			const lead = await leadService.updateLeadStatus(params.id, parsed.data.status);
			return json(lead);
		} catch {
			return json({ error: 'Lead not found' }, { status: 404 });
		}
	}

	const parsed = updateLeadSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
	}

	try {
		const lead = await leadService.updateLead(params.id, parsed.data);
		return json(lead);
	} catch {
		return json({ error: 'Lead not found' }, { status: 404 });
	}
};

// DELETE /api/leads/:id — Delete lead
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		await leadService.deleteLead(params.id);
		return json({ success: true });
	} catch {
		return json({ error: 'Lead not found' }, { status: 404 });
	}
};
