<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	let search = $state($page.url.searchParams.get('search') ?? '');
	let statusFilter = $state($page.url.searchParams.get('status') ?? '');
	let sourceFilter = $state($page.url.searchParams.get('source') ?? '');

	function applyFilters() {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (statusFilter) params.set('status', statusFilter);
		if (sourceFilter) params.set('source', sourceFilter);
		goto(`/leads?${params.toString()}`, { replaceState: true });
	}

	function clearFilters() {
		search = '';
		statusFilter = '';
		sourceFilter = '';
		goto('/leads', { replaceState: true });
	}

	async function deleteLead(id: string, name: string) {
		if (!confirm(`"${name}" wirklich löschen?`)) return;
		await fetch(`/api/leads/${id}`, { method: 'DELETE' });
		goto('/leads', { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>Leads — Lead CRM</title>
</svelte:head>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Leads</h1>
			<p class="mt-1 text-gray-500">{data.total} Leads gefunden</p>
		</div>
		<a
			href="/leads/new"
			class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
		>
			+ Neuer Lead
		</a>
	</div>

	<!-- Filters -->
	<div class="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
		<form onsubmit={(e) => { e.preventDefault(); applyFilters(); }} class="flex flex-wrap items-end gap-4">
			<div class="flex-1">
				<label for="search" class="mb-1 block text-xs font-medium text-gray-600">Suche</label>
				<input
					id="search"
					type="text"
					bind:value={search}
					oninput={() => {
						// Subtle loading indication or immediate filter could be here
					}}
					placeholder="Name, E-Mail, Stadt..."
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
			<div>
				<label for="status" class="mb-1 block text-xs font-medium text-gray-600">Status</label>
				<select
					id="status"
					bind:value={statusFilter}
					onchange={applyFilters}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="">Alle</option>
					<option value="new">Neu</option>
					<option value="contacted">Kontaktiert</option>
					<option value="qualified">Qualifiziert</option>
					<option value="proposal">Angebot</option>
					<option value="won">Gewonnen</option>
					<option value="lost">Verloren</option>
				</select>
			</div>
			<div>
				<label for="source" class="mb-1 block text-xs font-medium text-gray-600">Quelle</label>
				<select
					id="source"
					bind:value={sourceFilter}
					onchange={applyFilters}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="">Alle</option>
					<option value="manual">Manuell</option>
					<option value="scraped">Scraped</option>
					<option value="referral">Empfehlung</option>
					<option value="bigl_bot">Bigl Bot</option>
					<option value="directory">Verzeichnis</option>
				</select>
			</div>
			<button
				type="submit"
				class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-700 active:scale-95"
			>
				Filtern
			</button>
			<button
				type="button"
				onclick={clearFilters}
				class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
			>
				Zurücksetzen
			</button>
		</form>
	</div>

	<!-- Leads table -->
	<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Unternehmen</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kontakt</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ort</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Score</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Wert</th>
					<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Quelle</th>
					<th class="px-6 py-3"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.leads as lead}
					<tr class="transition-colors hover:bg-gray-50">
						<td class="px-6 py-4">
							<a href="/leads/{lead.id}" class="font-medium text-blue-600 hover:text-blue-700">
								{lead.businessName}
							</a>
							{#if lead.businessType}
								<p class="text-xs text-gray-400">{lead.businessType}</p>
							{/if}
						</td>
						<td class="px-6 py-4 text-sm text-gray-600">
							{#if lead.contactPerson}
								<p>{lead.contactPerson}</p>
							{/if}
							{#if lead.email}
								<p class="text-xs text-gray-400">{lead.email}</p>
							{/if}
						</td>
						<td class="px-6 py-4 text-sm text-gray-600">{lead.city || '—'}</td>
						<td class="px-6 py-4">
							{#if lead.websiteScore !== null}
								<span class="text-sm font-semibold {lead.websiteScore <= 3 ? 'text-red-600' : lead.websiteScore <= 6 ? 'text-yellow-600' : 'text-green-600'}">
									{lead.websiteScore}/10
								</span>
							{:else}
								<span class="text-sm text-gray-400">—</span>
							{/if}
						</td>
						<td class="px-6 py-4">
							<StatusBadge status={lead.status} />
						</td>
						<td class="px-6 py-4 text-sm text-gray-600">
							{lead.estimatedValue ? `€${lead.estimatedValue.toLocaleString('de-AT')}` : '—'}
						</td>
						<td class="px-6 py-4 text-xs text-gray-400">{lead.source}</td>
						<td class="px-6 py-4 text-right">
							<button
								onclick={() => deleteLead(lead.id, lead.businessName)}
								class="text-xs text-red-400 hover:text-red-600"
								title="Löschen"
							>
								🗑️
							</button>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="8" class="px-6 py-12 text-center text-gray-400">
							Keine Leads gefunden.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
