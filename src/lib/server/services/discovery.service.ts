import { env } from '$env/dynamic/private';
import type { NewLead } from '../db/schema';
import { leadService } from './lead.service';

interface GooglePlaceResult {
	name: string;
	formatted_address?: string;
	formatted_phone_number?: string;
	website?: string;
	types?: string[];
	geometry?: {
		location: { lat: number; lng: number };
	};
	rating?: number;
	business_status?: string;
}

interface DiscoveryResult {
	leads: NewLead[];
	errors: string[];
	source: string;
}

export const discoveryService = {
	/**
	 * Search Google Places for businesses in a given area
	 */
	async searchGooglePlaces(
		query: string,
		location: string = 'Wien, Austria'
	): Promise<DiscoveryResult> {
		const apiKey = env.GOOGLE_PLACES_API_KEY;
		if (!apiKey) {
			return { leads: [], errors: ['Google Places API key not configured'], source: 'google_places' };
		}

		const errors: string[] = [];
		const leads: NewLead[] = [];

		try {
			// Text search
			const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
			searchUrl.searchParams.set('query', `${query} in ${location}`);
			searchUrl.searchParams.set('key', apiKey);
			searchUrl.searchParams.set('language', 'de');

			const response = await fetch(searchUrl.toString());
			const data = await response.json();

			if (data.status !== 'OK') {
				errors.push(`Google Places API error: ${data.status}`);
				return { leads, errors, source: 'google_places' };
			}

			// Process each result
			for (const place of data.results ?? []) {
				try {
					// Get place details for website & phone
					const details = await this.getPlaceDetails(place.place_id, apiKey);

					const lead: NewLead = {
						businessName: place.name,
						websiteUrl: details?.website ?? null,
						phone: details?.formatted_phone_number ?? null,
						address: place.formatted_address ?? null,
						city: this.extractCity(place.formatted_address),
						businessType: this.mapPlaceTypes(place.types),
						source: 'google_places',
						status: 'new',
						metadata: {
							placeId: place.place_id,
							rating: place.rating,
							location: place.geometry?.location
						}
					};

					// Calculate website score
					if (details?.website) {
						lead.websiteScore = await this.assessWebsite(details.website);
					} else {
						lead.websiteScore = 0; // No website = score 0
					}

					leads.push(lead);
				} catch (err) {
					errors.push(`Error processing ${place.name}: ${err}`);
				}
			}
		} catch (err) {
			errors.push(`Google Places search failed: ${err}`);
		}

		return { leads, errors, source: 'google_places' };
	},

	async getPlaceDetails(placeId: string, apiKey: string): Promise<GooglePlaceResult | null> {
		try {
			const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
			url.searchParams.set('place_id', placeId);
			url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,website,types,geometry');
			url.searchParams.set('key', apiKey);

			const response = await fetch(url.toString());
			const data = await response.json();

			return data.result ?? null;
		} catch {
			return null;
		}
	},

	/**
	 * Basic website quality assessment
	 * Returns score 1-10 (10 = excellent modern site, 1 = terrible)
	 */
	async assessWebsite(url: string): Promise<number> {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 10000);

			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; LeadCRM/1.0)'
				}
			});
			clearTimeout(timeout);

			if (!response.ok) return 2;

			const html = await response.text();
			let score = 5; // Start neutral

			// Check for viewport meta (responsive)
			if (html.includes('viewport')) score += 1;
			else score -= 2;

			// Check for HTTPS
			if (url.startsWith('https')) score += 1;

			// Check for modern frameworks
			const modernSignals = ['react', 'vue', 'svelte', 'next', 'nuxt', 'tailwind', 'bootstrap'];
			if (modernSignals.some((s) => html.toLowerCase().includes(s))) score += 1;

			// Check for old-school signals
			const oldSignals = ['<table', '<font', '<marquee', '<center', 'dreamweaver'];
			const oldCount = oldSignals.filter((s) => html.toLowerCase().includes(s)).length;
			score -= oldCount;

			// Check page size (very small = basic, very large = bloated)
			const sizeKb = html.length / 1024;
			if (sizeKb < 5) score -= 1; // Tiny page
			if (sizeKb > 500) score -= 1; // Bloated

			// Check for SSL errors already handled by response

			return Math.min(10, Math.max(1, Math.round(score)));
		} catch {
			return 1; // Can't reach = bad
		}
	},

	/**
	 * Run a discovery batch: search for businesses and create leads
	 */
	async runDiscovery(queries: string[], location: string = 'Wien, Austria') {
		const results: DiscoveryResult[] = [];
		let totalCreated = 0;

		for (const query of queries) {
			const result = await this.searchGooglePlaces(query, location);
			results.push(result);

			// Create leads that don't already exist
			for (const lead of result.leads) {
				try {
					// Add calculated lead score
					const leadScore = leadService.calculateScore(lead);
					await leadService.createLead({
						...lead,
						metadata: { ...(lead.metadata as Record<string, unknown>), leadScore }
					});
					totalCreated++;
				} catch (err) {
					result.errors.push(`Failed to create lead ${lead.businessName}: ${err}`);
				}
			}

			// Rate limit: wait between queries
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}

		return {
			totalFound: results.reduce((sum, r) => sum + r.leads.length, 0),
			totalCreated,
			errors: results.flatMap((r) => r.errors),
			results
		};
	},

	extractCity(address: string | undefined): string | undefined {
		if (!address) return undefined;
		// Austrian address format: "Street Nr, PLZ City, Austria"
		const parts = address.split(',').map((p) => p.trim());
		if (parts.length >= 2) {
			const cityPart = parts[parts.length - 2]; // Second to last
			// Remove postal code
			return cityPart.replace(/^\d{4,5}\s*/, '').trim() || undefined;
		}
		return undefined;
	},

	mapPlaceTypes(types: string[] | undefined): string {
		if (!types || types.length === 0) return 'other';
		const typeMap: Record<string, string> = {
			restaurant: 'Gastronomie',
			cafe: 'Gastronomie',
			bar: 'Gastronomie',
			store: 'Einzelhandel',
			doctor: 'Arzt/Gesundheit',
			dentist: 'Arzt/Gesundheit',
			lawyer: 'Rechtsanwalt',
			accounting: 'Steuerberater',
			real_estate_agency: 'Immobilien',
			hair_care: 'Dienstleistung',
			beauty_salon: 'Dienstleistung',
			gym: 'Fitness/Sport',
			lodging: 'Hotel/Unterkunft',
			car_repair: 'Handwerk/KFZ',
			plumber: 'Handwerk',
			electrician: 'Handwerk',
			painter: 'Handwerk'
		};

		for (const type of types) {
			if (typeMap[type]) return typeMap[type];
		}
		return types[0] ?? 'other';
	}
};
