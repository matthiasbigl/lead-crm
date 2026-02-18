import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Skip API routes — they use API_KEY authentication
	if (event.url.pathname.startsWith('/api/')) {
		return resolve(event);
	}

	const user = env.BASIC_AUTH_USER;
	const pass = env.BASIC_AUTH_PASSWORD;

	// If env vars not set, allow through (dev mode)
	if (!user || !pass) {
		return resolve(event);
	}

	const auth = event.request.headers.get('Authorization');

	if (auth) {
		const [scheme, encoded] = auth.split(' ');
		if (scheme === 'Basic' && encoded) {
			const decoded = atob(encoded);
			const [providedUser, ...passParts] = decoded.split(':');
			const providedPass = passParts.join(':');

			if (providedUser === user && providedPass === pass) {
				return resolve(event);
			}
		}
	}

	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="Lead CRM"'
		}
	});
};
