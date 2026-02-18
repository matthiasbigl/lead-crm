<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
	import { updateLeadSchema, createActivitySchema } from '$lib/schemas/lead.schema';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let { data }: { data: PageData } = $props();

	const { form: editForm, errors: editErrors, enhance: editEnhance, submitting: editSubmitting, message: editMessage } = superForm(data.editForm, {
		validators: zodClient(updateLeadSchema)
	});

	const { form: actForm, enhance: actEnhance, submitting: actSubmitting, reset: actReset } = superForm(data.activityForm, {
		validators: zodClient(createActivitySchema),
		onResult: () => actReset()
	});

	let editing = $state(false);

	const statusSteps = [
		{ value: 'new', label: 'Neu' },
		{ value: 'contacted', label: 'Kontaktiert' },
		{ value: 'qualified', label: 'Qualifiziert' },
		{ value: 'proposal', label: 'Angebot' },
		{ value: 'won', label: 'Gewonnen' },
		{ value: 'lost', label: 'Verloren' }
	] as const;

	function formatDate(d: Date | string | null) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	const activityIcons: Record<string, string> = {
		note: '📝',
		email: '📧',
		call: '📞',
		meeting: '🤝',
		proposal_sent: '📄',
		status_change: '🔄'
	};
</script>

<svelte:head>
	<title>{data.lead.businessName} — Lead CRM</title>
</svelte:head>

