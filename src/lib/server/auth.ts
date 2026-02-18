import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export function requireApiKey(request: Request): void {
	const apiKey = request.headers.get('x-api-key');
	const expectedKey = env.API_KEY;

	if (!expectedKey) {
		console.warn('API_KEY not configured — all requests allowed');
		return;
	}

	if (!apiKey || apiKey !== expectedKey) {
		error(401, 'Unauthorized: Invalid or missing API key');
	}
}

export function getApiKey(): string | undefined {
	return env.API_KEY;
}
