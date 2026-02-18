<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard — Lead CRM</title>
</svelte:head>

<div class="p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-1 text-gray-500">Übersicht deiner Lead-Pipeline</p>
	</div>

	<!-- Stats cards -->
	<div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<p class="text-sm font-medium text-gray-500">Gesamt Leads</p>
			<p class="mt-2 text-3xl font-bold text-gray-900">{data.stats.totalLeads}</p>
		</div>
		<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<p class="text-sm font-medium text-gray-500">Pipeline-Wert</p>
			<p class="mt-2 text-3xl font-bold text-emerald-600">€{data.stats.totalPipelineValue.toLocaleString('de-AT')}</p>
		</div>
		<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<p class="text-sm font-medium text-gray-500">Neue Leads</p>
			<p class="mt-2 text-3xl font-bold text-blue-600">{data.stats.newLeads}</p>
		</div>
		<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<p class="text-sm font-medium text-gray-500">Gewonnen</p>
			<p class="mt-2 text-3xl font-bold text-green-600">{data.stats.won}</p>
		</div>
	</div>

	<!-- Pipeline overview -->
	<div class="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<h2 class="mb-4 text-lg font-semibold">Pipeline</h2>
		<div class="flex items-center gap-2">
			{#each [
				{ label: 'Neu', count: data.stats.newLeads, color: 'bg-blue-500' },
				{ label: 'Kontaktiert', count: data.stats.contacted, color: 'bg-yellow-500' },
				{ label: 'Qualifiziert', count: data.stats.qualified, color: 'bg-purple-500' },
				{ label: 'Angebot', count: data.stats.proposals, color: 'bg-orange-500' },
				{ label: 'Gewonnen', count: data.stats.won, color: 'bg-green-500' },
				{ label: 'Verloren', count: data.stats.lost, color: 'bg-red-500' }
			] as stage}
				<div class="flex-1 text-center">
					<div class="mb-1 text-xs font-medium text-gray-500">{stage.label}</div>
					<div class="{stage.color} mx-auto flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white">
						{stage.count}
					</div>
				</div>
				{#if stage.label !== 'Verloren'}
					<div class="text-gray-300">→</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Recent leads -->
	<div class="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
		<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
			<h2 class="text-lg font-semibold">Neueste Leads</h2>
			<a href="/leads" class="text-sm font-medium text-blue-600 hover:text-blue-700">Alle anzeigen →</a>
		</div>
		<div class="divide-y divide-gray-100">
			{#each data.recentLeads as lead}
				<a href="/leads/{lead.id}" class="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
						{lead.businessName.charAt(0)}
					</div>
					<div class="flex-1">
						<p class="font-medium text-gray-900">{lead.businessName}</p>
						<p class="text-sm text-gray-500">{lead.city || 'Kein Ort'} · {lead.businessType || 'Unbekannt'}</p>
					</div>
					<StatusBadge status={lead.status} />
					{#if lead.websiteScore !== null}
						<div class="text-sm font-medium {lead.websiteScore <= 3 ? 'text-red-600' : lead.websiteScore <= 6 ? 'text-yellow-600' : 'text-green-600'}">
							{lead.websiteScore}/10
						</div>
					{/if}
				</a>
			{:else}
				<div class="px-6 py-12 text-center text-gray-400">
					Noch keine Leads vorhanden. <a href="/leads/new" class="text-blue-600 hover:underline">Erstelle den ersten!</a>
				</div>
			{/each}
		</div>
	</div>
</div>
