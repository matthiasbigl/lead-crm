<script lang="ts">
	type Status = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

	let { status }: { status: Status } = $props();

	const config: Record<Status, { label: string; classes: string }> = {
		new: { label: 'Neu', classes: 'bg-blue-100 text-blue-700' },
		contacted: { label: 'Kontaktiert', classes: 'bg-yellow-100 text-yellow-700' },
		qualified: { label: 'Qualifiziert', classes: 'bg-purple-100 text-purple-700' },
		proposal: { label: 'Angebot', classes: 'bg-orange-100 text-orange-700' },
		won: { label: 'Gewonnen', classes: 'bg-green-100 text-green-700' },
		lost: { label: 'Verloren', classes: 'bg-red-100 text-red-700' }
	};
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {config[status].classes}">
	{config[status].label}
</span>
