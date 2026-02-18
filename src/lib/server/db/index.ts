import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
	if (_db) return _db;

	const connectionString = env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	const client = postgres(connectionString);
	_db = drizzle(client, { schema });
	return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
	get(_target, prop, receiver) {
		const realDb = getDb();
		const value = Reflect.get(realDb, prop, receiver);
		if (typeof value === 'function') {
			return value.bind(realDb);
		}
		return value;
	}
});

export type Database = typeof db;
