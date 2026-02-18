<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/leads', label: 'Leads', icon: '👥' },
		{ href: '/leads/new', label: 'Neuer Lead', icon: '➕' },
		{ href: '/discover', label: 'Discovery', icon: '🔍' }
	];
</script>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside class="flex w-64 flex-col bg-gray-900 text-white">
		<div class="border-b border-gray-700 p-6">
			<h1 class="text-xl font-bold">🎯 Lead CRM</h1>
			<p class="mt-1 text-xs text-gray-400">Matthias Bigl — Web Dev</p>
		</div>

		<nav class="mt-4 flex-1 space-y-1 px-3">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
						{$page.url.pathname === item.href
						? 'bg-blue-600 text-white'
						: 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
				>
					<span>{item.icon}</span>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="border-t border-gray-700 p-4">
			<p class="text-xs text-gray-500">Lead CRM v1.0</p>
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>
