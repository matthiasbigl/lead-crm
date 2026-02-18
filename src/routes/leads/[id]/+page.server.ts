import type { Actions, PageServerLoad } from './$types';
import { leadService } from '$lib/server/services/lead.service';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateLeadSchema, createActivitySchema } from '$lib/schemas/lead.schema';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const lead = await leadService.getLeadById(params.id);
		const activities = await leadService.getActivities(params.id);

		const editForm = await superValidate(lead, zod(updateLeadSchema));
		const activityForm = await superValidate(zod(createActivitySchema));

		return { lead, activities, editForm, activityForm };
	} catch {
		throw error(404, 'Lead nicht gefunden');
	}
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const form = await superValidate(request, zod(updateLeadSchema));

		if (!form.valid) {
			return fail(400, { editForm: form });
		}

		try {
			await leadService.updateLead(params.id, form.data);
			return message(form, 'Lead aktualisiert!');
		} catch {
			return message(form, 'Fehler beim Aktualisieren', { status: 500 });
		}
	},

	updateStatus: async ({ params, request }) => {
		const data = await request.formData();
		const status = data.get('status') as any;

		try {
			await leadService.updateLeadStatus(params.id, status);
		} catch {
			// ignore
		}

		return;
	},

	addActivity: async ({ params, request }) => {
		const form = await superValidate(request, zod(createActivitySchema));

		if (!form.valid) {
			return fail(400, { activityForm: form });
		}

		try {
			await leadService.addActivity({
				leadId: params.id,
				...form.data
			});
		} catch {
			return message(form, 'Fehler beim Hinzufügen', { status: 500 });
		}

		return;
	},

	delete: async ({ params }) => {
		await leadService.deleteLead(params.id);
		throw redirect(303, '/leads');
	}
};
