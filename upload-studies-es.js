import 'dotenv/config';
import { readFileSync } from 'fs';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;
const EN_DOC_ID = 'ssooqubswt8l91jum0heam8i'; // English version already exists

async function uploadStudiesES() {
  const esData = JSON.parse(readFileSync('./upload-studies-es.json', 'utf-8'));

  console.log('📝 Creating Spanish version of Studies service...\n');

  const res = await fetch(`${STRAPI_URL}/api/services?locale=es`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        ...esData,
        publishedAt: new Date().toISOString()
      }
    })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed: ${res.status} - ${error}`);
  }

  const result = await res.json();
  const esDocId = result.data.documentId;

  console.log('✅ Spanish service created:', result.data.name);
  console.log(`📎 Spanish Document ID: ${esDocId}\n`);

  // Link both directions
  console.log('🔗 Linking ES -> EN...');
  const linkES = await fetch(`${STRAPI_URL}/api/services/${esDocId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        localizations: {
          connect: [{ documentId: EN_DOC_ID }]
        }
      }
    })
  });

  console.log(linkES.ok ? '✅ Linked ES -> EN' : '⚠️  Could not link ES -> EN');

  console.log('\n✨ Done!');
}

uploadStudiesES();
