import { env } from '$env/dynamic/private';
import { Agent } from 'http';
import { lookup } from 'dns';
import { promisify } from 'util';

const STRAPI_URL = env.STRAPI_URL || '';
const STRAPI_FULL_TOKEN = env.STRAPI_FULL_TOKEN || '';

const dnsLookup = promisify(lookup);

// Custom lookup function with better error handling
async function customLookup(hostname: string): Promise<string> {
	try {
		const result = await dnsLookup(hostname, { family: 4, all: false });
		return typeof result === 'object' && 'address' in result ? result.address : result as string;
	} catch (error: any) {
		console.error(`DNS lookup failed for ${hostname}:`, error?.code);
		throw error;
	}
}

// Configure HTTP agent to use IPv4 only (fixes Docker DNS issues)
const httpAgent = new Agent({
	family: 4, // Force IPv4
	keepAlive: true,
	lookup: (hostname, options, callback) => {
		customLookup(hostname)
			.then((address) => callback(null, address, 4))
			.catch((error) => callback(error, '', 4));
	}
});

// Retry helper function for handling temporary DNS/network errors
async function fetchWithRetry(
	url: string,
	options: RequestInit,
	maxRetries: number = 10,
	delayMs: number = 500
): Promise<Response> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fetch(url, options);
		} catch (error: any) {
			lastError = error;

			// Retry on DNS errors (EAI_AGAIN, ENOTFOUND) and network errors (ECONNREFUSED, ETIMEDOUT)
			const shouldRetry =
				error?.cause?.code === 'EAI_AGAIN' ||
				error?.cause?.code === 'ENOTFOUND' ||
				error?.cause?.code === 'ECONNREFUSED' ||
				error?.cause?.code === 'ETIMEDOUT';

			if (!shouldRetry || attempt === maxRetries) {
				throw error;
			}

			// Exponential backoff with jitter to avoid thundering herd
			const delay = delayMs * Math.pow(1.5, attempt) + Math.random() * 500;
			console.error(
				`[Strapi] Connection attempt ${attempt + 1}/${maxRetries + 1} failed`,
				`Error: ${error?.cause?.code || error?.code}`,
				`Message: ${error?.message}`,
				`Retrying in ${Math.round(delay)}ms...`
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

interface StrapiResponse<T> {
	data: T;
	meta?: {
		pagination?: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

class StrapiClient {
	private baseUrl: string;
	private token: string;

	constructor() {
		this.baseUrl = STRAPI_URL;
		this.token = STRAPI_FULL_TOKEN;
	}

	private async request<T>(
		endpoint: string,
		method: string = 'GET',
		data?: any
	): Promise<StrapiResponse<T>> {
		const url = `${this.baseUrl}/api${endpoint}`;

		// Log connection details for debugging
		console.log(`[Strapi] Attempting ${method} request to: ${url}`);
		if (!this.baseUrl) {
			throw new Error('STRAPI_URL environment variable is not configured');
		}

		const options: RequestInit = {
			method,
			headers: {
				'Authorization': `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			// @ts-ignore - Node.js specific agent option
			agent: this.baseUrl.startsWith('http://') ? httpAgent : undefined
		};

		if (data && (method === 'POST' || method === 'PUT')) {
			options.body = JSON.stringify({ data });
		}

		const response = await fetchWithRetry(url, options);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Strapi API error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	// Services
	async createService(serviceData: any, locale: string) {
		return this.request('/services', 'POST', {
			...serviceData,
			locale,
			publishedAt: new Date().toISOString()
		});
	}

	async createServiceLocalization(documentId: string, serviceData: any, locale: string) {
		// In Strapi v5, use PUT with ?locale=en to create a localization
		// This correctly creates a new locale entry for the SAME documentId
		console.log(`[Strapi] Creating service localization in locale ${locale} for documentId ${documentId}`);

		const url = `${this.baseUrl}/api/services/${documentId}?locale=${locale}`;
		const options: RequestInit = {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					...serviceData,
					publishedAt: new Date().toISOString()
				}
			}),
			// @ts-ignore - Node.js specific agent option
			agent: this.baseUrl.startsWith('http://') ? httpAgent : undefined
		};

		const response = await fetchWithRetry(url, options);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Strapi API error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	async getServices(locale?: string) {
		const query = locale ? `?locale=${locale}&populate=*` : '?populate=*';
		return this.request(`/services${query}`);
	}

	async updateService(id: number, serviceData: any) {
		return this.request(`/services/${id}`, 'PUT', serviceData);
	}

	async deleteService(id: number) {
		return this.request(`/services/${id}`, 'DELETE');
	}

	// Blogs
	async createBlog(blogData: any, locale: string) {
		return this.request('/blogs', 'POST', {
			...blogData,
			locale,
			publishedAt: new Date().toISOString()
		});
	}

	async createBlogLocalization(documentId: string, blogData: any, locale: string) {
		// In Strapi v5, use PUT with ?locale=en to create a localization
		// This correctly creates a new locale entry for the SAME documentId
		console.log(`[Strapi] Creating blog localization in locale ${locale} for documentId ${documentId}`);

		const url = `${this.baseUrl}/api/blogs/${documentId}?locale=${locale}`;
		const options: RequestInit = {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					...blogData,
					publishedAt: new Date().toISOString()
				}
			}),
			// @ts-ignore - Node.js specific agent option
			agent: this.baseUrl.startsWith('http://') ? httpAgent : undefined
		};

		const response = await fetchWithRetry(url, options);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Strapi API error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	async getBlogs(locale?: string) {
		const query = locale ? `?locale=${locale}&populate=*` : '?populate=*';
		return this.request(`/blogs${query}`);
	}

	async updateBlog(id: number, blogData: any) {
		return this.request(`/blogs/${id}`, 'PUT', blogData);
	}

	async deleteBlog(id: number) {
		return this.request(`/blogs/${id}`, 'DELETE');
	}
}

export const strapiClient = new StrapiClient();
