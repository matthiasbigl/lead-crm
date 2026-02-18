<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createLeadSchema } from '$lib/schemas/lead.schema';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		validators: zodClient(createLeadSchema)
	});
</script>

<svelte:head>
	<title>Neuer Lead — Lead CRM</title>
</svelte:head>

<div class="mx-auto max-w-3xl p-8">
	<div class="mb-8">
		<a href="/leads" class="text-sm text-gray-500 hover:text-gray-700">← Zurück zu Leads</a>
		<h1 class="mt-2 text-3xl font-bold text-gray-900">Neuer Lead</h1>
	</div>

	{#if $message}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{$message}</div>
	{/if}

	<form method="POST" use:enhance class="space-y-6 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
		<!-- Business info -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="businessName" class="mb-1 block text-sm font-medium text-gray-700">Firmenname *</label>
				<input
					id="businessName"
					name="businessName"
					type="text"
					bind:value={$form.businessName}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={$errors.businessName}
				/>
				{#if $errors.businessName}<p class="mt-1 text-xs text-red-500">{$errors.businessName}</p>{/if}
			</div>

			<div>
				<label for="contactPerson" class="mb-1 block text-sm font-medium text-gray-700">Kontaktperson</label>
				<input
					id="contactPerson"
					name="contactPerson"
					type="text"
					bind:value={$form.contactPerson}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="businessType" class="mb-1 block text-sm font-medium text-gray-700">Branche</label>
				<input
					id="businessType"
					name="businessType"
					type="text"
					bind:value={$form.businessType}
					placeholder="z.B. Gastronomie, Handwerk..."
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<!-- Contact -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700">E-Mail</label>
				<input
					id="email"
					name="email"
					type="email"
					bind:value={$form.email}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={$errors.email}
				/>
				{#if $errors.email}<p class="mt-1 text-xs text-red-500">{$errors.email}</p>{/if}
			</div>

			<div>
				<label for="phone" class="mb-1 block text-sm font-medium text-gray-700">Telefon</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					bind:value={$form.phone}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<!-- Website -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<label for="websiteUrl" class="mb-1 block text-sm font-medium text-gray-700">Website URL</label>
				<input
					id="websiteUrl"
					name="websiteUrl"
					type="url"
					bind:value={$form.websiteUrl}
					placeholder="https://..."
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={$errors.websiteUrl}
				/>
				{#if $errors.websiteUrl}<p class="mt-1 text-xs text-red-500">{$errors.websiteUrl}</p>{/if}
			</div>

			<div>
				<label for="websiteScore" class="mb-1 block text-sm font-medium text-gray-700">Website Score (0-10)</label>
				<input
					id="websiteScore"
					name="websiteScore"
					type="number"
					min="0"
					max="10"
					bind:value={$form.websiteScore}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<!-- Location -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			<div class="sm:col-span-2">
				<label for="address" class="mb-1 block text-sm font-medium text-gray-700">Adresse</label>
				<input
					id="address"
					name="address"
					type="text"
					bind:value={$form.address}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="postalCode" class="mb-1 block text-sm font-medium text-gray-700">PLZ</label>
				<input
					id="postalCode"
					name="postalCode"
					type="text"
					bind:value={$form.postalCode}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<label for="city" class="mb-1 block text-sm font-medium text-gray-700">Stadt</label>
				<input
					id="city"
					name="city"
					type="text"
					bind:value={$form.city}
					placeholder="z.B. Wien, Korneuburg"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="country" class="mb-1 block text-sm font-medium text-gray-700">Land</label>
				<input
					id="country"
					name="country"
					type="text"
					bind:value={$form.country}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<!-- Meta -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			<div>
				<label for="source" class="mb-1 block text-sm font-medium text-gray-700">Quelle</label>
				<select
					id="source"
					name="source"
					bind:value={$form.source}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="manual">Manuell</option>
					<option value="scraped">Scraped</option>
					<option value="referral">Empfehlung</option>
					<option value="google_places">Google Places</option>
					<option value="directory">Verzeichnis</option>
				</select>
			</div>

			<div>
				<label for="status" class="mb-1 block text-sm font-medium text-gray-700">Status</label>
				<select
					id="status"
					name="status"
					bind:value={$form.status}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="new">Neu</option>
					<option value="contacted">Kontaktiert</option>
					<option value="qualified">Qualifiziert</option>
					<option value="proposal">Angebot</option>
					<option value="won">Gewonnen</option>
					<option value="lost">Verloren</option>
				</select>
			</div>

			<div>
				<label for="estimatedValue" class="mb-1 block text-sm font-medium text-gray-700">Geschätzter Wert (€)</label>
				<input
					id="estimatedValue"
					name="estimatedValue"
					type="number"
					min="0"
					bind:value={$form.estimatedValue}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<!-- Notes -->
		<div>
			<label for="notes" class="mb-1 block text-sm font-medium text-gray-700">Notizen</label>
			<textarea
				id="notes"
				name="notes"
				rows="4"
				bind:value={$form.notes}
				placeholder="Erste Eindrücke, Anmerkungen..."
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			></textarea>
		</div>

		<!-- Submit -->
		<div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
			<a href="/leads" class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Abbrechen</a>
			<button
				type="submit"
				disabled={$submitting}
				class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
			>
				{$submitting ? 'Wird gespeichert...' : 'Lead erstellen'}
			</button>
		</div>
	</form>
</div>
