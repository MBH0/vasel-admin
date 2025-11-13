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

		// Create Spanish version
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

		// Wait a bit
		await new Promise(resolve => setTimeout(resolve, 1000));

		console.log('\n📝 Creating English localization...');

		// Create English version
		const enResponse = await fetch(`${STRAPI_URL}/api/services?locale=en`, {
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

		if (!enResponse.ok) {
			const error = await enResponse.text();
			throw new Error(`Failed to create English service: ${enResponse.status} - ${error}`);
		}

		const enResult = await enResponse.json();
		console.log('✅ English service created:', enResult.data.name);

		const enDocumentId = enResult.data?.documentId;
		if (!enDocumentId) {
			console.warn('⚠️  Could not get documentId from English service');
		} else {
			// Link the localizations
			console.log('\n🔗 Linking localizations...');

			const linkResponse = await fetch(`${STRAPI_URL}/api/services/${enDocumentId}`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${STRAPI_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					data: {
						localizations: {
							connect: [{ documentId }]
						}
					}
				})
			});

			if (linkResponse.ok) {
				console.log('✅ Localizations linked successfully');
			} else {
				console.warn('⚠️  Could not link localizations');
			}
		}

		console.log('\n✨ Service uploaded successfully!');
		console.log(`   Spanish: ${es.name} (${documentId})`);
		console.log(`   English: ${en.name} (${enDocumentId})`);

	} catch (error) {
		console.error('\n❌ Error:', error.message);
		process.exit(1);
	}
}

uploadService();
