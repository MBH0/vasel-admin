import { STRAPI_URL, STRAPI_FULL_TOKEN } from '$env/static/private';

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
			}
		};

		if (data && (method === 'POST' || method === 'PUT')) {
			options.body = JSON.stringify({ data });
		}

		const response = await fetch(url, options);

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
