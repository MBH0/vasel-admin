import 'dotenv/config';
import { readFileSync } from 'fs';

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

if (!STRAPI_TOKEN) {
	console.error('❌ STRAPI_FULL_TOKEN not found in environment variables');
	process.exit(1);
}

console.log(`🔗 Connecting to Strapi at: ${STRAPI_URL}`);

async function uploadService() {
	try {
		// Read the service JSON
		const serviceData = JSON.parse(readFileSync('./upload-service.json', 'utf-8'));

		const { es, en } = serviceData;

		if (!es || !en) {
			throw new Error('Both Spanish and English versions are required');
		}

		console.log('\n📝 Creating Spanish service...');

		// Step 1: Create Spanish version first
		const esResponse = await fetch(`${STRAPI_URL}/api/services?locale=es`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${STRAPI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: {
					...es,
					publishedAt: new Date().toISOString()
				}
			})
		});

		if (!esResponse.ok) {
			const error = await esResponse.text();
			throw new Error(`Failed to create Spanish service: ${esResponse.status} - ${error}`);
		}

		const esResult = await esResponse.json();
		console.log('✅ Spanish service created:', esResult.data.name);

		const documentId = esResult.data?.documentId;
		if (!documentId) {
			throw new Error('Could not get documentId from Spanish service');
		}

		console.log(`📎 Document ID: ${documentId}`);

		// Wait a bit to ensure Spanish version is fully created
		await new Promise(resolve => setTimeout(resolve, 1500));

		console.log('\n📝 Creating English localization with shared documentId...');

		// Step 2: Create English version directly through database update
		// First create the EN service
		const enCreateResponse = await fetch(`${STRAPI_URL}/api/services?locale=en`, {
			method: 'POST',
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

		if (!enCreateResponse.ok) {
			const error = await enCreateResponse.text();
			throw new Error(`Failed to create English service: ${enCreateResponse.status} - ${error}`);
		}

		const enResult = await enCreateResponse.json();
		const enServiceId = enResult.data?.id;
		const enDocumentId = enResult.data?.documentId;

		console.log('✅ English service created:', enResult.data.name);
		console.log(`📎 English documentId (will be updated): ${enDocumentId}`);

		// Step 3: Update the English service to use the same documentId as Spanish
		// This requires direct database access or a custom endpoint
		console.log('\n🔄 Updating English service to share documentId with Spanish...');
		console.log('⚠️  NOTE: This requires manual linking via Strapi Admin or database script');
		console.log('⚠️  Run the database script: node fix-service-localizations-pg.js');
		console.log('⚠️  Or manually link in Strapi Admin');

		console.log('\n✨ Services created!');
		console.log(`   Spanish: ${es.name} (${documentId})`);
		console.log(`   English: ${en.name} (${enDocumentId})`);
		console.log(`\n   ⚠️  IMPORTANT: Link these services using the database script or Strapi Admin`);

	} catch (error) {
		console.error('\n❌ Error:', error.message);
		process.exit(1);
	}
}

uploadService();
