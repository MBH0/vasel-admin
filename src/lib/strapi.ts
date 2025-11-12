import { env } from '$env/dynamic/private';
import { Agent } from 'http';

const STRAPI_URL = env.STRAPI_URL || '';
const STRAPI_FULL_TOKEN = env.STRAPI_FULL_TOKEN || '';

// Configure HTTP agent to use IPv4 only (fixes Docker DNS issues)
const httpAgent = new Agent({
	family: 4, // Force IPv4
	keepAlive: true
});

// Retry helper function for handling temporary DNS/network errors
async function fetchWithRetry(
	url: string,
	options: RequestInit,
	maxRetries: number = 3,
	delayMs: number = 1000
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

			// Exponential backoff
			const delay = delayMs * Math.pow(2, attempt);
			console.log(
				`Strapi connection attempt ${attempt + 1} failed (${error?.cause?.code}), retrying in ${delay}ms...`
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

	async createServiceLocalization(id: number, serviceData: any, locale: string) {
		return this.request(`/services/${id}/localizations`, 'POST', {
			...serviceData,
			locale,
			publishedAt: new Date().toISOString()
		});
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

	async createBlogLocalization(id: number, blogData: any, locale: string) {
		return this.request(`/blogs/${id}/localizations`, 'POST', {
			...blogData,
			locale,
			publishedAt: new Date().toISOString()
		});
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
