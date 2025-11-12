import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

if (!STRAPI_TOKEN) {
	console.error('❌ STRAPI_FULL_TOKEN not found in environment variables');
	process.exit(1);
}

console.log(`🔗 Connecting to Strapi at: ${STRAPI_URL}`);

async function fetchStrapi(endpoint, options = {}) {
	const url = `${STRAPI_URL}/api${endpoint}`;
	const response = await fetch(url, {
		...options,
		headers: {
			'Authorization': `Bearer ${STRAPI_TOKEN}`,
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Strapi API error: ${response.status} - ${error}`);
	}

	return response.json();
}

async function getAllServices() {
	console.log('\n📋 Fetching all services (all locales)...');

	// Get services in both locales
	const esServices = await fetchStrapi('/services?locale=es&pagination[pageSize]=100');
	const enServices = await fetchStrapi('/services?locale=en&pagination[pageSize]=100');

	// Combine and deduplicate by documentId
	const allServices = [...esServices.data, ...enServices.data];
	const uniqueServices = Array.from(
		new Map(allServices.map(s => [s.documentId, s])).values()
	);

	console.log(`   Found ${uniqueServices.length} unique services`);
	return uniqueServices;
}

async function getAllBlogs() {
	console.log('\n📝 Fetching all blogs (all locales)...');

	// Get blogs in both locales
	const esBlogs = await fetchStrapi('/blogs?locale=es&pagination[pageSize]=100');
	const enBlogs = await fetchStrapi('/blogs?locale=en&pagination[pageSize]=100');

	// Combine and deduplicate by documentId
	const allBlogs = [...esBlogs.data, ...enBlogs.data];
	const uniqueBlogs = Array.from(
		new Map(allBlogs.map(b => [b.documentId, b])).values()
	);

	console.log(`   Found ${uniqueBlogs.length} unique blogs`);
	return uniqueBlogs;
}

async function deleteService(documentId, name) {
	try {
		await fetchStrapi(`/services/${documentId}`, { method: 'DELETE' });
		console.log(`   ✅ Deleted service: ${name} (${documentId})`);
		return true;
	} catch (error) {
		console.error(`   ❌ Failed to delete service ${name}: ${error.message}`);
		return false;
	}
}

async function deleteBlog(documentId, title) {
	try {
		await fetchStrapi(`/blogs/${documentId}`, { method: 'DELETE' });
		console.log(`   ✅ Deleted blog: ${title} (${documentId})`);
		return true;
	} catch (error) {
		console.error(`   ❌ Failed to delete blog ${title}: ${error.message}`);
		return false;
	}
}

async function purgeAll() {
	console.log('\n🗑️  Starting Strapi purge...\n');

	let deletedCount = 0;
	let failedCount = 0;

	// Delete all services
	console.log('🔧 Deleting services...');
	const services = await getAllServices();
	for (const service of services) {
		const success = await deleteService(service.documentId, service.name);
		if (success) deletedCount++;
		else failedCount++;
		// Small delay to avoid overwhelming the API
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	// Delete all blogs
	console.log('\n📰 Deleting blogs...');
	const blogs = await getAllBlogs();
	for (const blog of blogs) {
		const success = await deleteBlog(blog.documentId, blog.title);
		if (success) deletedCount++;
		else failedCount++;
		// Small delay to avoid overwhelming the API
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	console.log('\n✨ Purge complete!');
	console.log(`   ✅ Successfully deleted: ${deletedCount}`);
	if (failedCount > 0) {
		console.log(`   ❌ Failed to delete: ${failedCount}`);
	}
}

// Run the purge
purgeAll().catch(error => {
	console.error('\n❌ Fatal error:', error.message);
	process.exit(1);
});
