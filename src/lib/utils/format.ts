export function formatCurrency(value: number | null | undefined): string {
	if (value === null || value === undefined) return '—';
	return `€${value.toLocaleString('de-AT')}`;
}

export function formatDate(d: Date | string | null | undefined): string {
	if (!d) return '—';
	return new Date(d).toLocaleDateString('de-AT', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

export function formatDateTime(d: Date | string | null | undefined): string {
	if (!d) return '—';
	return new Date(d).toLocaleDateString('de-AT', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function scoreColor(score: number | null | undefined): string {
	if (score === null || score === undefined) return 'text-gray-400';
	if (score <= 3) return 'text-red-600';
	if (score <= 6) return 'text-yellow-600';
	return 'text-green-600';
}