<div class="p-8">
	<div class="mb-6">
		<a href="/leads" class="text-sm text-gray-500 hover:text-gray-700">← Zurück zu Leads</a>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Main info -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Header -->
			<div class="flex items-start justify-between rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
				<div>
					<div class="flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
							{data.lead.businessName.charAt(0)}
						</div>
						<div>
							<h1 class="text-2xl font-bold text-gray-900">{data.lead.businessName}</h1>
							<p class="text-sm text-gray-500">{data.lead.businessType || 'Keine Branche'} · {data.lead.city || 'Kein Ort'}</p>
						</div>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<StatusBadge status={data.lead.status} />
					<button
						onclick={() => editing = !editing}
						class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
					>
						{editing ? 'Abbrechen' : '✏️ Bearbeiten'}
					</button>
					<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Lead wirklich löschen?')) e.preventDefault(); }}>
						<button type="submit" class="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
							🗑️ Löschen
						</button>
					</form>
				</div>
			</div>

			<!-- Status pipeline -->
			<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
				<h2 class="mb-4 text-sm font-semibold text-gray-700">Status ändern</h2>
				<div class="flex flex-wrap gap-2">
					{#each statusSteps as step}
						<form method="POST" action="?/updateStatus">
							<input type="hidden" name="status" value={step.value} />
							<button
								type="submit"
								class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
									{data.lead.status === step.value
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
							>
								{step.label}
							</button>
						</form>
					{/each}
				</div>
			</div>

			<!-- Edit form -->
			{#if editing}
				<form method="POST" action="?/update" use:editEnhance class="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<h2 class="text-lg font-semibold text-gray-900">Lead bearbeiten</h2>

					{#if $editMessage}
						<div class="rounded-lg bg-green-50 p-3 text-sm text-green-700">{$editMessage}</div>
					{/if}

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label for="edit-name" class="mb-1 block text-xs font-medium text-gray-600">Firmenname</label>
							<input id="edit-name" name="businessName" bind:value={$editForm.businessName} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
						<div>
							<label for="edit-contact" class="mb-1 block text-xs font-medium text-gray-600">Kontaktperson</label>
							<input id="edit-contact" name="contactPerson" bind:value={$editForm.contactPerson} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
						<div>
							<label for="edit-email" class="mb-1 block text-xs font-medium text-gray-600">E-Mail</label>
							<input id="edit-email" name="email" type="email" bind:value={$editForm.email} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
						<div>
							<label for="edit-phone" class="mb-1 block text-xs font-medium text-gray-600">Telefon</label>
							<input id="edit-phone" name="phone" bind:value={$editForm.phone} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
						<div>
							<label for="edit-website" class="mb-1 block text-xs font-medium text-gray-600">Website</label>
							<input id="edit-website" name="websiteUrl" bind:value={$editForm.websiteUrl} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
						<div>
							<label for="edit-score" class="mb-1 block text-xs font-medium text-gray-600">Website Score</label>
							<input id="edit-score" name="websiteScore" type="number" min="0" max="10" bind:value={$editForm.websiteScore} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
						<div>
							<label for="edit-city" class="mb-1 block text-xs font-medium text-gray-600">Stadt</label>
							<input id="edit-city" name="city" bind:value={$editForm.city} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
						<div>
							<label for="edit-value" class="mb-1 block text-xs font-medium text-gray-600">Geschätzter Wert (€)</label>
							<input id="edit-value" name="estimatedValue" type="number" bind:value={$editForm.estimatedValue} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
						</div>
					</div>

					<div>
						<label for="edit-notes" class="mb-1 block text-xs font-medium text-gray-600">Notizen</label>
						<textarea id="edit-notes" name="notes" rows="3" bind:value={$editForm.notes} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"></textarea>
					</div>

					<div class="flex justify-end">
						<button type="submit" disabled={$editSubmitting} class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
							{$editSubmitting ? 'Speichern...' : 'Speichern'}
						</button>
					</div>
				</form>
			{/if}

			<!-- Activity log -->
			<div class="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
				<div class="border-b border-gray-100 px-6 py-4">
					<h2 class="text-lg font-semibold">Aktivitäten</h2>
				</div>

				<!-- Add activity form -->
				<form method="POST" action="?/addActivity" use:actEnhance class="border-b border-gray-100 px-6 py-4">
					<div class="flex gap-3">
						<select name="type" bind:value={$actForm.type} class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
							<option value="note">📝 Notiz</option>
							<option value="email">📧 E-Mail</option>
							<option value="call">📞 Anruf</option>
							<option value="meeting">🤝 Meeting</option>
							<option value="proposal_sent">📄 Angebot</option>
						</select>
						<input
							name="title"
							type="text"
							bind:value={$actForm.title}
							placeholder="Was ist passiert?"
							class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
						/>
						<button
							type="submit"
							disabled={$actSubmitting}
							class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
						>
							Hinzufügen
						</button>
					</div>
					<input name="description" type="hidden" bind:value={$actForm.description} />
				</form>

				<!-- Activity list -->
				<div class="divide-y divide-gray-100">
					{#each data.activities as activity}
						<div class="px-6 py-4">
							<div class="flex items-start gap-3">
								<span class="mt-0.5 text-lg">{activityIcons[activity.type] ?? '📌'}</span>
								<div class="flex-1">
									<p class="text-sm font-medium text-gray-900">{activity.title}</p>
									{#if activity.description}
										<p class="mt-1 text-sm text-gray-500">{activity.description}</p>
									{/if}
									<p class="mt-1 text-xs text-gray-400">{formatDate(activity.createdAt)}</p>
								</div>
							</div>
						</div>
					{:else}
						<div class="px-6 py-8 text-center text-sm text-gray-400">
							Noch keine Aktivitäten.
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Contact card -->
			<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
				<h3 class="mb-4 text-sm font-semibold text-gray-700">Kontaktdaten</h3>
				<dl class="space-y-3 text-sm">
					{#if data.lead.contactPerson}
						<div>
							<dt class="text-xs text-gray-400">Person</dt>
							<dd class="font-medium text-gray-900">{data.lead.contactPerson}</dd>
						</div>
					{/if}
					{#if data.lead.email}
						<div>
							<dt class="text-xs text-gray-400">E-Mail</dt>
							<dd><a href="mailto:{data.lead.email}" class="text-blue-600 hover:underline">{data.lead.email}</a></dd>
						</div>
					{/if}
					{#if data.lead.phone}
						<div>
							<dt class="text-xs text-gray-400">Telefon</dt>
							<dd><a href="tel:{data.lead.phone}" class="text-blue-600 hover:underline">{data.lead.phone}</a></dd>
						</div>
					{/if}
					{#if data.lead.websiteUrl}
						<div>
							<dt class="text-xs text-gray-400">Website</dt>
							<dd><a href={data.lead.websiteUrl} target="_blank" rel="noopener" class="text-blue-600 hover:underline">{data.lead.websiteUrl}</a></dd>
						</div>
					{/if}
				</dl>
			</div>

			<!-- Details card -->
			<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
				<h3 class="mb-4 text-sm font-semibold text-gray-700">Details</h3>
				<dl class="space-y-3 text-sm">
					<div>
						<dt class="text-xs text-gray-400">Website Score</dt>
						<dd class="font-semibold {data.lead.websiteScore !== null && data.lead.websiteScore <= 3 ? 'text-red-600' : data.lead.websiteScore !== null && data.lead.websiteScore <= 6 ? 'text-yellow-600' : 'text-green-600'}">
							{data.lead.websiteScore !== null ? `${data.lead.websiteScore}/10` : '—'}
						</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-400">Geschätzter Wert</dt>
						<dd class="font-medium text-gray-900">
							{data.lead.estimatedValue ? `€${data.lead.estimatedValue.toLocaleString('de-AT')}` : '—'}
						</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-400">Adresse</dt>
						<dd class="text-gray-900">
							{data.lead.address || '—'}<br />
							{data.lead.postalCode || ''} {data.lead.city || ''}<br />
							{data.lead.country || ''}
						</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-400">Quelle</dt>
						<dd class="text-gray-900">{data.lead.source}</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-400">Erstellt</dt>
						<dd class="text-gray-900">{formatDate(data.lead.createdAt)}</dd>
					</div>
					{#if data.lead.contactedAt}
						<div>
							<dt class="text-xs text-gray-400">Kontaktiert</dt>
							<dd class="text-gray-900">{formatDate(data.lead.contactedAt)}</dd>
						</div>
					{/if}
				</dl>
			</div>

			<!-- Notes -->
			{#if data.lead.notes}
				<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<h3 class="mb-3 text-sm font-semibold text-gray-700">Notizen</h3>
					<p class="text-sm text-gray-600 whitespace-pre-wrap">{data.lead.notes}</p>
				</div>
			{/if}
		</div>
	</div>
</div>
