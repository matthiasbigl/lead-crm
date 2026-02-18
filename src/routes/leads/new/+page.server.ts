import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { createLeadSchema } from '$lib/schemas/lead.schema';
import { leadService } from '$lib/server/services/lead.service';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createLeadSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(createLeadSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const lead = await leadService.createLead(form.data);
			throw redirect(303, `/leads/${lead.id}`);
		} catch (err) {
			if (err instanceof Response || (err as any)?.status === 303) throw err;
			return message(form, 'Fehler beim Erstellen des Leads', { status: 500 });
		}
	}
};
