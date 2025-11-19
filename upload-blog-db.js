import 'dotenv/config';
import { readFileSync } from 'fs';

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

if (!STRAPI_TOKEN) {
	console.error('❌ STRAPI_FULL_TOKEN not found in environment variables');
	process.exit(1);
}

console.log(`🔗 Connecting to Strapi at: ${STRAPI_URL}`);

async function uploadBlog() {
	try {
		// Read the blog JSON
		const blogData = JSON.parse(readFileSync('./upload-blog.json', 'utf-8'));

		const { es, en } = blogData;

		if (!es || !en) {
			throw new Error('Both Spanish and English versions are required');
		}

		console.log('\n📝 Creating Spanish blog (base)...');

		// Create Spanish version (base document)
		const esResponse = await fetch(`${STRAPI_URL}/api/blogs`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					...es,
					locale: 'es',
					publishedAt: new Date().toISOString()
				}
			})
		});

		if (!esResponse.ok) {
			const error = await esResponse.text();
			throw new Error(`Failed to create Spanish blog: ${esResponse.status} - ${error}`);
		}

		const esResult = await esResponse.json();
		console.log('✅ Spanish blog created:', esResult.data.title);

		const documentId = esResult.data?.documentId;
		if (!documentId) {
			throw new Error('Could not get documentId from Spanish blog');
		}

		console.log(`📎 Document ID: ${documentId}`);

		// Wait a bit for Strapi to process
		await new Promise(resolve => setTimeout(resolve, 1000));

		console.log('\n📝 Creating English localization (same document)...');

		// Create English localization using PUT with ?locale=en
		// This ensures both versions share the same documentId
		const enResponse = await fetch(`${STRAPI_URL}/api/blogs/${documentId}?locale=en`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					...en,
					publishedAt: new Date().toISOString()
				}
			})
		});

		if (!enResponse.ok) {
			const error = await enResponse.text();
			throw new Error(`Failed to create English localization: ${enResponse.status} - ${error}`);
		}

		const enResult = await enResponse.json();
		console.log('✅ English localization created:', enResult.data.title);
		console.log(`📎 Shared Document ID: ${enResult.data.documentId}`);

		console.log('\n✨ Blog uploaded successfully!');
		console.log(`   Both ES and EN versions share documentId: ${documentId}`);

	} catch (error) {
		console.error('\n❌ Error:', error.message);
		process.exit(1);
	}
}

uploadBlog();
