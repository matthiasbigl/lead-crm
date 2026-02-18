<script lang="ts">
	let queries = $state('Restaurant\nFriseur\nHandwerker\nArzt');
	let location = $state('Wien, Austria');
	let loading = $state(false);
	let result = $state<any>(null);
	let error = $state('');

	async function runDiscovery() {
		loading = true;
		error = '';
		result = null;

		try {
			const queryList = queries.split('\n').map((q) => q.trim()).filter(Boolean);
			if (queryList.length === 0) {
				error = 'Bitte mindestens eine Suchanfrage eingeben';
				return;
			}

			const res = await fetch('/api/leads/discover', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ queries: queryList, location })
			});

			if (!res.ok) {
				const data = await res.json();
				error = data.error || 'Discovery fehlgeschlagen';
				return;
			}

			result = await res.json();
		} catch (err) {
			error = `Fehler: ${err}`;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Lead Discovery — Lead CRM</title>
</svelte:head>

<div class="mx-auto max-w-3xl p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">🔍 Lead Discovery</h1>
		<p class="mt-1 text-gray-500">Finde automatisch potenzielle Kunden über Google Places</p>
	</div>

	<div class="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
		<strong>Hinweis:</strong> Für die automatische Suche wird ein Google Places API Key benötigt.
		Trage ihn in der <code class="rounded bg-amber-100 px-1">.env</code> Datei als <code class="rounded bg-amber-100 px-1">GOOGLE_PLACES_API_KEY</code> ein.
	</div>

	<div class="space-y-6 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
		<div>
			<label for="queries" class="mb-1 block text-sm font-medium text-gray-700">Suchanfragen (eine pro Zeile)</label>
			<textarea
				id="queries"
				bind:value={queries}
				rows="6"
				placeholder="Restaurant&#10;Friseur&#10;Handwerker&#10;Arzt"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			></textarea>
			<p class="mt-1 text-xs text-gray-400">Beispiel: "Restaurant", "Friseur Korneuburg", "Rechtsanwalt Wien"</p>
		</div>

		<div>
			<label for="location" class="mb-1 block text-sm font-medium text-gray-700">Standort</label>
			<input
				id="location"
				type="text"
				bind:value={location}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		{#if error}
			<div class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
		{/if}

		<button
			onclick={runDiscovery}
			disabled={loading}
			class="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
		>
			{loading ? '🔄 Suche läuft...' : '🚀 Discovery starten'}
		</button>
	</div>

	{#if result}
		<div class="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<h2 class="mb-4 text-lg font-semibold">Ergebnisse</h2>
			<div class="mb-4 grid grid-cols-2 gap-4">
				<div class="rounded-lg bg-blue-50 p-4 text-center">
					<p class="text-2xl font-bold text-blue-700">{result.totalFound}</p>
					<p class="text-xs text-blue-600">Gefunden</p>
				</div>
				<div class="rounded-lg bg-green-50 p-4 text-center">
					<p class="text-2xl font-bold text-green-700">{result.totalCreated}</p>
					<p class="text-xs text-green-600">Erstellt</p>
				</div>
			</div>

			{#if result.errors?.length > 0}
				<div class="rounded-lg bg-red-50 p-4">
					<p class="mb-2 text-sm font-medium text-red-700">Fehler:</p>
					<ul class="list-inside list-disc text-sm text-red-600">
						{#each result.errors as err}
							<li>{err}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="mt-4">
				<a href="/leads" class="text-sm font-medium text-blue-600 hover:text-blue-700">→ Alle Leads anzeigen</a>
			</div>
		</div>
	{/if}
</div>
